const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
];

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Validates whether Cloudinary client environment variables are configured.
 */
export const isCloudinaryConfigured = () => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  return (
    typeof cloudName === "string" &&
    cloudName.trim() !== "" &&
    !cloudName.includes("your_") &&
    typeof uploadPreset === "string" &&
    uploadPreset.trim() !== "" &&
    !uploadPreset.includes("your_")
  );
};

/**
 * Validates an image file before upload.
 * @param {File|Blob} file
 */
export const validateImageFile = (file) => {
  if (!file) {
    throw new Error("No image file provided for upload.");
  }

  if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    throw new Error(
      `Unsupported file format (${file.type}). Please upload a JPEG, PNG, or WEBP image.`
    );
  }

  if (file.size && file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `File size (${sizeMb}MB) exceeds the maximum allowed limit of 10MB.`
    );
  }
};

/**
 * Uploads an image file to Cloudinary and returns the secure HTTPS URL.
 * Never uses hardcoded fallback credentials.
 * @param {File} file - The image file to upload.
 * @returns {Promise<string>} - The secure HTTPS URL of the uploaded image.
 */
export const uploadImage = async (file) => {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Please define VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your environment."
    );
  }

  validateImageFile(file);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME.trim();
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET.trim();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    // Safely handle non-JSON or HTML gateway error responses
    let data;
    const responseText = await response.text();
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Cloudinary responded with invalid format (Status ${response.status}): ${responseText.substring(0, 100)}`
      );
    }

    if (!response.ok || (!data.secure_url && !data.url)) {
      const errorMsg =
        data?.error?.message ||
        `Cloudinary upload failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data.secure_url || data.url;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(
        "Cloudinary upload timed out after 35 seconds. Please check your network connection and try again.",
        { cause: error }
      );
    }
    console.error("Cloudinary Upload Error:", error);
    throw new Error(error.message || "Failed to upload image to Cloudinary", { cause: error });
  }
};