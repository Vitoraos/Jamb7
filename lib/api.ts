const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jamb7.onrender.com/api/chat'

export interface ContextChunk {
  subject: string
  question_id: string
  chunk_text: string
  similarity: number
}

export interface ChatResponse {
  aiResponse: string
  contextChunks: ContextChunk[]
}

export interface ChatRequest {
  userPrompt: string
  keywords: string[]
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
