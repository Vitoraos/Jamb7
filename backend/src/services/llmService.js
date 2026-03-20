// backend/src/services/llmService.js

import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const hf = new HfInference(process.env.LLM_API_KEY);

const MAX_CHUNK_CHARS = 400;

export async function getLLMResponse({
  systemPrompt,
  userPrompt,
  contextChunks = [],
  chatHistory = []
}) {
  try {
    // All 10 retrieved chunks become the reference block
    // question_id included so LLM can cite e.g. "Based on Physics 2018:Q24"
    const referenceBlock = contextChunks.length
      ? contextChunks
          .map((c, i) => {
            const text  = c.chunk_text?.slice(0, MAX_CHUNK_CHARS) || "";
            const score = c.similarity?.toFixed(2) || "0.00";
            const qid   = c.question_id ? `[${c.question_id}]
` : "";
            return `[Reference ${i + 1}] (similarity: ${score})
${qid}${text}`;
          })
          .join("

---

")
      : null;

    const historyMessages = chatHistory.slice(-6).flatMap(h => [
      { role: "user",      content: h.user_prompt },
      { role: "assistant", content: h.ai_response }
    ]);

    // Reference chunks sit on top — userPrompt sits at the bottom untouched
    const userMessage = referenceBlock
      ? `The following are relevant past JAMB questions retrieved for reference:

${referenceBlock}

---

Student question:
${userPrompt}`
      : userPrompt;

    const messages = [
      { role: "system",    content: systemPrompt },
      ...historyMessages,
      { role: "user",      content: userMessage }
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
    return "Sorry, I could not generate a response. Please try again.";
  }
}