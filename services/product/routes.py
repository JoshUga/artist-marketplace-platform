"""Product service API routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from shared.security import get_current_user, require_role
from shared.schemas import APIResponse, PaginatedResponse
from services.product.models import Product, Category, ProductStatus
from services.product.schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    CategoryCreate,
    CategoryResponse,
)

router = APIRouter(tags=["Products"])


def get_session_dependency():
    pass


# Product routes
@router.post("/products", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session_dependency),
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
    sort_by: str = Query("created_at", regex="^(created_at|price|title)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    min_price: float = Query(None, ge=0),
    max_price: float = Query(None, ge=0),
    db: AsyncSession = Depends(get_session_dependency),
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
async def get_product(product_id: str, db: AsyncSession = Depends(get_session_dependency)):
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


@router.put("/products/{product_id}", response_model=APIResponse)
async def update_product(
    product_id: str,
    update_data: ProductUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session_dependency),
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
    db: AsyncSession = Depends(get_session_dependency),
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
async def list_categories(db: AsyncSession = Depends(get_session_dependency)):
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
    db: AsyncSession = Depends(get_session_dependency),
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
    db: AsyncSession = Depends(get_session_dependency),
):
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    await db.delete(category)
    return APIResponse(success=True, message="Category deleted")
