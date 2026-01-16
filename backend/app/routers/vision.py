from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional
import base64
from datetime import datetime

router = APIRouter()


class ImageAnalysisRequest(BaseModel):
    image_base64: str
    prompt: Optional[str] = "この画像に何が写っていますか？"


class ImageAnalysisResponse(BaseModel):
    description: str
    timestamp: datetime
    tokens_used: Optional[int] = None


class CaptureResponse(BaseModel):
    success: bool
    message: str
    analysis: Optional[ImageAnalysisResponse] = None


@router.post("/analyze", response_model=ImageAnalysisResponse)
async def analyze_image(request: ImageAnalysisRequest):
    """Analyze an image using GPT-4 Vision"""
    # TODO: Implement with OpenAI GPT-4 Vision API
    # For now, return a placeholder response
    return ImageAnalysisResponse(
        description="画像解析機能は実装予定です。OpenAI GPT-4 Vision APIを使用します。",
        timestamp=datetime.now(),
        tokens_used=0,
    )


@router.post("/analyze/upload", response_model=ImageAnalysisResponse)
async def analyze_uploaded_image(
    file: UploadFile = File(...),
    prompt: str = "この画像に何が写っていますか？",
):
    """Analyze an uploaded image file"""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Read and encode the image
    contents = await file.read()
    image_base64 = base64.b64encode(contents).decode("utf-8")

    # TODO: Implement with OpenAI GPT-4 Vision API
    return ImageAnalysisResponse(
        description=f"アップロードされた画像 ({file.filename}) の解析機能は実装予定です。",
        timestamp=datetime.now(),
        tokens_used=0,
    )


@router.post("/capture", response_model=CaptureResponse)
async def process_camera_capture(request: ImageAnalysisRequest):
    """Process a camera capture from the frontend (triggered by 'capture' hotword)"""
    # TODO: Implement with OpenAI GPT-4 Vision API

    # This endpoint is called when user says "撮影して"
    return CaptureResponse(
        success=True,
        message="カメラキャプチャを受信しました",
        analysis=ImageAnalysisResponse(
            description="カメラキャプチャの解析機能は実装予定です。",
            timestamp=datetime.now(),
            tokens_used=0,
        ),
    )
