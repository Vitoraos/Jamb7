// backend/src/services/llmService.js
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const HF_API_URL = process.env.LLM_API_URL;    // Hugging Face endpoint
const HF_API_KEY = process.env.LLM_API_KEY;

/**
 * Generates a response from a Hugging Face LLM with chat history and context.
 * @param {Object} params
 * @param {string} params.systemPrompt - Instructions for the AI
 * @param {string} params.userPrompt - Current user question
 * @param {Array} params.contextChunks - Array of objects {chunk_text, similarity} from semantic search
 * @param {Array} params.chatHistory - Array of past chat messages [{user_prompt, ai_response}]
 */
export async function getLLMResponse({ systemPrompt, userPrompt, contextChunks = [], chatHistory = [] }) {
  // 1️⃣ Sort context chunks by similarity descending
  const sortedChunks = contextChunks
    .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
    .map(c => `[score:${c.similarity?.toFixed(2) || 0}] ${c.chunk_text}`);

  // 2️⃣ Concatenate previous chat history
  const historyText = chatHistory
    .map(h => `User: ${h.user_prompt}\nAI: ${h.ai_response}`)
    .join("\n\n");

  // 3️⃣ Build the prompt for Hugging Face
  const prompt = `
[System Prompt]
${systemPrompt}

[Conversation History]
${historyText}

[Context Chunks]
${sortedChunks.join("\n\n")}

[User Prompt]
${userPrompt}
`;

  try {
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        options: { wait_for_model: true },
        parameters: {
          max_new_tokens: 512,
          temperature: 0.7
        }
      })
    });

    const data = await response.json();

    // Hugging Face returns text in data[0].generated_text
    return data[0]?.generated_text || "";

  } catch (err) {
    console.error("Error calling Hugging Face LLM:", err);
    return "Error generating response. Please try again.";
  }
}
