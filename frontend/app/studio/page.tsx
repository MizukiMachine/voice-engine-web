'use client'

import { useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'

interface StudioSettings {
  systemPrompt: string
  voiceId: string
  speed: number
  silenceSensitivity: number
}

const defaultSettings: StudioSettings = {
  systemPrompt: 'あなたは親切なAIアシスタントです。ユーザーの質問に丁寧に答えてください。',
  voiceId: '11labs-echo',
  speed: 1.0,
  silenceSensitivity: 50,
}

const voiceOptions = [
  { id: '11labs-echo', name: 'Echo (男性・落ち着いた)' },
  { id: '11labs-nova', name: 'Nova (女性・明るい)' },
  { id: '11labs-shimmer', name: 'Shimmer (女性・柔らかい)' },
  { id: '11labs-onyx', name: 'Onyx (男性・深い)' },
]

export default function StudioPage() {
  const [settings, setSettings] = useState<StudioSettings>(defaultSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      // TODO: API呼び出し
      await new Promise(resolve => setTimeout(resolve, 500))
      setSaveMessage('設定を保存しました')
    } catch (error) {
      setSaveMessage('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    setSaveMessage('デフォルトに戻しました')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">スタジオ設定</h1>
        <p className="text-slate-400">AIアシスタントの振る舞いをカスタマイズ</p>
      </div>

      <div className="space-y-6">
        {/* System Prompt */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6">
          <label className="block text-white font-medium mb-2">
            システムプロンプト
          </label>
          <p className="text-slate-400 text-sm mb-3">
            AIのキャラクターや役割を設定します
          </p>
          <textarea
            value={settings.systemPrompt}
            onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="システムプロンプトを入力..."
          />
        </div>

        {/* Voice Selection */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6">
          <label className="block text-white font-medium mb-2">
            音声
          </label>
          <p className="text-slate-400 text-sm mb-3">
            AIの声を選択します
          </p>
          <select
            value={settings.voiceId}
            onChange={(e) => setSettings({ ...settings, voiceId: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {voiceOptions.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name}
              </option>
            ))}
          </select>
        </div>

        {/* Speed */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6">
          <label className="block text-white font-medium mb-2">
            話速: {settings.speed.toFixed(1)}x
          </label>
          <p className="text-slate-400 text-sm mb-3">
            AIの話す速さを調整します
          </p>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={settings.speed}
            onChange={(e) => setSettings({ ...settings, speed: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0.5x (ゆっくり)</span>
            <span>2.0x (速い)</span>
          </div>
        </div>

        {/* Silence Sensitivity */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6">
          <label className="block text-white font-medium mb-2">
            発話検知感度: {settings.silenceSensitivity}%
          </label>
          <p className="text-slate-400 text-sm mb-3">
            無音を検知してターン交代するタイミングを調整します
          </p>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.silenceSensitivity}
            onChange={(e) => setSettings({ ...settings, silenceSensitivity: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0% (鈍感)</span>
            <span>100% (敏感)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white rounded-lg font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSaving ? '保存中...' : '保存'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            リセット
          </button>
          {saveMessage && (
            <span className="text-sm text-primary-400">{saveMessage}</span>
          )}
        </div>
      </div>
    </div>
  )
}
