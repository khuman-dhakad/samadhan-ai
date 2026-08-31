const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "tlewsfoh";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "samadhan-ai";

/**
 * Uploads an image file to Cloudinary and returns the secure URL.
 * @param {File} file - The image file to upload.
 * @returns {Promise<string>} - The secure HTTPS URL of the uploaded image.
 */
export const uploadImage = async (file) => {
    if (!file) {
        throw new Error("No image file provided for upload");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await response.json();

        if (!response.ok || (!data.secure_url && !data.url)) {
            const errorMsg = data?.error?.message || `Cloudinary upload failed with status ${response.status}`;
            throw new Error(errorMsg);
        }

        return data.secure_url || data.url;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw error;
    }
};