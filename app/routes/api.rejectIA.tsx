import type { ActionFunction } from "react-router-dom";
import { supabase } from "../utils/supabase";

export const action: ActionFunction = async ({ request }: { request: Request }) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { id, password } = await request.json();
    
    if (!id) {
      return Response.json({ error: "Missing required field: id" }, { status: 400 });
    }

    const expectedPassword = process.env.VITE_ADMIN_PASSWORD;

    if (!expectedPassword || password !== expectedPassword) {
      return Response.json({ error: "Invalid admin password" }, { status: 401 });
    }
    
    // Update submission status to rejected
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ status: 'rejected' })
      .eq('id', id);
      
    if (updateError) {
      console.error("Error updating submission status:", updateError);
      return Response.json({ 
        error: "Failed to update submission status", 
        details: updateError.message 
      }, { status: 500 });
    }
    
    // Get the submission to find file paths
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('pdfUrl, imageUrls')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error("Error fetching submission:", fetchError);
      // Continue even if fetch fails - we've already marked as rejected
    }
    
    // Only proceed with file deletion if we successfully fetched the submission
    if (submission) {
      try {
        // Delete files from storage
        const filesToDelete = [
          submission.pdfUrl,
          ...(submission.imageUrls || [])
        ].filter(Boolean); // Filter out undefined/null values
        
        console.log(`Attempting to delete ${filesToDelete.length} files for submission ${id}`);
        
        // Extract paths from URLs
        const storagePaths = filesToDelete.map(url => {
          if (!url) return null;
          
          // Get only the path after /storage/v1/object/public/
          const match = url.match(/\/storage\/v1\/object\/public\/([^?]+)/);
          return match ? match[1] : null;
        }).filter(Boolean);
        
        // Delete each file from storage
        for (const path of storagePaths) {
          if (path) {
            try {
              const { error: deleteError } = await supabase.storage
                .from('submissions')
                .remove([path]);
                
              if (deleteError) {
                console.error(`Failed to delete file at path ${path}:`, deleteError);
                // Continue with other deletions even if one fails
              }
            } catch (storageError) {
              console.error(`Exception deleting file at path ${path}:`, storageError);
              // Continue with other deletions even if one fails
            }
          }
        }
      } catch (storageError) {
        console.error("Error during file deletion process:", storageError);
        // We still consider the rejection successful even if file deletion fails
      }
    }
    
    return Response.json({ success: true, message: "IA rejected successfully" });
  } catch (error: unknown) {
    console.error("Error rejecting IA:", error);
    let errorMessage = "Unknown error";
    
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error("Non-Error object thrown:", error);
    }
    
    return Response.json({ 
      error: "Failed to reject IA", 
      details: errorMessage 
    }, { status: 500 });
  }
}; 