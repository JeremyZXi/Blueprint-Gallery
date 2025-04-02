import { NextResponse } from 'next/server';
import { supabase } from '../../utils/supabase';
import { sendApprovalEmail } from '../../utils/email';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
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

    console.log(`API: Approving submission with ID: ${id}`);

    // First get the submission details
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
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

    if (!submission) {
      return new Response(JSON.stringify({ error: 'Submission not found' }), { 
        status: 404, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type' 
        } 
      });
    }

    // Update the submission status
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ status: 'approved' })
      .eq('id', id);

    if (updateError) {
      console.error('API: Error approving submission:', updateError);
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

    // Send approval email
    try {
      await sendApprovalEmail({
        firstName: submission.firstName,
        lastName: submission.lastName,
        email: submission.email,
        title: submission.title
      });
      console.log('API: Approval email sent successfully');
    } catch (emailError) {
      console.error('API: Error sending approval email:', emailError);
      // Don't fail the request if email fails
    }

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
    console.error('API: Exception in approveSubmission:', error);
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