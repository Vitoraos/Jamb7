// backend/src/services/embeddingService.js
import dotenv from "dotenv";
dotenv.config();

const EMBEDDING_MODEL = "BAAI/bge-m3";
const PREFIX = "Represent this sentence for searching relevant passages: ";
const HF_API_KEY = process.env.LLM_API_KEY;

export async function getEmbedding(text) {
  try {
    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${EMBEDDING_MODEL}/pipeline/feature-extraction`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: PREFIX + text,
          parameters: { normalize: true },
        }),
      }
    );
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HF Embedding API error ${response.status}: ${errText}`);
    }
    const data = await response.json();
    const flat = Array.isArray(data[0]) ? data.flat(2) : Array.from(data);
    if (!flat || flat.length === 0) throw new Error("Empty embedding returned");
    return flat;
  } catch (err) {
    console.error("Embedding error:", err);
    throw err;
  }
}
