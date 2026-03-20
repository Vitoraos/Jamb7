// backend/src/services/llmService.js

import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

// Singleton client
const hf = new HfInference(process.env.LLM_API_KEY);

const MAX_CHUNK_CHARS = 400;
const MIN_SIMILARITY_THRESHOLD = 0.3;

/**
 * Generates a response from the LLM using semantic context + conversation history.
 * @param {Object} params
 * @param {string} params.systemPrompt
 * @param {string} params.userPrompt
 * @param {Array}  params.contextChunks
 * @param {Array}  params.chatHistory
 * @returns {Promise<string>}
 */
export async function getLLMResponse({
  systemPrompt,
  userPrompt,
  contextChunks = [],
  chatHistory = []
}) {
  try {
    const relevantChunks = contextChunks
      .filter(c => (c.similarity || 0) >= MIN_SIMILARITY_THRESHOLD)
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, 6);

    const contextString = relevantChunks.length
      ? relevantChunks
          .map((c, i) => {
            const text = c.chunk_text?.slice(0, MAX_CHUNK_CHARS) || "";
            const score = c.similarity?.toFixed(2) || "0.00";
            return `[${i + 1}] (score: ${score})
${text}`;
          })
          .join("

---

")
      : null;

    const historyMessages = chatHistory.slice(-6).flatMap(h => [
      { role: "user", content: h.user_prompt },
      { role: "assistant", content: h.ai_response }
    ]);

    const userMessage = contextString
      ? `Relevant past questions:
${contextString}

Student question:
${userPrompt}`
      : userPrompt;

    const messages = [
      { role: "system", content: systemPrompt },
      ...historyMessages,
      { role: "user", content: userMessage }
    ];

    const res = await hf.chatCompletion({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages,
      max_tokens: 700,
      temperature: 0.35,
      top_p: 0.9
    });

    return res?.choices?.[0]?.message?.content?.trim() || "No response generated.";

  } catch (err) {
    console.error("LLM error:", err?.message || err);
    return "Sorry, I couldn't generate a response. Please try again.";
  }
}
