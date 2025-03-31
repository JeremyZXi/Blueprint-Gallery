import type { ActionFunction } from "react-router-dom";
import { supabase } from "../utils/supabase";
import type { IASubmission } from "../utils/supabaseSubmission";

interface SubmissionData {
  id: string;
  firstName: string;
  lastName: string;
  gradeLevel: string;
  email: string;
  title: string;
  material: string[];
  color: string[];
  function: string[];
  pdfUrl: string;
  imageUrls: string[];
  [key: string]: string | string[];
}

export const action: ActionFunction = async ({ request }: { request: Request }) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const submissionData: SubmissionData = await request.json();
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'title', 'pdfUrl'];
    const missingFields = requiredFields.filter(field => !submissionData[field]);
    
    if (missingFields.length > 0) {
      return Response.json({ 
        error: "Missing required fields", 
        fields: missingFields 
      }, { status: 400 });
    }
    
    // Ensure at least 3 images were uploaded
    if (!submissionData.imageUrls || submissionData.imageUrls.length < 3) {
      return Response.json({ 
        error: "At least 3 images are required" 
      }, { status: 400 });
    }
    
    // Store submission in Supabase as a backup
    // Even though we already have it stored directly from the client,
    // this ensures we have a record of all submissions from the API
    const submission: IASubmission = {
      firstName: submissionData.firstName,
      lastName: submissionData.lastName,
      gradeLevel: submissionData.gradeLevel,
      email: submissionData.email,
      title: submissionData.title,
      material: submissionData.material,
      color: submissionData.color,
      function: submissionData.function,
      status: "pending",
      createdAt: new Date().toISOString(),
      pdfUrl: submissionData.pdfUrl,
      imageUrls: submissionData.imageUrls
    };
    
    // Add record to submissions_api table
    const { data, error } = await supabase
      .from('submissions_api')
      .insert([submission])
      .select();
    
    if (error) throw error;
    
    return Response.json({ 
      success: true, 
      message: "IA submitted successfully. It will be reviewed by an administrator.",
      id: data[0].id
    });
  } catch (error: unknown) {
    console.error("Error processing IA submission:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ 
      error: "Failed to process submission", 
      details: errorMessage 
    }, { status: 500 });
  }
}; 