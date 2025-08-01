import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getAllBooks, getChapterVerses, TranslationCode, BIBLE_TRANSLATIONS } from "@/lib/local-bible";
import SermonToolbar from '@/components/SermonToolbar';
import { 
  FileText, Plus, Edit3, Trash2, Search, Calendar, BookOpen, Lightbulb, 
  Target, Users, Clock, Mic, Star, Timer, Eye, Printer, Share, Settings,
  Brain, Sparkles, Save, Type, AlignLeft, Bold, Italic, List, 
  Presentation, FileDown, Volume2, BarChart, MessageSquare, Copy,
  ChevronDown, ChevronUp, Maximize, Minimize, PaintBucket, Languages,
  PenTool, RefreshCw, Archive, FolderOpen, UserPlus, GitBranch,
  ThumbsUp, TrendingUp, Database, Highlighter, Smartphone, X, Send,
  Bot, ChevronLeft, ChevronRight, PanelLeftOpen, PanelRightOpen,
  Maximize2, Minimize2, BarChart3, Award, AlertCircle, ArrowLeft,
  ListOrdered, Heading1, Heading2, Heading3, Quote, Link, Image,
  Zap, Globe, Menu, SidebarOpen, SidebarClose, Layout
} from "lucide-react";
import { format } from 'date-fns';

// Interfaces
interface Sermon {
  id: string;
  title: string;
  content: string | null;
  outline: any | null;
  scripture_reference?: string | null;
  scripture_references: string[] | null;
  main_points: string[] | null;
  congregation: string | null;
  sermon_date: string | null;
  duration: number | null;
  notes: string | null;
  estimated_duration?: number;
  tags: string[] | null;
  is_draft: boolean;
  status: 'draft' | 'ready' | 'delivered' | 'archived';
  created_at: string;
  updated_at: string;
  user_id: string;
  word_count: number;
  estimated_time: number;
  language: 'english' | 'tamil' | 'sinhala';
  category: string | null;
  illustrations: string[] | null;
  applications: string[] | null;
  ai_generated: boolean;
  template_type: string | null;
  series_name: string | null;
  private_notes: string | null;
}

interface BibleBook {
  id: string;
  name: string;
  testament: 'old' | 'new';
  chapters: number;
}

interface BibleVerse {
  id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface SermonStats {
  total: number;
  ready: number;
  delivered: number;
  drafts: number;
  aiGenerated: number;
  series: number;
  avgRating: number;
}

const Sermons = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // View states
  const [viewMode, setViewMode] = useState<'dashboard' | 'editor'>('dashboard');
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Core sermon state
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<SermonStats>({ 
    total: 0, ready: 0, delivered: 0, drafts: 0, aiGenerated: 0, series: 0, avgRating: 0 
  });

  // Layout state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [activeRightTab, setActiveRightTab] = useState('bible');

  // Bible state
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [selectedTranslation, setSelectedTranslation] = useState<TranslationCode>('KJV');
  const [bibleLoading, setBibleLoading] = useState(false);
  const [showBibleDialog, setShowBibleDialog] = useState(false);
  const [bibleSearchQuery, setBibleSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);

  // AI Chat state
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Editor state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [scriptureRefs, setScriptureRefs] = useState("");
  const [status, setStatus] = useState<'draft' | 'ready' | 'delivered' | 'archived'>('draft');
  const [tags, setTags] = useState("");
  const [seriesName, setSeriesName] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");

  // Advanced editor features
  const [autoSave, setAutoSave] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [focusMode, setFocusMode] = useState(false);
  const [wordGoal, setWordGoal] = useState(1500);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [seriesFilter, setSeriesFilter] = useState("all");

  // Enhanced UI states
  const [showOutline, setShowOutline] = useState(true);
  const [outlineItems, setOutlineItems] = useState<Array<{id: string, title: string, level: number, content: string}>>([]);
  const [showSermonTemplates, setShowSermonTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  // Refs
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const aiScrollRef = useRef<HTMLDivElement>(null);
  const autoSaveRef = useRef<NodeJS.Timeout>();

  // Calculate stats
  const calculateStats = useCallback(() => {
    const total = sermons.length;
    const ready = sermons.filter(s => s.status === 'ready').length;
    const delivered = sermons.filter(s => s.status === 'delivered').length;
    const drafts = sermons.filter(s => s.status === 'draft').length;
    const aiGenerated = sermons.filter(s => s.ai_generated).length;
    const series = [...new Set(sermons.map(s => s.series_name).filter(Boolean))].length;
    const avgRating = 0; // Placeholder for rating system
    
    setStats({ total, ready, delivered, drafts, aiGenerated, series, avgRating });
  }, [sermons]);

  // Word count and estimated time
  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const estimatedTime = Math.ceil(wordCount / 150); // ~150 words per minute

  // Load data
  useEffect(() => {
    if (user) {
      loadSermons();
      loadBooks();
    }
  }, [user]);

  useEffect(() => {
    calculateStats();
  }, [sermons, calculateStats]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && selectedSermon && (title || content)) {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
      autoSaveRef.current = setTimeout(() => {
        handleSaveSermon(true);
      }, 2000);
    }
    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [title, content, autoSave, selectedSermon]);

  const loadSermons = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sermons')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSermons(data || []);
    } catch (error) {
      console.error('Error loading sermons:', error);
      toast({
        title: "Error",
        description: "Failed to load sermons",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    try {
      const bibleBooks = await getAllBooks();
      setBooks(bibleBooks);
      if (bibleBooks.length > 0) {
        setSelectedBook(bibleBooks[0]);
        loadChapter(bibleBooks[0], 1);
      }
    } catch (error) {
      console.error('Error loading Bible books:', error);
    }
  };

  const loadChapter = async (book: BibleBook, chapter: number) => {
    setBibleLoading(true);
    try {
      const chapterVerses = await getChapterVerses(book.name, chapter, 'english', selectedTranslation);
      setVerses(chapterVerses);
      setSelectedChapter(chapter);
    } catch (error) {
      console.error('Error loading chapter:', error);
      toast({
        title: "Error",
        description: "Failed to load Bible chapter",
        variant: "destructive"
      });
    } finally {
      setBibleLoading(false);
    }
  };

  const handleSaveSermon = useCallback(async (isAutoSave = false) => {
    if (!user || (!title.trim() && !content.trim())) return;

    if (!isAutoSave) setSaving(true);
    
    try {
      const sermonData = {
        title: title || 'Untitled Sermon',
        content,
        scripture_reference: scriptureRefs || null,
        scripture_references: scriptureRefs ? scriptureRefs.split(',').map(s => s.trim()).filter(Boolean) : null,
        notes: privateNotes || null,
        private_notes: privateNotes || null,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        status,
        series_name: seriesName || null,
        word_count: wordCount,
        estimated_time: estimatedTime,
        estimated_duration: estimatedTime,
        language: 'english' as const,
        category: 'general',
        is_draft: status === 'draft',
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (selectedSermon) {
        const { error } = await supabase
          .from('sermons')
          .update(sermonData)
          .eq('id', selectedSermon.id);
        
        if (error) {
          console.error('Error updating sermon:', error);
          throw error;
        }
        
        const updatedSermon = { ...selectedSermon, ...sermonData };
        setSelectedSermon(updatedSermon);
        setSermons(prev => prev.map(s => s.id === selectedSermon.id ? updatedSermon : s));
      } else {
        const { data, error } = await supabase
          .from('sermons')
          .insert([{ 
            ...sermonData, 
            created_at: new Date().toISOString() 
          }])
          .select()
          .single();
        
        if (error) {
          console.error('Error creating sermon:', error);
          throw error;
        }
        
        setSelectedSermon(data);
        setSermons(prev => [data, ...prev]);
      }

      if (!isAutoSave) {
        toast({
          title: "Success",
          description: "Sermon saved successfully",
        });
      }
    } catch (error) {
      console.error('Error saving sermon:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save sermon",
        variant: "destructive"
      });
    } finally {
      if (!isAutoSave) setSaving(false);
    }
  }, [user, title, content, scriptureRefs, privateNotes, tags, status, seriesName, wordCount, estimatedTime, selectedSermon]);

  const handleNewSermon = () => {
    setSelectedSermon({
      id: '',
      title: '',
      content: '',
      scripture_reference: '',
      scripture_references: null,
      congregation: '',
      sermon_date: new Date().toISOString().split('T')[0],
      is_draft: true,
      language: 'english',
      status: 'draft',
      created_at: '',
      updated_at: '',
      user_id: user?.id || '',
      word_count: 0,
      estimated_time: 0,
      notes: null,
      tags: null,
      outline: null,
      main_points: null,
      duration: null,
      category: 'general',
      illustrations: null,
      applications: null,
      ai_generated: false,
      template_type: null,
      series_name: null,
      private_notes: null
    });
    setIsEditing(false);
    setViewMode('editor');
  };

  const handleEditSermon = (sermon: Sermon) => {
    setSelectedSermon(sermon);
    setIsEditing(true);
    setViewMode('editor');
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedSermon(null);
    setIsEditing(false);
  };

  const handleDeleteSermon = async (sermonId: string) => {
    try {
      const { error } = await supabase
        .from('sermons')
        .delete()
        .eq('id', sermonId);

      if (error) throw error;

      setSermons(prev => prev.filter(s => s.id !== sermonId));
      if (selectedSermon?.id === sermonId) {
        setSelectedSermon(null);
        setTitle("");
        setContent("");
        setScriptureRefs("");
        setPrivateNotes("");
        setTags("");
        setSeriesName("");
        setStatus('draft');
        setViewMode('dashboard'); // Return to dashboard after deleting current sermon
      }

      toast({
        title: "Success",
        description: "Sermon deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting sermon:', error);
      toast({
        title: "Error",
        description: "Failed to delete sermon",
        variant: "destructive"
      });
    }
  };

  const insertVerseIntoSermon = (verse: BibleVerse) => {
    const verseText = `> "${verse.text}" - ${verse.book_name} ${verse.chapter}:${verse.verse}\n\n`;
    
    if (editorRef.current && selectedSermon) {
      const start = editorRef.current.selectionStart;
      const end = editorRef.current.selectionEnd;
      const currentContent = selectedSermon.content || '';
      const newContent = currentContent.slice(0, start) + verseText + currentContent.slice(end);
      
      setSelectedSermon(prev => prev ? { ...prev, content: newContent } : null);
      
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          editorRef.current.setSelectionRange(start + verseText.length, start + verseText.length);
        }
      }, 0);
    }
    
    setShowBibleDialog(false);
    toast({
      title: "Verse added",
      description: `${verse.book_name} ${verse.chapter}:${verse.verse} added to sermon`,
    });
  };

  const searchBible = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setBibleLoading(true);
    try {
      // Simple search through loaded verses (in a real app, you'd search the entire Bible)
      const results = verses.filter(verse => 
        verse.text.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching Bible:', error);
    } finally {
      setBibleLoading(false);
    }
  };

  const sendAIMessage = async () => {
    if (!aiInput.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: aiInput,
      timestamp: new Date().toISOString()
    };

    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setAiLoading(true);

    try {
      // Context for AI: current sermon content and recent verses
      const context = {
        sermonTitle: title,
        sermonContent: content,
        scriptureRefs: scriptureRefs,
        currentVerse: verses.length > 0 ? verses[0] : null,
        selectedBook: selectedBook?.name
      };

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `You are a knowledgeable biblical scholar and sermon preparation assistant. You have access to the user's current sermon context: Title: "${context.sermonTitle}", Content: "${context.sermonContent}", Scripture: "${context.scriptureRefs}". Provide helpful, biblical insights for sermon preparation. Be practical and theologically sound.`
            },
            {
              role: 'user',
              content: aiInput
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) throw new Error('AI request failed');

      const data = await response.json();
      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date().toISOString()
      };

      setAiMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending AI message:', error);
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleFormatText = (format: string, formattedText?: string) => {
    if (!editorRef.current) return;

    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let replacement = '';
    switch (format) {
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`;
        break;
      case 'heading':
        replacement = `## ${selectedText || 'Heading'}`;
        break;
      case 'list':
        replacement = `- ${selectedText || 'List item'}`;
        break;
      case 'quote':
        replacement = `> ${selectedText || 'Quote'}`;
        break;
      default:
        if (formattedText) replacement = formattedText;
        break;
    }

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  const handleExportSermon = (format: 'txt' | 'markdown' | 'html' | 'pdf') => {
    const exportContent = `${title}\n\n${content}`;
    
    if (format === 'txt') {
      const blob = new Blob([exportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'sermon'}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
    // Add other export formats as needed
    
    toast({
      title: "Export Complete",
      description: `Sermon exported as ${format.toUpperCase()}`,
    });
  };

  const handleInsertQuickText = (text: string) => {
    if (editorRef.current) {
      const textarea = editorRef.current;
      const start = textarea.selectionStart;
      const newContent = content.substring(0, start) + text + content.substring(start);
      setContent(newContent);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  };

  // Filter sermons
  const filteredSermons = sermons.filter(sermon => {
    const matchesSearch = !searchQuery || 
      sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sermon.content && sermon.content.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || sermon.status === statusFilter;
    const matchesSeries = seriesFilter === 'all' || sermon.series_name === seriesFilter;
    
    return matchesSearch && matchesStatus && matchesSeries;
  });

  const seriesOptions = [...new Set(sermons.map(s => s.series_name).filter(Boolean))];

  // Generate outline from sermon content
  const generateOutline = useCallback(() => {
    if (!selectedSermon?.content) return [];
    
    const lines = selectedSermon.content.split('\n');
    const outline: Array<{id: string, title: string, level: number, content: string}> = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.match(/^#{1,3}\s/)) {
        const level = trimmed.match(/^#{1,3}/)?.[0].length || 1;
        const title = trimmed.replace(/^#{1,3}\s/, '');
        outline.push({
          id: `outline-${index}`,
          title,
          level,
          content: trimmed
        });
      } else if (trimmed.match(/^[IVX]+\.\s/) || trimmed.match(/^\d+\.\s/)) {
        outline.push({
          id: `outline-${index}`,
          title: trimmed,
          level: 2,
          content: trimmed
        });
      }
    });
    
    return outline;
  }, [selectedSermon?.content]);

  useEffect(() => {
    setOutlineItems(generateOutline());
  }, [generateOutline]);

  // Sermon templates
  const sermonTemplates = [
    {
      id: 'expository',
      name: 'Expository Sermon',
      structure: `# [Sermon Title]

## Introduction
- Hook/Opening Story
- Context Setting
- Thesis Statement

## Main Body
### Point 1: [Main Point]
- Scripture Reference
- Explanation
- Application

### Point 2: [Main Point]
- Scripture Reference
- Explanation
- Application

### Point 3: [Main Point]
- Scripture Reference
- Explanation
- Application

## Conclusion
- Summary of Points
- Call to Action
- Closing Prayer

## Notes
- [Add your personal notes here]`
    },
    {
      id: 'topical',
      name: 'Topical Sermon',
      structure: `# [Topic Title]

## Opening
- Current Relevance
- Why This Matters

## Biblical Foundation
### Scripture 1: [Reference]
- Context
- Meaning
- Application

### Scripture 2: [Reference]
- Context
- Meaning
- Application

## Practical Application
1. [Practical Point 1]
2. [Practical Point 2]
3. [Practical Point 3]

## Challenge
- Personal Response
- Community Action

## Prayer`
    },
    {
      id: 'narrative',
      name: 'Narrative Sermon',
      structure: `# [Story Title]

## Setting the Scene
- Historical Context
- Characters
- Situation

## The Story Unfolds
### Act 1: [Beginning]
- What happened
- Key characters
- Initial conflict

### Act 2: [Development]
- Plot development
- Challenges
- Turning point

### Act 3: [Resolution]
- Climax
- Resolution
- Lesson learned

## Our Story Today
- How this applies to us
- Modern parallels
- Personal reflection

## Living the Story
- Action steps
- Community application`
    }
  ];

  const applyTemplate = (templateStructure: string) => {
    if (selectedSermon) {
      setSelectedSermon(prev => prev ? { ...prev, content: templateStructure } : null);
      setShowSermonTemplates(false);
      toast({
        title: "Template Applied",
        description: "Sermon template has been applied successfully",
      });
    }
  };

  const scrollToOutlineItem = (content: string) => {
    if (editorRef.current) {
      const textareaContent = editorRef.current.value;
      const index = textareaContent.indexOf(content);
      if (index !== -1) {
        editorRef.current.focus();
        editorRef.current.setSelectionRange(index, index + content.length);
        editorRef.current.scrollTop = Math.max(0, (index / textareaContent.length) * editorRef.current.scrollHeight - 200);
      }
    }
  };

  // If in editor mode, show the enhanced sermon editor
  if (viewMode === 'editor' && selectedSermon) {
    return (
      <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-white flex flex-col`}>
        {/* Enhanced Header */}
        <div className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sermons
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Mic className="h-6 w-6 text-purple-600" />
                <h1 className="text-xl font-semibold">
                  {isEditing ? 'Edit Sermon' : 'New Sermon'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Templates Button */}
              <Dialog open={showSermonTemplates} onOpenChange={setShowSermonTemplates}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Layout className="h-4 w-4 mr-2" />
                    Templates
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Sermon Templates</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4">
                    {sermonTemplates.map(template => (
                      <Card key={template.id} className="cursor-pointer hover:bg-gray-50" onClick={() => applyTemplate(template.structure)}>
                        <CardContent className="p-4">
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {template.name === 'Expository Sermon' && 'Verse-by-verse exposition with clear structure'}
                            {template.name === 'Topical Sermon' && 'Topic-focused with multiple scripture references'}
                            {template.name === 'Narrative Sermon' && 'Story-driven approach with practical application'}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Bible Reference Button */}
              <Dialog open={showBibleDialog} onOpenChange={setShowBibleDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Bible
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Bible Reference</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 flex flex-col space-y-4">
                    <div className="flex gap-4">
                      <Select value={selectedTranslation} onValueChange={(value: TranslationCode) => setSelectedTranslation(value)}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BIBLE_TRANSLATIONS.filter(t => t.language === 'english').slice(0, 8).map((trans) => (
                            <SelectItem key={trans.code} value={trans.code}>
                              {trans.code} - {trans.name.split(' ').slice(0, 2).join(' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select value={selectedBook?.name || ''} onValueChange={(bookName) => {
                        const book = books.find(b => b.name === bookName);
                        if (book) {
                          setSelectedBook(book);
                          setSelectedChapter(1);
                          loadChapter(book, 1);
                        }
                      }}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select book" />
                        </SelectTrigger>
                        <SelectContent>
                          {books.map((book) => (
                            <SelectItem key={book.name} value={book.name}>
                              {book.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {selectedBook && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadChapter(selectedBook, Math.max(1, selectedChapter - 1))}
                            disabled={selectedChapter <= 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Select value={selectedChapter.toString()} onValueChange={(value) => loadChapter(selectedBook, parseInt(value))}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => (
                                <SelectItem key={chapter} value={chapter.toString()}>
                                  Chapter {chapter}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadChapter(selectedBook, Math.min(selectedBook.chapters, selectedChapter + 1))}
                            disabled={selectedChapter >= selectedBook.chapters}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <ScrollArea className="flex-1">
                      {bibleLoading ? (
                        <div className="flex justify-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin" />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {verses.map((verse) => (
                            <div
                              key={verse.id}
                              className="p-4 rounded-lg border hover:bg-gray-50 cursor-pointer group"
                              onClick={() => insertVerseIntoSermon(verse)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <span className="font-medium text-purple-600 text-sm">
                                    {verse.verse}
                                  </span>
                                  <p className="text-sm text-gray-700 mt-1">
                                    {verse.text}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOutline(!showOutline)}
              >
                {showOutline ? <SidebarClose className="h-4 w-4" /> : <SidebarOpen className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button
                onClick={() => handleSaveSermon(false)}
                disabled={saving}
                className="bg-purple-500 hover:bg-purple-600"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Enhanced Left Panel - Sermon Details & Outline */}
          {showOutline && (
            <div className="w-80 border-r bg-gray-50 flex flex-col">
              <Tabs defaultValue="details" className="flex-1 flex flex-col">
                <TabsList className="grid grid-cols-3 m-4 mb-0">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="outline">Outline</TabsTrigger>
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="flex-1 p-4 m-0">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <Input
                        placeholder="Enter sermon title..."
                        value={selectedSermon?.title || ''}
                        onChange={(e) => setSelectedSermon(prev => prev ? { ...prev, title: e.target.value } : null)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Scripture Reference
                      </label>
                      <Input
                        placeholder="e.g., John 3:16"
                        value={selectedSermon?.scripture_reference || ''}
                        onChange={(e) => setSelectedSermon(prev => prev ? { ...prev, scripture_reference: e.target.value } : null)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Congregation
                      </label>
                      <Input
                        placeholder="e.g., Sunday Service"
                        value={selectedSermon?.congregation || ''}
                        onChange={(e) => setSelectedSermon(prev => prev ? { ...prev, congregation: e.target.value } : null)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <Input
                        type="date"
                        value={selectedSermon?.sermon_date || ''}
                        onChange={(e) => setSelectedSermon(prev => prev ? { ...prev, sermon_date: e.target.value } : null)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <Select value={selectedSermon?.status} onValueChange={(value: 'draft' | 'ready' | 'delivered' | 'archived') => 
                        setSelectedSermon(prev => prev ? { ...prev, status: value, is_draft: value === 'draft' } : null)
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="ready">Ready</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="outline" className="flex-1 p-4 m-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Sermon Outline</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setOutlineItems(generateOutline())}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                    <ScrollArea className="h-96">
                      {outlineItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <ListOrdered className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">Add headings to your sermon to see the outline</p>
                          <p className="text-xs mt-1">Use # ## ### for headings</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {outlineItems.map((item) => (
                            <div
                              key={item.id}
                              className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                                item.level === 1 ? 'font-semibold' : 
                                item.level === 2 ? 'ml-4 font-medium' : 'ml-8'
                              }`}
                              onClick={() => scrollToOutlineItem(item.content)}
                            >
                              <div className="flex items-center gap-2">
                                {item.level === 1 && <Heading1 className="h-3 w-3" />}
                                {item.level === 2 && <Heading2 className="h-3 w-3" />}
                                {item.level === 3 && <Heading3 className="h-3 w-3" />}
                                <span className="text-sm truncate">{item.title}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="flex-1 p-4 m-0">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedSermon?.content?.trim().split(/\s+/).filter(w => w.length > 0).length || 0}
                        </div>
                        <div className="text-xs text-gray-600">Words</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.ceil((selectedSermon?.content?.trim().split(/\s+/).filter(w => w.length > 0).length || 0) / 150)}
                        </div>
                        <div className="text-xs text-gray-600">Minutes</div>
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedSermon?.content?.length || 0}
                      </div>
                      <div className="text-xs text-gray-600">Characters</div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{Math.round(((selectedSermon?.content?.trim().split(/\s+/).filter(w => w.length > 0).length || 0) / wordGoal) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all" 
                          style={{ width: `${Math.min(100, ((selectedSermon?.content?.trim().split(/\s+/).filter(w => w.length > 0).length || 0) / wordGoal) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Word goal: {wordGoal}</Label>
                      <Slider
                        value={[wordGoal]}
                        onValueChange={(value) => setWordGoal(value[0])}
                        max={5000}
                        min={500}
                        step={100}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Main Editor */}
          <div className="flex-1 flex flex-col">
            <SermonToolbar
              editorRef={editorRef}
              onFormatText={handleFormatText}
              wordCount={selectedSermon?.content?.trim().split(/\s+/).filter(w => w.length > 0).length || 0}
              estimatedTime={Math.ceil((selectedSermon?.content?.trim().split(/\s+/).filter(w => w.length > 0).length || 0) / 150)}
              sermonContent={selectedSermon?.content || ''}
              sermonTitle={selectedSermon?.title || ''}
              onExport={handleExportSermon}
              onInsertQuickText={handleInsertQuickText}
            />
            <div className={`flex-1 p-6 ${focusMode ? 'bg-gray-100' : ''}`}>
              <Textarea
                ref={editorRef}
                placeholder="Start writing your sermon... Use # for headings to build your outline automatically."
                value={selectedSermon?.content || ''}
                onChange={(e) => setSelectedSermon(prev => prev ? { ...prev, content: e.target.value } : null)}
                className={`w-full h-full resize-none border-0 focus:ring-0 leading-relaxed ${focusMode ? 'bg-white shadow-lg rounded-lg p-8' : ''}`}
                style={{ 
                  minHeight: 'calc(100vh - 250px)',
                  fontSize: `${fontSize}px`,
                  lineHeight: lineHeight,
                  maxWidth: focusMode ? '800px' : '100%',
                  margin: focusMode ? '0 auto' : '0'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced dashboard view
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600 rounded-xl">
              <Mic className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sermon Studio</h1>
              <p className="text-gray-600">Create powerful, engaging sermons with AI assistance</p>
            </div>
          </div>
          <Button
            onClick={handleNewSermon}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Sermon
          </Button>
        </div>

        {/* Dynamic Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-blue-100">Total Sermons</p>
                </div>
                <FileText className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.ready}</p>
                  <p className="text-green-100">Ready to Deliver</p>
                </div>
                <Target className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.delivered}</p>
                  <p className="text-purple-100">Delivered</p>
                </div>
                <Mic className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.drafts}</p>
                  <p className="text-orange-100">In Progress</p>
                </div>
                <Edit3 className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Sermons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sermons.map((sermon) => (
            <Card key={sermon.id} className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {sermon.title || "Untitled Sermon"}
                  </CardTitle>
                  <div className="flex flex-col gap-2">
                    <Badge variant={sermon.is_draft ? "secondary" : "default"} className="text-xs">
                      {sermon.status === 'draft' && '📝 Draft'}
                      {sermon.status === 'ready' && '✅ Ready'}
                      {sermon.status === 'delivered' && '🎤 Delivered'}
                      {sermon.status === 'archived' && '📦 Archived'}
                    </Badge>
                    {sermon.scripture_reference && (
                      <Badge variant="outline" className="text-xs">
                        📖 {sermon.scripture_reference}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {sermon.content || "No content yet..."}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(sermon.created_at), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Type className="h-3 w-3" />
                    {sermon.word_count || 0} words
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.ceil((sermon.word_count || 0) / 150)} min
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all" 
                    style={{ width: `${Math.min(100, ((sermon.word_count || 0) / wordGoal) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditSermon(sermon)}
                    className="flex-1 group-hover:bg-purple-50 group-hover:border-purple-200"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteSermon(sermon.id);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sermons.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="p-4 bg-purple-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Mic className="h-12 w-12 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Ready to inspire?</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first sermon with our intelligent writing tools, templates, and Bible integration.
            </p>
            <Button 
              onClick={handleNewSermon} 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Sermon
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sermons;