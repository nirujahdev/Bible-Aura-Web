// Add Source Modal - For adding sources to existing notebook
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { uploadFile } from '@/lib/supabase-storage';
import { createSource, updateNotebookSourceCount } from '@/lib/research-lab/db-operations';
import {
  Upload,
  Link as LinkIcon,
  FileText,
  X,
  Globe,
  Clipboard,
  File,
  Image as ImageIcon,
  Video,
  Music,
  Loader2,
  Search,
  Mic
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceInput } from '@/hooks/useVoiceInput';

interface AddSourceModalProps {
  open: boolean;
  onClose: () => void;
  notebookId: string;
  onAdded: () => void;
}

export function AddSourceModal({ open, onClose, notebookId, onAdded }: AddSourceModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ title: string; url: string; summary: string }>>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'link' | 'paste' | 'search'>('upload');
  const { 
    transcript, 
    isListening, 
    error: voiceError, 
    startListening, 
    stopListening, 
    reset: resetVoice,
    isSupported: isVoiceSupported 
  } = useVoiceInput();

  // Update pasted text when transcript changes
  useEffect(() => {
    if (transcript && activeTab === 'paste') {
      setPastedText(prev => prev + (prev ? ' ' : '') + transcript);
      resetVoice();
    }
  }, [transcript, activeTab, resetVoice]);

  // Show voice error toast
  useEffect(() => {
    if (voiceError) {
      toast({
        title: 'Voice Input Error',
        description: voiceError,
        variant: 'destructive',
      });
    }
  }, [voiceError, toast]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds 50MB limit`,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getSourceType = (file: File): string => {
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.name.endsWith('.txt')) return 'txt';
    if (file.name.endsWith('.md')) return 'markdown';
    return 'text';
  };

  const handleAddSources = async () => {
    if (!user || !notebookId) return;

    if (selectedFiles.length === 0 && !linkUrl && !pastedText) {
      toast({
        title: 'No sources',
        description: 'Please add at least one source',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const uploadErrors: string[] = [];
      let successCount = 0;
      
      // Upload files
      for (const file of selectedFiles) {
        try {
          // Validate file size
          const maxSize = 50 * 1024 * 1024; // 50MB
          if (file.size > maxSize) {
            uploadErrors.push(`${file.name}: File exceeds 50MB limit`);
            continue;
          }

          // Validate file type
          const allowedTypes = [
            'application/pdf',
            'text/plain',
            'text/markdown',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/',
            'video/',
            'audio/',
          ];
          const isValidType = allowedTypes.some(type => 
            file.type === type || (type.endsWith('/') && file.type.startsWith(type))
          );
          if (!isValidType && !file.name.match(/\.(txt|md|pdf|doc|docx)$/i)) {
            uploadErrors.push(`${file.name}: Unsupported file type`);
            continue;
          }

          const filePath = `${user.id}/${notebookId}/${Date.now()}-${file.name}`;
          const uploadResult = await uploadFile('research-lab-sources', file, filePath);
          
          if (!uploadResult.success) {
            // Check if bucket doesn't exist
            if (uploadResult.error?.includes('Bucket not found') || uploadResult.error?.includes('not found')) {
              uploadErrors.push(`Storage bucket not found. Please run the SQL migration: supabase/migrations/20241118000003_create_storage_bucket.sql`);
              continue;
            }
            // Check for quota errors
            if (uploadResult.error?.includes('quota') || uploadResult.error?.includes('storage')) {
              uploadErrors.push(`${file.name}: Storage quota exceeded. Please upgrade your plan.`);
              continue;
            }
            // Check for permission errors
            if (uploadResult.error?.includes('permission') || uploadResult.error?.includes('403')) {
              uploadErrors.push(`${file.name}: Permission denied. Please check your storage settings.`);
              continue;
            }
            uploadErrors.push(`${file.name}: ${uploadResult.error || 'Upload failed'}`);
            continue;
          }

          // Get signed URL (since bucket is private)
          let signedUrl = filePath; // Fallback to file_path
          try {
            const { data: urlData, error: urlError } = await supabase.storage
              .from('research-lab-sources')
              .createSignedUrl(filePath, 3600 * 24 * 7); // 7 days expiry
            
            if (urlError) {
              console.error('Error creating signed URL:', urlError);
              // Continue with file_path as fallback - file is still uploaded
            } else if (urlData?.signedUrl) {
              signedUrl = urlData.signedUrl;
            }
          } catch (urlErr: any) {
            console.error('Error generating signed URL:', urlErr);
            // Continue with file_path as fallback
          }

          // Create source record using db-operations helper
          const { data: newSource, error: sourceError } = await createSource({
            notebook_id: notebookId,
            user_id: user.id,
            source_type: getSourceType(file) as any,
            title: file.name,
            file_path: filePath,
            file_url: signedUrl, // Use signed URL or fallback to file_path
            file_size: file.size,
            mime_type: file.type,
          });

          if (sourceError) {
            uploadErrors.push(`${file.name}: Failed to create source record - ${sourceError.message || 'Unknown error'}`);
            continue;
          }

          successCount++;

          // Automatically trigger Summarize agent for this source
          if (newSource?.id) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              fetch('/api/research-lab/agents', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                  agentType: 'summarize',
                  notebookId,
                  summaryType: 'detailed',
                  sourceIds: [newSource.id],
                }),
              })
              .then(async (res) => {
                if (res.ok) {
                  const data = await res.json();
                  // Update source with summary in key_insights
                  if (data.summary) {
                    await supabase
                      .from('research_sources')
                      .update({ key_insights: data.summary })
                      .eq('id', newSource.id);
                  }
                }
              })
              .catch(err => console.error('Failed to generate summary:', err));
            }
          }
        } catch (fileError: any) {
          uploadErrors.push(`${file.name}: ${fileError.message || 'Upload failed'}`);
        }
      }

      // Show errors if any
      if (uploadErrors.length > 0) {
        toast({
          title: 'Some uploads failed',
          description: uploadErrors.slice(0, 3).join(', ') + (uploadErrors.length > 3 ? ` and ${uploadErrors.length - 3} more` : ''),
          variant: 'destructive',
          duration: 5000,
        });
      }

      if (successCount > 0 && uploadErrors.length === 0) {
        toast({
          title: 'Sources added',
          description: `Successfully added ${successCount} source(s)`,
        });
      }

      // Add link source
      if (linkUrl) {
        const { data: newSource, error: linkError } = await createSource({
          notebook_id: notebookId,
          user_id: user.id,
          source_type: 'link',
          title: linkUrl,
          link_url: linkUrl,
        });

        if (linkError) throw linkError;

        // Automatically trigger Summarize agent for this source
        if (newSource?.id) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            fetch('/api/research-lab/agents', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                agentType: 'summarize',
                notebookId,
                summaryType: 'detailed',
                sourceIds: [newSource.id],
              }),
            })
            .then(async (res) => {
              if (res.ok) {
                const data = await res.json();
                if (data.summary) {
                  await supabase
                    .from('research_sources')
                    .update({ key_insights: data.summary })
                    .eq('id', newSource.id);
                }
              }
            })
            .catch(err => console.error('Failed to generate summary:', err));
          }
        }
      }

      // Add pasted text source
      if (pastedText) {
        const { data: newSource, error: textError } = await createSource({
          notebook_id: notebookId,
          user_id: user.id,
          source_type: 'text',
          title: 'Pasted Text',
          content_text: pastedText,
        });

        if (textError) throw textError;

        // Automatically trigger Summarize agent for this source
        if (newSource?.id) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            fetch('/api/research-lab/agents', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                agentType: 'summarize',
                notebookId,
                summaryType: 'detailed',
                sourceIds: [newSource.id],
              }),
            })
            .then(async (res) => {
              if (res.ok) {
                const data = await res.json();
                if (data.summary) {
                  await supabase
                    .from('research_sources')
                    .update({ key_insights: data.summary })
                    .eq('id', newSource.id);
                }
              }
            })
            .catch(err => console.error('Failed to generate summary:', err));
          }
        }
      }

      // Update notebook source count
      const sourceCount = selectedFiles.length + (linkUrl ? 1 : 0) + (pastedText ? 1 : 0);
      const { error: countError } = await updateNotebookSourceCount(notebookId, user.id, sourceCount);
      if (countError) {
        console.warn('Failed to update source count:', countError);
        // Don't throw - source creation was successful
      }

      toast({
        title: 'Sources added',
        description: `Successfully added ${sourceCount} source(s)`,
      });

      handleClose();
      onAdded();
    } catch (error: any) {
      console.error('Error adding sources:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add sources',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleWebSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Empty query',
        description: 'Please enter a search query',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('/api/research-lab/web-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Search failed');
      }

      const data = await response.json();
      
      // Display summary and all search results
      if (data.summary || (data.results && data.results.length > 0)) {
        const results: Array<{ title: string; url: string; summary: string }> = [];
        
        // Add summary as first result
        if (data.summary) {
          results.push({
            title: `Search Summary: ${searchQuery}`,
            url: '',
            summary: data.summary
          });
        }
        
        // Add individual search results
        if (data.results && Array.isArray(data.results)) {
          data.results.forEach((r: any) => {
            results.push({
              title: r.title || 'Web Result',
              url: r.url || '',
              summary: r.snippet || r.content || ''
            });
          });
        }
        
        setSearchResults(results);
      }
    } catch (error: any) {
      console.error('Web search error:', error);
      toast({
        title: 'Search failed',
        description: error.message || 'Failed to perform web search',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddSearchResult = async (result: { title: string; url: string; summary: string }) => {
    if (!user || !notebookId) return;

    setIsUploading(true);
    try {
      // Add as text source with summary
      const { data: newSource, error } = await createSource({
        notebook_id: notebookId,
        user_id: user.id,
        source_type: 'text',
        title: result.title,
        content_text: result.summary,
        link_url: result.url || undefined,
      });

      if (error) throw error;

      // Summary is already provided, but we can still update key_insights
      if (newSource?.id && result.summary) {
        // Update key_insights with the summary
        const { error: updateError } = await supabase
          .from('research_sources')
          .update({ key_insights: result.summary })
          .eq('id', newSource.id);
        
        if (updateError) {
          console.error('Failed to update key_insights:', updateError);
        }
      }

      // Update notebook source count
      await updateNotebookSourceCount(notebookId, user.id, 1);

      toast({
        title: 'Source added',
        description: 'Web search result added to notebook',
      });

      setSearchResults([]);
      setSearchQuery('');
      handleClose();
      onAdded();
    } catch (error: any) {
      console.error('Error adding search result:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add source',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setLinkUrl('');
    setPastedText('');
    setSearchQuery('');
    setSearchResults([]);
    setActiveTab('upload');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Add sources</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Tabs */}
          <div className="flex gap-1 sm:gap-2 border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('upload')}
              className={cn(
                'px-3 sm:px-4 py-2 border-b-2 transition-colors whitespace-nowrap text-xs sm:text-sm flex items-center gap-1 sm:gap-2',
                activeTab === 'upload'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Upload Files</span>
              <span className="sm:hidden">Upload</span>
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={cn(
                'px-3 sm:px-4 py-2 border-b-2 transition-colors whitespace-nowrap text-xs sm:text-sm flex items-center gap-1 sm:gap-2',
                activeTab === 'link'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Add Link</span>
              <span className="sm:hidden">Link</span>
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={cn(
                'px-3 sm:px-4 py-2 border-b-2 transition-colors whitespace-nowrap text-xs sm:text-sm flex items-center gap-1 sm:gap-2',
                activeTab === 'paste'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              <Clipboard className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Paste Text</span>
              <span className="sm:hidden">Paste</span>
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={cn(
                'px-3 sm:px-4 py-2 border-b-2 transition-colors whitespace-nowrap text-xs sm:text-sm flex items-center gap-1 sm:gap-2',
                activeTab === 'search'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Web Search</span>
              <span className="sm:hidden">Search</span>
            </button>
          </div>

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={cn(
                  'border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors',
                  dragActive
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300 hover:border-gray-400'
                )}
              >
                <Upload className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
                <p className="text-sm sm:text-base text-gray-700 font-medium mb-2">Upload sources</p>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                  <span className="hidden sm:inline">Drag and drop or </span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-orange-600 hover:text-orange-700 underline"
                  >
                    choose file to upload
                  </button>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.txt,.md,.doc,.docx,image/*,audio/*,video/*"
                />
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-3 sm:mt-4 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Link Tab */}
          {activeTab === 'link' && (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="link-url" className="text-sm sm:text-base">Website URL</Label>
                <Input
                  id="link-url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="mt-1 text-sm sm:text-base"
                />
              </div>
            </div>
          )}

          {/* Paste Text Tab */}
          {activeTab === 'paste' && (
            <div>
              <Label htmlFor="pasted-text" className="text-sm sm:text-base">Paste your text</Label>
              <div className="relative mt-1">
                <textarea
                  id="pasted-text"
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your text here..."
                  className="w-full min-h-[150px] sm:min-h-[200px] p-3 pr-10 border rounded-lg resize-none text-sm sm:text-base"
                />
                {isVoiceSupported && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={isListening ? stopListening : startListening}
                    disabled={isUploading}
                    className={`absolute right-2 bottom-2 h-8 w-8 p-0 ${
                      isListening ? 'text-red-500 animate-pulse' : 'text-gray-500'
                    }`}
                    title={isListening ? 'Stop recording' : 'Start voice input'}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Web Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="search-query" className="text-sm sm:text-base">Search the web</Label>
                <div className="mt-1 flex gap-2">
                  <Input
                    id="search-query"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isSearching) {
                        handleWebSearch();
                      }
                    }}
                    placeholder="Search for Bible articles, theological content..."
                    className="text-sm sm:text-base"
                  />
                  <Button
                    onClick={handleWebSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <h4 className="text-sm font-medium text-gray-900 mb-1">{result.title}</h4>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-3">{result.summary}</p>
                      <Button
                        onClick={() => handleAddSearchResult(result)}
                        disabled={isUploading}
                        size="sm"
                        className="w-full text-xs"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          'Add to Notebook'
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={isUploading} className="w-full sm:w-auto text-sm sm:text-base">
              Cancel
            </Button>
            <Button
              onClick={handleAddSources}
              disabled={isUploading}
              className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto text-sm sm:text-base"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Add Sources</span>
                  <span className="sm:hidden">Add</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

