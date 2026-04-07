"""Product Service entry point."""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy import text

from shared.config import Settings
from shared.database import create_engine, create_session_factory, Base
from shared.health import create_health_router
from shared.middleware import CorrelationIdMiddleware, RequestTimingMiddleware
from shared.logging import setup_logging
from services.product.models import Product, Category, ProductPayment, MerchantPayment
from services.product import routes

logger = setup_logging("product-service")

settings = Settings(SERVICE_NAME="product-service", SERVICE_PORT=8003)

async def _apply_legacy_schema_fixes(engine):
    """Bring older deployments forward when denormalized counters are added."""
    async with engine.begin() as conn:
        likes_column_exists = await conn.scalar(
            text(
                """
                SELECT COUNT(*)
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'products'
                  AND COLUMN_NAME = 'likes_count'
                """
            )
        )

        if not likes_column_exists:
            await conn.execute(
                text(
                    """
                    ALTER TABLE products
                    ADD COLUMN likes_count INT NOT NULL DEFAULT 0
                    """
                )
            )
            logger.info("Applied schema fix: added products.likes_count")

        review_column_exists = await conn.scalar(
            text(
                """
                SELECT COUNT(*)
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'products'
                  AND COLUMN_NAME = 'review_count'
                """
            )
        )

        if not review_column_exists:
            await conn.execute(
                text(
                    """
                    ALTER TABLE products
                    ADD COLUMN review_count INT NOT NULL DEFAULT 0
                    """
                )
            )
            logger.info("Applied schema fix: added products.review_count")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Product Service")
    engine = create_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await _apply_legacy_schema_fixes(engine)
    yield
    await engine.dispose()
    logger.info("Product Service stopped")


app = FastAPI(
    title="Product Service",
    description="Art listing and category management",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(RequestTimingMiddleware)


async def get_db():
    async with app.state.session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


app.dependency_overrides[routes.get_db] = get_db
app.include_router(routes.router)
app.include_router(create_health_router("product-service"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.SERVICE_HOST, port=settings.SERVICE_PORT)
