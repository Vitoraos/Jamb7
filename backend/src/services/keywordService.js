// backend/src/services/keywordService.js

import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const hf = new HfInference(process.env.LLM_API_KEY);

/**
 * Extracts JAMB-relevant keywords from a student prompt for a given subject.
 * @param {string} userPrompt  - e.g. "Explain thermodynamics"
 * @param {string} subject     - e.g. "physics", "chemistry", "Mathematics"
 * @returns {Promise<string[]>} - e.g. ["thermodynamics","heat","entropy"]
 */
export async function extractKeywords(userPrompt, subject) {
  try {
    const messages = [
      {
        role: "system",
        content: `You are a JAMB exam keyword extractor.
Your job is to extract the most relevant technical keywords from a student question that would appear in JAMB ${subject} past questions.

Rules:
- Return ONLY a valid JSON array of strings. No explanation, no markdown, no extra text.
- Extract between 4 and 7 keywords maximum.
- Keywords must be specific ${subject} terms likely found in JAMB past questions.
- Do not include generic words like explain, what, how, is, the, a, an.
- Output must be exactly this format: ["keyword1", "keyword2", "keyword3"]`
      },
      {
        role: "user",
        content: `Student question: "${userPrompt}"
Subject: ${subject}

Return the JAMB ${subject} keywords as a JSON array only.`
      }
    ];

    const res = await hf.chatCompletion({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages,
      max_tokens: 80,
      temperature: 0.1,
      top_p: 0.9
    });

    const raw = res?.choices?.[0]?.message?.content?.trim() || "[]";

    const cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const keywords = JSON.parse(cleaned);

    if (!Array.isArray(keywords) || keywords.length === 0) {
      throw new Error("Model returned invalid keyword format");
    }

    console.log(`Keywords [${subject}] "${userPrompt}" →`, keywords);
    return keywords;

  } catch (err) {
    console.error("Keyword extraction failed:", err?.message || err);

    const fallback = userPrompt
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(" ")
      .filter(w => w.length > 3 && !["explain","what","when","where","which","does","with","from","that","this","have","will"].includes(w))
      .slice(0, 5);

    console.log("Fallback keywords:", fallback);
    return fallback.length > 0 ? fallback : [userPrompt];
  }
}