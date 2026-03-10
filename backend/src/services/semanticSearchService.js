import { supabase } from "../config/supabaseClient.js";

/**
 * Get top N similar chunks based on embedding similarity
 * @param {number[]} queryEmbedding - embedding for user keyword
 * @param {number} topN - number of top chunks to retrieve
 * @returns {Promise<Array>} - array of {chunk_text, similarity, subject, question_id}
 */
export async function getTopChunks(queryEmbedding, topN = 10) {
  const { data, error } = await supabase
    .rpc("match_pdf_chunks", {
      query_embedding: queryEmbedding,
      match_count: topN
    });

  if (error) {
    console.error("Error fetching chunks:", error);
    return [];
  }

  return data;
}
