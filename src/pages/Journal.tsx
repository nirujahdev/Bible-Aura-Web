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
  Copy, Pin, Feather
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
    filterEntries();
  }, [entries, selectedCategory, searchQuery, selectedDate, sortBy]);

  useEffect(() => {
    if (selectedBook) {
      loadChapterVerses();
    }
  }, [selectedBook, selectedChapter, selectedLanguage]);

  const loadEntries = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
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

    // Filter by selected date
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    filtered = filtered.filter(entry => {
      const entryDate = new Date(entry.created_at).toISOString().split('T')[0];
      return entryDate === selectedDateStr;
    });

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
    if (!user || !entryTitle.trim() || !entryContent.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both title and content",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
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
        metadata: JSON.stringify({
          prayer_requests: prayerRequests.filter(p => p.trim()),
          gratitude_items: gratitudeItems.filter(g => g.trim()),
          template_used: selectedTemplate
        }) as any
      };

      if (editingEntry) {
        const { error } = await supabase
          .from('journal_entries')
          .update(entryData)
          .eq('id', editingEntry.id);

        if (error) throw error;
        
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

        if (error) throw error;
        
        toast({
          title: "Entry created",
          description: "Your new journal entry has been saved",
        });
      }

      closeEntryDialog();
      loadEntries();
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
      setEntryMood(entry.mood || "");
      
      setPrayerRequests([]);
      setGratitudeItems([]);
      setSelectedTemplate(null);
      
      if (entry.verse_text) {
        setSelectedVerse({
          id: 'existing',
          chapter: 0,
          verse: 0,
          text: entry.verse_text,
          book_name: entry.verse_reference?.split(' ')[0] || ''
        });
      }
    } else {
      setEditingEntry(null);
      setEntryTitle("");
      setEntryContent("");
      setEntryCategory("personal");
      setEntryMood("");
      setSelectedVerse(null);
      setPrayerRequests([]);
      setGratitudeItems([]);
      
      if (template) {
        setSelectedTemplate(template);
        const templateData = journalTemplates.find(t => t.id === template);
        if (templateData) {
          setEntryTitle(templateData.name);
          setEntryContent(templateData.prompts.join('\n\n'));
        }
      } else {
        setSelectedTemplate(null);
      }
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
    setSelectedVerse(null);
    setShowVerseSelector(false);
    setSelectedTemplate(null);
    setPrayerRequests([]);
    setGratitudeItems([]);
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-white/95 backdrop-blur-sm border-orange-200">
          <CardContent className="p-8 text-center">
            <Feather className="h-16 w-16 mx-auto mb-4 text-orange-500" />
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Sign In Required</h2>
            <p className="text-gray-600">
              Please sign in to access your spiritual journal.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="flex h-[calc(100vh-120px)]">
        {/* Enhanced Sidebar */}
        <div className="w-80 bg-white/95 backdrop-blur-sm border-r border-orange-200 flex flex-col">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-orange-500 to-amber-600 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Feather className="h-8 w-8 text-orange-100" />
              <div>
                <h2 className="text-xl font-bold">My Journal</h2>
                <p className="text-orange-100 text-sm">Capture your spiritual journey</p>
              </div>
            </div>
            <Button
              onClick={() => openEntryDialog()}
              className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeView} onValueChange={setActiveView} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
              <TabsTrigger value="entries" className="text-sm">
                <FileText className="h-4 w-4 mr-2" />
                Entries
              </TabsTrigger>
              <TabsTrigger value="calendar" className="text-sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendar
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto">
              <TabsContent value="entries" className="p-4 mt-0">
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search entries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-orange-200 focus:border-orange-400"
                    />
                  </div>

                  {/* Categories */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-gray-700">Categories</h4>
                    <div className="space-y-1">
                      <Button
                        variant={selectedCategory === 'all' ? "default" : "ghost"}
                        className={`w-full justify-start h-9 text-sm ${
                          selectedCategory === 'all' 
                            ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                            : 'hover:bg-orange-50'
                        }`}
                        onClick={() => setSelectedCategory('all')}
                      >
                        <FileText className="h-4 w-4 mr-3" />
                        All Entries
                        <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-800">
                          {entries.length}
                        </Badge>
                      </Button>
                      
                      {categories.map((category) => {
                        const Icon = category.icon;
                        const entryCount = entries.filter(e => (e.category || 'personal') === category.id).length;
                        
                        if (entryCount === 0) return null;
                        
                        return (
                          <Button
                            key={category.id}
                            variant={selectedCategory === category.id ? "default" : "ghost"}
                            className={`w-full justify-between h-9 text-sm ${
                              selectedCategory === category.id 
                                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                                : 'hover:bg-orange-50'
                            }`}
                            onClick={() => setSelectedCategory(category.id)}
                          >
                            <div className="flex items-center">
                              <Icon className="h-4 w-4 mr-3" />
                              {category.name}
                            </div>
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                              {entryCount}
                            </Badge>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Templates */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-gray-700">Templates</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {journalTemplates.map((template) => (
                        <Button
                          key={template.id}
                          variant="outline"
                          size="sm"
                          onClick={() => openEntryDialog(undefined, template.id)}
                          className="flex flex-col items-center p-3 h-auto border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                        >
                          <span className="text-lg mb-1">{template.icon}</span>
                          <span className="text-xs text-center">{template.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="calendar" className="p-4 mt-0">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-800">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-orange-100"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-orange-100"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    className="w-full"
                    modifiers={{
                      hasEntry: (date) => getEntriesForDate(date).length > 0
                    }}
                    modifiersStyles={{
                      hasEntry: { 
                        backgroundColor: '#f97316', 
                        color: 'white',
                        borderRadius: '50%'
                      }
                    }}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Entries List */}
        <div className="w-96 bg-orange-50/50 backdrop-blur-sm border-r border-orange-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {formatDate(selectedDate)}
                </h2>
                <p className="text-sm text-gray-500">
                  {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
                </p>
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 h-8 border-orange-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => {
                  const Icon = getCategoryIcon(entry.category || 'personal');
                  const category = categories.find(cat => cat.id === (entry.category || 'personal'));
                  
                  return (
                    <Card
                      key={entry.id}
                      className={`cursor-pointer transition-all hover:shadow-md border-orange-200 ${
                        selectedEntry?.id === entry.id ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:bg-orange-25'
                      } ${entry.is_pinned ? 'border-l-4 border-l-orange-400' : ''}`}
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-center min-w-[40px]">
                            <div className="text-xl font-bold text-orange-600">
                              {formatDay(new Date(entry.created_at))}
                            </div>
                            <div className="text-xs text-orange-500">
                              {formatDayName(new Date(entry.created_at)).slice(0, 3)}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className="h-4 w-4 text-orange-500 flex-shrink-0" />
                              <h3 className="font-medium text-gray-800 text-sm truncate">
                                {entry.title}
                              </h3>
                              {entry.is_pinned && (
                                <Pin className="h-3 w-3 text-orange-500 flex-shrink-0" />
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {entry.content}
                            </p>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              {category && (
                                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                  {category.name}
                                </Badge>
                              )}
                              
                              {entry.mood && (
                                <Badge variant="outline" className={`text-xs ${getMoodColor(entry.mood)}`}>
                                  {moods.find(m => m.value === entry.mood)?.label}
                                </Badge>
                              )}
                              
                              {entry.verse_text && (
                                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                  <Book className="h-3 w-3 mr-1" />
                                  Verse
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-orange-300" />
                  <p className="text-gray-500 text-sm mb-4">No entries for this date</p>
                  <Button
                    size="sm"
                    onClick={() => openEntryDialog()}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Create Entry
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Entry Detail */}
        <div className="flex-1 bg-white/95 backdrop-blur-sm overflow-y-auto">
          {selectedEntry ? (
            <div className="p-8 max-w-4xl mx-auto">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-800">
                      {selectedEntry.title}
                    </h1>
                    {selectedEntry.is_pinned && (
                      <Pin className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{formatDayName(new Date(selectedEntry.created_at))}, {formatDate(new Date(selectedEntry.created_at))}</span>
                    <span>•</span>
                    <span>{selectedEntry.content.split(' ').length} words</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePin(selectedEntry)}
                    className="hover:bg-orange-50"
                  >
                    <Pin className={`h-4 w-4 ${selectedEntry.is_pinned ? 'text-orange-500' : ''}`} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`${selectedEntry.title}\n\n${selectedEntry.content}`);
                      toast({ title: "Copied!", description: "Entry copied to clipboard" });
                    }}
                    className="hover:bg-orange-50"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEntryDialog(selectedEntry)}
                    className="border-orange-200 hover:bg-orange-50"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteEntry(selectedEntry.id)}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              {/* Entry Metadata */}
              <div className="flex items-center gap-4 mb-6">
                {selectedEntry.category && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {categories.find(cat => cat.id === selectedEntry.category)?.name || selectedEntry.category}
                  </Badge>
                )}
                
                {selectedEntry.mood && (
                  <Badge className={getMoodColor(selectedEntry.mood)}>
                    {moods.find(m => m.value === selectedEntry.mood)?.label || selectedEntry.mood}
                  </Badge>
                )}
              </div>

              {/* Bible Verse */}
              {selectedEntry.verse_text && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 p-6 mb-6 rounded-r-xl">
                  <div className="flex items-start gap-3">
                    <Quote className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-gray-700 italic mb-3 text-lg leading-relaxed">
                        "{selectedEntry.verse_text}"
                      </p>
                      <p className="text-sm font-semibold text-orange-600">
                        — {selectedEntry.verse_reference}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Entry Content */}
              <div className="prose max-w-none mb-8">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg">
                  {selectedEntry.content}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <Feather className="h-16 w-16 mx-auto mb-4 text-orange-300" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  Your Spiritual Journey Awaits
                </h3>
                <p className="text-gray-500 mb-6">
                  Select an entry to read or create a new one to capture your thoughts, prayers, and reflections.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={() => openEntryDialog()} 
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Entry
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => openEntryDialog(undefined, 'daily-reflection')}
                    className="border-orange-200 hover:bg-orange-50"
                  >
                    📝 Daily Reflection
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Entry Dialog */}
      <Dialog open={showEntryDialog} onOpenChange={(open) => !open && closeEntryDialog()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-orange-700">
              {selectedTemplate && (
                <span className="text-2xl">
                  {journalTemplates.find(t => t.id === selectedTemplate)?.icon}
                </span>
              )}
              {editingEntry ? 'Edit Entry' : selectedTemplate ? journalTemplates.find(t => t.id === selectedTemplate)?.name : 'New Journal Entry'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Template Selection */}
            {!editingEntry && !selectedTemplate && (
              <div>
                <label className="block text-sm font-medium mb-2">Choose a Template (Optional)</label>
                <div className="grid grid-cols-2 gap-3">
                  {journalTemplates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        setEntryTitle(template.name);
                        setEntryContent(template.prompts.join('\n\n'));
                      }}
                      className="flex flex-col items-center p-4 h-auto border-orange-200 hover:bg-orange-50"
                    >
                      <span className="text-2xl mb-2">{template.icon}</span>
                      <span className="font-medium">{template.name}</span>
                      <span className="text-xs text-gray-500 mt-1">{template.description}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={entryTitle}
                onChange={(e) => setEntryTitle(e.target.value)}
                placeholder="What's on your heart today?"
                className="h-11 border-orange-200 focus:border-orange-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select value={entryCategory} onValueChange={setEntryCategory}>
                  <SelectTrigger className="h-11 border-orange-200">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => {
                      const Icon = category.icon;
                      return (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center">
                            <Icon className="h-4 w-4 mr-2" />
                            {category.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Mood Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Mood (optional)</label>
                <Select value={entryMood} onValueChange={setEntryMood}>
                  <SelectTrigger className="h-11 border-orange-200">
                    <SelectValue placeholder="How are you feeling?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No mood selected</SelectItem>
                    {moods.map(mood => (
                      <SelectItem key={mood.value} value={mood.value}>
                        {mood.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bible Verse Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Bible Verse (optional)</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVerseSelector(!showVerseSelector)}
                  className="border-orange-200 hover:bg-orange-50"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {selectedVerse ? 'Change Verse' : 'Add Verse'}
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showVerseSelector ? 'rotate-180' : ''}`} />
                </Button>
              </div>

              {selectedVerse && (
                <div className="bg-orange-50 rounded-lg p-4 mb-3 border-l-4 border-orange-400">
                  <p className="text-sm italic text-gray-700 mb-2">"{selectedVerse.text}"</p>
                  <p className="text-xs font-medium text-orange-600">
                    — {selectedVerse.book_name} {selectedVerse.chapter}:{selectedVerse.verse}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedVerse(null)}
                    className="text-red-600 hover:text-red-700 mt-2 p-0 h-auto"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Remove verse
                  </Button>
                </div>
              )}

              {showVerseSelector && (
                <Card className="p-4 border border-orange-200">
                  <div className="space-y-4">
                    {/* Language Selection */}
                    <div>
                      <label className="block text-xs font-medium mb-1">Language</label>
                      <Select value={selectedLanguage} onValueChange={(value: any) => setSelectedLanguage(value)}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map(lang => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Book Selection */}
                    <div>
                      <label className="block text-xs font-medium mb-1">Book</label>
                      <Select value={selectedBook?.id || ""} onValueChange={(bookId) => {
                        const book = bibleBooks.find(b => b.id === bookId);
                        setSelectedBook(book || null);
                        setSelectedChapter(1);
                      }}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select a book" />
                        </SelectTrigger>
                        <SelectContent>
                          {bibleBooks.map(book => (
                            <SelectItem key={book.id} value={book.id}>
                              {book.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Chapter Selection */}
                    {selectedBook && (
                      <div>
                        <label className="block text-xs font-medium mb-1">Chapter</label>
                        <Select value={selectedChapter.toString()} onValueChange={(chapter) => setSelectedChapter(parseInt(chapter))}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: selectedBook.chapters }, (_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()}>
                                Chapter {i + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Verse Selection */}
                    {chapterVerses.length > 0 && (
                      <div>
                        <label className="block text-xs font-medium mb-2">Select Verse</label>
                        <div className="max-h-40 overflow-y-auto border rounded border-orange-200">
                          {chapterVerses.map(verse => (
                            <button
                              key={verse.id}
                              onClick={() => {
                                setSelectedVerse(verse);
                                setShowVerseSelector(false);
                              }}
                              className="w-full text-left p-2 hover:bg-orange-50 border-b last:border-b-0 text-xs"
                            >
                              <span className="font-medium text-orange-600">{verse.verse}.</span> {verse.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Additional Fields for specific templates */}
            {(selectedTemplate === 'prayer-journal' || entryCategory === 'prayer') && (
              <div>
                <label className="block text-sm font-medium mb-2">Prayer Requests</label>
                <div className="space-y-2">
                  {prayerRequests.map((request, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={request}
                        onChange={(e) => {
                          const updated = [...prayerRequests];
                          updated[index] = e.target.value;
                          setPrayerRequests(updated);
                        }}
                        placeholder="Enter prayer request..."
                        className="border-orange-200"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updated = prayerRequests.filter((_, i) => i !== index);
                          setPrayerRequests(updated);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPrayerRequests([...prayerRequests, ''])}
                    className="border-orange-200 hover:bg-orange-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Prayer Request
                  </Button>
                </div>
              </div>
            )}

            {(selectedTemplate === 'gratitude' || entryCategory === 'gratitude') && (
              <div>
                <label className="block text-sm font-medium mb-2">Gratitude Items</label>
                <div className="space-y-2">
                  {gratitudeItems.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => {
                          const updated = [...gratitudeItems];
                          updated[index] = e.target.value;
                          setGratitudeItems(updated);
                        }}
                        placeholder="Something you're grateful for..."
                        className="border-orange-200"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updated = gratitudeItems.filter((_, i) => i !== index);
                          setGratitudeItems(updated);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGratitudeItems([...gratitudeItems, ''])}
                    className="border-orange-200 hover:bg-orange-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Gratitude Item
                  </Button>
                </div>
              </div>
            )}

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <Textarea
                value={entryContent}
                onChange={(e) => setEntryContent(e.target.value)}
                placeholder="Share your thoughts, reflections, prayers, or experiences..."
                className="min-h-[300px] resize-none border-orange-200 focus:border-orange-400"
                rows={12}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={closeEntryDialog} className="border-gray-300">
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEntry}
                disabled={loading || !entryTitle.trim() || !entryContent.trim()}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : editingEntry ? 'Update Entry' : 'Save Entry'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Journal;