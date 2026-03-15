"""Artist Service entry point."""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from sqlalchemy import text

from shared.config import Settings
from shared.database import create_engine, create_session_factory, Base
from shared.health import create_health_router
from shared.middleware import CorrelationIdMiddleware, RequestTimingMiddleware
from shared.logging import setup_logging
from services.artist.models import Artist, PortfolioItem, ContactMessage
from services.artist import routes

logger = setup_logging("artist-service")

settings = Settings(SERVICE_NAME="artist-service", SERVICE_PORT=8002)


async def _apply_legacy_schema_fixes(engine):
    """Bring older deployments forward when new columns are added."""
    if engine.dialect.name != "mysql":
        return

    async with engine.begin() as conn:
        availability_column_exists = await conn.scalar(
            text(
                """
                SELECT COUNT(*)
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'portfolio_items'
                  AND COLUMN_NAME = 'availability'
                """
            )
        )

        if not availability_column_exists:
            await conn.execute(
                text(
                    """
                    ALTER TABLE portfolio_items
                    ADD COLUMN availability ENUM('digital', 'physical')
                    NOT NULL DEFAULT 'digital'
                    """
                )
            )
            logger.info("Applied schema fix: added portfolio_items.availability")

        template_column_exists = await conn.scalar(
            text(
                """
                SELECT COUNT(*)
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'artists'
                  AND COLUMN_NAME = 'portfolio_template_key'
                """
            )
        )
        if not template_column_exists:
            await conn.execute(
                text(
                    """
                    ALTER TABLE artists
                    ADD COLUMN portfolio_template_key VARCHAR(64)
                    NOT NULL DEFAULT 'editorial'
                    """
                )
            )
            logger.info("Applied schema fix: added artists.portfolio_template_key")

        theme_name_column_exists = await conn.scalar(
            text(
                """
                SELECT COUNT(*)
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'artists'
                  AND COLUMN_NAME = 'portfolio_theme_name'
                """
            )
        )
        if not theme_name_column_exists:
            await conn.execute(
                text(
                    """
                    ALTER TABLE artists
                    ADD COLUMN portfolio_theme_name VARCHAR(120)
                    NOT NULL DEFAULT 'Warm Studio'
                    """
                )
            )
            logger.info("Applied schema fix: added artists.portfolio_theme_name")

        theme_config_column_exists = await conn.scalar(
            text(
                """
                SELECT COUNT(*)
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'artists'
                  AND COLUMN_NAME = 'portfolio_theme_config'
                """
            )
        )
        if not theme_config_column_exists:
            await conn.execute(
                text(
                    """
                    ALTER TABLE artists
                    ADD COLUMN portfolio_theme_config TEXT NULL
                    """
                )
            )
            logger.info("Applied schema fix: added artists.portfolio_theme_config")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Artist Service")
    engine = create_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await _apply_legacy_schema_fixes(engine)
    app.state.engine = engine
    app.state.session_factory = create_session_factory(engine)
    logger.info("Artist Service started successfully")
    yield
    await engine.dispose()
    logger.info("Artist Service stopped")


app = FastAPI(
    title="Artist Service",
    description="Artist profile and portfolio management",
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
app.include_router(create_health_router("artist-service"))

# Expose uploaded media for CDN fetchers (e.g. Thumbor).
os.makedirs(settings.ARTIST_MEDIA_DIR, exist_ok=True)
app.mount("/media", StaticFiles(directory=settings.ARTIST_MEDIA_DIR), name="media")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.SERVICE_HOST, port=settings.SERVICE_PORT)
