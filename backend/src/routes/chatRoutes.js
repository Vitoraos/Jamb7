import express from "express";
import { handleChat } from "../controllers/chatController.js";
import { handleKeywords } from "../controllers/keywordController.js";

const router = express.Router();

// Step 1 — frontend calls this first to extract keywords from the student prompt
router.post("/keywords", handleKeywords);

// Step 2 — frontend calls this with extracted keywords + original prompt
router.post("/chat", handleChat);

export default router;