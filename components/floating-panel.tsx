'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, X } from 'lucide-react'

interface FloatingPanelProps {
  title: string
  badge?: number
  children: React.ReactNode
  position?: 'left' | 'right'
  defaultOpen?: boolean
}

export function FloatingPanel({
  title,
  badge,
  children,
  position = 'right',
  defaultOpen = false,
}: FloatingPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isMinimized, setIsMinimized] = useState(true)

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true)
          setIsMinimized(false)
        }}
        className={`fixed ${position === 'left' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 z-50
          flex items-center gap-2 px-3 py-2 
          bg-[#0a0a0a]/90 backdrop-blur-sm border border-[#222] rounded-full
          hover:border-[#333] hover:bg-[#111] transition-all group`}
      >
        <div className="h-1.5 w-1.5 rounded-full bg-[#444] group-hover:bg-[#fff] transition-colors" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#666] group-hover:text-[#888]">
          {title}
        </span>
        {badge !== undefined && badge > 0 && (
          <span className="text-[10px] font-mono text-[#444]">{badge}</span>
        )}
      </button>
    )
  }

  return (
    <div
      className={`fixed ${position === 'left' ? 'left-4' : 'right-4'} top-16 z-50
        bg-[#0a0a0a]/95 backdrop-blur-md border border-[#1a1a1a] rounded-lg
        shadow-2xl shadow-black/50 transition-all duration-300
        ${isMinimized ? 'w-48' : 'w-80 max-h-[70vh]'}`}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[#fff]" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#888]">
            {title}
          </span>
          {badge !== undefined && badge > 0 && (
            <span className="text-[10px] font-mono text-[#444] bg-[#1a1a1a] px-1.5 py-0.5 rounded">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-[#1a1a1a] rounded transition-colors"
          >
            {isMinimized ? (
              <ChevronDown className="h-3 w-3 text-[#666]" />
            ) : (
              <ChevronUp className="h-3 w-3 text-[#666]" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-[#1a1a1a] rounded transition-colors"
          >
            <X className="h-3 w-3 text-[#666]" />
          </button>
        </div>
      </div>

      {/* Panel Content */}
      {!isMinimized && (
        <div className="overflow-y-auto max-h-[60vh] custom-scrollbar">
          {children}
        </div>
      )}
    </div>
  )
}
