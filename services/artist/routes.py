"""Artist service API routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from shared.security import get_current_user, require_role
from shared.schemas import APIResponse, PaginatedResponse
from services.artist.models import Artist, PortfolioItem
from services.artist.schemas import (
    ArtistCreate,
    ArtistUpdate,
    ArtistResponse,
    PortfolioItemCreate,
    PortfolioItemUpdate,
    PortfolioItemResponse,
)

router = APIRouter(prefix="/artists", tags=["Artists"])


def get_session_dependency():
    pass


@router.post("/register", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def register_artist(
    artist_data: ArtistCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session_dependency),
):
    # Check if already registered as artist
    result = await db.execute(select(Artist).where(Artist.user_id == current_user["sub"]))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is already registered as an artist",
        )

    artist = Artist(user_id=current_user["sub"], **artist_data.model_dump())
    db.add(artist)
    await db.flush()
    await db.refresh(artist)

    return APIResponse(
        success=True,
        message="Artist registered successfully",
        data=ArtistResponse.model_validate(artist).model_dump(),
    )


@router.get("", response_model=PaginatedResponse)
async def list_artists(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_session_dependency),
):
    offset = (page - 1) * per_page

    # Get total count
    count_result = await db.execute(
        select(func.count()).select_from(Artist).where(Artist.is_active == True)
    )
    total = count_result.scalar()

    # Get artists
    result = await db.execute(
        select(Artist)
        .where(Artist.is_active == True)
        .order_by(Artist.created_at.desc())
        .offset(offset)
        .limit(per_page)
    )
    artists = result.scalars().all()

    return PaginatedResponse(
        data=[ArtistResponse.model_validate(a).model_dump() for a in artists],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=(total + per_page - 1) // per_page if total > 0 else 0,
    )


@router.get("/{artist_id}", response_model=APIResponse)
async def get_artist(artist_id: str, db: AsyncSession = Depends(get_session_dependency)):
    result = await db.execute(select(Artist).where(Artist.id == artist_id))
    artist = result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")

    return APIResponse(
        success=True,
        data=ArtistResponse.model_validate(artist).model_dump(),
    )


@router.put("/{artist_id}/profile", response_model=APIResponse)
async def update_artist_profile(
    artist_id: str,
    update_data: ArtistUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session_dependency),
):
    result = await db.execute(select(Artist).where(Artist.id == artist_id))
    artist = result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")

    if artist.user_id != current_user["sub"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(artist, key, value)

    await db.flush()
    await db.refresh(artist)

    return APIResponse(
        success=True,
        message="Profile updated",
        data=ArtistResponse.model_validate(artist).model_dump(),
    )


# Portfolio routes
@router.post("/{artist_id}/portfolio", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def add_portfolio_item(
    artist_id: str,
    item_data: PortfolioItemCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session_dependency),
):
    result = await db.execute(select(Artist).where(Artist.id == artist_id))
    artist = result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")

    if artist.user_id != current_user["sub"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    item = PortfolioItem(artist_id=artist_id, **item_data.model_dump())
    db.add(item)
    await db.flush()
    await db.refresh(item)

    return APIResponse(
        success=True,
        message="Portfolio item added",
        data=PortfolioItemResponse.model_validate(item).model_dump(),
    )


@router.get("/{artist_id}/portfolio", response_model=PaginatedResponse)
async def get_portfolio(
    artist_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_session_dependency),
):
    offset = (page - 1) * per_page

    count_result = await db.execute(
        select(func.count()).select_from(PortfolioItem).where(PortfolioItem.artist_id == artist_id)
    )
    total = count_result.scalar()

    result = await db.execute(
        select(PortfolioItem)
        .where(PortfolioItem.artist_id == artist_id)
        .order_by(PortfolioItem.sort_order)
        .offset(offset)
        .limit(per_page)
    )
    items = result.scalars().all()

    return PaginatedResponse(
        data=[PortfolioItemResponse.model_validate(i).model_dump() for i in items],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=(total + per_page - 1) // per_page if total > 0 else 0,
    )


@router.put("/{artist_id}/portfolio/{item_id}", response_model=APIResponse)
async def update_portfolio_item(
    artist_id: str,
    item_id: str,
    update_data: PortfolioItemUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session_dependency),
):
    result = await db.execute(select(Artist).where(Artist.id == artist_id))
    artist = result.scalar_one_or_none()
    if not artist or artist.user_id != current_user["sub"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    result = await db.execute(
        select(PortfolioItem).where(PortfolioItem.id == item_id, PortfolioItem.artist_id == artist_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio item not found")

    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(item, key, value)

    await db.flush()
    await db.refresh(item)

    return APIResponse(
        success=True,
        message="Portfolio item updated",
        data=PortfolioItemResponse.model_validate(item).model_dump(),
    )


@router.delete("/{artist_id}/portfolio/{item_id}", response_model=APIResponse)
async def delete_portfolio_item(
    artist_id: str,
    item_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session_dependency),
):
    result = await db.execute(select(Artist).where(Artist.id == artist_id))
    artist = result.scalar_one_or_none()
    if not artist or artist.user_id != current_user["sub"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    result = await db.execute(
        select(PortfolioItem).where(PortfolioItem.id == item_id, PortfolioItem.artist_id == artist_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio item not found")

    await db.delete(item)
    return APIResponse(success=True, message="Portfolio item deleted")


# Admin routes
@router.put("/{artist_id}/verify", response_model=APIResponse)
async def verify_artist(
    artist_id: str,
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_session_dependency),
):
    result = await db.execute(select(Artist).where(Artist.id == artist_id))
    artist = result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")

    artist.is_verified = True
    await db.flush()

    return APIResponse(success=True, message="Artist verified")


@router.put("/{artist_id}/suspend", response_model=APIResponse)
async def suspend_artist(
    artist_id: str,
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_session_dependency),
):
    result = await db.execute(select(Artist).where(Artist.id == artist_id))
    artist = result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")

    artist.is_active = False
    await db.flush()

    return APIResponse(success=True, message="Artist suspended")
