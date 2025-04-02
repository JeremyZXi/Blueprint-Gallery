import { NextResponse } from 'next/server';
import { supabase } from '../../utils/supabase';
import { sendRejectionEmail } from '../../utils/email';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing submission ID' }, { status: 400 });
    }

    console.log(`API: Rejecting submission with ID: ${id}`);

    // First get the submission details
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('API: Error fetching submission:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Update the submission status
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (updateError) {
      console.error('API: Error rejecting submission:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API: Exception in rejectSubmission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 