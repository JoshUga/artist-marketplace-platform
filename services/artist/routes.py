"""Artist service API routes."""
import json
import uuid
from pathlib import Path
from io import BytesIO
from html import escape

from PIL import Image, ImageDraw, ImageFont
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from shared.config import get_settings
from shared.security import get_current_user, require_role
from shared.schemas import APIResponse, PaginatedResponse
from services.artist.models import Artist, PortfolioItem, ContactMessage
from services.artist.schemas import (
    ArtistCreate,
    ArtistUpdate,
    ArtistResponse,
    PortfolioItemCreate,
    PortfolioItemUpdate,
    PortfolioItemResponse,
    ContactMessageCreate,
    ContactMessageResponse,
)
from services.artist.template_service import (
    DEFAULT_PORTFOLIO_TEMPLATE,
    normalize_template_key,
    normalize_theme_name,
    normalize_theme_config,
)

router = APIRouter(prefix="/artists", tags=["Artists"])


async def get_db():
    """Database session dependency - overridden at app startup."""
    raise NotImplementedError("Database session not configured")


def _build_artist_response_data(artist: Artist) -> dict:
    try:
        parsed_theme = json.loads(artist.portfolio_theme_config or "")
    except json.JSONDecodeError:
        parsed_theme = None

    return ArtistResponse(
        id=artist.id,
        user_id=artist.user_id,
        artist_name=artist.artist_name,
        bio=artist.bio,
        profile_image_url=artist.profile_image_url,
        website=artist.website,
        instagram=artist.instagram,
        twitter=artist.twitter,
        portfolio_template=normalize_template_key(artist.portfolio_template_key),
        portfolio_theme_name=normalize_theme_name(artist.portfolio_theme_name),
        portfolio_theme=normalize_theme_config(parsed_theme),
        is_verified=artist.is_verified,
        is_active=artist.is_active,
        created_at=artist.created_at,
    ).model_dump()


def _process_image(raw_bytes: bytes, watermark_text: str | None = None) -> tuple[bytes, str, str]:
    """Validate/normalize image bytes and optionally apply a watermark overlay."""
    try:
        image = Image.open(BytesIO(raw_bytes))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image file") from exc

    source_format = (image.format or "PNG").upper()
    if source_format == "JPG":
        source_format = "JPEG"
    if source_format not in {"JPEG", "PNG", "WEBP"}:
        source_format = "PNG"

    rgba_image = image.convert("RGBA")
    overlay = Image.new("RGBA", rgba_image.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay)

    width, height = rgba_image.size
    font_size = max(18, min(width, height) // 18)
    try:
        font = ImageFont.truetype("DejaVuSans.ttf", font_size)
    except Exception:
        font = ImageFont.load_default()

    if watermark_text:
        text = watermark_text.strip() or "Uploaded by Artist"
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]

        padding = max(16, min(width, height) // 30)
        x = max(8, width - text_width - padding)
        y = max(8, height - text_height - padding)

        draw.rectangle(
            [
                (x - 10, y - 8),
                (x + text_width + 10, y + text_height + 8),
            ],
            fill=(0, 0, 0, 110),
        )
        draw.text((x, y), text, fill=(255, 255, 255, 210), font=font)

    composed = Image.alpha_composite(rgba_image, overlay)
    output = BytesIO()

    if source_format == "JPEG":
        composed = composed.convert("RGB")
        composed.save(output, format="JPEG", quality=90)
        return output.getvalue(), "jpg", "image/jpeg"
    if source_format == "WEBP":
        composed.save(output, format="WEBP", quality=90)
        return output.getvalue(), "webp", "image/webp"

    composed.save(output, format="PNG", optimize=True)
    return output.getvalue(), "png", "image/png"


@router.post("/register", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def register_artist(
    artist_data: ArtistCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check if already registered as artist
    result = await db.execute(select(Artist).where(Artist.user_id == current_user["sub"]))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is already registered as an artist",
        )

    payload = artist_data.model_dump()
    artist = Artist(
        user_id=current_user["sub"],
        artist_name=payload["artist_name"],
        bio=payload.get("bio"),
        profile_image_url=payload.get("profile_image_url"),
        website=payload.get("website"),
        instagram=payload.get("instagram"),
        twitter=payload.get("twitter"),
        portfolio_template_key=normalize_template_key(payload.get("portfolio_template")),
        portfolio_theme_name=normalize_theme_name(payload.get("portfolio_theme_name")),
        portfolio_theme_config=json.dumps(normalize_theme_config(payload.get("portfolio_theme"))),
    )
    db.add(artist)
    await db.flush()
    await db.refresh(artist)

    return APIResponse(
        success=True,
        message="Artist registered successfully",
        data=_build_artist_response_data(artist),
    )


@router.get("", response_model=PaginatedResponse)
async def list_artists(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
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
        data=[_build_artist_response_data(a) for a in artists],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=(total + per_page - 1) // per_page if total > 0 else 0,
    )


@router.get("/me", response_model=APIResponse)
async def get_my_artist_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Artist).where(Artist.user_id == current_user["sub"]))
    artist = result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")

    return APIResponse(
        success=True,
        data=_build_artist_response_data(artist),
    )


@router.get("/{artist_id}", response_model=APIResponse)
async def get_artist(artist_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Artist).where(Artist.id == artist_id))
    artist = result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")

    return APIResponse(
        success=True,
        data=_build_artist_response_data(artist),
    )


@router.put("/{artist_id}/profile", response_model=APIResponse)
async def update_artist_profile(
    artist_id: str,
    update_data: ArtistUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Artist).where(Artist.id == artist_id))
    artist = result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")

    if artist.user_id != current_user["sub"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    update_dict = update_data.model_dump(exclude_unset=True)

    mapped_fields = {
        "artist_name",
        "bio",
        "profile_image_url",
        "website",
        "instagram",
        "twitter",
    }
    for key in mapped_fields:
        if key in update_dict:
            setattr(artist, key, update_dict[key])

    if "portfolio_template" in update_dict:
        artist.portfolio_template_key = normalize_template_key(update_dict.get("portfolio_template"))

    if "portfolio_theme_name" in update_dict:
        artist.portfolio_theme_name = normalize_theme_name(update_dict.get("portfolio_theme_name"))

    if "portfolio_theme" in update_dict:
        artist.portfolio_theme_config = json.dumps(normalize_theme_config(update_dict.get("portfolio_theme")))

    await db.flush()
    await db.refresh(artist)

    return APIResponse(
        success=True,
        message="Profile updated",
        data=_build_artist_response_data(artist),
    )


# Portfolio routes
@router.post("/{artist_id}/portfolio", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def add_portfolio_item(
    artist_id: str,
    item_data: PortfolioItemCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
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


@router.post("/{artist_id}/portfolio/upload", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def upload_portfolio_image(
    artist_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    artist_result = await db.execute(select(Artist).where(Artist.id == artist_id))
    artist = artist_result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")

    if artist.user_id != current_user["sub"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only image uploads are supported")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file uploaded")
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image exceeds 10MB upload limit")

    applied_watermark = f"Uploaded by {artist.artist_name}"
    processed_bytes, extension, content_type = _process_image(image_bytes, applied_watermark)

    settings = get_settings()
    file_name = f"{uuid.uuid4()}.{extension}"
    artist_dir = Path(settings.ARTIST_MEDIA_DIR) / artist_id

    try:
        artist_dir.mkdir(parents=True, exist_ok=True)
        output_path = artist_dir / file_name
        output_path.write_bytes(processed_bytes)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to persist uploaded media",
        ) from exc

    source_base = settings.IMAGE_ORIGIN_BASE_URL.rstrip("/")
    source_url = f"{source_base}/{artist_id}/{file_name}"
    cdn_base = settings.IMAGE_CDN_BASE_URL.rstrip("/")
    image_url = f"{cdn_base}/{source_url}"

    return APIResponse(
        success=True,
        message="Image uploaded",
        data={
            "image_url": image_url,
            "watermark_text": applied_watermark,
            "content_type": content_type,
        },
    )


@router.post("/{artist_id}/profile/upload", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def upload_profile_image(
    artist_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    artist_result = await db.execute(select(Artist).where(Artist.id == artist_id))
    artist = artist_result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")

    if artist.user_id != current_user["sub"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only image uploads are supported")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file uploaded")
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image exceeds 10MB upload limit")

    processed_bytes, extension, content_type = _process_image(image_bytes)

    settings = get_settings()
    file_name = f"profile-{uuid.uuid4()}.{extension}"
    artist_dir = Path(settings.ARTIST_MEDIA_DIR) / artist_id

    try:
        artist_dir.mkdir(parents=True, exist_ok=True)
        output_path = artist_dir / file_name
        output_path.write_bytes(processed_bytes)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to persist uploaded media",
        ) from exc

    source_base = settings.IMAGE_ORIGIN_BASE_URL.rstrip("/")
    source_url = f"{source_base}/{artist_id}/{file_name}"
    cdn_base = settings.IMAGE_CDN_BASE_URL.rstrip("/")
    image_url = f"{cdn_base}/{source_url}"

    artist.profile_image_url = image_url
    await db.flush()
    await db.refresh(artist)

    return APIResponse(
        success=True,
        message="Profile image uploaded",
        data={
            "profile_image_url": image_url,
            "content_type": content_type,
        },
    )


@router.get("/{artist_id}/portfolio", response_model=PaginatedResponse)
async def get_portfolio(
    artist_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * per_page

    count_result = await db.execute(
        select(func.count()).select_from(PortfolioItem).where(PortfolioItem.artist_id == artist_id)
    )
    total = count_result.scalar()

    result = await db.execute(
        select(PortfolioItem)
        .where(PortfolioItem.artist_id == artist_id)
        .order_by(PortfolioItem.created_at.desc())
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


@router.get("/{artist_id}/portfolio/{item_id}/share/page", response_class=HTMLResponse)
async def get_portfolio_item_share_page(
    artist_id: str,
    item_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    artist_result = await db.execute(select(Artist).where(Artist.id == artist_id))
    artist = artist_result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")

    item_result = await db.execute(
        select(PortfolioItem).where(PortfolioItem.id == item_id, PortfolioItem.artist_id == artist_id)
    )
    item = item_result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio item not found")

    scheme = request.headers.get("x-forwarded-proto") or request.url.scheme or "https"
    host = request.headers.get("x-forwarded-host") or request.headers.get("host") or "localhost"
    origin = f"{scheme}://{host}".rstrip("/")
    canonical_url = f"{origin}/portfolio/{artist.id}/item/{item.id}"
    share_url = f"{origin}/share/portfolio/{artist.id}/{item.id}"

    title = (item.title or "Artwork").strip()
    artist_name = (artist.artist_name or "Artist").strip()
    description = (item.description or f"Discover {title} by {artist_name} on EliteArt Studio.").strip()[:300]
    image_url = item.image_url or "https://placehold.co/1200x630/1f1a22/e6ddcf?text=Artist+Portfolio"

    html = f"""<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
  <title>{escape(title)} by {escape(artist_name)} | EliteArt Studio</title>
  <meta name=\"description\" content=\"{escape(description)}\">
  <link rel=\"canonical\" href=\"{escape(canonical_url)}\">
  <meta property=\"og:type\" content=\"website\">
  <meta property=\"og:site_name\" content=\"EliteArt Studio\">
  <meta property=\"og:title\" content=\"{escape(title)} by {escape(artist_name)}\">
  <meta property=\"og:description\" content=\"{escape(description)}\">
  <meta property=\"og:image\" content=\"{escape(image_url)}\">
  <meta property=\"og:url\" content=\"{escape(share_url)}\">
  <meta name=\"twitter:card\" content=\"summary_large_image\">
  <meta name=\"twitter:title\" content=\"{escape(title)} by {escape(artist_name)}\">
  <meta name=\"twitter:description\" content=\"{escape(description)}\">
  <meta name=\"twitter:image\" content=\"{escape(image_url)}\">
  <meta http-equiv=\"refresh\" content=\"0; url={escape(canonical_url)}\">
</head>
<body>
  <p>Redirecting to <a href=\"{escape(canonical_url)}\">{escape(canonical_url)}</a>...</p>
  <script>window.location.replace({canonical_url!r});</script>
</body>
</html>
"""
    return HTMLResponse(content=html)


@router.put("/{artist_id}/portfolio/{item_id}", response_model=APIResponse)
async def update_portfolio_item(
    artist_id: str,
    item_id: str,
    update_data: PortfolioItemUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
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
    db: AsyncSession = Depends(get_db),
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


@router.post("/{artist_id}/contact", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_contact_message(
    artist_id: str,
    message_data: ContactMessageCreate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Artist).where(Artist.id == artist_id, Artist.is_active == True))
    artist = result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")

    sender_name = message_data.sender_name.strip()
    sender_email = message_data.sender_email.strip()
    message = message_data.message.strip()

    if not sender_name or not sender_email or not message:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Name, email, and message are required")

    contact_message = ContactMessage(
        artist_id=artist_id,
        sender_name=sender_name,
        sender_email=sender_email,
        message=message,
    )
    db.add(contact_message)
    await db.flush()
    await db.refresh(contact_message)

    return APIResponse(
        success=True,
        message="Message sent successfully",
        data=ContactMessageResponse.model_validate(contact_message).model_dump(),
    )


@router.post("/{artist_id}/messages", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_contact_message_alias(
    artist_id: str,
    message_data: ContactMessageCreate,
    db: AsyncSession = Depends(get_db),
):
    # Compatibility alias for frontend forms that post to /messages.
    return await create_contact_message(artist_id=artist_id, message_data=message_data, db=db)


@router.get("/{artist_id}/messages", response_model=PaginatedResponse)
async def get_contact_messages(
    artist_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    artist_result = await db.execute(select(Artist).where(Artist.id == artist_id))
    artist = artist_result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")

    if artist.user_id != current_user["sub"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    offset = (page - 1) * per_page
    count_result = await db.execute(
        select(func.count()).select_from(ContactMessage).where(ContactMessage.artist_id == artist_id)
    )
    total = count_result.scalar()

    message_result = await db.execute(
        select(ContactMessage)
        .where(ContactMessage.artist_id == artist_id)
        .order_by(ContactMessage.created_at.desc())
        .offset(offset)
        .limit(per_page)
    )
    messages = message_result.scalars().all()

    return PaginatedResponse(
        data=[ContactMessageResponse.model_validate(m).model_dump() for m in messages],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=(total + per_page - 1) // per_page if total > 0 else 0,
    )


# Admin routes
@router.put("/{artist_id}/verify", response_model=APIResponse)
async def verify_artist(
    artist_id: str,
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
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
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Artist).where(Artist.id == artist_id))
    artist = result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")

    artist.is_active = False
    await db.flush()

    return APIResponse(success=True, message="Artist suspended")
