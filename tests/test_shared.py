"""Tests for shared utilities."""
import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test.db"
os.environ["JWT_SECRET_KEY"] = "test-secret-key"

from shared.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from shared.schemas import APIResponse, PaginatedResponse, ErrorResponse
from shared.health import create_health_router
from shared.logging import setup_logging, get_correlation_id


class TestPasswordHashing:
    def test_hash_password(self):
        hashed = hash_password("testpassword123")
        assert hashed != "testpassword123"
        assert len(hashed) > 0

    def test_verify_password_correct(self):
        hashed = hash_password("testpassword123")
        assert verify_password("testpassword123", hashed) is True

    def test_verify_password_incorrect(self):
        hashed = hash_password("testpassword123")
        assert verify_password("wrongpassword", hashed) is False


class TestJWT:
    def test_create_access_token(self):
        token = create_access_token({"sub": "user123", "email": "test@example.com"})
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_refresh_token(self):
        token = create_refresh_token({"sub": "user123", "email": "test@example.com"})
        assert isinstance(token, str)
        assert len(token) > 0

    def test_decode_access_token(self):
        data = {"sub": "user123", "email": "test@example.com", "role": "buyer"}
        token = create_access_token(data)
        decoded = decode_token(token)
        assert decoded["sub"] == "user123"
        assert decoded["email"] == "test@example.com"
        assert decoded["role"] == "buyer"
        assert decoded["type"] == "access"

    def test_decode_refresh_token(self):
        data = {"sub": "user123", "email": "test@example.com"}
        token = create_refresh_token(data)
        decoded = decode_token(token)
        assert decoded["sub"] == "user123"
        assert decoded["type"] == "refresh"

    def test_decode_invalid_token(self):
        from fastapi import HTTPException
        with pytest.raises(HTTPException):
            decode_token("invalid-token")


class TestSchemas:
    def test_api_response(self):
        response = APIResponse(success=True, message="OK", data={"key": "value"})
        assert response.success is True
        assert response.message == "OK"
        assert response.data == {"key": "value"}

    def test_paginated_response(self):
        response = PaginatedResponse(data=[1, 2, 3], total=100, page=1, per_page=20, total_pages=5)
        assert len(response.data) == 3
        assert response.total == 100
        assert response.total_pages == 5

    def test_error_response(self):
        response = ErrorResponse(message="Not found", detail="Resource not found")
        assert response.success is False
        assert response.message == "Not found"


class TestLogging:
    def test_setup_logging(self):
        logger = setup_logging("test-service")
        assert logger.name == "test-service"
        assert len(logger.handlers) > 0

    def test_correlation_id(self):
        cid = get_correlation_id()
        assert isinstance(cid, str)
        assert len(cid) > 0


class TestHealthRouter:
    def test_create_health_router(self):
        router = create_health_router("test-service")
        assert len(router.routes) > 0
