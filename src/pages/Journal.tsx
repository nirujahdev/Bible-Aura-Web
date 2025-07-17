import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, Plus, Edit3, Trash2, Heart, Search, Calendar as CalendarIcon, 
  FileText, Star, Bold, Italic, List, AlignLeft, Save, Share2, 
  Download, Upload, Settings, Bell, Sun, Moon, ZoomIn, ZoomOut,
  Printer, Filter, Tag, Clock, Bookmark, Eye, EyeOff, Copy,
  Archive, RefreshCw, CheckCircle, Circle, Flame, Target,
  PenTool, Hash, Layers, Globe, Lock, Users, CloudDownload,
  Timer, Calendar as CalIcon, Quote, LinkIcon, Type, Palette, Crown
} from "lucide-react";
import { PremiumFeaturePrompt } from "@/components/PremiumFeaturePrompt";
import { AutoVerseTooltip } from "@/components/VerseTooltip";

interface JournalEntry {
  id: string;
  title: string | null;
  content: string;
  mood: string | null;
  spiritual_state: string | null;
  verse_references: string[] | null;
  tags: string[];
  is_private: boolean;
  shared_with: string[];
  formatted_content: any;
  entry_date: string;
  word_count: number;
  reading_time: number;
  created_at: string;
  updated_at: string;
}

interface JournalSettings {
  fontSize: number;
  darkMode: boolean;
  autoSave: boolean;
  dailyReminder: boolean;
  reminderTime: string;
  defaultPrivacy: boolean;
  showWordCount: boolean;
}

const Journal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Core state
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry>>({
    title: "",
    content: "",
    mood: null,
    spiritual_state: null,
    verse_references: [],
    tags: [],
    is_private: true,
    entry_date: new Date().toISOString().split('T')[0]
  });
  
  // UI state
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [showVerseSearch, setShowVerseSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'calendar'>('list');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  
  // Editor state
  const [editorSettings, setEditorSettings] = useState<JournalSettings>({
    fontSize: 14,
    darkMode: false,
    autoSave: true,
    dailyReminder: true,
    reminderTime: "20:00",
    defaultPrivacy: true,
    showWordCount: true
  });
  
  // Verse search state
  const [verseSearchQuery, setVerseSearchQuery] = useState("");
  const [verseResults, setVerseResults] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Statistics state
  const [streakCount, setStreakCount] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [popularTags, setPopularTags] = useState<Array<{tag: string, count: number}>>([]);

  // Predefined data
  const moods = [
    { value: "joyful", label: "😊 Joyful", color: "bg-yellow-100 text-yellow-800" },
    { value: "peaceful", label: "😌 Peaceful", color: "bg-blue-100 text-blue-800" },
    { value: "grateful", label: "🙏 Grateful", color: "bg-green-100 text-green-800" },
    { value: "contemplative", label: "🤔 Contemplative", color: "bg-purple-100 text-purple-800" },
    { value: "challenged", label: "😰 Challenged", color: "bg-orange-100 text-orange-800" },
    { value: "hopeful", label: "✨ Hopeful", color: "bg-pink-100 text-pink-800" },
    { value: "struggling", label: "😔 Struggling", color: "bg-gray-100 text-gray-800" },
    { value: "blessed", label: "🙌 Blessed", color: "bg-indigo-100 text-indigo-800" },
    { value: "reflective", label: "💭 Reflective", color: "bg-teal-100 text-teal-800" }
  ];

  const spiritualStates = [
    "Growing closer to God", "Seeking guidance", "Feeling blessed", "In prayer",
    "Learning patience", "Finding peace", "Trusting God's plan", "Feeling distant",
    "Questioning", "Experiencing breakthrough", "Walking in faith", "Serving others",
    "Studying scripture", "Worshiping", "Fasting", "Meditating", "Celebrating"
  ];

  const commonTags = [
    "prayer", "gratitude", "struggle", "growth", "worship", "bible-study",
    "faith", "family", "work", "health", "relationships", "decisions",
    "dreams", "goals", "testimony", "breakthrough", "healing", "wisdom"
  ];

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadEntries();
      loadUserSettings();
      calculateStatistics();
    }
  }, [user]);

  // Auto-save functionality
  useEffect(() => {
    if (editorSettings.autoSave && currentEntry.content && isEditing) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        if (currentEntry.id) {
          autoSaveEntry();
        }
      }, 2000); // Auto-save after 2 seconds of inactivity
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [currentEntry.content, editorSettings.autoSave, isEditing]);

  const loadEntries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
      setTotalEntries(data?.length || 0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load journal entries",
        variant: "destructive"
      });
    }
  };

  const loadUserSettings = async () => {
    if (!user) return;
    
    // Load settings from localStorage or database
    const savedSettings = localStorage.getItem(`journal-settings-${user.id}`);
    if (savedSettings) {
      setEditorSettings(JSON.parse(savedSettings));
    }
  };

  const saveUserSettings = async (settings: JournalSettings) => {
    if (!user) return;
    
    localStorage.setItem(`journal-settings-${user.id}`, JSON.stringify(settings));
    setEditorSettings(settings);
  };

  const calculateStatistics = async () => {
    if (!user) return;

    try {
      // Calculate streak
      const { data: recentEntries } = await supabase
        .from('journal_entries')
        .select('entry_date')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })
        .limit(365);

      let streak = 0;
      const today = new Date();
      const entryDates = recentEntries?.map(e => new Date(e.entry_date)) || [];
      
      for (let i = 0; i < entryDates.length; i++) {
        const daysDiff = Math.floor((today.getTime() - entryDates[i].getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === streak) {
          streak++;
        } else {
          break;
        }
      }
      setStreakCount(streak);

      // Calculate total words and popular tags
      let totalWordCount = 0;
      const tagCounts: Record<string, number> = {};
      
      entries.forEach(entry => {
        totalWordCount += entry.word_count || 0;
        entry.tags?.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      
      setTotalWords(totalWordCount);
      setPopularTags(
        Object.entries(tagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      );
    } catch (error) {
      console.error('Error calculating statistics:', error);
    }
  };

  const autoSaveEntry = async () => {
    if (!user || !currentEntry.content?.trim()) return;

    setAutoSaving(true);
    try {
      const wordCount = currentEntry.content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200); // Assume 200 WPM reading speed

      const entryData = {
        ...currentEntry,
        user_id: user.id,
        word_count: wordCount,
        reading_time: readingTime,
        updated_at: new Date().toISOString()
      };

      if (currentEntry.id) {
        const { error } = await supabase
          .from('journal_entries')
          .update(entryData)
          .eq('id', currentEntry.id);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('journal_entries')
          .insert(entryData)
          .select()
          .single();
        
        if (error) throw error;
        setCurrentEntry(prev => ({ ...prev, id: data.id }));
      }

      toast({
        title: "Auto-saved",
        description: "Your entry has been automatically saved",
      });
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const saveEntry = async () => {
    if (!user || !currentEntry.content?.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content for your journal entry",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const wordCount = currentEntry.content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);

      const entryData = {
        ...currentEntry,
        user_id: user.id,
        word_count: wordCount,
        reading_time: readingTime,
        entry_date: currentEntry.entry_date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (currentEntry.id) {
        const { error } = await supabase
          .from('journal_entries')
          .update(entryData)
          .eq('id', currentEntry.id);
        
        if (error) throw error;
        
        setEntries(prev => prev.map(entry => 
          entry.id === currentEntry.id ? { ...entry, ...entryData } : entry
        ));
      } else {
        const { data, error } = await supabase
          .from('journal_entries')
          .insert(entryData)
          .select()
          .single();
        
        if (error) throw error;
        setEntries(prev => [data, ...prev]);
      }

      toast({
        title: "Saved",
        description: "Journal entry saved successfully"
      });

      resetForm();
      setShowEntryDialog(false);
      calculateStatistics();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (entryId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.id);

      if (error) throw error;

      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      toast({
        title: "Deleted",
        description: "Journal entry deleted successfully"
      });
      calculateStatistics();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setCurrentEntry({
      title: "",
      content: "",
      mood: null,
      spiritual_state: null,
      verse_references: [],
      tags: [],
      is_private: editorSettings.defaultPrivacy,
      entry_date: new Date().toISOString().split('T')[0]
    });
    setIsEditing(false);
  };

  const startNewEntry = () => {
    resetForm();
    setShowEntryDialog(true);
    setIsEditing(true);
  };

  const editEntry = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setSelectedEntry(entry);
    setShowEntryDialog(true);
    setIsEditing(true);
  };

  const formatText = (format: 'bold' | 'italic' | 'list') => {
    const textarea = editorRef.current;
    if (!textarea) return;

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
      case 'list':
        formattedText = `• ${selectedText}`;
        break;
    }

    const newContent = 
      textarea.value.substring(0, start) + 
      formattedText + 
      textarea.value.substring(end);

    setCurrentEntry(prev => ({ ...prev, content: newContent }));
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + formattedText.length - selectedText.length,
        start + formattedText.length
      );
    }, 0);
  };

  const searchVerses = async (query: string) => {
    if (!query.trim()) return;

    try {
      const { data, error } = await supabase
        .from('bible_verses')
        .select(`
          *,
          book:bible_books(name, testament)
        `)
        .or(`text_esv.ilike.%${query}%,text_niv.ilike.%${query}%,text_kjv.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setVerseResults(data || []);
    } catch (error) {
      console.error('Error searching verses:', error);
    }
  };

  const insertVerse = (verse: { text: string; reference: string }) => {
    const reference = `${verse.book.name} ${verse.chapter}:${verse.verse}`;
    const verseText = `"${verse.text_esv}" - ${reference}`;
    
    const currentContent = currentEntry.content || '';
    const newContent = currentContent + (currentContent ? '\n\n' : '') + verseText;
    
    setCurrentEntry(prev => ({
      ...prev,
      content: newContent,
      verse_references: [...(prev.verse_references || []), reference]
    }));
    
    setShowVerseSearch(false);
    setVerseSearchQuery('');
    setVerseResults([]);
  };

  const addTag = (tag: string) => {
    if (!tag.trim() || currentEntry.tags?.includes(tag)) return;
    
    setCurrentEntry(prev => ({
      ...prev,
      tags: [...(prev.tags || []), tag.trim()]
    }));
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const exportEntries = async (format: 'pdf' | 'txt' | 'json') => {
    if (!entries.length) return;

    let content = '';
    let filename = '';

    switch (format) {
      case 'txt':
        content = entries.map(entry => `
Date: ${new Date(entry.entry_date).toLocaleDateString()}
Title: ${entry.title || 'Untitled'}
Mood: ${entry.mood || 'Not specified'}
Spiritual State: ${entry.spiritual_state || 'Not specified'}
Tags: ${entry.tags?.join(', ') || 'None'}

${entry.content}

${'='.repeat(50)}
        `).join('\n');
        filename = `journal-entries-${new Date().toISOString().split('T')[0]}.txt`;
        break;
      
      case 'json':
        content = JSON.stringify(entries, null, 2);
        filename = `journal-entries-${new Date().toISOString().split('T')[0]}.json`;
        break;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: `Journal entries exported as ${format.toUpperCase()}`
    });
  };

  const printEntries = () => {
    const printContent = entries.map(entry => `
      <div style="margin-bottom: 30px; page-break-inside: avoid;">
        <h2>${entry.title || 'Untitled'}</h2>
        <p><strong>Date:</strong> ${new Date(entry.entry_date).toLocaleDateString()}</p>
        <p><strong>Mood:</strong> ${entry.mood || 'Not specified'}</p>
        <p><strong>Spiritual State:</strong> ${entry.spiritual_state || 'Not specified'}</p>
        <p><strong>Tags:</strong> ${entry.tags?.join(', ') || 'None'}</p>
        <hr>
        <div style="white-space: pre-wrap; line-height: 1.6;">${entry.content}</div>
      </div>
    `).join('');

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Journal Entries</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h2 { color: #e97316; margin-bottom: 10px; }
              hr { border: 1px solid #e5e7eb; margin: 15px 0; }
            </style>
          </head>
          <body>
            <h1>My Journal Entries</h1>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Filter entries based on search and tags
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = !searchQuery || 
      entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => entry.tags?.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  if (!user) {
    return <PremiumFeaturePrompt 
    title="Premium Journal Features"
    description="Unlock advanced journaling capabilities with AI-powered insights"
    features={["AI-powered entry suggestions", "Advanced search", "Export options", "Unlimited entries"]}
    icon={<Crown className="h-8 w-8 text-primary" />}
  />;
  }

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-aura-gradient text-white p-4 border-b flex-shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <h1 className="text-2xl font-divine">Spiritual Journal</h1>
            <Star className="h-5 w-5" />
          </div>
          <p className="text-white/80 mt-1">Document your faith journey and spiritual growth</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border-b p-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-600" />
              <span><strong>{streakCount}</strong> day streak</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-600" />
              <span><strong>{totalEntries}</strong> entries</span>
            </div>
            <div className="flex items-center gap-2">
              <PenTool className="h-4 w-4 text-orange-600" />
              <span><strong>{totalWords.toLocaleString()}</strong> words</span>
            </div>
            {autoSaving && (
              <div className="flex items-center gap-2 text-blue-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Auto-saving...</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
            <Button onClick={startNewEntry}>
              <Plus className="h-4 w-4 mr-1" />
              New Entry
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-6xl mx-auto p-6">
          <div className="h-full flex flex-col">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search entries by title, content, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Select value={viewMode} onValueChange={(value: 'list' | 'grid' | 'calendar') => setViewMode(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="list">List View</SelectItem>
                    <SelectItem value="grid">Grid View</SelectItem>
                    <SelectItem value="calendar">Calendar</SelectItem>
                  </SelectContent>
                </Select>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-1" />
                      Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-3">
                      <h4 className="font-medium">Filter by Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {popularTags.map(({ tag, count }) => (
                          <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              if (selectedTags.includes(tag)) {
                                setSelectedTags(prev => prev.filter(t => t !== tag));
                              } else {
                                setSelectedTags(prev => [...prev, tag]);
                              }
                            }}
                          >
                            {tag} ({count})
                          </Badge>
                        ))}
                      </div>
                      {selectedTags.length > 0 && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setSelectedTags([])}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="space-y-2">
                      <h4 className="font-medium">Export Options</h4>
                      <div className="space-y-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => exportEntries('txt')}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Export as Text
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => exportEntries('json')}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Export as JSON
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={printEntries}
                        >
                                          <Printer className="h-4 w-4 mr-2" />
                Print All Entries
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Entries Display */}
            <div className="flex-1 overflow-auto">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Journal Entries</h3>
                  <p className="text-muted-foreground mb-4">
                    {entries.length === 0 
                      ? "Start documenting your spiritual journey today"
                      : "No entries match your current filters"
                    }
                  </p>
                  <Button onClick={startNewEntry}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Entry
                  </Button>
                </div>
              ) : (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {filteredEntries.map((entry) => {
                    const mood = moods.find(m => m.value === entry.mood);
                    
                    return (
                      <Card 
                        key={entry.id} 
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => editEntry(entry)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">
                                {entry.title || "Untitled Entry"}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {new Date(entry.entry_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {entry.is_private ? (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Users className="h-4 w-4 text-muted-foreground" />
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteEntry(entry.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="space-y-3">
                            {mood && (
                              <Badge className={mood.color}>
                                {mood.label}
                              </Badge>
                            )}
                            
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {entry.content}
                            </p>
                            
                            {entry.tags && entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {entry.tags.slice(0, 3).map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                                {entry.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{entry.tags.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{entry.word_count || 0} words</span>
                              <span>{entry.reading_time || 1} min read</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Entry Editor Dialog */}
      <Dialog open={showEntryDialog} onOpenChange={setShowEntryDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              {currentEntry.id ? "Edit Entry" : "New Journal Entry"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="h-full overflow-auto">
            <div className="space-y-6">
              {/* Entry Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Entry Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentEntry.entry_date 
                          ? new Date(currentEntry.entry_date).toLocaleDateString()
                          : "Select date"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={currentEntry.entry_date ? new Date(currentEntry.entry_date) : undefined}
                        onSelect={(date) => 
                          setCurrentEntry(prev => ({
                            ...prev,
                            entry_date: date?.toISOString().split('T')[0]
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Mood</label>
                  <Select 
                    value={currentEntry.mood || ""} 
                    onValueChange={(value) => setCurrentEntry(prev => ({ ...prev, mood: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="How are you feeling?" />
                    </SelectTrigger>
                    <SelectContent>
                      {moods.map(mood => (
                        <SelectItem key={mood.value} value={mood.value}>
                          {mood.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Spiritual State</label>
                  <Select 
                    value={currentEntry.spiritual_state || ""} 
                    onValueChange={(value) => setCurrentEntry(prev => ({ ...prev, spiritual_state: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Your spiritual state" />
                    </SelectTrigger>
                    <SelectContent>
                      {spiritualStates.map(state => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium">Title (Optional)</label>
                <Input
                  placeholder="Give your entry a title..."
                  value={currentEntry.title || ""}
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              {/* Editor Toolbar */}
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => formatText('bold')}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => formatText('italic')}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => formatText('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  
                  <Separator orientation="vertical" className="h-6" />
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowVerseSearch(true)}
                  >
                    <Quote className="h-4 w-4 mr-1" />
                    Add Verse
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Type className="h-4 w-4" />
                    <Slider
                      value={[editorSettings.fontSize]}
                      onValueChange={([value]) => 
                        setEditorSettings(prev => ({ ...prev, fontSize: value }))
                      }
                      min={12}
                      max={20}
                      step={1}
                      className="w-20"
                    />
                    <span>{editorSettings.fontSize}px</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={currentEntry.is_private}
                      onCheckedChange={(checked) => 
                        setCurrentEntry(prev => ({ ...prev, is_private: checked }))
                      }
                    />
                    <span className="text-sm">
                      {currentEntry.is_private ? (
                        <><Lock className="h-3 w-3 inline mr-1" />Private</>
                      ) : (
                        <><Users className="h-3 w-3 inline mr-1" />Shareable</>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Editor */}
              <div className="space-y-3">
                <Textarea
                  ref={editorRef}
                  placeholder="What's on your heart today? Share your thoughts, prayers, reflections, and spiritual insights..."
                  value={currentEntry.content || ""}
                  onChange={(e) => {
                    setCurrentEntry(prev => ({ ...prev, content: e.target.value }));
                    setIsEditing(true);
                  }}
                  className="min-h-[300px] resize-none"
                  style={{ fontSize: `${editorSettings.fontSize}px` }}
                />
                
                {editorSettings.showWordCount && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {currentEntry.content?.split(/\s+/).length || 0} words
                    </span>
                    <span>
                      {Math.ceil((currentEntry.content?.split(/\s+/).length || 0) / 200)} min read
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium">Tags</label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {currentEntry.tags?.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="cursor-pointer"
                        onClick={() => removeTag(tag)}
                      >
                        #{tag} ×
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {commonTags
                      .filter(tag => !currentEntry.tags?.includes(tag))
                      .slice(0, 8)
                      .map(tag => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="cursor-pointer hover:bg-orange-100"
                          onClick={() => addTag(tag)}
                        >
                          +{tag}
                        </Badge>
                      ))
                    }
                  </div>
                  
                  <Input
                    placeholder="Add custom tag and press Enter..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addTag(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowEntryDialog(false)}
                  >
                    Cancel
                  </Button>
                  {currentEntry.id && (
                    <Button
                      variant="outline"
                      onClick={() => deleteEntry(currentEntry.id!)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {editorSettings.autoSave && (
                    <span className="text-xs text-muted-foreground">
                      Auto-save enabled
                    </span>
                  )}
                  <Button onClick={saveEntry} disabled={loading}>
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Save Entry
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Verse Search Dialog */}
      <Dialog open={showVerseSearch} onOpenChange={setShowVerseSearch}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Bible Verse</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for verses..."
                value={verseSearchQuery}
                onChange={(e) => {
                  setVerseSearchQuery(e.target.value);
                  searchVerses(e.target.value);
                }}
                className="pl-10"
              />
            </div>
            
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {verseResults.map((verse) => (
                  <Card 
                    key={`${verse.book.name}-${verse.chapter}-${verse.verse}`}
                    className="p-3 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    onClick={() => insertVerse(verse)}
                  >
                    <p className="text-sm mb-2">"{verse.text_esv}"</p>
                    <p className="text-xs text-muted-foreground">
                      {verse.book.name} {verse.chapter}:{verse.verse}
                    </p>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Journal Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto-save entries</label>
                <Switch
                  checked={editorSettings.autoSave}
                  onCheckedChange={(checked) => 
                    saveUserSettings({ ...editorSettings, autoSave: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Daily reminder</label>
                <Switch
                  checked={editorSettings.dailyReminder}
                  onCheckedChange={(checked) => 
                    saveUserSettings({ ...editorSettings, dailyReminder: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Private by default</label>
                <Switch
                  checked={editorSettings.defaultPrivacy}
                  onCheckedChange={(checked) => 
                    saveUserSettings({ ...editorSettings, defaultPrivacy: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Show word count</label>
                <Switch
                  checked={editorSettings.showWordCount}
                  onCheckedChange={(checked) => 
                    saveUserSettings({ ...editorSettings, showWordCount: checked })
                  }
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Reminder time</label>
              <Input
                type="time"
                value={editorSettings.reminderTime}
                onChange={(e) => 
                  saveUserSettings({ ...editorSettings, reminderTime: e.target.value })
                }
              />
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowSettings(false)}>
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Journal;