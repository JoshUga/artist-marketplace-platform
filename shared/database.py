"""Database utilities with SQLAlchemy async support."""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from shared.config import get_settings


class Base(DeclarativeBase):
    pass


def create_engine(database_url: str | None = None):
    url = database_url or get_settings().DATABASE_URL
    return create_async_engine(url, echo=get_settings().DEBUG, pool_pre_ping=True)


def create_session_factory(engine):
    return async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db_session(session_factory):
    async with session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
