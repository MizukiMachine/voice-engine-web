'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Circle, Square, Download, X } from 'lucide-react'

interface AudioRecorderProps {
  isOpen: boolean
  onClose: () => void
  onRecordingComplete?: (audioBlob: Blob) => void
}

export function AudioRecorder({ isOpen, onClose, onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioURL(url)
        onRecordingComplete?.(blob)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setError(null)
      setDuration(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1)
      }, 1000)
    } catch (err) {
      console.error('Recording error:', err)
      setError('マイクにアクセスできませんでした')
    }
  }, [onRecordingComplete])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording])

  const resetRecording = useCallback(() => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL)
    }
    setAudioURL(null)
    setDuration(0)
  }, [audioURL])

  const downloadRecording = useCallback(() => {
    if (audioURL) {
      const a = document.createElement('a')
      a.href = audioURL
      a.download = `recording-${new Date().toISOString()}.webm`
      a.click()
    }
  }, [audioURL])

  useEffect(() => {
    if (!isOpen) {
      stopRecording()
      resetRecording()
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isOpen, stopRecording, resetRecording])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl overflow-hidden max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">音声録音</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center">
          {error ? (
            <p className="text-red-400 mb-4">{error}</p>
          ) : (
            <>
              {/* Recording indicator */}
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all ${
                  isRecording
                    ? 'bg-red-500/20 ring-4 ring-red-500 animate-pulse'
                    : audioURL
                    ? 'bg-green-500/20 ring-4 ring-green-500'
                    : 'bg-slate-700'
                }`}
              >
                {isRecording ? (
                  <Circle className="w-12 h-12 text-red-500 fill-current" />
                ) : audioURL ? (
                  <span className="text-2xl">✓</span>
                ) : (
                  <Circle className="w-12 h-12 text-slate-500" />
                )}
              </div>

              {/* Duration */}
              <p className="text-3xl font-mono text-white mb-6">{formatDuration(duration)}</p>

              {/* Audio player */}
              {audioURL && (
                <audio controls src={audioURL} className="w-full mb-6" />
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 p-4 border-t border-slate-700">
          {audioURL ? (
            <>
              <button
                onClick={resetRecording}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                <Circle className="w-5 h-5" />
                新規録音
              </button>
              <button
                onClick={downloadRecording}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
              >
                <Download className="w-5 h-5" />
                保存
              </button>
            </>
          ) : (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-primary-500 hover:bg-primary-600 text-white'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="w-5 h-5" />
                  停止
                </>
              ) : (
                <>
                  <Circle className="w-5 h-5 text-red-400" />
                  録音開始
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
