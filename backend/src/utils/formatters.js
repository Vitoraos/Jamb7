// backend/src/utils/formatters.js

/**
 * Formats a chunk for LLM context.
 * Keeps question_id so LLM can cite e.g. "Based on Physics 2018:Q24"
 */
export function formatChunkForContext(chunk) {
  return {
    question_id: chunk.question_id,
    chunk_text:  chunk.chunk_text,
    similarity:  chunk.similarity
  };
}