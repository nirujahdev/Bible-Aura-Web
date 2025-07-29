import { supabase } from '@/integrations/supabase/client';

/**
 * Supabase Storage utility functions for handling file operations
 */

// Types for JSON file operations
export interface JsonUploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

export interface JsonReadResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Upload a JSON object to Supabase Storage bucket
 * @param bucketName - Name of the storage bucket
 * @param filePath - Path where the file should be stored (e.g., 'user-data/config.json')
 * @param jsonData - The JSON data to upload
 * @param options - Upload options
 */
export async function uploadJsonToStorage<T>(
  bucketName: string,
  filePath: string,
  jsonData: T,
  options: {
    upsert?: boolean;
    contentType?: string;
  } = {}
): Promise<JsonUploadResult> {
  try {
    // Convert JSON data to string
    const jsonString = JSON.stringify(jsonData, null, 2);
    
    // Convert string to blob
    const blob = new Blob([jsonString], { 
      type: options.contentType || 'application/json' 
    });

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, blob, {
        upsert: options.upsert || false,
        contentType: options.contentType || 'application/json'
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      filePath: data.path 
    };
  } catch (error) {
    console.error('Upload failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
}

/**
 * Read and parse a JSON file from Supabase Storage bucket
 * @param bucketName - Name of the storage bucket
 * @param filePath - Path to the file in the bucket
 */
export async function readJsonFromStorage<T = any>(
  bucketName: string,
  filePath: string
): Promise<JsonReadResult<T>> {
  try {
    // Download the file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      console.error('Download error:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'No data received' };
    }

    // Convert blob to text
    const text = await data.text();
    
    // Parse JSON
    const jsonData = JSON.parse(text) as T;

    return { 
      success: true, 
      data: jsonData 
    };
  } catch (error) {
    console.error('Read/Parse failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Read failed' 
    };
  }
}

/**
 * Get a public URL for a file in storage (for public buckets)
 * @param bucketName - Name of the storage bucket
 * @param filePath - Path to the file in the bucket
 */
export function getPublicFileUrl(bucketName: string, filePath: string): string {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

/**
 * Get a signed URL for private files (expires after specified time)
 * @param bucketName - Name of the storage bucket
 * @param filePath - Path to the file in the bucket
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 */
export async function getSignedUrl(
  bucketName: string, 
  filePath: string, 
  expiresIn: number = 3600
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, url: data.signedUrl };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create signed URL' 
    };
  }
}

/**
 * List files in a storage bucket folder
 * @param bucketName - Name of the storage bucket
 * @param folderPath - Path to the folder (optional, defaults to root)
 */
export async function listFiles(
  bucketName: string,
  folderPath?: string
): Promise<{ success: boolean; files?: any[]; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, files: data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to list files' 
    };
  }
}

/**
 * Delete a file from storage
 * @param bucketName - Name of the storage bucket
 * @param filePath - Path to the file to delete
 */
export async function deleteFile(
  bucketName: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete file' 
    };
  }
}

/**
 * Upload a user-selected file to storage
 * @param bucketName - Name of the storage bucket
 * @param file - File object from input element
 * @param filePath - Destination path in storage
 */
export async function uploadFile(
  bucketName: string,
  file: File,
  filePath: string,
  options: { upsert?: boolean } = {}
): Promise<JsonUploadResult> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        upsert: options.upsert || false
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, filePath: data.path };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
} 