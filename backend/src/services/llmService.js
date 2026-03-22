// backend/src/services/llmService.js
import dotenv from "dotenv";
import { getModelForSubject } from "../config/modelRouter.js";
dotenv.config();

const HF_API_KEY = process.env.LLM_API_KEY;
const MAX_CHUNK_CHARS = 400;

export async function getLLMResponse({ systemPrompt, userPrompt, contextChunks = [], chatHistory = [], subject = null }) {
  const LLM_MODEL = getModelForSubject(subject);
  console.log(`LLM model selected for subject "${subject}": ${LLM_MODEL}`);

  try {
    const referenceBlock = contextChunks.length
      ? contextChunks.map((c, i) => {
          const text  = c.chunk_text?.slice(0, MAX_CHUNK_CHARS) || "";
          const score = c.similarity?.toFixed(2) || "0.00";
          const qid   = c.question_id ? `[${c.question_id}]\n` : "";
          return `[Reference ${i + 1}] (similarity: ${score})\n${qid}${text}`;
        }).join("\n\n---\n\n")
      : null;

    const historyMessages = chatHistory.slice(-6).flatMap(h => [
      { role: "user",      content: h.user_prompt },
      { role: "assistant", content: h.ai_response }
    ]);

    const userMessage = referenceBlock
      ? `The following are relevant past JAMB questions retrieved for reference:\n\n${referenceBlock}\n\n---\n\nStudent question:\n${userPrompt}`
      : userPrompt;

    const messages = [
      { role: "system", content: systemPrompt },
      ...historyMessages,
      { role: "user",   content: userMessage }
    ];

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: LLM_MODEL,
          messages,
          max_tokens: 800,
          temperature: 0.4,
          top_p: 0.9,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HF LLM API error ${response.status}: ${errText}`);
    }

    const res = await response.json();
    return res?.choices?.[0]?.message?.content?.trim() || "No response generated.";

  } catch (err) {
    console.error("LLM error:", err?.message || err);
    return "Sorry, I could not generate a response. Please try again.";
  }
}