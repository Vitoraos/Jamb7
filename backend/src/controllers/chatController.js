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
    const { userPrompt, keywords, userId = 1 } = req.body;

    // Require keywords for semantic search
    if (!keywords || keywords.trim() === "") {
      return res.status(400).json({
        error: "keywords are required for semantic search"
      });
    }

    // Initialize Hugging Face SDK
    const hf = new HfInference(process.env.LLM_API_KEY);

    console.log("Semantic search keywords:", keywords);

    // Generate embedding ONLY from keywords
    const embeddingRes = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: keywords
    });

    if (!embeddingRes || !embeddingRes[0]) {
      console.error("Embedding generation failed:", embeddingRes);
      return res.status(500).json({
        error: "Embedding generation failed"
      });
    }

    const queryEmbedding = embeddingRes[0];

    // Run semantic search
    const topChunks = await getTopChunks(queryEmbedding, 10);
    const contextChunks = topChunks.map(formatChunkForContext);

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

    // Generate LLM response
    const llmResponse = await getLLMResponse({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      contextChunks,
      chatHistory
    });

    // Save chat history
    const { error } = await supabase
      .from("chat_history")
      .insert([
        {
          user_id: userId,
          user_prompt: userPrompt,
          keywords,
          ai_response: llmResponse
        }
      ]);

    if (error) console.error("Error saving chat history:", error);

    // Send response
    res.json({
      aiResponse: llmResponse,
      contextChunks
    });

  } catch (err) {
    console.error("handleChat error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
