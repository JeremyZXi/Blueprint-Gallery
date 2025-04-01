import { supabase } from '../../utils/supabase';

export async function POST(request: Request) {
  // Log the request to help debug
  console.log('Received updateSubmission request');
  
  try {
    // Parse the request body
    const body = await request.json().catch(e => {
      console.error('Error parsing request body:', e);
      return null;
    });
    
    // Log the parsed body for debugging
    console.log('Request body:', body);
    
    if (!body || !body.id) {
      console.error('Missing submission ID in request');
      return new Response(JSON.stringify({ error: 'Missing submission ID' }), { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type' 
        } 
      });
    }

    const { id, title, material, color, function: functionTags, imageUrls } = body;

    console.log(`API: Updating submission with ID: ${id}`);

    // Create an update object with only provided fields
    const updateData: Record<string, any> = {};
    
    if (title !== undefined) updateData.title = title;
    if (material !== undefined) updateData.material = material;
    if (color !== undefined) updateData.color = color;
    if (functionTags !== undefined) updateData.function = functionTags;
    if (imageUrls !== undefined) updateData.imageUrls = imageUrls;

    // Only proceed if there's something to update
    if (Object.keys(updateData).length === 0) {
      console.error('No fields to update provided in request');
      return new Response(JSON.stringify({ error: 'No fields to update' }), { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type' 
        } 
      });
    }

    // Log the update data
    console.log('Update data:', updateData);

    const { error } = await supabase
      .from('submissions')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('API: Error updating submission:', error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type' 
        } 
      });
    }

    console.log('Submission updated successfully');
    return new Response(JSON.stringify({ success: true }), { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type' 
      } 
    });
  } catch (error) {
    console.error('API: Exception in updateSubmission:', error);
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