/**
 * Research Lab Utility Functions
 */

/**
 * Sanitize filename for Supabase storage
 * Removes emojis, special characters, and ensures URL-safe format
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || fileName.trim() === '') {
    return 'file';
  }

  // Get file extension
  const lastDot = fileName.lastIndexOf('.');
  const name = lastDot > 0 ? fileName.substring(0, lastDot) : fileName;
  const ext = lastDot > 0 ? fileName.substring(lastDot) : '';

  // Sanitize: remove emojis, replace spaces with hyphens, remove special chars
  const sanitized = name
    // Remove emojis and special Unicode characters
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Emojis
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport symbols
    .replace(/[\u{2600}-\u{26FF}]/gu, '') // Miscellaneous symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
    // Remove special characters except word chars, spaces, hyphens, underscores
    .replace(/[^\w\s-]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '');

  // Fallback if sanitization results in empty string
  const finalName = sanitized || 'file';

  return `${finalName}${ext}`;
}

