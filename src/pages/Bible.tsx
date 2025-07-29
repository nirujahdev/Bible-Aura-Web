import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Bookmark, Heart, Share, ChevronLeft, ChevronRight, 
  Star, Book, Sparkles, Globe, Languages, StickyNote, Brain, 
  MessageCircle, BookOpen
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
import { PageLayout } from '@/components/PageLayout';

const LANGUAGES = [
  { value: 'english', label: 'English (KJV)' },
  { value: 'tamil', label: 'Tamil' }
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
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<{id: string, text: string, reference: string} | null>(null);

  useEffect(() => {
    loadBooks();
    if (user) {
      loadBookmarks();
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
    
    try {
      const results = await searchVerses(searchQuery, selectedLanguage);
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

  const oldTestamentBooks = books.filter(book => book.testament === 'old');
  const newTestamentBooks = books.filter(book => book.testament === 'new');
  const currentTranslation = LANGUAGES.find(t => t.value === selectedLanguage);

  return (
    <PageLayout padding="none" maxWidth="full">
      {/* Modern Guest User Header */}
      {!user && (
        <ModernHeader variant="default" showDismiss={true} />
      )}

      {/* Full-Width Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <Book className="h-5 w-5 sm:h-6 sm:w-6" />
            <h1 className="text-xl sm:text-2xl font-divine">Sacred Scripture</h1>
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </div>

      {/* Top Controls Section - Below Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Language Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Languages className="h-4 w-4" />
                Bible Language
              </label>
              <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(language => (
                    <SelectItem key={language.value} value={language.value}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{language.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {language.value === 'english' ? 'King James Version' : 'Tamil Bible'}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Book Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Select Book
              </label>
              <Select 
                value={selectedBook?.name || ''} 
                onValueChange={(bookName) => {
                  const book = books.find(b => b.name === bookName);
                  if (book) {
                    setSelectedBook(book);
                    setSelectedChapter(1);
                    setSearchResults([]);
                  }
                }}
                disabled={booksLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select book" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {booksLoading ? (
                    <SelectItem value="loading" disabled>Loading books...</SelectItem>
                  ) : (
                    <>
                      <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Old Testament</div>
                      {oldTestamentBooks.map(book => (
                        <SelectItem key={book.id} value={book.name}>
                          {book.name}
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mt-2">New Testament</div>
                      {newTestamentBooks.map(book => (
                        <SelectItem key={book.id} value={book.name}>
                          {book.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Verses
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search verses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} className="bg-orange-500 hover:bg-orange-600">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Navigation - Below Controls */}
      {selectedBook && (
        <div className="bg-gray-50 border-b p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Chapter:</label>
              <Select 
                value={selectedChapter.toString()} 
                onValueChange={(chapter) => setSelectedChapter(parseInt(chapter))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {Array.from({ length: selectedBook.chapters || 1 }, (_, i) => i + 1).map(chapter => (
                    <SelectItem key={chapter} value={chapter.toString()}>
                      Chapter {chapter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateChapter('prev')}
                disabled={selectedChapter <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateChapter('next')}
                disabled={selectedChapter >= (selectedBook.chapters || 1)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Chapter Header */}
        <div className="bg-white border-b p-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl lg:text-2xl font-bold text-orange-600">
              {selectedBook ? (
                <>
                  {selectedBook.name} Chapter {selectedChapter}
                  {currentTranslation && (
                    <span className="text-base font-normal text-muted-foreground ml-3">
                      ({currentTranslation.label})
                    </span>
                  )}
                </>
              ) : searchResults.length > 0 ? (
                <>
                  Search Results for "{searchQuery}"
                  {currentTranslation && (
                    <span className="text-base font-normal text-muted-foreground ml-3">
                      ({currentTranslation.label})
                    </span>
                  )}
                </>
              ) : (
                "Select a book and chapter to begin reading"
              )}
            </h2>

            {/* Verse Count & Info */}
            {(verses.length > 0 || searchResults.length > 0) && (
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="secondary" className="text-sm">
                  {searchResults.length > 0 ? searchResults.length : verses.length} verses
                </Badge>
                {currentTranslation && (
                  <Badge variant="outline" className="text-sm">
                    {currentTranslation.label}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Verses Content - Scrollable Full Width */}
        <div className="bible-content-area bible-scrollable flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 lg:p-6">
              {searchResults.length > 0 ? (
                // Search Results Display
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Search Results
                    </h2>
                    <p className="text-muted-foreground">
                      Found {searchResults.length} verses for "{searchQuery}" in {selectedLanguage === 'english' ? 'English' : 'Tamil'}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {searchResults.map((verse) => {
                      const verseKey = verse.id;
                      const isBookmarked = bookmarks.has(verseKey);
                      const isFavorite = favorites.has(verseKey);
                      
                      return (
                        <div
                          key={verseKey}
                          className={`bible-verse-card group p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                            isBookmarked ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 shadow-md' : 'border-gray-200 hover:border-orange-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50'
                          }`}
                        >
                          <div className="flex items-start gap-5">
                            <div className="verse-number-container">
                              <span className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl font-bold text-white shadow-lg ${
                                parseInt(verse.verse.toString()) >= 12 && parseInt(verse.verse.toString()) <= 14 
                                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 ring-2 ring-amber-300' 
                                  : 'bg-gradient-to-br from-orange-500 to-red-500'
                              }`}>
                                {verse.verse}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="mb-3">
                                <Badge variant="outline" className="text-sm font-medium bg-gray-100 text-gray-700 border-gray-300">
                                  {verse.book_name} {verse.chapter}:{verse.verse}
                                </Badge>
                              </div>
                              <p className="bible-verse-text text-base leading-relaxed text-gray-800 font-medium tracking-wide">
                                {verse.text}
                              </p>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="bible-verse-actions flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {/* Favorite */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFavorite(verse)}
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
                                onClick={() => openNoteModal(verse)}
                                className="h-8 w-8 p-0"
                                title="Add note"
                              >
                                <StickyNote className="h-4 w-4" />
                              </Button>

                              {/* Bible Aura AI Analysis */}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openAiModal(verse)}
                                className="h-8 w-8 p-0"
                                title="✦ Bible Aura AI Analysis"
                              >
                                <Brain className="h-4 w-4" />
                              </Button>
                              
                              {/* Share */}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  const reference = `${verse.book_name} ${verse.chapter}:${verse.verse}`;
                                  navigator.clipboard.writeText(`${reference} - ${verse.text}`);
                                  toast({ title: "Copied to clipboard", description: "Verse copied successfully" });
                                }}
                                title="Copy verse"
                              >
                                <Share className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchResults([]);
                        setSearchQuery('');
                      }}
                      className="border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      Clear Search
                    </Button>
                  </div>
                </div>
              ) : verses.length > 0 ? (
                // Chapter Display
                <div>
                  {/* Verses Grid */}
                  <div className="space-y-4">
                    {verses.map((verse) => {
                      const verseKey = verse.id;
                      const isBookmarked = bookmarks.has(verseKey);
                      const isFavorite = favorites.has(verseKey);
                      
                      return (
                        <div
                          key={verseKey}
                          className={`bible-verse-card group p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                            isBookmarked ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 shadow-md' : 'border-gray-200 hover:border-orange-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50'
                          }`}
                        >
                          <div className="flex items-start gap-5">
                            <div className="verse-number-container">
                              <span className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl font-bold text-white shadow-lg ${
                                parseInt(verse.verse.toString()) >= 12 && parseInt(verse.verse.toString()) <= 14 
                                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 ring-2 ring-amber-300' 
                                  : 'bg-gradient-to-br from-orange-500 to-red-500'
                              }`}>
                                {verse.verse}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="bible-verse-text text-base leading-relaxed text-gray-800 font-medium tracking-wide">
                                {verse.text}
                              </p>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="bible-verse-actions flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {/* Favorite */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFavorite(verse)}
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
                                onClick={() => openNoteModal(verse)}
                                className="h-8 w-8 p-0"
                                title="Add note"
                              >
                                <StickyNote className="h-4 w-4" />
                              </Button>

                              {/* Bible Aura AI Analysis */}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openAiModal(verse)}
                                className="h-8 w-8 p-0"
                                title="✦ Bible Aura AI Analysis"
                              >
                                <Brain className="h-4 w-4" />
                              </Button>
                              
                              {/* Share */}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  const reference = `${verse.book_name} ${verse.chapter}:${verse.verse}`;
                                  navigator.clipboard.writeText(`${reference} - ${verse.text}`);
                                  toast({ title: "Copied to clipboard", description: "Verse copied successfully" });
                                }}
                                title="Copy verse"
                              >
                                <Share className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Empty State
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {searchQuery ? 'No verses found' : 'Select a book to begin'}
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      {searchQuery ? 
                        `No verses found matching "${searchQuery}". Try a different search term.` :
                        'Choose a Bible book from the sidebar to start reading, or search for specific verses.'
                      }
                    </p>
                  </div>
                </div>
              )}
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
    </PageLayout>
  );
}