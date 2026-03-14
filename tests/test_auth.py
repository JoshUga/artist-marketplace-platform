"""Tests for Auth Service."""
import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test.db"
os.environ["JWT_SECRET_KEY"] = "test-secret-key"

pytestmark = pytest.mark.asyncio


class TestAuthRegistration:
    async def test_register_success(self, auth_client):
        response = await auth_client.post("/auth/register", json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User",
            "role": "buyer"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["email"] == "test@example.com"
        assert data["data"]["full_name"] == "Test User"

    async def test_register_duplicate_email(self, auth_client):
        # Register first user
        await auth_client.post("/auth/register", json={
            "email": "duplicate@example.com",
            "password": "password123",
            "full_name": "User 1",
        })
        # Try to register with same email
        response = await auth_client.post("/auth/register", json={
            "email": "duplicate@example.com",
            "password": "password456",
            "full_name": "User 2",
        })
        assert response.status_code == 409

    async def test_register_invalid_email(self, auth_client):
        response = await auth_client.post("/auth/register", json={
            "email": "not-an-email",
            "password": "password123",
            "full_name": "Test User",
        })
        assert response.status_code == 422

    async def test_register_short_password(self, auth_client):
        response = await auth_client.post("/auth/register", json={
            "email": "test2@example.com",
            "password": "short",
            "full_name": "Test User",
        })
        assert response.status_code == 422


class TestAuthLogin:
    async def test_login_success(self, auth_client):
        # Register first
        await auth_client.post("/auth/register", json={
            "email": "login@example.com",
            "password": "password123",
            "full_name": "Login User",
        })
        # Login
        response = await auth_client.post("/auth/login", json={
            "email": "login@example.com",
            "password": "password123",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "access_token" in data["data"]
        assert "refresh_token" in data["data"]

    async def test_login_wrong_password(self, auth_client):
        await auth_client.post("/auth/register", json={
            "email": "wrong@example.com",
            "password": "password123",
            "full_name": "Test User",
        })
        response = await auth_client.post("/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpassword",
        })
        assert response.status_code == 401

    async def test_login_nonexistent_user(self, auth_client):
        response = await auth_client.post("/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "password123",
        })
        assert response.status_code == 401


class TestAuthMe:
    async def test_get_me_authenticated(self, auth_client):
        # Register and login
        await auth_client.post("/auth/register", json={
            "email": "me@example.com",
            "password": "password123",
            "full_name": "Me User",
        })
        login_resp = await auth_client.post("/auth/login", json={
            "email": "me@example.com",
            "password": "password123",
        })
        token = login_resp.json()["data"]["access_token"]

        response = await auth_client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert response.json()["data"]["email"] == "me@example.com"

    async def test_get_me_unauthenticated(self, auth_client):
        response = await auth_client.get("/auth/me")
        assert response.status_code == 403


class TestTokenRefresh:
    async def test_refresh_token(self, auth_client):
        # Register and login
        await auth_client.post("/auth/register", json={
            "email": "refresh@example.com",
            "password": "password123",
            "full_name": "Refresh User",
        })
        login_resp = await auth_client.post("/auth/login", json={
            "email": "refresh@example.com",
            "password": "password123",
        })
        refresh_token = login_resp.json()["data"]["refresh_token"]

        response = await auth_client.post("/auth/refresh", json={
            "refresh_token": refresh_token
        })
        assert response.status_code == 200
        assert "access_token" in response.json()["data"]


class TestHealthCheck:
    async def test_health_endpoint(self, auth_client):
        response = await auth_client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "auth-service"
