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
  Maximize2, Minimize2, BarChart3, Award, AlertCircle
} from "lucide-react";
import { format } from 'date-fns';

// Interfaces
interface Sermon {
  id: string;
  title: string;
  content: string | null;
  outline: any | null;
  scripture_references: string | null;
  main_points: string[] | null;
  congregation: string | null;
  sermon_date: string | null;
  duration: number | null;
  notes: string | null;
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
  
  // Core sermon state
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
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
  const [showBiblePopup, setShowBiblePopup] = useState(false);
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
      const chapterVerses = await getChapterVerses(book.name, chapter, selectedTranslation);
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
        scripture_references: scriptureRefs,
        notes: privateNotes,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        status,
        series_name: seriesName || null,
        word_count: wordCount,
        estimated_time: estimatedTime,
        language: 'english' as const,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (selectedSermon) {
        const { error } = await supabase
          .from('sermons')
          .update(sermonData)
          .eq('id', selectedSermon.id);
        
        if (error) throw error;
        
        const updatedSermon = { ...selectedSermon, ...sermonData };
        setSelectedSermon(updatedSermon);
        setSermons(prev => prev.map(s => s.id === selectedSermon.id ? updatedSermon : s));
      } else {
        const { data, error } = await supabase
          .from('sermons')
          .insert([{ ...sermonData, created_at: new Date().toISOString() }])
          .select()
          .single();
        
        if (error) throw error;
        
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
        description: "Failed to save sermon",
        variant: "destructive"
      });
    } finally {
      if (!isAutoSave) setSaving(false);
    }
  }, [user, title, content, scriptureRefs, privateNotes, tags, status, seriesName, wordCount, estimatedTime, selectedSermon]);

  const handleNewSermon = () => {
    setSelectedSermon(null);
    setTitle("");
    setContent("");
    setScriptureRefs("");
    setPrivateNotes("");
    setTags("");
    setSeriesName("");
    setStatus('draft');
  };

  const handleEditSermon = (sermon: Sermon) => {
    setSelectedSermon(sermon);
    setTitle(sermon.title);
    setContent(sermon.content || "");
    setScriptureRefs(sermon.scripture_references || "");
    setPrivateNotes(sermon.private_notes || "");
    setTags(sermon.tags?.join(', ') || "");
    setSeriesName(sermon.series_name || "");
    setStatus(sermon.status);
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
        handleNewSermon();
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
    const verseText = `"${verse.text}" - ${verse.book_name} ${verse.chapter}:${verse.verse}`;
    
    if (editorRef.current) {
      const textarea = editorRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + verseText + content.substring(end);
      setContent(newContent);
      
      // Update cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + verseText.length, start + verseText.length);
      }, 0);
    } else {
      setContent(prev => prev + '\n' + verseText);
    }
    
    setShowBiblePopup(false);
    toast({
      title: "Verse Added",
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

  // Statistics Dashboard (when no sermon selected)
  if (!selectedSermon) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sermon Management</h1>
              <p className="text-gray-600 mt-2">Create, manage, and deliver powerful sermons with AI assistance</p>
            </div>
            <Button onClick={handleNewSermon} size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-5 w-5 mr-2" />
              New Sermon
            </Button>
          </div>

          {/* Statistics Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Sermons</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
                <div className="text-sm text-gray-600">Ready</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.delivered}</div>
                <div className="text-sm text-gray-600">Delivered</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.aiGenerated}</div>
                <div className="text-sm text-gray-600">AI Generated</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.series}</div>
                <div className="text-sm text-gray-600">Series</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.avgRating}%</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Search sermons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={seriesFilter} onValueChange={setSeriesFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Series" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Series</SelectItem>
                {seriesOptions.map(series => (
                  <SelectItem key={series} value={series}>{series}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sermon List */}
          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-8">Loading sermons...</div>
            ) : filteredSermons.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No sermons found</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first sermon</p>
                  <Button onClick={handleNewSermon}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Sermon
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredSermons.map(sermon => (
                <Card key={sermon.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{sermon.title}</h3>
                          <Badge variant={sermon.status === 'delivered' ? 'default' : 
                                        sermon.status === 'ready' ? 'secondary' : 'outline'}>
                            {sermon.status}
                          </Badge>
                          {sermon.ai_generated && (
                            <Badge variant="outline" className="text-purple-600">
                              <Bot className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {sermon.content?.substring(0, 150)}...
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Type className="h-3 w-3" />
                            {sermon.word_count} words
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {sermon.estimated_time} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(sermon.updated_at), 'MMM d, yyyy')}
                          </span>
                          {sermon.series_name && (
                            <span className="flex items-center gap-1">
                              <FolderOpen className="h-3 w-3" />
                              {sermon.series_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSermon(sermon)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSermon(sermon.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Editor Interface
  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-white flex flex-col`}>
      {/* Header */}
      <div className="border-b bg-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleNewSermon}
            className="text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Sermons
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <Input
              placeholder="Sermon Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
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
            className="bg-blue-600 hover:bg-blue-700"
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

      {/* Toolbar */}
      <SermonToolbar
        editorRef={editorRef}
        onFormatText={handleFormatText}
        wordCount={wordCount}
        estimatedTime={estimatedTime}
        sermonContent={content}
        sermonTitle={title}
        onExport={handleExportSermon}
        onInsertQuickText={handleInsertQuickText}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Sermon List */}
        {leftPanelOpen && (
          <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Recent Sermons</h3>
                <Button size="sm" variant="ghost" onClick={loadSermons}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {sermons.slice(0, 10).map(sermon => (
                  <Card
                    key={sermon.id}
                    className={`cursor-pointer transition-colors ${
                      selectedSermon?.id === sermon.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleEditSermon(sermon)}
                  >
                    <CardContent className="p-3">
                      <div className="font-medium text-sm truncate">{sermon.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {format(new Date(sermon.updated_at), 'MMM d')} • {sermon.word_count} words
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Center Panel - Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              {/* Quick Actions */}
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBiblePopup(true)}
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Add Verse
                </Button>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger className="w-32">
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

              {/* Editor */}
              <div className="space-y-4">
                <Textarea
                  ref={editorRef}
                  placeholder="Start writing your sermon..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`min-h-96 resize-none ${
                    focusMode ? 'border-none shadow-none focus-visible:ring-0' : ''
                  }`}
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: lineHeight,
                  }}
                />
                
                {/* Progress Bar */}
                {wordGoal > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progress: {wordCount}/{wordGoal} words</span>
                      <span>{Math.round((wordCount / wordGoal) * 100)}%</span>
                    </div>
                    <Progress value={(wordCount / wordGoal) * 100} className="h-2" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Bible & AI */}
        {rightPanelOpen && (
          <div className="w-96 border-l bg-gray-50">
            <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 m-2">
                <TabsTrigger value="bible">Bible</TabsTrigger>
                <TabsTrigger value="ai">AI Chat</TabsTrigger>
              </TabsList>

              {/* Bible Tab */}
              <TabsContent value="bible" className="flex-1 p-4 overflow-hidden">
                <div className="h-full flex flex-col space-y-4">
                  <div className="space-y-2">
                    <Select
                      value={selectedBook?.name || ''}
                      onValueChange={(bookName) => {
                        const book = books.find(b => b.name === bookName);
                        if (book) {
                          setSelectedBook(book);
                          loadChapter(book, 1);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select book" />
                      </SelectTrigger>
                      <SelectContent>
                        {books.map(book => (
                          <SelectItem key={book.id} value={book.name}>
                            {book.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={selectedBook?.chapters || 1}
                        value={selectedChapter}
                        onChange={(e) => {
                          const chapter = parseInt(e.target.value);
                          if (selectedBook && chapter >= 1 && chapter <= selectedBook.chapters) {
                            loadChapter(selectedBook, chapter);
                          }
                        }}
                        className="w-20"
                      />
                      <Select value={selectedTranslation} onValueChange={(value: TranslationCode) => {
                        setSelectedTranslation(value);
                        if (selectedBook) {
                          loadChapter(selectedBook, selectedChapter);
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(BIBLE_TRANSLATIONS).map(([code, name]) => (
                            <SelectItem key={code} value={code}>{name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <ScrollArea className="flex-1">
                    {bibleLoading ? (
                      <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : (
                      <div className="space-y-2">
                        {verses.map(verse => (
                          <div
                            key={`${verse.chapter}-${verse.verse}`}
                            className="p-3 bg-white rounded-lg border cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors"
                            onClick={() => insertVerseIntoSermon(verse)}
                          >
                            <div className="text-sm font-medium text-blue-600 mb-1">
                              {verse.book_name} {verse.chapter}:{verse.verse}
                            </div>
                            <div className="text-sm text-gray-700">{verse.text}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>

              {/* AI Chat Tab */}
              <TabsContent value="ai" className="flex-1 p-4 overflow-hidden">
                <div className="h-full flex flex-col">
                  <ScrollArea ref={aiScrollRef} className="flex-1 mb-4">
                    <div className="space-y-4">
                      {aiMessages.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Bot className="h-8 w-8 mx-auto mb-2" />
                          <p>Ask me about your sermon, verses, or theological questions!</p>
                        </div>
                      )}
                      {aiMessages.map(message => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-100 text-blue-900 ml-4'
                              : 'bg-gray-100 text-gray-900 mr-4'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {format(new Date(message.timestamp), 'HH:mm')}
                          </div>
                        </div>
                      ))}
                      {aiLoading && (
                        <div className="bg-gray-100 text-gray-900 mr-4 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span className="text-sm">AI is thinking...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask about your sermon..."
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendAIMessage()}
                      className="flex-1"
                    />
                    <Button
                      onClick={sendAIMessage}
                      disabled={!aiInput.trim() || aiLoading}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Editor Settings */}
            <Card className="m-4 mt-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Editor Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-save" className="text-sm">Auto-save</Label>
                  <Switch id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="focus-mode" className="text-sm">Focus mode</Label>
                  <Switch id="focus-mode" checked={focusMode} onCheckedChange={setFocusMode} />
                </div>
                <div>
                  <Label className="text-sm">Font size: {fontSize}px</Label>
                  <Slider
                    value={[fontSize]}
                    onValueChange={(value) => setFontSize(value[0])}
                    max={24}
                    min={12}
                    step={1}
                    className="mt-2"
                  />
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
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Bible Popup */}
      <Dialog open={showBiblePopup} onOpenChange={setShowBiblePopup}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Bible - Add Verse to Sermon</DialogTitle>
          </DialogHeader>
          <div className="flex h-full space-x-4">
            {/* Bible Navigation */}
            <div className="w-1/3 space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Search verses..."
                  value={bibleSearchQuery}
                  onChange={(e) => {
                    setBibleSearchQuery(e.target.value);
                    searchBible(e.target.value);
                  }}
                />
                <Select
                  value={selectedBook?.name || ''}
                  onValueChange={(bookName) => {
                    const book = books.find(b => b.name === bookName);
                    if (book) {
                      setSelectedBook(book);
                      loadChapter(book, 1);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select book" />
                  </SelectTrigger>
                  <SelectContent>
                    {books.map(book => (
                      <SelectItem key={book.id} value={book.name}>
                        {book.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectedBook && selectedChapter > 1 && loadChapter(selectedBook, selectedChapter - 1)}
                    disabled={selectedChapter <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    max={selectedBook?.chapters || 1}
                    value={selectedChapter}
                    onChange={(e) => {
                      const chapter = parseInt(e.target.value);
                      if (selectedBook && chapter >= 1 && chapter <= selectedBook.chapters) {
                        loadChapter(selectedBook, chapter);
                      }
                    }}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectedBook && selectedChapter < selectedBook.chapters && loadChapter(selectedBook, selectedChapter + 1)}
                    disabled={!selectedBook || selectedChapter >= selectedBook.chapters}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Select value={selectedTranslation} onValueChange={(value: TranslationCode) => {
                  setSelectedTranslation(value);
                  if (selectedBook) {
                    loadChapter(selectedBook, selectedChapter);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(BIBLE_TRANSLATIONS).map(([code, name]) => (
                      <SelectItem key={code} value={code}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Verses Display */}
            <div className="flex-1">
              <ScrollArea className="h-full">
                {bibleLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : (
                  <div className="space-y-2">
                    {(bibleSearchQuery ? searchResults : verses).map(verse => (
                      <div
                        key={`${verse.chapter}-${verse.verse}`}
                        className="p-4 bg-white rounded-lg border cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        onClick={() => insertVerseIntoSermon(verse)}
                      >
                        <div className="font-medium text-blue-600 mb-2">
                          {verse.book_name} {verse.chapter}:{verse.verse}
                        </div>
                        <div className="text-gray-700">{verse.text}</div>
                        <Button size="sm" className="mt-2" onClick={() => insertVerseIntoSermon(verse)}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add to Sermon
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sermons;