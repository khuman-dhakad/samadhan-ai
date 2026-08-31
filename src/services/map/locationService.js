/**
 * Reverse geocodes latitude and longitude to a human-readable location name via OpenStreetMap Nominatim.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string>}
 */
export async function getLocationName(latitude, longitude) {
    if (typeof latitude !== "number" || typeof longitude !== "number" || isNaN(latitude) || isNaN(longitude)) {
        return "Unknown Location";
    }

    const fallback = `Coordinates (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
                signal: controller.signal,
                headers: {
                    "Accept": "application/json",
                },
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            return fallback;
        }

        const data = await response.json();
        return data.display_name || fallback;
    } catch (error) {
        console.warn("Location reverse geocoding warning:", error?.message || error);
        return fallback;
    }
}