// backend/src/services/keywordService.js
import dotenv from "dotenv";
dotenv.config();

const HF_API_KEY = process.env.LLM_API_KEY;
const LLM_MODEL = "meta-llama/Llama-3.1-8B-Instruct";

export async function extractKeywords(userPrompt, subject) {
  try {
    const messages = [
      {
        role: "system",
        content: `You are a JAMB exam keyword extractor.
Your job is to extract the most relevant technical keywords from a student question that would appear in JAMB ${subject} past questions.

Rules:
- Return ONLY a valid JSON array of strings. No explanation, no markdown, no extra text.
- Extract between 6 and 10 keywords maximum.
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

    const response = await fetch(
  "https://router.huggingface.co/v1/chat/completions",  // ← Correct unified endpoint
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: LLM_MODEL,  // ← Model stays here in the body
      messages,
      max_tokens: 100,
      temperature: 0.1,
      top_p: 0.9,
    }),
  }
);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HF LLM API error ${response.status}: ${errText}`);
    }

    const res = await response.json();
    const raw = res?.choices?.[0]?.message?.content?.trim() || "[]";
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
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
