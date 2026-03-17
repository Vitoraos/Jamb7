'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowUp, ChevronDown, ChevronUp } from 'lucide-react'

interface ChatInputProps {
  onSubmit: (prompt: string, keywords: string[]) => void
  isLoading: boolean
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [prompt, setPrompt] = useState('')
  const [keywords, setKeywords] = useState('')
  const [showKeywords, setShowKeywords] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }, [prompt])

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return

    const keywordArray = keywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0)

    onSubmit(prompt.trim(), keywordArray)
    setPrompt('')
    setKeywords('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#111] via-[#1a1a1a] to-[#111] rounded-2xl blur-sm opacity-50" />
      
      {/* Main container */}
      <div className="relative bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        {/* Keywords Section - Expandable, thin */}
        <div className="border-b border-[#111]">
          <button
            onClick={() => setShowKeywords(!showKeywords)}
            className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-[#111] transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-[#333]" />
              <span className="text-[9px] font-mono text-[#444] uppercase tracking-widest">
                Keywords
              </span>
              {keywords && (
                <span className="text-[9px] font-mono text-[#555]">
                  {keywords.split(',').filter(k => k.trim()).length} set
                </span>
              )}
            </div>
            {showKeywords ? (
              <ChevronUp className="h-3 w-3 text-[#333]" />
            ) : (
              <ChevronDown className="h-3 w-3 text-[#333]" />
            )}
          </button>
          
          {showKeywords && (
            <div className="px-4 pb-2">
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="thermodynamics, gas laws, newton"
                className="w-full bg-transparent text-[11px] text-[#888] placeholder-[#333] focus:outline-none font-mono py-1"
                disabled={isLoading}
              />
            </div>
          )}
        </div>

        {/* Main Input Area */}
        <div className="flex items-end gap-3 p-3">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={1}
            className="flex-1 bg-transparent text-[#fff] placeholder-[#333] resize-none focus:outline-none text-sm leading-relaxed min-h-[24px]"
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            className="flex items-center justify-center h-7 w-7 rounded-full bg-[#fff] text-[#000] 
              hover:scale-105 disabled:opacity-20 disabled:scale-100 disabled:cursor-not-allowed 
              transition-all shrink-0"
          >
            <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}
