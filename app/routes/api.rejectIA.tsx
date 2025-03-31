import type { ActionFunction } from "react-router-dom";

// TypeScript interfaces
interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  resource_type: string;
}

interface CloudinaryResponse {
  resources: CloudinaryResource[];
  total_count: number;
}

export const action: ActionFunction = async ({ request }: { request: Request }) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { id } = await request.json();
    
    if (!id) {
      return Response.json({ error: "Missing required field: id" }, { status: 400 });
    }

    // Cloudinary API credentials
    const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.VITE_CLOUDINARY_API_KEY;
    const apiSecret = process.env.VITE_CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
      return Response.json({ error: "Missing Cloudinary credentials" }, { status: 500 });
    }
    
    // First, search for all resources with the ID tag
    const searchResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/search?expression=tags=${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(apiKey + ":" + apiSecret).toString("base64")}`,
        },
      }
    );
    
    if (!searchResponse.ok) {
      const searchError = await searchResponse.json();
      return Response.json({ error: "Cloudinary search failed", details: searchError }, { status: 500 });
    }
    
    const resources: CloudinaryResponse = await searchResponse.json();
    
    if (resources.total_count === 0) {
      return Response.json({ error: "No resources found with the provided ID" }, { status: 404 });
    }
    
    // Delete each resource using the public_id
    const deletePromises = resources.resources.map(async (resource: CloudinaryResource) => {
      return fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resource.resource_type}/destroy`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(apiKey + ":" + apiSecret).toString("base64")}`,
          },
          body: JSON.stringify({
            public_id: resource.public_id
          }),
        }
      );
    });
    
    await Promise.all(deletePromises);
    
    return Response.json({ success: true, message: "IA rejected and deleted successfully" });
  } catch (error: unknown) {
    console.error("Error rejecting IA:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: "Failed to reject IA", details: errorMessage }, { status: 500 });
  }
}; 