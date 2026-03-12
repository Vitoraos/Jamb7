// backend/src/controllers/chatController.js

import { supabase } from "../config/supabaseClient.js";
import { getLLMResponse } from "../services/llmService.js";
import { getTopChunks } from "../services/semanticSearchService.js";
import { formatChunkForContext } from "../utils/formatters.js";
import { SYSTEM_PROMPT } from "../config/systemPrompt.js";
import { HfInference } from "@huggingface/inference";

export async function handleChat(req, res) {
  try {
    const { userPrompt, keywords, userId = 1 } = req.body;

    // 1️⃣ Validate inputs
    if (!userPrompt) {
      return res.status(400).json({ error: "userPrompt is required" });
    }

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ error: "keywords must be a non-empty array" });
    }

    // 2️⃣ Initialize Hugging Face client
    const hf = new HfInference(process.env.LLM_API_KEY);

    // 3️⃣ Generate embedding for keywords
    const keywordString = keywords.join(", ");
    console.log("Keywords used for semantic search:", keywordString);

    const embeddingRes = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: keywordString
    });

    if (!embeddingRes || !embeddingRes[0]) {
      console.error("Embedding generation failed:", embeddingRes);
      return res.status(500).json({ error: "Embedding generation failed" });
    }

    const queryEmbedding = embeddingRes[0]; // Array of floats

    // 4️⃣ Retrieve top semantic chunks
    const topChunks = await getTopChunks(queryEmbedding, 10);
    const contextChunks = (topChunks || []).map(formatChunkForContext);
    console.log("Chunks retrieved:", contextChunks.length);

    // 5️⃣ Load previous conversation history (last 6 messages)
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

    // 6️⃣ Generate LLM response
    const llmResponse = await getLLMResponse({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      contextChunks,
      chatHistory
    });

    // 7️⃣ Save conversation
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

    // 8️⃣ Return response to frontend
    res.json({
      aiResponse: llmResponse,
      contextChunks
    });
  } catch (err) {
    console.error("handleChat error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
