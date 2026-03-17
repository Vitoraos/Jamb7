'use client'

import { useState, useEffect } from 'react'

interface CommandBarProps {
  systemStatus: 'online' | 'processing' | 'error'
  messagesCount: number
  referencesCount: number
}

export function CommandBar({ systemStatus, messagesCount, referencesCount }: CommandBarProps) {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour12: false }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const statusColor = {
    online: 'bg-[#00ff00]',
    processing: 'bg-[#fff] animate-pulse',
    error: 'bg-[#ff4444]',
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#000]/80 backdrop-blur-sm border-t border-[#111]">
        {/* Left Status Indicators */}
        <div className="flex items-center gap-6 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <div className={`h-1 w-1 rounded-full ${statusColor[systemStatus]}`} />
            <span className="text-[9px] font-mono text-[#444] uppercase tracking-widest">
              {systemStatus}
            </span>
          </div>
          <div className="h-3 w-px bg-[#1a1a1a]" />
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-mono text-[#333]">
              MSG <span className="text-[#555]">{messagesCount}</span>
            </span>
            <span className="text-[9px] font-mono text-[#333]">
              REF <span className="text-[#555]">{referencesCount}</span>
            </span>
          </div>
        </div>

        {/* Center - System ID */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#222]" />
          <span className="text-[9px] font-mono text-[#333] tracking-[0.3em]">JAMB-AI</span>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#222]" />
        </div>

        {/* Right - Time & Version */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <span className="text-[9px] font-mono text-[#333] tabular-nums">{time}</span>
          <div className="h-3 w-px bg-[#1a1a1a]" />
          <span className="text-[9px] font-mono text-[#222]">v1.0</span>
        </div>
      </div>
    </div>
  )
}
