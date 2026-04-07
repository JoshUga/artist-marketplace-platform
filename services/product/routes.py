"""Product service API routes."""
from html import escape
from typing import Any
import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Query, Header, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError
from shared.config import get_settings
from shared.security import get_current_user, require_role, decode_token
from shared.schemas import APIResponse, PaginatedResponse
from services.product.models import (
    Product,
    Category,
    ProductStatus,
    ProductLike,
    ProductReview,
    ProductPayment,
    MerchantPayment,
    PaymentStatus,
)
from services.product.schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    CategoryCreate,
    CategoryResponse,
    ProductReviewCreate,
    ProductReviewResponse,
    ProductCheckoutCreate,
    MerchantDomainPaymentCreate,
)

router = APIRouter(tags=["Products"])


async def get_db():
    """Database session dependency - overridden at app startup."""
    raise NotImplementedError("Database session not configured")


def _get_optional_user_from_auth_header(authorization: str | None) -> dict | None:
    if not authorization:
        return None
    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    try:
        payload = decode_token(parts[1])
    except HTTPException:
        return None
    if payload.get("type") != "access":
        return None
    return payload


def _extract_checkout_url(data: Any) -> str | None:
    if isinstance(data, dict):
        for key in ("checkout_url", "payment_url", "redirect_url", "url"):
            value = data.get(key)
            if isinstance(value, str) and value.strip():
                return value
        for value in data.values():
            found = _extract_checkout_url(value)
            if found:
                return found
    elif isinstance(data, list):
        for item in data:
            found = _extract_checkout_url(item)
            if found:
                return found
    return None


async def _request_payram_checkout(payload: dict[str, Any]) -> dict[str, Any]:
    settings = get_settings()
    checkout_url = f"{settings.PAYRAM_BASE_URL.rstrip('/')}/{settings.PAYRAM_CHECKOUT_PATH.lstrip('/')}"
    headers = {"Content-Type": "application/json"}
    if settings.PAYRAM_API_KEY:
        headers["Authorization"] = f"Bearer {settings.PAYRAM_API_KEY}"

    try:
        async with httpx.AsyncClient(timeout=settings.PAYRAM_TIMEOUT_SECONDS) as client:
            response = await client.post(checkout_url, json=payload, headers=headers)
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Payram service is unavailable",
        ) from exc

    try:
        body = response.json()
    except ValueError:
        body = {"raw": response.text}

    if response.status_code >= 400:
        detail = "Payram checkout request failed"
        if isinstance(body, dict):
            detail = str(body.get("message") or body.get("detail") or detail)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail)

    if not isinstance(body, dict):
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Invalid Payram response")
    return body


# Product routes
@router.post("/products", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    product = Product(
        artist_id=current_user["sub"],
        **product_data.model_dump(),
    )
    db.add(product)
    await db.flush()
    await db.refresh(product)

    return APIResponse(
        success=True,
        message="Product created",
        data=ProductResponse.model_validate(product).model_dump(),
    )


@router.get("/products", response_model=PaginatedResponse)
async def list_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category: str = Query(None),
    sort_by: str = Query("created_at", pattern="^(created_at|price|title)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    min_price: float = Query(None, ge=0),
    max_price: float = Query(None, ge=0),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * per_page
    query = select(Product).where(Product.status == ProductStatus.PUBLISHED)

    if category:
        query = query.where(Product.category_id == category)
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    # Sort
    sort_col = getattr(Product, sort_by)
    if sort_order == "desc":
        sort_col = sort_col.desc()
    query = query.order_by(sort_col).offset(offset).limit(per_page)

    result = await db.execute(query)
    products = result.scalars().all()

    return PaginatedResponse(
        data=[ProductResponse.model_validate(p).model_dump() for p in products],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=(total + per_page - 1) // per_page if total > 0 else 0,
    )


@router.get("/products/me/analytics", response_model=APIResponse)
async def get_my_product_analytics(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    artist_id = current_user["sub"]

    totals_result = await db.execute(
        select(
            func.count(Product.id),
            func.coalesce(func.sum(Product.view_count), 0),
            func.coalesce(func.sum(Product.likes_count), 0),
            func.coalesce(func.sum(Product.review_count), 0),
        ).where(Product.artist_id == artist_id)
    )
    product_count, total_views, total_likes, total_comments = totals_result.one()

    top_result = await db.execute(
        select(Product)
        .where(Product.artist_id == artist_id)
        .order_by(
            Product.view_count.desc(),
            Product.likes_count.desc(),
            Product.review_count.desc(),
            Product.created_at.desc(),
        )
        .limit(5)
    )
    top_products = top_result.scalars().all()

    return APIResponse(
        success=True,
        data={
            "product_count": int(product_count or 0),
            "total_views": int(total_views or 0),
            "total_likes": int(total_likes or 0),
            "total_comments": int(total_comments or 0),
            "top_products": [
                {
                    "id": product.id,
                    "title": product.title,
                    "view_count": product.view_count,
                    "likes_count": product.likes_count,
                    "review_count": product.review_count,
                    "status": product.status.value,
                }
                for product in top_products
            ],
        },
    )


@router.get("/products/{product_id}", response_model=APIResponse)
async def get_product(product_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    # Increment view count
    product.view_count += 1
    await db.flush()

    return APIResponse(
        success=True,
        data=ProductResponse.model_validate(product).model_dump(),
    )


@router.get("/products/{product_id}/engagement", response_model=APIResponse)
async def get_product_engagement(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    authorization: str | None = Header(default=None),
):
    product_result = await db.execute(select(Product).where(Product.id == product_id))
    product = product_result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    optional_user = _get_optional_user_from_auth_header(authorization)
    liked_by_current_user = False
    if optional_user:
        like_result = await db.execute(
            select(ProductLike).where(
                ProductLike.product_id == product_id,
                ProductLike.user_id == optional_user["sub"],
            )
        )
        liked_by_current_user = like_result.scalar_one_or_none() is not None

    reviews_result = await db.execute(
        select(ProductReview)
        .where(ProductReview.product_id == product_id)
        .order_by(ProductReview.created_at.desc())
        .limit(100)
    )
    reviews = reviews_result.scalars().all()
    average_rating = 0.0
    if reviews:
        average_rating = round(sum(r.rating for r in reviews) / len(reviews), 2)

    return APIResponse(
        success=True,
        data={
            "likes_count": product.likes_count,
            "review_count": product.review_count,
            "average_rating": average_rating,
            "liked_by_current_user": liked_by_current_user,
            "reviews": [ProductReviewResponse.model_validate(r).model_dump() for r in reviews],
        },
    )


@router.post("/products/{product_id}/likes", response_model=APIResponse)
async def like_product(
    product_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    product_result = await db.execute(select(Product).where(Product.id == product_id))
    product = product_result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    like = ProductLike(product_id=product_id, user_id=current_user["sub"])
    db.add(like)

    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        # Product is already liked by this user.
        existing_result = await db.execute(select(Product).where(Product.id == product_id))
        existing_product = existing_result.scalar_one_or_none()
        if not existing_product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        return APIResponse(
            success=True,
            message="Product already liked",
            data={"liked": True, "likes_count": existing_product.likes_count},
        )

    product.likes_count += 1
    await db.flush()

    return APIResponse(
        success=True,
        message="Product liked",
        data={"liked": True, "likes_count": product.likes_count},
    )


@router.delete("/products/{product_id}/likes", response_model=APIResponse)
async def unlike_product(
    product_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    product_result = await db.execute(select(Product).where(Product.id == product_id))
    product = product_result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    like_result = await db.execute(
        select(ProductLike).where(
            ProductLike.product_id == product_id,
            ProductLike.user_id == current_user["sub"],
        )
    )
    like = like_result.scalar_one_or_none()
    if not like:
        return APIResponse(
            success=True,
            message="Product was not liked",
            data={"liked": False, "likes_count": product.likes_count},
        )

    await db.delete(like)
    if product.likes_count > 0:
        product.likes_count -= 1
    await db.flush()

    return APIResponse(
        success=True,
        message="Product unliked",
        data={"liked": False, "likes_count": product.likes_count},
    )


@router.post("/products/{product_id}/reviews", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_product_review(
    product_id: str,
    review_data: ProductReviewCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    product_result = await db.execute(select(Product).where(Product.id == product_id))
    product = product_result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    user_name = current_user.get("full_name") or current_user.get("email") or "Collector"
    review = ProductReview(
        product_id=product_id,
        user_id=current_user["sub"],
        user_name=user_name,
        rating=review_data.rating,
        comment=review_data.comment,
    )
    db.add(review)
    product.review_count += 1
    await db.flush()
    await db.refresh(review)

    return APIResponse(
        success=True,
        message="Review added",
        data=ProductReviewResponse.model_validate(review).model_dump(),
    )


@router.post("/products/{product_id}/payments/checkout", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_product_checkout(
    product_id: str,
    checkout_data: ProductCheckoutCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if checkout_data.quantity > product.quantity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Requested quantity is not available")

    amount = round(product.price * checkout_data.quantity, 2)
    settings = get_settings()
    payment = ProductPayment(
        product_id=product.id,
        buyer_id=current_user["sub"],
        merchant_id=product.artist_id,
        quantity=checkout_data.quantity,
        amount=amount,
        currency=product.currency,
        status=PaymentStatus.PENDING,
    )
    db.add(payment)
    await db.flush()

    payload = {
        "reference": payment.id,
        "amount": amount,
        "currency": product.currency,
        "description": f"Purchase of {product.title}",
        "return_url": checkout_data.success_url or settings.PAYRAM_DEFAULT_SUCCESS_URL,
        "cancel_url": checkout_data.cancel_url or settings.PAYRAM_DEFAULT_CANCEL_URL,
        "metadata": {
            "payment_type": "artwork_purchase",
            "product_id": product.id,
            "buyer_id": current_user["sub"],
            "merchant_id": product.artist_id,
            "quantity": checkout_data.quantity,
        },
    }

    provider_response = await _request_payram_checkout(payload)
    payment.provider_payment_id = str(
        provider_response.get("payment_id")
        or provider_response.get("id")
        or provider_response.get("transaction_id")
        or ""
    ) or None
    payment.provider_checkout_url = _extract_checkout_url(provider_response)
    await db.flush()

    return APIResponse(
        success=True,
        message="Checkout created",
        data={
            "payment_id": payment.id,
            "provider": payment.provider,
            "provider_payment_id": payment.provider_payment_id,
            "checkout_url": payment.provider_checkout_url,
            "status": payment.status.value,
            "amount": payment.amount,
            "currency": payment.currency,
            "provider_response": provider_response,
        },
    )


@router.post("/products/merchant/payments/domain/checkout", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_merchant_domain_checkout(
    payment_data: MerchantDomainPaymentCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    settings = get_settings()
    payment = MerchantPayment(
        merchant_id=current_user["sub"],
        service_name=payment_data.domain_name,
        amount=payment_data.amount,
        currency=payment_data.currency.upper(),
        status=PaymentStatus.PENDING,
        purpose="domain_name",
    )
    db.add(payment)
    await db.flush()

    payload = {
        "reference": payment.id,
        "amount": payment.amount,
        "currency": payment.currency,
        "description": f"Merchant domain payment for {payment_data.domain_name}",
        "return_url": payment_data.success_url or settings.PAYRAM_DEFAULT_SUCCESS_URL,
        "cancel_url": payment_data.cancel_url or settings.PAYRAM_DEFAULT_CANCEL_URL,
        "metadata": {
            "payment_type": "merchant_domain",
            "domain_name": payment_data.domain_name,
            "merchant_id": current_user["sub"],
        },
    }

    provider_response = await _request_payram_checkout(payload)
    payment.provider_payment_id = str(
        provider_response.get("payment_id")
        or provider_response.get("id")
        or provider_response.get("transaction_id")
        or ""
    ) or None
    payment.provider_checkout_url = _extract_checkout_url(provider_response)
    await db.flush()

    return APIResponse(
        success=True,
        message="Merchant domain payment checkout created",
        data={
            "payment_id": payment.id,
            "provider": payment.provider,
            "provider_payment_id": payment.provider_payment_id,
            "checkout_url": payment.provider_checkout_url,
            "status": payment.status.value,
            "amount": payment.amount,
            "currency": payment.currency,
            "provider_response": provider_response,
        },
    )


@router.get("/products/{product_id}/share", response_model=APIResponse)
async def get_product_share_metadata(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    base_url: str = Query("https://eliteart.studio"),
):
    product_result = await db.execute(select(Product).where(Product.id == product_id))
    product = product_result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    canonical_url = f"{base_url.rstrip('/')}/products/{product.id}"
    description = product.description or f"Explore {product.title} on EliteArt Studio."
    og_image = product.image_url or "https://placehold.co/1200x630/181722/ececf2?text=EliteArt+Studio"

    return APIResponse(
        success=True,
        data={
            "title": product.title,
            "description": description[:300],
            "canonical_url": canonical_url,
            "image_url": og_image,
        },
    )


@router.get("/products/{product_id}/share/page", response_class=HTMLResponse)
async def get_product_share_page(
    product_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    product_result = await db.execute(select(Product).where(Product.id == product_id))
    product = product_result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    scheme = request.headers.get("x-forwarded-proto") or request.url.scheme or "https"
    host = request.headers.get("x-forwarded-host") or request.headers.get("host") or "localhost"
    origin = f"{scheme}://{host}".rstrip("/")
    canonical_url = f"{origin}/products/{product.id}"
    share_url = f"{origin}/share/products/{product.id}"

    title = product.title.strip() or "Artwork"
    description = (product.description or f"Explore {title} on EliteArt Studio.").strip()[:300]
    image_url = product.image_url or "https://placehold.co/1200x630/181722/ececf2?text=EliteArt+Studio"

    html = f"""<!DOCTYPE html>
<html lang=\"en\"> 
<head>
  <meta charset=\"utf-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
  <title>{escape(title)} | EliteArt Studio</title>
  <meta name=\"description\" content=\"{escape(description)}\">
  <link rel=\"canonical\" href=\"{escape(canonical_url)}\">
  <meta property=\"og:type\" content=\"website\">
  <meta property=\"og:site_name\" content=\"EliteArt Studio\">
  <meta property=\"og:title\" content=\"{escape(title)}\">
  <meta property=\"og:description\" content=\"{escape(description)}\">
  <meta property=\"og:image\" content=\"{escape(image_url)}\">
  <meta property=\"og:url\" content=\"{escape(share_url)}\">
  <meta name=\"twitter:card\" content=\"summary_large_image\">
  <meta name=\"twitter:title\" content=\"{escape(title)}\">
  <meta name=\"twitter:description\" content=\"{escape(description)}\">
  <meta name=\"twitter:image\" content=\"{escape(image_url)}\">
  <meta http-equiv=\"refresh\" content=\"0; url={escape(canonical_url)}\">
</head>
<body>
  <p>Redirecting to <a href=\"{escape(canonical_url)}\">{escape(canonical_url)}</a>...</p>
  <script>window.location.replace({canonical_url!r});</script>
</body>
</html>
"""
    return HTMLResponse(content=html)


@router.put("/products/{product_id}", response_model=APIResponse)
async def update_product(
    product_id: str,
    update_data: ProductUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if product.artist_id != current_user["sub"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    for key, value in update_data.model_dump(exclude_unset=True).items():
        if key == "status":
            value = ProductStatus(value)
        setattr(product, key, value)

    await db.flush()
    await db.refresh(product)

    return APIResponse(
        success=True,
        message="Product updated",
        data=ProductResponse.model_validate(product).model_dump(),
    )


@router.delete("/products/{product_id}", response_model=APIResponse)
async def delete_product(
    product_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if product.artist_id != current_user["sub"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    # Soft delete
    product.status = ProductStatus.ARCHIVED
    await db.flush()

    return APIResponse(success=True, message="Product deleted")


# Category routes
@router.get("/categories", response_model=APIResponse)
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).order_by(Category.name))
    categories = result.scalars().all()
    return APIResponse(
        success=True,
        data=[CategoryResponse.model_validate(c).model_dump() for c in categories],
    )


@router.post("/categories", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    category = Category(**category_data.model_dump())
    db.add(category)
    await db.flush()
    await db.refresh(category)

    return APIResponse(
        success=True,
        message="Category created",
        data=CategoryResponse.model_validate(category).model_dump(),
    )


@router.delete("/categories/{category_id}", response_model=APIResponse)
async def delete_category(
    category_id: str,
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    await db.delete(category)
    return APIResponse(success=True, message="Category deleted")
