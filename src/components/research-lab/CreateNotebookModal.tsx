// Create Notebook Modal - Upload sources interface
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { createNotebook } from '@/lib/research-lab/db-operations';
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

      // TODO: Upload files and create sources
      // This will be implemented in the next phase

      toast({
        title: 'Notebook created',
        description: `"${notebookTitle}" has been created successfully`,
      });

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-orange-600" />
            Create new notebook
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Notebook Title */}
          <div>
            <Label htmlFor="notebook-title">Notebook Title</Label>
            <Input
              id="notebook-title"
              value={notebookTitle}
              onChange={(e) => setNotebookTitle(e.target.value)}
              placeholder="Untitled notebook"
              className="mt-1"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab('upload')}
              className={cn(
                'px-4 py-2 border-b-2 transition-colors',
                activeTab === 'upload'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              <Upload className="h-4 w-4 inline mr-2" />
              Upload Files
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={cn(
                'px-4 py-2 border-b-2 transition-colors',
                activeTab === 'link'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              <LinkIcon className="h-4 w-4 inline mr-2" />
              Add Link
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={cn(
                'px-4 py-2 border-b-2 transition-colors',
                activeTab === 'paste'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              <Clipboard className="h-4 w-4 inline mr-2" />
              Paste Text
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
                  'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                  dragActive
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300 hover:border-gray-400'
                )}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-700 font-medium mb-2">Upload sources</p>
                <p className="text-sm text-gray-500 mb-4">
                  Drag and drop or{' '}
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
                <div className="mt-4 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(file)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
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
            <div className="space-y-4">
              <div>
                <Label htmlFor="link-url">Website URL</Label>
                <Input
                  id="link-url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Globe className="h-4 w-4 mr-2" />
                  Website
                </Button>
                <Button variant="outline" className="flex-1">
                  <Video className="h-4 w-4 mr-2" />
                  YouTube
                </Button>
              </div>
            </div>
          )}

          {/* Paste Text Tab */}
          {activeTab === 'paste' && (
            <div>
              <Label htmlFor="pasted-text">Paste your text</Label>
              <textarea
                id="pasted-text"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your text here..."
                className="mt-1 w-full min-h-[200px] p-3 border rounded-lg resize-none"
              />
            </div>
          )}

          {/* Source Limit */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Source limit</span>
            <span>
              {selectedFiles.length + (linkUrl ? 1 : 0) + (pastedText ? 1 : 0)}/50
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Notebook'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

