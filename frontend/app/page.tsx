'use client'

import { useState } from 'react'
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react'

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [transcript, setTranscript] = useState<string[]>([])

  const handleConnect = () => {
    setIsConnected(!isConnected)
    if (!isConnected) {
      setTranscript(prev => [...prev, '[システム] 会話を開始しました'])
    } else {
      setTranscript(prev => [...prev, '[システム] 会話を終了しました'])
    }
  }

  const handleMute = () => {
    setIsMuted(!isMuted)
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
        <div className="flex flex-col items-center">
          {/* Status Indicator */}
          <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${
            isConnected
              ? 'bg-primary-500/20 ring-4 ring-primary-500 animate-pulse-slow'
              : 'bg-slate-700'
          }`}>
            {isConnected ? (
              <Mic className="w-16 h-16 text-primary-400" />
            ) : (
              <MicOff className="w-16 h-16 text-slate-500" />
            )}
          </div>

          {/* Status Text */}
          <p className={`text-lg mb-6 ${isConnected ? 'text-primary-400' : 'text-slate-400'}`}>
            {isConnected ? '会話中...' : '待機中'}
          </p>

          {/* Control Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleConnect}
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
                onClick={handleMute}
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
        </div>
      </div>

      {/* Transcript */}
      <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">会話ログ</h2>
        <div className="h-64 overflow-y-auto space-y-2">
          {transcript.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              会話を開始すると、ここにログが表示されます
            </p>
          ) : (
            transcript.map((line, index) => (
              <p key={index} className="text-slate-300 text-sm">
                {line}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
