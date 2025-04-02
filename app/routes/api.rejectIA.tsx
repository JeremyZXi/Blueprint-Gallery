import type { ActionFunction } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { sendRejectionEmail } from "../utils/email";

export const action: ActionFunction = async ({ request }: { request: Request }) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { id, password } = await request.json();
    
    if (!id) {
      return Response.json({ error: "Missing required field: id" }, { status: 400 });
    }

    const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (!expectedPassword || password !== expectedPassword) {
      return Response.json({ error: "Invalid admin password" }, { status: 401 });
    }
    
    // First get the submission details
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('API: Error fetching submission:', fetchError);
      return Response.json({ error: fetchError.message }, { status: 500 });
    }

    if (!submission) {
      return Response.json({ error: 'Submission not found' }, { status: 404 });
    }
    
    // Update submission status to rejected
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ status: 'rejected' })
      .eq('id', id);
      
    if (updateError) {
      throw new Error(`Failed to update submission status: ${updateError.message}`);
    }
    
    // Send rejection email
    try {
      await sendRejectionEmail({
        firstName: submission.firstName,
        lastName: submission.lastName,
        email: submission.email,
        title: submission.title
      });
      console.log('API: Rejection email sent successfully');
    } catch (emailError) {
      console.error('API: Error sending rejection email:', emailError);
      // Don't fail the request if email fails
    }
    
    // Get the submission to find file paths
    const { data: submissionFiles, error: fetchFileError } = await supabase
      .from('submissions')
      .select('pdfUrl, imageUrls')
      .eq('id', id)
      .single();
      
    if (fetchFileError) {
      throw new Error(`Failed to fetch submission: ${fetchFileError.message}`);
    }
    
    if (!submissionFiles) {
      return Response.json({ error: "Submission not found" }, { status: 404 });
    }
    
    // Delete files from storage
    const filesToDelete = [
      submissionFiles.pdfUrl,
      ...(submissionFiles.imageUrls || [])
    ];
    
    // Extract paths from URLs
    const storagePaths = filesToDelete.map(url => {
      // Get only the path after /storage/v1/object/public/
      const match = url.match(/\/storage\/v1\/object\/public\/([^?]+)/);
      return match ? match[1] : null;
    }).filter(Boolean);
    
    // Delete each file from storage
    for (const path of storagePaths) {
      if (path) {
        const { error: deleteError } = await supabase.storage
          .from('submissions')
          .remove([path]);
          
        if (deleteError) {
          console.error(`Failed to delete file at path ${path}:`, deleteError);
          // Continue with other deletions even if one fails
        }
      }
    }
    
    return Response.json({ success: true, message: "IA rejected successfully" });
  } catch (error: unknown) {
    console.error("Error rejecting IA:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: "Failed to reject IA", details: errorMessage }, { status: 500 });
  }
}; 