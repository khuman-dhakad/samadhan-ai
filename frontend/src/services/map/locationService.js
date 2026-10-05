import { apiRequest } from "../api/apiClient";

const geocodeCache = new Map();

export function isValidCoordinate(latitude, longitude) {
    if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
        return false;
    }
    if (typeof latitude === "string" && latitude.trim() === "") return false;
    if (typeof longitude === "string" && longitude.trim() === "") return false;
    const lat = Number(latitude);
    const lng = Number(longitude);
    return Number.isFinite(lat) && Number.isFinite(lng)
        && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export async function getLocationName(latitude, longitude) {
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!isValidCoordinate(lat, lng)) return "Unknown Location";

    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    if (geocodeCache.has(cacheKey)) return geocodeCache.get(cacheKey);

    const fallback = `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    try {
        const response = await apiRequest(
            `/api/geocode?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
            { signal: controller.signal }
        );
        const locationName = response?.locationName || fallback;
        geocodeCache.set(cacheKey, locationName);
        return locationName;
    } catch (error) {
        console.warn("Reverse geocoding failed; using coordinates:", error.message);
        return fallback;
    } finally {
        clearTimeout(timeoutId);
    }
}
