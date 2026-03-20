// backend/src/services/embeddingService.js
// Uses BAAI/bge-m3 — significantly better retrieval than MiniLM
// Singleton HfInference client — initialised once, reused across requests

import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

// Singleton: only one instance per server process
const hf = new HfInference(process.env.LLM_API_KEY);

const EMBEDDING_MODEL = "BAAI/bge-m3";

/**
 * Generate a 1D embedding array for a given text string.
 * BGE-M3 returns 1024-dimensional vectors.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function getEmbedding(text) {
  try {
    const prefixedText = `Represent this sentence for searching relevant passages: ${text}`;

    const result = await hf.featureExtraction({
      model: EMBEDDING_MODEL,
      inputs: prefixedText
    });

    const flat = Array.isArray(result[0]) ? result.flat(2) : Array.from(result);

    if (!flat || flat.length === 0) {
      throw new Error("Empty embedding returned");
    }

    return flat;
  } catch (err) {
    console.error("Embedding error:", err);
    throw err;
  }
}
