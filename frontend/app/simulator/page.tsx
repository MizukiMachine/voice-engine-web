'use client'

import { useState } from 'react'
import { MapPin, Bell, Navigation, Send } from 'lucide-react'

interface GPSLocation {
  name: string
  latitude: number
  longitude: number
}

const presetLocations: GPSLocation[] = [
  { name: '自宅', latitude: 35.6812, longitude: 139.7671 },
  { name: 'オフィス', latitude: 35.6895, longitude: 139.6917 },
  { name: '東京駅', latitude: 35.6814, longitude: 139.7670 },
  { name: 'コンビニ', latitude: 35.6850, longitude: 139.7700 },
]

export default function SimulatorPage() {
  const [selectedLocation, setSelectedLocation] = useState<GPSLocation | null>(null)
  const [customLat, setCustomLat] = useState('')
  const [customLng, setCustomLng] = useState('')
  const [customName, setCustomName] = useState('')
  const [notification, setNotification] = useState({ title: '', body: '', appName: '' })
  const [eventLog, setEventLog] = useState<string[]>([])

  const handleArrival = () => {
    const location = selectedLocation || (customLat && customLng ? {
      name: customName || `(${customLat}, ${customLng})`,
      latitude: parseFloat(customLat),
      longitude: parseFloat(customLng),
    } : null)

    if (!location) return

    const message = `[GPS] ${location.name}に到着しました`
    setEventLog(prev => [message, ...prev])
    // TODO: VAPI連携でAIに通知
  }

  const handleNotification = () => {
    if (!notification.title && !notification.body) return

    const prefix = notification.appName ? `${notification.appName}から` : ''
    const message = `[通知] ${prefix}${notification.title}: ${notification.body}`
    setEventLog(prev => [message, ...prev])
    // TODO: VAPI連携でAIに読み上げさせる
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">体験シミュレータ</h1>
        <p className="text-slate-400">GPS/通知イベントをシミュレートしてAIの反応をテスト</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* GPS Simulator */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">GPS / ジオフェンス</h2>
              <p className="text-sm text-slate-400">位置情報トリガーをテスト</p>
            </div>
          </div>

          {/* Preset Locations */}
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-2">プリセット</label>
            <div className="grid grid-cols-2 gap-2">
              {presetLocations.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => setSelectedLocation(loc)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedLocation?.name === loc.name
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Location */}
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-2">カスタム座標</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="場所名"
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="number"
                value={customLat}
                onChange={(e) => { setCustomLat(e.target.value); setSelectedLocation(null) }}
                placeholder="緯度"
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="number"
                value={customLng}
                onChange={(e) => { setCustomLng(e.target.value); setSelectedLocation(null) }}
                placeholder="経度"
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <button
            onClick={handleArrival}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            <Navigation className="w-4 h-4" />
            到着
          </button>
        </div>

        {/* Push Notification Simulator */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Push通知</h2>
              <p className="text-sm text-slate-400">通知読み上げをテスト</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">アプリ名（任意）</label>
              <input
                type="text"
                value={notification.appName}
                onChange={(e) => setNotification({ ...notification, appName: e.target.value })}
                placeholder="LINE, Slack, Gmail..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">タイトル</label>
              <input
                type="text"
                value={notification.title}
                onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                placeholder="通知タイトル"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">本文</label>
              <textarea
                value={notification.body}
                onChange={(e) => setNotification({ ...notification, body: e.target.value })}
                placeholder="通知の本文"
                className="w-full h-20 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <button
              onClick={handleNotification}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              <Send className="w-4 h-4" />
              通知を受信
            </button>
          </div>
        </div>
      </div>

      {/* Event Log */}
      <div className="mt-6 bg-slate-800/50 backdrop-blur rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">イベントログ</h2>
        <div className="h-48 overflow-y-auto space-y-2">
          {eventLog.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              イベントをトリガーすると、ここにログが表示されます
            </p>
          ) : (
            eventLog.map((log, index) => (
              <p key={index} className="text-sm text-slate-300 font-mono">
                {new Date().toLocaleTimeString()} - {log}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
