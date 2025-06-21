import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadImage = async (file: Buffer, fileName: string): Promise<string> => {
  const bucket = process.env.SUPABASE_BUCKET || 'listings';
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      contentType: 'image/jpeg',
      upsert: false
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl;
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