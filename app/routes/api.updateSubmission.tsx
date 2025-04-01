import type { ActionFunction } from "react-router-dom";
import { supabase } from "../utils/supabase";

export const action: ActionFunction = async ({ request }: { request: Request }) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    // Parse the request body
    const body = await request.json();
    console.log('Request body:', body);
    
    if (!body || !body.id) {
      console.error('Missing submission ID in request');
      return Response.json({ error: 'Missing submission ID' }, { status: 400 });
    }

    const { id, title, description, material, color, function: functionTags, imageUrls, password } = body;

    // Verify admin password - use the same environment variable as the other API routes
    // Look for both ADMIN_PASSWORD and VITE_ADMIN_PASSWORD for compatibility
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD;
    console.log('Admin password from env:', adminPassword ? '[Password found]' : '[No password in env]');
    console.log('Password in request:', password ? '[Password provided]' : '[No password provided]');
    
    // For development, allow empty password to work for testing
    const isDev = process.env.NODE_ENV === 'development';
    const passwordValid = isDev || password === adminPassword;
    
    if (!passwordValid) {
      console.error('Invalid admin password');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`API: Updating submission with ID: ${id}`);

    // Create an update object with only provided fields
    const updateData: Record<string, any> = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (material !== undefined) updateData.material = material;
    if (color !== undefined) updateData.color = color;
    if (functionTags !== undefined) updateData.function = functionTags;
    if (imageUrls !== undefined) updateData.imageUrls = imageUrls;

    // Only proceed if there's something to update
    if (Object.keys(updateData).length === 0) {
      console.error('No fields to update provided in request');
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Log the update data
    console.log('Update data:', updateData);

    const { error } = await supabase
      .from('submissions')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('API: Error updating submission:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    console.log('Submission updated successfully');
    return Response.json({ success: true });
  } catch (error: unknown) {
    console.error('API: Exception in updateSubmission:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ 
      error: 'Internal server error',
      details: errorMessage
    }, { status: 500 });
  }
};