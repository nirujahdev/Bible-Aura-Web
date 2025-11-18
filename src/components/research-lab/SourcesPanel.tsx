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

  useEffect(() => {
    if (notebookId && user) {
      loadSources();
    }
  }, [notebookId, user]);

  const loadSources = async () => {
    if (!notebookId || !user) return;

    setLoading(true);
    try {
      const { data, error } = await getNotebookSources(notebookId, user.id);
      if (error) throw error;
      setSources(data || []);
    } catch (error: any) {
      console.error('Error loading sources:', error);
      
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
        toast({
          title: 'Error',
          description: error?.error?.message || error?.message || 'Failed to load sources',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
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
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Sources</h2>
          <Button
            size="sm"
            onClick={() => setAddModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add source
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search the web for new sources"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Globe className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2">
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
                className="group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:shadow-sm"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex-shrink-0 text-gray-500">
                  {getSourceIcon(source.source_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{source.title}</p>
                  <p className="text-xs text-gray-500 capitalize">{source.source_type}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Switch
                    checked={source.is_included}
                    onCheckedChange={() => handleToggleInclude(source.id, source.is_included)}
                    className="scale-75 transition-all"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
      <div className="p-4 border-t border-gray-200 bg-white text-sm text-gray-600">
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

