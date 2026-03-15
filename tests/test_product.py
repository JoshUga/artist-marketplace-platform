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


class TestProductEngagement:
    async def test_like_and_unlike_product(self, product_client):
        headers = get_auth_headers()
        create_resp = await product_client.post("/products", json={
            "title": "Likeable Product",
            "price": 120.0,
        }, headers=headers)
        product_id = create_resp.json()["data"]["id"]

        like_resp = await product_client.post(f"/products/{product_id}/likes", headers=headers)
        assert like_resp.status_code == 200
        assert like_resp.json()["data"]["liked"] is True
        assert like_resp.json()["data"]["likes_count"] == 1

        unlike_resp = await product_client.delete(f"/products/{product_id}/likes", headers=headers)
        assert unlike_resp.status_code == 200
        assert unlike_resp.json()["data"]["liked"] is False
        assert unlike_resp.json()["data"]["likes_count"] == 0

    async def test_add_review_and_get_engagement(self, product_client):
        headers = get_auth_headers(user_id="reviewer-1")
        create_resp = await product_client.post("/products", json={
            "title": "Review Target",
            "price": 89.0,
        }, headers=headers)
        product_id = create_resp.json()["data"]["id"]

        review_resp = await product_client.post(f"/products/{product_id}/reviews", json={
            "rating": 5,
            "comment": "Excellent artwork and presentation.",
        }, headers=headers)
        assert review_resp.status_code == 201
        assert review_resp.json()["data"]["rating"] == 5

        engagement_resp = await product_client.get(f"/products/{product_id}/engagement")
        assert engagement_resp.status_code == 200
        data = engagement_resp.json()["data"]
        assert data["review_count"] == 1
        assert len(data["reviews"]) == 1
        assert data["average_rating"] == 5.0

    async def test_share_metadata(self, product_client):
        headers = get_auth_headers(user_id="creator-1")
        create_resp = await product_client.post("/products", json={
            "title": "Share Ready Product",
            "description": "Created for social preview cards.",
            "price": 210.0,
        }, headers=headers)
        product_id = create_resp.json()["data"]["id"]

        share_resp = await product_client.get(f"/products/{product_id}/share")
        assert share_resp.status_code == 200
        share_data = share_resp.json()["data"]
        assert share_data["title"] == "Share Ready Product"
        assert f"/products/{product_id}" in share_data["canonical_url"]

    async def test_share_page_returns_html(self, product_client):
        headers = get_auth_headers(user_id="share-page-creator")
        create_resp = await product_client.post("/products", json={
            "title": "Share Page Product",
            "description": "Server rendered OG page test",
            "price": 145.0,
        }, headers=headers)
        product_id = create_resp.json()["data"]["id"]

        share_page_resp = await product_client.get(f"/products/{product_id}/share/page")
        assert share_page_resp.status_code == 200
        assert "text/html" in share_page_resp.headers["content-type"]
        assert "og:title" in share_page_resp.text

    async def test_my_analytics_counts(self, product_client):
        headers = get_auth_headers(user_id="analytics-artist")
        create_resp = await product_client.post("/products", json={
            "title": "Analytics Product",
            "price": 65.0,
        }, headers=headers)
        product_id = create_resp.json()["data"]["id"]

        await product_client.get(f"/products/{product_id}")
        await product_client.post(f"/products/{product_id}/likes", headers=headers)
        await product_client.post(f"/products/{product_id}/reviews", json={
            "rating": 4,
            "comment": "Great work.",
        }, headers=headers)

        analytics_resp = await product_client.get("/products/me/analytics", headers=headers)
        assert analytics_resp.status_code == 200
        data = analytics_resp.json()["data"]
        assert data["product_count"] >= 1
        assert data["total_views"] >= 1
        assert data["total_likes"] >= 1
        assert data["total_comments"] >= 1
