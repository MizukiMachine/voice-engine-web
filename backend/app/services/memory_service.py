from typing import List, Optional
from openai import AsyncOpenAI
from app.config import get_settings


class MemoryService:
    """Service for managing long-term memory with vector embeddings"""

    def __init__(self):
        self.settings = get_settings()
        self.client = AsyncOpenAI(api_key=self.settings.openai_api_key)

    async def create_embedding(self, text: str) -> List[float]:
        """Create an embedding vector for text using OpenAI"""
        try:
            response = await self.client.embeddings.create(
                model="text-embedding-3-small",
                input=text,
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Embedding creation error: {e}")
            return []

    async def extract_memory_from_conversation(
        self,
        conversation: str,
        existing_memories: Optional[List[str]] = None,
    ) -> List[dict]:
        """Extract memorable information from conversation using GPT-4"""
        existing_context = ""
        if existing_memories:
            existing_context = f"\n既存のメモリ:\n" + "\n".join(
                [f"- {m}" for m in existing_memories[:10]]
            )

        prompt = f"""以下の会話から、長期的に記憶すべき重要な情報を抽出してください。
以下のカテゴリに分類してください：
- profile: ユーザーの基本情報（名前、職業、家族構成など）
- preference: ユーザーの好み（食べ物、趣味、嫌いなものなど）
- context: 重要な文脈情報（予定、プロジェクト、目標など）

重複を避け、新しい情報のみを抽出してください。
{existing_context}

会話:
{conversation}

JSON形式で出力してください:
[{{"content": "記憶内容", "category": "カテゴリ"}}]
"""

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
            )

            import json

            result = json.loads(response.choices[0].message.content)
            return result.get("memories", result) if isinstance(result, dict) else result

        except Exception as e:
            print(f"Memory extraction error: {e}")
            return []

    def build_context_prompt(
        self,
        memories: List[dict],
        max_length: int = 1000,
    ) -> str:
        """Build a context prompt from memories for VAPI"""
        if not memories:
            return ""

        context_parts = []

        # Group by category
        profiles = [m for m in memories if m.get("category") == "profile"]
        preferences = [m for m in memories if m.get("category") == "preference"]
        contexts = [m for m in memories if m.get("category") == "context"]

        if profiles:
            context_parts.append("【ユーザー情報】")
            context_parts.extend([m.get("content", "") for m in profiles[:5]])

        if preferences:
            context_parts.append("\n【好み】")
            context_parts.extend([m.get("content", "") for m in preferences[:5]])

        if contexts:
            context_parts.append("\n【文脈】")
            context_parts.extend([m.get("content", "") for m in contexts[:5]])

        full_context = "\n".join(context_parts)

        # Truncate if too long
        if len(full_context) > max_length:
            full_context = full_context[:max_length] + "..."

        return full_context


memory_service = MemoryService()
