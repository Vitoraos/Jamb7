
import { supabase } from "../config/supabaseClient.js";
import { getTopChunks } from "../services/semanticSearchService.js";
import { getLLMResponse } from "../services/llmService.js";
import { formatChunkForContext } from "../utils/formatters.js";
import { SYSTEM_PROMPT } from "../config/systemPrompt.js";

/**
 * Handle chat requests from frontend
 */
export async function handleChat(req, res) {
  try {
    const { userPrompt, keywords, userId = 1 } = req.body; // Default userId for personal use

    // 1️⃣ Get embedding for keywords from Hugging Face
    const embeddingRes = await fetch(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: keywords })
      }
    );

    const embeddingData = await embeddingRes.json();
    const queryEmbedding = Array.isArray(embeddingData[0]) ? embeddingData[0] : embeddingData[0].embedding;

    // 2️⃣ Get top chunks from Supabase semantic search
    const topChunks = await getTopChunks(queryEmbedding, 10);
    const contextChunks = topChunks.map(formatChunkForContext);

    // 3️⃣ Load previous conversation history (last 6 messages)
    const { data: history } = await supabase
      .from("chat_history")
      .select("user_prompt, ai_response")
      .order("created_at", { ascending: false })
      .limit(6);

    const chatHistory = history
      ?.reverse()
      .map(h => ({ user_prompt: h.user_prompt, ai_response: h.ai_response })) || [];

    // 4️⃣ Generate Hugging Face LLM response
    const llmResponse = await getHFResponse({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      contextChunks,
      chatHistory
    });

    // 5️⃣ Save chat to history
    const { error } = await supabase
      .from("chat_history")
      .insert([{
        user_id: userId,
        user_prompt: userPrompt,
        keywords,
        ai_response: llmResponse
      }]);

    if (error) console.error("Error saving chat history:", error);

    // 6️⃣ Respond to frontend
    res.json({ aiResponse: llmResponse, contextChunks });
  } catch (err) {
    console.error("handleChat error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
