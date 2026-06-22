import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export const testGeminiConnection = async () => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Reply with: Samadhan AI Connected",
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};