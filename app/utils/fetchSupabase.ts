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