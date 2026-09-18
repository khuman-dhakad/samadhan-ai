/**
 * Reverse geocoding serverless proxy for OpenStreetMap Nominatim.
 * Supplies compliant User-Agent header and rate-limit safe timeout.
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  const { lat, lng } = req.query || {};

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (
    isNaN(latitude) ||
    isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return res.status(400).json({ error: "Invalid latitude or longitude parameters" });
  }

  const fallback = `Coordinates (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

    const response = await fetch(nominatimUrl, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "Samadhan-AI/1.0 (civic-intelligence-platform; contact=support@samadhan.ai)",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(200).json({
        success: true,
        locationName: fallback,
      });
    }

    const data = await response.json();
    return res.status(200).json({
      success: true,
      locationName: data.display_name || fallback,
    });
  } catch (error) {
    console.warn("Nominatim proxy geocoding warning:", error?.message || error);
    return res.status(200).json({
      success: true,
      locationName: fallback,
    });
  }
}
