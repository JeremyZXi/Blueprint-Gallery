export const uploadToCloudinary = async (file: File, identifier: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "your_upload_preset"); // Set up in Cloudinary
    formData.append("tags", identifier); // Assigns the same tag for PDFs & Photos

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    return response.json(); // Return uploaded file info
};