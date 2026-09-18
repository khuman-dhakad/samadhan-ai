import { describe, it, expect } from "vitest";
import {
  sanitizeAndParseGeminiResponse,
  normalizePriority,
  normalizeSeverity,
  createFallbackAnalysis,
} from "../src/services/gemini/geminiService";

describe("Gemini AI Response Parsing & Normalization", () => {
  it("parses clean JSON response correctly", () => {
    const jsonText = JSON.stringify({
      category: "Deep Pothole",
      severity: "High",
      confidence: 92,
      risk: "Severe tire blowouts and vehicular disruption",
      department: "Public Works Department",
      priority: "High",
    });

    const parsed = sanitizeAndParseGeminiResponse(jsonText);
    expect(parsed.category).toBe("Deep Pothole");
    expect(parsed.severity).toBe("High");
    expect(parsed.priority).toBe("High");
    expect(parsed.confidence).toBe(92);
    expect(parsed.department).toBe("Public Works Department");
  });

  it("strips markdown code fences ```json ... ```", () => {
    const rawAiOutput = `Here is the analysis:
\`\`\`json
{
  "category": "Overflowing Garbage Dumpster",
  "severity": "Medium",
  "confidence": 88,
  "risk": "Public health hazard and stray animals",
  "department": "Sanitation Department",
  "priority": "Medium"
}
\`\`\`
Hope this helps!`;

    const parsed = sanitizeAndParseGeminiResponse(rawAiOutput);
    expect(parsed.category).toBe("Overflowing Garbage Dumpster");
    expect(parsed.severity).toBe("Medium");
    expect(parsed.confidence).toBe(88);
  });

  it("handles broken or truncated responses by returning safe fallback", () => {
    const brokenText = "Sorry, I could not detect any issues properly {broken";
    const fallback = sanitizeAndParseGeminiResponse(brokenText);

    expect(fallback.category).toBe("General Community Issue");
    expect(fallback.severity).toBe("Medium");
    expect(fallback.confidence).toBe(75);
    expect(fallback.priority).toBe("Medium");
  });

  it("handles empty or null inputs gracefully", () => {
    const emptyFallback = sanitizeAndParseGeminiResponse("");
    expect(emptyFallback.category).toBe("General Community Issue");

    const nullFallback = sanitizeAndParseGeminiResponse(null);
    expect(nullFallback.category).toBe("General Community Issue");
  });

  it("correctly normalizes priority variants", () => {
    expect(normalizePriority("CRITICAL", "High")).toBe("High");
    expect(normalizePriority("urgent", "Medium")).toBe("High");
    expect(normalizePriority("minor", "Low")).toBe("Low");
    expect(normalizePriority("none", "N/A")).toBe("None");
    expect(normalizePriority(null, null)).toBe("Medium");
  });

  it("correctly normalizes severity variants", () => {
    expect(normalizeSeverity("severe")).toBe("High");
    expect(normalizeSeverity("critical")).toBe("High");
    expect(normalizeSeverity("minor")).toBe("Low");
    expect(normalizeSeverity("n/a")).toBe("N/A");
    expect(normalizeSeverity(undefined)).toBe("Medium");
  });

  it("createFallbackAnalysis outputs standard contract fields", () => {
    const fallback = createFallbackAnalysis("Custom offline reason");
    expect(fallback).toHaveProperty("category");
    expect(fallback).toHaveProperty("severity");
    expect(fallback).toHaveProperty("confidence");
    expect(fallback).toHaveProperty("risk", "Custom offline reason");
    expect(fallback).toHaveProperty("department");
    expect(fallback).toHaveProperty("priority");
  });
});
