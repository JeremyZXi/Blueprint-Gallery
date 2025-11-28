import { supabase } from "../utils/supabase";

export const clientAction = async ({ request }: { request: Request }) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  
  try {
    // Parse the request body
    const body = await request.json();
    console.log('Request body:', body);
    
    if (!body || !body.id || !body.imageUrl) {
      console.error('Missing submission ID or image URL in request');
      return Response.json({ error: 'Missing submission ID or image URL' }, { status: 400 });
    }

    const { id, imageUrl, password } = body;

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

    console.log(`API: Removing image from submission ID: ${id}`);

    // 1. Get current submission data
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('imageUrls')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('API: Error fetching submission:', fetchError);
      return Response.json({ error: fetchError.message }, { status: 500 });
    }

    if (!submission || !submission.imageUrls) {
      console.error('Submission not found or no images available');
      return Response.json({ error: 'Submission not found or no images available' }, { status: 404 });
    }

    // 2. Filter out the image to be removed
    const updatedImageUrls = submission.imageUrls.filter((url: string) => url !== imageUrl);
    console.log(`Filtered images: ${updatedImageUrls.length} (was ${submission.imageUrls.length})`);

    // 3. Update the submission with the new image list
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ imageUrls: updatedImageUrls })
      .eq('id', id);

    if (updateError) {
      console.error('API: Error updating submission images:', updateError);
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    // 4. Try to delete the file from storage
    try {
      // Extract path from URL - this is a simplified approach
      const pathMatch = imageUrl.match(/\/([^\/]+)\/([^?]+)/);
      if (pathMatch && pathMatch.length >= 3) {
        const path = pathMatch[2];
        console.log(`Attempting to delete file: ${path}`);
        
        await supabase.storage
          .from('submissions')
          .remove([path]);
      }
    } catch (storageError) {
      console.error(`Warning: Error deleting file from storage:`, storageError);
      // Continue even if storage deletion fails
    }

    console.log('Image removed successfully');
    return Response.json({ success: true, remainingImages: updatedImageUrls });
  } catch (error: unknown) {
    console.error('API: Exception in deleteSubmissionImage:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ 
      error: 'Internal server error',
      details: errorMessage
    }, { status: 500 });
  }
};