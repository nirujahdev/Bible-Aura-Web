import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, Heading3, 
  Type, Clock, Underline, Strikethrough, Code, Link, Image, Table,
  AlignLeft, AlignCenter, AlignRight, Indent, Outdent, Download,
  FileDown, Copy, Undo, Redo, Search, Replace, Palette, Zap,
  BookOpen, Target, Users, Globe, Mic, Volume2, Eye, Settings
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SermonToolbarProps {
  editorRef: React.RefObject<HTMLTextAreaElement>;
  onFormatText: (format: string, value?: string) => void;
  wordCount: number;
  estimatedTime: number;
  sermonContent: string;
  sermonTitle: string;
  onExport?: (format: string) => void;
  onInsertQuickText?: (text: string) => void;
}

export default function SermonToolbar({ 
  editorRef, 
  onFormatText,
  wordCount,
  estimatedTime,
  sermonContent,
  sermonTitle,
  onExport,
  onInsertQuickText
}: SermonToolbarProps) {
  const { toast } = useToast();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const formatText = (format: string, value?: string) => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'strikethrough':
        formattedText = `~~${selectedText}~~`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'heading1':
        formattedText = `# ${selectedText}`;
        break;
      case 'heading2':
        formattedText = `## ${selectedText}`;
        break;
      case 'heading3':
        formattedText = `### ${selectedText}`;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
      case 'list':
        formattedText = `- ${selectedText}`;
        break;
      case 'orderedList':
        formattedText = `1. ${selectedText}`;
        break;
      case 'link': {
        const url = value || prompt('Enter URL:');
        formattedText = `[${selectedText}](${url})`;
        break;
      }
      case 'table':
        formattedText = `\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| ${selectedText} |          |          |\n|          |          |          |\n`;
        break;
      default:
        return;
    }
    
    onFormatText(format, formattedText);
  };

  const insertQuickText = (text: string) => {
    if (onInsertQuickText) {
      onInsertQuickText(text);
    }
    toast({
      title: "Text inserted",
      description: "Quick text added to your sermon",
    });
  };

  const exportSermon = (format: string) => {
    if (onExport) {
      onExport(format);
    } else {
      // Fallback export functionality
      const content = `# ${sermonTitle}\n\n${sermonContent}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sermonTitle || 'sermon'}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    toast({
      title: "Sermon exported",
      description: `Your sermon has been exported as ${format.toUpperCase()}`,
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`# ${sermonTitle}\n\n${sermonContent}`);
      toast({
        title: "Copied to clipboard",
        description: "Your sermon content has been copied",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const quickTexts = [
    "Let us pray...",
    "In the name of Jesus Christ, Amen.",
    "Scripture tells us that...",
    "The Lord is calling us to...",
    "May God bless you and keep you...",
    "Please turn in your Bibles to...",
    "Let's begin with a word of prayer.",
    "In conclusion, remember that..."
  ];

  const getReadingLevel = () => {
    const sentences = sermonContent.split(/[.!?]+/).length;
    const words = wordCount;
    const avgWordsPerSentence = words / sentences;
    
    if (avgWordsPerSentence < 10) return { level: "Easy", color: "bg-green-100 text-green-800" };
    if (avgWordsPerSentence < 15) return { level: "Medium", color: "bg-yellow-100 text-yellow-800" };
    return { level: "Advanced", color: "bg-red-100 text-red-800" };
  };

  const readingLevel = getReadingLevel();

  return (
    <TooltipProvider>
      <div className="border-b bg-white">
        {/* Main Toolbar */}
        <div className="p-2">
          <div className="flex items-center gap-1 justify-between flex-wrap">
            <div className="flex items-center gap-1 flex-wrap">
              {/* Text Formatting */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => formatText('bold')}>
                      <Bold className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bold (Ctrl+B)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => formatText('italic')}>
                      <Italic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Italic (Ctrl+I)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => formatText('underline')}>
                      <Underline className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Underline</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => formatText('strikethrough')}>
                      <Strikethrough className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Strikethrough</TooltipContent>
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Headings */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => formatText('heading1')}>
                      <Heading1 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Heading 1</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => formatText('heading2')}>
                      <Heading2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Heading 2</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => formatText('heading3')}>
                      <Heading3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Heading 3</TooltipContent>
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Lists and Content */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => formatText('list')}>
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bullet List</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => formatText('orderedList')}>
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Numbered List</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => formatText('quote')}>
                      <Quote className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Quote</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => formatText('link')}>
                      <Link className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Insert Link</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => formatText('table')}>
                      <Table className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Insert Table</TooltipContent>
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Quick Actions */}
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Zap className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Quick Text</TooltipContent>
                    </Tooltip>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    {quickTexts.map((text, index) => (
                      <DropdownMenuItem key={index} onClick={() => insertQuickText(text)}>
                        {text}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy to Clipboard</TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Export Sermon</TooltipContent>
                    </Tooltip>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => exportSermon('txt')}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Export as TXT
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportSermon('md')}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Export as Markdown
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportSermon('html')}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Export as HTML
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportSermon('pdf')}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Statistics */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <Type className="h-4 w-4" />
                <span>{wordCount} words</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{estimatedTime} min</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Target className="h-4 w-4" />
                <Badge variant="outline" className={readingLevel.color}>
                  {readingLevel.level}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Tools (Optional) */}
        {showAdvanced && (
          <div className="px-2 pb-2 border-t bg-gray-50">
            <div className="flex items-center gap-1 pt-2">
              <Button variant="ghost" size="sm" onClick={() => insertQuickText("\n## Prayer Focus\n[Insert prayer points here]\n")}>
                <Users className="h-4 w-4 mr-1" />
                Prayer Section
              </Button>
              <Button variant="ghost" size="sm" onClick={() => insertQuickText("\n## Application\n1. Personal reflection\n2. Practical steps\n3. Weekly challenge\n")}>
                <Target className="h-4 w-4 mr-1" />
                Application Points
              </Button>
              <Button variant="ghost" size="sm" onClick={() => insertQuickText("\n## Illustration\n[Insert story or example here]\n")}>
                <BookOpen className="h-4 w-4 mr-1" />
                Add Illustration
              </Button>
              <Button variant="ghost" size="sm" onClick={() => insertQuickText("\n## Call to Action\n[Insert specific action steps]\n")}>
                <Mic className="h-4 w-4 mr-1" />
                Call to Action
              </Button>
            </div>
          </div>
        )}

        {/* Toggle Advanced Tools */}
        <div className="px-2 pb-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            <Settings className="h-3 w-3 mr-1" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Tools
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
} 