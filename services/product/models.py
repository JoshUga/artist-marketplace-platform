"""Product service database models."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    DateTime,
    Float,
    Integer,
    Enum as SAEnum,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.dialects.mysql import CHAR
from shared.database import Base
import enum


class ProductStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    SOLD = "sold"
    ARCHIVED = "archived"


class Product(Base):
    __tablename__ = "products"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    artist_id = Column(CHAR(36), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    category_id = Column(CHAR(36), nullable=True, index=True)
    status = Column(SAEnum(ProductStatus), default=ProductStatus.DRAFT, nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    image_url = Column(String(500), nullable=True)
    dimensions = Column(String(100), nullable=True)
    medium = Column(String(100), nullable=True)
    is_featured = Column(Boolean, default=False, nullable=False)
    view_count = Column(Integer, default=0, nullable=False)
    likes_count = Column(Integer, default=0, nullable=False)
    review_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class Category(Base):
    __tablename__ = "categories"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    slug = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


class ProductLike(Base):
    __tablename__ = "product_likes"
    __table_args__ = (
        UniqueConstraint("product_id", "user_id", name="uq_product_like_user"),
    )

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(CHAR(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(CHAR(36), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


class ProductReview(Base):
    __tablename__ = "product_reviews"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(CHAR(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(CHAR(36), nullable=False, index=True)
    user_name = Column(String(255), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
