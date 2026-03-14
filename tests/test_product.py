"""Tests for Product Service."""
import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test.db"
os.environ["JWT_SECRET_KEY"] = "test-secret-key"

from shared.security import create_access_token

pytestmark = pytest.mark.asyncio


def get_auth_headers(user_id="artist-123", role="artist"):
    token = create_access_token({"sub": user_id, "email": "artist@test.com", "role": role})
    return {"Authorization": f"Bearer {token}"}


def get_admin_headers():
    token = create_access_token({"sub": "admin-1", "email": "admin@test.com", "role": "admin"})
    return {"Authorization": f"Bearer {token}"}


class TestProductCreation:
    async def test_create_product(self, product_client):
        headers = get_auth_headers()
        response = await product_client.post("/products", json={
            "title": "Beautiful Painting",
            "description": "Oil on canvas",
            "price": 299.99,
            "medium": "Oil",
            "dimensions": "24x36 inches",
        }, headers=headers)
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["title"] == "Beautiful Painting"
        assert data["data"]["price"] == 299.99

    async def test_create_product_unauthenticated(self, product_client):
        response = await product_client.post("/products", json={
            "title": "Test",
            "price": 100.0,
        })
        assert response.status_code == 403

    async def test_create_product_negative_price(self, product_client):
        headers = get_auth_headers()
        response = await product_client.post("/products", json={
            "title": "Invalid",
            "price": -10.0,
        }, headers=headers)
        assert response.status_code == 422


class TestProductRetrieval:
    async def test_get_product(self, product_client):
        headers = get_auth_headers()
        create_resp = await product_client.post("/products", json={
            "title": "Get Product",
            "price": 100.0,
            "status": "published",
        }, headers=headers)
        product_id = create_resp.json()["data"]["id"]

        response = await product_client.get(f"/products/{product_id}")
        assert response.status_code == 200
        assert response.json()["data"]["title"] == "Get Product"

    async def test_get_nonexistent_product(self, product_client):
        response = await product_client.get("/products/nonexistent-id")
        assert response.status_code == 404

    async def test_list_products(self, product_client):
        response = await product_client.get("/products")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "total" in data


class TestProductUpdate:
    async def test_update_product(self, product_client):
        headers = get_auth_headers()
        create_resp = await product_client.post("/products", json={
            "title": "Update Me",
            "price": 50.0,
        }, headers=headers)
        product_id = create_resp.json()["data"]["id"]

        response = await product_client.put(f"/products/{product_id}", json={
            "title": "Updated Title",
            "price": 75.0,
        }, headers=headers)
        assert response.status_code == 200
        assert response.json()["data"]["title"] == "Updated Title"
        assert response.json()["data"]["price"] == 75.0

    async def test_update_unauthorized(self, product_client):
        headers = get_auth_headers(user_id="owner-1")
        create_resp = await product_client.post("/products", json={
            "title": "Owner Product",
            "price": 50.0,
        }, headers=headers)
        product_id = create_resp.json()["data"]["id"]

        other_headers = get_auth_headers(user_id="other-user")
        response = await product_client.put(f"/products/{product_id}", json={
            "title": "Hijacked",
        }, headers=other_headers)
        assert response.status_code == 403


class TestProductDeletion:
    async def test_delete_product(self, product_client):
        headers = get_auth_headers()
        create_resp = await product_client.post("/products", json={
            "title": "Delete Me",
            "price": 50.0,
        }, headers=headers)
        product_id = create_resp.json()["data"]["id"]

        response = await product_client.delete(f"/products/{product_id}", headers=headers)
        assert response.status_code == 200
        assert response.json()["message"] == "Product deleted"


class TestCategories:
    async def test_create_category_as_admin(self, product_client):
        headers = get_admin_headers()
        response = await product_client.post("/categories", json={
            "name": "Paintings",
            "slug": "paintings",
            "description": "Traditional paintings",
        }, headers=headers)
        assert response.status_code == 201
        assert response.json()["data"]["name"] == "Paintings"

    async def test_create_category_as_non_admin(self, product_client):
        headers = get_auth_headers(role="buyer")
        response = await product_client.post("/categories", json={
            "name": "Sculptures",
            "slug": "sculptures",
        }, headers=headers)
        assert response.status_code == 403

    async def test_list_categories(self, product_client):
        response = await product_client.get("/categories")
        assert response.status_code == 200


class TestHealthCheck:
    async def test_health(self, product_client):
        response = await product_client.get("/health")
        assert response.status_code == 200
        assert response.json()["service"] == "product-service"
