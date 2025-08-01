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
  Zap, Globe, Menu, SidebarOpen, SidebarClose, Layout, Heart,
  Bookmark, Tag, MapPin, Music, Palette, CheckCircle2, Circle,
  GripVertical, Trash, Edit2
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

interface OutlineItem {
  id: string;
  title: string;
  level: number;
  completed?: boolean;
  subItems?: OutlineItem[];
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
  const [bibleSearchQuery, setBibleSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);

  // AI Chat state
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const aiScrollRef = useRef<HTMLDivElement>(null);

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
  const [showBibleDialog, setShowBibleDialog] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const [customOutline, setCustomOutline] = useState<OutlineItem[]>([]);
  const [newOutlineItem, setNewOutlineItem] = useState('');
  const [sermonTags, setSermonTags] = useState<string[]>([]);
  const [sermonMood, setSermonMood] = useState<'inspiring' | 'challenging' | 'comforting' | 'teaching' | ''>('');
  const [targetAudience, setTargetAudience] = useState<string>('');
  
  // Refs
  const editorRef = useRef<HTMLTextAreaElement>(null);
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
    const verseText = `> "${verse.text}" \n> — ${verse.book_name} ${verse.chapter}:${verse.verse}\n\n`;
    
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
      title: "✨ Verse Added",
      description: `${verse.book_name} ${verse.chapter}:${verse.verse} added to your sermon`,
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
      // Simple AI response for now - you can integrate with your preferred AI service
      const responses = [
        "That's a powerful biblical concept. Consider exploring how this applies to modern believers.",
        "Have you thought about including a personal testimony or illustration here?",
        "This passage has rich theological depth. What specific aspect resonates most with your congregation?",
        "Consider adding a practical application that your audience can implement this week.",
        "That's an excellent foundation. How might you connect this to current events or challenges?",
        "This reminds me of the parallel passage in [related scripture]. Worth exploring?",
        "Strong point! Consider using a story or metaphor to make this more relatable.",
        "That's doctrinally sound. How can you make this truth come alive for your listeners?"
      ];
      
      setTimeout(() => {
        const aiMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date().toISOString()
        };
        setAiMessages(prev => [...prev, aiMessage]);
        setAiLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error with AI:', error);
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
    setCustomOutline(generateOutline());
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
      // setShowSermonTemplates(false); // Removed as per new_code
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

  // Custom outline management
  const addOutlineItem = (parentId?: string) => {
    if (!newOutlineItem.trim()) return;
    
    const newItem: OutlineItem = {
      id: `outline-${Date.now()}`,
      title: newOutlineItem,
      level: parentId ? 2 : 1,
      completed: false,
      subItems: []
    };
    
    if (parentId) {
      setCustomOutline(prev => prev.map(item => 
        item.id === parentId 
          ? { ...item, subItems: [...(item.subItems || []), newItem] }
          : item
      ));
    } else {
      setCustomOutline(prev => [...prev, newItem]);
    }
    
    setNewOutlineItem('');
  };

  const removeOutlineItem = (itemId: string, parentId?: string) => {
    if (parentId) {
      setCustomOutline(prev => prev.map(item => 
        item.id === parentId 
          ? { ...item, subItems: item.subItems?.filter(sub => sub.id !== itemId) || [] }
          : item
      ));
    } else {
      setCustomOutline(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const toggleOutlineItem = (itemId: string, parentId?: string) => {
    if (parentId) {
      setCustomOutline(prev => prev.map(item => 
        item.id === parentId 
          ? { 
              ...item, 
              subItems: item.subItems?.map(sub => 
                sub.id === itemId ? { ...sub, completed: !sub.completed } : sub
              ) || []
            }
          : item
      ));
    } else {
      setCustomOutline(prev => prev.map(item => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ));
    }
  };

  // If in editor mode, show the enhanced sermon editor
  if (viewMode === 'editor' && selectedSermon) {
    return (
      <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col`}>
        {/* Enhanced Header with Brand Colors */}
        <div className="border-b bg-white/90 backdrop-blur-sm px-6 py-4 shadow-sm border-orange-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="hover:bg-orange-50 text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sermons
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-md">
                  <Mic className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-800">
                    {isEditing ? 'Edit Sermon' : 'New Sermon'}
                  </h1>
                  <p className="text-sm text-orange-600 font-medium">
                    {selectedSermon?.title || 'Untitled Sermon'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Bible Reference Button */}
              <Dialog open={showBibleDialog} onOpenChange={setShowBibleDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="hover:bg-blue-50">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Bible
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      Bible Reference
                    </DialogTitle>
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
                          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {verses.map((verse) => (
                            <div
                              key={verse.id}
                              className="p-4 rounded-lg border-2 border-transparent hover:border-blue-200 hover:bg-blue-50 cursor-pointer group transition-all duration-200"
                              onClick={() => insertVerseIntoSermon(verse)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <span className="font-semibold text-blue-600 text-sm">
                                    {verse.verse}
                                  </span>
                                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                                    {verse.text}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Plus className="h-4 w-4 text-blue-600" />
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

              {/* AI Chat Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAIChat(!showAIChat)}
                className={`hover:bg-purple-50 ${showAIChat ? 'bg-purple-100 border-purple-300' : ''}`}
              >
                <Bot className="h-4 w-4 mr-2" />
                AI Chat
              </Button>

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
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-sm"
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
          {/* Enhanced Left Panel */}
          {showOutline && (
            <div className="w-80 border-r bg-white/50 backdrop-blur-sm flex flex-col shadow-sm">
              <Tabs defaultValue="details" className="flex-1 flex flex-col">
                <TabsList className="grid grid-cols-3 m-4 mb-0 bg-gray-100">
                  <TabsTrigger value="details" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Details</TabsTrigger>
                  <TabsTrigger value="outline" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Outline</TabsTrigger>
                  <TabsTrigger value="stats" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Stats</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="flex-1 p-4 m-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FileText className="inline h-4 w-4 mr-1" />
                          Title
                        </label>
                        <Input
                          placeholder="Enter sermon title..."
                          value={selectedSermon?.title || ''}
                          onChange={(e) => setSelectedSermon(prev => prev ? { ...prev, title: e.target.value } : null)}
                          className="border-gray-200 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <BookOpen className="inline h-4 w-4 mr-1" />
                          Scripture Reference
                        </label>
                        <Input
                          placeholder="e.g., John 3:16"
                          value={selectedSermon?.scripture_reference || ''}
                          onChange={(e) => setSelectedSermon(prev => prev ? { ...prev, scripture_reference: e.target.value } : null)}
                          className="border-gray-200 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Users className="inline h-4 w-4 mr-1" />
                          Congregation
                        </label>
                        <Input
                          placeholder="e.g., Sunday Service"
                          value={selectedSermon?.congregation || ''}
                          onChange={(e) => setSelectedSermon(prev => prev ? { ...prev, congregation: e.target.value } : null)}
                          className="border-gray-200 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="inline h-4 w-4 mr-1" />
                          Date
                        </label>
                        <Input
                          type="date"
                          value={selectedSermon?.sermon_date || ''}
                          onChange={(e) => setSelectedSermon(prev => prev ? { ...prev, sermon_date: e.target.value } : null)}
                          className="border-gray-200 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Target className="inline h-4 w-4 mr-1" />
                          Status
                        </label>
                        <Select value={selectedSermon?.status} onValueChange={(value: 'draft' | 'ready' | 'delivered' | 'archived') => 
                          setSelectedSermon(prev => prev ? { ...prev, status: value, is_draft: value === 'draft' } : null)
                        }>
                          <SelectTrigger className="border-gray-200 focus:border-blue-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">📝 Draft</SelectItem>
                            <SelectItem value="ready">✅ Ready</SelectItem>
                            <SelectItem value="delivered">🎤 Delivered</SelectItem>
                            <SelectItem value="archived">📦 Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Heart className="inline h-4 w-4 mr-1" />
                          Sermon Mood
                        </label>
                        <Select value={sermonMood} onValueChange={(value: 'inspiring' | 'challenging' | 'comforting' | 'teaching') => setSermonMood(value)}>
                          <SelectTrigger className="border-gray-200 focus:border-blue-500">
                            <SelectValue placeholder="Select mood" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inspiring">✨ Inspiring</SelectItem>
                            <SelectItem value="challenging">⚡ Challenging</SelectItem>
                            <SelectItem value="comforting">🤗 Comforting</SelectItem>
                            <SelectItem value="teaching">📚 Teaching</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MapPin className="inline h-4 w-4 mr-1" />
                          Target Audience
                        </label>
                        <Input
                          placeholder="e.g., Young Adults, Families, etc."
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          className="border-gray-200 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Music className="inline h-4 w-4 mr-1" />
                          Notes
                        </label>
                        <Textarea
                          placeholder="Private notes about this sermon..."
                          value={selectedSermon?.private_notes || ''}
                          onChange={(e) => setSelectedSermon(prev => prev ? { ...prev, private_notes: e.target.value } : null)}
                          className="border-gray-200 focus:border-blue-500 min-h-[80px]"
                        />
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="outline" className="flex-1 p-4 m-0">
                  <div className="space-y-4 h-full flex flex-col">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <ListOrdered className="h-4 w-4" />
                        Sermon Outline
                      </h3>
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add outline point..."
                        value={newOutlineItem}
                        onChange={(e) => setNewOutlineItem(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addOutlineItem()}
                        className="flex-1 border-gray-200 focus:border-blue-500"
                      />
                      <Button 
                        onClick={() => addOutlineItem()}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <ScrollArea className="flex-1">
                      {customOutline.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <ListOrdered className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Add outline points to structure your sermon</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {customOutline.map((item) => (
                            <div key={item.id} className="group">
                              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleOutlineItem(item.id)}
                                  className="p-1 h-6 w-6"
                                >
                                  {item.completed ? 
                                    <CheckCircle2 className="h-4 w-4 text-green-600" /> : 
                                    <Circle className="h-4 w-4 text-gray-400" />
                                  }
                                </Button>
                                <Heading1 className="h-3 w-3 text-blue-600" />
                                <span className={`text-sm flex-1 ${item.completed ? 'line-through text-gray-500' : ''}`}>
                                  {item.title}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOutlineItem(item.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 h-6 w-6 text-red-500 hover:text-red-700"
                                >
                                  <Trash className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              {/* Sub-items */}
                              {item.subItems && item.subItems.map((subItem) => (
                                <div key={subItem.id} className="ml-8 flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 group">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleOutlineItem(subItem.id, item.id)}
                                    className="p-1 h-6 w-6"
                                  >
                                    {subItem.completed ? 
                                      <CheckCircle2 className="h-4 w-4 text-green-600" /> : 
                                      <Circle className="h-4 w-4 text-gray-400" />
                                    }
                                  </Button>
                                  <Heading2 className="h-3 w-3 text-purple-600" />
                                  <span className={`text-sm flex-1 ${subItem.completed ? 'line-through text-gray-500' : ''}`}>
                                    {subItem.title}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOutlineItem(subItem.id, item.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 h-6 w-6 text-red-500 hover:text-red-700"
                                  >
                                    <Trash className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                              
                              <div className="ml-8 mt-1">
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Add sub-point..."
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        setNewOutlineItem(e.currentTarget.value);
                                        addOutlineItem(item.id);
                                        e.currentTarget.value = '';
                                      }
                                    }}
                                    className="text-xs h-8 border-gray-200 focus:border-purple-500"
                                  />
                                </div>
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
                      <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedSermon?.content?.trim().split(/\s+/).filter(w => w.length > 0).length || 0}
                          </div>
                          <div className="text-xs text-blue-700">Words</div>
                        </div>
                      </Card>
                      <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.ceil((selectedSermon?.content?.trim().split(/\s+/).filter(w => w.length > 0).length || 0) / 150)}
                          </div>
                          <div className="text-xs text-purple-700">Minutes</div>
                        </div>
                      </Card>
                    </div>
                    
                    <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedSermon?.content?.length || 0}
                        </div>
                        <div className="text-xs text-green-700">Characters</div>
                      </div>
                    </Card>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Progress
                        </span>
                        <span className="font-medium">
                          {Math.round(((selectedSermon?.content?.trim().split(/\s+/).filter(w => w.length > 0).length || 0) / wordGoal) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, ((selectedSermon?.content?.trim().split(/\s+/).filter(w => w.length > 0).length || 0) / wordGoal) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        Word Goal: {wordGoal}
                      </Label>
                      <Slider
                        value={[wordGoal]}
                        onValueChange={(value) => setWordGoal(value[0])}
                        max={5000}
                        min={500}
                        step={100}
                        className="mt-2"
                      />
                    </div>

                    <Card className="p-3 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-amber-700">
                          {customOutline.filter(item => item.completed).length} / {customOutline.length}
                        </div>
                        <div className="text-xs text-amber-600">Outline Complete</div>
                      </div>
                    </Card>

                    <div className="space-y-2">
                      <Label className="text-sm">Quick Insights</Label>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Paragraphs:</span>
                          <span>{selectedSermon?.content?.split('\n\n').length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sentences:</span>
                          <span>{selectedSermon?.content?.split(/[.!?]+/).length - 1 || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reading Level:</span>
                          <span className="text-green-600">Accessible</span>
                        </div>
                      </div>
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
            <div className={`flex-1 p-6 ${focusMode ? 'bg-gradient-to-br from-blue-50 to-purple-50' : ''}`}>
              <Textarea
                ref={editorRef}
                placeholder="Start writing your sermon... Let the Holy Spirit guide your words. ✨"
                value={selectedSermon?.content || ''}
                onChange={(e) => setSelectedSermon(prev => prev ? { ...prev, content: e.target.value } : null)}
                className={`w-full h-full resize-none border-0 focus:ring-0 leading-relaxed ${focusMode ? 'bg-white/90 backdrop-blur-sm shadow-xl rounded-xl p-8 border border-gray-200' : ''}`}
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

          {/* AI Chat Sidebar */}
          {showAIChat && (
            <div className="w-96 border-l bg-white/90 backdrop-blur-sm shadow-lg">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      <h3 className="font-semibold">AI Writing Assistant</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAIChat(false)}
                      className="text-white hover:bg-white/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-purple-100 mt-1">Get help with your sermon</p>
                </div>
                
                <ScrollArea className="flex-1 p-4" ref={aiScrollRef}>
                  <div className="space-y-4">
                    {aiMessages.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Bot className="h-12 w-12 mx-auto mb-3 text-purple-400" />
                        <p className="text-sm font-medium">Hello! I'm here to help with your sermon.</p>
                        <p className="text-xs mt-1">Ask me about:</p>
                        <div className="text-xs mt-2 space-y-1">
                          <div>• Scripture interpretation</div>
                          <div>• Sermon structure</div>
                          <div>• Practical applications</div>
                          <div>• Illustrations & stories</div>
                        </div>
                      </div>
                    )}
                    
                    {aiMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        )}
                        
                        <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                          <div className={`rounded-xl px-4 py-2 text-sm ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white ml-auto'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {format(new Date(message.timestamp), 'h:mm a')}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {aiLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-gray-100 rounded-xl px-4 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex gap-2">
                    <Input
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="Ask about your sermon..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendAIMessage();
                        }
                      }}
                      disabled={aiLoading}
                      className="border-gray-200 focus:border-purple-500"
                    />
                    <Button
                      onClick={sendAIMessage}
                      disabled={!aiInput.trim() || aiLoading}
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Enhanced dashboard view with brand colors
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Mic className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Sermon Studio
              </h1>
              <p className="text-gray-600 text-lg">Create powerful, Spirit-led sermons with divine inspiration</p>
            </div>
          </div>
          <Button
            onClick={handleNewSermon}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Sermon
          </Button>
        </div>

        {/* Enhanced Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-blue-100">Total Sermons</p>
                </div>
                <FileText className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.ready}</p>
                  <p className="text-green-100">Ready to Deliver</p>
                </div>
                <Target className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.delivered}</p>
                  <p className="text-purple-100">Delivered</p>
                </div>
                <Mic className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.drafts}</p>
                  <p className="text-orange-100">In Progress</p>
                </div>
                <Edit3 className="h-10 w-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Sermons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sermons.map((sermon) => (
            <Card key={sermon.id} className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all">
                    {sermon.title || "Untitled Sermon"}
                  </CardTitle>
                  <div className="flex flex-col gap-2">
                    <Badge 
                      variant={sermon.is_draft ? "secondary" : "default"} 
                      className={`text-xs ${
                        sermon.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        sermon.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {sermon.status === 'draft' && '📝 Draft'}
                      {sermon.status === 'ready' && '✅ Ready'}
                      {sermon.status === 'delivered' && '🎤 Delivered'}
                      {sermon.status === 'archived' && '📦 Archived'}
                    </Badge>
                    {sermon.scripture_reference && (
                      <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                        📖 {sermon.scripture_reference}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
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
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, ((sermon.word_count || 0) / wordGoal) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditSermon(sermon)}
                    className="flex-1 group-hover:bg-blue-50 group-hover:border-blue-300 group-hover:text-blue-700 transition-all"
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
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sermons.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <Mic className="h-16 w-16 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Ready to inspire souls?
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              Create your first sermon with divine guidance, powerful tools, and the Word of God at your fingertips.
            </p>
            <Button 
              onClick={handleNewSermon} 
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 px-8 py-4 text-lg"
            >
              <Plus className="h-6 w-6 mr-2" />
              Create Your First Sermon
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sermons;