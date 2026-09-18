import { describe, it, expect } from "vitest";
import analyzeIssueHandler from "../api/analyze-issue.js";
import geocodeHandler from "../api/geocode.js";

function createMockReqRes({ method = "GET", body = {}, query = {} } = {}) {
  const req = {
    method,
    body,
    query,
  };

  let statusCode = 200;
  const headers = {};
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    setHeader(key, value) {
      headers[key] = value;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    getStatusCode: () => statusCode,
    getData: () => responseData,
  };

  return { req, res };
}

describe("Serverless API Route: /api/analyze-issue", () => {
  it("rejects non-POST requests with 405 Method Not Allowed", async () => {
    const { req, res } = createMockReqRes({ method: "GET" });
    await analyzeIssueHandler(req, res);

    expect(res.getStatusCode()).toBe(405);
    expect(res.getData()).toHaveProperty("error");
  });

  it("rejects requests missing image payload with 400 Bad Request", async () => {
    const { req, res } = createMockReqRes({ method: "POST", body: {} });
    await analyzeIssueHandler(req, res);

    expect(res.getStatusCode()).toBe(400);
    expect(res.getData().error).toContain("No valid image data provided");
  });

  it("rejects oversized image payloads with 413 Payload Too Large", async () => {
    // 16MB string
    const oversizedPayload = "a".repeat(16 * 1024 * 1024);
    const { req, res } = createMockReqRes({
      method: "POST",
      body: { image: oversizedPayload },
    });
    await analyzeIssueHandler(req, res);

    expect(res.getStatusCode()).toBe(413);
    expect(res.getData().error).toContain("exceeds maximum allowed size");
  });

  it("returns fallback analysis when GEMINI_API_KEY is not configured on server", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    const originalViteKey = process.env.VITE_GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.VITE_GEMINI_API_KEY;

    try {
      const { req, res } = createMockReqRes({
        method: "POST",
        body: { image: "data:image/jpeg;base64,dGVzdA==" },
      });
      await analyzeIssueHandler(req, res);

      expect(res.getStatusCode()).toBe(200);
      const data = res.getData();
      expect(data.success).toBe(true);
      expect(data.data.category).toBe("General Community Issue");
      expect(data.data.priority).toBe("Medium");
    } finally {
      if (originalKey) process.env.GEMINI_API_KEY = originalKey;
      if (originalViteKey) process.env.VITE_GEMINI_API_KEY = originalViteKey;
    }
  });
});

describe("Serverless API Route: /api/geocode", () => {
  it("rejects non-GET requests with 405 Method Not Allowed", async () => {
    const { req, res } = createMockReqRes({ method: "POST" });
    await geocodeHandler(req, res);

    expect(res.getStatusCode()).toBe(405);
  });

  it("rejects invalid coordinate parameters with 400 Bad Request", async () => {
    const { req, res } = createMockReqRes({
      method: "GET",
      query: { lat: "999", lng: "0" }, // Invalid latitude
    });
    await geocodeHandler(req, res);

    expect(res.getStatusCode()).toBe(400);
  });
});
