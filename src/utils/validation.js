/**
 * Pure validation utilities for geographic coordinates, civic reports, and media uploads.
 */

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
];

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_STATUSES = ["Reported", "Under Review", "In Progress", "Resolved"];
const ALLOWED_PRIORITIES = ["High", "Medium", "Low", "None"];
const ALLOWED_SEVERITIES = ["High", "Medium", "Low", "N/A"];

/**
 * Validates whether latitude and longitude are within standard geographical boundaries.
 * @param {number|string} latitude
 * @param {number|string} longitude
 * @returns {boolean}
 */
export function isValidCoordinate(latitude, longitude) {
  if (
    latitude === null ||
    latitude === undefined ||
    longitude === null ||
    longitude === undefined
  ) {
    return false;
  }

  if (typeof latitude === "string" && latitude.trim() === "") return false;
  if (typeof longitude === "string" && longitude.trim() === "") return false;

  const lat = Number(latitude);
  const lng = Number(longitude);

  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90.0 &&
    lat <= 90.0 &&
    lng >= -180.0 &&
    lng <= 180.0
  );
}

/**
 * Validates an image file's type and size.
 * @param {File|Blob|{type: string, size: number}} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: "No image file provided." };
  }

  if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported file type (${file.type}). Allowed formats: JPEG, PNG, WEBP.`,
    };
  }

  if (typeof file.size === "number" && file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeMb}MB) exceeds the 10MB maximum limit.`,
    };
  }

  return { valid: true };
}

/**
 * Validates an issue report against the public Firestore security rules schema.
 * Ensures that no private fields (such as userEmail) are leaked to public documents.
 * @param {object} reportData
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateReportData(reportData) {
  const errors = [];

  if (!reportData || typeof reportData !== "object") {
    return { valid: false, errors: ["Report payload must be an object."] };
  }

  // PII check: Prohibit email addresses and personal phone numbers on public documents
  if ("userEmail" in reportData && reportData.userEmail) {
    errors.push("Public report document must not contain personal 'userEmail'.");
  }

  if ("phoneNumber" in reportData && reportData.phoneNumber) {
    errors.push("Public report document must not contain 'phoneNumber'.");
  }

  // Category
  if (!reportData.category || typeof reportData.category !== "string" || reportData.category.trim().length < 2) {
    errors.push("Category must be a non-empty string of at least 2 characters.");
  } else if (reportData.category.length > 100) {
    errors.push("Category must not exceed 100 characters.");
  }

  // Coordinates
  if (!isValidCoordinate(reportData.latitude, reportData.longitude)) {
    errors.push("Coordinates must be valid numbers (-90..90 lat, -180..180 lng).");
  }

  // Status
  const status = reportData.status || "Reported";
  if (!ALLOWED_STATUSES.includes(status)) {
    errors.push(`Status must be one of: ${ALLOWED_STATUSES.join(", ")}.`);
  }

  // Priority & Severity
  if (reportData.priority && !ALLOWED_PRIORITIES.includes(reportData.priority)) {
    errors.push(`Priority must be one of: ${ALLOWED_PRIORITIES.join(", ")}.`);
  }

  if (reportData.severity && !ALLOWED_SEVERITIES.includes(reportData.severity)) {
    errors.push(`Severity must be one of: ${ALLOWED_SEVERITIES.join(", ")}.`);
  }

  // Confidence
  if (typeof reportData.confidence === "number") {
    if (reportData.confidence < 0 || reportData.confidence > 100) {
      errors.push("Confidence score must be between 0 and 100.");
    }
  }

  // Image URL
  if (!reportData.imageUrl || typeof reportData.imageUrl !== "string") {
    errors.push("A valid imageUrl string is required.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
