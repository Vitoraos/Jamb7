"use client"

import { useState, useCallback, KeyboardEvent } from "react"
import { Send, Tag, AlertCircle, X, MessageSquare } from "lucide-react"

interface InputSectionProps {
  onSend: (prompt: string, keywords: string[]) => void
  isLoading: boolean
  error: string | null
  onClearError: () => void
}

export function InputSection({ onSend, isLoading, error, onClearError }: InputSectionProps) {
  const [prompt, setPrompt] = useState("")
  const [keywords, setKeywords] = useState("")

  const parseKeywords = (input: string): string[] => {
    return input
      .split(",")
      .map(k => k.trim())
      .filter(k => k.length > 0)
  }

  const handleSubmit = useCallback(() => {
    if (!prompt.trim() || isLoading) return
    
    const keywordsArray = parseKeywords(keywords)
    onSend(prompt.trim(), keywordsArray)
    setPrompt("")
    // Keep keywords for convenience in follow-up questions
  }, [prompt, keywords, isLoading, onSend])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="console-panel p-4 space-y-3">
      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm flex-1">{error}</span>
          <button 
            onClick={onClearError}
            className="p-0.5 hover:bg-destructive/20 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Prompt Input */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5" />
          Prompt
        </label>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about any JAMB subject..."
            disabled={isLoading}
            rows={3}
            className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground font-mono">
            Enter to send
          </div>
        </div>
      </div>

      {/* Keywords Input */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
          <Tag className="w-3.5 h-3.5" />
          Keywords
          <span className="text-muted-foreground/60">(comma separated)</span>
        </label>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="thermodynamics, entropy, heat transfer"
          disabled={isLoading}
          className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Keywords Preview */}
      {keywords.trim() && (
        <div className="flex flex-wrap gap-1.5">
          {parseKeywords(keywords).map((keyword, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/30 text-xs font-mono text-primary"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!prompt.trim() || isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Query</span>
          </>
        )}
      </button>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground text-center">
        Press <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-mono text-[10px]">Enter</kbd> to send or <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-mono text-[10px]">Shift + Enter</kbd> for new line
      </p>
    </div>
  )
}
