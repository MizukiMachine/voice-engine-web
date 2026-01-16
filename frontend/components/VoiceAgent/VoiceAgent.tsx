'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Mic, MicOff, Phone, PhoneOff, Camera, Circle, Volume2 } from 'lucide-react'
import { useVapi } from './useVapi'

interface VoiceAgentProps {
  assistantId?: string
  systemPrompt?: string
  voiceId?: string
  onTranscript?: (message: { role: string; content: string }) => void
  onHotword?: (command: 'capture' | 'record') => void
}

export function VoiceAgent({
  assistantId,
  systemPrompt,
  voiceId,
  onTranscript,
  onHotword,
}: VoiceAgentProps) {
  const {
    isConnected,
    isSpeaking,
    isListening,
    isMuted,
    connect,
    disconnect,
    toggleMute,
    volumeLevel,
  } = useVapi({
    assistantId,
    systemPrompt,
    voiceId,
    onMessage: (message) => {
      // Handle transcripts
      if (message.type === 'transcript') {
        onTranscript?.({
          role: message.role,
          content: message.transcript,
        })

        // Hotword detection
        if (message.role === 'user') {
          const text = message.transcript.toLowerCase()
          if (text.includes('撮影して') || text.includes('写真撮って') || text.includes('カメラ')) {
            onHotword?.('capture')
          } else if (text.includes('録音して') || text.includes('録音開始') || text.includes('録音停止')) {
            onHotword?.('record')
          }
        }
      }
    },
  })

  return (
    <div className="flex flex-col items-center">
      {/* Status Indicator */}
      <div className="relative">
        <div
          className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
            isConnected
              ? isSpeaking
                ? 'bg-green-500/20 ring-4 ring-green-500'
                : isListening
                ? 'bg-primary-500/20 ring-4 ring-primary-500 animate-pulse'
                : 'bg-yellow-500/20 ring-4 ring-yellow-500'
              : 'bg-slate-700'
          }`}
        >
          {isConnected ? (
            isSpeaking ? (
              <Volume2 className="w-16 h-16 text-green-400 animate-pulse" />
            ) : (
              <Mic className={`w-16 h-16 ${isListening ? 'text-primary-400' : 'text-yellow-400'}`} />
            )
          ) : (
            <MicOff className="w-16 h-16 text-slate-500" />
          )}
        </div>

        {/* Volume Level Indicator */}
        {isConnected && isListening && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-4 rounded-full transition-all ${
                    volumeLevel > i * 0.2 ? 'bg-primary-500' : 'bg-slate-600'
                  }`}
                  style={{
                    height: `${8 + (volumeLevel > i * 0.2 ? volumeLevel * 16 : 0)}px`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Text */}
      <p className={`text-lg mt-6 mb-6 ${
        isConnected
          ? isSpeaking
            ? 'text-green-400'
            : isListening
            ? 'text-primary-400'
            : 'text-yellow-400'
          : 'text-slate-400'
      }`}>
        {isConnected
          ? isSpeaking
            ? 'AIが話しています...'
            : isListening
            ? '聞いています...'
            : '処理中...'
          : '待機中'}
      </p>

      {/* Control Buttons */}
      <div className="flex gap-4">
        <button
          onClick={isConnected ? disconnect : connect}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
            isConnected
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}
        >
          {isConnected ? (
            <>
              <PhoneOff className="w-5 h-5" />
              会話終了
            </>
          ) : (
            <>
              <Phone className="w-5 h-5" />
              会話開始
            </>
          )}
        </button>

        {isConnected && (
          <button
            onClick={toggleMute}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
              isMuted
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-slate-600 hover:bg-slate-500 text-white'
            }`}
          >
            {isMuted ? (
              <>
                <MicOff className="w-5 h-5" />
                ミュート中
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                ミュート
              </>
            )}
          </button>
        )}
      </div>

      {/* Hotword Hints */}
      {isConnected && (
        <div className="mt-8 flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg text-sm text-slate-400">
            <Camera className="w-4 h-4" />
            「撮影して」
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg text-sm text-slate-400">
            <Circle className="w-4 h-4 text-red-400" />
            「録音して」
          </div>
        </div>
      )}
    </div>
  )
}
