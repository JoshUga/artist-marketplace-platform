"""Tests for Artist Service."""
import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test.db"
os.environ["JWT_SECRET_KEY"] = "test-secret-key"

from shared.security import create_access_token

pytestmark = pytest.mark.asyncio


def get_auth_headers(user_id="user-123", role="artist"):
    token = create_access_token({"sub": user_id, "email": "artist@test.com", "role": role})
    return {"Authorization": f"Bearer {token}"}


class TestArtistRegistration:
    async def test_register_artist(self, artist_client):
        headers = get_auth_headers()
        response = await artist_client.post("/artists/register", json={
            "artist_name": "Test Artist",
            "bio": "A talented artist",
        }, headers=headers)
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["artist_name"] == "Test Artist"

    async def test_register_artist_duplicate(self, artist_client):
        headers = get_auth_headers()
        await artist_client.post("/artists/register", json={
            "artist_name": "Artist 1",
        }, headers=headers)
        response = await artist_client.post("/artists/register", json={
            "artist_name": "Artist 2",
        }, headers=headers)
        assert response.status_code == 409

    async def test_register_artist_unauthenticated(self, artist_client):
        response = await artist_client.post("/artists/register", json={
            "artist_name": "Test",
        })
        assert response.status_code == 403


class TestArtistProfile:
    async def test_list_artists(self, artist_client):
        # Register an artist
        headers = get_auth_headers(user_id="list-user")
        await artist_client.post("/artists/register", json={
            "artist_name": "Listed Artist",
        }, headers=headers)

        response = await artist_client.get("/artists")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    async def test_get_artist(self, artist_client):
        headers = get_auth_headers(user_id="get-user")
        reg_resp = await artist_client.post("/artists/register", json={
            "artist_name": "Get Artist",
            "bio": "Test bio",
        }, headers=headers)
        artist_id = reg_resp.json()["data"]["id"]

        response = await artist_client.get(f"/artists/{artist_id}")
        assert response.status_code == 200
        assert response.json()["data"]["artist_name"] == "Get Artist"

    async def test_get_nonexistent_artist(self, artist_client):
        response = await artist_client.get("/artists/nonexistent-id")
        assert response.status_code == 404

    async def test_update_artist_profile(self, artist_client):
        headers = get_auth_headers(user_id="update-user")
        reg_resp = await artist_client.post("/artists/register", json={
            "artist_name": "Update Artist",
        }, headers=headers)
        artist_id = reg_resp.json()["data"]["id"]

        response = await artist_client.put(f"/artists/{artist_id}/profile", json={
            "bio": "Updated bio",
            "instagram": "myinsta",
        }, headers=headers)
        assert response.status_code == 200
        assert response.json()["data"]["bio"] == "Updated bio"


class TestPortfolio:
    async def test_add_portfolio_item(self, artist_client):
        headers = get_auth_headers(user_id="portfolio-user")
        reg_resp = await artist_client.post("/artists/register", json={
            "artist_name": "Portfolio Artist",
        }, headers=headers)
        artist_id = reg_resp.json()["data"]["id"]

        response = await artist_client.post(f"/artists/{artist_id}/portfolio", json={
            "title": "My Painting",
            "description": "A beautiful painting",
            "image_url": "https://example.com/painting.jpg",
        }, headers=headers)
        assert response.status_code == 201
        assert response.json()["data"]["title"] == "My Painting"

    async def test_get_portfolio(self, artist_client):
        headers = get_auth_headers(user_id="portfolio-get-user")
        reg_resp = await artist_client.post("/artists/register", json={
            "artist_name": "Portfolio View Artist",
        }, headers=headers)
        artist_id = reg_resp.json()["data"]["id"]

        await artist_client.post(f"/artists/{artist_id}/portfolio", json={
            "title": "Item 1",
            "image_url": "https://example.com/1.jpg",
        }, headers=headers)

        response = await artist_client.get(f"/artists/{artist_id}/portfolio")
        assert response.status_code == 200
        assert response.json()["total"] >= 1

    async def test_delete_portfolio_item(self, artist_client):
        headers = get_auth_headers(user_id="portfolio-del-user")
        reg_resp = await artist_client.post("/artists/register", json={
            "artist_name": "Delete Artist",
        }, headers=headers)
        artist_id = reg_resp.json()["data"]["id"]

        item_resp = await artist_client.post(f"/artists/{artist_id}/portfolio", json={
            "title": "To Delete",
            "image_url": "https://example.com/del.jpg",
        }, headers=headers)
        item_id = item_resp.json()["data"]["id"]

        response = await artist_client.delete(f"/artists/{artist_id}/portfolio/{item_id}", headers=headers)
        assert response.status_code == 200
        assert response.json()["message"] == "Portfolio item deleted"


class TestHealthCheck:
    async def test_health(self, artist_client):
        response = await artist_client.get("/health")
        assert response.status_code == 200
        assert response.json()["service"] == "artist-service"
