import { GoogleGenAI } from "@google/genai";

const normalizePriority = (priority, severity) => {
  if (!priority && !severity) return "Medium";
  const val = (priority || severity || "").toString().toLowerCase();
  if (val.includes("high") || val.includes("critical") || val.includes("urgent")) return "High";
  if (val.includes("low") || val.includes("minor")) return "Low";
  if (val.includes("none") || val.includes("n/a")) return "None";
  return "Medium";
};

const normalizeSeverity = (severity) => {
  if (!severity) return "Medium";
  const val = severity.toString().toLowerCase();
  if (val.includes("high") || val.includes("severe") || val.includes("critical")) return "High";
  if (val.includes("low") || val.includes("minor")) return "Low";
  if (val.includes("none") || val.includes("n/a")) return "N/A";
  return "Medium";
};

const createFallbackAnalysis = (reason) => ({
  category: "General Community Issue",
  severity: "Medium",
  confidence: 75,
  risk: reason || "Requires on-site municipal verification",
  department: "Municipal Corporation / Public Works",
  priority: "Medium",
});

export const sanitizeAndParseGeminiResponse = (rawText) => {
  if (!rawText || typeof rawText !== "string") {
    return createFallbackAnalysis("Empty or invalid AI response");
  }

  try {
    let cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(cleaned);

    return {
      category: (parsed.category || "General Civic Issue").trim(),
      severity: normalizeSeverity(parsed.severity),
      confidence:
        typeof parsed.confidence === "number"
          ? Math.min(100, Math.max(0, Math.round(parsed.confidence)))
          : 85,
      risk: (parsed.risk || "Potential public inconvenience").trim(),
      department: (parsed.department || "Municipal Corporation").trim(),
      priority: normalizePriority(parsed.priority, parsed.severity),
    };
  } catch (parseError) {
    console.warn("Failed to parse Gemini JSON directly, applying fallback extraction:", parseError?.message || parseError);
    return createFallbackAnalysis("Automated Civic Issue Detection");
  }
};

/**
 * Serverless API handler for Gemini multimodal analysis.
 * Secures GEMINI_API_KEY on the server; client never touches the secret.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: "Invalid JSON request body" });
      }
    }

    const base64Image = body?.image;
    if (!base64Image || typeof base64Image !== "string") {
      return res.status(400).json({ error: "No valid image data provided for AI analysis" });
    }

    // Protect against excessive payload sizes (> 15MB base64 string)
    if (base64Image.length > 15 * 1024 * 1024) {
      return res.status(413).json({ error: "Image payload exceeds maximum allowed size (10MB)" });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "" || apiKey.includes("your_")) {
      console.warn("GEMINI_API_KEY is not configured on server. Returning graceful fallback.");
      return res.status(200).json({
        success: true,
        data: createFallbackAnalysis("Gemini API key not configured on server"),
      });
    }

    let mimeType = "image/jpeg";
    let rawData = base64Image;

    if (base64Image.includes(",")) {
      const parts = base64Image.split(",");
      const match = parts[0].match(/:(.*?);/);
      if (match && match[1]) {
        mimeType = match[1];
      }
      rawData = parts[1];
    }

    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType,
            data: rawData,
          },
        },
        {
          text: `You are an expert AI civic infrastructure analyst for the Samadhan AI platform.
Analyze this community image carefully.

If it contains a civic or community issue (such as pothole, garbage dump, broken streetlight, open manhole, water leakage, illegal encroachment, fallen tree/wires, damaged pavement, etc.):
Return ONLY valid JSON matching this schema:
{
  "category": "Specific Civic Issue Name",
  "severity": "High | Medium | Low",
  "confidence": 85,
  "risk": "Concise 1-sentence risk summary",
  "department": "Public Works Department | Sanitation Department | Water Supply | Electricity Board | Municipal Corporation",
  "priority": "High | Medium | Low"
}

If the image is NOT a community or civic issue (e.g. personal selfie, indoor pet, screenshot):
{
  "category": "Not a Community Issue",
  "severity": "N/A",
  "confidence": 100,
  "risk": "None",
  "department": "None",
  "priority": "None"
}

Return JSON only, with no markdown code blocks or extra conversational text.`,
        },
      ],
    });

    const rawText = response.text || "";
    const validated = sanitizeAndParseGeminiResponse(rawText);

    return res.status(200).json({
      success: true,
      data: validated,
    });
  } catch (error) {
    const isRateLimited = error?.status === 429 || error?.message?.includes("429");
    console.error("Gemini server analysis error:", error?.message || "Internal error");

    // Return safe structured fallback with 200 so reporting workflow never halts
    return res.status(200).json({
      success: true,
      data: createFallbackAnalysis(
        isRateLimited
          ? "AI service is currently rate-limited; standard triage applied."
          : "Automated Civic Issue Detection (AI service unavailable)"
      ),
      warning: isRateLimited ? "rate_limited" : "ai_error",
    });
  }
}
