// backend/src/services/llmService.js
import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

// Initialize Hugging Face SDK with your Router API key
const hf = new HfInference(process.env.LLM_API_KEY);

/**
 * Generates a response from Hugging Face chat models via router
 * @param {Object} params
 * @param {string} params.systemPrompt - system instructions
 * @param {string} params.userPrompt - user question
 * @param {Array} params.contextChunks - semantic search chunks
 * @param {Array} params.chatHistory - previous conversation
 * @returns {Promise<string>}
 */
export async function getLLMResponse({
  systemPrompt,
  userPrompt,
  contextChunks = [],
  chatHistory = []
}) {
  try {
    // 1️⃣ Sort context chunks by similarity
    const sortedChunks = contextChunks
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .map(c => `[score:${c.similarity?.toFixed(2) || 0}] ${c.chunk_text}`);

    // 2️⃣ Convert chat history into messages
    const historyMessages = chatHistory.flatMap(h => [
      { role: "user", content: h.user_prompt },
      { role: "assistant", content: h.ai_response }
    ]);

    // 3️⃣ Construct the user message including context only if available
    const userMessage = sortedChunks.length
      ? `Context Chunks:\n${sortedChunks.join("\n\n")}\n\nQuestion:\n${userPrompt}`
      : userPrompt; // fallback: just the user question

    // 4️⃣ Combine system prompt, history, and current message
    const messages = [
      { role: "system", content: systemPrompt },
      ...historyMessages,
      { role: "user", content: userMessage }
    ];

    // 5️⃣ Call Hugging Face chatCompletion via SDK (Router API compatible)
    const res = await hf.chatCompletion({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages,
      max_tokens: 550,
      temperature: 0.4
    });

    // 6️⃣ Return generated text (Router API format)
    return res?.choices?.[0]?.message?.content || "";

  } catch (err) {
    console.error("Error generating LLM response:", err);
    return "Error generating response.";
  }
}
