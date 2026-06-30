export async function getLocationName(latitude, longitude) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );

        const data = await response.json();

        return data.display_name || "Unknown Location";
    } catch (error) {
        console.error("Location Error:", error);
        return "Unknown Location";
    }
}