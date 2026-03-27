import express, { Request, Response } from "express";
import { GoogleGenAI, Type } from "@google/genai";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Enable CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json({ limit: "50mb" }));

// Type-safe route
app.post("/api/generate-quiz", async (req: Request, res: Response) => {
  try {
    const { text, images }: { text?: string; images?: string[] } = req.body;
    const parts: any[] = [];

    if (text) {
      parts.push({
        text: `Generate a high-retention quiz based on the following text. 
The quiz should include a mix of multiple-choice, true-false, and short-answer questions.
Focus on key concepts, active recall, and spaced repetition principles.
Provide clear explanations for each answer.

Text: ${text.substring(0, 15000)}`,
      });
    } else if (images && images.length > 0) {
      parts.push({
        text: `Generate a high-retention quiz based on these document images. 
Perform OCR and then create a mix of multiple-choice, true-false, and short-answer questions.
Focus on key concepts, active recall, and spaced repetition principles.
Provide clear explanations for each answer.`,
      });

      images.forEach((base64: string) => {
        parts.push({ inlineData: { mimeType: "image/jpeg", data: base64 } });
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    enum: ["multiple-choice", "true-false", "short-answer"],
                  },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] },
                },
                required: [
                  "id",
                  "type",
                  "question",
                  "correctAnswer",
                  "explanation",
                  "difficulty",
                ],
              },
            },
          },
          required: ["title", "description", "questions"],
        },
      },
    });

    // `.text` is a string property, not a function
    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

// Convert PORT to number safely
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
if (isNaN(PORT)) {
  throw new Error("Invalid PORT environment variable");
}

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
