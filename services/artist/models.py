"""Artist service database models."""
import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, DateTime, Integer, Enum as SAEnum
from sqlalchemy.dialects.mysql import CHAR
from shared.database import Base


class Artist(Base):
    __tablename__ = "artists"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(CHAR(36), nullable=False, unique=True, index=True)
    artist_name = Column(String(255), nullable=False)
    bio = Column(Text, nullable=True)
    profile_image_url = Column(String(500), nullable=True)
    website = Column(String(500), nullable=True)
    instagram = Column(String(255), nullable=True)
    twitter = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class PortfolioItem(Base):
    __tablename__ = "portfolio_items"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    artist_id = Column(CHAR(36), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=False)
    availability = Column(SAEnum("digital", "physical", name="portfolio_availability"), default="digital", nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    artist_id = Column(CHAR(36), nullable=False, index=True)
    sender_name = Column(String(255), nullable=False)
    sender_email = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
