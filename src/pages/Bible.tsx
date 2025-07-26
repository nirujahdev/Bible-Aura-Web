import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Bookmark, Heart, Share, ChevronLeft, ChevronRight, 
  Star, Book, Sparkles, Globe, Languages, StickyNote, Brain, 
  Palette, MessageCircle, BookOpen, Filter, Highlighter, Plus
} from 'lucide-react';
import { ModernHeader } from '@/components/ModernHeader';
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
import { HighlightSystem } from '@/components/HighlightSystem';
import { PageLayout } from '@/components/PageLayout';

interface VerseHighlight {
  id: string;
  verse_id: string;
  color: 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'orange' | 'red' | 'gray';
  category: 'favorite' | 'prayer' | 'study' | 'memory' | 'encouragement' | 'wisdom' | 'prophecy' | 'promise';
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

const LANGUAGES = [
  { value: 'english', label: 'English (KJV)' },
  { value: 'tamil', label: 'Tamil' }
];

const HIGHLIGHT_COLORS = [
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-200 hover:bg-yellow-300' },
  { value: 'green', label: 'Green', class: 'bg-green-200 hover:bg-green-300' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-200 hover:bg-blue-300' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-200 hover:bg-purple-300' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-200 hover:bg-pink-300' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-200 hover:bg-orange-300' },
];

export default function Bible() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'tamil'>('english');
  const [searchQuery, setSearchQuery] = useState('');
  const [wordSearchQuery, setWordSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [wordSearchLoading, setWordSearchLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [highlights, setHighlights] = useState<Map<string, VerseHighlight>>(new Map());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<{id: string, text: string, reference: string} | null>(null);

  useEffect(() => {
    loadBooks();
    if (user) {
      loadBookmarks();
      loadHighlights();
      loadFavorites();
    }
  }, [user, selectedLanguage]);

  useEffect(() => {
    if (selectedBook) {
      loadChapter();
    }
  }, [selectedBook, selectedChapter, selectedLanguage]);

  const loadBooks = async () => {
    setBooksLoading(true);
    
    try {
      const booksData = await getAllBooks();
      setBooks(booksData);
      
      // Set default book to John chapter 3
      const johnBook = booksData.find(book => 
        book.name.toLowerCase().includes('john') && !book.name.includes('1') && !book.name.includes('2') && !book.name.includes('3')
      );
      if (johnBook && !selectedBook) {
        setSelectedBook(johnBook);
        setSelectedChapter(3);
      }
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

  const loadHighlights = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('verse_highlights')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const highlightMap = new Map<string, VerseHighlight>();
      data?.forEach(highlight => {
        highlightMap.set(highlight.verse_id, highlight as VerseHighlight);
      });
      setHighlights(highlightMap);
    } catch (error) {
      console.error('Error loading highlights:', error);
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const results = await searchVerses(searchQuery, selectedLanguage);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching verses:', error);
      toast({
        title: "Search Error",
        description: "Failed to search verses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleWordSearch = async () => {
    if (!wordSearchQuery.trim()) return;
    
    setWordSearchLoading(true);
    try {
      const results = await searchVerses(wordSearchQuery, selectedLanguage);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching words:', error);
      toast({
        title: "Word Search Error",
        description: "Failed to search Bible words. Please try again.",
        variant: "destructive"
      });
    } finally {
      setWordSearchLoading(false);
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
        // Remove from favorites
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
        // Add to favorites
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
      const { data, error } = await supabase
        .from('verse_highlights')
        .upsert({
          user_id: user.id,
          verse_id: verse.id,
          color: color as any,
          category: 'study',
          is_favorite: false
        })
        .select()
        .single();

      if (error) throw error;

      const newHighlights = new Map(highlights);
      newHighlights.set(verse.id, data as VerseHighlight);
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

  const getHighlightClasses = (verseKey: string) => {
    const highlight = highlights.get(verseKey);
    if (!highlight) return '';
    
    const colorMap: Record<string, string> = {
      yellow: 'bg-yellow-200 border-yellow-300',
      green: 'bg-green-200 border-green-300',
      blue: 'bg-blue-200 border-blue-300',
      purple: 'bg-purple-200 border-purple-300',
      pink: 'bg-pink-200 border-pink-300',
      orange: 'bg-orange-200 border-orange-300',
      red: 'bg-red-200 border-red-300',
      gray: 'bg-gray-200 border-gray-300',
    };
    
    return colorMap[highlight.color] || '';
  };

  const oldTestamentBooks = books.filter(book => book.testament === 'old');
  const newTestamentBooks = books.filter(book => book.testament === 'new');

  return (
    <PageLayout padding="none" maxWidth="full">
      <div className="min-h-screen bg-background">
        {/* Modern Guest User Header */}
        {!user && (
          <ModernHeader variant="default" showDismiss={true} />
        )}

        {/* Top Header with Book Selection */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-4">
              {/* Title */}
              <div className="flex items-center gap-3">
                <Book className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Bible Aura</h1>
                <Sparkles className="h-5 w-5" />
              </div>

              {/* Book Selection */}
              <div className="flex flex-col lg:flex-row items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                  <Select 
                    value={selectedBook?.name || ''} 
                    onValueChange={(bookName) => {
                      const book = books.find(b => b.name === bookName);
                      if (book) {
                        setSelectedBook(book);
                        setSelectedChapter(1);
                      }
                    }}
                    disabled={booksLoading}
                  >
                    <SelectTrigger className="w-48 bg-white text-gray-900">
                      <SelectValue placeholder="Select Book" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <div className="p-2 text-xs font-semibold text-gray-500">Old Testament</div>
                      {oldTestamentBooks.map(book => (
                        <SelectItem key={book.id} value={book.name}>
                          {book.name}
                        </SelectItem>
                      ))}
                      <div className="p-2 text-xs font-semibold text-gray-500">New Testament</div>
                      {newTestamentBooks.map(book => (
                        <SelectItem key={book.id} value={book.name}>
                          {book.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={selectedChapter.toString()} 
                    onValueChange={(chapter) => setSelectedChapter(parseInt(chapter))}
                  >
                    <SelectTrigger className="w-32 bg-white text-gray-900">
                      <SelectValue placeholder="Chapter" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {selectedBook && Array.from({ length: selectedBook.chapters || 1 }, (_, i) => i + 1).map(chapter => (
                        <SelectItem key={chapter} value={chapter.toString()}>
                          Chapter {chapter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Language Selection */}
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-48 bg-white text-gray-900">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(language => (
                      <SelectItem key={language.value} value={language.value}>
                        {language.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Chapter Navigation */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateChapter('prev')}
                    disabled={selectedChapter <= 1}
                    className="bg-white text-gray-900 hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateChapter('next')}
                    disabled={selectedChapter >= (selectedBook?.chapters || 1)}
                    className="bg-white text-gray-900 hover:bg-gray-100"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Search Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <Tabs defaultValue="verse-search" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="verse-search">Verse Search</TabsTrigger>
                  <TabsTrigger value="word-search">Word Search</TabsTrigger>
                </TabsList>
                
                <TabsContent value="verse-search" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Search Verses
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        placeholder="Search verses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <Button 
                        onClick={handleSearch} 
                        disabled={searchLoading} 
                        className="w-full"
                      >
                        {searchLoading ? 'Searching...' : 'Search Verses'}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="word-search" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Bible Word Search
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        placeholder="Search Bible words..."
                        value={wordSearchQuery}
                        onChange={(e) => setWordSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleWordSearch()}
                      />
                      <Button 
                        onClick={handleWordSearch} 
                        disabled={wordSearchLoading} 
                        className="w-full"
                      >
                        {wordSearchLoading ? 'Searching...' : 'Search Words'}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Search Results ({searchResults.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          const book = books.find(b => b.name === result.book_name);
                          if (book) {
                            setSelectedBook(book);
                            setSelectedChapter(result.chapter);
                          }
                        }}
                      >
                        <div className="font-medium text-sm text-blue-600 mb-1">
                          {result.book_name} {result.chapter}:{result.verse}
                        </div>
                        <div className="text-sm text-gray-700 line-clamp-3">
                          {result.text}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Bible Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {selectedBook?.name} Chapter {selectedChapter}
                      <Badge variant="outline" className="ml-2">
                        {selectedLanguage === 'english' ? 'KJV' : 'Tamil'}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {verses.length} verses
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading...</p>
                      </div>
                    </div>
                  ) : verses.length > 0 ? (
                    <div className="space-y-4">
                      {verses.map((verse) => (
                        <div
                          key={verse.id}
                          className={`group p-4 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                            getHighlightClasses(verse.id)
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <div className="mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {verse.verse}
                                </Badge>
                              </div>
                              <p className="text-base leading-relaxed text-gray-800 mb-3">
                                {verse.text}
                              </p>
                              
                              {/* Verse Actions */}
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleFavorite(verse)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Heart className={`h-4 w-4 ${
                                    favorites.has(verse.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                                  }`} />
                                </Button>

                                {/* Highlight Options */}
                                <div className="flex items-center gap-1">
                                  {HIGHLIGHT_COLORS.map((color) => (
                                    <Button
                                      key={color.value}
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => highlightVerse(verse, color.value)}
                                      className={`h-6 w-6 p-0 rounded-full ${color.class}`}
                                      title={`Highlight with ${color.label}`}
                                    />
                                  ))}
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openNoteModal(verse)}
                                  className="h-8 w-8 p-0"
                                  title="Add Note"
                                >
                                  <StickyNote className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openAiModal(verse)}
                                  className="h-8 w-8 p-0"
                                  title="✦ Bible Aura AI Analysis"
                                >
                                  <Brain className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                          {searchQuery ? 
                            `No verses found matching "${searchQuery}". Try a different search term.` :
                            'Choose a Bible book to start reading, or search for specific verses.'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
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
    </PageLayout>
  );
}