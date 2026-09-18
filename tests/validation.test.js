import { describe, it, expect } from "vitest";
import {
  isValidCoordinate,
  validateImageFile,
  validateReportData,
} from "../src/utils/validation";

describe("Geographic Coordinate Validation", () => {
  it("accepts valid global coordinates", () => {
    expect(isValidCoordinate(23.2599, 77.4126)).toBe(true); // Bhopal, India
    expect(isValidCoordinate(0, 0)).toBe(true);
    expect(isValidCoordinate(-90, -180)).toBe(true);
    expect(isValidCoordinate(90, 180)).toBe(true);
    expect(isValidCoordinate("28.6139", "77.2090")).toBe(true); // New Delhi as strings
  });

  it("rejects invalid or out-of-range coordinates", () => {
    expect(isValidCoordinate(91, 0)).toBe(false); // Latitude > 90
    expect(isValidCoordinate(-91, 0)).toBe(false); // Latitude < -90
    expect(isValidCoordinate(0, 181)).toBe(false); // Longitude > 180
    expect(isValidCoordinate(0, -181)).toBe(false); // Longitude < -180
    expect(isValidCoordinate(NaN, 50)).toBe(false);
    expect(isValidCoordinate(50, NaN)).toBe(false);
    expect(isValidCoordinate("not_a_number", 50)).toBe(false);
    expect(isValidCoordinate(null, null)).toBe(false);
  });
});

describe("Image File Pre-Upload Validation", () => {
  it("validates correct image files", () => {
    const validJpg = { type: "image/jpeg", size: 2 * 1024 * 1024 };
    const validPng = { type: "image/png", size: 5 * 1024 * 1024 };
    const validWebp = { type: "image/webp", size: 8 * 1024 * 1024 };

    expect(validateImageFile(validJpg).valid).toBe(true);
    expect(validateImageFile(validPng).valid).toBe(true);
    expect(validateImageFile(validWebp).valid).toBe(true);
  });

  it("rejects files exceeding 10MB limit", () => {
    const oversizedFile = { type: "image/jpeg", size: 12 * 1024 * 1024 };
    const result = validateImageFile(oversizedFile);

    expect(result.valid).toBe(false);
    expect(result.error).toContain("exceeds the 10MB maximum limit");
  });

  it("rejects non-image or prohibited file types", () => {
    const pdfFile = { type: "application/pdf", size: 1024 };
    const exeFile = { type: "application/x-msdownload", size: 1024 };

    expect(validateImageFile(pdfFile).valid).toBe(false);
    expect(validateImageFile(exeFile).valid).toBe(false);
  });

  it("handles missing file parameter safely", () => {
    expect(validateImageFile(null).valid).toBe(false);
  });
});

describe("Report Schema & PII Protection Validation", () => {
  it("passes valid public civic report without PII", () => {
    const validReport = {
      category: "Broken Water Pipe",
      latitude: 23.25,
      longitude: 77.41,
      status: "Reported",
      priority: "High",
      severity: "High",
      confidence: 90,
      imageUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    };

    const validation = validateReportData(validReport);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("fails and detects personal userEmail in public report document", () => {
    const reportWithPii = {
      category: "Broken Water Pipe",
      latitude: 23.25,
      longitude: 77.41,
      status: "Reported",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      userEmail: "citizen@example.com", // PII leak!
    };

    const validation = validateReportData(reportWithPii);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes("userEmail"))).toBe(true);
  });

  it("rejects report with invalid coordinates or missing image", () => {
    const invalidReport = {
      category: "Streetlight outage",
      latitude: 120.0, // Invalid latitude
      longitude: 77.0,
      imageUrl: "",
    };

    const validation = validateReportData(invalidReport);
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThanOrEqual(2);
  });
});
