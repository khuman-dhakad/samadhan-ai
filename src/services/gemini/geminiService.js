import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY is not configured in environment variables.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
  });
};

/**
 * Robustly parses and validates Gemini AI response into structured civic report data.
 * @param {string} rawText - The text response returned from Gemini.
 * @returns {object} - Validated report analysis object.
 */
export const sanitizeAndParseGeminiResponse = (rawText) => {
  if (!rawText || typeof rawText !== "string") {
    return createFallbackAnalysis("Empty or invalid AI response");
  }

  try {
    // 1. Try stripping markdown code fences
    let cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // 2. Extract substring between first '{' and last '}'
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(cleaned);

    // 3. Normalize and validate fields with safe fallbacks
    const normalizedPriority = normalizePriority(parsed.priority, parsed.severity);
    const normalizedSeverity = normalizeSeverity(parsed.severity);

    return {
      category: (parsed.category || "General Civic Issue").trim(),
      severity: normalizedSeverity,
      confidence: typeof parsed.confidence === "number" ? Math.min(100, Math.max(0, Math.round(parsed.confidence))) : 85,
      risk: (parsed.risk || "Potential public inconvenience").trim(),
      department: (parsed.department || "Municipal Corporation").trim(),
      priority: normalizedPriority,
    };
  } catch (parseError) {
    console.warn("Failed to parse Gemini JSON directly, applying fallback extraction:", parseError);
    return createFallbackAnalysis("Automated Civic Issue Detection");
  }
};

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

/**
 * Analyzes a community issue image using Gemini Multimodal AI.
 * @param {string} base64Image - Base64 Data URL or raw base64 string.
 * @returns {Promise<string>} - Stringified JSON analysis.
 */
export const analyzeCommunityIssue = async (base64Image) => {
  if (!base64Image) {
    throw new Error("No image data provided for AI analysis");
  }

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Gemini API key is not configured. Using intelligent offline categorization fallback.");
      return JSON.stringify(createFallbackAnalysis("Gemini API key not configured"));
    }

    // Extract MIME type if data URL
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

    const ai = getGeminiClient();
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
          text: `
You are an expert AI civic infrastructure analyst for the Samadhan AI platform.
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

Return JSON only, with no markdown code blocks or extra conversational text.
`,
        },
      ],
    });

    const text = response.text || "";
    // Validate output through sanitizer before returning
    const validated = sanitizeAndParseGeminiResponse(text);
    return JSON.stringify(validated);
  } catch (error) {
    console.error("Gemini API Analysis Error:", error);
    return JSON.stringify(createFallbackAnalysis("Gemini analysis error: " + (error?.message || "Service error")));
  }
};