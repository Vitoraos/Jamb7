import { supabase } from "../config/supabaseClient.js";
import { getTopChunks } from "../services/semanticSearchService.js";
import { getLLMResponse } from "../services/llmService.js";
import { formatChunkForContext } from "../utils/formatters.js";

/**
 * Handle chat requests from frontend
 */
export async function handleChat(req, res) {
  try {
    const { userPrompt, keywords, userId } = req.body;

    // 1️⃣ Embed keywords (example: call OpenAI embedding API)
    const embeddingRes = await fetch(process.env.EMBEDDING_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.EMBEDDING_API_KEY}` },
      body: JSON.stringify({ input: keywords })
    });
    const embeddingData = await embeddingRes.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // 2️⃣ Get top chunks from Supabase
    const topChunks = await getTopChunks(queryEmbedding, 10);
    const contextChunks = topChunks.map(formatChunkForContext);

    // 3️⃣ Generate LLM response
    const systemPrompt = "You are an expert JAMB tutor and strategist, giving concise, effective answers.";
    const llmResponse = await getLLMResponse({ systemPrompt, userPrompt, contextChunks });

    // 4️⃣ Save chat history
    const { error } = await supabase
      .from("chat_history")
      .insert([{ user_id: userId, user_prompt: userPrompt, keywords, ai_response: llmResponse }]);

    if (error) console.error("Error saving chat history:", error);

    res.json({ aiResponse: llmResponse, contextChunks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
