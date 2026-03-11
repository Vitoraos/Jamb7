import { supabase } from "../config/supabaseClient.js";
import { getTopChunks } from "../services/semanticSearchService.js";
import { getLLMResponse } from "../services/llmService.js";
import { formatChunkForContext } from "../utils/formatters.js";
import { SYSTEM_PROMPT } from "../config/systemPrompt.js";
import InferenceClient from "@huggingface/inference";
// Create Hugging Face client
const client = new InferenceClient({ apiKey: process.env.HF_TOKEN });

/**
 * Handle chat requests from frontend
 */
export async function handleChat(req, res) {
  try {

    const { userPrompt, keywords, userId = 1 } = req.body;

    // 1️⃣ Generate embedding for keywords
    const queryEmbedding = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: keywords
    });

    if (!queryEmbedding) {
      console.error("Embedding generation failed");
      return res.status(500).json({ error: "Embedding generation failed" });
    }

    // 2️⃣ Retrieve top similar chunks from Supabase
    const topChunks = await getTopChunks(queryEmbedding, 10);
    const contextChunks = topChunks.map(formatChunkForContext);

    // 3️⃣ Load recent chat history
    const { data: history, error: historyError } = await supabase
      .from("chat_history")
      .select("user_prompt, ai_response")
      .order("created_at", { ascending: false })
      .limit(6);

    if (historyError) {
      console.error("Error loading chat history:", historyError);
    }

    const chatHistory =
      history?.reverse().map(h => ({
        user_prompt: h.user_prompt,
        ai_response: h.ai_response
      })) || [];

    // 4️⃣ Generate LLM response
    const llmResponse = await getLLMResponse({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      contextChunks,
      chatHistory
    });

    // 5️⃣ Save chat history
    const { error: saveError } = await supabase
      .from("chat_history")
      .insert([
        {
          user_id: userId,
          user_prompt: userPrompt,
          keywords,
          ai_response: llmResponse
        }
      ]);

    if (saveError) {
      console.error("Error saving chat history:", saveError);
    }

    // 6️⃣ Send response to frontend
    res.json({
      aiResponse: llmResponse,
      contextChunks
    });

  } catch (err) {

    console.error("handleChat error:", err);
    res.status(500).json({ error: "Internal Server Error" });

  }
}
