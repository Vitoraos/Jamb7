// backend/src/controllers/chatController.js
import { supabase } from "../config/supabaseClient.js";
import { getLLMResponse } from "../services/llmService.js";
import { getTopChunks } from "../services/semanticSearchService.js";
import { formatChunkForContext } from "../utils/formatters.js";
import { SYSTEM_PROMPT } from "../config/systemPrompt.js";
import { getEmbedding } from "../services/embeddingService.js";

export async function handleChat(req, res) {
  try {
    const { userPrompt, keywords, userId = 1, subject = null } = req.body;

    if (!userPrompt) {
      return res.status(400).json({ error: "userPrompt is required" });
    }
    if (!Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ error: "keywords must be a non-empty array" });
    }

    const keywordString = keywords.join(" ");
    console.log("Keywords for embedding:", keywordString);
    console.log("Subject filter:", subject ?? "none");

    const queryEmbedding = await getEmbedding(keywordString);

    if (!queryEmbedding || queryEmbedding.length === 0) {
      return res.status(500).json({ error: "Embedding generation failed" });
    }

    console.log("Embedding length:", queryEmbedding.length);

    const [topChunksResult, historyResult] = await Promise.all([
      getTopChunks(queryEmbedding, 10, subject),
      supabase
        .from("chat_history")
        .select("user_prompt, ai_response")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(6)
    ]);

    const contextChunks = (topChunksResult || [])
      .map(chunk => ({
        question_id: chunk.question_id || chunk.id || "N/A",
        subject:     chunk.subject     || "N/A",
        chunk_text:  chunk.chunk_text  || "",
        similarity:  chunk.similarity  ?? 0
      }))
      .map(formatChunkForContext);

    console.log("Chunks retrieved:", contextChunks.length);

    const chatHistory =
      historyResult.data?.reverse().map(h => ({
        user_prompt: h.user_prompt,
        ai_response: h.ai_response
      })) || [];

    const llmResponse = await getLLMResponse({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      contextChunks,
      chatHistory,
      subject
    });

    supabase
      .from("chat_history")
      .insert([{
        user_id:     userId,
        user_prompt: userPrompt,
        keywords:    keywords,
        ai_response: llmResponse
      }])
      .then(({ error }) => {
        if (error) console.error("Chat history save error:", error);
      });

    res.json({ aiResponse: llmResponse, contextChunks });

  } catch (err) {
    console.error("handleChat error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}