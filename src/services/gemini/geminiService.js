import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export const analyzeCommunityIssue = async (base64Image) => {
  try {
    const imageData = base64Image.split(",")[1];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageData,
          },
        },
        {
          text: `
Analyze this image.

If it contains a civic/community issue, return ONLY JSON:

{
  "category": "",
  "severity": "",
  "confidence": 0,
  "risk": "",
  "department": "",
  "priority": ""
}

If it is NOT a civic/community issue, return:

{
  "category": "Not a Community Issue",
  "severity": "N/A",
  "confidence": 100,
  "risk": "None",
  "department": "None",
  "priority": "None"
}

Return JSON only.
`,
        },
      ],
    });

    return response.text;
  } catch (error) {
  console.error(error);

  return JSON.stringify({
    category: "Service Temporarily Unavailable",
    severity: "Unknown",
    confidence: 0,
    risk: "Gemini API unavailable",
    department: "Unknown",
    priority: "Low"
  });
}
};