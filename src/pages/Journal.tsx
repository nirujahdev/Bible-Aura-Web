import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, Plus, Edit3, Trash2, Search, FileText, 
  Save, Calendar as CalendarIcon, Quote, X, ChevronDown,
  ChevronLeft, ChevronRight, Menu, Briefcase, PartyPopper,
  User, MapPin, GraduationCap, Users, Settings
} from "lucide-react";
import { getAllBooks, getChapterVerses } from "@/lib/local-bible";

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
  { id: 'work', name: 'Work', icon: Briefcase, color: 'bg-blue-500' },
  { id: 'events', name: 'Events', icon: PartyPopper, color: 'bg-green-500' },
  { id: 'personal', name: 'Personal', icon: User, color: 'bg-purple-500' },
  { id: 'trips', name: 'Trips', icon: MapPin, color: 'bg-orange-500' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'bg-indigo-500' },
  { id: 'social', name: 'Social', icon: Users, color: 'bg-pink-500' },
];

const moods = [
  { value: "joyful", label: "😊 Joyful" },
  { value: "peaceful", label: "😌 Peaceful" },
  { value: "grateful", label: "🙏 Grateful" },
  { value: "contemplative", label: "🤔 Contemplative" },
  { value: "hopeful", label: "✨ Hopeful" },
  { value: "blessed", label: "🙌 Blessed" }
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
  
  // Entry dialog state
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [entryTitle, setEntryTitle] = useState("");
  const [entryContent, setEntryContent] = useState("");
  const [entryCategory, setEntryCategory] = useState("personal");
  const [entryMood, setEntryMood] = useState("");
  
  // Bible integration state
  const [showVerseSelector, setShowVerseSelector] = useState(false);
  const [bibleBooks, setBibleBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'tamil'>('english');
  const [chapterVerses, setChapterVerses] = useState<BibleVerse[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);

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
  }, [entries, selectedCategory, searchQuery, selectedDate]);

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
        updated_at: new Date().toISOString()
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

  const openEntryDialog = (entry?: JournalEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setEntryTitle(entry.title);
      setEntryContent(entry.content);
      setEntryCategory(entry.category || 'personal');
      setEntryMood(entry.mood || "");
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

  if (!user) {
    return (
      <div className="min-h-screen bg-purple-600 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-white">
          <CardContent className="p-8 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-purple-500" />
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
    <div className="min-h-screen bg-purple-600 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Menu className="h-6 w-6 text-gray-400" />
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 text-sm border-gray-200"
              />
            </div>
            <Button size="icon" variant="ghost" className="h-9 w-9">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <h2 className="text-lg font-semibold text-gray-800 mb-4">Journals</h2>
          
          {/* Categories */}
          <div className="space-y-2">
            <Button
              variant={selectedCategory === 'all' ? "default" : "ghost"}
              className="w-full justify-start h-9 text-sm"
              onClick={() => setSelectedCategory('all')}
            >
              <FileText className="h-4 w-4 mr-3" />
              All Entries
            </Button>
            
                         {categories.map((category) => {
               const Icon = category.icon;
               const entryCount = entries.filter(e => (e.category || 'personal') === category.id).length;
              
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  className="w-full justify-between h-9 text-sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="flex items-center">
                    <Icon className="h-4 w-4 mr-3" />
                    {category.name}
                  </div>
                  <span className="text-xs text-gray-500">{entryCount}</span>
                </Button>
              );
            })}
            
            <Button
              variant="ghost"
              className="w-full justify-start h-9 text-sm text-purple-600"
              onClick={() => openEntryDialog()}
            >
              <Plus className="h-4 w-4 mr-3" />
              Add new
            </Button>
          </div>
        </div>

        {/* Calendar */}
        <div className="p-6 flex-1">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-800">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
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
                  backgroundColor: '#8b5cf6', 
                  color: 'white',
                  borderRadius: '50%'
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Entries List */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                {formatDate(selectedDate)}
              </h2>
              <Button
                size="sm"
                onClick={() => openEntryDialog()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {filteredEntries.length > 0 ? (
                                 filteredEntries.map((entry) => {
                   const Icon = getCategoryIcon(entry.category || 'personal');
                   const category = categories.find(cat => cat.id === (entry.category || 'personal'));
                  
                  return (
                    <Card
                      key={entry.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedEntry?.id === entry.id ? 'ring-2 ring-purple-500' : ''
                      }`}
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-center min-w-[40px]">
                            <div className="text-2xl font-bold text-gray-800">
                              {formatDay(new Date(entry.created_at))}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDayName(new Date(entry.created_at)).slice(0, 3)}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className="h-4 w-4 text-gray-500" />
                              <h3 className="font-medium text-gray-800 text-sm">
                                {entry.title}
                              </h3>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {entry.content}
                            </p>
                            {category && (
                              <Badge 
                                variant="secondary" 
                                className="mt-2 text-xs"
                              >
                                {category.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 text-sm">No entries for this date</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={() => openEntryDialog()}
                  >
                    Create Entry
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Entry Detail */}
        <div className="flex-1 bg-white overflow-y-auto">
          {selectedEntry ? (
            <div className="p-8 max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedEntry.title}
                  </h1>
                  <p className="text-gray-500">
                    {formatDayName(new Date(selectedEntry.created_at))}, {formatDate(new Date(selectedEntry.created_at))}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEntryDialog(selectedEntry)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteEntry(selectedEntry.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              {selectedEntry.verse_text && (
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6 rounded-r-lg">
                  <p className="text-gray-700 italic mb-2">"{selectedEntry.verse_text}"</p>
                  <p className="text-sm font-medium text-purple-600">
                    — {selectedEntry.verse_reference}
                  </p>
                </div>
              )}

              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {selectedEntry.content}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
                {selectedEntry.category && (
                  <Badge variant="secondary">
                    {categories.find(cat => cat.id === selectedEntry.category)?.name || selectedEntry.category}
                  </Badge>
                )}
                {selectedEntry.mood && (
                  <Badge variant="outline">
                    {moods.find(m => m.value === selectedEntry.mood)?.label || selectedEntry.mood}
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  What lesson did I learn this week?
                </h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  Recently, I've been exploring the true meaning of contentment. 
                  My perspective has been leading me to conclude that grounding and commitment are a bit like cousins. At first glance, they have similar features...
                </p>
                <Button onClick={() => openEntryDialog()} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Entry
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Entry Dialog */}
      <Dialog open={showEntryDialog} onOpenChange={(open) => !open && closeEntryDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={entryTitle}
                onChange={(e) => setEntryTitle(e.target.value)}
                placeholder="What lesson did I learn today?"
                className="h-11"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select value={entryCategory} onValueChange={setEntryCategory}>
                <SelectTrigger className="h-11">
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
                <SelectTrigger className="h-11">
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

            {/* Bible Verse Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Bible Verse (optional)</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVerseSelector(!showVerseSelector)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {selectedVerse ? 'Change Verse' : 'Add Verse'}
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showVerseSelector ? 'rotate-180' : ''}`} />
                </Button>
              </div>

              {selectedVerse && (
                <div className="bg-purple-50 rounded-lg p-3 mb-3">
                  <p className="text-sm italic text-gray-700 mb-1">"{selectedVerse.text}"</p>
                  <p className="text-xs font-medium text-purple-600">
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
                <Card className="p-4 border">
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
                        <div className="max-h-40 overflow-y-auto border rounded">
                          {chapterVerses.map(verse => (
                            <button
                              key={verse.id}
                              onClick={() => {
                                setSelectedVerse(verse);
                                setShowVerseSelector(false);
                              }}
                              className="w-full text-left p-2 hover:bg-gray-50 border-b last:border-b-0 text-xs"
                            >
                              <span className="font-medium text-purple-600">{verse.verse}.</span> {verse.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <Textarea
                value={entryContent}
                onChange={(e) => setEntryContent(e.target.value)}
                placeholder="Share your thoughts, reflections, prayers, or experiences..."
                className="min-h-[200px] resize-none"
                rows={8}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={closeEntryDialog}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEntry}
                disabled={loading || !entryTitle.trim() || !entryContent.trim()}
                className="bg-purple-600 hover:bg-purple-700"
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