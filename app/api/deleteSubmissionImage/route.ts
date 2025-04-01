import { supabase } from '../../utils/supabase';

export async function POST(request: Request) {
  // Log the request to help debug
  console.log('Received deleteSubmissionImage request');
  
  try {
    // Parse the request body
    const body = await request.json().catch(e => {
      console.error('Error parsing request body:', e);
      return null;
    });
    
    // Log the parsed body for debugging
    console.log('Request body:', body);
    
    if (!body || !body.id || !body.imageUrl) {
      console.error('Missing submission ID or image URL in request');
      return new Response(JSON.stringify({ error: 'Missing submission ID or image URL' }), { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type' 
        } 
      });
    }

    const { id, imageUrl } = body;

    console.log(`API: Removing image from submission ID: ${id}`);

    // 1. Get current submission data
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('imageUrls')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('API: Error fetching submission:', fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type' 
        } 
      });
    }

    if (!submission || !submission.imageUrls) {
      console.error('Submission not found or no images available');
      return new Response(JSON.stringify({ error: 'Submission not found or no images available' }), { 
        status: 404, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type' 
        } 
      });
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
      return new Response(JSON.stringify({ error: updateError.message }), { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type' 
        } 
      });
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
    return new Response(JSON.stringify({ 
      success: true,
      remainingImages: updatedImageUrls
    }), { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type' 
      } 
    });
  } catch (error) {
    console.error('API: Exception in deleteSubmissionImage:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500, 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type' 
      } 
    });
  }
}

// Add support for OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
} 