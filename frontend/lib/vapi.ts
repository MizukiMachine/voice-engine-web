import Vapi from '@vapi-ai/web'

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || ''

export interface VapiConfig {
  assistantId?: string
  systemPrompt?: string
  voiceId?: string
  onSpeechStart?: () => void
  onSpeechEnd?: () => void
  onCallStart?: () => void
  onCallEnd?: () => void
  onMessage?: (message: any) => void
  onError?: (error: any) => void
}

class VapiClient {
  private vapi: Vapi | null = null
  private config: VapiConfig = {}

  initialize(config: VapiConfig = {}) {
    this.config = config

    if (!VAPI_PUBLIC_KEY) {
      console.warn('VAPI_PUBLIC_KEY is not set')
      return
    }

    this.vapi = new Vapi(VAPI_PUBLIC_KEY)

    // Set up event listeners
    this.vapi.on('speech-start', () => {
      this.config.onSpeechStart?.()
    })

    this.vapi.on('speech-end', () => {
      this.config.onSpeechEnd?.()
    })

    this.vapi.on('call-start', () => {
      this.config.onCallStart?.()
    })

    this.vapi.on('call-end', () => {
      this.config.onCallEnd?.()
    })

    this.vapi.on('message', (message) => {
      this.config.onMessage?.(message)
    })

    this.vapi.on('error', (error) => {
      this.config.onError?.(error)
    })
  }

  async startCall(options?: {
    assistantId?: string
    assistantOverrides?: {
      systemPrompt?: string
      voiceId?: string
    }
  }) {
    if (!this.vapi) {
      throw new Error('VAPI not initialized')
    }

    const assistantId = options?.assistantId || this.config.assistantId

    if (assistantId) {
      // Start with existing assistant
      await this.vapi.start(assistantId, options?.assistantOverrides)
    } else {
      // Start with inline assistant config
      await this.vapi.start({
        model: {
          provider: 'openai',
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: options?.assistantOverrides?.systemPrompt ||
                this.config.systemPrompt ||
                'あなたは親切なAIアシスタントです。ユーザーの質問に丁寧に答えてください。',
            },
          ],
        },
        voice: {
          provider: '11labs',
          voiceId: options?.assistantOverrides?.voiceId ||
            this.config.voiceId ||
            'echo',
        },
        firstMessage: 'こんにちは！何かお手伝いできることはありますか？',
      })
    }
  }

  async stopCall() {
    if (!this.vapi) {
      throw new Error('VAPI not initialized')
    }
    this.vapi.stop()
  }

  setMuted(muted: boolean) {
    if (!this.vapi) {
      throw new Error('VAPI not initialized')
    }
    this.vapi.setMuted(muted)
  }

  isMuted(): boolean {
    if (!this.vapi) {
      return false
    }
    return this.vapi.isMuted()
  }

  // Send a message to inject into the conversation
  send(message: {
    type: 'add-message'
    message: {
      role: 'system' | 'user' | 'assistant'
      content: string
    }
  }) {
    if (!this.vapi) {
      throw new Error('VAPI not initialized')
    }
    this.vapi.send(message)
  }

  // Inject context (e.g., from memory or geofence trigger)
  injectContext(context: string) {
    this.send({
      type: 'add-message',
      message: {
        role: 'system',
        content: context,
      },
    })
  }

  // Trigger notification read
  triggerNotificationRead(notification: {
    appName?: string
    title: string
    body: string
  }) {
    const prefix = notification.appName ? `${notification.appName}から通知: ` : '通知: '
    const content = `【割り込み通知】${prefix}${notification.title}。${notification.body}`

    this.send({
      type: 'add-message',
      message: {
        role: 'system',
        content,
      },
    })
  }

  // Trigger geofence event
  triggerGeofenceEvent(location: string, eventType: 'arrival' | 'departure') {
    const action = eventType === 'arrival' ? '到着' : '出発'
    const content = `【位置情報】ユーザーが${location}に${action}しました。適切に対応してください。`

    this.send({
      type: 'add-message',
      message: {
        role: 'system',
        content,
      },
    })
  }

  destroy() {
    if (this.vapi) {
      this.vapi.stop()
      this.vapi = null
    }
  }
}

export const vapiClient = new VapiClient()
