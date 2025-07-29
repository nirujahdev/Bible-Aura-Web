import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, Plus, Edit3, Trash2, Search, FileText, 
  Save, Calendar, Quote, X, ChevronDown
} from "lucide-react";
import { getAllBooks, getChapterVerses } from "@/lib/local-bible";
import { UnifiedHeader } from "@/components/UnifiedHeader";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
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

const Journal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Core state
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Entry dialog state
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [entryTitle, setEntryTitle] = useState("");
  const [entryContent, setEntryContent] = useState("");
  const [entryMood, setEntryMood] = useState("");
  
  // Bible integration state
  const [showVerseSelector, setShowVerseSelector] = useState(false);
  const [bibleBooks, setBibleBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'tamil'>('english');
  const [chapterVerses, setChapterVerses] = useState<BibleVerse[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);

  // Stats
  const totalEntries = entries.length;
  const totalWords = entries.reduce((sum, entry) => sum + entry.content.split(' ').length, 0);

  const moods = [
    { value: "joyful", label: "😊 Joyful" },
    { value: "peaceful", label: "😌 Peaceful" },
    { value: "grateful", label: "🙏 Grateful" },
    { value: "contemplative", label: "🤔 Contemplative" },
    { value: "hopeful", label: "✨ Hopeful" },
    { value: "blessed", label: "🙌 Blessed" }
  ];

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
        mood: entryMood || null,
        verse_reference: selectedVerse ? `${selectedVerse.book_name} ${selectedVerse.chapter}:${selectedVerse.verse}` : null,
        verse_text: selectedVerse?.text || null,
        entry_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      };

      if (editingEntry) {
        // Update existing entry
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
        // Create new entry
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
      setEntryMood(entry.mood || "");
      if (entry.verse_text) {
        // Parse existing verse reference if available
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
    setEntryMood("");
    setSelectedVerse(null);
    setShowVerseSelector(false);
  };

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground">
              Please sign in to access your spiritual journal.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <UnifiedHeader 
        icon={FileText}
        title="My Spiritual Journal"
        subtitle="Document your spiritual journey and reflections"
      >
        <div className="flex items-center gap-4 text-sm text-white/80">
          <div className="flex items-center gap-2">
            <span>📊</span>
            <span>{totalEntries} entries</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📝</span>
            <span>{totalWords.toLocaleString()} words</span>
          </div>
          <Button 
            onClick={() => openEntryDialog()}
            size="sm" 
            className="bg-white text-orange-600 hover:bg-white/90 font-semibold ml-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </div>
      </UnifiedHeader>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search your journal entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base rounded-xl border-gray-200 focus:border-orange-500 shadow-sm"
            />
          </div>
        </div>

        {/* Entries */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your journal entries...</p>
          </div>
        ) : filteredEntries.length > 0 ? (
          <div className="grid gap-6">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="shadow-sm hover:shadow-md transition-shadow border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                        {entry.title}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(entry.created_at)}</span>
                        </div>
                        {entry.mood && (
                          <Badge variant="secondary" className="text-xs">
                            {moods.find(m => m.value === entry.mood)?.label || entry.mood}
                          </Badge>
                        )}
                        {entry.verse_reference && (
                          <Badge variant="outline" className="text-xs">
                            <Quote className="h-3 w-3 mr-1" />
                            {entry.verse_reference}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:ml-4 self-start">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEntryDialog(entry)}
                        className="text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span className="ml-1 hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="ml-1 hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {entry.verse_text && (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 mb-4 border-l-4 border-orange-500">
                      <p className="text-sm italic text-gray-700 mb-2">"{entry.verse_text}"</p>
                      <p className="text-xs font-medium text-orange-600">— {entry.verse_reference}</p>
                    </div>
                  )}
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900">No journal entries yet</h3>
            <p className="text-gray-600 mb-6">
              Start documenting your spiritual journey today
            </p>
            <Button onClick={() => openEntryDialog()} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Write Your First Entry
            </Button>
          </div>
        )}
      </div>

      {/* Entry Dialog */}
      <Dialog open={showEntryDialog} onOpenChange={(open) => !open && closeEntryDialog()}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
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
                placeholder="Enter a title for your entry..."
                className="h-11"
              />
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
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-sm italic text-gray-700 mb-1">"{selectedVerse.text}"</p>
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
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between pt-4">
              <Button variant="outline" onClick={closeEntryDialog} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEntry}
                disabled={loading || !entryTitle.trim() || !entryContent.trim()}
                className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
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