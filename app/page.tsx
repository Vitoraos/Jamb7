'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage } from '@/components/chat-message'
import { ChatInput } from '@/components/chat-input'
import { FloatingPanel } from '@/components/floating-panel'
import { CommandBar } from '@/components/command-bar'
import { ReferencesPanel } from '@/components/references-panel'
import { sendChatMessage, type ContextChunk } from '@/lib/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  keywords?: string[]
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [contextChunks, setContextChunks] = useState<ContextChunk[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (prompt: string, keywords: string[]) => {
    setError(null)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      keywords: keywords.length > 0 ? keywords : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await sendChatMessage({
        userPrompt: prompt,
        keywords: keywords,
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.aiResponse,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setContextChunks((prev) => [...response.contextChunks, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response')
    } finally {
      setIsLoading(false)
    }
  }

  const systemStatus = isLoading ? 'processing' : error ? 'error' : 'online'

  return (
    <div className="flex flex-col h-screen bg-[#000] overflow-hidden">
      {/* Floating References Panel */}
      {contextChunks.length > 0 && (
        <FloatingPanel title="References" badge={contextChunks.length} position="right">
          <ReferencesPanel chunks={contextChunks} />
        </FloatingPanel>
      )}

      {/* Main Chat Area - Maximum reading space */}
      <div className="flex-1 overflow-y-auto pb-32 custom-scrollbar">
        <div className="max-w-2xl mx-auto px-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[80vh]">
              {/* Spaceship-style hero */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-transparent rounded-full blur-3xl opacity-50" />
                <div className="relative flex flex-col items-center">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#333]" />
                    <div className="h-2 w-2 rounded-full border border-[#333]" />
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#333]" />
                  </div>
                  <h1 className="text-xl font-light text-[#fff] mb-3 tracking-wide">
                    Initialize Query
                  </h1>
                  <p className="text-xs text-[#444] font-mono tracking-widest uppercase">
                    Physics / Chemistry / Biology / Math
                  </p>
                  <div className="flex items-center gap-3 mt-8">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#222]" />
                    <div className="h-1 w-1 rounded-full bg-[#333]" />
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#222]" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 space-y-1">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  keywords={message.keywords}
                />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 px-4 py-6">
                  <div className="flex gap-1">
                    <div className="h-1 w-1 rounded-full bg-[#fff] animate-pulse" />
                    <div className="h-1 w-1 rounded-full bg-[#fff] animate-pulse [animation-delay:150ms]" />
                    <div className="h-1 w-1 rounded-full bg-[#fff] animate-pulse [animation-delay:300ms]" />
                  </div>
                </div>
              )}
              {error && (
                <div className="px-4 py-2">
                  <p className="text-[10px] font-mono text-[#ff4444]">{error}</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Floating Input - Spaceship console style */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-30">
        <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      {/* Command Bar - Bottom status */}
      <CommandBar
        systemStatus={systemStatus}
        messagesCount={messages.length}
        referencesCount={contextChunks.length}
      />
    </div>
  )
}
