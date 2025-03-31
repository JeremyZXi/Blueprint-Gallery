import { supabase, uploadFileToSupabase, ensureBucketExists } from './supabase';

export interface IASubmission {
  id?: string;
  firstName: string;
  lastName: string;
  gradeLevel: string;
  email: string;
  title: string;
  material: string[];
  color: string[];
  function: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  pdfUrl: string;
  imageUrls: string[];
}

/**
 * Sanitize filename to make it safe for storage
 * @param filename Original filename
 * @returns Sanitized filename
 */
const sanitizeFilename = (filename: string): string => {
  // Remove non-ASCII characters and replace with underscores
  const sanitized = filename
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII
    .replace(/[^a-zA-Z0-9_.-]/g, '_') // Replace other unsafe chars with underscore
    .replace(/__+/g, '_'); // Replace multiple underscores with single
  
  // If filename becomes empty after sanitizing, use a default
  return sanitized || `file_${Date.now()}`;
};

/**
 * Upload a PDF file to Supabase Storage
 * @param file PDF file to upload
 * @param submissionId Unique ID for the submission
 * @returns Download URL for the uploaded file
 */
export const uploadPDF = async (file: File, submissionId: string): Promise<string> => {
  console.log('Starting PDF upload for submission:', submissionId);
  
  // Sanitize the filename
  const originalFilename = file.name;
  const safeFilename = sanitizeFilename(originalFilename);
  console.log(`Sanitizing filename from "${originalFilename}" to "${safeFilename}"`);
  
  // Create a new File object with the sanitized name
  const safeFile = new File([file], safeFilename, { type: file.type });
  
  // Attempt upload with sanitized filename
  const path = `${submissionId}/pdf/${safeFilename}`;
  
  try {
    const url = await uploadFileToSupabase(safeFile, 'submissions', path);
    console.log('PDF upload complete:', url);
    return url;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw new Error(`PDF upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Upload an image file to Supabase Storage
 * @param file Image file to upload
 * @param submissionId Unique ID for the submission
 * @param index Index of the image in the upload sequence
 * @returns Download URL for the uploaded file
 */
export const uploadImage = async (file: File, submissionId: string, index: number): Promise<string> => {
  console.log(`Starting image upload ${index + 1} for submission:`, submissionId);
  
  // Sanitize the filename
  const originalFilename = file.name;
  const safeFilename = sanitizeFilename(originalFilename);
  console.log(`Sanitizing filename from "${originalFilename}" to "${safeFilename}"`);
  
  // Create a new File object with the sanitized name
  const safeFile = new File([file], safeFilename, { type: file.type });
  
  const path = `${submissionId}/images/${index}_${safeFilename}`;
  
  try {
    const url = await uploadFileToSupabase(safeFile, 'submissions', path);
    console.log(`Image ${index + 1} upload complete:`, url);
    return url;
  } catch (error) {
    console.error(`Error uploading image ${index + 1}:`, error);
    throw new Error(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Save submission data to Supabase
 * @param submission Submission data
 * @returns The ID of the created record
 */
export const saveSubmission = async (submission: IASubmission): Promise<string> => {
  console.log('Saving submission to database:', submission);
  
  try {
    const { data, error } = await supabase
      .from('submissions')
      .insert([submission])
      .select();

    if (error) {
      console.error('Error saving submission:', error);
      
      if (error.message.includes('does not exist')) {
        throw new Error('The submissions table does not exist. Please create it in the Supabase dashboard.');
      }
      
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error('No data returned from submission insert');
      throw new Error('Failed to save submission data');
    }
    
    console.log('Submission saved successfully:', data[0]);
    return data[0].id;
  } catch (error) {
    console.error('Exception saving submission:', error);
    throw error;
  }
};

/**
 * Handle the complete submission process including file uploads and data storage
 * @param formData Form data from the submission component
 * @param updateProgress Callback function to update progress indicator
 * @returns Submission result with ID and URLs
 */
export const handleSubmission = async (
  formData: {
    firstName: string;
    lastName: string;
    gradeLevel: string;
    email: string;
    title: string;
    material: string[];
    color: string[];
    function: string[];
    pdf: File | null;
    images: File[];
  },
  updateProgress: (progress: number) => void
): Promise<{ id: string; pdfUrl: string; imageUrls: string[] }> => {
  console.log('Starting submission process with form data:', {
    ...formData,
    pdf: formData.pdf?.name,
    images: formData.images.map(img => img.name)
  });

  // Generate a unique submission ID
  const submissionId = `submission_${Date.now()}`;
  console.log('Generated submission ID:', submissionId);
  
  if (!formData.pdf) {
    throw new Error("PDF is required");
  }
  
  try {
    // Skip bucket check and proceed directly
    console.log('Skipping bucket existence check, proceeding directly with upload');
    
    // Upload PDF (25% of progress)
    updateProgress(5);
    console.log('Starting PDF upload...');
    const pdfUrl = await uploadPDF(formData.pdf, submissionId);
    updateProgress(25);
    console.log('PDF upload complete');
    
    // Upload images (65% of progress)
    const imageUrls: string[] = [];
    const totalImages = formData.images.length;
    console.log(`Starting upload of ${totalImages} images...`);
    
    for (let i = 0; i < totalImages; i++) {
      const image = formData.images[i];
      console.log(`Uploading image ${i + 1}/${totalImages}: ${image.name}`);
      const imageUrl = await uploadImage(image, submissionId, i);
      imageUrls.push(imageUrl);
      
      // Update progress based on image upload progress
      const progressIncrement = 65 / totalImages;
      updateProgress(25 + (i + 1) * progressIncrement);
      console.log(`Image ${i + 1} upload complete`);
    }
    
    // Create submission data
    const submission: IASubmission = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      gradeLevel: formData.gradeLevel,
      email: formData.email,
      title: formData.title,
      material: formData.material,
      color: formData.color,
      function: formData.function,
      status: "pending",
      createdAt: new Date().toISOString(),
      pdfUrl,
      imageUrls
    };
    
    // Save submission data to Supabase
    console.log('Saving submission data to database:', submission);
    updateProgress(95);
    const docId = await saveSubmission(submission);
    updateProgress(100);
    console.log('Submission process complete with ID:', docId);
    
    return {
      id: docId,
      pdfUrl,
      imageUrls
    };
  } catch (error) {
    console.error('Error in submission process:', error);
    if (error instanceof Error) {
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Unknown error type:', typeof error);
    }
    throw error;
  }
}; 