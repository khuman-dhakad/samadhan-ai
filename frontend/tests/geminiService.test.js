import { describe, expect, it } from "vitest";
import { sanitizeAndParseGeminiResponse } from "../src/services/gemini/geminiService";

describe("Gemini analysis response parsing", () => {
    it("normalizes a valid analysis and bounds confidence", () => {
        const analysis = sanitizeAndParseGeminiResponse({
            category: "Deep pothole",
            severity: "critical",
            confidence: 130,
            risk: "Traffic hazard",
            department: "Public Works",
            priority: "urgent",
        });

        expect(analysis).toEqual({
            category: "Deep pothole",
            severity: "High",
            confidence: 100,
            risk: "Traffic hazard",
            department: "Public Works",
            priority: "High",
        });
    });

    it("parses JSON strings and applies safe field defaults", () => {
        const analysis = sanitizeAndParseGeminiResponse('{"category":"Streetlight outage"}');
        expect(analysis.category).toBe("Streetlight outage");
        expect(analysis.severity).toBe("Medium");
        expect(analysis.confidence).toBe(85);
        expect(analysis.priority).toBe("Medium");
    });

    it("surfaces malformed and unsupported AI responses instead of masking failures", () => {
        expect(() => sanitizeAndParseGeminiResponse("{broken")).toThrow(
            "The AI service returned an invalid analysis"
        );
        expect(() => sanitizeAndParseGeminiResponse(null)).toThrow(
            "The AI service returned an invalid analysis"
        );
    });
});
