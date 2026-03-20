// backend/src/controllers/keywordController.js

import { extractKeywords } from "../services/keywordService.js";

export async function handleKeywords(req, res) {
  try {
    const { userPrompt, subject } = req.body;

    if (!userPrompt) {
      return res.status(400).json({ error: "userPrompt is required" });
    }
    if (!subject) {
      return res.status(400).json({ error: "subject is required" });
    }

    const keywords = await extractKeywords(userPrompt, subject);

    res.json({ keywords });

  } catch (err) {
    console.error("handleKeywords error:", err);
    res.status(500).json({ error: "Failed to extract keywords" });
  }
}