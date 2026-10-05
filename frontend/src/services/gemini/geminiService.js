import { apiRequest } from "../api/apiClient";

const normalizePriority = (priority, severity) => {
    const value = (priority || severity || "").toString().toLowerCase();
    if (value.includes("high") || value.includes("critical") || value.includes("urgent")) return "High";
    if (value.includes("low") || value.includes("minor")) return "Low";
    if (value.includes("none") || value.includes("n/a")) return "None";
    return "Medium";
};

const normalizeSeverity = (severity) => {
    const value = (severity || "").toString().toLowerCase();
    if (value.includes("high") || value.includes("severe") || value.includes("critical")) return "High";
    if (value.includes("low") || value.includes("minor")) return "Low";
    if (value.includes("none") || value.includes("n/a")) return "N/A";
    return "Medium";
};

export const sanitizeAndParseGeminiResponse = (value) => {
    let parsed = value;
    if (typeof value === "string") {
        try {
            parsed = JSON.parse(value);
        } catch (error) {
            throw new Error("The AI service returned an invalid analysis", { cause: error });
        }
    }
    if (!parsed || typeof parsed !== "object") {
        throw new Error("The AI service returned an invalid analysis");
    }
    return {
        category: String(parsed.category || "General Civic Issue").trim(),
        severity: normalizeSeverity(parsed.severity),
        confidence: typeof parsed.confidence === "number"
            ? Math.min(100, Math.max(0, Math.round(parsed.confidence)))
            : 85,
        risk: String(parsed.risk || "Potential public inconvenience").trim(),
        department: String(parsed.department || "Municipal Corporation").trim(),
        priority: normalizePriority(parsed.priority, parsed.severity),
    };
};

export async function analyzeCommunityIssue(base64Image) {
    if (!base64Image) throw new Error("No image data provided for AI analysis");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
        const result = await apiRequest("/api/ai/analyze-issue", {
            method: "POST",
            body: JSON.stringify({ image: base64Image }),
            signal: controller.signal,
        });
        return JSON.stringify(sanitizeAndParseGeminiResponse(result.data));
    } catch (error) {
        if (error.name === "AbortError") {
            throw new Error("AI analysis timed out. Please try again.", { cause: error });
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}
