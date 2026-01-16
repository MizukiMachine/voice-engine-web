from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum

router = APIRouter()


class MemoryCategory(str, Enum):
    PROFILE = "profile"
    PREFERENCE = "preference"
    CONTEXT = "context"


class MemoryBase(BaseModel):
    content: str
    category: MemoryCategory


class MemoryCreate(MemoryBase):
    pass


class MemoryResponse(MemoryBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# In-memory storage for development (will be replaced with Supabase + Vector search)
memory_store: dict = {}  # {user_id: [memories]}


@router.get("/{user_id}", response_model=List[MemoryResponse])
async def get_memories(
    user_id: UUID,
    category: Optional[MemoryCategory] = None,
    limit: int = Query(default=50, le=100),
):
    """Get memories for a user, optionally filtered by category"""
    user_memories = memory_store.get(str(user_id), [])

    if category:
        user_memories = [m for m in user_memories if m.category == category]

    return user_memories[:limit]


@router.post("/{user_id}", response_model=MemoryResponse)
async def create_memory(user_id: UUID, memory: MemoryCreate):
    """Create a new memory for a user"""
    new_memory = MemoryResponse(
        id=uuid4(),
        user_id=user_id,
        content=memory.content,
        category=memory.category,
        created_at=datetime.now(),
    )

    if str(user_id) not in memory_store:
        memory_store[str(user_id)] = []

    memory_store[str(user_id)].append(new_memory)
    return new_memory


@router.delete("/{user_id}/{memory_id}")
async def delete_memory(user_id: UUID, memory_id: UUID):
    """Delete a specific memory"""
    user_memories = memory_store.get(str(user_id), [])
    for i, m in enumerate(user_memories):
        if m.id == memory_id:
            del user_memories[i]
            return {"message": "Memory deleted successfully"}

    raise HTTPException(status_code=404, detail="Memory not found")


@router.post("/{user_id}/search")
async def search_memories(
    user_id: UUID,
    query: str,
    limit: int = Query(default=5, le=20),
):
    """Search memories using vector similarity (placeholder for Supabase implementation)"""
    # TODO: Implement vector search with OpenAI embeddings + Supabase
    user_memories = memory_store.get(str(user_id), [])

    # Simple text search for now
    results = [m for m in user_memories if query.lower() in m.content.lower()]

    return results[:limit]


@router.get("/{user_id}/context")
async def get_context_for_conversation(user_id: UUID):
    """Get relevant context for AI conversation"""
    user_memories = memory_store.get(str(user_id), [])

    # Organize by category
    profile = [m for m in user_memories if m.category == MemoryCategory.PROFILE]
    preferences = [m for m in user_memories if m.category == MemoryCategory.PREFERENCE]
    context = [m for m in user_memories if m.category == MemoryCategory.CONTEXT]

    # Build context string for AI
    context_parts = []

    if profile:
        context_parts.append("【ユーザープロフィール】")
        context_parts.extend([m.content for m in profile[:5]])

    if preferences:
        context_parts.append("\n【好み・設定】")
        context_parts.extend([m.content for m in preferences[:5]])

    if context:
        context_parts.append("\n【過去の文脈】")
        context_parts.extend([m.content for m in context[:10]])

    return {"context": "\n".join(context_parts)}
