// Sources Panel - Left panel in notebook view - Enhanced UI
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { 
  getNotebookSources, 
  toggleSourceInclude, 
  deleteSource,
  bulkToggleSourceInclude,
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
  ChevronRight,
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

  // Poll for sources that are processing
  useEffect(() => {
    if (!notebookId || !user || sources.length === 0) return;

    // Check if any sources are processing
    const processingSources = sources.filter(
      s => s.processing_status === 'pending' || s.processing_status === 'processing' || 
           s.indexing_status === 'indexing' || s.indexing_status === 'pending'
    );

    if (processingSources.length === 0) return;

    // Poll every 3 seconds for processing sources (skip loading state to avoid flicker)
    const pollInterval = setInterval(() => {
      loadSources(false, true);
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [notebookId, user, sources]);

  // Notify when sources finish processing
  useEffect(() => {
    if (!notebookId || !user || sources.length === 0) return;

    // Check for sources that just finished processing
    const completedSources = sources.filter(
      s => (s.processing_status === 'completed' || s.processing_status === null) &&
           (s.indexing_status === 'completed' || s.indexing_status === null) &&
           s.processed_content &&
           s.processed_content.trim().length > 0
    );

    if (completedSources.length > 0) {
      // Show notification if we have completed sources (only once per session)
      const hasShownNotification = sessionStorage.getItem(`notified-${notebookId}`);
      if (!hasShownNotification && completedSources.length === sources.length) {
        toast({
          title: 'Sources ready',
          description: `All ${completedSources.length} source(s) have been processed and are ready to use.`,
          duration: 3000,
        });
        sessionStorage.setItem(`notified-${notebookId}`, 'true');
      }
    }
  }, [notebookId, user, sources, toast]);

  const loadSources = async (isRetry = false, skipLoadingState = false) => {
    if (!notebookId || !user) return;

    if (!skipLoadingState) {
      setLoading(true);
    }
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
      if (!skipLoadingState) {
        setLoading(false);
      }
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

  const handleRetryProcessing = async (sourceId: string) => {
    if (!user || !notebookId) return;

    const source = sources.find(s => s.id === sourceId);
    if (!source) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Error',
          description: 'Please sign in to retry processing',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Call process-source API which handles both extraction and indexing
      const response = await fetch('/api/research-lab/process-source', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          sourceId,
          notebookId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.message || errorData.error || 'Failed to retry processing');
      }

      const result = await response.json();
      
      toast({
        title: 'Retry initiated',
        description: result.message || 'Source processing has been restarted',
      });

      // Reload sources to show updated status
      loadSources();
    } catch (error: any) {
      console.error('Error retrying source processing:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to retry processing',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAllIncluded = async (isIncluded: boolean) => {
    if (!user || filteredSources.length === 0) return;

    setLoading(true);
    try {
      const ids = filteredSources.map((s) => s.id);
      const { error, updatedCount } = await bulkToggleSourceInclude(ids, user.id, isIncluded);
      if (error) throw error;

      toast({
        title: 'Sources updated',
        description: `${updatedCount} source(s) ${isIncluded ? 'included' : 'excluded'}`,
      });

      loadSources();
    } catch (error: any) {
      console.error('Error updating sources:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sources',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
  const allSourcesIncluded = filteredSources.length > 0 && filteredSources.every((source) => source.is_included);
  const partiallyIncluded = filteredSources.some((source) => source.is_included) && !allSourcesIncluded;

  return (
    <div className="flex flex-col h-full">
      {/* Header - Enhanced */}
      <div className="p-3 sm:p-4 border-b border-gray-100 bg-white space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Sources</p>
              <p className="text-base font-semibold text-gray-900">
                {sources.length} saved source{sources.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setAddModalOpen(true)}
            className="bg-gray-900 hover:bg-black text-white text-xs px-3 py-2 rounded-full"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add sources
          </Button>
        </div>

        {/* Search Bar */}
        <div className="rounded-2xl border border-gray-200 p-3 space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1 text-[11px]">
              <Globe className="h-3 w-3" />
              Web
            </span>
            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1 text-[11px]">
              <Sparkles className="h-3 w-3" />
              Fast research
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search the web for new sources"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 h-10 text-sm bg-white"
              />
            </div>
            <Button variant="secondary" className="rounded-full h-10 w-10 p-0 bg-gray-900 text-white hover:bg-black">
              <ChevronRight className="h-4 w-4" />
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
          <div className="p-8 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mx-auto mb-5 shadow-lg">
              <FlaskConical className="h-10 w-10 text-orange-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">No Sources Yet</h3>
            <p className="text-sm text-gray-600 mb-1">Saved sources will appear here.</p>
            <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto">
              Click Add source above to add PDFs, websites, text, videos or audio files.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddModalOpen(true)}
              className="border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add source
            </Button>
          </div>
        ) : (
          <div className="p-2 sm:p-3 space-y-2">
            <div className="flex items-center justify-between px-3 py-2 rounded-2xl border border-gray-100 bg-gray-50">
              <p className="text-xs font-medium text-gray-700">Select all sources</p>
              <Checkbox
                checked={allSourcesIncluded ? true : partiallyIncluded ? 'indeterminate' : false}
                onCheckedChange={(checked) => handleToggleAllIncluded(Boolean(checked))}
                aria-label="Toggle all sources"
                className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
            </div>
            {filteredSources.map((source, index) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="group flex items-center gap-2 p-2 sm:p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50/30 active:bg-gray-100 transition-all duration-300 hover:shadow-md touch-manipulation border border-transparent hover:border-orange-200"
              >
                <div className="flex-shrink-0 text-gray-500">
                  {getSourceIcon(source.source_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{source.title}</p>
                  {source.processing_status === 'processing' || source.processing_status === 'pending' ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <p className="text-xs text-orange-600 font-medium">
                        {source.processing_status === 'processing' ? 'Processing...' : 'Pending...'}
                      </p>
                    </div>
                  ) : source.indexing_status === 'indexing' || source.indexing_status === 'pending' ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <p className="text-xs text-blue-600 font-medium">Indexing...</p>
                    </div>
                  ) : source.processing_status === 'failed' || source.indexing_status === 'failed' ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <p className="text-xs text-red-600 font-medium">Failed</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 px-2 text-xs ml-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRetryProcessing(source.id);
                        }}
                        disabled={loading}
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    </div>
                  ) : source.key_insights ? (
                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{source.key_insights}</p>
                  ) : (
                    <p className="text-xs text-gray-500 capitalize">{source.source_type}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Checkbox
                    checked={source.is_included}
                    onCheckedChange={() => handleToggleInclude(source.id, source.is_included)}
                    aria-label="Toggle source"
                    className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
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
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Source Count - Enhanced */}
      <div className="p-3 sm:p-4 border-t border-gray-200 bg-gradient-to-r from-white to-orange-50/20 text-xs sm:text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">
            {sources.length} {sources.length === 1 ? 'source' : 'sources'}
          </span>
          {sources.filter(s => s.is_included).length > 0 && (
            <span className="text-orange-600 font-semibold">
              {sources.filter(s => s.is_included).length} active
            </span>
          )}
        </div>
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

