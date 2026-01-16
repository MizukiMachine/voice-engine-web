import httpx
from typing import Optional, Dict, Any
from app.config import get_settings


class VAPIService:
    """Service for interacting with VAPI API"""

    BASE_URL = "https://api.vapi.ai"

    def __init__(self):
        self.settings = get_settings()
        self.api_key = self.settings.vapi_api_key

    def _get_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    async def create_assistant(
        self,
        name: str,
        system_prompt: str,
        voice_id: str = "11labs-echo",
        model: str = "gpt-4o",
    ) -> Dict[str, Any]:
        """Create a new VAPI assistant"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/assistant",
                headers=self._get_headers(),
                json={
                    "name": name,
                    "model": {
                        "provider": "openai",
                        "model": model,
                        "systemPrompt": system_prompt,
                    },
                    "voice": {
                        "provider": "11labs",
                        "voiceId": voice_id,
                    },
                    "firstMessage": "こんにちは！何かお手伝いできることはありますか？",
                },
            )
            response.raise_for_status()
            return response.json()

    async def update_assistant(
        self,
        assistant_id: str,
        system_prompt: Optional[str] = None,
        voice_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Update an existing VAPI assistant"""
        update_data = {}

        if system_prompt:
            update_data["model"] = {"systemPrompt": system_prompt}

        if voice_id:
            update_data["voice"] = {"voiceId": voice_id}

        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{self.BASE_URL}/assistant/{assistant_id}",
                headers=self._get_headers(),
                json=update_data,
            )
            response.raise_for_status()
            return response.json()

    async def get_assistant(self, assistant_id: str) -> Dict[str, Any]:
        """Get assistant details"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/assistant/{assistant_id}",
                headers=self._get_headers(),
            )
            response.raise_for_status()
            return response.json()

    async def list_assistants(self) -> list:
        """List all assistants"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/assistant",
                headers=self._get_headers(),
            )
            response.raise_for_status()
            return response.json()

    async def delete_assistant(self, assistant_id: str) -> bool:
        """Delete an assistant"""
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{self.BASE_URL}/assistant/{assistant_id}",
                headers=self._get_headers(),
            )
            response.raise_for_status()
            return True


vapi_service = VAPIService()
