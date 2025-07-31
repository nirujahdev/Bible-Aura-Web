import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, Plus, Edit3, Trash2, Search, FileText, 
  Save, Calendar as CalendarIcon, Quote, X, ChevronDown,
  ChevronLeft, ChevronRight, Briefcase, PartyPopper,
  User, MapPin, GraduationCap, Users, Heart,
  Filter, Clock, Hand as Pray, Sparkles, Book,
  Copy, Pin, Feather, AlertCircle
} from "lucide-react";
import { getAllBooks, getChapterVerses } from "@/lib/local-bible";
import type { Json } from "@/integrations/supabase/types";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  category?: string;
  verse_reference?: string;
  verse_text?: string;
  mood?: string;
  entry_date?: string;
  created_at: string;
  updated_at: string;
  is_pinned?: boolean;
  prayer_requests?: string[];
  gratitude_items?: string[];
  template_used?: string;
  metadata?: Json;
}

interface BibleBook {
  id: string;
  name: string;
  chapters: number;
  testament: string;
}

interface BibleVerse {
  id: string;
  chapter: number;
  verse: number;
  text: string;
  book_name: string;
}

const categories = [
  { id: 'personal', name: 'Personal', icon: User, color: 'bg-orange-100 text-orange-800' },
  { id: 'prayer', name: 'Prayer', icon: Pray, color: 'bg-orange-200 text-orange-900' },
  { id: 'gratitude', name: 'Gratitude', icon: Heart, color: 'bg-orange-300 text-orange-900' },
  { id: 'bible-study', name: 'Bible Study', icon: Book, color: 'bg-orange-400 text-white' },
  { id: 'devotional', name: 'Devotional', icon: Sparkles, color: 'bg-orange-500 text-white' },
  { id: 'work', name: 'Work', icon: Briefcase, color: 'bg-orange-600 text-white' },
  { id: 'events', name: 'Events', icon: PartyPopper, color: 'bg-orange-700 text-white' },
  { id: 'trips', name: 'Trips', icon: MapPin, color: 'bg-orange-800 text-white' },
];

const moods = [
  { value: "joyful", label: "😊 Joyful", color: "bg-orange-50 text-orange-800" },
  { value: "peaceful", label: "😌 Peaceful", color: "bg-orange-100 text-orange-800" },
  { value: "grateful", label: "🙏 Grateful", color: "bg-orange-200 text-orange-900" },
  { value: "contemplative", label: "🤔 Contemplative", color: "bg-orange-300 text-orange-900" },
  { value: "hopeful", label: "✨ Hopeful", color: "bg-orange-400 text-white" },
  { value: "blessed", label: "🙌 Blessed", color: "bg-orange-500 text-white" },
  { value: "reflective", label: "📝 Reflective", color: "bg-orange-600 text-white" },
  { value: "worship", label: "🎵 Worship", color: "bg-orange-700 text-white" }
];

const journalTemplates = [
  {
    id: 'daily-reflection',
    name: 'Daily Reflection',
    icon: '📝',
    description: 'A structured daily reflection template',
    prompts: [
      'What did I learn about God today?',
      'How did I see God working in my life?',
      'What am I grateful for?',
      'What challenges did I face and how did faith help?',
      'Prayer requests for tomorrow:'
    ]
  },
  {
    id: 'bible-study',
    name: 'Bible Study',
    icon: '📖',
    description: 'Deep dive into scripture study',
    prompts: [
      'Scripture passage studied:',
      'Key insights and revelations:',
      'How does this apply to my life?',
      'Questions for further study:',
      'Prayer based on this passage:'
    ]
  },
  {
    id: 'prayer-journal',
    name: 'Prayer Journal',
    icon: '🙏',
    description: 'Focused prayer and intercession',
    prompts: [
      'Personal prayer requests:',
      'Prayers for family and friends:',
      'Prayers for church and community:',
      'Prayers answered recently:',
      'Scripture promises to claim:'
    ]
  },
  {
    id: 'gratitude',
    name: 'Gratitude',
    icon: '💝',
    description: 'Counting blessings and giving thanks',
    prompts: [
      'Three things I\'m grateful for today:',
      'God\'s provision I noticed:',
      'Relationships I\'m thankful for:',
      'Challenges that became blessings:',
      'Ways to express gratitude:'
    ]
  }
];

const Journal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Core state
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeView, setActiveView] = useState('entries');
  const [error, setError] = useState<string | null>(null);
  
  // Entry dialog state
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [entryTitle, setEntryTitle] = useState("");
  const [entryContent, setEntryContent] = useState("");
  const [entryCategory, setEntryCategory] = useState("personal");
  const [entryMood, setEntryMood] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [prayerRequests, setPrayerRequests] = useState<string[]>([]);
  const [gratitudeItems, setGratitudeItems] = useState<string[]>([]);
  
  // Bible integration state
  const [showVerseSelector, setShowVerseSelector] = useState(false);
  const [bibleBooks, setBibleBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'tamil'>('english');
  const [chapterVerses, setChapterVerses] = useState<BibleVerse[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);

  const [sortBy, setSortBy] = useState('newest');

  const languages = [
    { value: 'english', label: 'English (KJV)' },
    { value: 'tamil', label: 'Tamil' }
  ];

  useEffect(() => {
    if (user) {
      loadEntries();
      loadBibleBooks();
    }
  }, [user]);

  useEffect(() => {
    try {
      filterEntries();
    } catch (error) {
      console.error('Error filtering entries:', error);
      setError('Error filtering entries. Please try refreshing.');
    }
  }, [entries, selectedCategory, searchQuery, selectedDate, sortBy, activeView]);

  useEffect(() => {
    if (selectedBook) {
      loadChapterVerses();
    }
  }, [selectedBook, selectedChapter, selectedLanguage]);

  const loadEntries = async () => {
    if (!user) {
      console.log('No user authenticated for loading entries');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      console.log('Loading journal entries for user:', user.id);
      
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Loaded entries:', data?.length || 0);
      setEntries(data || []);
      
      if (data?.length === 0) {
        console.log('No journal entries found for this user');
      }
    } catch (error) {
      console.error('Error loading entries:', error);
      
      let errorMessage = 'Failed to load journal entries';
      if (error.message?.includes('relation "journal_entries" does not exist')) {
        errorMessage = 'Journal database table not found. Please contact support.';
      } else if (error.message?.includes('permission denied')) {
        errorMessage = 'Permission denied. Please sign in again.';
      }
      
      setError(errorMessage);
      toast({
        title: "Error loading entries",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBibleBooks = async () => {
    try {
      const books = await getAllBooks();
      setBibleBooks(books);
    } catch (error) {
      console.error('Error loading Bible books:', error);
    }
  };

  const loadChapterVerses = async () => {
    if (!selectedBook) return;
    
    try {
      const verses = await getChapterVerses(selectedBook.name, selectedChapter, selectedLanguage);
      setChapterVerses(verses);
    } catch (error) {
      console.error('Error loading verses:', error);
    }
  };

  const filterEntries = () => {
    let filtered = entries;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(entry => (entry.category || 'personal') === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Only filter by date if activeView is 'calendar' or if user specifically wants date filtering
    // Remove the restrictive date filtering that was preventing entries from showing
    if (activeView === 'calendar' && selectedDate) {
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter(entry => {
        // Check both entry_date and created_at for date matching
        const entryDate = entry.entry_date || new Date(entry.created_at).toISOString().split('T')[0];
        return entryDate === selectedDateStr;
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'category':
        filtered.sort((a, b) => (a.category || 'personal').localeCompare(b.category || 'personal'));
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredEntries(filtered);
  };

  const handleSaveEntry = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save journal entries",
        variant: "destructive",
      });
      return;
    }

    if (!entryTitle.trim() || !entryContent.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both title and content",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      // Prepare metadata object properly
      const metadata = {
        prayer_requests: prayerRequests.filter(p => p.trim()),
        gratitude_items: gratitudeItems.filter(g => g.trim()),
        template_used: selectedTemplate
      };

      const entryData = {
        user_id: user.id,
        title: entryTitle.trim(),
        content: entryContent.trim(),
        category: entryCategory,
        mood: entryMood || null,
        verse_reference: selectedVerse ? `${selectedVerse.book_name} ${selectedVerse.chapter}:${selectedVerse.verse}` : null,
        verse_text: selectedVerse?.text || null,
        entry_date: selectedDate.toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
        metadata: metadata // Send as object, not stringified
      };

      if (editingEntry) {
        const { error } = await supabase
          .from('journal_entries')
          .update(entryData)
          .eq('id', editingEntry.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        
        toast({
          title: "Entry updated",
          description: "Your journal entry has been saved successfully",
        });
      } else {
        const { data, error } = await supabase
          .from('journal_entries')
          .insert(entryData)
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        
        toast({
          title: "Entry created",
          description: "Your new journal entry has been saved",
        });
      }

      closeEntryDialog();
      loadEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
      
      let errorMessage = "Please try again";
      if (error.message?.includes('relation "journal_entries" does not exist')) {
        errorMessage = "Database not set up properly. Please contact support.";
      } else if (error.message?.includes('invalid input syntax')) {
        errorMessage = "Invalid data format. Please check your input.";
      } else if (error.message?.includes('permission denied')) {
        errorMessage = "Permission denied. Please sign in again.";
      }
      
      toast({
        title: "Error saving entry",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
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
      
      setSelectedEntry(null);
      loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error deleting entry",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const togglePin = async (entry: JournalEntry) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({ is_pinned: !entry.is_pinned })
        .eq('id', entry.id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({
        title: entry.is_pinned ? "Entry unpinned" : "Entry pinned",
        description: entry.title,
      });
      
      loadEntries();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const openEntryDialog = (entry?: JournalEntry, template?: string) => {
    if (entry) {
      setEditingEntry(entry);
      setEntryTitle(entry.title);
      setEntryContent(entry.content);
      setEntryCategory(entry.category || 'personal');
      setEntryMood(entry.mood || '');
      setSelectedTemplate(template || null);
      
      // Parse metadata if it exists
      try {
        const metadata = typeof entry.metadata === 'string' 
          ? JSON.parse(entry.metadata) 
          : entry.metadata || {};
        setPrayerRequests(metadata.prayer_requests || []);
        setGratitudeItems(metadata.gratitude_items || []);
      } catch (error) {
        console.error('Error parsing entry metadata:', error);
        setPrayerRequests([]);
        setGratitudeItems([]);
      }
    } else {
      setEditingEntry(null);
      setEntryTitle("");
      setEntryContent(template ? journalTemplates.find(t => t.id === template)?.prompts.join('\n\n') || "" : "");
      setEntryCategory("personal");
      setEntryMood("");
      setSelectedTemplate(template || null);
      setPrayerRequests([]);
      setGratitudeItems([]);
    }
    setShowEntryDialog(true);
  };

  const closeEntryDialog = () => {
    setShowEntryDialog(false);
    setEditingEntry(null);
    setEntryTitle("");
    setEntryContent("");
    setEntryCategory("personal");
    setEntryMood("");
    setSelectedTemplate(null);
    setPrayerRequests([]);
    setGratitudeItems([]);
    setSelectedVerse(null);
  };

  // Debug information
  const debugInfo = {
    userAuthenticated: !!user,
    entriesCount: entries.length,
    filteredEntriesCount: filteredEntries.length,
    activeView,
    selectedCategory,
    searchQuery,
    selectedDate: selectedDate.toISOString().split('T')[0],
    loading,
    error
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDay = (date: Date) => {
    return date.getDate();
  };

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getEntriesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return entries.filter(entry => {
      const entryDate = new Date(entry.created_at).toISOString().split('T')[0];
      return entryDate === dateStr;
    });
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : FileText;
  };

  const getMoodColor = (mood: string) => {
    const moodData = moods.find(m => m.value === mood);
    return moodData ? moodData.color : 'bg-orange-50 text-orange-800';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <Card className="text-center p-8">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800">
                <BookOpen className="h-8 w-8 mx-auto mb-4 text-blue-600" />
                Journal Access Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Please sign in to access your personal journal.
              </p>
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-white/95 backdrop-blur-sm border-red-200">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <Button 
              onClick={() => {
                setError(null);
                loadEntries();
              }}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Debug Panel - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border text-xs max-w-xs">
          <h4 className="font-bold mb-2">Debug Info</h4>
          <pre className="text-xs overflow-auto max-h-32">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <BookOpen className="h-10 w-10 text-blue-600" />
            My Journal
          </h1>
          <p className="text-lg text-gray-600">
            Document your spiritual journey and reflections
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
              <Button 
                onClick={loadEntries}
                variant="outline"
                className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
              >
                Retry Loading
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Show message when no entries are found */}
        {!loading && entries.length === 0 && !error && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Start Your Spiritual Journey
              </h3>
              <p className="text-blue-600 mb-4">
                You haven't created any journal entries yet. Create your first entry to begin documenting your faith journey.
              </p>
              <Button 
                onClick={() => openEntryDialog()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Entry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Show message when entries exist but none match current filters */}
        {!loading && entries.length > 0 && filteredEntries.length === 0 && !error && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                No Entries Match Current Filters
              </h3>
              <p className="text-yellow-700 mb-4">
                You have {entries.length} total entries, but none match your current search or filters. 
                Try adjusting your filters or search terms.
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setActiveView('entries');
                  }}
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  Clear Filters
                </Button>
                <Button 
                  onClick={() => openEntryDialog()}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

                 <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
           <TabsList className="grid w-full grid-cols-2">
             <TabsTrigger value="entries">All Entries</TabsTrigger>
             <TabsTrigger value="calendar">Calendar View</TabsTrigger>
           </TabsList>

           <TabsContent value="entries" className="space-y-6">
             <div className="flex flex-col sm:flex-row gap-4 mb-6">
               <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <Input
                   placeholder="Search entries..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="pl-10"
                 />
               </div>
               <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                 <SelectTrigger className="w-full sm:w-48">
                   <SelectValue placeholder="Filter by category" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Categories</SelectItem>
                   {categories.map(category => (
                     <SelectItem key={category.id} value={category.id}>
                       {category.name}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               <Button onClick={() => openEntryDialog()} className="bg-blue-600 hover:bg-blue-700">
                 <Plus className="h-4 w-4 mr-2" />
                 New Entry
               </Button>
             </div>

             {loading && (
               <div className="flex justify-center py-8">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
               </div>
             )}

             <div className="grid gap-4">
               {filteredEntries.map((entry) => (
                 <Card key={entry.id} className="hover:shadow-md transition-shadow">
                   <CardContent className="p-6">
                     <div className="flex justify-between items-start mb-4">
                       <div>
                         <h3 className="text-xl font-semibold text-gray-800 mb-2">{entry.title}</h3>
                         <p className="text-gray-600 line-clamp-3">{entry.content}</p>
                       </div>
                       <div className="flex gap-2 ml-4">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => openEntryDialog(entry)}
                         >
                           <Edit3 className="h-4 w-4" />
                         </Button>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleDeleteEntry(entry.id)}
                           className="text-red-600 hover:text-red-700"
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     </div>
                     <div className="flex items-center gap-4 text-sm text-gray-500">
                       <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                       {entry.category && (
                         <Badge variant="secondary">{entry.category}</Badge>
                       )}
                       {entry.mood && (
                         <Badge variant="outline">{entry.mood}</Badge>
                       )}
                     </div>
                   </CardContent>
                 </Card>
               ))}
             </div>
           </TabsContent>

           <TabsContent value="calendar" className="space-y-6">
             <Card>
               <CardContent className="p-6">
                 <Calendar
                   mode="single"
                   selected={selectedDate}
                   onSelect={(date) => date && setSelectedDate(date)}
                   className="rounded-md border"
                 />
               </CardContent>
             </Card>
           </TabsContent>
         </Tabs>

         {/* Entry Dialog */}
         <Dialog open={showEntryDialog} onOpenChange={(open) => !open && closeEntryDialog()}>
           <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
             <DialogHeader>
               <DialogTitle>
                 {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
               </DialogTitle>
             </DialogHeader>
             
             <div className="space-y-6">
               <div>
                 <label className="block text-sm font-medium mb-2">Title</label>
                 <Input
                   value={entryTitle}
                   onChange={(e) => setEntryTitle(e.target.value)}
                   placeholder="Enter a title for your entry..."
                 />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium mb-2">Category</label>
                   <Select value={entryCategory} onValueChange={setEntryCategory}>
                     <SelectTrigger>
                       <SelectValue placeholder="Select category" />
                     </SelectTrigger>
                     <SelectContent>
                       {categories.map(category => (
                         <SelectItem key={category.id} value={category.id}>
                           {category.name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium mb-2">Mood (optional)</label>
                   <Select value={entryMood} onValueChange={setEntryMood}>
                     <SelectTrigger>
                       <SelectValue placeholder="Select mood" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="">No mood</SelectItem>
                       {moods.map(mood => (
                         <SelectItem key={mood.value} value={mood.value}>
                           {mood.label}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium mb-2">Content</label>
                 <Textarea
                   value={entryContent}
                   onChange={(e) => setEntryContent(e.target.value)}
                   placeholder="Write your thoughts, reflections, prayers..."
                   className="min-h-[200px]"
                   rows={8}
                 />
               </div>

               <div className="flex justify-between pt-4">
                 <Button variant="outline" onClick={closeEntryDialog}>
                   Cancel
                 </Button>
                 <Button 
                   onClick={handleSaveEntry}
                   disabled={loading || !entryTitle.trim() || !entryContent.trim()}
                   className="bg-blue-600 hover:bg-blue-700"
                 >
                   {loading ? 'Saving...' : editingEntry ? 'Update Entry' : 'Save Entry'}
                 </Button>
               </div>
             </div>
           </DialogContent>
         </Dialog>
       </div>
     </div>
   );
 };

 export default Journal;