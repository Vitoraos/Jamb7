"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, User, Copy, Check } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Message } from "@/app/page"

interface ChatPanelProps {
  messages: Message[]
  isLoading: boolean
}

export function ChatPanel({ messages, isLoading }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  return (
    <div className="console-panel flex-1 flex flex-col min-h-0 mb-4">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
            Chat Interface
          </span>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {messages.length} messages
        </span>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] lg:min-h-[400px]"
      >
        {messages.length === 0 && !isLoading && (
          <EmptyState />
        )}
        
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isLoading && <LoadingIndicator />}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center mb-4 console-glow">
        <Bot className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        Ready to Assist
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Enter your question and relevant keywords to begin your study session. I will provide detailed explanations with referenced past questions.
      </p>
    </div>
  )
}

function ChatMessage({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false)
  const isAi = message.role === "ai"

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex gap-3 ${isAi ? "" : "flex-row-reverse"}`}>
      {/* Avatar */}
      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
        isAi 
          ? "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30" 
          : "bg-secondary border border-border"
      }`}>
        {isAi ? (
          <Bot className="w-4 h-4 text-primary" />
        ) : (
          <User className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[85%] ${isAi ? "" : "flex justify-end"}`}>
        <div className={`rounded-lg px-4 py-3 ${
          isAi 
            ? "bg-secondary/50 border border-border" 
            : "bg-primary/10 border border-primary/20"
        }`}>
          {/* Role Label */}
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-mono uppercase tracking-wider ${
              isAi ? "text-primary" : "text-muted-foreground"
            }`}>
              {isAi ? "AI Tutor" : "You"}
            </span>
            {isAi && (
              <button
                onClick={handleCopy}
                className="p-1 rounded hover:bg-secondary transition-colors"
                aria-label="Copy response"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                )}
              </button>
            )}
          </div>
          
          {/* Message Text with Markdown rendering */}
          <div className="text-sm text-foreground leading-relaxed max-w-none markdown-content">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="text-xl font-bold text-foreground mt-4 mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-bold text-foreground mt-4 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-semibold text-foreground mt-3 mb-1">{children}</h3>,
                p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-none space-y-1 my-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-none space-y-1 my-2">{children}</ol>,
                li: ({ children }) => (
                  <li className="flex gap-2">
                    <span className="text-primary shrink-0">•</span>
                    <span>{children}</span>
                  </li>
                ),
                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                code: ({ className, children }) => {
                  const isBlock = className?.includes("language-")
                  if (isBlock) {
                    return (
                      <pre className="bg-secondary/80 rounded-lg p-3 my-2 overflow-x-auto border border-border">
                        <code className="text-xs font-mono text-primary">{children}</code>
                      </pre>
                    )
                  }
                  return (
                    <code className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono text-primary">
                      {children}
                    </code>
                  )
                },
                pre: ({ children }) => <>{children}</>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-primary/50 pl-3 my-2 text-muted-foreground italic">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {children}
                  </a>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2">
                    <table className="w-full text-sm border border-border rounded">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-border bg-secondary/50 px-3 py-1.5 text-left font-medium">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="border border-border px-3 py-1.5">{children}</td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center loading-pulse">
        <Bot className="w-4 h-4 text-primary" />
      </div>
      <div className="bg-secondary/50 border border-border rounded-lg px-4 py-3">
        <span className="text-xs font-mono uppercase tracking-wider text-primary mb-2 block">
          AI Tutor
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground">Processing</span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary typing-dot" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary typing-dot" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary typing-dot" />
          </div>
        </div>
      </div>
    </div>
  )
}
