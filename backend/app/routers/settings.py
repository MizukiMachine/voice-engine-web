from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

router = APIRouter()


class StudioSettingsBase(BaseModel):
    system_prompt: Optional[str] = None
    voice_id: Optional[str] = None
    speed: Optional[float] = 1.0
    silence_sensitivity: Optional[int] = 50


class StudioSettingsCreate(StudioSettingsBase):
    pass


class StudioSettingsUpdate(StudioSettingsBase):
    pass


class StudioSettingsResponse(StudioSettingsBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# In-memory storage for development (will be replaced with Supabase)
settings_store: dict = {}


@router.get("/{user_id}", response_model=StudioSettingsResponse)
async def get_settings(user_id: UUID):
    """Get studio settings for a user"""
    if str(user_id) not in settings_store:
        # Return default settings
        return StudioSettingsResponse(
            id=user_id,
            user_id=user_id,
            system_prompt="あなたは親切なAIアシスタントです。",
            voice_id="default",
            speed=1.0,
            silence_sensitivity=50,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
    return settings_store[str(user_id)]


@router.post("/{user_id}", response_model=StudioSettingsResponse)
async def create_settings(user_id: UUID, settings: StudioSettingsCreate):
    """Create studio settings for a user"""
    now = datetime.now()
    new_settings = StudioSettingsResponse(
        id=user_id,
        user_id=user_id,
        **settings.model_dump(),
        created_at=now,
        updated_at=now,
    )
    settings_store[str(user_id)] = new_settings
    return new_settings


@router.put("/{user_id}", response_model=StudioSettingsResponse)
async def update_settings(user_id: UUID, settings: StudioSettingsUpdate):
    """Update studio settings for a user"""
    existing = settings_store.get(str(user_id))
    now = datetime.now()

    if existing:
        updated = existing.model_copy(
            update={**settings.model_dump(exclude_unset=True), "updated_at": now}
        )
        settings_store[str(user_id)] = updated
        return updated
    else:
        # Create new if not exists
        new_settings = StudioSettingsResponse(
            id=user_id,
            user_id=user_id,
            **settings.model_dump(),
            created_at=now,
            updated_at=now,
        )
        settings_store[str(user_id)] = new_settings
        return new_settings


@router.delete("/{user_id}")
async def delete_settings(user_id: UUID):
    """Delete studio settings for a user"""
    if str(user_id) in settings_store:
        del settings_store[str(user_id)]
        return {"message": "Settings deleted successfully"}
    raise HTTPException(status_code=404, detail="Settings not found")
