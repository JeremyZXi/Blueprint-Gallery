export const fetchIAsFromCloudinary = async () => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
    const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        console.error("Missing Cloudinary API keys in .env.local");
        return [];
    }

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/resources/search?expression=resource_type:image OR resource_type:raw`,
        {
            method: "GET",
            headers: {
                Authorization: `Basic ${btoa(apiKey + ":" + apiSecret)}`,
            },
        }
    );

    if (!response.ok) {
        console.error("Cloudinary API call failed:", response.statusText);
        return [];
    }

    const data = await response.json();
    return data.resources;
};