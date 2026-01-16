'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Camera, X, Send, RotateCcw } from 'lucide-react'

interface CameraCaptureProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (imageBase64: string) => void
}

export function CameraCapture({ isOpen, onClose, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setError(null)
    } catch (err) {
      console.error('Camera error:', err)
      setError('カメラにアクセスできませんでした')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
      setCapturedImage(null)
    }

    return () => {
      stopCamera()
    }
  }, [isOpen, startCamera, stopCamera])

  const capture = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (video && canvas) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedImage(imageData)
      }
    }
  }, [])

  const retake = useCallback(() => {
    setCapturedImage(null)
  }, [])

  const sendImage = useCallback(() => {
    if (capturedImage) {
      // Remove data URL prefix
      const base64 = capturedImage.replace(/^data:image\/\w+;base64,/, '')
      onCapture(base64)
      onClose()
    }
  }, [capturedImage, onCapture, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl overflow-hidden max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">カメラキャプチャ</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {error ? (
            <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
              <p className="text-red-400">{error}</p>
            </div>
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full aspect-video object-cover rounded-lg"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-video object-cover rounded-lg bg-slate-900"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Actions */}
        <div className="flex gap-4 p-4 border-t border-slate-700">
          {capturedImage ? (
            <>
              <button
                onClick={retake}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                撮り直す
              </button>
              <button
                onClick={sendImage}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
              >
                <Send className="w-5 h-5" />
                AIに送信
              </button>
            </>
          ) : (
            <button
              onClick={capture}
              disabled={!stream}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              <Camera className="w-5 h-5" />
              撮影
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
