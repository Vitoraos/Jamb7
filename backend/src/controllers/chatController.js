// backend/src/controllers/chatController.js

import { supabase } from "../config/supabaseClient.js";
import { getLLMResponse } from "../services/llmService.js";
import { formatChunkForContext } from "../utils/formatters.js";
import { SYSTEM_PROMPT } from "../config/systemPrompt.js";
import { HfInference } from "@huggingface/inference";

export async function handleChat(req, res) {
  try {
    const { userPrompt, keywords, userId = 1 } = req.body;

    if (!userPrompt) {
      return res.status(400).json({ error: "userPrompt is required" });
    }

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ error: "keywords must be a non-empty array" });
    }

    // Initialize HF client
    const hf = new HfInference(process.env.LLM_API_KEY);

    // Combine keywords into one string for embedding
    const keywordString = keywords.join(", ");

    console.log("Keywords used for semantic search:", keywordString);

    // Generate embedding
    const embeddingRes = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: keywordString
    });

    if (!embeddingRes || !embeddingRes[0]) {
      console.error("Embedding generation failed:", embeddingRes);
      return res.status(500).json({ error: "Embedding generation failed" });
    }

    const queryEmbedding = embeddingRes[0];

    // Convert to Postgres vector format
    const vectorLiteral = `[${queryEmbedding.join(",")}]`;

    console.log("Vector generated for search");

    // Call Supabase vector search
    const { data: topChunks, error: searchError } = await supabase.rpc(
      "match_pdf_chunks",
      {
        query_embedding: vectorLiteral,
        match_count: 10
      }
    );

    if (searchError) {
      console.error("Semantic search error:", searchError);
      return res.status(500).json({ error: "Semantic search failed" });
    }

    console.log("Chunks retrieved:", topChunks?.length || 0);

    const contextChunks = (topChunks || []).map(formatChunkForContext);

    // Load previous chat history
    const { data: history } = await supabase
      .from("chat_history")
      .select("user_prompt, ai_response")
      .order("created_at", { ascending: false })
      .limit(6);

    const chatHistory =
      history?.reverse().map(h => ({
        user_prompt: h.user_prompt,
        ai_response: h.ai_response
      })) || [];

    // Call LLM
    const llmResponse = await getLLMResponse({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      contextChunks,
      chatHistory
    });

    // Save conversation
    const { error: saveError } = await supabase.from("chat_history").insert([
      {
        user_id: userId,
        user_prompt: userPrompt,
        keywords,
        ai_response: llmResponse
      }
    ]);

    if (saveError) {
      console.error("Chat history save error:", saveError);
    }

    res.json({
      aiResponse: llmResponse,
      contextChunks
    });
  } catch (err) {
    console.error("handleChat error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
