'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mic, Settings, Brain, MapPin } from 'lucide-react'

const navItems = [
  { href: '/', label: '会話', icon: Mic },
  { href: '/studio', label: 'スタジオ', icon: Settings },
  { href: '/memory', label: 'メモリ', icon: Brain },
  { href: '/simulator', label: 'シミュレータ', icon: MapPin },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-white">
            Voice Engine
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
