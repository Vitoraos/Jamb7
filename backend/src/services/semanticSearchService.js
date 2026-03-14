// backend/src/services/semanticSearchService.js

import { supabase } from "../config/supabaseClient.js";

export async function getTopChunks(queryEmbedding, topN = 10) {

  // convert JS array -> Postgres vector literal
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  const { data, error } = await supabase.rpc("match_pdf_chunks", {
    query_embedding: vectorLiteral,
    match_count: topN
  });

  if (error) {
    console.error("Error fetching chunks:", error);
    return [];
  }

  console.log("RPC returned rows:", data?.length || 0);

  return data || [];
}
