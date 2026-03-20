// backend/src/services/semanticSearchService.js

import { supabase } from "../config/supabaseClient.js";

/**
 * Retrieve top matching chunks from jamb_chunks via pgvector cosine similarity.
 * @param {number[]} queryEmbedding - 1024-dim BGE-M3 vector
 * @param {number}   topN           - number of chunks to return (default 6)
 * @param {string|null} subject     - optional subject filter e.g. "physics", "chemistry", "Mathematics"
 */
export async function getTopChunks(queryEmbedding, topN = 6, subject = null) {
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  const { data, error } = await supabase.rpc("match_pdf_chunks", {
    query_embedding: vectorLiteral,
    match_count: topN,
    filter_subject: subject ?? null
  });

  if (error) {
    console.error("Semantic search error:", error);
    return [];
  }

  console.log(`RPC returned ${data?.length || 0} chunks (subject filter: ${subject ?? "none"})`);
  return data || [];
}
