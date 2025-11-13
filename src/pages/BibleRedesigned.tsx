// 📖 Redesigned Bible Reading Experience
// Clean, modern UI with AI integration, highlights, and bookmarks

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, Bookmark, Heart, ChevronLeft, ChevronRight, 
  Book, BookOpen, Highlighter, MessageCircle,
  ChevronDown, Menu, X, Copy, Share2, FileText, Palette
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BibleBook, 
  BibleVerse, 
  getAllBooks, 
  getChapterVerses, 
  searchVerses,
  TranslationCode
} from '@/lib/local-bible';
import BibleVerseAIChat from '@/components/BibleVerseAIChat';
import { InlineLoadingIndicator } from '@/components/BibleAuraLoadingAnimation';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
import { MobileOptimizedLayout } from '@/components/MobileOptimizedLayout';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { value: 'english', label: 'English 🇺🇸' },
  { value: 'tamil', label: 'Tamil 🇮🇳' }
];

const HIGHLIGHT_COLORS = [
  { id: 'yellow', name: 'Yellow', class: 'bg-yellow-100 border-l-4 border-yellow-400', dot: 'bg-yellow-400' },
  { id: 'green', name: 'Green', class: 'bg-green-100 border-l-4 border-green-400', dot: 'bg-green-400' },
  { id: 'blue', name: 'Blue', class: 'bg-blue-100 border-l-4 border-blue-400', dot: 'bg-blue-400' },
  { id: 'purple', name: 'Purple', class: 'bg-purple-100 border-l-4 border-purple-400', dot: 'bg-purple-400' },
  { id: 'pink', name: 'Pink', class: 'bg-pink-100 border-l-4 border-pink-400', dot: 'bg-pink-400' },
];

export default function BibleRedesigned() {
  useSEO(SEO_CONFIG.BIBLE);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Bible state
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'tamil'>('english');
  const [selectedTranslation, setSelectedTranslation] = useState<TranslationCode>('KJV');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [searching, setSearching] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [activeTab, setActiveTab] = useState('read');
  const [oldTestamentOpen, setOldTestamentOpen] = useState(false);
  const [newTestamentOpen, setNewTestamentOpen] = useState(false);
  
  // Interaction state
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [highlights, setHighlights] = useState<Map<string, string>>(new Map());
  const [selectedVerseForHighlight, setSelectedVerseForHighlight] = useState<string | null>(null);
  
  // AI Chat state
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [selectedVerseForAI, setSelectedVerseForAI] = useState<BibleVerse | null>(null);

  // Dialog states for mobile
  const [translationDialogOpen, setTranslationDialogOpen] = useState(false);
  const [bookSelectionDialogOpen, setBookSelectionDialogOpen] = useState(false);

  useEffect(() => {
    try {
      loadBooks();
      if (user) {
        loadUserData();
      }
    } catch (error) {
      console.error('Error initializing Bible page:', error);
      toast({
        title: "Error",
        description: "Failed to initialize Bible page",
        variant: "destructive"
      });
    }
  }, [user]);

  // Listen for bible-action events from MobileMoreMenu
  useEffect(() => {
    const handleBibleAction = (event: CustomEvent) => {
      const action = event.detail?.action;
      console.log('Bible action received:', action);
      
      try {
        switch (action) {
          case 'book-selection':
            setBookSelectionDialogOpen(true);
            break;
          case 'translation':
            setTranslationDialogOpen(true);
            break;
          case 'search-verses':
            setActiveTab('search');
            break;
          case 'reading-plan':
            window.location.href = '/reading-plan';
            break;
          case 'bookmarks':
            // Could show bookmarks dialog or navigate
            toast({
              title: "Bookmarks",
              description: "View your bookmarked verses",
            });
            break;
          case 'random-verse':
            handleRandomVerse();
            break;
          default:
            console.log('Unknown bible action:', action);
        }
      } catch (error) {
        console.error('Error handling bible action:', error);
      }
    };

    window.addEventListener('bible-action', handleBibleAction as EventListener);
    return () => {
      window.removeEventListener('bible-action', handleBibleAction as EventListener);
    };
  }, [books, toast]); // Add dependencies

  useEffect(() => {
    if (selectedBook) {
      try {
        loadChapter();
      } catch (error) {
        console.error('Error in chapter loading effect:', error);
        toast({
          title: "Error",
          description: "Failed to load chapter",
          variant: "destructive"
        });
      }
    }
  }, [selectedBook, selectedChapter, selectedLanguage, selectedTranslation]);

  const loadBooks = async () => {
    try {
      const booksData = await getAllBooks();
      setBooks(booksData);
      
      // Auto-select Genesis
      const genesis = booksData.find(b => b.name === 'Genesis');
      if (genesis && !selectedBook) {
        setSelectedBook(genesis);
      }
    } catch (error) {
      console.error('Error loading books:', error);
      toast({
        title: "Error",
        description: "Failed to load Bible books",
        variant: "destructive"
      });
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

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      // Load bookmarks
      const { data: bookmarksData } = await supabase
        .from('bookmarks')
        .select('verse_id')
        .eq('user_id', user.id);
      
      if (bookmarksData) {
        setBookmarks(new Set(bookmarksData.map(b => b.verse_id)));
      }
      
      // Load favorites
      const { data: favoritesData } = await supabase
        .from('favorite_verses')
        .select('verse_id')
        .eq('user_id', user.id);
      
      if (favoritesData) {
        setFavorites(new Set(favoritesData.map(f => f.verse_id)));
      }
      
      // Load highlights
      const { data: highlightsData } = await supabase
        .from('verse_highlights')
        .select('verse_id, color')
        .eq('user_id', user.id);
      
      if (highlightsData) {
        const highlightMap = new Map();
        highlightsData.forEach(h => highlightMap.set(h.verse_id, h.color));
        setHighlights(highlightMap);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const results = await searchVerses(
        searchQuery, 
        selectedLanguage,
        undefined,
        selectedLanguage === 'english' ? selectedTranslation : 'TAMIL'
      );
      
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No Results",
          description: "No verses found matching your search",
        });
      }
    } catch (error) {
      console.error('Error searching verses:', error);
      toast({
        title: "Search Error",
        description: "Failed to search verses",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
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

  const handleBookSelect = (bookName: string) => {
    try {
      const book = books.find(b => b.name === bookName);
      if (book) {
        setSelectedBook(book);
        setSelectedChapter(1);
        if (isMobile) setSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error selecting book:', error);
      toast({
        title: "Error",
        description: "Failed to select book",
        variant: "destructive"
      });
    }
  };

  const handleRandomVerse = () => {
    try {
      if (books.length === 0) {
        toast({
          title: "Loading",
          description: "Please wait for books to load",
        });
        return;
      }
      
      // Select random book
      const randomBook = books[Math.floor(Math.random() * books.length)];
      if (!randomBook) return;
      
      // Select random chapter (1 to book.chapters)
      const randomChapter = Math.floor(Math.random() * randomBook.chapters) + 1;
      
      setSelectedBook(randomBook);
      setSelectedChapter(randomChapter);
      
      toast({
        title: "Random Verse",
        description: `Loading ${randomBook.name} ${randomChapter}`,
      });
    } catch (error) {
      console.error('Error loading random verse:', error);
      toast({
        title: "Error",
        description: "Failed to load random verse",
        variant: "destructive"
      });
    }
  };

  const toggleBookmark = async (verse: BibleVerse) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to bookmark verses",
        variant: "destructive"
      });
      return;
    }

    const verseId = `${verse.book_name}-${verse.chapter}-${verse.verse}`;
    const newBookmarks = new Set(bookmarks);
    
    try {
      if (bookmarks.has(verseId)) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('verse_id', verseId);
        newBookmarks.delete(verseId);
        toast({ title: "Bookmark Removed" });
      } else {
        await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            verse_id: verseId,
            verse_text: verse.text,
            verse_reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
            category: 'study'
          });
        newBookmarks.add(verseId);
        toast({ title: "Bookmarked!" });
      }
      
      setBookmarks(newBookmarks);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({ title: "Error", description: "Failed to update bookmark", variant: "destructive" });
    }
  };

  const toggleFavorite = async (verse: BibleVerse) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to favorite verses",
        variant: "destructive"
      });
      return;
    }

    const verseId = `${verse.book_name}-${verse.chapter}-${verse.verse}`;
    const newFavorites = new Set(favorites);
    
    try {
      if (favorites.has(verseId)) {
        await supabase
          .from('favorite_verses')
          .delete()
          .eq('user_id', user.id)
          .eq('verse_id', verseId);
        newFavorites.delete(verseId);
        toast({ title: "Removed from Favorites" });
      } else {
        await supabase
          .from('favorite_verses')
          .insert({
            user_id: user.id,
            verse_id: verseId,
            verse_text: verse.text,
            verse_reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`
          });
        newFavorites.add(verseId);
        toast({ title: "Added to Favorites ❤️" });
      }
      
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({ title: "Error", description: "Failed to update favorite", variant: "destructive" });
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

    const verseId = `${verse.book_name}-${verse.chapter}-${verse.verse}`;
    
    try {
      await supabase
        .from('verse_highlights')
        .upsert({
          user_id: user.id,
          verse_id: verseId,
          color: color,
          category: 'highlight'
        });
      
      const newHighlights = new Map(highlights);
      newHighlights.set(verseId, color);
      setHighlights(newHighlights);
      setSelectedVerseForHighlight(null);
      
      toast({ title: `Highlighted in ${color}!` });
    } catch (error) {
      console.error('Error highlighting verse:', error);
      toast({ title: "Error", description: "Failed to highlight verse", variant: "destructive" });
    }
  };

  const copyVerse = (verse: BibleVerse) => {
    const verseText = `"${verse.text}" - ${verse.book_name} ${verse.chapter}:${verse.verse} (${selectedTranslation})`;
    navigator.clipboard.writeText(verseText);
    toast({ 
      title: "Copied!",
      description: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
    });
  };

  const shareVerse = (verse: BibleVerse) => {
    const verseText = `"${verse.text}" - ${verse.book_name} ${verse.chapter}:${verse.verse}`;
    if (navigator.share) {
      navigator.share({
        title: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
        text: verseText,
      });
    } else {
      copyVerse(verse);
    }
  };

  const openAiChat = (verse: BibleVerse) => {
    setSelectedVerseForAI(verse);
    setAiChatOpen(true);
  };

  const oldTestamentBooks = books.filter(book => book.testament === 'old');
  const newTestamentBooks = books.filter(book => book.testament === 'new');

  return (
    <MobileOptimizedLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="flex h-screen">
        {/* Sidebar - Only show on desktop (lg and up) */}
        <AnimatePresence>
          {sidebarOpen && !isMobile && (
            <>
              {/* Mobile Overlay */}
              {isMobile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-40"
                  onClick={() => setSidebarOpen(false)}
                />
              )}
              
              {/* Sidebar Content - Desktop Only */}
              <motion.div
                initial={false}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "spring", damping: 25 }}
                className="bg-white border-r border-gray-200 w-80 flex flex-col"
              >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-orange-500" />
                      <h2 className="text-lg font-bold text-gray-800">Bible Study</h2>
                    </div>
                    {isMobile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarOpen(false)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Select value={selectedLanguage} onValueChange={(value: 'english' | 'tamil') => setSelectedLanguage(value)}>
                      <SelectTrigger className="h-9">
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
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                  <TabsList className="grid w-full grid-cols-2 mx-4 mt-4 rounded-lg bg-gray-100 p-1">
                    <TabsTrigger value="read" className="text-sm rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Book className="h-4 w-4 mr-2" />
                      Books
                    </TabsTrigger>
                    <TabsTrigger value="search" className="text-sm rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </TabsTrigger>
                  </TabsList>

                  <ScrollArea className="flex-1">
                    <div className="p-4 pb-2">
                      <TabsContent value="read" className="mt-0 space-y-2">
                        {/* Old Testament */}
                        <Collapsible open={oldTestamentOpen} onOpenChange={setOldTestamentOpen}>
                          <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full justify-between h-11 bg-white hover:bg-gray-50 border-gray-200">
                              <span className="font-semibold text-gray-800">Old Testament ({oldTestamentBooks.length})</span>
                              <ChevronDown className={cn(
                                "h-4 w-4 transition-transform text-gray-600",
                                oldTestamentOpen && "rotate-180"
                              )} />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            <div className="grid grid-cols-2 gap-2">
                              {oldTestamentBooks.map((book) => (
                                <Button
                                  key={book.id}
                                  variant={selectedBook?.id === book.id ? "default" : "outline"}
                                  onClick={() => handleBookSelect(book.name)}
                                  className={cn(
                                    "text-sm h-10 justify-start font-medium transition-all",
                                    selectedBook?.id === book.id 
                                      ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md' 
                                      : 'hover:bg-gray-50 hover:border-orange-300'
                                  )}
                                >
                                  {book.name}
                                </Button>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* New Testament */}
                        <Collapsible open={newTestamentOpen} onOpenChange={setNewTestamentOpen}>
                          <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full justify-between h-11 bg-white hover:bg-gray-50 border-gray-200">
                              <span className="font-semibold text-gray-800">New Testament ({newTestamentBooks.length})</span>
                              <ChevronDown className={cn(
                                "h-4 w-4 transition-transform text-gray-600",
                                newTestamentOpen && "rotate-180"
                              )} />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            <div className="grid grid-cols-2 gap-2">
                              {newTestamentBooks.map((book) => (
                                <Button
                                  key={book.id}
                                  variant={selectedBook?.id === book.id ? "default" : "outline"}
                                  onClick={() => handleBookSelect(book.name)}
                                  className={cn(
                                    "text-sm h-10 justify-start font-medium transition-all",
                                    selectedBook?.id === book.id 
                                      ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md' 
                                      : 'hover:bg-gray-50 hover:border-orange-300'
                                  )}
                                >
                                  {book.name}
                                </Button>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Chapter Selection */}
                        {selectedBook && (
                          <div className="mt-3">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                              {selectedBook.name} - Chapters
                            </h3>
                            <ScrollArea className="max-h-48">
                              <div className="grid grid-cols-7 gap-1.5 pr-4">
                                {Array.from({ length: selectedBook.chapters || 1 }, (_, i) => i + 1).map((chapter) => (
                                  <Button
                                    key={chapter}
                                    variant={selectedChapter === chapter ? "default" : "outline"}
                                    onClick={() => setSelectedChapter(chapter)}
                                    className={cn(
                                      "h-9 text-sm font-medium transition-all",
                                      selectedChapter === chapter 
                                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md' 
                                        : 'hover:bg-gray-50 hover:border-orange-300'
                                    )}
                                  >
                                    {chapter}
                                  </Button>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="search" className="mt-0 space-y-3">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Search verses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="h-9"
                          />
                          <Button onClick={handleSearch} disabled={searching} className="h-9 px-3">
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>

                        {searching && <InlineLoadingIndicator />}

                        {searchResults.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-gray-700">
                              Results ({searchResults.length})
                            </h3>
                            <div className="space-y-2">
                              {searchResults.slice(0, 20).map((verse, idx) => (
                                <Card
                                  key={idx}
                                  className="p-3 cursor-pointer hover:bg-orange-50 transition-colors"
                                  onClick={() => {
                                    const book = books.find(b => b.name === verse.book_name);
                                    if (book) {
                                      setSelectedBook(book);
                                      setSelectedChapter(verse.chapter);
                                      setActiveTab('read');
                                      if (isMobile) setSidebarOpen(false);
                                    }
                                  }}
                                >
                                  <div className="font-medium text-orange-600 text-xs mb-1">
                                    {verse.book_name} {verse.chapter}:{verse.verse}
                                  </div>
                                  <div className="text-gray-700 text-xs line-clamp-2">
                                    {verse.text}
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    </div>
                  </ScrollArea>
                </Tabs>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                
                {selectedBook && (
                  <div className="flex items-center gap-2">
                    <h1 className={cn(
                      "font-bold text-gray-800",
                      isMobile ? "text-lg" : "text-xl"
                    )}>
                      {selectedBook.name}
                    </h1>
                    <Badge variant="outline" className="text-xs">
                      Ch {selectedChapter}
                    </Badge>
                  </div>
                )}
              </div>

              {selectedBook && !isMobile && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateChapter('prev')}
                    disabled={selectedChapter <= 1}
                    className="h-9"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateChapter('next')}
                    disabled={selectedChapter >= (selectedBook.chapters || 1)}
                    className="h-9"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobile && selectedBook && (
            <div className="fixed bottom-4 right-4 z-30 flex items-center gap-2 bg-white rounded-full shadow-lg p-2 border border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateChapter('prev')}
                disabled={selectedChapter <= 1}
                className="h-10 w-10 p-0 rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-sm font-medium px-3 bg-orange-50 rounded-full py-1">
                Ch {selectedChapter}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateChapter('next')}
                disabled={selectedChapter >= (selectedBook.chapters || 1)}
                className="h-10 w-10 p-0 rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Verses Display */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <InlineLoadingIndicator />
              </div>
            ) : selectedBook && verses.length > 0 ? (
              <div className={cn(
                "max-w-4xl mx-auto",
                isMobile ? "p-4 pb-24" : "p-8"
              )}>
                <div className="space-y-6">
                  {verses.map((verse) => {
                    const verseId = `${verse.book_name}-${verse.chapter}-${verse.verse}`;
                    const isBookmarked = bookmarks.has(verseId);
                    const isFavorited = favorites.has(verseId);
                    const highlightColor = highlights.get(verseId);
                    const highlightClass = HIGHLIGHT_COLORS.find(c => c.id === highlightColor)?.class;
                    
                    return (
                      <motion.div
                        key={verseId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "group relative rounded-xl transition-all duration-200 p-4",
                          highlightClass || 'hover:bg-gray-50'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          {/* Verse Number */}
                          <div className="flex-shrink-0">
                            <span className={cn(
                              "inline-flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold shadow-sm",
                              isMobile ? "w-10 h-10 text-sm" : "w-12 h-12 text-base"
                            )}>
                              {verse.verse}
                            </span>
                          </div>
                          
                          {/* Verse Text */}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-gray-800 leading-relaxed font-normal",
                              isMobile ? "text-base leading-7" : "text-lg leading-8"
                            )}>
                              {verse.text}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className={cn(
                          "flex items-center justify-end gap-1 mt-4 transition-opacity",
                          isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}>
                          {/* AI Chat */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openAiChat(verse)}
                                  className={cn(
                                    "p-0 hover:bg-orange-50",
                                    isMobile ? "h-11 w-11" : "h-9 w-9"
                                  )}
                                >
                                  <div className={cn(
                                    "rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white font-bold",
                                    isMobile ? "w-6 h-6 text-base" : "w-5 h-5 text-sm"
                                  )}>
                                    ✦
                                  </div>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Ask AI about this verse</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {/* Highlight */}
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedVerseForHighlight(
                                selectedVerseForHighlight === verseId ? null : verseId
                              )}
                              className={cn(
                                "p-0 text-gray-400 hover:text-orange-500",
                                isMobile ? "h-11 w-11" : "h-9 w-9"
                              )}
                            >
                              <Highlighter className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
                            </Button>
                            
                            {selectedVerseForHighlight === verseId && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute bottom-full right-0 mb-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                              >
                                <div className="flex gap-1.5">
                                  {HIGHLIGHT_COLORS.map(color => (
                                    <button
                                      key={color.id}
                                      onClick={() => highlightVerse(verse, color.id)}
                                      className={cn(
                                        "w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform",
                                        color.dot
                                      )}
                                      title={color.name}
                                    />
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </div>

                          {/* Favorite */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(verse)}
                            className={cn(
                              "p-0",
                              isMobile ? "h-11 w-11" : "h-9 w-9",
                              isFavorited 
                                ? 'text-red-500 hover:text-red-600 bg-red-50' 
                                : 'text-gray-400 hover:text-red-500'
                            )}
                          >
                            <Heart className={cn(
                              isMobile ? "h-5 w-5" : "h-4 w-4",
                              isFavorited && 'fill-current'
                            )} />
                          </Button>

                          {/* Bookmark */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBookmark(verse)}
                            className={cn(
                              "p-0",
                              isMobile ? "h-11 w-11" : "h-9 w-9",
                              isBookmarked 
                                ? 'text-blue-500 hover:text-blue-600 bg-blue-50' 
                                : 'text-gray-400 hover:text-blue-500'
                            )}
                          >
                            <Bookmark className={cn(
                              isMobile ? "h-5 w-5" : "h-4 w-4",
                              isBookmarked && 'fill-current'
                            )} />
                          </Button>

                          {/* Copy */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyVerse(verse)}
                            className={cn(
                              "p-0 text-gray-400 hover:text-gray-600",
                              isMobile ? "h-11 w-11" : "h-9 w-9"
                            )}
                          >
                            <Copy className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
                          </Button>

                          {/* Share */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => shareVerse(verse)}
                            className={cn(
                              "p-0 text-gray-400 hover:text-gray-600",
                              isMobile ? "h-11 w-11" : "h-9 w-9"
                            )}
                          >
                            <Share2 className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md p-8">
                  <BookOpen className={cn(
                    "mx-auto mb-4 text-gray-300",
                    isMobile ? "h-16 w-16" : "h-20 w-20"
                  )} />
                  <h3 className={cn(
                    "font-semibold text-gray-700 mb-2",
                    isMobile ? "text-lg" : "text-xl"
                  )}>
                    Select a Book to Begin Reading
                  </h3>
                  <p className={cn(
                    "text-gray-500",
                    isMobile ? "text-sm" : "text-base"
                  )}>
                    Choose a book from the sidebar to start your Bible study journey.
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* AI Chat Side Panel */}
      {selectedVerseForAI && (
        <AnimatePresence>
          {aiChatOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setAiChatOpen(false);
                  setSelectedVerseForAI(null);
                }}
                className="fixed inset-0 bg-black/50 z-50"
              />
              
              {/* Side Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
              >
                {/* Close Button - Top Right */}
                <div className="absolute top-4 right-4 z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAiChatOpen(false);
                      setSelectedVerseForAI(null);
                    }}
                    className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* AI Chat Content - Full Height */}
                <div className="flex-1 overflow-hidden pt-2">
                  <BibleVerseAIChat
                    verse={selectedVerseForAI}
                    isOpen={aiChatOpen}
                    onClose={() => {
                      setAiChatOpen(false);
                      setSelectedVerseForAI(null);
                    }}
                    verseReference={`${selectedVerseForAI.book_name} ${selectedVerseForAI.chapter}:${selectedVerseForAI.verse}`}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      {/* Translation Selection Dialog (Mobile) */}
      <Dialog open={translationDialogOpen} onOpenChange={setTranslationDialogOpen}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Choose Translation</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Language</label>
              <Select value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v as 'english' | 'tamil')}>
                <SelectTrigger className="w-full">
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
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Translation</label>
              <p className="text-sm text-gray-600">
                {selectedLanguage === 'english' ? 'King James Version (KJV)' : 'Tamil Bible'}
              </p>
            </div>
            <Button onClick={() => setTranslationDialogOpen(false)} className="w-full bg-orange-500 hover:bg-orange-600">
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Book Selection Dialog (Mobile) */}
      <Dialog open={bookSelectionDialogOpen} onOpenChange={setBookSelectionDialogOpen}>
        <DialogContent className="bg-white max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Choose Bible Book</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 py-4">
            {/* Old Testament */}
            <Collapsible open={oldTestamentOpen} onOpenChange={setOldTestamentOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-800">Old Testament</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", oldTestamentOpen && "rotate-180")} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-2 gap-2 p-4">
                  {oldTestamentBooks.map((book) => (
                    <Button
                      key={book.name}
                      variant={selectedBook?.name === book.name ? "default" : "outline"}
                      onClick={() => {
                        setSelectedBook(book);
                        setSelectedChapter(1);
                        setBookSelectionDialogOpen(false);
                      }}
                      className="justify-start text-sm"
                    >
                      {book.name}
                    </Button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* New Testament */}
            <Collapsible open={newTestamentOpen} onOpenChange={setNewTestamentOpen} className="mt-2">
              <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-800">New Testament</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", newTestamentOpen && "rotate-180")} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-2 gap-2 p-4">
                  {newTestamentBooks.map((book) => (
                    <Button
                      key={book.name}
                      variant={selectedBook?.name === book.name ? "default" : "outline"}
                      onClick={() => {
                        setSelectedBook(book);
                        setSelectedChapter(1);
                        setBookSelectionDialogOpen(false);
                      }}
                      className="justify-start text-sm"
                    >
                      {book.name}
                    </Button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      </div>
    </MobileOptimizedLayout>
  );
}

