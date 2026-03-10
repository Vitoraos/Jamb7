// backend/src/services/llmService.js
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_API_KEY = process.env.HF_TOKEN;

/**
 * Generates a response from Hugging Face router chat models
 * @param {Object} params
 * @param {string} params.systemPrompt
 * @param {string} params.userPrompt
 * @param {Array} params.contextChunks
 * @param {Array} params.chatHistory
 */

export async function getLLMResponse({
  systemPrompt,
  userPrompt,
  contextChunks = [],
  chatHistory = []
}) {

  // 1️⃣ Sort semantic search chunks
  const sortedChunks = contextChunks
    .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
    .map(c => `[score:${c.similarity?.toFixed(2) || 0}] ${c.chunk_text}`);

  // 2️⃣ Convert stored chat history → chat messages
  const historyMessages = chatHistory.flatMap(h => [
    { role: "user", content: h.user_prompt },
    { role: "assistant", content: h.ai_response }
  ]);

  // 3️⃣ Construct user message including context
  const userMessage = `
Context Chunks:
${sortedChunks.join("\n\n")}

Question:
${userPrompt}
`;

  // 4️⃣ Assemble messages array
  const messages = [
    { role: "system", content: systemPrompt },
    ...historyMessages,
    { role: "user", content: userMessage }
  ];

  try {

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: messages,
        max_tokens: 350,
        temperature: 0.4
      })
    });

    const data = await response.json();

    // Router response format
    return data?.choices?.[0]?.message?.content || "";

  } catch (err) {

    console.error("Error calling Hugging Face LLM:", err);
    return "Error generating response.";

  }
}
