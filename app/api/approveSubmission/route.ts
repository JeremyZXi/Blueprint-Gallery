import { NextResponse } from 'next/server';
import { supabase } from '../../utils/supabase';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing submission ID' }, { status: 400 });
    }

    console.log(`API: Approving submission with ID: ${id}`);

    const { error } = await supabase
      .from('submissions')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) {
      console.error('API: Error approving submission:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API: Exception in approveSubmission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 