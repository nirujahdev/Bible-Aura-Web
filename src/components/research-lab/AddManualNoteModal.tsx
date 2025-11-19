// Add Manual Note Modal - For user-created notes (non-AI)
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, X } from 'lucide-react';

interface AddManualNoteModalProps {
  open: boolean;
  onClose: () => void;
  notebookId: string;
  onSaved: () => void;
}

export function AddManualNoteModal({ open, onClose, notebookId, onSaved }: AddManualNoteModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !content.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter note content',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Create manual note as a studio output
      const { data, error } = await supabase
        .from('research_studio_outputs')
        .insert({
          notebook_id: notebookId,
          user_id: user.id,
          output_type: 'manual_note',
          content: {
            title: title.trim() || 'Untitled Note',
            text: content.trim(),
            created_manually: true,
            created_at: new Date().toISOString(),
          },
          metadata: {
            format: 'note',
            isManual: true,
          },
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Note saved',
        description: 'Your note has been saved successfully',
      });

      // Reset form
      setTitle('');
      setContent('');
      onSaved();
      onClose();
    } catch (error: any) {
      console.error('Error saving note:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save note',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-600" />
            Add Manual Note
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="note-title">Title (optional)</Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="note-content">Content *</Label>
            <Textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              className="mt-1 min-h-[200px]"
              rows={10}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !content.trim()}>
              {saving ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

