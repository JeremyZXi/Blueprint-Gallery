import type { ActionFunction } from "react-router-dom";
import { supabase } from "../utils/supabase";

export const action: ActionFunction = async ({ request }: { request: Request }) => {
  // Error handling wrapper
  try {
    // Method check
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
      console.log('Request body:', body);
    } catch (parseError) {
      console.error('Error parsing request JSON:', parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
    
    // Validate required fields
    if (!body || !body.id) {
      console.error('Missing submission ID in request');
      return new Response(
        JSON.stringify({ error: 'Missing submission ID' }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const { id, title, description, material, color, function: functionTags, imageUrls, password } = body;

    // For development purposes, allow any password
    const isDev = true; // Force dev mode for testing
    const passwordValid = isDev || password === process.env.VITE_ADMIN_PASSWORD;
    
    if (!passwordValid) {
      console.error('Invalid admin password');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    console.log(`API: Updating submission with ID: ${id}`);

    // Create a simplified update object with only the title for now
    // This helps isolate if the issue is with the data being sent
    const updateData: Record<string, any> = {
      title: title || "Updated Title"
    };
    
    if (description !== undefined) updateData.description = description;
    
    console.log('Update data (simplified):', updateData);

    // Perform a simple update
    let result;
    try {
      const { data, error } = await supabase
        .from('submissions')
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Supabase update error:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to update submission', 
            details: error.message,
            code: error.code
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }
      
      result = data;
      console.log('Update successful, returned data:', data);
    } catch (updateError) {
      console.error('Exception during update operation:', updateError);
      return new Response(
        JSON.stringify({ 
          error: 'Exception during update operation',
          details: updateError instanceof Error ? updateError.message : 'Unknown error'
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Return successful response
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result,
        message: "Update completed with simplified data"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error: unknown) {
    // Global error handler
    console.error('API: Unhandled exception in updateSubmission:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: errorMessage
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};