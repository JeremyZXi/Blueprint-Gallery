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
    console.log('Fetching approved IA submissions from Supabase...');
    
    // 查询所有approved状态的，且submissionType为'IA'或为null的记录（兼容旧数据）
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('status', 'approved')
      .or(`submissionType.eq.IA,submissionType.is.null`)
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('Error fetching approved IA submissions:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} approved IA submissions from Supabase`);
    return data || [];
    
  } catch (error) {
    console.error('Failed to fetch approved IA submissions:', error);
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
 * Fetch approved MYP submissions from Supabase
 * @returns Array of approved MYP submissions
 */
export const fetchApprovedMYPSubmissions = async (): Promise<IASubmission[]> => {
  try {
    console.log('Fetching approved MYP submissions from Supabase...');
    
    // 首先尝试从新版统一表中查询
    let { data: unifiedData, error: unifiedError } = await supabase
      .from('submissions')
      .select('*')
      .eq('status', 'approved')
      .eq('submissionType', 'MYP')
      .order('createdAt', { ascending: false });
    
    if (unifiedError) {
      console.error('Error fetching approved MYP submissions from unified table:', unifiedError);
      // 如果统一表查询出错，尝试从旧表获取
      const { data: legacyData, error: legacyError } = await supabase
        .from('submissions_myp')
        .select('*')
        .eq('status', 'approved')
        .order('createdAt', { ascending: false });
      
      if (legacyError) {
        console.error('Error fetching approved MYP submissions from legacy table:', legacyError);
        throw legacyError;
      }
      
      console.log(`Retrieved ${legacyData?.length || 0} approved MYP submissions from legacy table`);
      return legacyData || [];
    }
    
    console.log(`Retrieved ${unifiedData?.length || 0} approved MYP submissions from unified table`);
    return unifiedData || [];
    
  } catch (error) {
    console.error('Failed to fetch approved MYP submissions:', error);
    return [];
  }
};

/**
 * Fetch approved DP submissions from Supabase
 * @returns Array of approved DP submissions
 */
export const fetchApprovedDPSubmissions = async (): Promise<IASubmission[]> => {
  try {
    console.log('Fetching approved DP submissions from Supabase...');
    
    // 首先尝试从新版统一表中查询
    let { data: unifiedData, error: unifiedError } = await supabase
      .from('submissions')
      .select('*')
      .eq('status', 'approved')
      .eq('submissionType', 'DP')
      .order('createdAt', { ascending: false });
    
    if (unifiedError) {
      console.error('Error fetching approved DP submissions from unified table:', unifiedError);
      // 如果统一表查询出错，尝试从旧表获取
      const { data: legacyData, error: legacyError } = await supabase
        .from('submissions_dp')
        .select('*')
        .eq('status', 'approved')
        .order('createdAt', { ascending: false });
      
      if (legacyError) {
        console.error('Error fetching approved DP submissions from legacy table:', legacyError);
        throw legacyError;
      }
      
      console.log(`Retrieved ${legacyData?.length || 0} approved DP submissions from legacy table`);
      return legacyData || [];
    }
    
    console.log(`Retrieved ${unifiedData?.length || 0} approved DP submissions from unified table`);
    return unifiedData || [];
    
  } catch (error) {
    console.error('Failed to fetch approved DP submissions:', error);
    return [];
  }
};

/**
 * Format submissions for gallery display
 * @param submissions Raw submissions from Supabase
 * @returns Formatted submissions for gallery display
 */
export const formatSubmissionsForGallery = (submissions: IASubmission[]) => {
  return submissions.map(submission => {
    // Extract each tag category for description formatting
    const materials = submission.material || [];
    const colors = submission.color || [];
    const functions = submission.function || [];

    // Format the description, handling custom "Other" tags properly
    const formatTags = (tags: string[]) => {
      return tags.map(tag => {
        // If tag starts with "Other:", extract the custom value
        if (tag.startsWith('Other:')) {
          return tag; // Keep the full tag for display
        }
        return tag;
      }).join(', ');
    };

    const formattedMaterials = formatTags(materials);
    const formattedColors = formatTags(colors);
    const formattedFunctions = formatTags(functions);

    return {
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
      description: submission.description || `This is a ${submission.title} designed by ${submission.firstName} ${submission.lastName} in grade ${submission.gradeLevel}.
      
      The design incorporates ${formattedMaterials} with ${formattedColors} color scheme.
      
      This project serves functions related to ${formattedFunctions}.`
    };
  });
};

// 标签相关函数
// 颜色标签
export interface ColorTag {
  id: string;
  name: string;
  created_at: string;
}

// 材质标签
export interface MaterialTag {
  id: string;
  name: string;
  created_at: string;
}

// 获取所有颜色标签
export const fetchColorTags = async (): Promise<ColorTag[]> => {
  try {
    const { data, error } = await supabase
      .from('color_tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching color tags:", error);
    throw error;
  }
};

// 添加新颜色标签
export const addColorTag = async (name: string): Promise<ColorTag> => {
  try {
    const { data, error } = await supabase
      .from('color_tags')
      .insert({ name })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error adding color tag:", error);
    throw error;
  }
};

// 更新颜色标签
export const updateColorTag = async (id: string, name: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('color_tags')
      .update({ name })
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error updating color tag:", error);
    throw error;
  }
};

// 删除颜色标签
export const deleteColorTag = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('color_tags')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting color tag:", error);
    throw error;
  }
};

// 获取所有材质标签
export const fetchMaterialTags = async (): Promise<MaterialTag[]> => {
  try {
    const { data, error } = await supabase
      .from('material_tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching material tags:", error);
    throw error;
  }
};

// 添加新材质标签
export const addMaterialTag = async (name: string): Promise<MaterialTag> => {
  try {
    const { data, error } = await supabase
      .from('material_tags')
      .insert({ name })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error adding material tag:", error);
    throw error;
  }
};

// 更新材质标签
export const updateMaterialTag = async (id: string, name: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('material_tags')
      .update({ name })
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error updating material tag:", error);
    throw error;
  }
};

// 删除材质标签
export const deleteMaterialTag = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('material_tags')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting material tag:", error);
    throw error;
  }
};

/**
 * Upload a MYP PDF file to Supabase Storage
 * @param file PDF file to upload
 * @param submissionId Unique ID for the submission
 * @returns Download URL for the uploaded file
 */
export const uploadMYPPDF = async (file: File, submissionId: string): Promise<string> => {
  console.log('Starting MYP PDF upload for submission:', submissionId);
  
  // Sanitize the filename
  const originalFilename = file.name;
  const safeFilename = sanitizeFilename(originalFilename);
  console.log(`Sanitizing filename from "${originalFilename}" to "${safeFilename}"`);
  
  // Create a new File object with the sanitized name
  const safeFile = new File([file], safeFilename, { type: file.type });
  
  // Attempt upload with sanitized filename
  const path = `${submissionId}/pdf/${safeFilename}`;
  
  try {
    const url = await uploadFileToSupabase(safeFile, 'submissions-myp', path);
    console.log('MYP PDF upload complete:', url);
    return url;
  } catch (error) {
    console.error('Error uploading MYP PDF:', error);
    throw new Error(`MYP PDF upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Upload a MYP image file to Supabase Storage
 * @param file Image file to upload
 * @param submissionId Unique ID for the submission
 * @param index Index of the image in the upload sequence
 * @returns Download URL for the uploaded file
 */
export const uploadMYPImage = async (file: File, submissionId: string, index: number): Promise<string> => {
  console.log(`Starting MYP image upload ${index + 1} for submission:`, submissionId);
  
  // Sanitize the filename
  const originalFilename = file.name;
  const safeFilename = sanitizeFilename(originalFilename);
  console.log(`Sanitizing filename from "${originalFilename}" to "${safeFilename}"`);
  
  // Create a new File object with the sanitized name
  const safeFile = new File([file], safeFilename, { type: file.type });
  
  const path = `${submissionId}/images/${index}_${safeFilename}`;
  
  try {
    const url = await uploadFileToSupabase(safeFile, 'submissions-myp', path);
    console.log(`MYP Image ${index + 1} upload complete:`, url);
    return url;
  } catch (error) {
    console.error(`Error uploading MYP image ${index + 1}:`, error);
    throw new Error(`MYP Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Save MYP submission data to Supabase
 * @param submission Submission data
 * @returns The ID of the created record
 */
export const saveMYPSubmission = async (submission: IASubmission): Promise<string> => {
  console.log('Saving MYP submission to database:', submission);
  
  try {
    const { data, error } = await supabase
      .from('submissions_myp')
      .insert([submission])
      .select();

    if (error) {
      console.error('Error saving MYP submission:', error);
      
      if (error.message.includes('does not exist')) {
        throw new Error('The submissions_myp table does not exist. Please create it in the Supabase dashboard.');
      }
      
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error('No data returned from MYP submission insert');
      throw new Error('Failed to save MYP submission data');
    }
    
    console.log('MYP Submission saved successfully:', data[0]);
    return data[0].id;
  } catch (error) {
    console.error('Exception saving MYP submission:', error);
    throw error;
  }
};

/**
 * Upload a DP PDF file to Supabase Storage
 * @param file PDF file to upload
 * @param submissionId Unique ID for the submission
 * @returns Download URL for the uploaded file
 */
export const uploadDPPDF = async (file: File, submissionId: string): Promise<string> => {
  console.log('Starting DP PDF upload for submission:', submissionId);
  
  // Sanitize the filename
  const originalFilename = file.name;
  const safeFilename = sanitizeFilename(originalFilename);
  console.log(`Sanitizing filename from "${originalFilename}" to "${safeFilename}"`);
  
  // Create a new File object with the sanitized name
  const safeFile = new File([file], safeFilename, { type: file.type });
  
  // Attempt upload with sanitized filename
  const path = `${submissionId}/pdf/${safeFilename}`;
  
  try {
    const url = await uploadFileToSupabase(safeFile, 'submissions-dp', path);
    console.log('DP PDF upload complete:', url);
    return url;
  } catch (error) {
    console.error('Error uploading DP PDF:', error);
    throw new Error(`DP PDF upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Upload a DP image file to Supabase Storage
 * @param file Image file to upload
 * @param submissionId Unique ID for the submission
 * @param index Index of the image in the upload sequence
 * @returns Download URL for the uploaded file
 */
export const uploadDPImage = async (file: File, submissionId: string, index: number): Promise<string> => {
  console.log(`Starting DP image upload ${index + 1} for submission:`, submissionId);
  
  // Sanitize the filename
  const originalFilename = file.name;
  const safeFilename = sanitizeFilename(originalFilename);
  console.log(`Sanitizing filename from "${originalFilename}" to "${safeFilename}"`);
  
  // Create a new File object with the sanitized name
  const safeFile = new File([file], safeFilename, { type: file.type });
  
  const path = `${submissionId}/images/${index}_${safeFilename}`;
  
  try {
    const url = await uploadFileToSupabase(safeFile, 'submissions-dp', path);
    console.log(`DP Image ${index + 1} upload complete:`, url);
    return url;
  } catch (error) {
    console.error(`Error uploading DP image ${index + 1}:`, error);
    throw new Error(`DP Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Save DP submission data to Supabase
 * @param submission Submission data
 * @returns The ID of the created record
 */
export const saveDPSubmission = async (submission: IASubmission): Promise<string> => {
  console.log('Saving DP submission to database:', submission);
  
  try {
    const { data, error } = await supabase
      .from('submissions_dp')
      .insert([submission])
      .select();

    if (error) {
      console.error('Error saving DP submission:', error);
      
      if (error.message.includes('does not exist')) {
        throw new Error('The submissions_dp table does not exist. Please create it in the Supabase dashboard.');
      }
      
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error('No data returned from DP submission insert');
      throw new Error('Failed to save DP submission data');
    }
    
    console.log('DP Submission saved successfully:', data[0]);
    return data[0].id;
  } catch (error) {
    console.error('Exception saving DP submission:', error);
    throw error;
  }
}; 