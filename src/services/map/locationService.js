// In-memory cache to prevent duplicate geocoding requests for nearby coordinates
const geocodeCache = new Map();

/**
 * Validates geographic coordinate values.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {boolean}
 */
export function isValidCoordinate(latitude, longitude) {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Reverse geocodes latitude and longitude to a human-readable location name.
 * Uses /api/geocode backend proxy for compliant User-Agent headers, with graceful fallback.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string>}
 */
export async function getLocationName(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!isValidCoordinate(lat, lng)) {
    return "Unknown Location";
  }

  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  const fallback = `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    // First attempt: Backend serverless proxy with compliant User-Agent
    const proxyResponse = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (proxyResponse && proxyResponse.ok) {
      const data = await proxyResponse.json().catch(() => null);
      if (data?.locationName) {
        geocodeCache.set(cacheKey, data.locationName);
        return data.locationName;
      }
    }

    // Direct fallback with timeout if proxy is not reachable
    const directController = new AbortController();
    const directTimeoutId = setTimeout(() => directController.abort(), 5000);

    const directResponse = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        signal: directController.signal,
        headers: { Accept: "application/json" },
      }
    );

    clearTimeout(directTimeoutId);

    if (directResponse.ok) {
      const data = await directResponse.json();
      const result = data.display_name || fallback;
      geocodeCache.set(cacheKey, result);
      return result;
    }

    return fallback;
  } catch (error) {
    console.warn("Location reverse geocoding fallback invoked:", error?.message || error);
    return fallback;
  }
}