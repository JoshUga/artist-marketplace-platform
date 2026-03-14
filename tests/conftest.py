"""Pytest configuration and shared fixtures."""
import sys
import os
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Override database URL to use SQLite for tests
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test.db"
os.environ["JWT_SECRET_KEY"] = "test-secret-key"

from shared.database import Base, create_engine, create_session_factory

# Import all models so Base.metadata includes all tables
from services.auth.models import User  # noqa: F401
from services.artist.models import Artist, PortfolioItem  # noqa: F401
from services.product.models import Product, Category  # noqa: F401


@pytest_asyncio.fixture
async def db_engine():
    """Create a test database engine."""
    engine = create_engine("sqlite+aiosqlite:///./test.db")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(db_engine):
    """Create a test database session."""
    session_factory = create_session_factory(db_engine)
    async with session_factory() as session:
        yield session


@pytest_asyncio.fixture
async def auth_client(db_engine):
    """Create a test client for the Auth Service."""
    from services.auth.main import app
    from services.auth import routes

    session_factory = create_session_factory(db_engine)
    app.state.session_factory = session_factory
    app.state.engine = db_engine

    async def get_test_db():
        async with session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app.dependency_overrides[routes.get_db] = get_test_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def artist_client(db_engine):
    """Create a test client for the Artist Service."""
    from services.artist.main import app
    from services.artist import routes

    session_factory = create_session_factory(db_engine)
    app.state.session_factory = session_factory
    app.state.engine = db_engine

    async def get_test_db():
        async with session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app.dependency_overrides[routes.get_db] = get_test_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def product_client(db_engine):
    """Create a test client for the Product Service."""
    from services.product.main import app
    from services.product import routes

    session_factory = create_session_factory(db_engine)
    app.state.session_factory = session_factory
    app.state.engine = db_engine

    async def get_test_db():
        async with session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app.dependency_overrides[routes.get_db] = get_test_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()
