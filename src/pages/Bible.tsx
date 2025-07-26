import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Bookmark, Heart, Share, ChevronLeft, ChevronRight, Star, Book, Sparkles, Globe, Languages, StickyNote, Brain, Palette, MessageCircle, BookOpen } from 'lucide-react';
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
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [highlights, setHighlights] = useState<Map<string, VerseHighlight>>(new Map());
  const [loading, setLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Modal states
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<{id: string, text: string, reference: string} | null>(null);

  useEffect(() => {
    loadBooks();
    if (user) {
      loadBookmarks();
      loadHighlights();
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
      setSelectedBook(johnBook || booksData[0]);
      setSelectedChapter(johnBook ? 3 : 1);
      
      toast({
        title: "📖 Bible Loaded",
        description: `${booksData.length} books available in ${selectedLanguage === 'english' ? 'English' : 'Tamil'}`,
      });
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
      const bookmarkIds = new Set(userBookmarks.map(b => b.id));
      setBookmarks(bookmarkIds);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const loadHighlights = async () => {
    if (!user) return;

    try {
      // Mock highlights for now since table doesn't exist yet
      const mockHighlights = new Map();
      setHighlights(mockHighlights);
    } catch (error) {
      console.error('Error loading highlights:', error);
    }
  };

  const toggleBookmark = async (verse: BibleVerse) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to bookmark verses",
        variant: "destructive",
      });
      return;
    }

    const verseKey = verse.id; // Use the API verse ID
    
    try {
      if (bookmarks.has(verseKey)) {
        // TODO: Implement remove bookmark functionality
        setBookmarks(prev => {
          const newSet = new Set(prev);
          newSet.delete(verseKey);
          return newSet;
        });
        toast({
          title: "Bookmark removed",
          description: "Verse removed from bookmarks",
        });
      } else {
        await saveBookmark(verse, user.id);
        setBookmarks(prev => new Set([...prev, verseKey]));
        toast({
          title: "Bookmark added",
          description: "Verse added to bookmarks",
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    }
  };

  const navigateChapter = (direction: 'prev' | 'next') => {
    if (!selectedBook) return;

    const maxChapters = selectedBook.chapters || 1;
    
    if (direction === 'prev' && selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
    } else if (direction === 'next' && selectedChapter < maxChapters) {
      setSelectedChapter(selectedChapter + 1);
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language as 'english' | 'tamil');
  };

  const handleTranslationChange = (translationId: string) => {
    // This function is no longer needed as we are using local data
    // Keeping it for now, but it will not affect the book selection
    // setSelectedTranslation(translationId);
    // const translation = BIBLE_TRANSLATIONS.find(t => t.id === translationId);
    // if (translation) {
    //   setSelectedLanguage(translation.language);
    // }
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const results = await searchVerses(searchQuery, selectedLanguage);
      setSearchResults(results);
      
      // Clear current verses to show search results
      setVerses([]);
      setSelectedBook(null);
      
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
        description: "Failed to search verses",
        variant: "destructive"
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const oldTestamentBooks = books.filter(book => book.testament === 'old');
  const newTestamentBooks = books.filter(book => book.testament === 'new');
  const availableTranslations = LANGUAGES.filter(t => t.value === selectedLanguage);
  const uniqueLanguages = Array.from(new Set(LANGUAGES.map(t => t.label)));
  const currentTranslation = LANGUAGES.find(t => t.value === selectedLanguage);

  return (
    <PageLayout padding="none" maxWidth="full">
    <div className="bible-full-layout min-h-screen bg-background flex flex-col">
      {/* Modern Guest User Header */}
      {!user && (
        <ModernHeader variant="default" showDismiss={true} />
      )}

      {/* Full-Width Header */}
      <div className="bg-aura-gradient text-white p-4 border-b flex-shrink-0">
        <div className="max-w-full mx-auto">
          <div className="flex items-center gap-3">
            <Book className="h-6 w-6" />
            <h1 className="text-2xl font-divine">Sacred Scripture</h1>
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Content - Full Width Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar Controls - Responsive */}
                 <div className="bible-sidebar w-full lg:w-80 xl:w-96 bg-muted/30 border-b lg:border-b-0 lg:border-r p-4 space-y-4">
          {/* Language Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Languages className="h-4 w-4" />
                Bible Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-xs font-medium mb-2 block">Select Language & Translation</label>
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
            </CardContent>
          </Card>

          {/* Search Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Verses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Input
                  placeholder="Search verses... (e.g., 'love', 'John 3:16')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full"
                />
                <Button onClick={handleSearch} disabled={searchLoading} className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Search Scripture
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Book and Chapter Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Book & Chapter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Book Selection */}
              <div>
                <label className="text-xs font-medium mb-2 block">Book</label>
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
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={booksLoading ? "Loading books..." : "Select book"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {oldTestamentBooks.length > 0 && (
                      <div className="p-2">
                        <h4 className="font-medium text-xs text-muted-foreground mb-1">Old Testament</h4>
                        {oldTestamentBooks.map(book => (
                          <SelectItem key={book.name} value={book.name}>
                            {book.name}
                          </SelectItem>
                        ))}
                      </div>
                    )}
                    {newTestamentBooks.length > 0 && (
                      <div className="p-2 border-t">
                        <h4 className="font-medium text-xs text-muted-foreground mb-1">New Testament</h4>
                        {newTestamentBooks.map(book => (
                          <SelectItem key={book.name} value={book.name}>
                            {book.name}
                          </SelectItem>
                        ))}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Chapter Selection */}
              <div>
                <label className="text-xs font-medium mb-2 block">Chapter</label>
                <Select
                  value={selectedChapter.toString()}
                  onValueChange={(chapter) => setSelectedChapter(parseInt(chapter))}
                  disabled={!selectedBook}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select chapter" />
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

              {/* Chapter Navigation */}
              {selectedBook && (
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateChapter('prev')}
                    disabled={selectedChapter <= 1}
                    className="flex-1"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateChapter('next')}
                    disabled={selectedChapter >= (selectedBook.chapters || 1)}
                    className="flex-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area - Full Width */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chapter Header */}
          <div className="bg-white border-b p-4 flex-shrink-0">
            <div className="max-w-full">
              <h2 className="text-xl lg:text-2xl font-bold text-primary">
                {selectedBook ? (
                  <>
                    {selectedBook.name} Chapter {selectedChapter}
                    {currentTranslation && (
                      <span className="text-base font-normal text-muted-foreground ml-3">
                        ({currentTranslation.label})
                      </span>
                    )}
                  </>
                ) : searchQuery ? (
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
              {verses.length > 0 && (
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary" className="text-sm">
                    {verses.length} verses
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
                <div className="max-w-full p-4 lg:p-6">
                  {loading || searchLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">
                          {searchLoading ? 'Searching...' : 'Loading verses...'}
                        </p>
                      </div>
                    </div>
                  ) : searchResults.length > 0 ? (
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
                          const highlight = highlights.get(verseKey);
                          
                          return (
                            <div
                              key={verseKey}
                              className={`bible-verse-card group p-4 lg:p-5 rounded-lg border transition-all duration-200 hover:shadow-md ${
                                highlight ? `border-2` : 
                                isBookmarked ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/30 hover:bg-muted/20'
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex-1">
                                  <div className="mb-2">
                                    <Badge variant="outline" className="text-sm">
                                      {verse.book_name} {verse.chapter}:{verse.verse}
                                    </Badge>
                                  </div>
                                  <p className="bible-verse-text text-base lg:text-lg leading-relaxed text-foreground font-medium">
                                    {verse.text}
                                  </p>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="bible-verse-actions flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  {/* Bookmark */}
                                  {user && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleBookmark(verse)}
                                      className={`h-8 w-8 p-0 ${isBookmarked ? 'text-primary bg-primary/10' : ''}`}
                                      title="Bookmark verse"
                                    >
                                      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                                    </Button>
                                  )}
                                  
                                  {/* Notes */}
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedVerse({
                                        id: verse.id,
                                        text: verse.text,
                                        reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`
                                      });
                                      setNoteModalOpen(true);
                                    }}
                                    className="h-8 w-8 p-0"
                                    title="Add note"
                                  >
                                    <StickyNote className="h-4 w-4" />
                                  </Button>
                                  
                                  {/* AI Analysis */}
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedVerse({
                                        id: verse.id,
                                        text: verse.text,
                                        reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`
                                      });
                                      setAiModalOpen(true);
                                    }}
                                    className="h-8 w-8 p-0"
                                    title="AI analysis"
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
                            if (selectedBook) {
                              loadChapter();
                            }
                          }}
                        >
                          Back to Chapter View
                        </Button>
                      </div>
                    </div>
                  ) : verses.length > 0 ? (
                    // Chapter Display
                    <div>
                      {/* Chapter Header */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                            {selectedBook?.name} Chapter {selectedChapter}
                            {currentTranslation && (
                              <span className="text-base font-normal text-muted-foreground ml-3">
                                ({currentTranslation.label})
                              </span>
                            )}
                          </h1>
                        </div>
                        
                        {/* Chapter Navigation */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={selectedChapter <= 1}
                              onClick={() => setSelectedChapter(prev => Math.max(1, prev - 1))}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="font-medium">
                              Chapter {selectedChapter} of {selectedBook?.chapters || 1}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={selectedChapter >= (selectedBook?.chapters || 1)}
                              onClick={() => setSelectedChapter(prev => Math.min(selectedBook?.chapters || 1, prev + 1))}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {currentTranslation && (
                              <Badge variant="outline" className="text-sm">
                                {currentTranslation.label}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Verses Grid */}
                      <div className="space-y-4">
                        {verses.map((verse) => {
                          const verseKey = verse.id;
                          const isBookmarked = bookmarks.has(verseKey);
                          const highlight = highlights.get(verseKey);
                          
                          return (
                            <div
                              key={verseKey}
                              className={`bible-verse-card group p-4 lg:p-5 rounded-lg border transition-all duration-200 hover:shadow-md ${
                                highlight ? `border-2` : 
                                isBookmarked ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/30 hover:bg-muted/20'
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-2 rounded-full min-w-[2.5rem] text-center flex-shrink-0">
                                  {verse.verse}
                                </span>
                                <div className="flex-1">
                                  <p className="bible-verse-text text-base lg:text-lg leading-relaxed text-foreground font-medium">
                                    {verse.text}
                                  </p>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="bible-verse-actions flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  {/* Bookmark */}
                                  {user && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleBookmark(verse)}
                                      className={`h-8 w-8 p-0 ${isBookmarked ? 'text-primary bg-primary/10' : ''}`}
                                      title="Bookmark verse"
                                    >
                                      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                                    </Button>
                                  )}
                                  
                                  {/* Notes */}
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedVerse({
                                        id: verse.id,
                                        text: verse.text,
                                        reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`
                                      });
                                      setNoteModalOpen(true);
                                    }}
                                    className="h-8 w-8 p-0"
                                    title="Add note"
                                  >
                                    <StickyNote className="h-4 w-4" />
                                  </Button>
                                  
                                  {/* AI Analysis */}
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedVerse({
                                        id: verse.id,
                                        text: verse.text,
                                        reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`
                                      });
                                      setAiModalOpen(true);
                                    }}
                                    className="h-8 w-8 p-0"
                                    title="AI analysis"
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