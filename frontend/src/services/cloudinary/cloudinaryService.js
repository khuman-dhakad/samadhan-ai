import { apiRequest } from "../api/apiClient";

const ALLOWED_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
]);
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export const validateImageFile = (file) => {
    if (!file) throw new Error("No image file provided for upload.");
    if (file.type && !ALLOWED_IMAGE_TYPES.has(file.type.toLowerCase())) {
        throw new Error("Please upload a JPEG, PNG, WEBP, GIF, or HEIC image.");
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
        throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 10MB limit.`);
    }
};

export async function uploadImage(file) {
    validateImageFile(file);
    const formData = new FormData();
    formData.append("file", file);
    const result = await apiRequest("/api/images", { method: "POST", body: formData });
    if (!result?.secureUrl) throw new Error("Image service did not return an image URL");
    return result.secureUrl;
}
