import React, { useEffect, useState } from 'react';
import { Copy, FileText, MoreVertical, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { TextDiffView } from '@/components/TextDiffView';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface TextSelectionMenuProps {
  editorRef: React.RefObject<HTMLDivElement>;
  onInsertText?: (text: string) => void;
  onReplaceText?: (originalText: string, newText: string) => void;
}

export function TextSelectionMenu({ editorRef, onInsertText, onReplaceText }: TextSelectionMenuProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [showDiffView, setShowDiffView] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      
      if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
        setPosition(null);
        setSelectedText('');
        return;
      }

      // Check if selection is within our editor
      if (editorRef.current && !editorRef.current.contains(selection.anchorNode)) {
        setPosition(null);
        setSelectedText('');
        return;
      }

      const range = selection.getRangeAt(0);
      const selectedTextContent = selection.toString().trim();
      
      if (selectedTextContent.length === 0) {
        setPosition(null);
        setSelectedText('');
        return;
      }

      setSelectedText(selectedTextContent);

      // Get position of selection
      const rect = range.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    };

    const handleMouseUp = () => {
      setTimeout(handleSelection, 10);
    };

    const handleClick = (e: MouseEvent) => {
      // Hide menu if clicking outside
      if (position && editorRef.current && !editorRef.current.contains(e.target as Node)) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
        }
        setPosition(null);
        setSelectedText('');
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectionchange', handleSelection);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectionchange', handleSelection);
      document.removeEventListener('click', handleClick);
    };
  }, [editorRef, position]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedText);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      });
      setPosition(null);
      window.getSelection()?.removeAllRanges();
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy text",
        variant: "destructive",
      });
    }
  };

  const handleAddToSermon = () => {
    if (onInsertText && selectedText) {
      onInsertText(selectedText);
      toast({
        title: "Added to sermon",
        description: "Text inserted at cursor position",
      });
      setPosition(null);
      // Clear selection
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleAITool = async (toolId: string) => {
    if (!selectedText) return;
    
    setIsGenerating(true);
    setSelectedTool(toolId);
    setPosition(null); // Hide menu while generating

    try {
      // Dynamically import and execute agent
      const { getAllAgents, executeAgent } = await import('@/lib/sermon-agents');
      const agents = getAllAgents();
      const agent = agents.find(a => a.id === toolId);
      
      if (!agent) {
        throw new Error('Tool not found');
      }

      // Execute agent with selected text as context
      const result = await executeAgent(toolId, {
        selectedText: selectedText,
        task: 'enhance'
      });

      if (result && typeof result === 'string') {
        setGeneratedText(result);
        setShowDiffView(true);
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (error: any) {
      console.error('AI tool error:', error);
      toast({
        title: "Generation failed",
        description: error?.message || "Failed to generate content",
        variant: "destructive"
      });
      setPosition(null);
    } finally {
      setIsGenerating(false);
      setSelectedTool(null);
    }
  };

  const handleAccept = () => {
    if (onReplaceText && selectedText && generatedText) {
      onReplaceText(selectedText, generatedText);
      toast({
        title: "Content updated",
        description: "AI-generated content has been applied",
      });
    }
    setShowDiffView(false);
    setGeneratedText('');
    setSelectedText('');
    window.getSelection()?.removeAllRanges();
  };

  const handleDecline = () => {
    setShowDiffView(false);
    setGeneratedText('');
    toast({
      title: "Changes declined",
      description: "Original text kept",
    });
  };

  if (!position || !selectedText) return null;

  return (
    <div
      className="fixed z-[100] bg-white border border-gray-200 rounded-lg shadow-lg p-1 flex items-center gap-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 40}px`,
        transform: 'translateX(-50%)',
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-8 px-2 hover:bg-gray-100"
        title="Copy"
      >
        <Copy className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleAddToSermon}
        className="h-8 px-2 hover:bg-gray-100"
        title="Add to sermon"
      >
        <FileText className="h-4 w-4 mr-1" />
        <span className="text-xs">Add</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-gray-100">
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAddToSermon}>
            <FileText className="h-4 w-4 mr-2" />
            Add to Sermon
          </DropdownMenuItem>
          <div className="border-t my-1" />
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">AI Tools</div>
          <DropdownMenuItem onClick={() => handleAITool('improve')}>
            <Sparkles className="h-4 w-4 mr-2" />
            Improve
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAITool('enhance')}>
            <Sparkles className="h-4 w-4 mr-2" />
            Enhance
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAITool('findScripture')}>
            <Sparkles className="h-4 w-4 mr-2" />
            Find Scripture
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Diff View Dialog */}
      <Dialog open={showDiffView} onOpenChange={setShowDiffView}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <TextDiffView
            originalText={selectedText}
            generatedText={generatedText}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

