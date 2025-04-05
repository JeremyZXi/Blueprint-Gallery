import { supabase } from "../utils/supabase";

export const action = async ({ request }: { request: Request }) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { id, password } = await request.json();

    if (!id) {
      return Response.json({ error: "Missing IA id" }, { status: 400 });
    }

    console.log(`Processing approval request for submission ID: ${id}`);
    
    const expectedPassword = process.env.VITE_ADMIN_PASSWORD;

    if (!expectedPassword || password !== expectedPassword) {
      return Response.json({ error: "Invalid admin password" }, { status: 401 });
    }

    // First, fetch the submission to verify it exists and check its data
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error("Error fetching submission:", fetchError);
      return Response.json({ 
        error: "Failed to fetch submission", 
        details: fetchError.message 
      }, { status: 500 });
    }
    
    if (!submission) {
      console.error("Submission not found with ID:", id);
      return Response.json({ error: "Submission not found" }, { status: 404 });
    }
    
    console.log("Submission data to approve:", {
      id: submission.id,
      title: submission.title,
      materialSample: submission.material?.slice(0, 2) || [],
      colorSample: submission.color?.slice(0, 2) || [],
      functionSample: submission.function?.slice(0, 2) || []
    });

    try {
      // Use server-side Postgres client via raw SQL to update regardless of JSON type issues
      const { error } = await supabase
        .rpc('update_submission_status', { 
          submission_id: id,
          new_status: 'approved'
        });

      if (error) {
        console.error("Error calling rpc:", error);
        throw error;
      }
    } catch (rpcError) {
      console.error("RPC error:", rpcError);
      
      // Fallback to standard update as a last resort
      console.log("Attempting direct update as fallback");
      
      try {
        // Try a direct update with a simpler approach
        const { error } = await supabase
          .from('submissions')
          .update({ status: 'approved' })
          .eq('id', id);
          
        if (error) {
          console.error("Error with fallback update:", error);
          return Response.json({ 
            error: "Failed to approve submission", 
            details: error.message 
          }, { status: 500 });
        }
      } catch (directError) {
        console.error("Direct update error:", directError);
        return Response.json({ 
          error: "All update methods failed", 
          details: directError instanceof Error ? directError.message : "Unknown error" 
        }, { status: 500 });
      }
    }

    console.log(`Successfully approved submission ID: ${id}`);
    return Response.json({ success: true, message: "IA approved successfully" });
  } catch (error: unknown) {
    console.error("Error approving IA:", error);
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
      error: "Failed to approve IA", 
      details: errorMessage 
    }, { status: 500 });
  }
}; 