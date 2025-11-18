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
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [activeTab, setActiveTab] = useState<'upload' | 'link' | 'paste'>('upload');

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
      // Upload files
      for (const file of selectedFiles) {
        const filePath = `${user.id}/${notebookId}/${Date.now()}-${file.name}`;
        const uploadResult = await uploadFile('research-lab-sources', file, filePath);

        if (!uploadResult.success) {
          throw new Error(`Failed to upload ${file.name}: ${uploadResult.error}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('research-lab-sources')
          .getPublicUrl(filePath);

        // Create source record
        const { error: sourceError } = await supabase
          .from('research_sources')
          .insert({
            notebook_id: notebookId,
            user_id: user.id,
            source_type: getSourceType(file),
            title: file.name,
            file_path: filePath,
            file_url: urlData.publicUrl,
            file_size: file.size,
            mime_type: file.type,
            processing_status: 'pending',
          });

        if (sourceError) throw sourceError;
      }

      // Add link source
      if (linkUrl) {
        const { error: linkError } = await supabase
          .from('research_sources')
          .insert({
            notebook_id: notebookId,
            user_id: user.id,
            source_type: 'link',
            title: linkUrl,
            link_url: linkUrl,
            processing_status: 'pending',
          });

        if (linkError) throw linkError;
      }

      // Add pasted text source
      if (pastedText) {
        const { error: textError } = await supabase
          .from('research_sources')
          .insert({
            notebook_id: notebookId,
            user_id: user.id,
            source_type: 'text',
            title: 'Pasted Text',
            content_text: pastedText,
            processing_status: 'completed',
          });

        if (textError) throw textError;
      }

      // Update notebook source count
      const sourceCount = selectedFiles.length + (linkUrl ? 1 : 0) + (pastedText ? 1 : 0);
      await supabase.rpc('increment', {
        table_name: 'research_notebooks',
        id: notebookId,
        column_name: 'source_count',
        increment_value: sourceCount,
      }).catch(() => {
        // If RPC doesn't exist, manually update
        const { data: notebook } = await supabase
          .from('research_notebooks')
          .select('source_count')
          .eq('id', notebookId)
          .single();

        if (notebook) {
          await supabase
            .from('research_notebooks')
            .update({ source_count: (notebook.source_count || 0) + sourceCount })
            .eq('id', notebookId);
        }
      });

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

  const handleClose = () => {
    setSelectedFiles([]);
    setLinkUrl('');
    setPastedText('');
    setActiveTab('upload');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add sources</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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

              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSources}
              disabled={isUploading}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Sources'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

