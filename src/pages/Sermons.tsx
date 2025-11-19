import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
import { getAllBooks, getChapterVerses, TranslationCode, BIBLE_TRANSLATIONS, searchVerses } from "@/lib/local-bible";
import SermonToolbar from '@/components/SermonToolbar';
import { RichTextEditor } from '@/components/RichTextEditor';
import SermonAIGenerator from '@/components/SermonAIGenerator';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
import { MobileOptimizedLayout } from '@/components/MobileOptimizedLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { SermonAIProvider, useSermonAI } from '@/contexts/SermonAIContext';
import { SermonAutoComplete } from '@/components/sermon/SermonAutoComplete';
import { InlineAISuggestions } from '@/components/sermon/InlineAISuggestions';
import { AIResearchPanel } from '@/components/sermon/AIResearchPanel';
import { TextSelectionMenu } from '@/components/TextSelectionMenu';
import { SermonViewMode } from '@/components/SermonViewMode';
// InlineAIAssistant removed per user request
import ErrorBoundary from '@/components/ErrorBoundary';
import { 
  FileText, Plus, Edit3, Trash2, Search, Calendar, BookOpen, Lightbulb, 
  Target, Users, Clock, Mic, Star, Timer, Eye, Printer, Share, Settings,
  Sparkles, Save, Type, AlignLeft, Bold, Italic, List, 
  Presentation, FileDown, Volume2, BarChart, MessageSquare, Copy,
  ChevronDown, ChevronUp, Maximize, Minimize, PaintBucket, Languages,
  PenTool, RefreshCw, Archive, FolderOpen, UserPlus, GitBranch,
  ThumbsUp, TrendingUp, Database, Highlighter, Smartphone, X, Send,
  ChevronLeft, ChevronRight, PanelLeftOpen, PanelRightOpen,
  Maximize2, Minimize2, BarChart3, Award, AlertCircle, ArrowLeft,
  ListOrdered, Heading1, Heading2, Heading3, Quote, Link, Image,
  Zap, Globe, Menu, SidebarOpen, SidebarClose, Layout, Heart,
  Bookmark, Tag, MapPin, Music, Palette, CheckCircle2, Circle,
  GripVertical, Trash, Edit2, MoreVertical, Brain
} from "lucide-react";
import { format } from 'date-fns';
import { logger } from '@/lib/research-lab/logger';

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

const SermonsContent = () => {
  useSEO(SEO_CONFIG.SERMONS);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get sermon AI context - with defensive error handling
  let sermonAI;
  try {
    sermonAI = useSermonAI();
  } catch (error) {
    logger.error('SermonsContent: SermonAI context error', error, 'sermons');
    // Provide fallback functions if context is unavailable
    sermonAI = {
      state: {
        currentContent: '',
        sermonTitle: '',
        scriptureReference: '',
        mainPoints: [],
        outline: [],
        conversationHistory: [],
        analysisResults: null,
        suggestions: [],
        isLoading: false,
      },
      updateContent: () => {},
      updateTitle: () => {},
      updateScriptureReference: () => {},
      updateMainPoints: () => {},
      updateOutline: () => {},
      addConversationMessage: () => {},
      clearConversationHistory: () => {},
      updateAnalysisResults: () => {},
      addSuggestion: () => {},
      removeSuggestion: () => {},
      clearSuggestions: () => {},
      setLoading: () => {},
    };
  }
  
  // Extract methods from sermonAI context safely
  const updateContent = sermonAI?.updateContent || (() => {});
  const updateTitle = sermonAI?.updateTitle || (() => {});
  const updateScriptureReference = sermonAI?.updateScriptureReference || (() => {});
  const updateMainPoints = sermonAI?.updateMainPoints || (() => {});
  const isMobile = useIsMobile();
  
  // View states
  const [viewMode, setViewMode] = useState<'dashboard' | 'editor' | 'view'>('dashboard');
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Sync context and local state when sermon changes
  useEffect(() => {
    if (selectedSermon) {
      const sermonContent = selectedSermon.content || '';
      const sermonTitle = selectedSermon.title || '';
      const sermonScriptureRef = selectedSermon.scripture_reference || '';
      
      // Update local state
      setContent(sermonContent);
      setTitle(sermonTitle);
      setScriptureRefs(sermonScriptureRef);
      
      // Update context
      updateContent(sermonContent);
      updateTitle(sermonTitle);
      updateScriptureReference(sermonScriptureRef);
      updateMainPoints(selectedSermon.main_points || []);
    } else {
      // Clear state when no sermon is selected
      setContent('');
      setTitle('');
      setScriptureRefs('');
    }
  }, [selectedSermon, updateContent, updateTitle, updateScriptureReference, updateMainPoints]);
  
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
  
  // AI features
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [seriesFilter, setSeriesFilter] = useState("all");
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Enhanced UI states
  const [showBibleDialog, setShowBibleDialog] = useState(false);
  const [customOutline, setCustomOutline] = useState<OutlineItem[]>([]);
  const [newOutlineItem, setNewOutlineItem] = useState('');
  const [sermonTags, setSermonTags] = useState<string[]>([]);
  const [sermonMood, setSermonMood] = useState<'inspiring' | 'challenging' | 'comforting' | 'teaching' | ''>('');
  const [targetAudience, setTargetAudience] = useState<string>('');
  
  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
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
    if (user?.id) {
      // Load data asynchronously - errors are handled within each function
      loadSermons().catch(error => {
        logger.error('Error in loadSermons', error, 'sermons');
      });
      loadBooks().catch(error => {
        logger.error('Error in loadBooks', error, 'sermons');
      });
    }
  }, [user?.id]);

  useEffect(() => {
    calculateStats();
  }, [sermons, calculateStats]);

  const loadSermons = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sermons')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        logger.error('Supabase error loading sermons', error, 'sermons');
        
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
      logger.error('Error loading sermons', error, 'sermons');
      
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
      if (bibleBooks && Array.isArray(bibleBooks) && bibleBooks.length > 0) {
        setBooks(bibleBooks);
        setSelectedBook(bibleBooks[0]);
        loadChapter(bibleBooks[0], 1);
      }
    } catch (error: any) {
      logger.error('Error loading Bible books', error, 'sermons');
      toast({
        title: "Error",
        description: error?.message || "Failed to load Bible books",
        variant: "destructive"
      });
    }
  };

  const loadChapter = async (book: BibleBook, chapter: number) => {
    if (!book || !chapter) return;
    
    setBibleLoading(true);
    try {
      const language = selectedTranslation === 'TAMIL' ? 'tamil' : 'english';
      const chapterVerses = await getChapterVerses(book.name, chapter, language, selectedTranslation);
      if (chapterVerses && Array.isArray(chapterVerses)) {
        setVerses(chapterVerses);
        setSelectedChapter(chapter);
      }
    } catch (error: any) {
      logger.error('Error loading chapter', error, 'sermons');
      toast({
        title: "Error",
        description: error?.message || "Failed to load Bible chapter",
        variant: "destructive"
      });
    } finally {
      setBibleLoading(false);
    }
  };

  const handleSaveSermon = useCallback(async (isAutoSave = false) => {
    if (!user) return;
    
    // Use selectedSermon's title/content if available, otherwise use state
    const currentTitle = selectedSermon?.title || title || 'Untitled Sermon';
    const currentContent = selectedSermon?.content || content || '';
    
    if (!currentTitle.trim() && !currentContent.trim()) return;

    if (!isAutoSave) setSaving(true);
    
    try {
      const sermonData = {
        title: currentTitle,
        content: currentContent,
        scripture_reference: selectedSermon?.scripture_reference || scriptureRefs || null,
        scripture_references: (selectedSermon?.scripture_reference || scriptureRefs) ? (selectedSermon?.scripture_reference || scriptureRefs).split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        notes: selectedSermon?.private_notes || privateNotes || null,
        private_notes: selectedSermon?.private_notes || privateNotes || null,
        tags: (selectedSermon?.tags || tags) ? ((Array.isArray(selectedSermon?.tags) ? selectedSermon.tags.join(',') : selectedSermon?.tags) || tags).split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        status: selectedSermon?.status || status,
        series_name: selectedSermon?.series_name || seriesName || null,
        language: (selectedSermon?.language || 'english') as const,
        category: selectedSermon?.category || 'general',
        is_draft: (selectedSermon?.status || status) === 'draft',
        ai_generated: selectedSermon?.ai_generated || false,
        template_type: selectedSermon?.template_type || null,
        // Don't set word_count and estimated_time manually - let database triggers handle it
        updated_at: new Date().toISOString()
      };

      let savedSermon;

      if (selectedSermon && selectedSermon.id) {
        // Update existing sermon
        const { data, error } = await supabase
          .from('sermons')
          .update(sermonData)
          .eq('id', selectedSermon.id)
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) {
          logger.error('Error updating sermon', error, 'sermons');
          
          // Handle specific database column issues
          if (error.message?.includes('column') && error.message?.includes('does not exist')) {
            const missingColumn = error.message.match(/column "([^"]+)"/)?.[1];
            logger.warn(`Missing column detected: ${missingColumn}`, undefined, 'sermons');
            
            // Retry with basic data only
            const basicData = {
              title: currentTitle,
              content: currentContent,
              scripture_reference: selectedSermon?.scripture_reference || scriptureRefs || null,
              updated_at: new Date().toISOString()
            };
            
            const { data: retryData, error: retryError } = await supabase
              .from('sermons')
              .update(basicData)
              .eq('id', selectedSermon.id)
              .eq('user_id', user.id)
              .select()
              .single();
              
            if (retryError) {
              throw new Error(retryError.message || 'Failed to update sermon even with basic data');
            }
            
            savedSermon = retryData;
          } else if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
            throw new Error('You do not have permission to update this sermon.');
          } else {
            throw new Error(error.message || 'Failed to update sermon');
          }
        } else {
          savedSermon = data;
        }
        
        // Update the sermons list
        if (savedSermon) {
          setSelectedSermon(savedSermon);
        }
      } else {
        // Create new sermon
        const { data, error } = await supabase
          .from('sermons')
          .insert([{ 
            ...sermonData,
            user_id: user.id,
            created_at: new Date().toISOString() 
          }])
          .select()
          .single();
        
        if (error) {
          logger.error('Error creating sermon', error, 'sermons');
          
          // Handle specific database column issues
          if (error.message?.includes('column') && error.message?.includes('does not exist')) {
            const missingColumn = error.message.match(/column "([^"]+)"/)?.[1];
            logger.warn(`Missing column detected: ${missingColumn}`, undefined, 'sermons');
            
            // Retry with basic data only (minimal required fields)
            const basicData = {
              user_id: user.id,
              title: currentTitle.trim(),
              content: currentContent.trim(),
              scripture_reference: (selectedSermon?.scripture_reference || scriptureRefs)?.trim() || null,
              status: (selectedSermon?.status || status) || 'draft',
              is_draft: ((selectedSermon?.status || status) || 'draft') === 'draft',
              language: 'english',
              category: 'general',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            const { data: retryData, error: retryError } = await supabase
              .from('sermons')
              .insert([basicData])
              .select()
              .single();
              
            if (retryError) {
              throw new Error(retryError.message || 'Failed to create sermon even with basic data');
            }
            
            savedSermon = retryData;
          } else if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
            throw new Error('You do not have permission to create sermons. Please sign out and sign back in.');
          } else if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
            throw new Error('Database table is missing. Please contact support.');
          } else {
            throw new Error(error.message || 'Failed to create sermon');
          }
        } else {
          savedSermon = data;
        }
        
        // Update the sermons list for new sermon
        if (savedSermon) {
          setSelectedSermon(savedSermon);
        }
      }

      // Update sermons list once after save (remove duplicate updates)
      if (savedSermon) {
        setSermons(prev => {
          if (selectedSermon?.id) {
            // Update existing sermon in list
            return prev.map(s => s.id === selectedSermon.id ? savedSermon : s);
          } else {
            // Add new sermon to list
            return [savedSermon, ...prev];
          }
        });
      }

      if (!isAutoSave && savedSermon) {
        toast({
          title: "Success",
          description: `Sermon ${selectedSermon?.id ? 'updated' : 'saved'} successfully`,
        });
      }
    } catch (error: any) {
      logger.error('Error saving sermon', error, 'sermons');
      
      // Provide more specific error messages
      let errorMessage = "Failed to save sermon. Please try again.";
      if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
        errorMessage = "You don't have permission to save sermons. Please sign out and sign back in.";
      } else if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        errorMessage = "Database table is missing. Please contact support.";
      } else if (error.message?.includes('column') && error.message?.includes('does not exist')) {
        errorMessage = "Database schema issue detected. Some fields may not be saved.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      if (!isAutoSave) setSaving(false);
    }
  }, [user, title, content, scriptureRefs, privateNotes, tags, status, seriesName, selectedSermon, toast]);

  // Auto-save functionality - use ref to avoid stale closures
  const handleSaveSermonRef = useRef(handleSaveSermon);
  useEffect(() => {
    handleSaveSermonRef.current = handleSaveSermon;
  }, [handleSaveSermon]);

  useEffect(() => {
    if (autoSave && selectedSermon && selectedSermon.id && (selectedSermon.title || selectedSermon.content)) {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
      autoSaveRef.current = setTimeout(() => {
        handleSaveSermonRef.current(true);
      }, 2000);
    }
    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [selectedSermon?.title, selectedSermon?.content, autoSave, selectedSermon?.id]);

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
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to delete sermons.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('sermons')
        .delete()
        .eq('id', sermonId)
        .eq('user_id', user.id);

      if (error) {
        logger.error('Error deleting sermon', error, 'sermons');
        if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
          throw new Error('You do not have permission to delete this sermon.');
        }
        throw new Error(error.message || 'Failed to delete sermon');
      }

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
        setViewMode('dashboard');
      }

      toast({
        title: "Success",
        description: "Sermon deleted successfully",
      });
    } catch (error: any) {
      logger.error('Error deleting sermon', error, 'sermons');
      toast({
        title: "Error",
        description: error.message || "Failed to delete sermon. Please try again.",
        variant: "destructive"
      });
    }
  };

  const insertVerseIntoSermon = (verse: BibleVerse) => {
    const verseText = `<blockquote>"${verse.text}"<br>— ${verse.book_name} ${verse.chapter}:${verse.verse}</blockquote>`;
    
    if (editorRef.current && selectedSermon) {
      const editor = editorRef.current;
      editor.focus();
      const selection = window.getSelection();
      
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = verseText;
        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
        range.insertNode(fragment);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Update content after insertion
        const newContent = editor.innerHTML;
        setSelectedSermon(prev => prev ? { ...prev, content: newContent } : null);
        updateContent(newContent);
      } else {
        // Fallback: append to end
        const currentContent = selectedSermon.content || '';
        const newContent = currentContent + (currentContent ? '<br>' : '') + verseText;
        setSelectedSermon(prev => prev ? { ...prev, content: newContent } : null);
        updateContent(newContent);
        
        // Update editor content
        if (editor) {
          editor.innerHTML = newContent;
        }
      }
    }
    
    setShowBibleDialog(false);
    toast({
      title: "✨ Verse Added",
      description: `${verse.book_name} ${verse.chapter}:${verse.verse} added to your sermon`,
    });
  };

  const searchBible = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setBibleLoading(true);
    try {
      // Use the optimized searchVerses function instead of manual search
      // This prevents memory issues and provides better results
      const searchResults = await searchVerses(
        trimmedQuery,
        selectedTranslation === 'TAMIL' ? 'tamil' : 'english',
        undefined, // Search all books
        selectedTranslation,
        {
          maxResults: 50, // Limit results to prevent memory issues
          fuzzyEnabled: false // Disable fuzzy for performance
        }
      );
      
      // Also check current loaded verses for instant results
      const currentResults = verses.filter(verse => 
        verse.text.toLowerCase().includes(trimmedQuery.toLowerCase())
      );
      
      // Combine and deduplicate
      const allResults = [...currentResults, ...searchResults];
      const uniqueResults = allResults.filter((verse, index, self) => 
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
      }).slice(0, 50); // Limit to 50 results
      
      setSearchResults(sortedResults);
    } catch (error) {
      logger.error('Error searching Bible', error, 'sermons');
      toast({
        title: "Search Error",
        description: error instanceof Error ? error.message : "Failed to search the Bible. Please try again.",
        variant: "destructive"
      });
    } finally {
      setBibleLoading(false);
    }
  };

  // Removed old sendAIMessage function - now using comprehensive AI Assistant component

  const handleFormatText = (format: string, formattedText?: string) => {
    if (!editorRef.current || !(editorRef.current instanceof HTMLDivElement)) return;

    const editor = editorRef.current;
    const selection = window.getSelection();
    
    if (!selection || selection.rangeCount === 0) {
      // No selection, just insert formatted text at cursor
      editor.focus();
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    let replacement = '';
    switch (format) {
      case 'bold':
        replacement = `<strong>${selectedText || 'bold text'}</strong>`;
        break;
      case 'italic':
        replacement = `<em>${selectedText || 'italic text'}</em>`;
        break;
      case 'heading':
        replacement = `<h2>${selectedText || 'Heading'}</h2>`;
        break;
      case 'list':
        replacement = `<ul><li>${selectedText || 'List item'}</li></ul>`;
        break;
      case 'quote':
        replacement = `<blockquote>${selectedText || 'Quote'}</blockquote>`;
        break;
      default:
        if (formattedText) replacement = formattedText;
        else replacement = selectedText;
        break;
    }

    range.deleteContents();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = replacement;
    const fragment = document.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    range.insertNode(fragment);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Update content
    const newContent = editor.innerHTML;
    const currentContent = selectedSermon?.content || content;
    setSelectedSermon(prev => prev ? { ...prev, content: newContent } : null);
    setContent(newContent);
    updateContent(newContent);
  };

  const handleExportPDF = useCallback(async () => {
    if (!selectedSermon) {
      toast({
        title: "No sermon selected",
        description: "Please select a sermon to export",
        variant: "destructive"
      });
      return;
    }

    try {
      // Dynamically import jsPDF
      const { default: jsPDF } = await import('jspdf');
      
      const sermonTitle = selectedSermon.title || 'Untitled Sermon';
      const sermonContent = selectedSermon.content || '';
      const scriptureRef = selectedSermon.scripture_reference || '';
      const sermonDate = selectedSermon.sermon_date ? format(new Date(selectedSermon.sermon_date), 'MMMM d, yyyy') : '';
      const congregation = selectedSermon.congregation || '';

      // Strip HTML tags for plain text
      const stripHtml = (html: string) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
      };

      const textContent = stripHtml(sermonContent);

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      const titleLines = pdf.splitTextToSize(sermonTitle, maxWidth);
      pdf.text(titleLines, margin, yPosition);
      yPosition += titleLines.length * 8 + 5;

      // Metadata
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      if (scriptureRef) {
        pdf.text(`Scripture: ${scriptureRef}`, margin, yPosition);
        yPosition += 6;
      }
      if (sermonDate) {
        pdf.text(`Date: ${sermonDate}`, margin, yPosition);
        yPosition += 6;
      }
      if (congregation) {
        pdf.text(`Location: ${congregation}`, margin, yPosition);
        yPosition += 6;
      }
      yPosition += 5;

      // Content
      pdf.setFontSize(12);
      const contentLines = pdf.splitTextToSize(textContent, maxWidth);
      
      contentLines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Save PDF
      const fileName = `${sermonTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Export complete",
        description: "Sermon exported as PDF",
      });
    } catch (error: any) {
      logger.error('Export error', error, 'sermons');
      toast({
        title: "Export failed",
        description: error?.message || "Failed to export sermon",
        variant: "destructive"
      });
    }
  }, [selectedSermon, toast]);

  const handleExportSermon = (format: 'txt' | 'markdown' | 'html' | 'pdf') => {
    if (format === 'pdf') {
      handleExportPDF();
      return;
    }
    
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
    
    toast({
      title: "Export Complete",
      description: `Sermon exported as ${format.toUpperCase()}`,
    });
  };

  const handleInsertQuickText = (text: string) => {
    if (editorRef.current && editorRef.current instanceof HTMLDivElement) {
      const editor = editorRef.current;
      editor.focus();
      const selection = window.getSelection();
      
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Update content after insertion
        const newContent = editor.innerHTML;
        setSelectedSermon(prev => prev ? { ...prev, content: newContent } : null);
        updateContent(newContent);
      } else {
        // Fallback: append to end
        const currentContent = selectedSermon?.content || '';
        const newContent = currentContent + (currentContent ? '<br>' : '') + text;
        setSelectedSermon(prev => prev ? { ...prev, content: newContent } : null);
        updateContent(newContent);
        
        // Update editor content
        editor.innerHTML = newContent;
      }
    }
  };

  // Filter sermons with debounced search
  const filteredSermons = useMemo(() => {
    return sermons.filter(sermon => {
      const matchesSearch = !debouncedSearchQuery || 
        sermon.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        (sermon.content && sermon.content.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || sermon.status === statusFilter;
      const matchesSeries = seriesFilter === 'all' || sermon.series_name === seriesFilter;
      
      return matchesSearch && matchesStatus && matchesSeries;
    });
  }, [sermons, debouncedSearchQuery, statusFilter, seriesFilter]);

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
    if (editorRef.current && editorRef.current instanceof HTMLDivElement) {
      const editor = editorRef.current;
      const editorContent = editor.textContent || editor.innerText || '';
      const index = editorContent.indexOf(content);
      
      if (index !== -1) {
        editor.focus();
        
        // Create a range and select the text
        const range = document.createRange();
        const walker = document.createTreeWalker(
          editor,
          NodeFilter.SHOW_TEXT,
          null
        );
        
        let charCount = 0;
        let startNode: Node | null = null;
        let endNode: Node | null = null;
        let startOffset = 0;
        let endOffset = 0;
        
        while (walker.nextNode()) {
          const node = walker.currentNode;
          const nodeLength = node.textContent?.length || 0;
          
          if (!startNode && charCount + nodeLength >= index) {
            startNode = node;
            startOffset = index - charCount;
          }
          
          if (!endNode && charCount + nodeLength >= index + content.length) {
            endNode = node;
            endOffset = index + content.length - charCount;
            break;
          }
          
          charCount += nodeLength;
        }
        
        if (startNode && endNode) {
          try {
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);
            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(range);
              
              // Scroll into view
              range.getBoundingClientRect();
              editor.scrollTop = Math.max(0, editor.scrollTop - 100);
            }
          } catch (e) {
            logger.error('Error scrolling to outline item', e, 'sermons');
          }
        }
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

  // If in view mode, show the preaching view
  if (viewMode === 'view' && selectedSermon) {
    return (
      <SermonViewMode
        sermon={selectedSermon}
        onClose={() => setViewMode('editor')}
      />
    );
  }

  // If in editor mode, show the enhanced sermon editor
  if (viewMode === 'editor' && selectedSermon) {
    return (
      <MobileOptimizedLayout className="bg-gray-50">
        <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-screen'} bg-gray-50 flex flex-col overflow-hidden`}>
          {/* Clean Header - Mobile Optimized */}
          <div className="border-b bg-white px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 shadow-sm border-gray-200 flex-shrink-0 z-30">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 flex-1 min-w-0">
              <Button
                variant="ghost"
                size={isMobile ? "sm" : "sm"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleBackToDashboard();
                }}
                className="hover:bg-orange-50 text-gray-700 flex-shrink-0 h-8 sm:h-9 px-2 sm:px-3 touch-manipulation min-h-[44px] sm:min-h-0"
              >
                <ArrowLeft className="h-4 w-4" />
                {!isMobile && <span className="ml-2 hidden sm:inline">Back to Sermons</span>}
              </Button>
              {!isMobile && <Separator orientation="vertical" className="h-6 hidden md:block" />}
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0 flex-1">
                <div className="p-1.5 sm:p-2 bg-orange-600 rounded-lg flex-shrink-0">
                  <PenTool className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <Input
                    value={selectedSermon?.title || title || ''}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      if (selectedSermon) {
                        setSelectedSermon({ ...selectedSermon, title: newTitle });
                        updateTitle(newTitle);
                      } else {
                        setTitle(newTitle);
                        updateTitle(newTitle);
                      }
                    }}
                    placeholder="Enter sermon title..."
                    className="text-sm sm:text-base md:text-xl font-semibold border-0 focus:ring-0 focus-visible:ring-0 p-0 h-auto bg-transparent"
                    style={{ fontWeight: 600 }}
                  />
                  <p className="text-xs text-gray-500 truncate hidden sm:block mt-0.5">
                    {selectedSermon?.scripture_reference || 'No scripture reference'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0 flex-wrap">
              {/* Sermon Metadata - Place, Date, Stats */}
              {selectedSermon && (
                <>
                  {selectedSermon.congregation && (
                    <Badge variant="outline" className="hidden sm:flex items-center gap-1 h-8 px-2 text-xs">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate max-w-[100px]">{selectedSermon.congregation}</span>
                    </Badge>
                  )}
                  {selectedSermon.sermon_date && (
                    <Badge variant="outline" className="hidden md:flex items-center gap-1 h-8 px-2 text-xs">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(selectedSermon.sermon_date), 'MMM d, yyyy')}
                    </Badge>
                  )}
                  {selectedSermon.word_count && (
                    <Badge variant="outline" className="hidden lg:flex items-center gap-1 h-8 px-2 text-xs">
                      <Type className="h-3 w-3" />
                      {selectedSermon.word_count} words
                    </Badge>
                  )}
                  {selectedSermon.estimated_time && (
                    <Badge variant="outline" className="hidden lg:flex items-center gap-1 h-8 px-2 text-xs">
                      <Clock className="h-3 w-3" />
                      {Math.round(selectedSermon.estimated_time)} min
                    </Badge>
                  )}
                </>
              )}
              
              {/* Bible Reference Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="hover:bg-blue-50 h-8 sm:h-9 touch-manipulation min-h-[44px] sm:min-h-0" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowBibleDialog(true);
                }}
              >
                <BookOpen className="h-4 w-4 sm:mr-2" />
                {!isMobile && <span>Bible</span>}
              </Button>
              
              {/* Bible Dialog */}
              <Dialog open={showBibleDialog} onOpenChange={setShowBibleDialog}>
                <DialogContent className={`${isMobile ? 'max-w-full w-full h-full max-h-full m-0 rounded-none' : 'max-w-[95vw] w-full h-[95vh] max-h-[95vh]'}`}>
                  <DialogHeader className="border-b pb-3 md:pb-4">
                    <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
                      <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                      <span className="hidden sm:inline">Bible Reference - Enhanced Search & Study</span>
                      <span className="sm:hidden">Bible Reference</span>
                    </DialogTitle>
                    <p className="text-xs md:text-sm text-gray-600 hidden sm:block">Search verses, browse chapters, and add references to your sermon</p>
                  </DialogHeader>
                  
                  <div className="flex-1 flex flex-col space-y-3 md:space-y-4 overflow-hidden">
                    {/* Enhanced Controls */}
                    <div className="flex flex-col gap-3 md:gap-4 p-2 bg-gray-50 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 md:gap-4 items-stretch sm:items-center">
                        {/* Translation Selector - Now includes Tamil */}
                        <div className="flex flex-col gap-1 flex-1 sm:flex-initial">
                          <label className="text-xs font-medium text-gray-700">Translation</label>
                          <Select value={selectedTranslation} onValueChange={(value: TranslationCode) => {
                            setSelectedTranslation(value);
                            if (selectedBook) {
                              loadChapter(selectedBook, selectedChapter);
                            }
                          }}>
                            <SelectTrigger className="w-full sm:w-56">
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
                        <div className="flex flex-col gap-1 flex-1 sm:flex-initial">
                          <label className="text-xs font-medium text-gray-700">Book</label>
                      <Select value={selectedBook?.name || ''} onValueChange={(bookName) => {
                        const book = books.find(b => b.name === bookName);
                        if (book) {
                          setSelectedBook(book);
                          setSelectedChapter(1);
                          loadChapter(book, 1);
                        }
                      }}>
                            <SelectTrigger className="w-full sm:w-56">
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
                          <div className="flex flex-col gap-1 flex-1 sm:flex-initial">
                            <label className="text-xs font-medium text-gray-700">Chapter</label>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              loadChapter(selectedBook, Math.max(1, selectedChapter - 1));
                            }}
                            disabled={selectedChapter <= 1}
                                className="h-9 flex-shrink-0 touch-manipulation min-h-[44px] sm:min-h-0"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Select value={selectedChapter.toString()} onValueChange={(value) => loadChapter(selectedBook, parseInt(value))}>
                                <SelectTrigger className="flex-1 sm:w-32 h-9">
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
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              loadChapter(selectedBook, Math.min(selectedBook.chapters, selectedChapter + 1));
                            }}
                            disabled={selectedChapter >= selectedBook.chapters}
                                className="h-9 flex-shrink-0 touch-manipulation min-h-[44px] sm:min-h-0"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                            </div>
                        </div>
                      )}
                    </div>

                                             {/* Enhanced Search */}
                       <div className="flex flex-col gap-2 md:gap-3">
                         <div className="flex gap-2">
                           <div className="flex-1 relative">
                             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                             <Input
                               placeholder={isMobile ? "Search verses..." : "Search verses... (e.g., 'love', 'faith', 'hope')"}
                               value={bibleSearchQuery}
                               onChange={(e) => {
                                 setBibleSearchQuery(e.target.value);
                                 searchBible(e.target.value);
                               }}
                               className="pl-10 border-gray-300 focus:border-blue-500 text-sm"
                             />
                           </div>
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={(e) => {
                               e.preventDefault();
                               e.stopPropagation();
                               setBibleSearchQuery('');
                               setSearchResults([]);
                             }}
                             disabled={!bibleSearchQuery}
                             className="flex-shrink-0 touch-manipulation min-h-[44px] sm:min-h-0"
                           >
                             {isMobile ? <X className="h-4 w-4" /> : "Clear"}
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
                                 className="h-7 px-3 text-xs hover:bg-blue-50 hover:border-blue-300 touch-manipulation min-h-[44px] sm:min-h-0"
                                 onClick={(e) => {
                                   e.preventDefault();
                                   e.stopPropagation();
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
                                      className="p-3 sm:p-4 rounded-lg border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50 cursor-pointer group transition-all duration-200 shadow-sm touch-manipulation"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                insertVerseIntoSermon(verse);
                              }}
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
                                      className="group p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200 hover:shadow-md touch-manipulation"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        insertVerseIntoSermon(verse);
                                      }}
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
                size={isMobile ? "sm" : "sm"}
                onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                className="hover:bg-gray-100 h-8 sm:h-9 w-8 sm:w-9 p-0"
                title={leftPanelOpen ? "Close panel" : "Open panel"}
              >
                {leftPanelOpen ? <PanelRightOpen className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </Button>

              {!isMobile && (
                <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsFullscreen(!isFullscreen);
                }}
                className="touch-manipulation min-h-[44px] sm:min-h-0"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
                  <Separator orientation="vertical" className="h-6" />
                </>
              )}
              {/* Auto-save indicator */}
              {autoSave && selectedSermon && (
                <Badge variant="outline" className="hidden sm:flex items-center gap-1 h-8 px-2 text-xs text-green-600 border-green-200 bg-green-50">
                  <CheckCircle2 className="h-3 w-3" />
                  Auto-saved
                </Badge>
              )}

              {/* View Mode Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setViewMode(viewMode === 'editor' ? 'view' : 'editor');
                }}
                className="h-8 sm:h-9 touch-manipulation min-h-[44px] sm:min-h-0"
              >
                <Eye className="h-4 w-4 sm:mr-2" />
                {!isMobile && <span>View</span>}
              </Button>

              {/* Export PDF Button */}
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleExportPDF();
                }}
                size={isMobile ? "sm" : "default"}
                className="bg-orange-600 hover:bg-orange-700 text-white h-8 sm:h-9 px-2 sm:px-3 md:px-4 touch-manipulation min-h-[44px] sm:min-h-0"
              >
                <FileDown className="h-4 w-4 sm:mr-2" />
                {!isMobile && <span>Export</span>}
                {isMobile && <span className="ml-1 text-xs">PDF</span>}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative h-full">
          {/* AI Research Panel (Left Side - SermonAI-style) */}
          {leftPanelOpen && (
            <>
              {isMobile && (
                <div 
                  className="fixed inset-0 bg-black/50 z-40 touch-none"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setLeftPanelOpen(false);
                  }}
                />
              )}
              <div className={`${isMobile ? 'fixed left-0 top-0 bottom-0 z-50 w-[95vw] max-w-md' : 'w-[380px] flex-shrink-0'} border-r bg-gray-50 flex flex-col shadow-lg ${isMobile ? 'animate-in slide-in-from-left' : ''} h-full overflow-hidden`}>
                <AIResearchPanel 
                  selectedSermon={selectedSermon}
                  onUpdateSermon={(updates) => {
                    if (selectedSermon) {
                      setSelectedSermon(prev => prev ? { ...prev, ...updates } : null);
                      // Auto-save will handle the database update
                    }
                  }}
                />
              </div>
            </>
          )}

          {/* Legacy Left Panel (Hidden by default, can be toggled separately if needed) */}
          {false && leftPanelOpen && (
            <>
              {isMobile && (
                <div 
                  className="fixed inset-0 bg-black/50 z-40 touch-none"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setLeftPanelOpen(false);
                  }}
                />
              )}
              <div className={`${isMobile ? 'fixed left-0 top-0 bottom-0 z-50 w-[90vw] max-w-sm' : 'w-80'} border-r bg-white flex flex-col shadow-lg ${isMobile ? 'animate-in slide-in-from-left' : ''}`}>
              <div className="p-2 sm:p-4 border-b flex items-center justify-between bg-gray-50">
                <h2 className="text-sm sm:text-base font-semibold text-gray-900">Sermon Details</h2>
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLeftPanelOpen(false);
                    }}
                    className="h-8 w-8 p-0 touch-manipulation min-h-[44px] min-w-[44px]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Tabs defaultValue="details" className="flex-1 flex flex-col">
                <TabsList className="grid grid-cols-2 m-2 sm:m-4 mb-0 bg-gray-100 h-9 sm:h-10">
                  <TabsTrigger value="details" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm">Details</TabsTrigger>
                  <TabsTrigger value="outline" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm">Outline</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="flex-1 p-2 sm:p-4 m-0 overflow-y-auto">
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
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addOutlineItem();
                          }}
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 touch-manipulation min-h-[44px] sm:min-h-0"
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
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleOutlineItem(item.id);
                                  }}
                                  className="p-1 h-6 w-6 touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                                >
                                  {item.completed ? 
                                    <CheckCircle2 className="h-4 w-4 text-green-600" /> : 
                                    <Circle className="h-4 w-4 text-gray-400" />
                                  }
                                </Button>
                                <span className={`text-sm flex-1 ${item.completed ? 'line-through text-gray-500' : ''}`}>
                                  {item.title}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeOutlineItem(item.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 h-6 w-6 text-red-500 hover:text-red-700 touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
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
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toggleOutlineItem(subItem.id, item.id);
                                    }}
                                    className="p-1 h-6 w-6 touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                                  >
                                    {subItem.completed ? 
                                      <CheckCircle2 className="h-4 w-4 text-green-600" /> : 
                                      <Circle className="h-4 w-4 text-gray-400" />
                                    }
                                  </Button>
                                  <span className={`text-sm flex-1 ${subItem.completed ? 'line-through text-gray-500' : ''}`}>
                                    {subItem.title}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      removeOutlineItem(subItem.id, item.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 h-6 w-6 text-red-500 hover:text-red-700 touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
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
            </>
          )}

          {/* Main Editor */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            <SermonToolbar
              editorRef={editorRef}
              wordCount={selectedSermon?.content ? (selectedSermon.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w.length > 0).length) : 0}
              estimatedTime={Math.ceil((selectedSermon?.content ? (selectedSermon.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w.length > 0).length) : 0) / 150)}
              sermonContent={selectedSermon?.content || ''}
              sermonTitle={selectedSermon?.title || ''}
              onExport={handleExportSermon}
              onInsertQuickText={handleInsertQuickText}
              isRichText={true}
            />
            <div className={`flex-1 flex flex-col p-2 sm:p-3 md:p-4 ${focusMode ? 'bg-white' : ''} overflow-hidden relative min-h-0`}>
              <div className={`w-full flex-1 overflow-auto ${focusMode ? 'bg-white/90 backdrop-blur-sm shadow-xl rounded-xl p-3 sm:p-4 md:p-8 border border-gray-200' : 'p-2 sm:p-3 md:p-4'}`}
                style={{ 
                  maxWidth: focusMode ? (isMobile ? '100%' : '800px') : '100%',
                  margin: focusMode && !isMobile ? '0 auto' : '0',
                }}
              >
                <RichTextEditor
                  ref={editorRef}
                  value={selectedSermon?.content || ''}
                  onChange={(html) => {
                    setSelectedSermon(prev => prev ? { ...prev, content: html } : null);
                    updateContent(html);
                  }}
                  placeholder="Start writing your sermon... Let the Holy Spirit guide your words. ✨"
                  className="w-full min-h-full outline-none"
                  style={{ 
                    fontSize: isMobile ? `${Math.max(16, fontSize)}px` : `${fontSize}px`,
                    lineHeight: lineHeight,
                  }}
                />
                
                {/* Text Selection Menu */}
                <TextSelectionMenu
                  editorRef={editorRef}
                  onReplaceText={(originalText, newText) => {
                    if (editorRef.current && selectedSermon) {
                      editorRef.current.focus();
                      const selection = window.getSelection();
                      if (selection && selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        range.deleteContents();
                        const textNode = document.createTextNode(newText);
                        range.insertNode(textNode);
                        range.setStartAfter(textNode);
                        range.collapse(false);
                        selection.removeAllRanges();
                        selection.addRange(range);
                        
                        // Update content
                        const newContent = editorRef.current.innerHTML;
                        setSelectedSermon(prev => prev ? { ...prev, content: newContent } : null);
                        updateContent(newContent);
                      } else {
                        // Fallback: replace in content
                        const currentContent = selectedSermon.content || '';
                        const newContent = currentContent.replace(originalText, newText);
                        setSelectedSermon(prev => prev ? { ...prev, content: newContent } : null);
                        updateContent(newContent);
                      }
                    }
                  }}
                />
              </div>
              {/* Note: SermonAutoComplete and InlineAISuggestions need to be updated to work with rich text editor */}
            </div>
            
            {/* Inline AI Assistant removed per user request */}
          </div>


        </div>
        
        {/* AI Generator Dialog */}
        <Dialog open={showAIGenerator} onOpenChange={setShowAIGenerator}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Sermon Generator
                <Badge variant="secondary" className="ml-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  ✦ Bible Aura
                </Badge>
              </DialogTitle>
            </DialogHeader>
            <SermonAIGenerator
              onSermonGenerated={(sermon) => {
                // Handle AI sermon generation
                logger.log('AI sermon generated', sermon, 'sermons');
                setShowAIGenerator(false);
                toast({
                  title: "AI Sermon Generated! ✨",
                  description: "Your AI-generated sermon is ready",
                });
              }}
              isVisible={showAIGenerator}
            />
          </DialogContent>
        </Dialog>
        
        </div>
      </MobileOptimizedLayout>
    );
  }

  // Clean and simple dashboard view
  return (
    <MobileOptimizedLayout className="bg-gray-50">
      <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-orange-600 rounded-xl">
              <PenTool className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Sermon Studio
              </h1>
              <p className="text-sm md:text-base text-gray-600">Create powerful sermons with ✦ AI assistance</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAIGenerator(true);
              }}
              size={isMobile ? "default" : "lg"}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white w-full sm:w-auto touch-manipulation min-h-[44px]"
            >
              <Brain className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              {isMobile ? "AI Generate" : "AI Generate Sermon"}
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNewSermon();
              }}
              size={isMobile ? "default" : "lg"}
              className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto touch-manipulation min-h-[44px]"
            >
              <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              New Sermon
            </Button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search sermons by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Series Filter */}
            {seriesOptions.length > 0 && (
              <Select value={seriesFilter} onValueChange={setSeriesFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Series" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Series</SelectItem>
                  {seriesOptions.map((series) => (
                    <SelectItem key={series} value={series}>
                      {series}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {/* Clear Filters Button */}
            {(searchQuery || statusFilter !== 'all' || seriesFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSearchQuery('');
                  setStatusFilter('all');
                  setSeriesFilter('all');
                }}
                className="w-full md:w-auto touch-manipulation min-h-[44px] sm:min-h-0"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
          
          {/* Results Count and Loading Indicator */}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading sermons...</span>
            </div>
          )}
          {!loading && filteredSermons.length !== sermons.length && (
            <p className="text-sm text-gray-600">
              Showing {filteredSermons.length} of {sermons.length} sermons
            </p>
          )}
        </div>

        {/* Simple Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">{stats.total}</p>
                  <p className="text-xs md:text-sm text-gray-600 truncate">Total Sermons</p>
                </div>
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-gray-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 truncate">{stats.ready}</p>
                  <p className="text-xs md:text-sm text-gray-600 truncate">Ready to Deliver</p>
                </div>
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-green-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600 truncate">{stats.delivered}</p>
                  <p className="text-xs md:text-sm text-gray-600 truncate">Delivered</p>
                </div>
                <PenTool className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-orange-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600 truncate">{stats.drafts}</p>
                  <p className="text-xs md:text-sm text-gray-600 truncate">In Progress</p>
                </div>
                <Edit3 className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-orange-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clean Sermons Grid */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border border-gray-200 animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredSermons.map((sermon) => (
            <Card key={sermon.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white cursor-default">
              <CardHeader className="pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg line-clamp-2 text-gray-900 flex-1 min-w-0">
                    {sermon.title || "Untitled Sermon"}
                  </CardTitle>
                  <div className="flex flex-col gap-2 flex-shrink-0">
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
                  <Badge variant="outline" className="text-xs border-gray-200 text-gray-600 w-fit mt-2">
                    {sermon.scripture_reference}
                      </Badge>
                    )}
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <p className="text-sm text-gray-600 line-clamp-3 mb-3 sm:mb-4 leading-relaxed">
                  {sermon.content ? sermon.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : "No content yet..."}
                </p>
                <div className="flex flex-wrap justify-between items-center text-xs text-gray-500 mb-3 sm:mb-4 gap-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{format(new Date(sermon.created_at), 'MMM d, yyyy')}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Type className="h-3 w-3 flex-shrink-0" />
                    <span>{sermon.word_count || 0} words</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span>{Math.ceil((sermon.word_count || 0) / 150)} min</span>
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEditSermon(sermon);
                    }}
                    className="flex-1 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 touch-manipulation min-h-[44px] sm:min-h-0"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                    <span className="sm:hidden">Edit</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteSermon(sermon.id);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 touch-manipulation min-h-[44px] sm:min-h-0 px-3 sm:px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSermons.length === 0 && sermons.length > 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No sermons found
            </h2>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters
            </p>
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSearchQuery('');
                setStatusFilter('all');
                setSeriesFilter('all');
              }}
              className="touch-manipulation min-h-[44px] sm:min-h-0"
            >
              Clear Filters
            </Button>
          </div>
        )}

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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNewSermon();
              }} 
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white touch-manipulation min-h-[44px]"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Sermon
            </Button>
          </div>
        )}
              </div>
        
        {/* AI Generator Dialog for Dashboard */}
        <Dialog open={showAIGenerator} onOpenChange={setShowAIGenerator}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Sermon Generator
                <Badge variant="secondary" className="ml-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  ✦ Bible Aura
                </Badge>
              </DialogTitle>
            </DialogHeader>
            <SermonAIGenerator
              onSermonGenerated={(sermon) => {
                // Handle AI sermon generation
                logger.log('AI sermon generated', sermon, 'sermons');
                setShowAIGenerator(false);
                toast({
                  title: "AI Sermon Generated! ✨",
                  description: "Your AI-generated sermon is ready",
                });
              }}
              isVisible={showAIGenerator}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MobileOptimizedLayout>
  );
};

// Wrapper component with AI Provider and Error Boundary
const Sermons = () => {
  return (
    <ErrorBoundary>
      <SermonAIProvider>
        <SermonsContent />
      </SermonAIProvider>
    </ErrorBoundary>
  );
};

export default Sermons;