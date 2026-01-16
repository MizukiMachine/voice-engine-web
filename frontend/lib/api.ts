const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface FetchOptions extends RequestInit {
  params?: Record<string, string>
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options

    let url = `${this.baseUrl}${endpoint}`
    if (params) {
      const searchParams = new URLSearchParams(params)
      url += `?${searchParams.toString()}`
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Settings API
  async getSettings(userId: string) {
    return this.request(`/api/settings/${userId}`)
  }

  async updateSettings(userId: string, settings: {
    systemPrompt?: string
    voiceId?: string
    speed?: number
    silenceSensitivity?: number
  }) {
    return this.request(`/api/settings/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }

  // Memory API
  async getMemories(userId: string, category?: string) {
    const params: Record<string, string> = {}
    if (category) params.category = category
    return this.request(`/api/memory/${userId}`, { params })
  }

  async createMemory(userId: string, memory: {
    content: string
    category: 'profile' | 'preference' | 'context'
  }) {
    return this.request(`/api/memory/${userId}`, {
      method: 'POST',
      body: JSON.stringify(memory),
    })
  }

  async deleteMemory(userId: string, memoryId: string) {
    return this.request(`/api/memory/${userId}/${memoryId}`, {
      method: 'DELETE',
    })
  }

  async searchMemories(userId: string, query: string) {
    return this.request(`/api/memory/${userId}/search`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    })
  }

  async getContextForConversation(userId: string) {
    return this.request<{ context: string }>(`/api/memory/${userId}/context`)
  }

  // Simulation API
  async triggerGeofence(location: {
    latitude: number
    longitude: number
    name?: string
  }, eventType: 'arrival' | 'departure' = 'arrival') {
    return this.request('/api/simulation/geofence/trigger', {
      method: 'POST',
      body: JSON.stringify({
        location,
        event_type: eventType,
      }),
    })
  }

  async receiveNotification(notification: {
    title: string
    body: string
    appName?: string
  }) {
    return this.request('/api/simulation/notification/receive', {
      method: 'POST',
      body: JSON.stringify({
        title: notification.title,
        body: notification.body,
        app_name: notification.appName,
      }),
    })
  }

  // Vision API
  async analyzeImage(imageBase64: string, prompt?: string) {
    return this.request('/api/vision/analyze', {
      method: 'POST',
      body: JSON.stringify({
        image_base64: imageBase64,
        prompt,
      }),
    })
  }

  async captureAndAnalyze(imageBase64: string) {
    return this.request('/api/vision/capture', {
      method: 'POST',
      body: JSON.stringify({
        image_base64: imageBase64,
      }),
    })
  }

  // Google API
  async getGoogleAuthUrl() {
    return this.request<{ auth_url: string }>('/api/google/auth/url')
  }

  async getGoogleAuthStatus() {
    return this.request<{ authenticated: boolean }>('/api/google/auth/status')
  }

  async getCalendarEvents(startDate?: string, endDate?: string) {
    const params: Record<string, string> = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate
    return this.request('/api/google/calendar/events', { params })
  }

  async createCalendarEvent(event: {
    summary: string
    startTime: string
    endTime: string
    description?: string
    location?: string
  }) {
    return this.request('/api/google/calendar/events', {
      method: 'POST',
      body: JSON.stringify({
        summary: event.summary,
        start_time: event.startTime,
        end_time: event.endTime,
        description: event.description,
        location: event.location,
      }),
    })
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string }>('/health')
  }
}

export const api = new ApiClient(API_URL)
