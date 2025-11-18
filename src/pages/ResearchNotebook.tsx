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
  Edit2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Notebook {
  id: string;
  title: string;
  description: string | null;
  source_count: number;
}

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
      const { data, error } = await supabase
        .from('research_notebooks')
        .select('*')
        .eq('id', notebookId)
        .eq('user_id', user.id)
        .single();

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
      toast({
        title: 'Error',
        description: 'Failed to load notebook',
        variant: 'destructive',
      });
      navigate('/research-lab');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTitle = async () => {
    if (!notebookId || !user || !editedTitle.trim()) return;

    try {
      const { error } = await supabase
        .from('research_notebooks')
        .update({ title: editedTitle.trim() })
        .eq('id', notebookId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotebook(prev => prev ? { ...prev, title: editedTitle.trim() } : null);
      setIsEditingTitle(false);
      toast({
        title: 'Title updated',
        description: 'Notebook title has been updated',
      });
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
                className="text-lg font-semibold text-gray-900 truncate cursor-pointer hover:text-orange-600 flex items-center gap-2"
                onClick={() => setIsEditingTitle(true)}
              >
                {notebook.title}
                <Edit2 className="h-4 w-4 opacity-0 group-hover:opacity-100" />
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

