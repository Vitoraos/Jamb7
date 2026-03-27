import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Enable CORS for your Vercel URL
app.use(cors({
  origin: process.env.FRONTEND_URL || "*", 
  methods: ["POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json({ limit: '50mb' }));

app.post("/api/generate-quiz", async (req, res) => {
  try {
    const { text, images } = req.body;
    const parts: any[] = [];
    
    if (text) {
      parts.push({ text: `Generate a high-retention quiz based on the following text. 
      The quiz should include a mix of multiple-choice, true-false, and short-answer questions.
      Focus on key concepts, active recall, and spaced repetition principles.
      Provide clear explanations for each answer.
      
      Text: ${text.substring(0, 15000)}` });
    } else if (images) {
      parts.push({ text: `Generate a high-retention quiz based on these document images. 
      Perform OCR and then create a mix of multiple-choice, true-false, and short-answer questions.
      Focus on key concepts, active recall, and spaced repetition principles.
      Provide clear explanations for each answer.` });
      
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
                  type: { type: Type.STRING, enum: ['multiple-choice', 'true-false', 'short-answer'] },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] }
                },
                required: ['id', 'type', 'question', 'correctAnswer', 'explanation', 'difficulty']
              }
            }
          },
          required: ['title', 'description', 'questions']
        }
      }
    });

    res.json(JSON.parse(response.text()));
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`Backend running on port ${PORT}`));
