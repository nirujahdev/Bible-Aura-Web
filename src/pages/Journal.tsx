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
  Timer, Calendar as CalIcon, Quote, LinkIcon, Type, Palette,
  Sparkles
} from "lucide-react";
import { AutoVerseTooltip } from "@/components/VerseTooltip";
import { EnhancedJournalEditor } from "@/components/EnhancedJournalEditor";

interface JournalEntry {
  id: string;
  title: string | null;
  content: string;
  mood: string | null;
  spiritual_state: string | null;
  verse_references: string[] | null;
  tags?: string[];
  is_private?: boolean;
  shared_with?: string[];
  formatted_content?: any;
  entry_date?: string;
  word_count?: number;
  reading_time?: number;
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
  const [showEnhancedEditor, setShowEnhancedEditor] = useState(false);
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

  // URL parameter handling for daily verse integration
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isDailyVerse = urlParams.get('daily_verse');
    const preContent = urlParams.get('content');
    const theme = urlParams.get('theme');

    if (isDailyVerse && preContent) {
      setCurrentEntry(prev => ({
        ...prev,
        content: decodeURIComponent(preContent),
        tags: theme ? [theme] : [],
        title: `Daily Reflection - ${new Date().toLocaleDateString()}`
      }));
      setShowEnhancedEditor(true);
      
      // Clean URL
      window.history.replaceState({}, '', '/journal');
    }
  }, []);

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
        handleAutoSave();
      }, 3000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [currentEntry.content, editorSettings.autoSave, isEditing]);

  const loadEntries = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      
             // Transform database entries to match interface
       const transformedEntries = (data || []).map((entry: any) => ({
         ...entry,
         tags: entry.tags || [],
         is_private: entry.is_private ?? true,
         shared_with: entry.shared_with || [],
         formatted_content: entry.formatted_content || null,
         entry_date: entry.entry_date || entry.created_at.split('T')[0],
         word_count: entry.word_count || 0,
         reading_time: entry.reading_time || 0
       }));
       
       setEntries(transformedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
      toast({
        title: "Error loading entries",
        description: "Please refresh the page to try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async (entry: any) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const entryToSave = {
        ...entry,
        user_id: user.id,
        word_count: entry.word_count || 0,
        reading_time: entry.reading_time || 0,
        updated_at: new Date().toISOString()
      };

      if (selectedEntry?.id) {
        // Update existing entry
        const { error } = await supabase
          .from('journal_entries')
          .update(entryToSave)
          .eq('id', selectedEntry.id);

        if (error) throw error;
        
        toast({
          title: "Entry updated",
          description: "Your journal entry has been updated successfully",
        });
      } else {
        // Create new entry
        const { error } = await supabase
          .from('journal_entries')
          .insert([entryToSave]);

        if (error) throw error;
        
        toast({
          title: "Entry saved",
          description: "Your journal entry has been saved successfully",
        });
      }

      // Refresh entries list
      await loadEntries();
      
      // Close editor
      setShowEnhancedEditor(false);
      setSelectedEntry(null);
      setCurrentEntry({
        title: "",
        content: "",
        mood: null,
        spiritual_state: null,
        verse_references: [],
        tags: [],
        is_private: true,
        entry_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Error saving entry",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (!user || !currentEntry.content || !selectedEntry?.id) return;
    
    setAutoSaving(true);
    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({
          content: currentEntry.content,
          title: currentEntry.title,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedEntry.id);

      if (error) throw error;
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const loadUserSettings = async () => {
    // Load user preferences from localStorage or database
    const savedSettings = localStorage.getItem('journalSettings');
    if (savedSettings) {
      setEditorSettings(JSON.parse(savedSettings));
    }
  };

  const calculateStatistics = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
             const entries: any[] = data || [];
       setTotalEntries(entries.length);
       
       const totalWords = entries.reduce((sum, entry) => sum + (entry.word_count || 0), 0);
       setTotalWords(totalWords);
       
       // Calculate streak
       const sortedEntries = entries
         .sort((a, b) => new Date(b.entry_date || b.created_at).getTime() - new Date(a.entry_date || a.created_at).getTime());
       
       let streak = 0;
       const currentDate = new Date();
       currentDate.setHours(0, 0, 0, 0);
       
       for (const entry of sortedEntries) {
         const entryDate = new Date(entry.entry_date || entry.created_at);
         entryDate.setHours(0, 0, 0, 0);
         
         if (entryDate.getTime() === currentDate.getTime()) {
           streak++;
           currentDate.setDate(currentDate.getDate() - 1);
         } else {
           break;
         }
       }
       
       setStreakCount(streak);
       
       // Calculate popular tags
       const tagCounts: Record<string, number> = {};
       entries.forEach((entry: any) => {
         const tags = entry.tags || [];
         tags.forEach((tag: string) => {
           tagCounts[tag] = (tagCounts[tag] || 0) + 1;
         });
       });
      
      const sortedTags = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }));
      
      setPopularTags(sortedTags);
    } catch (error) {
      console.error('Error calculating statistics:', error);
    }
  };

  const openEnhancedEditor = (entry?: JournalEntry) => {
    if (entry) {
      setSelectedEntry(entry);
      setCurrentEntry({
        title: entry.title || "",
        content: entry.content,
        mood: entry.mood,
        spiritual_state: entry.spiritual_state,
        verse_references: entry.verse_references || [],
        tags: entry.tags || [],
        is_private: entry.is_private,
        entry_date: entry.entry_date
      });
      setIsEditing(true);
    } else {
      setSelectedEntry(null);
      setCurrentEntry({
        title: "",
        content: "",
        mood: null,
        spiritual_state: null,
        verse_references: [],
        tags: [],
        is_private: true,
        entry_date: new Date().toISOString().split('T')[0]
      });
      setIsEditing(false);
    }
    setShowEnhancedEditor(true);
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
      
      toast({
        title: "Entry deleted",
        description: "Your journal entry has been deleted",
      });
      
      await loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error deleting entry",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (showEnhancedEditor) {
    return (
      <EnhancedJournalEditor
        initialEntry={currentEntry}
        onSave={handleSaveEntry}
        onCancel={() => {
          setShowEnhancedEditor(false);
          setSelectedEntry(null);
        }}
        isEditing={isEditing}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <div className="gradient-primary text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
        
        <div className="container relative z-10 section-spacing-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="text-spacing">
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <FileText className="h-10 w-10" />
                  </div>
                  My Spiritual Journal
                </h1>
                <div className="flex items-center gap-2">
                  {streakCount >= 7 && <span className="text-3xl animate-bounce">🔥</span>}
                  {streakCount >= 30 && <span className="text-3xl animate-pulse">⭐</span>}
                </div>
              </div>
              <p className="text-white/90 text-lg sm:text-xl font-medium">
                Document your spiritual journey with AI-powered insights
              </p>
              <div className="flex flex-wrap items-center gap-6 text-base text-white/80 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  <span>{totalEntries} entries</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📝</span>
                  <span>{totalWords.toLocaleString()} words</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <span>{streakCount} day streak</span>
                </div>
              </div>
            </div>

            <div className="btn-group">
              <Button 
                onClick={() => openEnhancedEditor()}
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 rounded-xl"
              >
                <PenTool className="mr-3 h-6 w-6" />
                New Entry
              </Button>
              <Button 
                onClick={() => openEnhancedEditor()}
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 rounded-xl"
              >
                <Sparkles className="mr-3 h-6 w-6" />
                Enhanced Editor
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 lg:py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search your journal entries by title, content, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base rounded-xl border-gray-200 focus:border-primary shadow-sm"
              />
            </div>
            <div className="btn-group-sm">
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-40 h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">📋 List View</SelectItem>
                  <SelectItem value="grid">📱 Grid View</SelectItem>
                  <SelectItem value="calendar">📅 Calendar</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => setShowSettings(true)}
                className="h-12 px-4 rounded-xl border-gray-200 hover:bg-gray-50"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Entries Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : entries.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No journal entries yet</h3>
              <p className="text-gray-600 mb-4">Start documenting your spiritual journey today</p>
              <Button onClick={() => openEnhancedEditor()}>
                <PenTool className="mr-2 h-4 w-4" />
                Write Your First Entry
              </Button>
            </CardContent>
          </Card>
                 ) : (
           <div className={`grid gap-6 ${
             viewMode === 'grid' 
               ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
               : 'grid-cols-1 w-full'
           }`}>
             {entries
               .filter(entry => 
                 !searchQuery || 
                 entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
               )
               .map((entry) => (
                 <Card key={entry.id} className="enhanced-card hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                   <CardHeader className="pb-4">
                     <div className="flex items-start justify-between gap-4">
                       <div className="flex-1 min-w-0">
                         <CardTitle className="text-xl line-clamp-2 text-gray-800 mb-3">
                           {entry.title || 'Untitled Entry'}
                         </CardTitle>
                         <div className="flex flex-wrap items-center gap-3 text-sm">
                           <div className="flex items-center gap-2 text-gray-600">
                             <Calendar className="h-4 w-4" />
                             <span>{new Date(entry.entry_date || entry.created_at).toLocaleDateString()}</span>
                           </div>
                           {entry.mood && (
                             <Badge className={`${
                               moods.find(m => m.value === entry.mood)?.color || 'bg-gray-100 text-gray-800'
                             } font-medium`}>
                               {moods.find(m => m.value === entry.mood)?.label}
                             </Badge>
                           )}
                         </div>
                       </div>
                       <div className="btn-group-sm">
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => openEnhancedEditor(entry)}
                           className="hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                         >
                           <Edit3 className="h-5 w-5" />
                         </Button>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => deleteEntry(entry.id)}
                           className="hover:bg-red-50 hover:text-red-600 rounded-lg"
                         >
                           <Trash2 className="h-5 w-5" />
                         </Button>
                       </div>
                     </div>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <p className="text-gray-700 line-clamp-3 leading-relaxed text-base">
                       {entry.content}
                     </p>
                     
                     <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
                       <div className="flex items-center gap-4">
                         <span className="flex items-center gap-1">
                           <FileText className="h-4 w-4" />
                           {entry.word_count || 0} words
                         </span>
                         <span className="flex items-center gap-1">
                           <Clock className="h-4 w-4" />
                           {entry.reading_time || 0} min read
                         </span>
                       </div>
                     </div>
                     
                     {entry.tags && entry.tags.length > 0 && (
                       <div className="flex flex-wrap gap-2 pt-2">
                         {entry.tags.slice(0, 4).map((tag, index) => (
                           <Badge key={index} variant="outline" className="text-xs px-2 py-1 rounded-full">
                             #{tag}
                           </Badge>
                         ))}
                         {entry.tags.length > 4 && (
                           <Badge variant="outline" className="text-xs px-2 py-1 rounded-full">
                             +{entry.tags.length - 4} more
                           </Badge>
                         )}
                       </div>
                     )}
                   </CardContent>
                 </Card>
               ))}
           </div>
         )}
      </div>
    </div>
  );
};

export default Journal;