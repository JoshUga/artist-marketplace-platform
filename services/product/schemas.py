"""Product service Pydantic schemas."""
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class ProductCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    currency: str = "USD"
    category_id: Optional[str] = None
    quantity: int = 1
    image_url: Optional[str] = None
    dimensions: Optional[str] = None
    medium: Optional[str] = None

    @field_validator("price")
    @classmethod
    def validate_price(cls, v):
        if v < 0:
            raise ValueError("Price must be non-negative")
        return round(v, 2)


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    category_id: Optional[str] = None
    status: Optional[str] = None
    quantity: Optional[int] = None
    image_url: Optional[str] = None
    dimensions: Optional[str] = None
    medium: Optional[str] = None


class ProductResponse(BaseModel):
    id: str
    artist_id: str
    title: str
    description: Optional[str] = None
    price: float
    currency: str
    category_id: Optional[str] = None
    status: str
    quantity: int
    image_url: Optional[str] = None
    dimensions: Optional[str] = None
    medium: Optional[str] = None
    is_featured: bool
    view_count: int
    likes_count: int
    review_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    slug: str


class CategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    slug: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProductReviewCreate(BaseModel):
    rating: int
    comment: str

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v):
        if v < 1 or v > 5:
            raise ValueError("Rating must be between 1 and 5")
        return v

    @field_validator("comment")
    @classmethod
    def validate_comment(cls, v):
        cleaned = v.strip()
        if len(cleaned) < 3:
            raise ValueError("Comment must be at least 3 characters")
        if len(cleaned) > 2000:
            raise ValueError("Comment must be 2000 characters or fewer")
        return cleaned


class ProductReviewResponse(BaseModel):
    id: str
    product_id: str
    user_id: str
    user_name: str
    rating: int
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True
