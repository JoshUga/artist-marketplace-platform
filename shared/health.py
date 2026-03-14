"""Health check endpoint utilities."""
from fastapi import APIRouter
from datetime import datetime, timezone


def create_health_router(service_name: str) -> APIRouter:
    router = APIRouter(tags=["Health"])

    @router.get("/health")
    async def health_check():
        return {
            "status": "healthy",
            "service": service_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    return router
