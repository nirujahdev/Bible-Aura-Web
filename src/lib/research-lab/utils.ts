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

/**
 * Format relative time (e.g., "2m ago", "1h ago", "2d ago")
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Unknown';
  }
}

/**
 * Get output title from content
 */
export function getOutputTitle(output: any): string {
  if (!output || !output.content) {
    return 'Untitled';
  }

  if (typeof output.content === 'string') {
    // Try to extract title from markdown or first line
    const lines = output.content.split('\n');
    const firstLine = lines[0]?.trim();
    if (firstLine && firstLine.length < 100) {
      return firstLine.replace(/^#+\s*/, ''); // Remove markdown headers
    }
    return firstLine?.substring(0, 50) + '...' || 'Untitled';
  }
  
  return output.content?.title || 
         output.content?.topic || 
         output.content?.verseReference || 
         output.content?.question || 
         output.content?.scriptureReference ||
         output.content?.doctrinalQuestion ||
         'Untitled';
}

/**
 * Get format label for output type
 */
export function getFormatLabel(outputType: string, format?: string): string | null {
  if (!format) return null;
  
  const formatMap: Record<string, string> = {
    'brief': 'Brief',
    'detailed': 'Detailed',
    'thematic': 'Thematic',
    'expository': 'Expository',
    'topical': 'Topical',
    'narrative': 'Narrative',
    'en': 'English',
    'ta': 'Tamil',
  };
  
  return formatMap[format] || format;
}
