// Create Notebook Modal - Upload sources interface
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { createNotebook, createSource, updateNotebookSourceCount } from '@/lib/research-lab/db-operations';
import { uploadFile } from '@/lib/supabase-storage';
import { sanitizeFileName } from '@/lib/research-lab/utils';
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
  FlaskConical
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateNotebookModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (notebookId: string) => void;
}

export function CreateNotebookModal({ open, onClose, onCreated }: CreateNotebookModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notebookTitle, setNotebookTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'link' | 'paste'>('upload');

  const supportedFileTypes = [
    'PDF', '.txt', 'Markdown',
    'Audio (e.g. mp3, wav, m4a)',
    '.avif', '.bmp', '.gif', '.ico', '.jp2', '.png', '.webp', '.tif', '.tiff', '.heic', '.heif', '.jpeg', '.jpg', '.jpe',
    'Video (e.g. mp4, webm)'
  ];

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

  const handleCreate = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to create a notebook',
        variant: 'destructive',
      });
      return;
    }

    if (!notebookTitle.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a notebook title',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create notebook using db-operations helper
      const { data: notebook, error: notebookError } = await createNotebook(
        user.id,
        notebookTitle.trim() || 'Untitled notebook'
      );

      if (notebookError) {
        // Re-throw with the error object to preserve error details
        throw notebookError;
      }

      if (!notebook) {
        throw new Error('Failed to create notebook: No data returned');
      }

      // Process sources if any were provided
      const hasSources = selectedFiles.length > 0 || linkUrl.trim() || pastedText.trim();
      let sourceCount = 0;
      const uploadErrors: string[] = [];

      if (hasSources) {
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

            // Get source type
            const getSourceType = (file: File): string => {
              if (file.type === 'application/pdf') return 'pdf';
              if (file.type.startsWith('image/')) return 'image';
              if (file.type.startsWith('video/')) return 'video';
              if (file.type.startsWith('audio/')) return 'audio';
              if (file.name.endsWith('.txt')) return 'txt';
              if (file.name.endsWith('.md')) return 'markdown';
              return 'text';
            };

            // Sanitize filename
            const sanitizedFileName = sanitizeFileName(file.name);
            const filePath = `${user.id}/${notebook.id}/${Date.now()}-${sanitizedFileName}`;
            const uploadResult = await uploadFile('research-lab-sources', file, filePath);
            
            if (!uploadResult.success) {
              uploadErrors.push(`${file.name}: ${uploadResult.error || 'Upload failed'}`);
              continue;
            }

            // Get signed URL
            let signedUrl = filePath;
            try {
              const { data: urlData } = await supabase.storage
                .from('research-lab-sources')
                .createSignedUrl(filePath, 3600 * 24 * 7);
              if (urlData?.signedUrl) {
                signedUrl = urlData.signedUrl;
              }
            } catch (urlErr) {
              console.error('Error creating signed URL:', urlErr);
            }

            // Create source record
            const { data: newSource, error: sourceError } = await createSource({
              notebook_id: notebook.id,
              user_id: user.id,
              source_type: getSourceType(file) as any,
              title: file.name,
              file_path: filePath,
              file_url: signedUrl,
              file_size: file.size,
              mime_type: file.type,
            });

            if (sourceError) {
              uploadErrors.push(`${file.name}: Failed to create source - ${sourceError.message || 'Unknown error'}`);
              continue;
            }

            sourceCount++;

            // Process source (extract text and index) - async, non-blocking
            if (newSource?.id) {
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                // Call process-source API to extract text and index
                // This handles: file download → text extraction → content update → indexing
                fetch('/api/research-lab/process-source', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                  },
                  body: JSON.stringify({
                    sourceId: newSource.id,
                    notebookId: notebook.id,
                  }),
                })
                .then(async (res) => {
                  if (res.ok) {
                    console.log('Source processed successfully');
                  } else {
                    const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
                    console.error('Failed to process source:', errorData);
                  }
                })
                .catch((err) => {
                  console.error('Failed to process source:', err);
                  // Mark processing as failed
                  supabase
                    .from('research_sources')
                    .update({ processing_status: 'failed' })
                    .eq('id', newSource.id)
                    .catch(updateErr => console.error('Failed to update status:', updateErr));
                });
              }
            }
          } catch (fileError: any) {
            uploadErrors.push(`${file.name}: ${fileError.message || 'Upload failed'}`);
          }
        }

        // Add link source
        if (linkUrl.trim()) {
          try {
            const { data: newSource, error: linkError } = await createSource({
              notebook_id: notebook.id,
              user_id: user.id,
              source_type: 'link',
              title: linkUrl.trim(),
              link_url: linkUrl.trim(),
            });

            if (linkError) {
              uploadErrors.push(`Link: Failed to add - ${linkError.message || 'Unknown error'}`);
            } else {
              sourceCount++;
              // Process link source (process-source API will detect it has content_text and just trigger indexing)
              if (newSource?.id) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                  fetch('/api/research-lab/process-source', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                      sourceId: newSource.id,
                      notebookId: notebook.id,
                    }),
                  }).catch(err => console.error('Failed to process source:', err));
                }
              }
            }
          } catch (linkErr: any) {
            uploadErrors.push(`Link: ${linkErr.message || 'Failed to add'}`);
          }
        }

        // Add pasted text source
        if (pastedText.trim()) {
          try {
            const { data: newSource, error: textError } = await createSource({
              notebook_id: notebook.id,
              user_id: user.id,
              source_type: 'text',
              title: 'Pasted Text',
              content_text: pastedText.trim(),
            });

            if (textError) {
              uploadErrors.push(`Pasted text: Failed to add - ${textError.message || 'Unknown error'}`);
            } else {
              sourceCount++;
              // Process text source (process-source API will detect it has content_text and just trigger indexing)
              if (newSource?.id) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                  fetch('/api/research-lab/process-source', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                      sourceId: newSource.id,
                      notebookId: notebook.id,
                    }),
                  }).catch(err => console.error('Failed to process source:', err));
                }
              }
            }
          } catch (textErr: any) {
            uploadErrors.push(`Pasted text: ${textErr.message || 'Failed to add'}`);
          }
        }

        // Update notebook source count
        if (sourceCount > 0) {
          await updateNotebookSourceCount(notebook.id, user.id, sourceCount);
        }

        // Show results
        if (uploadErrors.length > 0 && sourceCount > 0) {
          toast({
            title: 'Notebook created with partial sources',
            description: `Added ${sourceCount} source(s), but ${uploadErrors.length} failed.`,
            variant: 'default',
            duration: 5000,
          });
        } else if (uploadErrors.length > 0) {
          toast({
            title: 'Notebook created, but sources failed',
            description: `All ${uploadErrors.length} source(s) failed to add.`,
            variant: 'destructive',
            duration: 5000,
          });
        } else if (sourceCount > 0) {
          toast({
            title: 'Notebook created',
            description: `"${notebookTitle}" created with ${sourceCount} source(s). Sources are being processed...`,
            duration: 4000,
          });
        } else {
          toast({
            title: 'Notebook created',
            description: `"${notebookTitle}" has been created successfully`,
          });
        }
      } else {
        toast({
          title: 'Notebook created',
          description: `"${notebookTitle}" has been created successfully`,
        });
      }

      onCreated(notebook.id);
      handleClose();
    } catch (error: any) {
      console.error('Error creating notebook:', error);
      
      // Check for various error types
      const errorMessage = error?.message || String(error) || '';
      const errorCode = error?.code || error?.error?.code;
      const isTableMissing = 
        errorCode === 'TABLE_NOT_FOUND' ||
        errorMessage.includes('relation') && errorMessage.includes('does not exist') ||
        errorMessage.includes('PGRST116') ||
        errorMessage.includes('JSON') && errorMessage.includes('DOCTYPE') ||
        error?.error?.code === 'TABLE_NOT_FOUND';
      
      if (isTableMissing || error?.error?.code === 'TABLE_NOT_FOUND') {
        toast({
          title: 'Database Setup Required',
          description: 'Research Lab tables need to be created. Go to Supabase Dashboard → SQL Editor, open supabase/migrations/20241118000000_create_research_lab_tables.sql, copy the SQL, and run it.',
          variant: 'destructive',
          duration: 12000,
        });
      } else {
        const displayMessage = error?.error?.message || error?.message || 'Failed to create notebook';
        toast({
          title: 'Error',
          description: displayMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setNotebookTitle('');
    setSelectedFiles([]);
    setLinkUrl('');
    setPastedText('');
    setActiveTab('upload');
    onClose();
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return <ImageIcon className="h-5 w-5" />;
    if (type.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (type.startsWith('audio/')) return <Music className="h-5 w-5" />;
    if (type === 'application/pdf') return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FlaskConical className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
            Create new notebook
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Notebook Title */}
          <div>
            <Label htmlFor="notebook-title" className="text-sm sm:text-base">Notebook Title</Label>
            <Input
              id="notebook-title"
              value={notebookTitle}
              onChange={(e) => setNotebookTitle(e.target.value)}
              placeholder="Untitled notebook"
              className="mt-1 text-sm sm:text-base"
            />
          </div>

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
          </div>

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div>
              {/* Drag and Drop Area */}
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

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mt-3 sm:mt-4 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {getFileIcon(file)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
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

              {/* Supported File Types */}
              <div className="mt-4">
                <p className="text-xs text-gray-600 mb-2">Supported file types:</p>
                <div className="flex flex-wrap gap-2">
                  {supportedFileTypes.map((type, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
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
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 text-xs sm:text-sm">
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Website</span>
                </Button>
                <Button variant="outline" className="flex-1 text-xs sm:text-sm">
                  <Video className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">YouTube</span>
                </Button>
              </div>
            </div>
          )}

          {/* Paste Text Tab */}
          {activeTab === 'paste' && (
            <div>
              <Label htmlFor="pasted-text" className="text-sm sm:text-base">Paste your text</Label>
              <textarea
                id="pasted-text"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your text here..."
                className="mt-1 w-full min-h-[150px] sm:min-h-[200px] p-3 border rounded-lg resize-none text-sm sm:text-base"
              />
            </div>
          )}

          {/* Source Limit */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
            <span>Source limit</span>
            <span>
              {selectedFiles.length + (linkUrl ? 1 : 0) + (pastedText ? 1 : 0)}/50
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={isCreating} className="w-full sm:w-auto text-sm sm:text-base">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto text-sm sm:text-base"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Create Notebook</span>
                  <span className="sm:hidden">Create</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

