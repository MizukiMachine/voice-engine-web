import base64
from typing import Optional
from openai import AsyncOpenAI
from app.config import get_settings


class VisionService:
    """Service for image analysis using GPT-4 Vision"""

    def __init__(self):
        self.settings = get_settings()
        self.client = AsyncOpenAI(api_key=self.settings.openai_api_key)

    async def analyze_image(
        self,
        image_base64: str,
        prompt: str = "この画像に何が写っていますか？詳しく説明してください。",
        max_tokens: int = 500,
    ) -> dict:
        """Analyze an image using GPT-4 Vision"""
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}",
                                    "detail": "high",
                                },
                            },
                        ],
                    }
                ],
                max_tokens=max_tokens,
            )

            return {
                "description": response.choices[0].message.content,
                "tokens_used": response.usage.total_tokens if response.usage else None,
            }

        except Exception as e:
            return {
                "description": f"画像解析エラー: {str(e)}",
                "tokens_used": None,
            }

    async def analyze_for_vapi(
        self,
        image_base64: str,
        context: Optional[str] = None,
    ) -> str:
        """Analyze image and return description suitable for VAPI to speak"""
        prompt = "この画像を簡潔に説明してください。音声で読み上げることを想定して、自然な日本語で説明してください。"

        if context:
            prompt = f"{context}\n\n{prompt}"

        result = await self.analyze_image(image_base64, prompt, max_tokens=200)
        return result["description"]


vision_service = VisionService()
