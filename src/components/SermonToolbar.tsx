import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, Heading3, 
  Type, Clock, Underline, Strikethrough, Code, Link, Image, Table,
  AlignLeft, AlignCenter, AlignRight, Indent, Outdent, Download,
  FileDown, Copy, Undo, Redo, Search, Replace, Palette, Zap,
  BookOpen, Target, Users, Globe, Mic, Volume2, Eye, Settings,
  Sparkles, TrendingUp, Wand2, Brain, Lightbulb, Heart, Highlighter,
  Minus, Plus, X
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSermonAI } from "@/contexts/SermonAIContext";

interface SermonToolbarProps {
  editorRef: React.RefObject<HTMLTextAreaElement | HTMLDivElement | null>;
  onFormatText?: (format: string, value?: string) => void;
  wordCount: number;
  estimatedTime: number;
  sermonContent: string;
  sermonTitle: string;
  onExport?: (format: string) => void;
  onInsertQuickText?: (text: string) => void;
  isRichText?: boolean;
}

export default function SermonToolbar({ 
  editorRef, 
  onFormatText,
  wordCount,
  estimatedTime,
  sermonContent,
  sermonTitle,
  onExport,
  onInsertQuickText,
  isRichText = false
}: SermonToolbarProps) {
  const { toast } = useToast();
  const { state } = useSermonAI();
  const isMobile = useIsMobile();
  
  // Get analysis score for indicator
  const getAnalysisScore = () => {
    if (!state.analysisResults) return null;
    const avgScore = (
      state.analysisResults.clarity +
      state.analysisResults.readability +
      state.analysisResults.theologicalAccuracy +
      state.analysisResults.structure
    ) / 4;
    return Math.round(avgScore);
  };

  const analysisScore = getAnalysisScore();
  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatText = (format: string, value?: string) => {
    if (!editorRef.current) return;

    // If rich text editor (contentEditable div)
    if (isRichText && editorRef.current instanceof HTMLDivElement) {
      // Ensure editor is focused
      editorRef.current.focus();
      
      // Small delay to ensure focus is set
      setTimeout(() => {
        if (!editorRef.current) return;
        
        switch (format) {
          case 'bold':
            document.execCommand('bold', false);
            break;
          case 'italic':
            document.execCommand('italic', false);
            break;
          case 'underline':
            document.execCommand('underline', false);
            break;
          case 'strikethrough':
            document.execCommand('strikethrough', false);
            break;
          case 'heading1':
            document.execCommand('formatBlock', false, '<h1>');
            break;
          case 'heading2':
            document.execCommand('formatBlock', false, '<h2>');
            break;
          case 'heading3':
            document.execCommand('formatBlock', false, '<h3>');
            break;
          case 'alignLeft':
            document.execCommand('justifyLeft', false);
            break;
          case 'alignCenter':
            document.execCommand('justifyCenter', false);
            break;
          case 'alignRight':
            document.execCommand('justifyRight', false);
            break;
          case 'alignJustify':
            document.execCommand('justifyFull', false);
            break;
          case 'list':
            document.execCommand('insertUnorderedList', false);
            break;
          case 'orderedList':
            document.execCommand('insertOrderedList', false);
            break;
          case 'quote':
            document.execCommand('formatBlock', false, '<blockquote>');
            break;
          case 'foreColor':
            if (value) {
              document.execCommand('foreColor', false, value);
            }
            break;
          case 'backColor':
            if (value) {
              document.execCommand('backColor', false, value);
            }
            break;
          case 'fontName':
            if (value) {
              document.execCommand('fontName', false, value);
            }
            break;
          case 'fontSize':
            if (value) {
              // Use CSS font-size directly for better control
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const span = document.createElement('span');
                span.style.fontSize = `${value}px`;
                try {
                  range.surroundContents(span);
                } catch (e) {
                  // If surroundContents fails, use insertNode
                  const contents = range.extractContents();
                  span.appendChild(contents);
                  range.insertNode(span);
                }
                selection.removeAllRanges();
                selection.addRange(range);
              }
            }
            break;
          case 'link': {
            const url = value || prompt('Enter URL:');
            if (url) {
              document.execCommand('createLink', false, url);
            }
            break;
          }
          case 'removeFormat':
            document.execCommand('removeFormat', false);
            break;
          default:
            return;
        }
        
        // Trigger input event to update content after all commands
        if (editorRef.current) {
          const event = new Event('input', { bubbles: true });
          editorRef.current.dispatchEvent(event);
        }
      }, 10);
      return;
    }

    // Legacy textarea support (markdown)
    if (editorRef.current instanceof HTMLTextAreaElement) {
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
      
      if (onFormatText) {
        onFormatText(format, formattedText);
      }
    }
  };

  const handleColorChange = (type: 'foreColor' | 'backColor', color: string) => {
    formatText(type, color);
  };

  const handleFontChange = (fontName: string) => {
    formatText('fontName', fontName);
  };

  const handleSizeChange = (size: string) => {
    formatText('fontSize', size);
  };

  const insertQuickText = (text: string) => {
    if (isRichText && editorRef.current instanceof HTMLDivElement) {
      editorRef.current.focus();
      const selection = window.getSelection();
      
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        // Convert text to HTML if needed
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text.replace(/\n/g, '<br>');
        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
        range.insertNode(fragment);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Trigger input event to update content
        const event = new Event('input', { bubbles: true });
        editorRef.current.dispatchEvent(event);
      } else {
        // Fallback: append to end
        if (onInsertQuickText) {
          onInsertQuickText(text);
        }
      }
    } else if (onInsertQuickText) {
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
      if (isRichText && editorRef.current instanceof HTMLDivElement) {
        // Copy HTML content
        const htmlContent = editorRef.current.innerHTML;
        const textContent = editorRef.current.innerText || editorRef.current.textContent || '';
        
        // Try to copy as HTML first, fallback to text
        const clipboardItem = new ClipboardItem({
          'text/html': new Blob([htmlContent], { type: 'text/html' }),
          'text/plain': new Blob([textContent], { type: 'text/plain' })
        });
        
        try {
          await navigator.clipboard.write([clipboardItem]);
        } catch {
          // Fallback to plain text
          await navigator.clipboard.writeText(textContent);
        }
      } else {
        await navigator.clipboard.writeText(`# ${sermonTitle}\n\n${sermonContent}`);
      }
      
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
      <div className="border-b bg-white flex-shrink-0 z-20">
        {/* Main Toolbar - Compact */}
        <div className="p-1 sm:p-1.5">
          <div className="flex items-center gap-1 justify-between flex-wrap">
            <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap overflow-x-auto -mx-1 px-1" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {/* Text Formatting */}
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size={isMobile ? "sm" : "sm"} onClick={() => formatText('bold')} className={isMobile ? "h-8 w-8 p-0" : ""}>
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
                  <TooltipContent>Underline (Ctrl+U)</TooltipContent>
                </Tooltip>

                {!isMobile && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => formatText('strikethrough')}>
                        <Strikethrough className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Strikethrough</TooltipContent>
                  </Tooltip>
                )}

                {/* Text Color */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Palette className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Text Color</TooltipContent>
                    </Tooltip>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <div className="p-2">
                      <p className="text-xs font-medium mb-2">Text Color</p>
                      <div className="grid grid-cols-6 gap-1">
                        {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#808080'].map((color) => (
                          <button
                            key={color}
                            onClick={() => handleColorChange('foreColor', color)}
                            className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Highlight Color */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Highlighter className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Highlight</TooltipContent>
                    </Tooltip>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <div className="p-2">
                      <p className="text-xs font-medium mb-2">Highlight Color</p>
                      <div className="grid grid-cols-6 gap-1">
                        {['#FFFF00', '#FFE066', '#FFCC99', '#99CCFF', '#99FF99', '#FF99CC', '#CC99FF', '#FFE5B4', '#E6E6FA', '#F0E68C', '#FFB6C1', '#DDA0DD'].map((color) => (
                          <button
                            key={color}
                            onClick={() => handleColorChange('backColor', color)}
                            className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Alignment */}
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => formatText('alignLeft')}>
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Align Left</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => formatText('alignCenter')}>
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Align Center</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => formatText('alignRight')}>
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Align Right</TooltipContent>
                </Tooltip>

                {!isMobile && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => formatText('alignJustify')}>
                        <AlignRight className="h-4 w-4 rotate-180" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Justify</TooltipContent>
                  </Tooltip>
                )}
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Font Family */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Type className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Font</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Font Family</TooltipContent>
                  </Tooltip>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {['Arial', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Helvetica', 'Comic Sans MS', 'Trebuchet MS', 'Impact'].map((font) => (
                    <DropdownMenuItem key={font} onClick={() => handleFontChange(font)}>
                      <span style={{ fontFamily: font }}>{font}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Font Size */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-xs">
                        <span className="hidden sm:inline">Size</span>
                        <span className="sm:hidden">S</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Font Size</TooltipContent>
                  </Tooltip>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-32">
                  {['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '72'].map((size) => (
                    <DropdownMenuItem key={size} onClick={() => handleSizeChange(size)}>
                      <span className="text-sm">{size}px</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

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

                {!isMobile && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => formatText('table')}>
                        <Table className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Insert Table</TooltipContent>
                  </Tooltip>
                )}
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Utility Actions - Simplified */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy to Clipboard</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => formatText('removeFormat')}>
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clear Formatting</TooltipContent>
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Statistics */}
            <div className={`flex items-center gap-1.5 sm:gap-2 md:gap-3 text-xs sm:text-sm flex-shrink-0 ${isMobile ? 'ml-auto pl-2' : ''}`}>
              <div className="flex items-center gap-1 text-gray-600 whitespace-nowrap">
                <Type className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{wordCount} words</span>
                <span className="sm:hidden">{wordCount}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 whitespace-nowrap">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{estimatedTime} min</span>
                <span className="sm:hidden">{estimatedTime}m</span>
              </div>
              {!isMobile && (
                <>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Target className="h-4 w-4" />
                    <Badge variant="outline" className={readingLevel.color}>
                      {readingLevel.level}
                    </Badge>
                  </div>
                  {analysisScore !== null && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 cursor-help">
                          <TrendingUp className={`h-4 w-4 ${getScoreColor(analysisScore)}`} />
                          <Badge variant="outline" className={`${getScoreColor(analysisScore)} border-current`}>
                            {analysisScore}%
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs space-y-1">
                          <p>AI Analysis Score</p>
                          <p>Clarity: {state.analysisResults?.clarity}%</p>
                          <p>Readability: {state.analysisResults?.readability}%</p>
                          <p>Theology: {state.analysisResults?.theologicalAccuracy}%</p>
                          <p>Structure: {state.analysisResults?.structure}%</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Tools section removed */}
      </div>
    </TooltipProvider>
  );
} 