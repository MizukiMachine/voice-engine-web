'use client'

import { useState } from 'react'
import { Plus, Trash2, Search, User, Heart, MessageSquare } from 'lucide-react'

type MemoryCategory = 'profile' | 'preference' | 'context'

interface Memory {
  id: string
  content: string
  category: MemoryCategory
  createdAt: string
}

const categoryConfig = {
  profile: { label: 'プロフィール', icon: User, color: 'bg-blue-500' },
  preference: { label: '好み', icon: Heart, color: 'bg-pink-500' },
  context: { label: '文脈', icon: MessageSquare, color: 'bg-green-500' },
}

// サンプルデータ
const sampleMemories: Memory[] = [
  { id: '1', content: '名前は田中太郎', category: 'profile', createdAt: '2024-01-15' },
  { id: '2', content: 'コーヒーが好き', category: 'preference', createdAt: '2024-01-15' },
  { id: '3', content: '来週の会議の準備中', category: 'context', createdAt: '2024-01-16' },
]

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>(sampleMemories)
  const [newMemory, setNewMemory] = useState('')
  const [newCategory, setNewCategory] = useState<MemoryCategory>('profile')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<MemoryCategory | 'all'>('all')

  const handleAdd = () => {
    if (!newMemory.trim()) return

    const memory: Memory = {
      id: Date.now().toString(),
      content: newMemory.trim(),
      category: newCategory,
      createdAt: new Date().toISOString().split('T')[0],
    }

    setMemories([memory, ...memories])
    setNewMemory('')
  }

  const handleDelete = (id: string) => {
    setMemories(memories.filter(m => m.id !== id))
  }

  const filteredMemories = memories.filter(m => {
    const matchesSearch = m.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || m.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">メモリ管理</h1>
        <p className="text-slate-400">AIが記憶する情報を管理します</p>
      </div>

      {/* Add Memory */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">新しいメモリを追加</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            placeholder="記憶させたい情報を入力..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {Object.entries(categoryConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            追加
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="メモリを検索..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as MemoryCategory | 'all')}
          className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">すべて</option>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Memory List */}
      <div className="space-y-3">
        {filteredMemories.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-8 text-center">
            <p className="text-slate-400">メモリがありません</p>
          </div>
        ) : (
          filteredMemories.map((memory) => {
            const config = categoryConfig[memory.category]
            const Icon = config.icon

            return (
              <div
                key={memory.id}
                className="bg-slate-800/50 backdrop-blur rounded-xl p-4 flex items-center gap-4"
              >
                <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white">{memory.content}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {config.label} • {memory.createdAt}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(memory.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const count = memories.filter(m => m.category === key).length
          const Icon = config.icon

          return (
            <div key={key} className="bg-slate-800/50 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{count}</p>
                  <p className="text-xs text-slate-400">{config.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
