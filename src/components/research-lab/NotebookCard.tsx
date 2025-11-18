// Notebook Card Component - Displays notebook in grid
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, FileText, Calendar, BookOpen, FlaskConical } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Notebook {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  source_count: number;
  created_at: string;
  updated_at: string;
}

interface NotebookCardProps {
  notebook: Notebook;
  onSelect: () => void;
  onDelete: () => void;
}

export function NotebookCard({ notebook, onSelect, onDelete }: NotebookCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) return;
    
    if (!confirm(`Are you sure you want to delete "${notebook.title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('research_notebooks')
        .delete()
        .eq('id', notebook.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Notebook deleted',
        description: `"${notebook.title}" has been deleted`,
      });

      onDelete();
    } catch (error: any) {
      console.error('Error deleting notebook:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notebook',
        variant: 'destructive',
      });
    }
  };

  const handleRename = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement rename functionality
    toast({
      title: 'Coming soon',
      description: 'Rename functionality will be available soon',
    });
  };

  // Generate a simple color based on notebook ID for visual variety
  const colors = [
    'bg-blue-50 border-blue-200',
    'bg-purple-50 border-purple-200',
    'bg-green-50 border-green-200',
    'bg-orange-50 border-orange-200',
    'bg-pink-50 border-pink-200',
  ];
  const colorIndex = parseInt(notebook.id.slice(0, 8), 16) % colors.length;
  const cardColor = colors[colorIndex];

  // Icon based on title - using Lucide icons
  const getNotebookIcon = () => {
    const title = notebook.title.toLowerCase();
    if (title.includes('bible') || title.includes('scripture')) {
      return <BookOpen className="h-8 w-8 text-blue-600" />;
    } else if (title.includes('study') || title.includes('research')) {
      return <FlaskConical className="h-8 w-8 text-orange-600" />;
    } else if (title.includes('sermon') || title.includes('preach')) {
      return <FileText className="h-8 w-8 text-purple-600" />;
    }
    return <FileText className="h-8 w-8 text-gray-600" />;
  };

  return (
    <Card
      className={`cursor-pointer hover:shadow-lg transition-all ${cardColor} border-2`}
      onClick={onSelect}
    >
      <CardContent className="p-6 relative">
        {/* Menu Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleRename}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Thumbnail/Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center shadow-sm">
            {notebook.thumbnail_url ? (
              <img
                src={notebook.thumbnail_url}
                alt={notebook.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              getNotebookIcon()
            )}
          </div>
        </div>

        {/* Notebook Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 truncate">{notebook.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(notebook.updated_at), 'd MMM yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{notebook.source_count} {notebook.source_count === 1 ? 'source' : 'sources'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

