"""Auth service API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from shared.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    require_role,
)
from shared.schemas import APIResponse
from services.auth.models import User, UserRole
from services.auth.schemas import (
    UserRegister,
    UserLogin,
    TokenResponse,
    TokenRefresh,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


async def get_db():
    """Database session dependency - overridden at app startup."""
    raise NotImplementedError("Database session not configured")


@router.post("/register", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists",
        )

    # Create user
    user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name,
        role=UserRole(user_data.role),
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    return APIResponse(
        success=True,
        message="User registered successfully",
        data=UserResponse.model_validate(user).model_dump(),
    )


@router.post("/login", response_model=APIResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    token_data = {"sub": user.id, "email": user.email, "role": user.role.value}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return APIResponse(
        success=True,
        message="Login successful",
        data=TokenResponse(
            access_token=access_token, refresh_token=refresh_token
        ).model_dump(),
    )


@router.post("/refresh", response_model=APIResponse)
async def refresh_token(token_data: TokenRefresh):
    payload = decode_token(token_data.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    new_token_data = {"sub": payload["sub"], "email": payload["email"], "role": payload["role"]}
    new_access_token = create_access_token(new_token_data)
    new_refresh_token = create_refresh_token(new_token_data)

    return APIResponse(
        success=True,
        message="Token refreshed",
        data=TokenResponse(
            access_token=new_access_token, refresh_token=new_refresh_token
        ).model_dump(),
    )


@router.post("/logout", response_model=APIResponse)
async def logout(current_user: dict = Depends(get_current_user)):
    return APIResponse(success=True, message="Logged out successfully")


@router.get("/me", response_model=APIResponse)
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == current_user["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return APIResponse(
        success=True,
        data=UserResponse.model_validate(user).model_dump(),
    )


@router.get("/users/{user_id}/profile", response_model=APIResponse)
async def get_user_profile(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return APIResponse(
        success=True,
        data=UserResponse.model_validate(user).model_dump(),
    )
