import { supabase } from "../utils/supabase";
import { sendApprovalEmail } from "../utils/email";

export const action = async ({ request }: { request: Request }) => {
  console.log('API: approveIA action called');
  
  if (request.method !== "POST") {
    console.log('API: Method not allowed:', request.method);
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { id, password } = await request.json();
    console.log('API: Received request to approve IA with ID:', id);

    if (!id) {
      console.log('API: Missing IA id');
      return Response.json({ error: "Missing IA id" }, { status: 400 });
    }

    const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    console.log('API: Password validation:', 
      { hasExpectedPwd: !!expectedPassword, pwdMatch: password === expectedPassword });

    if (!expectedPassword || password !== expectedPassword) {
      console.log('API: Invalid admin password');
      return Response.json({ error: "Invalid admin password" }, { status: 401 });
    }

    // First get the submission details
    console.log('API: Fetching submission details...');
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
      console.log('API: Submission not found');
      return Response.json({ error: 'Submission not found' }, { status: 404 });
    }

    console.log('API: Submission found:', { 
      id: submission.id, 
      email: submission.email,
      title: submission.title 
    });

    // Update the submission status to approved
    console.log('API: Updating submission status to approved...');
    const { error } = await supabase
      .from('submissions')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) {
      console.error('API: Error updating submission:', error);
      throw new Error(`Failed to approve submission: ${error.message}`);
    }

    console.log('API: Submission status updated to approved');

    // Send approval email
    try {
      console.log('API: Attempting to send approval email to:', submission.email);
      const emailData = {
        firstName: submission.firstName,
        lastName: submission.lastName,
        email: submission.email,
        title: submission.title
      };
      console.log('API: Email data:', emailData);
      
      const result = await sendApprovalEmail(emailData);
      console.log('API: Approval email result:', result);
      
      if (result.success) {
        console.log('API: Approval email sent successfully');
      } else {
        console.error('API: Failed to send approval email:', result.error);
      }
    } catch (emailError) {
      console.error('API: Error sending approval email:', emailError);
      // Don't fail the request if email fails
    }

    console.log('API: Approval process completed successfully');
    return Response.json({ success: true, message: "IA approved successfully" });
  } catch (error: unknown) {
    console.error("API: Error approving IA:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: "Failed to approve IA", details: errorMessage }, { status: 500 });
  }
}; 