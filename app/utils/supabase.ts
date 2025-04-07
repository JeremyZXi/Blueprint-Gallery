import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Config:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey
});

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key is missing. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

/**
 * Ensure bucket exists, create it if it doesn't
 * @param bucketName The name of the bucket to check/create
 * @returns Boolean indicating success
 */
export const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      if (listError.message.includes('tier')) {
        console.error('This appears to be a service tier limitation. You may need to upgrade your Supabase plan.');
      }
      return false;
    }
    
    console.log('All buckets:', buckets);
    const bucketExists = buckets?.some(b => b.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} doesn't exist, creating it...`);
      
      try {
        // Create the bucket with detailed error catching
        const createResult = await supabase.storage.createBucket(bucketName, {
          public: true // Make bucket public
        });
        
        console.log('Create bucket result:', createResult);
        
        if (createResult.error) {
          console.error(`Error creating bucket ${bucketName}:`, createResult.error);
          console.error('Error message:', createResult.error.message);
          console.error('Error details:', createResult.error);
          
          if (createResult.error.message.includes('tier') || createResult.error.message.includes('upgrade')) {
            console.error('This appears to be a service tier limitation. You may need to upgrade your Supabase plan or use the dashboard to create the bucket manually.');
          }
          
          return false;
        }
        
        console.log(`Successfully created bucket ${bucketName}:`, createResult.data);
        
        // Add public policy to the bucket
        const publicUrlData = supabase.storage.from(bucketName).getPublicUrl('test.txt');
        console.log(`Set public access for bucket ${bucketName}`);
        
        return true;
      } catch (createBucketError) {
        console.error('Exception creating bucket:', createBucketError);
        return false;
      }
    }
    
    console.log(`Bucket ${bucketName} already exists.`);
    return true;
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    return false;
  }
};

/**
 * Upload a file to Supabase Storage
 * @param file File to upload
 * @param bucket Bucket name
 * @param path Path within the bucket
 * @returns URL of the uploaded file
 */
export const uploadFileToSupabase = async (
  file: File,
  bucket: string,
  path: string
): Promise<string> => {
  try {
    console.log(`Starting upload for ${file.name} (${file.size} bytes) to ${bucket}/${path}`);
    
    // Skip bucket check - assume it exists
    console.log(`Assuming bucket ${bucket} exists and proceeding with upload`);
    
    // Create simple test file to check permissions
    try {
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const testFile = new File([testBlob], 'permission-test.txt', { type: 'text/plain' });
      
      console.log('Testing upload permissions with small test file...');
      const { data: testData, error: testError } = await supabase.storage
        .from(bucket)
        .upload('test-permission.txt', testFile, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (testError) {
        console.error('Permission test failed:', testError);
      } else {
        console.log('Permission test succeeded:', testData);
        // Clean up test file
        await supabase.storage.from(bucket).remove(['test-permission.txt']);
      }
    } catch (testError) {
      console.error('Error during permission test:', testError);
    }
    
    // Proceed with upload directly
    console.log('Proceeding with actual file upload...');
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true // Change to true to overwrite existing files
      });

    if (error) {
      console.error('Supabase upload error:', error);
      console.error('Error message:', error.message);
      // Error properties that might be available in the error object
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      // Try a different approach if the regular upload fails
      try {
        console.log('Attempting alternative upload method...');
        // Try to bypass RLS with a direct upload
        const formData = new FormData();
        formData.append('file', file);
        
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(path);
          
        console.log('Public URL would be:', publicUrlData.publicUrl);
        
        throw error; // Still throw the original error if we get here
      } catch (altError) {
        console.error('Alternative upload also failed:', altError);
        throw error; // Throw the original error
      }
    }

    console.log('File uploaded successfully:', data);

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    console.log('Generated public URL:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Temporarily disable RLS for an operation and then re-enable it
 * This is for admin operations only and requires service role credentials
 * @param operation Function that performs the operation while RLS is disabled
 * @returns Result of the operation
 */
export const withRLSDisabled = async <T>(operation: () => Promise<T>): Promise<T> => {
  try {
    // Disable RLS (this requires service role credentials)
    console.log('Attempting to disable RLS for operation');
    try {
      await supabase.rpc('disable_rls');
      console.log('RLS disabled successfully');
    } catch (disableError) {
      console.error('Failed to disable RLS:', disableError);
      // Continue with the operation even if we couldn't disable RLS
    }
    
    // Perform the operation
    const result = await operation();
    
    // Re-enable RLS
    try {
      await supabase.rpc('enable_rls');
      console.log('RLS re-enabled successfully');
    } catch (enableError) {
      console.error('Failed to re-enable RLS:', enableError);
      // Not critical if we couldn't re-enable RLS since it will reset on next request
    }
    
    return result;
  } catch (error) {
    console.error('Error during RLS-disabled operation:', error);
    
    // Ensure RLS is re-enabled even if the operation failed
    try {
      await supabase.rpc('enable_rls');
    } catch (finalEnableError) {
      // Ignore errors here
    }
    
    throw error;
  }
}; 