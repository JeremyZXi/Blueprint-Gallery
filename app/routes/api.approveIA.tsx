import type { ActionFunction } from "react-router-dom";

export const action: ActionFunction = async ({ request }: { request: Request }) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { id } = await request.json();
    
    if (!id) {
      return Response.json({ error: "Missing required field: id" }, { status: 400 });
    }

    // Extract the ID without the prefix
    const submissionId = id.replace("id_", "");
    
    // Cloudinary API credentials
    const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.VITE_CLOUDINARY_API_KEY;
    const apiSecret = process.env.VITE_CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
      return Response.json({ error: "Missing Cloudinary credentials" }, { status: 500 });
    }
    
    // First, get all resources with the ID tag to find their public_ids
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
    
    const resources = await searchResponse.json();
    
    // For each resource, remove the "pending" tag
    const updatePromises = resources.resources.map(async (resource: { public_id: string }) => {
      // Current tags for the resource
      const currentTagsResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/resources/${resource.public_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${Buffer.from(apiKey + ":" + apiSecret).toString("base64")}`,
          },
        }
      );
      
      if (!currentTagsResponse.ok) {
        throw new Error(`Failed to get resource tags for ${resource.public_id}`);
      }
      
      const resourceData = await currentTagsResponse.json();
      const currentTags = resourceData.tags || [];
      
      // Filter out the "pending" tag
      const newTags = currentTags.filter((tag: string) => tag !== "pending");
      
      // Update the resource with the new tags
      return fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/resources/tags`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(apiKey + ":" + apiSecret).toString("base64")}`,
          },
          body: JSON.stringify({
            public_ids: [resource.public_id],
            tags: newTags,
            command: "replace"
          }),
        }
      );
    });
    
    await Promise.all(updatePromises);
    
    return Response.json({ success: true, message: "IA approved successfully" });
  } catch (error: unknown) {
    console.error("Error approving IA:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: "Failed to approve IA", details: errorMessage }, { status: 500 });
  }
}; 