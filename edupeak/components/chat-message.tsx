'use client'

import { useState } from 'react'
import { Check, Copy, ChevronDown, ChevronUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  keywords?: string[]
}

export function ChatMessage({ role, content, keywords }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (role === 'user') {
    return (
      <div className="py-4">
        <div className="flex items-start gap-3">
          <div className="h-5 w-5 rounded-full bg-[#fff] shrink-0 flex items-center justify-center mt-0.5">
            <div className="h-1.5 w-1.5 rounded-full bg-[#000]" />
          </div>
          <div className="flex-1 min-w-0">
            {keywords && keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="text-[9px] font-mono text-[#555] uppercase tracking-wider bg-[#111] px-1.5 py-0.5 rounded"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
            <p className="text-[#fff] text-sm leading-relaxed">{content}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="flex items-start gap-3">
        <div className="h-5 w-5 rounded-full border border-[#333] shrink-0 flex items-center justify-center mt-0.5">
          <div className="h-1 w-1 rounded-full bg-[#fff]" />
        </div>
        <div className="flex-1 min-w-0">
          {/* Collapsible Header */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-[9px] font-mono text-[#444] uppercase tracking-wider hover:text-[#666] transition-colors"
            >
              <span>Response</span>
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[9px] font-mono text-[#333] hover:text-[#666] transition-colors uppercase tracking-wider"
            >
              {copied ? (
                <>
                  <Check className="h-2.5 w-2.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-2.5 w-2.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Content */}
          {expanded && (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="mb-4 last:mb-0 text-[#d0d0d0] text-sm leading-7">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-none pl-0 mb-4 space-y-2">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-4 mb-4 space-y-2 text-[#d0d0d0] text-sm">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-[#d0d0d0] text-sm leading-7 flex items-start gap-2">
                      <span className="text-[#333] mt-2">-</span>
                      <span>{children}</span>
                    </li>
                  ),
                  code: ({ children }) => (
                    <code className="bg-[#111] px-1.5 py-0.5 rounded text-[#fff] text-xs font-mono border border-[#1a1a1a]">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-[#0a0a0a] p-4 rounded-lg overflow-x-auto mb-4 border border-[#1a1a1a] text-xs">
                      {children}
                    </pre>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-base font-medium mb-3 text-[#fff] tracking-tight">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-sm font-medium mb-2 text-[#fff] tracking-tight">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-medium mb-2 text-[#fff]">{children}</h3>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-[#fff]">{children}</strong>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l border-[#333] pl-3 my-3 text-[#888] italic text-sm">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}

          {/* Collapsed Preview */}
          {!expanded && (
            <p className="text-[#555] text-xs line-clamp-2">{content}</p>
          )}
        </div>
      </div>
    </div>
  )
}
