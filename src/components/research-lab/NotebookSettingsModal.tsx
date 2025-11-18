// Notebook Settings Modal
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Settings, 
  Trash2, 
  Download,
  FileText,
  Share2,
  Database
} from 'lucide-react';
import { deleteNotebook } from '@/lib/research-lab/db-operations';

interface NotebookSettingsModalProps {
  open: boolean;
  onClose: () => void;
  notebookId: string;
  notebookTitle: string;
  onUpdate?: () => void;
}

export function NotebookSettingsModal({ 
  open, 
  onClose, 
  notebookId,
  notebookTitle,
  onUpdate
}: NotebookSettingsModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [title, setTitle] = useState(notebookTitle);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!notebookId || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('research_notebooks')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', notebookId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Settings saved',
        description: 'Notebook settings have been updated',
      });
      
      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!notebookId || !user) return;

    setDeleting(true);
    try {
      const { error } = await deleteNotebook(notebookId, user.id);
      
      if (error) throw error;

      toast({
        title: 'Notebook deleted',
        description: 'The notebook has been permanently deleted',
      });
      
      navigate('/research-lab');
    } catch (error: any) {
      console.error('Error deleting notebook:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete notebook',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleExport = async () => {
    if (!notebookId || !user) return;

    try {
      // Fetch notebook data
      const { data: notebook, error: notebookError } = await supabase
        .from('research_notebooks')
        .select('*')
        .eq('id', notebookId)
        .single();

      if (notebookError) throw notebookError;

      // Fetch sources
      const { data: sources, error: sourcesError } = await supabase
        .from('research_sources')
        .select('*')
        .eq('notebook_id', notebookId);

      if (sourcesError) throw sourcesError;

      // Fetch messages
      const { data: messages, error: messagesError } = await supabase
        .from('research_chat_messages')
        .select('*')
        .eq('notebook_id', notebookId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Create export data
      const exportData = {
        notebook,
        sources: sources || [],
        messages: messages || [],
        exported_at: new Date().toISOString(),
        version: '1.0',
      };

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${notebookTitle.replace(/[^a-z0-9]/gi, '_')}_export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: 'Notebook data has been exported',
      });
    } catch (error: any) {
      console.error('Error exporting notebook:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to export notebook',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-600" />
              Notebook Settings
            </DialogTitle>
            <DialogDescription>
              Manage your notebook settings, export data, or delete the notebook
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="danger">Danger</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notebook title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description for this notebook..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={loading || !title.trim()}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Save Changes
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="export" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start gap-3">
                    <Database className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Export Notebook Data</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Export all notebook data including sources, chat messages, and settings as a JSON file.
                      </p>
                      <Button
                        variant="outline"
                        onClick={handleExport}
                        className="w-full sm:w-auto"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export as JSON
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Export Formats</h4>
                      <p className="text-sm text-gray-600">
                        Additional export formats (PDF, Markdown) will be available in a future update.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="danger" className="space-y-4 mt-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start gap-3">
                  <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900 mb-1">Delete Notebook</h4>
                    <p className="text-sm text-red-700 mb-3">
                      This action cannot be undone. This will permanently delete the notebook, all sources, chat messages, and studio outputs.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      disabled={deleting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Notebook
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the notebook
              &quot;{notebookTitle}&quot; and all of its data including sources, chat messages, and studio outputs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

