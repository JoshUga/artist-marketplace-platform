"""Product service API routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError
from shared.security import get_current_user, require_role, decode_token
from shared.schemas import APIResponse, PaginatedResponse
from services.product.models import Product, Category, ProductStatus, ProductLike, ProductReview
from services.product.schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    CategoryCreate,
    CategoryResponse,
    ProductReviewCreate,
    ProductReviewResponse,
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
