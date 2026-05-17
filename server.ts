import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Cache for background colors suggests
const emotionColorStore: Record<string, string> = {
  happy: "#FFD700",
  sad: "#1E90FF",
  energetic: "#FF4500",
  calm: "#98FB98",
  mysterious: "#483D8B"
};

// API Route: Get Color based on Emotion or Imagination
app.post("/api/theme", async (req, res) => {
  const { emotion, imagination } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.json({ color: emotionColorStore[emotion] || "#ffffff" });
  }

  try {
    const prompt = imagination 
      ? `Suggest a hex background color code based on this imagination description: "${imagination}". Return only the hex code.`
      : `Suggest a hex background color code based on this emotion: "${emotion}". Return only the hex code.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const hexMatch = response.text?.match(/#[0-9A-Fa-f]{6}/);
    const color = hexMatch ? hexMatch[0] : "#ffffff";
    res.json({ color });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to generate theme" });
  }
});

// API Route: Music Search "from anywhere"
app.post("/api/music/search", async (req, res) => {
  const { query } = req.body;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for music/songs or media content related to "${query}". Return a list of 5 items with their artists and source platform (e.g. YouTube, SoundCloud, Local).
      Format the output as a JSON array of objects: [{ "title": "Song Title", "artist": "Artist Name", "duration": "3:45", "source": "YouTube" }]`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              duration: { type: Type.STRING },
              source: { type: Type.STRING }
            }
          }
        }
      }
    });

    const songs = JSON.parse(response.text || "[]");
    res.json({ songs });
  } catch (error) {
    res.status(500).json({ error: "Failed to search music" });
  }
});

// API Route: Simulator for Payment
app.post("/api/rewards/claim", (req, res) => {
  const { steps } = req.body;
  // Simple logic: 1000 steps = $1 (imaginary)
  const amount = (steps / 1000).toFixed(2);
  res.json({ 
    success: true, 
    message: `Earned ₹${amount} for ${steps} steps!`,
    amount: parseFloat(amount)
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
