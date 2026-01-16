'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Vapi from '@vapi-ai/web'

interface UseVapiOptions {
  assistantId?: string
  systemPrompt?: string
  voiceId?: string
  onMessage?: (message: any) => void
  onError?: (error: any) => void
}

export function useVapi(options: UseVapiOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)

  const vapiRef = useRef<Vapi | null>(null)
  const optionsRef = useRef(options)

  // Keep options ref up to date
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  // Initialize VAPI
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY

    if (!publicKey) {
      console.warn('NEXT_PUBLIC_VAPI_PUBLIC_KEY is not set')
      return
    }

    const vapi = new Vapi(publicKey)
    vapiRef.current = vapi

    // Event handlers
    vapi.on('call-start', () => {
      setIsConnected(true)
      setIsListening(true)
    })

    vapi.on('call-end', () => {
      setIsConnected(false)
      setIsSpeaking(false)
      setIsListening(false)
      setIsMuted(false)
      setVolumeLevel(0)
    })

    vapi.on('speech-start', () => {
      setIsSpeaking(true)
      setIsListening(false)
    })

    vapi.on('speech-end', () => {
      setIsSpeaking(false)
      setIsListening(true)
    })

    vapi.on('volume-level', (level: number) => {
      setVolumeLevel(level)
    })

    vapi.on('message', (message: any) => {
      optionsRef.current.onMessage?.(message)
    })

    vapi.on('error', (error: any) => {
      console.error('VAPI Error:', error)
      optionsRef.current.onError?.(error)
    })

    return () => {
      vapi.stop()
      vapiRef.current = null
    }
  }, [])

  const connect = useCallback(async () => {
    const vapi = vapiRef.current
    if (!vapi) {
      console.error('VAPI not initialized')
      return
    }

    try {
      const { assistantId, systemPrompt, voiceId } = optionsRef.current

      if (assistantId) {
        // Use existing assistant
        await vapi.start(assistantId)
      } else {
        // Create inline assistant
        await vapi.start({
          model: {
            provider: 'openai',
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: systemPrompt || `あなたは親切なAIアシスタントです。
ユーザーの質問に丁寧に日本語で答えてください。

【特殊コマンド】
- ユーザーが「撮影して」「写真撮って」と言ったら、カメラ機能が起動することを伝えてください。
- ユーザーが「録音して」「録音開始」と言ったら、録音機能が起動することを伝えてください。

自然な会話を心がけ、簡潔に応答してください。`,
              },
            ],
          },
          voice: {
            provider: '11labs',
            voiceId: voiceId || 'pFZP5JQG7iQjIQuC4Bku', // Lily voice
          },
          firstMessage: 'こんにちは！何かお手伝いできることはありますか？',
          transcriber: {
            provider: 'deepgram',
            model: 'nova-2',
            language: 'ja',
          },
        })
      }
    } catch (error) {
      console.error('Failed to connect:', error)
      optionsRef.current.onError?.(error)
    }
  }, [])

  const disconnect = useCallback(() => {
    const vapi = vapiRef.current
    if (vapi) {
      vapi.stop()
    }
  }, [])

  const toggleMute = useCallback(() => {
    const vapi = vapiRef.current
    if (vapi) {
      const newMuted = !isMuted
      vapi.setMuted(newMuted)
      setIsMuted(newMuted)
    }
  }, [isMuted])

  const send = useCallback((message: any) => {
    const vapi = vapiRef.current
    if (vapi && isConnected) {
      vapi.send(message)
    }
  }, [isConnected])

  const injectContext = useCallback((context: string) => {
    send({
      type: 'add-message',
      message: {
        role: 'system',
        content: context,
      },
    })
  }, [send])

  return {
    isConnected,
    isSpeaking,
    isListening,
    isMuted,
    volumeLevel,
    connect,
    disconnect,
    toggleMute,
    send,
    injectContext,
  }
}
