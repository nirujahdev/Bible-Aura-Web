import React, { useEffect, useState } from 'react';
import { Copy, FileText, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface TextSelectionMenuProps {
  editorRef: React.RefObject<HTMLDivElement>;
  onInsertText?: (text: string) => void;
}

export function TextSelectionMenu({ editorRef, onInsertText }: TextSelectionMenuProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
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
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAddToSermon}>
            <FileText className="h-4 w-4 mr-2" />
            Add to Sermon
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

