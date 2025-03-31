import { supabase, ensureBucketExists } from './supabase';

/**
 * Simple function to test Supabase connectivity
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Check if we can list buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Failed to list buckets:', bucketError);
      
      // If we can't even list buckets, try to directly check/use the submissions bucket
      try {
        const { data: testData } = await supabase.storage.from('submissions').list();
        console.log('Was able to list files in submissions bucket:', testData);
        console.log('Bucket exists despite not being able to list buckets.');
      } catch (e) {
        console.error('Error directly accessing submissions bucket:', e);
        return false;
      }
    } else {
      console.log('Successfully listed buckets:', buckets);
      
      // Check if submissions bucket exists in the list
      const submissionsBucketExists = buckets?.some(b => b.name === 'submissions');
      console.log('Submissions bucket exists in bucket list:', submissionsBucketExists);
    }
    
    // Test 2: Try to create the bucket if it doesn't exist
    const bucketResult = await ensureBucketExists('submissions');
    console.log('Bucket ensure result:', bucketResult);
    
    if (!bucketResult) {
      console.warn('Failed to automatically create submissions bucket!');
      console.warn('This is likely due to permissions or plan limitations.');
      console.warn('Please create the bucket manually in the Supabase dashboard:');
      console.warn('1. Go to Storage in Supabase dashboard');
      console.warn('2. Click "Create new bucket"');
      console.warn('3. Name it "submissions" and check "public"');
      console.warn('4. Click "Create bucket"');
      
      // Try to list the bucket directly to see if it already exists despite creation failure
      try {
        const { data: testFiles } = await supabase.storage.from('submissions').list();
        console.log('Was able to list files in submissions bucket:', testFiles);
        console.log('Bucket exists despite creation failure. Continuing tests...');
      } catch (e) {
        console.error('Error directly accessing submissions bucket:', e);
        alert('Please create a "submissions" bucket in your Supabase dashboard before continuing.');
        return false;
      }
    } else {
      console.log('Submissions bucket is ready.');
    }
    
    // Test 3: Check if we can create a simple database entry
    const { data: tablesData, error: tablesError } = await supabase
      .from('submissions')
      .select('id')
      .limit(1);
      
    if (tablesError) {
      console.error('Failed to query submissions table:', tablesError);
      
      if (tablesError.message.includes('does not exist')) {
        console.error('The "submissions" table does not exist. Please create it in the Supabase dashboard.');
        alert('Please create a "submissions" table in your Supabase database before continuing.');
      }
      
      return false;
    }
    
    console.log('Successfully queried submissions table:', tablesData);
    
    return true;
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return false;
  }
}; 