// Research Notebook View - Three-column layout (Sources | Chat | Studio)
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ModernLayout } from '@/components/ModernLayout';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
import { SourcesPanel } from '@/components/research-lab/SourcesPanel';
import { ChatPanel } from '@/components/research-lab/ChatPanel';
import { StudioPanel } from '@/components/research-lab/StudioPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Share2, 
  Settings, 
  MoreVertical,
  Edit2,
  FlaskConical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Notebook type imported from db-operations

export default function ResearchNotebook() {
  useSEO(SEO_CONFIG.RESEARCH_LAB || { title: 'Research Notebook - Bible Aura', description: 'Advanced Bible research with AI' });
  
  const { notebookId } = useParams<{ notebookId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  useEffect(() => {
    if (notebookId && user) {
      loadNotebook();
    }
  }, [notebookId, user]);

  const loadNotebook = async () => {
    if (!notebookId || !user) return;

    setLoading(true);
    try {
      const { data, error } = await getNotebook(notebookId, user.id);

      if (error) throw error;

      if (!data) {
        toast({
          title: 'Notebook not found',
          description: 'This notebook does not exist or you do not have access',
          variant: 'destructive',
        });
        navigate('/research-lab');
        return;
      }

      setNotebook(data);
      setEditedTitle(data.title);
    } catch (error: any) {
      console.error('Error loading notebook:', error);
      
      // Check for various error types
      const errorMessage = error?.message || String(error) || '';
      const errorCode = error?.code || error?.error?.code;
      const isTableMissing = 
        errorCode === 'TABLE_NOT_FOUND' ||
        (errorMessage.includes('relation') && errorMessage.includes('does not exist')) ||
        errorMessage.includes('PGRST116') ||
        (errorMessage.includes('JSON') && errorMessage.includes('DOCTYPE')) ||
        error?.error?.code === 'TABLE_NOT_FOUND';
      
      if (isTableMissing || error?.error?.code === 'TABLE_NOT_FOUND') {
        toast({
          title: 'Database Setup Required',
          description: 'Research Lab tables need to be created. Go to Supabase Dashboard → SQL Editor, open supabase/migrations/20241118000000_create_research_lab_tables.sql, copy the SQL, and run it.',
          variant: 'destructive',
          duration: 12000,
        });
      } else {
        const displayMessage = error?.error?.message || error?.message || 'Failed to load notebook';
        toast({
          title: 'Error',
          description: displayMessage,
          variant: 'destructive',
        });
      }
      
      // Don't navigate away if it's just a table missing error - let user see the message
      if (!isTableMissing && error?.error?.code !== 'TABLE_NOT_FOUND') {
        navigate('/research-lab');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTitle = async () => {
    if (!notebookId || !user || !editedTitle.trim()) return;

    try {
      const { data, error } = await updateNotebookTitle(notebookId, user.id, editedTitle.trim());

      if (error) throw error;

      if (data) {
        setNotebook(data);
        setIsEditingTitle(false);
        toast({
          title: 'Title updated',
          description: 'Notebook title has been updated',
        });
      }
    } catch (error: any) {
      console.error('Error updating title:', error);
      toast({
        title: 'Error',
        description: 'Failed to update title',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <ModernLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notebook...</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (!notebook) {
    return null;
  }

  return (
    <ModernLayout>
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/research-lab')}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {isEditingTitle ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FlaskConical className="h-5 w-5 text-orange-600 flex-shrink-0" />
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleUpdateTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateTitle();
                    } else if (e.key === 'Escape') {
                      setEditedTitle(notebook.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="flex-1 max-w-md"
                  autoFocus
                />
              </div>
            ) : (
              <h1
                className="text-lg font-semibold text-gray-900 truncate cursor-pointer hover:text-orange-600 flex items-center gap-2 group"
                onClick={() => setIsEditingTitle(true)}
              >
                <FlaskConical className="h-5 w-5 text-orange-600 flex-shrink-0" />
                {notebook.title}
                <Edit2 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Three-Column Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Sources */}
          <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
            <SourcesPanel notebookId={notebookId!} />
          </div>

          {/* Center Panel: Chat */}
          <div className="flex-1 flex flex-col bg-white">
            <ChatPanel notebookId={notebookId!} />
          </div>

          {/* Right Panel: Studio */}
          <div className="w-80 border-l border-gray-200 bg-gray-50 flex flex-col">
            <StudioPanel notebookId={notebookId!} />
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}

