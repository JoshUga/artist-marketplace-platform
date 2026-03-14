"""Artist service Pydantic schemas."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ArtistCreate(BaseModel):
    artist_name: str
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    website: Optional[str] = None
    instagram: Optional[str] = None
    twitter: Optional[str] = None


class ArtistUpdate(BaseModel):
    artist_name: Optional[str] = None
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    website: Optional[str] = None
    instagram: Optional[str] = None
    twitter: Optional[str] = None


class ArtistResponse(BaseModel):
    id: str
    user_id: str
    artist_name: str
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    website: Optional[str] = None
    instagram: Optional[str] = None
    twitter: Optional[str] = None
    is_verified: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PortfolioItemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: str
    sort_order: int = 0


class PortfolioItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    sort_order: Optional[int] = None


class PortfolioItemResponse(BaseModel):
    id: str
    artist_id: str
    title: str
    description: Optional[str] = None
    image_url: str
    sort_order: int
    created_at: datetime

    class Config:
        from_attributes = True
