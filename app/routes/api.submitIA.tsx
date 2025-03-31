import type { ActionFunction } from "react-router-dom";

interface SubmissionData {
  firstName: string;
  lastName: string;
  gradeLevel: string;
  email: string;
  title: string;
  material: string[];
  color: string[];
  function: string[];
  pdfUrl: string;
  images: string[];
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
    if (!submissionData.images || submissionData.images.length < 3) {
      return Response.json({ 
        error: "At least 3 images are required" 
      }, { status: 400 });
    }
    
    // Cloudinary resources are already uploaded by the frontend
    // We update the database or log the submission success as needed
    
    // In a real implementation, you might:
    // 1. Store the submission in a database
    // 2. Send notification emails
    // 3. Log activity for admin review
    
    console.log("New IA submission:", {
      name: `${submissionData.firstName} ${submissionData.lastName}`,
      email: submissionData.email,
      title: submissionData.title,
      attachments: {
        pdf: submissionData.pdfUrl,
        imageCount: submissionData.images.length
      }
    });
    
    return Response.json({ 
      success: true, 
      message: "IA submitted successfully. It will be reviewed by an administrator."
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