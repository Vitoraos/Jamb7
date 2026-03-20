// backend/src/services/embeddingService.js

import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const hf = new HfInference(process.env.LLM_API_KEY);

const EMBEDDING_MODEL = "BAAI/bge-m3";

/**
 * Converts a keyword string into a 1024-dim BGE-M3 embedding vector.
 * Input MUST be a plain string — chatController joins the keywords array before calling this.
 * @param {string} text - e.g. "thermodynamics heat entropy Boyle law"
 * @returns {Promise<number[]>} - float array of length 1024
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
      throw new Error("Empty embedding returned from model");
    }

    return flat;
  } catch (err) {
    console.error("Embedding error:", err);
    throw err;
  }
}