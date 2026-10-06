import { afterEach, describe, expect, it, vi } from "vitest";
import {
    apiRequest,
    getAccessToken,
    resolveApiUrl,
    setAccessToken,
} from "../src/services/api/apiClient";

describe("Spring API client", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("attaches a stored JWT and decodes JSON responses", async () => {
        const store = new Map();
        vi.stubGlobal("localStorage", {
            getItem: (key) => store.get(key) ?? null,
            setItem: (key, value) => store.set(key, value),
            removeItem: (key) => store.delete(key),
        });
        setAccessToken("signed-token");
        const fetchMock = vi.fn().mockResolvedValue(new Response('{"status":"ok"}'));
        vi.stubGlobal("fetch", fetchMock);

        await expect(apiRequest("/api/health")).resolves.toEqual({ status: "ok" });
        expect(getAccessToken()).toBe("signed-token");
        expect(fetchMock.mock.calls[0][1].headers.get("Authorization")).toBe("Bearer signed-token");
    });

    it("surfaces server errors to the UI", async () => {
        vi.stubGlobal("localStorage", { getItem: () => null });
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
            new Response('{"error":"Invalid email or password"}', { status: 401 })
        ));

        await expect(apiRequest("/api/auth/login")).rejects.toThrow("Invalid email or password");
    });

    it("resolves local image paths against the frontend origin", () => {
        vi.stubGlobal("window", { location: { origin: "http://localhost:5173" } });
        expect(resolveApiUrl("/api/images/123.png"))
            .toBe("http://localhost:5173/api/images/123.png");
        expect(resolveApiUrl("https://res.cloudinary.com/demo/image.jpg"))
            .toBe("https://res.cloudinary.com/demo/image.jpg");
    });
});
