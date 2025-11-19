// Rename Notebook Modal Component
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { updateNotebookTitle } from '@/lib/research-lab/db-operations';

interface RenameNotebookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId: string;
  currentTitle: string;
  currentDescription?: string | null;
  userId: string;
  onSuccess?: () => void;
}

export function RenameNotebookModal({
  open,
  onOpenChange,
  notebookId,
  currentTitle,
  currentDescription,
  userId,
  onSuccess,
}: RenameNotebookModalProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(currentTitle);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(currentTitle);
    }
  }, [open, currentTitle]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: 'Invalid title',
        description: 'Notebook title cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    if (title.trim() === currentTitle) {
      onOpenChange(false);
      return;
    }

    setLoading(true);
    try {
      const { error } = await updateNotebookTitle(notebookId, userId, title.trim());
      
      if (error) throw error;

      toast({
        title: 'Notebook renamed',
        description: `"${title}" has been updated`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error renaming notebook:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to rename notebook',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rename Notebook</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="notebook-title">Title</Label>
            <Input
              id="notebook-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notebook title"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();
                }
              }}
              disabled={loading}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !title.trim()}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

