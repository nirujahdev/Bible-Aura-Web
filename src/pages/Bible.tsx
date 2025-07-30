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
import { 
  Search, Bookmark, Heart, Share, ChevronLeft, ChevronRight, 
  Star, Book, Sparkles, Globe, Languages, StickyNote, Brain, 
  MessageCircle, BookOpen, Filter, Calendar, Target, TrendingUp,
  Download, Copy, Highlighter, Eye, BarChart3, Clock, Shuffle,
  Link2, Quote, FileText, Settings, Zap, Compass, MapPin,
  ChevronDown, ChevronUp, Home, History, Bookmark as BookmarkIcon,
  Play, FastForward, RotateCcw, Menu
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { 
  BibleBook, 
  BibleVerse, 
  getAllBooks, 
  getChapterVerses, 
  searchVerses, 
  saveBookmark, 
  getUserBookmarks 
} from '@/lib/local-bible';
import { NoteTaking } from '@/components/NoteTaking';
import { AIAnalysis } from '@/components/AIAnalysis';

const LANGUAGES = [
  { value: 'english', label: 'English (KJV)' },
  { value: 'tamil', label: 'Tamil' }
];

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

// Popular book shortcuts for quick access
const POPULAR_BOOKS = {
  english: [
    { name: 'Genesis', icon: Star, color: 'text-purple-600' },
    { name: 'Psalms', icon: Heart, color: 'text-red-600' },
    { name: 'Proverbs', icon: Brain, color: 'text-blue-600' },
    { name: 'Matthew', icon: BookOpen, color: 'text-green-600' },
    { name: 'John', icon: Quote, color: 'text-orange-600' },
    { name: 'Romans', icon: Zap, color: 'text-yellow-600' },
  ],
  tamil: [
    { name: 'Genesis', tamil: 'ஆதியாகமம்', icon: Star, color: 'text-purple-600' },
    { name: 'Psalms', tamil: 'சங்கீதம்', icon: Heart, color: 'text-red-600' },
    { name: 'Proverbs', tamil: 'நீதிமொழிகள்', icon: Brain, color: 'text-blue-600' },
    { name: 'Matthew', tamil: 'மத்தேயு', icon: BookOpen, color: 'text-green-600' },
    { name: 'John', tamil: 'யோவான்', icon: Quote, color: 'text-orange-600' },
    { name: 'Romans', tamil: 'ரோமர்', icon: Zap, color: 'text-yellow-600' },
  ]
};

interface TamilBookName {
  book: {
    english: string;
    tamil: string;
  };
}

export default function Bible() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [tamilBookNames, setTamilBookNames] = useState<TamilBookName[]>([]);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'tamil'>('english');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [highlights, setHighlights] = useState<Map<string, string>>(new Map());
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<{id: string, text: string, reference: string} | null>(null);
  
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
  const [showTopShortcuts, setShowTopShortcuts] = useState(true);
  const [recentBooks, setRecentBooks] = useState<string[]>([]);

  useEffect(() => {
    loadBooks();
    loadTamilBookNames();
    loadRecentBooks();
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
      updateRecentBooks(selectedBook.name);
    }
  }, [selectedBook, selectedChapter, selectedLanguage]);

  const loadTamilBookNames = async () => {
    try {
      const response = await fetch('/Bible/Tamil bible/Books.json');
      const data = await response.json();
      setTamilBookNames(data);
    } catch (error) {
      console.error('Error loading Tamil book names:', error);
    }
  };

  const loadRecentBooks = () => {
    const stored = localStorage.getItem('bible_recent_books');
    if (stored) {
      setRecentBooks(JSON.parse(stored));
    }
  };

  const updateRecentBooks = (bookName: string) => {
    const updated = [bookName, ...recentBooks.filter(b => b !== bookName)].slice(0, 5);
    setRecentBooks(updated);
    localStorage.setItem('bible_recent_books', JSON.stringify(updated));
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
      const chapterVerses = await getChapterVerses(selectedBook.name, selectedChapter, selectedLanguage);
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
      let results = await searchVerses(searchQuery, selectedLanguage);
      
      // Apply filters
      if (searchFilters.testament !== 'all') {
        results = results.filter(verse => {
          const book = books.find(b => b.name === verse.book_name);
          return book?.testament === searchFilters.testament;
        });
      }
      
      if (searchFilters.book !== 'all') {
        results = results.filter(verse => verse.book_name === searchFilters.book);
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

  const openAiModal = (verse: BibleVerse) => {
    setSelectedVerse({
      id: verse.id,
      text: verse.text,
      reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`
    });
    setAiModalOpen(true);
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
  const currentTranslation = LANGUAGES.find(t => t.value === selectedLanguage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Top Shortcuts Bar */}
      {showTopShortcuts && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-bold text-orange-600 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Bible Study
                </h1>
                
                <Separator orientation="vertical" className="h-6" />
                
                {/* Quick Book Access */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Quick Access:</span>
                  {POPULAR_BOOKS[selectedLanguage].map((book) => {
                    const Icon = book.icon;
                    const displayName = selectedLanguage === 'tamil' && 'tamil' in book ? book.tamil : book.name;
                    return (
                      <Button
                        key={book.name}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBookSelect(book.name)}
                        className={`h-8 text-xs ${book.color} hover:bg-gray-100`}
                        title={`Go to ${book.name}`}
                      >
                        <Icon className="h-3 w-3 mr-1" />
                        {displayName}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Recent Books */}
                {recentBooks.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Recent:</span>
                    {recentBooks.slice(0, 3).map((bookName) => (
                      <Button
                        key={bookName}
                        variant="outline"
                        size="sm"
                        onClick={() => handleBookSelect(bookName)}
                        className="h-7 text-xs"
                      >
                        <History className="h-3 w-3 mr-1" />
                        {getBookDisplayName(bookName)}
                      </Button>
                    ))}
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTopShortcuts(false)}
                  className="h-7 w-7 p-0 text-gray-400"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Top Bar */}
      {!showTopShortcuts && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTopShortcuts(true)}
              className="h-6 text-xs text-gray-500"
            >
              <ChevronDown className="h-3 w-3 mr-1" />
              Show Quick Access
            </Button>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-120px)]">
        {/* Bible Content Panel */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
          {/* Reading Progress */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Reading Progress</span>
              <span className="text-xs text-gray-500">{readingProgress.toFixed(1)}%</span>
            </div>
            <Progress value={readingProgress} className="h-2" />
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
              <TabsTrigger value="read" className="text-xs">
                <BookOpen className="h-4 w-4 mr-1" />
                Read
              </TabsTrigger>
              <TabsTrigger value="search" className="text-xs">
                <Search className="h-4 w-4 mr-1" />
                Search
              </TabsTrigger>
              <TabsTrigger value="plans" className="text-xs">
                <Target className="h-4 w-4 mr-1" />
                Plans
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto">
              <TabsContent value="read" className="p-4 mt-0">
                {/* Language Selection */}
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    Translation
                  </label>
                  <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(language => (
                        <SelectItem key={language.value} value={language.value}>
                          {language.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Book Selection with Expandable Sections */}
                <div className="mb-4">
                  <label className="text-sm font-medium mb-3 block">Books</label>
                  <div className="space-y-3">
                    {/* Old Testament Section */}
                    <Collapsible open={oldTestamentExpanded} onOpenChange={setOldTestamentExpanded}>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-2 h-auto text-left"
                        >
                          <div className="flex items-center gap-2">
                            <Book className="h-4 w-4 text-orange-600" />
                            <span className="font-semibold text-gray-700">
                              {selectedLanguage === 'tamil' ? 'பழைய ஏற்பாடு' : 'Old Testament'}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {oldTestamentBooks.length}
                            </Badge>
                          </div>
                          {oldTestamentExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 pl-2">
                        <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto">
                          {oldTestamentBooks.map(book => (
                            <Button
                              key={book.id}
                              variant={selectedBook?.name === book.name ? "default" : "ghost"}
                              size="sm"
                              onClick={() => {
                                setSelectedBook(book);
                                setSelectedChapter(1);
                              }}
                              className="justify-start text-xs h-8 px-3"
                            >
                              <div className="flex items-center justify-between w-full">
                                <span>{getBookDisplayName(book.name)}</span>
                                <Badge variant="outline" className="text-xs ml-2">
                                  {book.chapters}
                                </Badge>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                    
                    {/* New Testament Section */}
                    <Collapsible open={newTestamentExpanded} onOpenChange={setNewTestamentExpanded}>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-2 h-auto text-left"
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-gray-700">
                              {selectedLanguage === 'tamil' ? 'புதிய ஏற்பாடு' : 'New Testament'}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {newTestamentBooks.length}
                            </Badge>
                          </div>
                          {newTestamentExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 pl-2">
                        <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto">
                          {newTestamentBooks.map(book => (
                            <Button
                              key={book.id}
                              variant={selectedBook?.name === book.name ? "default" : "ghost"}
                              size="sm"
                              onClick={() => {
                                setSelectedBook(book);
                                setSelectedChapter(1);
                              }}
                              className="justify-start text-xs h-8 px-3"
                            >
                              <div className="flex items-center justify-between w-full">
                                <span>{getBookDisplayName(book.name)}</span>
                                <Badge variant="outline" className="text-xs ml-2">
                                  {book.chapters}
                                </Badge>
                              </div>
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
                    <label className="text-sm font-medium mb-2 block">Chapters</label>
                    <div className="grid grid-cols-5 gap-1">
                      {Array.from({ length: Math.min(selectedBook.chapters, 25) }, (_, i) => i + 1).map(chapter => (
                        <Button
                          key={chapter}
                          variant={selectedChapter === chapter ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedChapter(chapter)}
                          className="text-xs h-8"
                        >
                          {chapter}
                        </Button>
                      ))}
                    </div>
                    
                    {selectedBook.chapters > 25 && (
                      <Select 
                        value={selectedChapter.toString()} 
                        onValueChange={(chapter) => setSelectedChapter(parseInt(chapter))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="More chapters..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(chapter => (
                            <SelectItem key={chapter} value={chapter.toString()}>
                              Chapter {chapter}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="search" className="p-4 mt-0">
                <div className="space-y-4">
                  <div>
                    <Input
                      placeholder="Search verses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} className="w-full mt-2">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>

                  {/* Search Filters */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Filters</h4>
                    
                    <div>
                      <label className="text-xs text-gray-500">Testament</label>
                      <Select 
                        value={searchFilters.testament} 
                        onValueChange={(value) => setSearchFilters(prev => ({ ...prev, testament: value }))}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="old">Old Testament</SelectItem>
                          <SelectItem value="new">New Testament</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="exactMatch"
                        checked={searchFilters.exactMatch}
                        onChange={(e) => setSearchFilters(prev => ({ ...prev, exactMatch: e.target.checked }))}
                        className="rounded"
                      />
                      <label htmlFor="exactMatch" className="text-xs">Exact match</label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="plans" className="p-4 mt-0">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Reading Plans</h4>
                  {READING_PLANS.map(plan => (
                    <Card key={plan.id} className="cursor-pointer hover:bg-gray-50">
                      <CardContent className="p-3">
                        <h5 className="font-medium text-sm">{plan.name}</h5>
                        <p className="text-xs text-gray-500 mb-1">{plan.duration}</p>
                        <p className="text-xs text-gray-600">{plan.description}</p>
                        <Button 
                          size="sm" 
                          className="mt-2 w-full"
                          onClick={() => setReadingPlan(plan.id)}
                        >
                          Start Plan
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Enhanced Controls */}
          <div className="bg-white border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedBook && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateChapter('prev')}
                    disabled={selectedChapter <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="text-center">
                    <h2 className="font-bold text-lg">
                      {getBookDisplayName(selectedBook.name)} {selectedChapter}
                    </h2>
                    <p className="text-xs text-gray-500">{currentTranslation?.label}</p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateChapter('next')}
                    disabled={selectedChapter >= (selectedBook.chapters || 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Reading Options */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                <span>A</span>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-16"
                />
                <span className="text-lg">A</span>
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVerseNumbers(!showVerseNumbers)}
                className={showVerseNumbers ? "bg-gray-100" : ""}
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setComparisonMode(!comparisonMode)}
                className={comparisonMode ? "bg-gray-100" : ""}
              >
                <Link2 className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={getRandomVerse}
                title="Random Verse"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Verses Display */}
          <div className="flex-1 overflow-auto bg-white">
            <div className="max-w-4xl mx-auto p-6">
              {searchResults.length > 0 ? (
                // Search Results
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">Search Results</h2>
                    <p className="text-gray-600">Found {searchResults.length} verses for "{searchQuery}"</p>
                  </div>
                  
                  <div className="space-y-4">
                    {searchResults.map((verse) => (
                      <VerseCard 
                        key={verse.id}
                        verse={verse}
                        fontSize={fontSize}
                        showVerseNumbers={showVerseNumbers}
                        isFavorite={favorites.has(verse.id)}
                        highlightColor={highlights.get(verse.id)}
                        onToggleFavorite={toggleFavorite}
                        onHighlight={highlightVerse}
                        onOpenNote={openNoteModal}
                        onOpenAI={openAiModal}
                        toast={toast}
                        getBookDisplayName={getBookDisplayName}
                      />
                    ))}
                  </div>
                </div>
              ) : verses.length > 0 ? (
                // Chapter Display
                <div>
                  <div className="space-y-4">
                    {verses.map((verse) => (
                      <VerseCard 
                        key={verse.id}
                        verse={verse}
                        fontSize={fontSize}
                        showVerseNumbers={showVerseNumbers}
                        isFavorite={favorites.has(verse.id)}
                        highlightColor={highlights.get(verse.id)}
                        onToggleFavorite={toggleFavorite}
                        onHighlight={highlightVerse}
                        onOpenNote={openNoteModal}
                        onOpenAI={openAiModal}
                        toast={toast}
                        getBookDisplayName={getBookDisplayName}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                // Empty State
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Start Reading</h3>
                    <p className="text-gray-600 mb-4">Select a book and chapter to begin your Bible study journey.</p>
                    
                    {/* Quick start buttons */}
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setOldTestamentExpanded(true);
                          setActiveTab('read');
                        }}
                      >
                        <Book className="h-4 w-4 mr-2" />
                        Browse Old Testament
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setNewTestamentExpanded(true);
                          setActiveTab('read');
                        }}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Browse New Testament
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedVerse && (
        <>
          <NoteTaking
            verseId={selectedVerse.id}
            verseText={selectedVerse.text}
            verseReference={selectedVerse.reference}
            isOpen={noteModalOpen}
            onClose={() => setNoteModalOpen(false)}
          />
          
          <AIAnalysis
            verseId={selectedVerse.id}
            verseText={selectedVerse.text}
            verseReference={selectedVerse.reference}
            isOpen={aiModalOpen}
            onClose={() => setAiModalOpen(false)}
          />
        </>
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
      className={`group p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${
        highlightColor 
          ? getHighlightClass(highlightColor)
          : 'border-gray-200 hover:border-orange-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50'
      }`}
      style={{ fontSize: `${fontSize}px`, lineHeight: 1.7 }}
    >
      <div className="flex items-start gap-4">
        {showVerseNumbers && (
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold text-sm">
              {verse.verse}
            </span>
          </div>
        )}
        
        <div className="flex-1">
          <p className="text-gray-800 font-medium leading-relaxed mb-3">
            {verse.text}
          </p>
          
          {verse.book_name && (
            <Badge variant="outline" className="text-xs">
              {getBookDisplayName ? getBookDisplayName(verse.book_name) : verse.book_name} {verse.chapter}:{verse.verse}
            </Badge>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Highlight */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHighlighter(!showHighlighter)}
              className="h-8 w-8 p-0"
            >
              <Highlighter className="h-4 w-4" />
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
            className="h-8 w-8 p-0"
          >
            <Heart className={`h-4 w-4 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`} />
          </Button>

          {/* Notes */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onOpenNote(verse)}
            className="h-8 w-8 p-0"
          >
            <StickyNote className="h-4 w-4" />
          </Button>

          {/* AI Analysis */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onOpenAI(verse)}
            className="h-8 w-8 p-0"
          >
            <Brain className="h-4 w-4" />
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