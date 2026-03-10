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
    const embeddingRes = await fetch(
  "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.HF_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: keywords
    })
  }
);

const embeddingData = await embeddingRes.json();
const queryEmbedding = embeddingData[0];
  
    // 2️⃣ Get top chunks from Supabase
    const topChunks = await getTopChunks(queryEmbedding, 10);
    const contextChunks = topChunks.map(formatChunkForContext);
    // 2️.5 NEW: Load previous conversation history
    const { data: history } = await supabase
      .from("chat_history")
      .select("user_prompt, ai_response")
      .order("created_at", { ascending: false })
      .limit(6);

    const historyText = history
      ?.reverse()
      .map(h => `User: ${h.user_prompt}\nAI: ${h.ai_response}`)
      .join("\n\n") || "";
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
