import { describe, expect, it } from "vitest";
import { isValidCoordinate } from "../src/services/map/locationService";

describe("coordinate validation", () => {
    it("accepts valid numeric and string coordinates at boundaries", () => {
        expect(isValidCoordinate(23.2599, 77.4126)).toBe(true);
        expect(isValidCoordinate("-90", "-180")).toBe(true);
        expect(isValidCoordinate(90, 180)).toBe(true);
    });

    it("rejects invalid, missing, and out-of-range coordinates", () => {
        expect(isValidCoordinate(91, 0)).toBe(false);
        expect(isValidCoordinate(0, -181)).toBe(false);
        expect(isValidCoordinate("nope", 10)).toBe(false);
        expect(isValidCoordinate(10, null)).toBe(false);
    });
});
