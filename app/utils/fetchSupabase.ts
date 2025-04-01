import { supabase } from './supabase';
import type { IASubmission } from './supabaseSubmission';

/**
 * Fetch all submissions from Supabase
 * @returns Array of submissions
 */
export const fetchSubmissionsFromSupabase = async (): Promise<IASubmission[]> => {
  try {
    console.log('Fetching submissions from Supabase...');
    
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} submissions from Supabase`);
    return data || [];
    
  } catch (error) {
    console.error('Failed to fetch submissions:', error);
    return [];
  }
};

/**
 * Fetch pending submissions from Supabase
 * @returns Array of pending submissions
 */
export const fetchPendingSubmissions = async (): Promise<IASubmission[]> => {
  try {
    console.log('Fetching pending submissions from Supabase...');
    
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('status', 'pending')
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('Error fetching pending submissions:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} pending submissions from Supabase`);
    return data || [];
    
  } catch (error) {
    console.error('Failed to fetch pending submissions:', error);
    return [];
  }
};

/**
 * Fetch approved submissions from Supabase
 * @returns Array of approved submissions
 */
export const fetchApprovedSubmissions = async (): Promise<IASubmission[]> => {
  try {
    console.log('Fetching approved submissions from Supabase...');
    
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('status', 'approved')
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('Error fetching approved submissions:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} approved submissions from Supabase`);
    return data || [];
    
  } catch (error) {
    console.error('Failed to fetch approved submissions:', error);
    return [];
  }
};

/**
 * Fetch rejected submissions from Supabase
 * @returns Array of rejected submissions
 */
export const fetchRejectedSubmissions = async (): Promise<IASubmission[]> => {
  try {
    console.log('Fetching rejected submissions from Supabase...');
    
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('status', 'rejected')
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('Error fetching rejected submissions:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} rejected submissions from Supabase`);
    return data || [];
    
  } catch (error) {
    console.error('Failed to fetch rejected submissions:', error);
    return [];
  }
};

/**
 * Format submissions for gallery display
 * @param submissions Raw submissions from Supabase
 * @returns Formatted submissions for gallery display
 */
export const formatSubmissionsForGallery = (submissions: IASubmission[]) => {
  return submissions.map(submission => ({
    id: submission.id || '',
    pdf: submission.pdfUrl,
    images: submission.imageUrls || [],
    tags: [
      ...(submission.material || []).map(mat => `material_${mat}`),
      ...(submission.color || []).map(col => `color_${col}`),
      ...(submission.function || []).map(func => `function_${func}`)
    ],
    title: submission.title,
    creator: `${submission.firstName} ${submission.lastName}`,
    gradeLevel: submission.gradeLevel,
    submissionDate: new Date(submission.createdAt).toLocaleDateString(),
    description: `This is a ${submission.title} designed by ${submission.firstName} ${submission.lastName} in grade ${submission.gradeLevel}.
    
    The design incorporates ${submission.material?.join(', ') || 'various materials'} with ${submission.color?.join(', ') || 'various colors'} color scheme.
    
    This project serves functions related to ${submission.function?.join(', ') || 'various applications'}.`
  }));
}; 