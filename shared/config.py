"""Centralized configuration management using environment variables."""
import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Base settings shared across all services."""
    # Service info
    SERVICE_NAME: str = "unknown"
    SERVICE_HOST: str = "0.0.0.0"
    SERVICE_PORT: int = 8000
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "mysql+aiomysql://root:password@mysql:3306/marketplace"
    
    # Redis
    REDIS_URL: str = "redis://redis:6379/0"
    
    # JWT
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: str = "*"

    # API Gateway
    API_GATEWAY_URL: str = "http://gateway:80"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
