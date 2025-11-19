// Studio Output View - Full-screen view for generated outputs
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Maximize2,
  Edit,
  Copy,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Share2,
  MoreVertical,
  FileText,
  Search,
  Link2,
  BookOpen,
  Mic,
  Scale,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/research-lab/utils';

interface StudioOutputViewProps {
  output: {
    id: string;
    output_type: string;
    content: any;
    metadata?: any;
    created_at: string;
  };
  sourceCount: number;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

function getOutputIcon(outputType: string) {
  switch (outputType) {
    case 'summarization':
      return FileText;
    case 'theology_qa':
      return Search;
    case 'cross_references':
      return Link2;
    case 'curriculum':
      return BookOpen;
    case 'sermon':
      return Mic;
    case 'doctrinal_harmony':
      return Scale;
    default:
      return FileText;
  }
}

function getOutputTypeLabel(outputType: string): string {
  switch (outputType) {
    case 'summarization':
      return 'Briefing Doc';
    case 'theology_qa':
      return 'Q&A';
    case 'cross_references':
      return 'Cross-Reference';
    case 'curriculum':
      return 'Study Plan';
    case 'sermon':
      return 'Sermon';
    case 'doctrinal_harmony':
      return 'Doctrine Analysis';
    default:
      return 'Output';
  }
}

export function StudioOutputView({
  output,
  sourceCount,
  onClose,
  onDelete,
  onEdit,
}: StudioOutputViewProps) {
  const { toast } = useToast();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);

  const Icon = getOutputIcon(output.output_type);
  const typeLabel = getOutputTypeLabel(output.output_type);

  const handleCopy = async () => {
    try {
      const text = typeof output.content === 'string' 
        ? output.content 
        : JSON.stringify(output.content, null, 2);
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied',
        description: 'Output copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this output?')) {
      onDelete(output.id);
      onClose();
    }
  };

  const handleFeedback = (type: 'good' | 'bad') => {
    setFeedback(type);
    toast({
      title: 'Feedback recorded',
      description: `Thank you for your ${type === 'good' ? 'positive' : 'negative'} feedback`,
    });
  };

  // Extract content text
  let contentText = '';
  if (typeof output.content === 'string') {
    contentText = output.content;
  } else if (output.content) {
    // Try different content fields
    contentText = output.content.text || 
                  output.content.summary || 
                  output.content.content ||
                  output.content.output ||
                  JSON.stringify(output.content, null, 2);
  }

  return (
    <div className={cn(
      'flex flex-col h-full bg-white',
      isFullscreen && 'fixed inset-0 z-50'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-orange-500" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-gray-900">
                  {output.content?.title || typeLabel}
                </h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit?.(output.id)}
                  className="h-6 w-6 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleCopy}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(output.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Based on {sourceCount} source{sourceCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 p-0"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-900 leading-relaxed text-sm">
              {contentText || 'No content available'}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer with Feedback */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <Button
              variant={feedback === 'good' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFeedback('good')}
              className={cn(
                'h-8',
                feedback === 'good' && 'bg-green-500 hover:bg-green-600 text-white'
              )}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              Good report
            </Button>
            <Button
              variant={feedback === 'bad' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFeedback('bad')}
              className={cn(
                'h-8',
                feedback === 'bad' && 'bg-red-500 hover:bg-red-600 text-white'
              )}
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              Bad report
            </Button>
          </div>
          <div className="text-xs text-gray-500">
            {formatRelativeTime(output.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
}

