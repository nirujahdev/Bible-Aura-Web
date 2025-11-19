// Research Notebook View - Three-column layout (Sources | Chat | Studio)
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ModernLayout } from '@/components/ModernLayout';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
import { getNotebook, updateNotebookTitle, type Notebook } from '@/lib/research-lab/db-operations';
import { SourcesPanel } from '@/components/research-lab/SourcesPanel';
import { ChatPanel } from '@/components/research-lab/ChatPanel';
import { StudioPanel } from '@/components/research-lab/StudioPanel';
import { ShareNotebookModal } from '@/components/research-lab/ShareNotebookModal';
import { NotebookSettingsModal } from '@/components/research-lab/NotebookSettingsModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  ArrowLeft, 
  Share2, 
  Settings, 
  MoreVertical,
  Edit2,
  FlaskConical,
  FileText,
  MessageSquare,
  Sparkles
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
  const isMobile = useIsMobile();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sources' | 'chat' | 'studio'>('sources');

  const loadNotebook = useCallback(async () => {
    if (!notebookId || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await getNotebook(notebookId, user.id);

      if (error) {
        console.error('getNotebook error:', error);
        // Don't throw - handle gracefully
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
        setLoading(false);
        return;
      }

      if (!data) {
        toast({
          title: 'Notebook not found',
          description: 'This notebook does not exist or you do not have access',
          variant: 'destructive',
        });
        navigate('/research-lab');
        setLoading(false);
        return;
      }

      setNotebook(data);
      setEditedTitle(data.title || 'Untitled');
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
  }, [notebookId, user, navigate, toast]);

  useEffect(() => {
    if (notebookId && user) {
      loadNotebook();
    } else if (!user) {
      setLoading(false);
    }
  }, [notebookId, user, loadNotebook]);

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
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center animate-in fade-in">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading notebook...</p>
            <p className="text-sm text-gray-400 mt-2">Preparing your research workspace</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (!notebook && !loading) {
    // Show error state instead of returning null
    return (
      <ModernLayout>
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center animate-in fade-in max-w-md mx-auto p-8">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <FlaskConical className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Notebook not found</h2>
            <p className="text-sm text-gray-600 mb-6">
              This notebook doesn't exist or you don't have access to it.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate('/research-lab')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Research Lab
              </Button>
              <Button
                onClick={() => loadNotebook()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </ModernLayout>
    );
  }

  // Safety check - ensure notebook exists before rendering
  if (!notebook) {
    return null;
  }

  return (
    <ModernLayout>
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
        {/* Header - Enhanced */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-white to-orange-50/20 px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/research-lab')}
              className="flex-shrink-0 hover:bg-orange-50 transition-all duration-200 p-2 sm:p-2 rounded-lg hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              {!isMobile && <span>Back</span>}
            </Button>
            
            {isEditingTitle ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {!isMobile && <FlaskConical className="h-5 w-5 text-orange-600 flex-shrink-0" />}
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleUpdateTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateTitle();
                    } else if (e.key === 'Escape') {
                      setEditedTitle(notebook?.title || '');
                      setIsEditingTitle(false);
                    }
                  }}
                  className="flex-1 max-w-md text-sm sm:text-base border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                  autoFocus
                />
              </div>
            ) : (
              <h1
                className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate cursor-pointer hover:text-orange-600 flex items-center gap-2 group transition-all duration-200"
                onClick={() => setIsEditingTitle(true)}
              >
                {!isMobile && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-200">
                    <FlaskConical className="h-4 w-4 text-orange-600" />
                  </div>
                )}
                <span className="truncate">{notebook?.title || 'Untitled'}</span>
                {!isMobile && <Edit2 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-orange-500" />}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {!isMobile && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="hover:bg-orange-50 transition-all duration-200 rounded-lg hover:scale-105"
                onClick={() => setShareModalOpen(true)}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:bg-orange-50 transition-all duration-200 p-2 rounded-lg hover:scale-105"
              onClick={() => setSettingsModalOpen(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isMobile && (
                  <DropdownMenuItem onClick={() => setShareModalOpen(true)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>Export</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile: Tab Navigation */}
        {isMobile ? (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300">
            {/* Tab Navigation */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'sources' | 'chat' | 'studio')} className="w-full">
              <div className="border-b border-gray-200 bg-white px-2">
                <TabsList className="w-full grid grid-cols-3 h-12 bg-transparent">
                  <TabsTrigger 
                    value="sources" 
                    className="flex items-center gap-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:border-b-2 data-[state=active]:border-orange-600 rounded-none"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden xs:inline">Sources</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="chat"
                    className="flex items-center gap-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:border-b-2 data-[state=active]:border-orange-600 rounded-none"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden xs:inline">Chat</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="studio"
                    className="flex items-center gap-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:border-b-2 data-[state=active]:border-orange-600 rounded-none"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden xs:inline">Studio</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'sources' && (
                  <div className="h-full bg-gray-50">
                    {notebookId && <SourcesPanel notebookId={notebookId} />}
                  </div>
                )}
                {activeTab === 'chat' && (
                  <div className="h-full bg-white">
                    {notebookId && <ChatPanel notebookId={notebookId} />}
                  </div>
                )}
                {activeTab === 'studio' && (
                  <div className="h-full bg-gray-50">
                    {notebookId && <StudioPanel notebookId={notebookId} />}
                  </div>
                )}
              </div>
            </Tabs>
          </div>
        ) : (
          /* Desktop: Three-Column Layout - Enhanced */
          <div className="flex-1 flex overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left Panel: Sources */}
            <div className="w-80 border-r border-gray-200 bg-gradient-to-b from-gray-50 to-white flex flex-col transition-all shadow-sm">
              {notebookId && <SourcesPanel notebookId={notebookId} />}
            </div>

            {/* Center Panel: Chat */}
            <div className="flex-1 flex flex-col bg-white border-x border-gray-100">
              {notebookId && <ChatPanel notebookId={notebookId} />}
            </div>

            {/* Right Panel: Studio */}
            <div className="w-80 border-l border-gray-200 bg-gradient-to-b from-gray-50 to-white flex flex-col transition-all shadow-sm">
              {notebookId && <StudioPanel notebookId={notebookId} />}
            </div>
          </div>
        )}

        {/* Share Modal */}
        {notebook && (
          <>
            <ShareNotebookModal
              open={shareModalOpen}
              onClose={() => setShareModalOpen(false)}
              notebookId={notebook.id}
              notebookTitle={notebook.title}
            />
            <NotebookSettingsModal
              open={settingsModalOpen}
              onClose={() => setSettingsModalOpen(false)}
              notebookId={notebook.id}
              notebookTitle={notebook.title}
              onUpdate={loadNotebook}
            />
          </>
        )}
      </div>
    </ModernLayout>
  );
}

