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
    if (!editorRef.current) {
      toast({
        title: "Editor not ready",
        description: "Please click in the editor first",
        variant: "destructive"
      });
      return;
    }

    // If rich text editor (contentEditable div)
    if (isRichText && editorRef.current instanceof HTMLDivElement) {
      const editor = editorRef.current;
      
      // Save current selection
      const selection = window.getSelection();
      let savedRange: Range | null = null;
      
      if (selection && selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange();
      }
      
      // Focus editor first
      editor.focus();
      
      // Restore selection if we had one
      if (savedRange && selection) {
        try {
          selection.removeAllRanges();
          selection.addRange(savedRange);
        } catch (e) {
          // Selection might be invalid, continue anyway
        }
      }
      
      // Execute command immediately
      let commandExecuted = false;
      
      switch (format) {
        case 'bold':
          commandExecuted = document.execCommand('bold', false);
          break;
        case 'italic':
          commandExecuted = document.execCommand('italic', false);
          break;
        case 'underline':
          commandExecuted = document.execCommand('underline', false);
          break;
        case 'strikethrough':
          commandExecuted = document.execCommand('strikethrough', false);
          break;
        case 'heading1':
          commandExecuted = document.execCommand('formatBlock', false, '<h1>');
          break;
        case 'heading2':
          commandExecuted = document.execCommand('formatBlock', false, '<h2>');
          break;
        case 'heading3':
          commandExecuted = document.execCommand('formatBlock', false, '<h3>');
          break;
        case 'alignLeft':
          commandExecuted = document.execCommand('justifyLeft', false);
          break;
        case 'alignCenter':
          commandExecuted = document.execCommand('justifyCenter', false);
          break;
        case 'alignRight':
          commandExecuted = document.execCommand('justifyRight', false);
          break;
        case 'alignJustify':
          commandExecuted = document.execCommand('justifyFull', false);
          break;
        case 'list':
          commandExecuted = document.execCommand('insertUnorderedList', false);
          break;
        case 'orderedList':
          commandExecuted = document.execCommand('insertOrderedList', false);
          break;
        case 'quote':
          commandExecuted = document.execCommand('formatBlock', false, '<blockquote>');
          break;
        case 'foreColor':
          if (value) {
            commandExecuted = document.execCommand('foreColor', false, value);
          }
          break;
        case 'backColor':
          if (value) {
            commandExecuted = document.execCommand('backColor', false, value);
          }
          break;
        case 'fontName':
          if (value) {
            commandExecuted = document.execCommand('fontName', false, value);
          }
          break;
        case 'fontSize':
          if (value && selection && selection.rangeCount > 0) {
            try {
              const range = selection.getRangeAt(0);
              if (!range.collapsed) {
                const span = document.createElement('span');
                span.style.fontSize = `${value}px`;
                try {
                  range.surroundContents(span);
                  commandExecuted = true;
                } catch (e) {
                  const contents = range.extractContents();
                  span.appendChild(contents);
                  range.insertNode(span);
                  commandExecuted = true;
                }
              } else {
                // No selection, apply to current block
                const block = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
                  ? range.commonAncestorContainer.parentElement
                  : range.commonAncestorContainer as HTMLElement;
                if (block) {
                  (block as HTMLElement).style.fontSize = `${value}px`;
                  commandExecuted = true;
                }
              }
            } catch (e) {
              console.error('Font size error:', e);
            }
          }
          break;
        case 'link': {
          const url = value || prompt('Enter URL:');
          if (url) {
            commandExecuted = document.execCommand('createLink', false, url);
          }
          break;
        }
        case 'removeFormat':
          commandExecuted = document.execCommand('removeFormat', false);
          break;
        default:
          return;
      }
      
      // Trigger input event to update content
      if (commandExecuted && editor) {
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
          const event = new Event('input', { bubbles: true, cancelable: true });
          editor.dispatchEvent(event);
        });
      }
      
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
      <div className="border-b bg-white flex-shrink-0 z-20 shadow-sm">
        {/* Main Toolbar - Compact */}
        <div className="p-1.5 sm:p-2">
          <div className="flex items-center gap-1.5 sm:gap-2 justify-between flex-wrap">
            <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap overflow-x-auto -mx-1 px-1 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
              {/* Text Formatting */}
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => formatText('bold')} 
                      className={isMobile ? "h-9 w-9 p-0 touch-manipulation" : "h-8 w-8 p-0"}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bold (Ctrl+B)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => formatText('italic')}
                      className={isMobile ? "h-9 w-9 p-0 touch-manipulation" : "h-8 w-8 p-0"}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Italic (Ctrl+I)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => formatText('underline')}
                      className={isMobile ? "h-9 w-9 p-0 touch-manipulation" : "h-8 w-8 p-0"}
                    >
                      <Underline className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Underline (Ctrl+U)</TooltipContent>
                </Tooltip>

                {!isMobile && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => formatText('strikethrough')}
                        className="h-8 w-8 p-0"
                      >
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={isMobile ? "h-9 w-9 p-0 touch-manipulation" : "h-8 w-8 p-0"}
                        >
                          <Palette className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Text Color</TooltipContent>
                    </Tooltip>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 p-3">
                    <div>
                      <p className="text-xs font-semibold mb-3 text-gray-700">Text Color</p>
                      <div className="grid grid-cols-8 gap-2">
                        {[
                          { color: '#000000', name: 'Black' },
                          { color: '#FF0000', name: 'Red' },
                          { color: '#0000FF', name: 'Blue' },
                          { color: '#008000', name: 'Green' },
                          { color: '#FFA500', name: 'Orange' },
                          { color: '#800080', name: 'Purple' },
                          { color: '#FFC0CB', name: 'Pink' },
                          { color: '#808080', name: 'Gray' },
                          { color: '#FFFF00', name: 'Yellow' },
                          { color: '#00FFFF', name: 'Cyan' },
                          { color: '#FF00FF', name: 'Magenta' },
                          { color: '#A52A2A', name: 'Brown' },
                          { color: '#FFD700', name: 'Gold' },
                          { color: '#4B0082', name: 'Indigo' },
                          { color: '#FF6347', name: 'Tomato' },
                          { color: '#32CD32', name: 'Lime' }
                        ].map((item) => (
                          <Tooltip key={item.color}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => {
                                  handleColorChange('foreColor', item.color);
                                  toast({
                                    title: "Text color applied",
                                    description: `Applied ${item.name} color`,
                                  });
                                }}
                                className="w-8 h-8 rounded-md border-2 border-gray-300 hover:border-orange-500 hover:scale-110 transition-all shadow-sm touch-manipulation"
                                style={{ backgroundColor: item.color }}
                                title={item.name}
                                aria-label={`Apply ${item.name} text color`}
                              />
                            </TooltipTrigger>
                            <TooltipContent>{item.name}</TooltipContent>
                          </Tooltip>
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={isMobile ? "h-9 w-9 p-0 touch-manipulation" : "h-8 w-8 p-0"}
                        >
                          <Highlighter className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Highlight</TooltipContent>
                    </Tooltip>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 p-3">
                    <div>
                      <p className="text-xs font-semibold mb-3 text-gray-700">Highlight Color</p>
                      <div className="grid grid-cols-8 gap-2">
                        {[
                          { color: '#FFFF00', name: 'Yellow' },
                          { color: '#FFE066', name: 'Light Yellow' },
                          { color: '#FFCC99', name: 'Peach' },
                          { color: '#99CCFF', name: 'Light Blue' },
                          { color: '#99FF99', name: 'Light Green' },
                          { color: '#FF99CC', name: 'Pink' },
                          { color: '#CC99FF', name: 'Lavender' },
                          { color: '#FFE5B4', name: 'Cream' },
                          { color: '#E6E6FA', name: 'Lavender Blue' },
                          { color: '#F0E68C', name: 'Khaki' },
                          { color: '#FFB6C1', name: 'Light Pink' },
                          { color: '#DDA0DD', name: 'Plum' },
                          { color: '#B0E0E6', name: 'Powder Blue' },
                          { color: '#F5DEB3', name: 'Wheat' },
                          { color: '#98FB98', name: 'Pale Green' },
                          { color: '#FFDAB9', name: 'Peach Puff' }
                        ].map((item) => (
                          <Tooltip key={item.color}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => {
                                  handleColorChange('backColor', item.color);
                                  toast({
                                    title: "Highlight applied",
                                    description: `Applied ${item.name} highlight`,
                                  });
                                }}
                                className="w-8 h-8 rounded-md border-2 border-gray-300 hover:border-orange-500 hover:scale-110 transition-all shadow-sm touch-manipulation"
                                style={{ backgroundColor: item.color }}
                                title={item.name}
                                aria-label={`Apply ${item.name} highlight`}
                              />
                            </TooltipTrigger>
                            <TooltipContent>{item.name}</TooltipContent>
                          </Tooltip>
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => formatText('alignLeft')}
                      className={isMobile ? "h-9 w-9 p-0 touch-manipulation" : "h-8 w-8 p-0"}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Align Left</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => formatText('alignCenter')}
                      className={isMobile ? "h-9 w-9 p-0 touch-manipulation" : "h-8 w-8 p-0"}
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Align Center</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => formatText('alignRight')}
                      className={isMobile ? "h-9 w-9 p-0 touch-manipulation" : "h-8 w-8 p-0"}
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Align Right</TooltipContent>
                </Tooltip>

                {!isMobile && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => formatText('alignJustify')}
                        className="h-8 w-8 p-0"
                      >
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={isMobile ? "h-9 px-2 text-xs touch-manipulation" : "h-8 px-2 text-xs"}
                      >
                        <Type className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Font</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Font Family</TooltipContent>
                  </Tooltip>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52 max-h-[300px] overflow-y-auto">
                  {[
                    { name: 'Arial', category: 'Sans-serif' },
                    { name: 'Times New Roman', category: 'Serif' },
                    { name: 'Georgia', category: 'Serif' },
                    { name: 'Verdana', category: 'Sans-serif' },
                    { name: 'Courier New', category: 'Monospace' },
                    { name: 'Helvetica', category: 'Sans-serif' },
                    { name: 'Comic Sans MS', category: 'Casual' },
                    { name: 'Trebuchet MS', category: 'Sans-serif' },
                    { name: 'Impact', category: 'Sans-serif' },
                    { name: 'Calibri', category: 'Sans-serif' },
                    { name: 'Garamond', category: 'Serif' },
                    { name: 'Tahoma', category: 'Sans-serif' }
                  ].map((font) => (
                    <DropdownMenuItem 
                      key={font.name} 
                      onClick={() => {
                        handleFontChange(font.name);
                        toast({
                          title: "Font changed",
                          description: `Applied ${font.name} font`,
                        });
                      }}
                      className="cursor-pointer"
                    >
                      <span style={{ fontFamily: font.name }} className="text-sm">{font.name}</span>
                      <span className="text-xs text-gray-500 ml-2">{font.category}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Font Size */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={isMobile ? "h-9 px-2 text-xs touch-manipulation" : "h-8 px-2 text-xs"}
                      >
                        <span className="hidden sm:inline">Size</span>
                        <span className="sm:hidden">S</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Font Size</TooltipContent>
                  </Tooltip>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-36 max-h-[300px] overflow-y-auto">
                  {[
                    { size: '8', label: '8px - Tiny' },
                    { size: '9', label: '9px - Very Small' },
                    { size: '10', label: '10px - Small' },
                    { size: '11', label: '11px' },
                    { size: '12', label: '12px - Default' },
                    { size: '14', label: '14px' },
                    { size: '16', label: '16px - Medium' },
                    { size: '18', label: '18px' },
                    { size: '20', label: '20px' },
                    { size: '24', label: '24px - Large' },
                    { size: '28', label: '28px' },
                    { size: '32', label: '32px - Extra Large' },
                    { size: '36', label: '36px' },
                    { size: '48', label: '48px - Huge' },
                    { size: '72', label: '72px - Giant' }
                  ].map((item) => (
                    <DropdownMenuItem 
                      key={item.size} 
                      onClick={() => {
                        handleSizeChange(item.size);
                        toast({
                          title: "Font size changed",
                          description: `Applied ${item.size}px`,
                        });
                      }}
                      className="cursor-pointer"
                    >
                      <span className="text-sm font-medium">{item.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Separator orientation="vertical" className="h-6" />

              {/* Headings */}
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => formatText('heading1')}
                      className={isMobile ? "h-9 w-9 p-0 touch-manipulation" : "h-8 w-8 p-0"}
                    >
                      <Heading1 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Heading 1</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => formatText('heading2')}
                      className={isMobile ? "h-9 w-9 p-0 touch-manipulation" : "h-8 w-8 p-0"}
                    >
                      <Heading2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Heading 2</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => formatText('heading3')}
                      className={isMobile ? "h-9 w-9 p-0 touch-manipulation" : "h-8 w-8 p-0"}
                    >
                      <Heading3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Heading 3</TooltipContent>
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Lists and Content */}
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => formatText('list')}
                      className={isMobile ? "h-9 w-9 p-0 touch-manipulation" : "h-8 w-8 p-0"}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bullet List</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => formatText('orderedList')}
                      className={isMobile ? "h-9 w-9 p-0 touch-manipulation" : "h-8 w-8 p-0"}
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Numbered List</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => formatText('quote')}
                      className={isMobile ? "h-9 w-9 p-0 touch-manipulation" : "h-8 w-8 p-0"}
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Quote</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => formatText('link')}
                      className={isMobile ? "h-9 w-9 p-0 touch-manipulation" : "h-8 w-8 p-0"}
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Insert Link</TooltipContent>
                </Tooltip>

                {!isMobile && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => formatText('table')}
                        className="h-8 w-8 p-0"
                      >
                        <Table className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Insert Table</TooltipContent>
                  </Tooltip>
                )}
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Utility Actions - Simplified */}
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={copyToClipboard}
                      className={isMobile ? "h-9 w-9 p-0 touch-manipulation" : "h-8 w-8 p-0"}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy to Clipboard</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => formatText('removeFormat')}
                      className={isMobile ? "h-9 w-9 p-0 touch-manipulation" : "h-8 w-8 p-0"}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clear Formatting</TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={isMobile ? "h-9 w-9 p-0 touch-manipulation" : "h-8 w-8 p-0"}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Export Sermon</TooltipContent>
                    </Tooltip>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={() => exportSermon('txt')}
                      className="cursor-pointer"
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Export as TXT
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => exportSermon('md')}
                      className="cursor-pointer"
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Export as Markdown
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => exportSermon('html')}
                      className="cursor-pointer"
                    >
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