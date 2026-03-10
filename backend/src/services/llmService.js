import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const HF_API_URL = process.env.LLM_API_URL;    // Hugging Face endpoint
const HF_API_KEY = process.env.LLM_API_KEY;

export async function getHFResponse({ systemPrompt, userPrompt, contextChunks }) {
  // Sort context chunks by similarity descending, if each chunk has a `similarity` field
  const sortedChunks = contextChunks
    .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
    .map(c => c.chunk_text);

  // Concatenate everything into a single string
  const prompt = `
[System Prompt]
${systemPrompt}

[User Prompt]
${userPrompt}

[Context Chunks]
${sortedChunks.join("\n\n")}
`;

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

  // Hugging Face returns text as `generated_text` in an array
  return data[0]?.generated_text || "";
}
