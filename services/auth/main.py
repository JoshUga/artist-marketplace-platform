"""Auth Service entry point."""
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession

from shared.config import Settings
from shared.database import create_engine, create_session_factory, Base
from shared.health import create_health_router
from shared.middleware import CorrelationIdMiddleware, RequestTimingMiddleware
from shared.logging import setup_logging
from services.auth.models import User
from services.auth import routes

logger = setup_logging("auth-service")

settings = Settings(SERVICE_NAME="auth-service", SERVICE_PORT=8001)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Auth Service")
    engine = create_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    app.state.engine = engine
    app.state.session_factory = create_session_factory(engine)
    logger.info("Auth Service started successfully")
    yield
    await engine.dispose()
    logger.info("Auth Service stopped")


app = FastAPI(
    title="Auth Service",
    description="Authentication and authorization service",
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

# Override the dependency
app.dependency_overrides[routes.get_db] = get_db
app.include_router(routes.router)
app.include_router(create_health_router("auth-service"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.SERVICE_HOST, port=settings.SERVICE_PORT)
