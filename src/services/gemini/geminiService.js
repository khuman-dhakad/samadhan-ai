export const normalizePriority = (priority, severity) => {
  if (!priority && !severity) return "Medium";
  const val = (priority || severity || "").toString().toLowerCase();
  if (val.includes("high") || val.includes("critical") || val.includes("urgent")) return "High";
  if (val.includes("low") || val.includes("minor")) return "Low";
  if (val.includes("none") || val.includes("n/a")) return "None";
  return "Medium";
};

export const normalizeSeverity = (severity) => {
  if (!severity) return "Medium";
  const val = severity.toString().toLowerCase();
  if (val.includes("high") || val.includes("severe") || val.includes("critical")) return "High";
  if (val.includes("low") || val.includes("minor")) return "Low";
  if (val.includes("none") || val.includes("n/a")) return "N/A";
  return "Medium";
};

export const createFallbackAnalysis = (reason) => ({
  category: "General Community Issue",
  severity: "Medium",
  confidence: 75,
  risk: reason || "Requires on-site municipal verification",
  department: "Municipal Corporation / Public Works",
  priority: "Medium",
});

/**
 * Robustly parses and validates Gemini AI response into structured civic report data.
 * @param {string|object} rawText - The text response or object returned from Gemini.
 * @returns {object} - Validated report analysis object.
 */
export const sanitizeAndParseGeminiResponse = (rawText) => {
  if (!rawText) {
    return createFallbackAnalysis("Empty or invalid AI response");
  }

  if (typeof rawText === "object") {
    return {
      category: (rawText.category || "General Civic Issue").trim(),
      severity: normalizeSeverity(rawText.severity),
      confidence:
        typeof rawText.confidence === "number"
          ? Math.min(100, Math.max(0, Math.round(rawText.confidence)))
          : 85,
      risk: (rawText.risk || "Potential public inconvenience").trim(),
      department: (rawText.department || "Municipal Corporation").trim(),
      priority: normalizePriority(rawText.priority, rawText.severity),
    };
  }

  if (typeof rawText !== "string") {
    return createFallbackAnalysis("Unsupported AI response format");
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
    console.warn("Failed to parse Gemini JSON, using fallback extraction:", parseError?.message || parseError);
    return createFallbackAnalysis("Automated Civic Issue Detection");
  }
};

/**
 * Analyzes a community issue image via the secure backend API endpoint.
 * Keeps GEMINI_API_KEY off the client bundle completely.
 * @param {string} base64Image - Base64 Data URL or raw base64 string.
 * @returns {Promise<string>} - Stringified JSON analysis matching legacy contract.
 */
export const analyzeCommunityIssue = async (base64Image) => {
  if (!base64Image) {
    throw new Error("No image data provided for AI analysis");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch("/api/analyze-issue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64Image }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.warn(`Backend AI returned status ${response.status}: ${errorText}`);
      return JSON.stringify(createFallbackAnalysis("Civic Issue Detection (Standard Triage)"));
    }

    const result = await response.json();
    const data = result?.data || result;
    const validated = sanitizeAndParseGeminiResponse(data);
    return JSON.stringify(validated);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      console.warn("AI analysis request timed out after 25s, applying fallback.");
      return JSON.stringify(createFallbackAnalysis("AI analysis timed out; automated triage applied"));
    }
    console.error("Gemini API Client Analysis Error:", error?.message || error);
    return JSON.stringify(
      createFallbackAnalysis("Civic Issue Detection (Network/Service fallback)")
    );
  }
};