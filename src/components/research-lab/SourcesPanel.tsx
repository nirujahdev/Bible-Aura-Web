// Sources Panel - Left panel in notebook view
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  getNotebookSources, 
  toggleSourceInclude, 
  deleteSource, 
  type Source 
} from '@/lib/research-lab/db-operations';
import { 
  Plus, 
  Search, 
  Globe, 
  Sparkles,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Link as LinkIcon,
  MoreVertical,
  Trash2,
  FlaskConical,
  BookOpen
} from 'lucide-react';
import { AddSourceModal } from './AddSourceModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';

interface SourcesPanelProps {
  notebookId: string;
}

export function SourcesPanel({ notebookId }: SourcesPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (notebookId && user) {
      loadSources();
    } else if (!user) {
      setLoading(false);
    }
  }, [notebookId, user]);

  const loadSources = async (isRetry = false) => {
    if (!notebookId || !user) return;

    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await getNotebookSources(notebookId, user.id);
      
      if (fetchError) {
        throw fetchError;
      }
      
      setSources(data || []);
      setRetryCount(0); // Reset retry count on success
    } catch (error: any) {
      console.error('[SourcesPanel] Error loading sources:', {
        error,
        context: 'load_sources',
        notebookId,
        userId: user.id,
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint
      });
      
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
        setError('Database setup required. Please run the migration SQL file.');
        if (!isRetry) {
          toast({
            title: 'Database Setup Required',
            description: 'Research Lab tables need to be created. Go to Supabase Dashboard → SQL Editor, open supabase/migrations/20241118000000_create_research_lab_tables.sql, copy the SQL, and run it.',
            variant: 'destructive',
            duration: 12000,
          });
        }
      } else {
        const displayError = error?.error?.message || error?.message || 'Failed to load sources';
        setError(displayError);
        if (!isRetry) {
          toast({
            title: 'Error',
            description: displayError,
            variant: 'destructive',
          });
        }
      }
      
      // Set empty array for graceful fallback
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    loadSources(true);
  };

  const handleToggleInclude = async (sourceId: string, currentValue: boolean) => {
    if (!user) return;

    try {
      const { error } = await toggleSourceInclude(sourceId, user.id, !currentValue);
      if (error) throw error;
      loadSources();
    } catch (error: any) {
      console.error('Error toggling source:', error);
      toast({
        title: 'Error',
        description: 'Failed to update source',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (sourceId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this source?')) {
      return;
    }

    try {
      const { error } = await deleteSource(sourceId, user.id);
      if (error) throw error;
      loadSources();
      toast({
        title: 'Source deleted',
        description: 'Source has been removed',
      });
    } catch (error: any) {
      console.error('Error deleting source:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete source',
        variant: 'destructive',
      });
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'docx':
      case 'txt':
      case 'markdown':
        return <FileText className="h-5 w-5" />;
      case 'image':
        return <ImageIcon className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'audio':
        return <Music className="h-5 w-5" />;
      case 'link':
        return <LinkIcon className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const filteredSources = sources.filter(source =>
    source.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Sources</h2>
          <Button
            size="sm"
            onClick={() => setAddModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm px-2 sm:px-3"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Add source</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
          <Input
            placeholder="Search the web for new sources"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 sm:pl-9 pr-16 sm:pr-9 text-sm h-9 sm:h-10"
          />
          <div className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 sm:w-auto sm:px-2 p-0">
              <Globe className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 sm:w-auto sm:px-2 p-0">
              <Sparkles className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sources List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg animate-pulse">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-8 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-lg bg-red-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-2">Failed to load sources</p>
            <p className="text-xs text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
              >
                <Search className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setError(null);
                  setSources([]);
                }}
              >
                Continue without sources
              </Button>
            </div>
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-lg bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <FlaskConical className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600 mb-2">Saved sources will appear here.</p>
            <p className="text-xs text-gray-500 mb-4">
              Click Add source above to add PDFs, websites, text, videos or audio files.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add source
            </Button>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredSources.map((source, index) => (
              <div
                key={source.id}
                className="group flex items-center gap-2 p-2 sm:p-3 rounded-lg hover:bg-gray-100 active:bg-gray-100 transition-all duration-200 hover:shadow-sm touch-manipulation"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex-shrink-0 text-gray-500">
                  {getSourceIcon(source.source_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{source.title}</p>
                  {source.key_insights ? (
                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{source.key_insights}</p>
                  ) : source.processing_status === 'processing' ? (
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <p className="text-xs text-gray-500">Generating summary...</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 capitalize">{source.source_type}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Switch
                    checked={source.is_included}
                    onCheckedChange={() => handleToggleInclude(source.id, source.is_included)}
                    className="scale-75 sm:scale-100 transition-all"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Rename</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(source.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Source Count */}
      <div className="p-3 sm:p-4 border-t border-gray-200 bg-white text-xs sm:text-sm text-gray-600">
        {sources.length} {sources.length === 1 ? 'source' : 'sources'}
      </div>

      {/* Add Source Modal */}
      <AddSourceModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        notebookId={notebookId}
        onAdded={loadSources}
      />
    </div>
  );
}

