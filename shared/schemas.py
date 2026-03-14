"""Shared Pydantic schemas."""
from pydantic import BaseModel
from typing import Optional, Any


class APIResponse(BaseModel):
    success: bool = True
    message: str = "OK"
    data: Optional[Any] = None


class PaginatedResponse(BaseModel):
    success: bool = True
    data: list = []
    total: int = 0
    page: int = 1
    per_page: int = 20
    total_pages: int = 0


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    detail: Optional[str] = None
