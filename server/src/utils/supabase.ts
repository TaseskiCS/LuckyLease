import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE must be set');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadImage = async (file: Buffer, fileName: string): Promise<string> => {
  const bucket = process.env.SUPABASE_BUCKET || 'listings';
  
  try {
    // Check if bucket exists, create if it doesn't
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucket);
    
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(bucket, {
        public: true
      });
      if (createError) {
        console.error('Error creating bucket:', createError);
      }
    }

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
};

export const deleteImage = async (fileName: string): Promise<void> => {
  const bucket = process.env.SUPABASE_BUCKET || 'listings';
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([fileName]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}; 