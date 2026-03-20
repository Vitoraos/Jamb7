// backend/src/services/semanticSearchService.js

import { supabase } from "../config/supabaseClient.js";

/**
 * Runs a pgvector cosine similarity search on jamb_chunks.
 * @param {number[]} queryEmbedding - 1024-dim BGE-M3 vector
 * @param {number}   topN           - number of chunks to return (default 10)
 * @param {string|null} subject     - "physics" | "chemistry" | "Mathematics" | null
 */
export async function getTopChunks(queryEmbedding, topN = 10, subject = null) {
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  const { data, error } = await supabase.rpc("match_pdf_chunks", {
    query_embedding: vectorLiteral,
    match_count:     topN,
    filter_subject:  subject ?? null
  });

  if (error) {
    console.error("Semantic search error:", error);
    return [];
  }

  console.log(`pgvector returned ${data?.length || 0} chunks (subject: ${subject ?? "all"})`);
  return data || [];
}