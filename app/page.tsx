"use client"

import { useState, useCallback } from "react"
import { ConsoleHeader } from "@/components/console-header"
import { ChatPanel } from "@/components/chat-panel"
import { ReferencesPanel } from "@/components/references-panel"
import { InputSection } from "@/components/input-section"

export interface Message {
  id: string
  content: string
  role: "user" | "ai"
  timestamp: Date
}

export interface ContextChunk {
  subject: string
  question_id: string
  chunk_text: string
  similarity: number
}

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [contextChunks, setContextChunks] = useState<ContextChunk[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSendMessage = useCallback(async (prompt: string, keywords: string[]) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: prompt,
      role: "user",
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("https://jamb7.onrender.com/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userPrompt: prompt,
          keywords: keywords,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: data.aiResponse || "No response received",
        role: "ai",
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiMessage])
      
      if (data.contextChunks && Array.isArray(data.contextChunks)) {
        setContextChunks(data.contextChunks)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect to server"
      setError(errorMessage)
      
      const errorAiMessage: Message = {
        id: crypto.randomUUID(),
        content: `Connection Error: ${errorMessage}. Please try again.`,
        role: "ai",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorAiMessage])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return (
    <div className="min-h-screen bg-background grid-pattern flex flex-col">
      <ConsoleHeader />
      
      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-[1800px] mx-auto w-full">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-0 lg:min-w-0">
          <ChatPanel 
            messages={messages} 
            isLoading={isLoading} 
          />
          <InputSection 
            onSend={handleSendMessage} 
            isLoading={isLoading}
            error={error}
            onClearError={clearError}
          />
        </div>
        
        {/* References Sidebar */}
        <aside className="lg:w-96 shrink-0">
          <ReferencesPanel contextChunks={contextChunks} />
        </aside>
      </main>
    </div>
  )
}
