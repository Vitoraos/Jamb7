import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const LLM_API_URL = process.env.LLM_API_URL; // e.g., OpenAI or free LLM endpoint
const LLM_API_KEY = process.env.LLM_API_KEY;

export async function getLLMResponse({ systemPrompt, userPrompt, contextChunks }) {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
    { role: "assistant", content: contextChunks.join("\n\n") }
  ];

  const response = await fetch(LLM_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${LLM_API_KEY}`
    },
    body: JSON.stringify({ messages })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
