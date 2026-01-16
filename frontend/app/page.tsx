'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { VoiceAgent } from '@/components/VoiceAgent'
import { CameraCapture } from '@/components/VoiceAgent/CameraCapture'
import { AudioRecorder } from '@/components/VoiceAgent/AudioRecorder'
import { api } from '@/lib/api'

interface TranscriptMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

export default function Home() {
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([])
  const [showCamera, setShowCamera] = useState(false)
  const [showRecorder, setShowRecorder] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript])

  const handleTranscript = useCallback((message: { role: string; content: string }) => {
    setTranscript(prev => [
      ...prev,
      {
        role: message.role as 'user' | 'assistant',
        content: message.content,
        timestamp: new Date(),
      },
    ])
  }, [])

  const handleHotword = useCallback((command: 'capture' | 'record') => {
    if (command === 'capture') {
      setShowCamera(true)
      setTranscript(prev => [
        ...prev,
        {
          role: 'system',
          content: '📷 カメラを起動しました',
          timestamp: new Date(),
        },
      ])
    } else if (command === 'record') {
      setShowRecorder(true)
      setTranscript(prev => [
        ...prev,
        {
          role: 'system',
          content: '🎤 録音機能を起動しました',
          timestamp: new Date(),
        },
      ])
    }
  }, [])

  const handleCameraCapture = useCallback(async (imageBase64: string) => {
    setIsAnalyzing(true)
    setTranscript(prev => [
      ...prev,
      {
        role: 'system',
        content: '🔍 画像を解析中...',
        timestamp: new Date(),
      },
    ])

    try {
      const result = await api.analyzeImage(imageBase64)
      setTranscript(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `📷 ${(result as any).description}`,
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      setTranscript(prev => [
        ...prev,
        {
          role: 'system',
          content: '❌ 画像解析に失敗しました',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const handleRecordingComplete = useCallback((audioBlob: Blob) => {
    setTranscript(prev => [
      ...prev,
      {
        role: 'system',
        content: `🎤 録音完了 (${(audioBlob.size / 1024).toFixed(1)} KB)`,
        timestamp: new Date(),
      },
    ])
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  }

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'user':
        return 'bg-primary-500/10 border-l-4 border-primary-500'
      case 'assistant':
        return 'bg-green-500/10 border-l-4 border-green-500'
      case 'system':
        return 'bg-slate-700/50 border-l-4 border-slate-500'
      default:
        return ''
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'user':
        return 'あなた'
      case 'assistant':
        return 'AI'
      case 'system':
        return 'システム'
      default:
        return ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Voice Engine Studio
        </h1>
        <p className="text-slate-400">
          AI音声エージェント プロトタイプ
        </p>
      </div>

      {/* Voice Agent UI */}
      <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 mb-8">
        <VoiceAgent
          onTranscript={handleTranscript}
          onHotword={handleHotword}
        />
      </div>

      {/* Transcript */}
      <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">会話ログ</h2>
        <div className="h-80 overflow-y-auto space-y-3">
          {transcript.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              会話を開始すると、ここにログが表示されます
            </p>
          ) : (
            transcript.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${getRoleStyle(message.role)}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium ${
                    message.role === 'user'
                      ? 'text-primary-400'
                      : message.role === 'assistant'
                      ? 'text-green-400'
                      : 'text-slate-400'
                  }`}>
                    {getRoleLabel(message.role)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <p className="text-slate-200 text-sm">{message.content}</p>
              </div>
            ))
          )}
          <div ref={transcriptEndRef} />
        </div>
      </div>

      {/* API Key Warning */}
      {!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY && (
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-sm">
            ⚠️ VAPI Public Keyが設定されていません。.envファイルにNEXT_PUBLIC_VAPI_PUBLIC_KEYを設定してください。
          </p>
        </div>
      )}

      {/* Camera Modal */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
      />

      {/* Audio Recorder Modal */}
      <AudioRecorder
        isOpen={showRecorder}
        onClose={() => setShowRecorder(false)}
        onRecordingComplete={handleRecordingComplete}
      />
    </div>
  )
}
