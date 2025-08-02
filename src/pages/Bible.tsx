import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Search, Bookmark, Heart, Share, ChevronLeft, ChevronRight, 
  Book, Languages, StickyNote, Brain, 
  MessageCircle, BookOpen, Target,
  Copy, Highlighter, 
  ChevronDown, ChevronUp, Menu, Sparkles, PenTool, Share2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { 
  BibleBook, 
  BibleVerse, 
  getAllBooks, 
  getChapterVerses, 
  searchVerses, 
  saveBookmark, 
  getUserBookmarks,
  BIBLE_TRANSLATIONS,
  TranslationCode
} from '@/lib/local-bible';
import { NoteTaking } from '@/components/NoteTaking';
import { BibleAIChat } from '@/components/BibleAIChat';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';

const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'tamil', label: 'Tamil' }
];

// English translations available
const ENGLISH_TRANSLATIONS = BIBLE_TRANSLATIONS.filter(t => t.language === 'english');

const READING_PLANS = [
  { id: 'bible-year', name: 'Bible in a Year', duration: '365 days', description: 'Complete the Bible in one year' },
  { id: 'new-testament-90', name: 'New Testament in 90 Days', duration: '90 days', description: 'Focus on the New Testament' },
  { id: 'psalms-month', name: 'Psalms in a Month', duration: '31 days', description: 'One chapter of Psalms daily' },
  { id: 'gospels-30', name: 'Gospels in 30 Days', duration: '30 days', description: 'Read through the four Gospels' },
];

const HIGHLIGHT_COLORS = [
  { id: 'yellow', name: 'Yellow', color: 'bg-yellow-200 border-yellow-400' },
  { id: 'green', name: 'Green', color: 'bg-green-200 border-green-400' },
  { id: 'blue', name: 'Blue', color: 'bg-blue-200 border-blue-400' },
  { id: 'purple', name: 'Purple', color: 'bg-purple-200 border-purple-400' },
  { id: 'red', name: 'Red', color: 'bg-red-200 border-red-400' },
];



interface TamilBookName {
  book: {
    english: string;
    tamil: string;
  };
}

export default function Bible() {
  // SEO optimization
  useSEO(SEO_CONFIG.BIBLE);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [tamilBookNames, setTamilBookNames] = useState<TamilBookName[]>([]);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'tamil'>('english');
  const [selectedTranslation, setSelectedTranslation] = useState<TranslationCode>('KJV');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [highlights, setHighlights] = useState<Map<string, string>>(new Map());
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<{id: string, text: string, reference: string} | null>(null);

  // Mobile utility functions
  const copyVerse = (verse: BibleVerse) => {
    const verseText = `${verse.book_name} ${verse.chapter}:${verse.verse} - ${verse.text}`;
    navigator.clipboard.writeText(verseText);
    toast({ 
      title: "Verse copied to clipboard",
      description: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
    });
  };

  const shareVerse = (verse: BibleVerse) => {
    const verseText = `${verse.book_name} ${verse.chapter}:${verse.verse} - ${verse.text}`;
    if (navigator.share) {
      navigator.share({
        title: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
        text: verseText,
      });
    } else {
      copyVerse(verse);
    }
  };

  const handleHighlight = (verse: BibleVerse) => {
    highlightVerse(verse, 'yellow');
  };
  
  // Enhanced features state
  const [activeTab, setActiveTab] = useState('read');
  const [readingPlan, setReadingPlan] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [searchFilters, setSearchFilters] = useState({
    testament: 'all',
    book: 'all',
    exactMatch: false
  });
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [showVerseNumbers, setShowVerseNumbers] = useState(true);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [crossReferences, setCrossReferences] = useState<any[]>([]);
  
  // New state for UI improvements
  const [oldTestamentExpanded, setOldTestamentExpanded] = useState(false);
  const [newTestamentExpanded, setNewTestamentExpanded] = useState(false);
  const [showSearchFilters, setShowSearchFilters] = useState(false);
  
  // Mobile detection
  const isMobile = useIsMobile();

  useEffect(() => {
    loadBooks();
    loadTamilBookNames();
    if (user) {
      loadBookmarks();
      loadFavorites();
      loadHighlights();
      loadReadingProgress();
    }
  }, [user, selectedLanguage]);

  useEffect(() => {
    if (selectedBook) {
      loadChapter();
    }
  }, [selectedBook, selectedChapter, selectedLanguage, selectedTranslation]);

  const loadTamilBookNames = async () => {
    try {
      const response = await fetch('/Bible/Tamil bible/Books.json');
      const data = await response.json();
      setTamilBookNames(data);
    } catch (error) {
      console.error('Error loading Tamil book names:', error);
    }
  };



  const getBookDisplayName = (bookName: string): string => {
    if (selectedLanguage === 'tamil') {
      const tamilBook = tamilBookNames.find(t => t.book.english === bookName);
      return tamilBook?.book.tamil.trim() || bookName;
    }
    return bookName;
  };

  const loadBooks = async () => {
    setBooksLoading(true);
    
    try {
      const booksData = await getAllBooks();
      setBooks(booksData);
    } catch (error) {
      console.error('Error loading books:', error);
      toast({
        title: "Error",
        description: "Failed to load Bible books",
        variant: "destructive"
      });
    } finally {
      setBooksLoading(false);
    }
  };

  const loadChapter = async () => {
    if (!selectedBook) return;
    
    setLoading(true);
    try {
      const chapterVerses = await getChapterVerses(
        selectedBook.name, 
        selectedChapter, 
        selectedLanguage,
        selectedLanguage === 'english' ? selectedTranslation : 'TAMIL'
      );
      setVerses(chapterVerses);
      updateReadingProgress();
    } catch (error) {
      console.error('Error loading chapter:', error);
      toast({
        title: "Error",
        description: "Failed to load chapter verses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    if (!user) return;
    
    try {
      const userBookmarks = await getUserBookmarks(user.id);
      const bookmarkSet = new Set(userBookmarks.map(b => b.id));
      setBookmarks(bookmarkSet);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('verse_highlights')
        .select('verse_id')
        .eq('user_id', user.id)
        .eq('is_favorite', true);
      
      if (error) throw error;
      
      const favoriteSet = new Set<string>(data?.map(item => item.verse_id) || []);
      setFavorites(favoriteSet);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadHighlights = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('verse_highlights')
        .select('verse_id, color')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const highlightMap = new Map<string, string>();
      data?.forEach(item => {
        if (item.color) {
          highlightMap.set(item.verse_id, item.color);
        }
      });
      setHighlights(highlightMap);
    } catch (error) {
      console.error('Error loading highlights:', error);
    }
  };

  const loadReadingProgress = async () => {
    if (!user) return;
    
    try {
      // Load reading progress from local storage for now
      const stored = localStorage.getItem(`bible_progress_${user.id}`);
      if (stored) {
        setReadingProgress(parseFloat(stored));
      }
    } catch (error) {
      console.error('Error loading reading progress:', error);
    }
  };

  const updateReadingProgress = async () => {
    if (!user || !selectedBook) return;
    
    try {
      const newProgress = Math.min(readingProgress + 0.1, 100);
      
      // Store reading progress locally for now
      localStorage.setItem(`bible_progress_${user.id}`, newProgress.toString());
      localStorage.setItem(`bible_last_read_${user.id}`, JSON.stringify({
        book: selectedBook.name,
        chapter: selectedChapter,
        timestamp: new Date().toISOString()
      }));
      
      setReadingProgress(newProgress);
    } catch (error) {
      console.error('Error updating reading progress:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      let results = await searchVerses(
        searchQuery, 
        selectedLanguage,
        searchFilters.book !== 'all' ? searchFilters.book : undefined,
        selectedLanguage === 'english' ? selectedTranslation : 'TAMIL'
      );
      
      // Apply filters
      if (searchFilters.testament !== 'all') {
        results = results.filter(verse => {
          const book = books.find(b => b.name === verse.book_name);
          return book?.testament === searchFilters.testament;
        });
      }
      
      if (searchFilters.exactMatch) {
        results = results.filter(verse => 
          verse.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No Results",
          description: "No verses found matching your search",
        });
      } else {
        toast({
          title: "Search Complete",
          description: `Found ${results.length} verses`,
        });
      }
    } catch (error) {
      console.error('Error searching verses:', error);
      toast({
        title: "Search Error",
        description: "Failed to search verses. Please try again.",
        variant: "destructive"
      });
    }
  };

  const navigateChapter = (direction: 'prev' | 'next') => {
    if (!selectedBook) return;
    
    if (direction === 'prev' && selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
    } else if (direction === 'next' && selectedChapter < selectedBook.chapters) {
      setSelectedChapter(selectedChapter + 1);
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language as 'english' | 'tamil');
  };

  const openNoteModal = (verse: BibleVerse) => {
    setSelectedVerse({
      id: verse.id,
      text: verse.text,
      reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`
    });
    setNoteModalOpen(true);
  };

  const openAiChat = (verse: BibleVerse) => {
    setSelectedVerse({
      id: verse.id,
      text: verse.text,
      reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`
    });
    setAiChatOpen(true);
  };

  const toggleFavorite = async (verse: BibleVerse) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to save favorites",
        variant: "destructive"
      });
      return;
    }

    const verseId = verse.id;
    const isFavorite = favorites.has(verseId);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('verse_highlights')
          .delete()
          .eq('user_id', user.id)
          .eq('verse_id', verseId);
        
        if (error) throw error;
        
        const newFavorites = new Set(favorites);
        newFavorites.delete(verseId);
        setFavorites(newFavorites);
      } else {
        const { error } = await supabase
          .from('verse_highlights')
          .upsert({
            user_id: user.id,
            verse_id: verseId,
            color: 'yellow',
            category: 'favorite',
            is_favorite: true
          });
        
        if (error) throw error;
        
        const newFavorites = new Set(favorites);
        newFavorites.add(verseId);
        setFavorites(newFavorites);
      }

      toast({
        title: isFavorite ? "Removed from Favorites" : "Added to Favorites",
        description: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite",
        variant: "destructive"
      });
    }
  };

  const highlightVerse = async (verse: BibleVerse, color: string) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to highlight verses",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('verse_highlights')
        .upsert({
          user_id: user.id,
          verse_id: verse.id,
          color: color,
          category: 'highlight'
        });
      
      if (error) throw error;
      
      const newHighlights = new Map(highlights);
      newHighlights.set(verse.id, color);
      setHighlights(newHighlights);
      
      toast({
        title: "Verse Highlighted",
        description: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
      });
    } catch (error) {
      console.error('Error highlighting verse:', error);
      toast({
        title: "Error",
        description: "Failed to highlight verse",
        variant: "destructive"
      });
    }
  };

  const handleBookSelect = (bookName: string) => {
    const book = books.find(b => b.name === bookName);
    if (book) {
      setSelectedBook(book);
      setSelectedChapter(1);
    }
  };

  const getRandomVerse = () => {
    if (verses.length === 0) return;
    const randomVerse = verses[Math.floor(Math.random() * verses.length)];
    setSelectedVerse({
      id: randomVerse.id,
      text: randomVerse.text,
      reference: `${randomVerse.book_name} ${randomVerse.chapter}:${randomVerse.verse}`
    });
    toast({
      title: "Random Verse",
      description: `${randomVerse.book_name} ${randomVerse.chapter}:${randomVerse.verse}`,
    });
  };

  const oldTestamentBooks = books.filter(book => book.testament === 'old');
  const newTestamentBooks = books.filter(book => book.testament === 'new');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">

      <div className="flex h-screen">
        {/* Mobile Chapter Navigation - Improved positioning and size */}
        {isMobile && selectedBook && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-white rounded-xl shadow-lg p-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateChapter('prev')}
              disabled={selectedChapter <= 1}
              className="h-9 w-9 p-0 bg-white shadow-none border-gray-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2 min-w-[3rem] text-center">
              {selectedChapter}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateChapter('next')}
              disabled={selectedChapter >= (selectedBook.chapters || 1)}
              className="h-9 w-9 p-0 bg-white shadow-none border-gray-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Mobile Menu Button - Better positioning */}
        {isMobile && (
          <div className="fixed top-20 left-4 z-50">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 w-10 p-0 bg-white shadow-lg rounded-xl">
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="h-full overflow-auto">
                  {/* Mobile Navigation Content - Better organization */}
                  <Tabs value={activeTab} onValueChange={(value) => {
                    setActiveTab(value);
                    if (value === 'read') {
                      setSearchResults([]);
                    }
                  }} className="flex-1 flex flex-col h-full">
                    <TabsList className="grid w-full grid-cols-3 m-4 mb-0 h-12">
                      <TabsTrigger value="read" className="text-sm h-10 px-3">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Read
                      </TabsTrigger>
                      <TabsTrigger value="search" className="text-sm h-10 px-3">
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </TabsTrigger>
                      <TabsTrigger value="plans" className="text-sm h-10 px-3">
                        <Target className="h-4 w-4 mr-2" />
                        Plans
                      </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-auto px-4 pb-4">
                      <TabsContent value="read" className="mt-4 space-y-4">
                        {/* Language and Translation Selection - Mobile optimized */}
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Language</label>
                            <Select value={selectedLanguage} onValueChange={(value: 'english' | 'tamil') => setSelectedLanguage(value)}>
                              <SelectTrigger className="h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {LANGUAGES.map((lang) => (
                                  <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {selectedLanguage === 'english' && (
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">Translation</label>
                              <Select value={selectedTranslation} onValueChange={(value: TranslationCode) => setSelectedTranslation(value)}>
                                <SelectTrigger className="h-11">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ENGLISH_TRANSLATIONS.map((translation) => (
                                    <SelectItem key={translation.code} value={translation.code}>
                                      {translation.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        {/* Book Selection - Better mobile layout */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800 mb-3">Select Book</h3>
                          <div className="space-y-4">
                            {/* Old Testament */}
                            <Collapsible>
                              <CollapsibleTrigger asChild>
                                <Button variant="outline" className="w-full justify-between h-11">
                                  <span className="font-medium">Old Testament ({oldTestamentBooks.length})</span>
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-2">
                                <div className="grid grid-cols-2 gap-2">
                                  {oldTestamentBooks.map((book) => (
                                    <Button
                                      key={book.id}
                                      variant={selectedBook?.id === book.id ? "default" : "outline"}
                                      onClick={() => handleBookSelect(book.name)}
                                      className={`text-xs h-9 ${
                                        selectedBook?.id === book.id 
                                          ? 'bg-orange-500 text-white' 
                                          : 'text-gray-700'
                                      }`}
                                    >
                                      {book.name}
                                    </Button>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>

                            {/* New Testament */}
                            <Collapsible>
                              <CollapsibleTrigger asChild>
                                <Button variant="outline" className="w-full justify-between h-11">
                                  <span className="font-medium">New Testament ({newTestamentBooks.length})</span>
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-2">
                                <div className="grid grid-cols-2 gap-2">
                                  {newTestamentBooks.map((book) => (
                                    <Button
                                      key={book.id}
                                      variant={selectedBook?.id === book.id ? "default" : "outline"}
                                      onClick={() => handleBookSelect(book.name)}
                                      className={`text-xs h-9 ${
                                        selectedBook?.id === book.id 
                                          ? 'bg-orange-500 text-white' 
                                          : 'text-gray-700'
                                      }`}
                                    >
                                      {book.name}
                                    </Button>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        </div>

                        {/* Chapter Selection - Mobile optimized */}
                        {selectedBook && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-800 mb-3">
                              {selectedBook.name} - Chapters
                            </h3>
                            <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto">
                              {Array.from({ length: selectedBook.chapters || 1 }, (_, i) => i + 1).map((chapter) => (
                                <Button
                                  key={chapter}
                                  variant={selectedChapter === chapter ? "default" : "outline"}
                                  onClick={() => setSelectedChapter(chapter)}
                                  className={`h-10 text-sm ${
                                    selectedChapter === chapter 
                                      ? 'bg-orange-500 text-white' 
                                      : 'text-gray-700'
                                  }`}
                                >
                                  {chapter}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="search" className="mt-4 space-y-4">
                        {/* Search Section - Mobile optimized */}
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Search verses..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="h-11"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleSearch();
                                }
                              }}
                            />
                            <Button 
                              onClick={handleSearch} 
                              disabled={loading}
                              className="h-11 px-4 bg-orange-500 hover:bg-orange-600"
                            >
                              <Search className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Search Filters - Simplified for mobile */}
                          <div className="grid grid-cols-2 gap-2">
                            <Select value={searchFilters.testament} onValueChange={(value) => setSearchFilters({...searchFilters, testament: value})}>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Testament" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="old">Old Testament</SelectItem>
                                <SelectItem value="new">New Testament</SelectItem>
                              </SelectContent>
                            </Select>

                            <Select value={searchFilters.book} onValueChange={(value) => setSearchFilters({...searchFilters, book: value})}>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Book" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Books</SelectItem>
                                {books.map((book) => (
                                  <SelectItem key={book.id} value={book.name}>
                                    {book.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Search Results - Mobile optimized */}
                        {searchResults.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-gray-800">
                              Results ({searchResults.length})
                            </h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {searchResults.slice(0, 10).map((verse) => (
                                <div
                                  key={verse.id}
                                  className="p-3 bg-white rounded-lg border border-gray-200 text-sm"
                                >
                                  <div className="font-medium text-orange-600 mb-1">
                                    {verse.book_name} {verse.chapter}:{verse.verse}
                                  </div>
                                  <div className="text-gray-700 leading-relaxed">
                                    {verse.text}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="plans" className="mt-4 space-y-4">
                        {/* Reading Plans - Mobile optimized */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800 mb-3">Reading Plans</h3>
                          <div className="space-y-3">
                            {READING_PLANS.map((plan) => (
                              <div
                                key={plan.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  readingPlan === plan.id 
                                    ? 'border-orange-300 bg-orange-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => setReadingPlan(readingPlan === plan.id ? null : plan.id)}
                              >
                                <div className="font-medium text-sm text-gray-800">
                                  {plan.name}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {plan.duration} • {plan.description}
                                </div>
                              </div>
                            ))}
                          </div>

                          {readingPlan && (
                            <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                              <div className="text-sm font-medium text-orange-800 mb-2">
                                Progress: {readingProgress.toFixed(1)}%
                              </div>
                              <Progress value={readingProgress} className="h-2" />
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}

        {/* Desktop Sidebar - Unchanged for desktop */}
        {!isMobile && (
          <div className="w-80 bg-white border-r border-gray-200 overflow-hidden">
            {/* Desktop sidebar content remains the same */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-gray-800">Bible Study</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Language</label>
                  <Select value={selectedLanguage} onValueChange={(value: 'english' | 'tamil') => setSelectedLanguage(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedLanguage === 'english' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Translation</label>
                    <Select value={selectedTranslation} onValueChange={(value: TranslationCode) => setSelectedTranslation(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ENGLISH_TRANSLATIONS.map((translation) => (
                          <SelectItem key={translation.code} value={translation.code}>
                            {translation.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value);
              if (value === 'read') {
                setSearchResults([]);
              }
            }} className="flex-1 flex flex-col h-[calc(100vh-140px)]">
              <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
                <TabsTrigger value="read">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Read
                </TabsTrigger>
                <TabsTrigger value="search">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </TabsTrigger>
                <TabsTrigger value="plans">
                  <Target className="h-4 w-4 mr-2" />
                  Plans
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-auto px-4 pb-4">
                {/* Desktop tabs content remains similar to mobile but with better spacing */}
                <TabsContent value="read" className="mt-4 space-y-4">
                  {/* Book Selection */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Select Book</h3>
                    <div className="space-y-3">
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            <span>Old Testament ({oldTestamentBooks.length})</span>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <div className="grid grid-cols-3 gap-1">
                            {oldTestamentBooks.map((book) => (
                              <Button
                                key={book.id}
                                variant={selectedBook?.id === book.id ? "default" : "outline"}
                                onClick={() => handleBookSelect(book.name)}
                                className={`text-xs p-2 h-8 ${
                                  selectedBook?.id === book.id ? 'bg-orange-500' : ''
                                }`}
                              >
                                {book.name}
                              </Button>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            <span>New Testament ({newTestamentBooks.length})</span>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <div className="grid grid-cols-3 gap-1">
                            {newTestamentBooks.map((book) => (
                              <Button
                                key={book.id}
                                variant={selectedBook?.id === book.id ? "default" : "outline"}
                                onClick={() => handleBookSelect(book.name)}
                                className={`text-xs p-2 h-8 ${
                                  selectedBook?.id === book.id ? 'bg-orange-500' : ''
                                }`}
                              >
                                {book.name}
                              </Button>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>

                  {/* Chapter Selection */}
                  {selectedBook && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 mb-2">
                        {selectedBook.name} - Chapters
                      </h3>
                      <div className="grid grid-cols-6 gap-1 max-h-32 overflow-y-auto">
                        {Array.from({ length: selectedBook.chapters || 1 }, (_, i) => i + 1).map((chapter) => (
                          <Button
                            key={chapter}
                            variant={selectedChapter === chapter ? "default" : "outline"}
                            onClick={() => setSelectedChapter(chapter)}
                            className={`h-8 text-xs ${
                              selectedChapter === chapter ? 'bg-orange-500' : ''
                            }`}
                          >
                            {chapter}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="search" className="mt-4 space-y-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search verses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSearch();
                          }
                        }}
                      />
                      <Button onClick={handleSearch} disabled={loading}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Select value={searchFilters.testament} onValueChange={(value) => setSearchFilters({...searchFilters, testament: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Testament" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="old">Old Testament</SelectItem>
                          <SelectItem value="new">New Testament</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={searchFilters.book} onValueChange={(value) => setSearchFilters({...searchFilters, book: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Book" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Books</SelectItem>
                          {books.map((book) => (
                            <SelectItem key={book.id} value={book.name}>
                              {book.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold">Results ({searchResults.length})</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {searchResults.slice(0, 10).map((verse) => (
                          <div
                            key={verse.id}
                            className="p-2 bg-gray-50 rounded text-sm"
                          >
                            <div className="font-medium text-orange-600 mb-1">
                              {verse.book_name} {verse.chapter}:{verse.verse}
                            </div>
                            <div className="text-gray-700">
                              {verse.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="plans" className="mt-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Reading Plans</h3>
                    <div className="space-y-2">
                      {READING_PLANS.map((plan) => (
                        <div
                          key={plan.id}
                          className={`p-3 border rounded cursor-pointer transition-colors ${
                            readingPlan === plan.id ? 'border-orange-300 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setReadingPlan(readingPlan === plan.id ? null : plan.id)}
                        >
                          <div className="font-medium text-sm">{plan.name}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {plan.duration} • {plan.description}
                          </div>
                        </div>
                      ))}
                    </div>

                    {readingPlan && (
                      <div className="mt-4 p-3 bg-orange-50 rounded">
                        <div className="text-sm font-medium text-orange-800 mb-2">
                          Progress: {readingProgress.toFixed(1)}%
                        </div>
                        <Progress value={readingProgress} className="h-2" />
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}

        {/* Main Reading Area - Improved mobile experience */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Header - Mobile optimized */}
          <div className={`p-4 border-b border-gray-200 bg-white ${isMobile ? 'pt-2' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedBook && (
                  <>
                    <div className="flex items-center gap-2">
                      <h1 className={`font-bold text-gray-800 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                        {selectedBook.name}
                      </h1>
                      <Badge variant="outline" className="text-xs">
                        Chapter {selectedChapter}
                      </Badge>
                    </div>
                    {!isMobile && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateChapter('prev')}
                          disabled={selectedChapter <= 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateChapter('next')}
                          disabled={selectedChapter >= (selectedBook.chapters || 1)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Action Buttons - Mobile optimized */}
              <div className="flex items-center gap-2">
                {selectedBook && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={getRandomVerse}
                    className={`${isMobile ? 'h-9 px-3' : ''}`}
                  >
                    <Sparkles className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4 mr-2'}`} />
                    {!isMobile && 'Random'}
                  </Button>
                )}
                
                <Button
                  onClick={() => setAiChatOpen(true)}
                  className={`bg-orange-500 hover:bg-orange-600 text-white ${isMobile ? 'h-9 px-3' : ''}`}
                >
                  <MessageCircle className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4 mr-2'}`} />
                  {!isMobile && 'AI Chat'}
                </Button>
              </div>
            </div>

            {/* Reading Progress - Mobile optimized */}
            {readingPlan && (
              <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium text-orange-800 ${isMobile ? 'text-sm' : ''}`}>
                    Reading Progress
                  </span>
                  <span className={`text-orange-600 ${isMobile ? 'text-sm' : ''}`}>
                    {readingProgress.toFixed(1)}%
                  </span>
                </div>
                <Progress value={readingProgress} className="h-2" />
              </div>
            )}
          </div>

          {/* Verses Display - Mobile-Optimized Reading Experience */}
          <div className="flex-1 overflow-y-auto mobile-scroll">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading verses...</p>
                </div>
              </div>
            ) : selectedBook && verses.length > 0 ? (
              <div className={`${isMobile ? 'p-3' : 'p-8'} max-w-4xl mx-auto`}>
                
                {/* Mobile Chapter Navigation */}
                {isMobile && (
                  <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 -mx-3 px-3 py-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-800 truncate">
                          {getBookDisplayName(selectedBook.name)}
                        </h2>
                        <Badge variant="outline" className="text-sm">
                          Chapter {selectedChapter}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedChapter(Math.max(1, selectedChapter - 1))}
                          disabled={selectedChapter <= 1}
                          className="min-h-[40px] min-w-[40px] p-0 touch-optimized"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        <span className="text-lg font-bold text-orange-600 min-w-[40px] text-center">
                          {selectedChapter}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedChapter(selectedChapter + 1)}
                          disabled={selectedChapter >= (selectedBook?.chapters || 1)}
                          className="min-h-[40px] min-w-[40px] p-0 touch-optimized"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verses with Mobile-Optimized Layout */}
                <div className="space-y-6">
                  {verses.map((verse) => {
                    const verseId = verse.id;
                    const isBookmarked = bookmarks.has(verseId);
                    const isFavorited = favorites.has(verseId);
                    const highlightColor = highlights.get(verseId);
                    
                    return (
                      <div
                        key={verse.id}
                        className={`group relative rounded-xl transition-all duration-200 ${
                          highlightColor 
                            ? `bg-${highlightColor}-100 border-l-4 border-${highlightColor}-400 p-4` 
                            : 'hover:bg-gray-50 p-4'
                        } ${isMobile ? 'mx-1' : ''}`}
                      >
                        {/* Verse Content - Mobile-Optimized */}
                        <div className="flex items-start gap-4">
                          {/* Verse Number - Enhanced for Mobile */}
                          <div className="flex-shrink-0">
                            <span className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold shadow-sm ${
                              isMobile ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-base'
                            }`}>
                              {verse.verse}
                            </span>
                          </div>
                          
                          {/* Verse Text - Mobile-Optimized Typography */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-gray-800 leading-relaxed font-normal ${
                              isMobile 
                                ? 'text-lg leading-8 sm:text-xl sm:leading-9' // Larger text for mobile
                                : 'text-xl leading-9'
                            }`}>
                              {verse.text}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons - Mobile-Optimized */}
                        <div className={`flex items-center justify-end gap-2 mt-4 ${
                          isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        } transition-opacity`}>
                          
                          {/* Favorite Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(verse)}
                            className={`touch-optimized ${
                              isMobile ? 'min-h-[44px] min-w-[44px]' : 'h-9 w-9'
                            } p-0 ${
                              isFavorited 
                                ? 'text-red-500 hover:text-red-600 bg-red-50' 
                                : 'text-gray-400 hover:text-red-500'
                            }`}
                          >
                            <Heart className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} ${
                              isFavorited ? 'fill-current' : ''
                            }`} />
                          </Button>

                          {/* Highlight Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => highlightVerse(verse, 'yellow')}
                            className={`touch-optimized ${
                              isMobile ? 'min-h-[44px] min-w-[44px]' : 'h-9 w-9'
                            } p-0 text-gray-400 hover:text-yellow-500`}
                          >
                            <PenTool className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                          </Button>

                          {/* Copy Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyVerse(verse)}
                            className={`touch-optimized ${
                              isMobile ? 'min-h-[44px] min-w-[44px]' : 'h-9 w-9'
                            } p-0 text-gray-400 hover:text-blue-500`}
                          >
                            <Copy className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                          </Button>

                          {/* Share Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => shareVerse(verse)}
                            className={`touch-optimized ${
                              isMobile ? 'min-h-[44px] min-w-[44px]' : 'h-9 w-9'
                            } p-0 text-gray-400 hover:text-green-500`}
                          >
                            <Share2 className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Reading Progress */}
                {isMobile && (
                  <div className="mt-8 p-4 bg-orange-50 rounded-xl">
                    <div className="flex items-center justify-between text-sm text-orange-700">
                      <span>Chapter {selectedChapter} Progress</span>
                      <span>{verses.length} verses</span>
                    </div>
                    <div className="mt-2 h-2 bg-orange-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full transition-all duration-300"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State - Mobile Optimized */
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <BookOpen className={`mx-auto mb-4 text-gray-400 ${
                    isMobile ? 'h-16 w-16' : 'h-20 w-20'
                  }`} />
                  <h3 className={`font-semibold text-gray-700 mb-2 ${
                    isMobile ? 'text-lg' : 'text-xl'
                  }`}>
                    Select a Book to Begin Reading
                  </h3>
                  <p className={`text-gray-500 ${
                    isMobile ? 'text-sm' : 'text-base'
                  }`}>
                    Choose a book from the {isMobile ? 'menu' : 'sidebar'} to start your Bible study journey.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Note Taking Modal */}
      {noteModalOpen && selectedVerse && (
        <NoteTaking
          verseId={selectedVerse.id}
          verseText={selectedVerse.text}
          verseReference={selectedVerse.reference}
          isOpen={noteModalOpen}
          onClose={() => setNoteModalOpen(false)}
        />
      )}

      {/* AI Chat Modal */}
      {aiChatOpen && (
        <BibleAIChat
          verseId={selectedVerse?.id}
          verseText={selectedVerse?.text}
          verseReference={selectedVerse?.reference}
          isOpen={aiChatOpen}
          onClose={() => setAiChatOpen(false)}
        />
      )}
    </div>
  );
}

// Enhanced Verse Card Component
function VerseCard({ 
  verse, 
  fontSize, 
  showVerseNumbers, 
  isFavorite, 
  highlightColor,
  onToggleFavorite, 
  onHighlight, 
  onOpenNote, 
  onOpenAI, 
  toast,
  getBookDisplayName
}: any) {
  const [showHighlighter, setShowHighlighter] = useState(false);
  
  const getHighlightClass = (color: string) => {
    const colorMap: any = {
      'yellow': 'bg-yellow-100 border-l-4 border-yellow-400',
      'green': 'bg-green-100 border-l-4 border-green-400',
      'blue': 'bg-blue-100 border-l-4 border-blue-400',
      'purple': 'bg-purple-100 border-l-4 border-purple-400',
      'red': 'bg-red-100 border-l-4 border-red-400',
    };
    return colorMap[color] || '';
  };

  return (
    <div
      className={`group p-4 md:p-6 rounded-lg transition-all duration-300 hover:shadow-sm ${
        highlightColor 
          ? getHighlightClass(highlightColor)
          : 'border-l-4 border-orange-200 hover:border-orange-400 hover:bg-orange-50/30'
      }`}
      style={{ fontSize: `${fontSize + 2}px`, lineHeight: 1.8 }}
    >
      <div className="flex items-start gap-4 md:gap-6">
        {showVerseNumbers && (
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold text-sm md:text-base shadow-sm">
              {verse.verse}
            </span>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 font-normal leading-relaxed mb-3 md:mb-4 text-base md:text-lg">
            {verse.text}
          </p>
        </div>
        
        {/* Action Buttons - Horizontal layout, always visible on mobile */}
        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          {/* Highlight */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHighlighter(!showHighlighter)}
              className="h-6 w-6 md:h-8 md:w-8 p-0"
            >
              <Highlighter className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
            
            {showHighlighter && (
              <div className="absolute top-full right-0 mt-1 p-2 bg-white border rounded-lg shadow-lg z-10">
                <div className="flex gap-1">
                  {HIGHLIGHT_COLORS.map(color => (
                    <button
                      key={color.id}
                      onClick={() => {
                        onHighlight(verse, color.id);
                        setShowHighlighter(false);
                      }}
                      className={`w-6 h-6 rounded border-2 ${color.color}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Favorite */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(verse)}
            className="h-6 w-6 md:h-8 md:w-8 p-0"
          >
            <Heart className={`h-3 w-3 md:h-4 md:w-4 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`} />
          </Button>

          {/* Notes */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onOpenNote(verse)}
            className="h-6 w-6 md:h-8 md:w-8 p-0"
          >
            <StickyNote className="h-3 w-3 md:h-4 md:w-4" />
          </Button>

          {/* AI Analysis */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onOpenAI(verse)}
            className="h-6 w-6 md:h-8 md:w-8 p-0 text-orange-500 hover:text-orange-600"
          >
            <span className="text-sm font-bold">✦</span>
          </Button>
          
          {/* Share */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => {
              const bookName = getBookDisplayName ? getBookDisplayName(verse.book_name) : verse.book_name;
              const reference = `${bookName} ${verse.chapter}:${verse.verse}`;
              navigator.clipboard.writeText(`${reference} - ${verse.text}`);
              toast({ title: "Copied!", description: "Verse copied to clipboard" });
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}