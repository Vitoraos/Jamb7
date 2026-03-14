/**
 * Format a chunk object to readable string for LLM context
 * @param {Object} chunk 
 */
export function formatChunkForContext(chunk) {
  return {
    chunk_text: chunk.chunk_text,
    similarity: chunk.similarity
  };
}
