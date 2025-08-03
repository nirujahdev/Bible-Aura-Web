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
import SermonAIAssistant from '@/components/SermonAIAssistant';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
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

// Removed AIMessage interface - now using comprehensive AI Assistant component

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
  useSEO(SEO_CONFIG.SERMONS);
  
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
  const [activeRightTab, setActiveRightTab] = useState('ai');

  // Bible state
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [selectedTranslation, setSelectedTranslation] = useState<TranslationCode>('KJV');
  const [bibleLoading, setBibleLoading] = useState(false);
  const [bibleSearchQuery, setBibleSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);

  // Remove old AI chat states - now using comprehensive AI Assistant

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

      if (error) {
        console.error('Supabase error:', error);
        
        // Handle specific database errors
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          toast({
            title: "Database Update Required",
            description: "The database schema needs to be updated. Please refresh the page or contact support.",
            variant: "destructive"
          });
          return;
        }
        
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          toast({
            title: "Database Error",
            description: "The sermons table is missing. Please contact support.",
            variant: "destructive"
          });
          return;
        }
        
        if (error.message.includes('permission denied') || error.message.includes('RLS')) {
          toast({
            title: "Permission Error",
            description: "Please sign out and sign back in to refresh your permissions.",
            variant: "destructive"
          });
          return;
        }
        
        throw error;
      }
      
      // Process data with proper defaults
      const processedData = (data || []).map(sermon => ({
        ...sermon,
        tags: sermon.tags || [],
        main_points: sermon.main_points || [],
        illustrations: sermon.illustrations || [],
        applications: sermon.applications || [],
        scripture_references: sermon.scripture_references || [],
        language: sermon.language || 'english',
        category: sermon.category || 'general',
        is_draft: sermon.is_draft !== null ? sermon.is_draft : true,
        status: sermon.status || 'draft',
        word_count: sermon.word_count || 0,
        estimated_time: sermon.estimated_time || 0,
        estimated_duration: sermon.estimated_duration || 0,
        ai_generated: sermon.ai_generated || false
      }));
      
      setSermons(processedData);
    } catch (error: any) {
      console.error('Error loading sermons:', error);
      
      // Show user-friendly error message
      const errorMessage = error?.message || 'Unknown error occurred';
      let userMessage = "Failed to load sermons. Please try again.";
      
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        userMessage = "Network error. Please check your connection and try again.";
      } else if (errorMessage.includes('timeout')) {
        userMessage = "Request timed out. Please try again.";
      } else if (errorMessage.includes('JWT') || errorMessage.includes('token')) {
        userMessage = "Session expired. Please sign in again.";
      }
      
      toast({
        title: "Error",
        description: userMessage,
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
      const language = selectedTranslation === 'TAMIL' ? 'tamil' : 'english';
      const chapterVerses = await getChapterVerses(book.name, chapter, language, selectedTranslation);
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
      // Enhanced search across the entire Bible
      const results: BibleVerse[] = [];
      const searchTerm = query.toLowerCase();
      
      // Search through current loaded verses first (for instant results)
      const currentResults = verses.filter(verse => 
        verse.text.toLowerCase().includes(searchTerm)
      );
      results.push(...currentResults);
      
      // If we have few results and want to search more extensively,
      // we could load and search other popular books/chapters
      if (results.length < 10) {
        try {
          // Search through other popular books for better results
          const popularBooks = ['Genesis', 'Psalms', 'Matthew', 'John', 'Romans', 'Ephesians'];
          
          for (const bookName of popularBooks) {
            if (results.length >= 20) break; // Limit total results
            
            const book = books.find(b => b.name === bookName);
            if (book && book.name !== selectedBook?.name) {
              // Search first few chapters of popular books
              const chaptersToSearch = Math.min(3, book.chapters);
              
              for (let chapter = 1; chapter <= chaptersToSearch; chapter++) {
                                 try {
                   const language = selectedTranslation === 'TAMIL' ? 'tamil' : 'english';
                   const chapterVerses = await getChapterVerses(book.name, chapter, language, selectedTranslation);
                   const chapterResults = chapterVerses.filter(verse => 
                     verse.text.toLowerCase().includes(searchTerm)
      );
                   results.push(...chapterResults);
                  
                  // Break if we have enough results
                  if (results.length >= 20) break;
    } catch (error) {
                  // Continue to next chapter if one fails
                  continue;
    }
              }
            }
          }
        } catch (error) {
          console.warn('Extended search failed:', error);
          // Continue with current results
        }
      }
      
      // Remove duplicates and sort by relevance
      const uniqueResults = results.filter((verse, index, self) => 
        index === self.findIndex(v => v.id === verse.id)
      );
      
      // Sort results by book order and then by chapter/verse
      const sortedResults = uniqueResults.sort((a, b) => {
        // First by book order (Genesis before Exodus, etc.)
        const bookAIndex = books.findIndex(book => book.name === a.book_name);
        const bookBIndex = books.findIndex(book => book.name === b.book_name);
        
        if (bookAIndex !== bookBIndex) {
          return bookAIndex - bookBIndex;
        }
        
        // Then by chapter
        if (a.chapter !== b.chapter) {
          return a.chapter - b.chapter;
        }
        
        // Finally by verse
        return a.verse - b.verse;
      });
      
      setSearchResults(sortedResults);
    } catch (error) {
      console.error('Error searching Bible:', error);
      toast({
        title: "Search Error",
        description: "Failed to search the Bible. Please try again.",
        variant: "destructive"
      });
    } finally {
      setBibleLoading(false);
    }
  };

  // Removed old sendAIMessage function - now using comprehensive AI Assistant component

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
      <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-gray-50 flex flex-col`}>
        {/* Clean Header */}
        <div className="border-b bg-white px-6 py-4 shadow-sm border-gray-200">
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
                <div className="p-2 bg-orange-600 rounded-lg">
                  <PenTool className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {isEditing ? 'Edit Sermon' : 'New Sermon'}
                  </h1>
                  <p className="text-sm text-gray-600">
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
                <DialogContent className="max-w-[95vw] w-full h-[95vh] max-h-[95vh]">
                  <DialogHeader className="border-b pb-4">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                      Bible Reference - Enhanced Search & Study
                    </DialogTitle>
                    <p className="text-sm text-gray-600">Search verses, browse chapters, and add references to your sermon</p>
                  </DialogHeader>
                  
                  <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                    {/* Enhanced Controls */}
                    <div className="flex flex-col gap-4 p-2 bg-gray-50 rounded-lg">
                      <div className="flex flex-wrap gap-4 items-center">
                        {/* Translation Selector - Now includes Tamil */}
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-gray-700">Translation</label>
                          <Select value={selectedTranslation} onValueChange={(value: TranslationCode) => {
                            setSelectedTranslation(value);
                            if (selectedBook) {
                              loadChapter(selectedBook, selectedChapter);
                            }
                          }}>
                            <SelectTrigger className="w-56">
                          <SelectValue />
                        </SelectTrigger>
                            <SelectContent className="max-h-60">
                              <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">English</div>
                              {BIBLE_TRANSLATIONS.filter(t => t.language === 'english').map((trans) => (
                            <SelectItem key={trans.code} value={trans.code}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{trans.code}</span>
                                    <span className="text-xs text-gray-500">{trans.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                              <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase border-t mt-1 pt-2">Tamil</div>
                              {BIBLE_TRANSLATIONS.filter(t => t.language === 'tamil').map((trans) => (
                                <SelectItem key={trans.code} value={trans.code}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{trans.code}</span>
                                    <span className="text-xs text-gray-500">{trans.name}</span>
                                  </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                        </div>
                      
                        {/* Book Selector */}
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-gray-700">Book</label>
                      <Select value={selectedBook?.name || ''} onValueChange={(bookName) => {
                        const book = books.find(b => b.name === bookName);
                        if (book) {
                          setSelectedBook(book);
                          setSelectedChapter(1);
                          loadChapter(book, 1);
                        }
                      }}>
                            <SelectTrigger className="w-56">
                          <SelectValue placeholder="Select book" />
                        </SelectTrigger>
                            <SelectContent className="max-h-60">
                              <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Old Testament</div>
                              {books.filter(book => book.testament === 'old').map((book) => (
                            <SelectItem key={book.name} value={book.name}>
                                  {book.name} ({book.chapters} chapters)
                                </SelectItem>
                              ))}
                              <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase border-t mt-1 pt-2">New Testament</div>
                              {books.filter(book => book.testament === 'new').map((book) => (
                                <SelectItem key={book.name} value={book.name}>
                                  {book.name} ({book.chapters} chapters)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                        </div>
                      
                        {/* Chapter Navigation */}
                      {selectedBook && (
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-700">Chapter</label>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadChapter(selectedBook, Math.max(1, selectedChapter - 1))}
                            disabled={selectedChapter <= 1}
                                className="h-9"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Select value={selectedChapter.toString()} onValueChange={(value) => loadChapter(selectedBook, parseInt(value))}>
                                <SelectTrigger className="w-32 h-9">
                              <SelectValue />
                            </SelectTrigger>
                                <SelectContent className="max-h-60">
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
                                className="h-9"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                            </div>
                        </div>
                      )}
                    </div>

                                             {/* Enhanced Search */}
                       <div className="flex flex-col gap-3">
                         <div className="flex gap-2">
                           <div className="flex-1 relative">
                             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                             <Input
                               placeholder="Search verses... (e.g., 'love', 'faith', 'hope')"
                               value={bibleSearchQuery}
                               onChange={(e) => {
                                 setBibleSearchQuery(e.target.value);
                                 searchBible(e.target.value);
                               }}
                               className="pl-10 border-gray-300 focus:border-blue-500"
                             />
                           </div>
                           <Button
                             variant="outline"
                             onClick={() => {
                               setBibleSearchQuery('');
                               setSearchResults([]);
                             }}
                             disabled={!bibleSearchQuery}
                           >
                             Clear
                           </Button>
                         </div>
                         
                         {/* Quick Search Suggestions */}
                         {!bibleSearchQuery && (
                           <div className="flex flex-wrap gap-2">
                             <span className="text-xs text-gray-500 font-medium">Quick search:</span>
                             {['love', 'faith', 'hope', 'peace', 'joy', 'salvation', 'prayer', 'forgiveness', 'grace', 'wisdom'].map((term) => (
                               <Button
                                 key={term}
                                 variant="outline"
                                 size="sm"
                                 className="h-7 px-3 text-xs hover:bg-blue-50 hover:border-blue-300"
                                 onClick={() => {
                                   setBibleSearchQuery(term);
                                   searchBible(term);
                                 }}
                               >
                                 {term}
                               </Button>
                             ))}
                           </div>
                         )}
                       </div>
                    </div>

                    {/* Results Area */}
                    <div className="flex-1 overflow-hidden">
                      <ScrollArea className="h-full">
                      {bibleLoading ? (
                          <div className="flex flex-col justify-center items-center py-12">
                            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                            <p className="text-gray-600">Loading Bible content...</p>
                        </div>
                      ) : (
                          <div className="space-y-3 p-2">
                            {/* Search Results */}
                            {bibleSearchQuery && searchResults.length > 0 && (
                              <div className="mb-6">
                                <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                                  <Search className="h-5 w-5 text-blue-600" />
                                  <h3 className="font-semibold text-blue-800">
                                    Search Results ({searchResults.length} verses found)
                                  </h3>
                                </div>
                                <div className="space-y-3">
                                  {searchResults.map((verse) => (
                            <div
                                      key={`search-${verse.id}`}
                                      className="p-4 rounded-lg border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50 cursor-pointer group transition-all duration-200 shadow-sm"
                              onClick={() => insertVerseIntoSermon(verse)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="text-xs font-medium text-blue-700 border-blue-300">
                                              {verse.book_name} {verse.chapter}:{verse.verse}
                                            </Badge>
                                            <Badge variant="secondary" className="text-xs">
                                              {selectedTranslation}
                                            </Badge>
                                          </div>
                                          <p className="text-gray-700 leading-relaxed font-medium">
                                            {verse.text}
                                          </p>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-4"
                                        >
                                          <Plus className="h-4 w-4 text-blue-600" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Chapter View */}
                            {!bibleSearchQuery && verses.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                  <BookOpen className="h-5 w-5 text-blue-600" />
                                  <h3 className="font-semibold text-gray-800">
                                    {selectedBook?.name} Chapter {selectedChapter}
                                  </h3>
                                  <Badge variant="outline" className="ml-auto">
                                    {verses.length} verses
                                  </Badge>
                                </div>
                                <div className="grid gap-3">
                                  {verses.map((verse) => (
                                    <div
                                      key={verse.id}
                                      className="group p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200 hover:shadow-md"
                                      onClick={() => insertVerseIntoSermon(verse)}
                                    >
                                      <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                          <span className="text-sm font-bold text-blue-600">
                                    {verse.verse}
                                  </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-gray-700 leading-relaxed">
                                    {verse.text}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                >
                                  <Plus className="h-4 w-4 text-blue-600" />
                                </Button>
                              </div>
                            </div>
                          ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Empty States */}
                            {bibleSearchQuery && searchResults.length === 0 && !bibleLoading && (
                              <div className="text-center py-12">
                                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-600 mb-2">No verses found</h3>
                                <p className="text-gray-500">Try different search terms or check your spelling</p>
                              </div>
                            )}
                            
                            {!bibleSearchQuery && verses.length === 0 && !bibleLoading && (
                              <div className="text-center py-12">
                                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-600 mb-2">Select a book and chapter</h3>
                                <p className="text-gray-500">Choose a Bible book and chapter to view verses</p>
                              </div>
                            )}
                        </div>
                      )}
                    </ScrollArea>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Panel Controls */}
              <Button 
                variant="ghost"
                size="sm" 
                onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                className="hover:bg-gray-100"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                className={`hover:bg-purple-50 ${rightPanelOpen ? 'bg-purple-100' : ''}`}
              >
                <PanelRightOpen className="h-4 w-4" />
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
                className="bg-orange-600 hover:bg-orange-700 text-white"
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
          {leftPanelOpen && (
            <div className="w-80 border-r bg-white flex flex-col shadow-sm">
              <Tabs defaultValue="details" className="flex-1 flex flex-col">
                <TabsList className="grid grid-cols-2 m-4 mb-0 bg-gray-100">
                  <TabsTrigger value="details" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Details</TabsTrigger>
                  <TabsTrigger value="outline" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Outline</TabsTrigger>
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
                          Scripture References
                        </label>
                        <Textarea
                          placeholder="Add your main scripture references..."
                          value={selectedSermon?.scripture_reference || ''}
                          onChange={(e) => setSelectedSermon(prev => prev ? { ...prev, scripture_reference: e.target.value } : null)}
                          className="border-gray-200 focus:border-orange-500 min-h-[120px] resize-none"
                          rows={6}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          💡 Tip: Add one reference per line with notes for easy reference
                        </p>
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
                          <SelectTrigger className="border-gray-200 focus:border-orange-500">
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MapPin className="inline h-4 w-4 mr-1" />
                          Target Audience
                        </label>
                        <Input
                          placeholder="e.g., Young Adults, Families, etc."
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          className="border-gray-200 focus:border-orange-500"
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
                          className="border-gray-200 focus:border-orange-500 min-h-[80px]"
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
                                                  className="flex-1 border-gray-200 focus:border-orange-500"
                      />
                                              <Button 
                          onClick={() => addOutlineItem()}
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600"
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
                                                                 <Heading1 className="h-3 w-3 text-orange-600" />
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
                                                                     <Heading2 className="h-3 w-3 text-orange-500" />
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
                                                                         className="text-xs h-8 border-gray-200 focus:border-orange-500"
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
            <div className={`flex-1 p-6 ${focusMode ? 'bg-white' : ''}`}>
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

          {/* Enhanced Right Panel with AI Assistant */}
          {rightPanelOpen && (
            <div className="w-96 border-l bg-white shadow-lg">
              <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="h-full flex flex-col">
                <TabsList className="grid grid-cols-2 m-2 bg-gray-100">
                  <TabsTrigger value="ai" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    <span className="mr-2 text-orange-500 data-[state=active]:text-white">✦</span>
                    AI Assistant
                  </TabsTrigger>
                  <TabsTrigger value="bible" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Quick Bible
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ai" className="flex-1 m-0">
                  <SermonAIAssistant
                    currentContent={selectedSermon?.content || ''}
                    onContentUpdate={(content) => setSelectedSermon(prev => prev ? { ...prev, content } : null)}
                    onOutlineGenerated={(outline) => {
                      // Handle generated outline
                      console.log('Generated outline:', outline);
                    }}
                    sermonTitle={selectedSermon?.title || ''}
                    scriptureReference={selectedSermon?.scripture_reference || ''}
                  />
                </TabsContent>

                <TabsContent value="bible" className="flex-1 m-0 p-4">
                  <div className="h-full flex flex-col space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">Quick Bible Lookup</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search verses..."
                          value={bibleSearchQuery}
                          onChange={(e) => {
                            setBibleSearchQuery(e.target.value);
                            searchBible(e.target.value);
                          }}
                          className="pl-10"
                        />
                </div>
                
                      {selectedBook && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">{selectedBook.name}</span>
                          <span>Chapter {selectedChapter}</span>
                      </div>
                    )}
                    </div>

                    <ScrollArea className="flex-1">
                      {bibleLoading ? (
                        <div className="flex justify-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="space-y-2">
                          {searchResults.slice(0, 5).map((verse) => (
                            <div
                              key={verse.id}
                              className="p-3 rounded-lg border hover:border-blue-200 hover:bg-blue-50 cursor-pointer group transition-all"
                              onClick={() => insertVerseIntoSermon(verse)}
                            >
                              <div className="text-xs text-blue-600 font-medium mb-1">
                                {verse.book_name} {verse.chapter}:{verse.verse}
                          </div>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {verse.text.length > 100 ? verse.text.substring(0, 100) + '...' : verse.text}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 h-6 text-xs"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                          </div>
                          ))}
                          </div>
                      ) : verses.length > 0 ? (
                        <div className="space-y-2">
                          {verses.slice(0, 10).map((verse) => (
                            <div
                              key={verse.id}
                              className="p-3 rounded-lg border hover:border-blue-200 hover:bg-blue-50 cursor-pointer group transition-all"
                              onClick={() => insertVerseIntoSermon(verse)}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-blue-600">{verse.verse}</span>
                        </div>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {verse.text.length > 80 ? verse.text.substring(0, 80) + '...' : verse.text}
                              </p>
                      </div>
                    ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 text-sm">
                          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Search for verses or use the full Bible dialog</p>
                      </div>
                    )}
                </ScrollArea>
                
                    <Button
                      variant="outline"
                      onClick={() => setShowBibleDialog(true)}
                      className="w-full"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Open Full Bible
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Clean and simple dashboard view
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-600 rounded-xl">
              <PenTool className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sermon Studio
              </h1>
              <p className="text-gray-600">Create powerful sermons with ✦ AI assistance</p>
            </div>
          </div>
          <Button
            onClick={handleNewSermon}
            size="lg"
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Sermon
          </Button>
        </div>

        {/* Simple Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600">Total Sermons</p>
                </div>
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
                  <p className="text-sm text-gray-600">Ready to Deliver</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">{stats.delivered}</p>
                  <p className="text-sm text-gray-600">Delivered</p>
                </div>
                <PenTool className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">{stats.drafts}</p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
                <Edit3 className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clean Sermons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sermons.map((sermon) => (
            <Card key={sermon.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2 text-gray-900">
                    {sermon.title || "Untitled Sermon"}
                  </CardTitle>
                  <div className="flex flex-col gap-2">
                    <Badge 
                      variant="outline"
                      className={`text-xs border ${
                        sermon.status === 'delivered' ? 'border-green-200 text-green-700 bg-green-50' :
                        sermon.status === 'ready' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                        sermon.status === 'archived' ? 'border-gray-200 text-gray-700 bg-gray-50' :
                        'border-orange-200 text-orange-700 bg-orange-50'
                      }`}
                    >
                      {sermon.status === 'draft' && 'Draft'}
                      {sermon.status === 'ready' && 'Ready'}
                      {sermon.status === 'delivered' && 'Delivered'}
                      {sermon.status === 'archived' && 'Archived'}
                    </Badge>
                  </div>
                </div>
                    {sermon.scripture_reference && (
                  <Badge variant="outline" className="text-xs border-gray-200 text-gray-600 w-fit">
                    {sermon.scripture_reference}
                      </Badge>
                    )}
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
                {(sermon.word_count || 0) > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                  <div 
                      className="bg-orange-600 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, ((sermon.word_count || 0) / wordGoal) * 100)}%` }}
                  ></div>
                </div>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditSermon(sermon)}
                    className="flex-1 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700"
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
            <div className="p-6 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <PenTool className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Ready to create your first sermon?
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create powerful sermons with ✦ AI assistance, Bible integration, and smart writing tools.
            </p>
            <Button 
              onClick={handleNewSermon} 
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white"
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