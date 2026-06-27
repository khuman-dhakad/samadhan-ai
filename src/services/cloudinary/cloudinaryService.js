export const uploadImage = async (file) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append(
        "upload_preset",
        "samadhan-ai"
    );

    try {
        const response = await fetch(
            "https://api.cloudinary.com/v1_1/tlewsfoh/image/upload",
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await response.json();

        console.log(
            "Cloudinary Response:",
            data
        );

        return data.secure_url;
    } catch (error) {
        console.error(
            "Cloudinary Upload Error:",
            error
        );

        throw error;
    }
};