/**
 * Format a chunk object to readable string for LLM context
 * @param {Object} chunk 
 */
export function formatChunkForContext(chunk) {
  return `Subject: ${chunk.subject}\nQuestion ID: ${chunk.question_id}\nText: ${chunk.chunk_text}\nSimilarity: ${chunk.similarity}`;
}
