// backend/src/controllers/chatController.js
import { supabase } from "../config/supabaseClient.js";
import { getTopChunks } from "../services/semanticSearchService.js";
import { getLLMResponse } from "../services/llmService.js";
import { formatChunkForContext } from "../utils/formatters.js";
import { SYSTEM_PROMPT } from "../config/systemPrompt.js";
import { HfInference } from "@huggingface/inference";

/**
 * Handle chat requests from frontend
 */
export async function handleChat(req, res) {
  try {
    const { userPrompt, keywords, userId = 1 } = req.body; // Default userId

    // 1️⃣ Initialize Hugging Face SDK
    const hf = new HfInference(process.env.HF_TOKEN);

    // 2️⃣ Generate embedding for keywords
    const embeddingRes = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: keywords
    });

    if (!embeddingRes || !embeddingRes[0]) {
      console.error("Failed to get embedding:", embeddingRes);
      return res.status(500).json({ error: "Embedding generation failed" });
    }

    const queryEmbedding = embeddingRes[0]; // array of floats

    // 3️⃣ Get top chunks from Supabase semantic search
    const topChunks = await getTopChunks(queryEmbedding, 10);
    const contextChunks = topChunks.map(formatChunkForContext);

    // 4️⃣ Load previous conversation history (last 6 messages)
    const { data: history } = await supabase
      .from("chat_history")
      .select("user_prompt, ai_response")
      .order("created_at", { ascending: false })
      .limit(6);

    const chatHistory = history
      ?.reverse()
      .map(h => ({ user_prompt: h.user_prompt, ai_response: h.ai_response })) || [];

    // 5️⃣ Generate Hugging Face LLM response
    const llmResponse = await getLLMResponse({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      contextChunks,
      chatHistory
    });

    // 6️⃣ Save chat to history
    const { error } = await supabase
      .from("chat_history")
      .insert([{
        user_id: userId,
        user_prompt: userPrompt,
        keywords,
        ai_response: llmResponse
      }]);

    if (error) console.error("Error saving chat history:", error);

    // 7️⃣ Respond to frontend
    res.json({ aiResponse: llmResponse, contextChunks });
  } catch (err) {
    console.error("handleChat error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
