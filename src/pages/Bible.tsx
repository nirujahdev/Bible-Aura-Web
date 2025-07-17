import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Bookmark, Heart, Share, ChevronLeft, ChevronRight, Star, Book, Sparkles, Globe, Languages, StickyNote, Brain, Palette, MessageCircle } from 'lucide-react';
import { ModernHeader } from '@/components/ModernHeader';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import bibleApi, { BibleBook, BibleVerse, BibleTranslation, BIBLE_TRANSLATIONS } from '@/lib/bible-api';
import { NoteTaking } from '@/components/NoteTaking';
import { AIAnalysis } from '@/components/AIAnalysis';
import { HighlightSystem } from '@/components/HighlightSystem';

interface VerseHighlight {
  id: string;
  verse_id: string;
  color: 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'orange' | 'red' | 'gray';
  category: 'favorite' | 'prayer' | 'study' | 'memory' | 'encouragement' | 'wisdom' | 'prophecy' | 'promise';
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export default function Bible() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedTranslation, setSelectedTranslation] = useState('kjv'); // Updated to use new translation ID
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [highlights, setHighlights] = useState<Map<string, VerseHighlight>>(new Map());
  const [loading, setLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(true);
  
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
  }, [user, selectedTranslation]);

  useEffect(() => {
    if (selectedBook) {
      loadChapter();
    }
  }, [selectedBook, selectedChapter, selectedTranslation]);

  const loadBooks = async () => {
    setBooksLoading(true);
    try {
      const booksData = await bibleApi.getBooks(selectedTranslation);
      setBooks(booksData);
      if (booksData.length > 0) {
        // Try to find John, otherwise use first book
        const johnBook = booksData.find(book => book.id.toUpperCase() === 'JHN' || book.name.toLowerCase().includes('john'));
        setSelectedBook(johnBook || booksData[0]);
        setSelectedChapter(johnBook ? 3 : 1); // Start with John 3 for the famous verse
      }
    } catch (error) {
      console.error('Error loading books:', error);
      toast({
        title: "Error",
        description: "Failed to load Bible books",
        variant: "destructive",
      });
    } finally {
      setBooksLoading(false);
    }
  };

  const loadChapter = async () => {
    if (!selectedBook) return;
    
    setLoading(true);
    try {
      const versesData = await bibleApi.fetchChapter(selectedBook.id, selectedChapter, selectedTranslation);
      setVerses(versesData);
      
      // Show success message if verses were loaded
      if (versesData.length > 0) {
        toast({
          title: "✅ Chapter Loaded",
          description: `Loaded ${versesData.length} verses in ${currentTranslation?.name || 'selected translation'}`,
        });
      }
    } catch (error) {
      console.error('Error loading verses:', error);
      toast({
        title: "Error",
        description: "Failed to load chapter verses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('verse_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const bookmarkSet = new Set(data?.map(b => b.verse_id) || []);
      setBookmarks(bookmarkSet);
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
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('verse_id', verseKey);

        if (error) throw error;
        
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
        const { error } = await supabase
          .from('bookmarks')
          .insert([
            {
              user_id: user.id,
              verse_id: verseKey,
              book: selectedBook?.name,
              chapter: selectedChapter,
              verse: verse.verse,
            }
          ]);

        if (error) throw error;
        
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

    if (direction === 'prev' && selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
    } else if (direction === 'next' && selectedChapter < selectedBook.chapters) {
      setSelectedChapter(selectedChapter + 1);
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    const availableTranslations = BIBLE_TRANSLATIONS.filter(t => t.language === language);
    if (availableTranslations.length > 0) {
      setSelectedTranslation(availableTranslations[0].id);
    }
  };

  const handleTranslationChange = (translationId: string) => {
    setSelectedTranslation(translationId);
    const translation = BIBLE_TRANSLATIONS.find(t => t.id === translationId);
    if (translation) {
      setSelectedLanguage(translation.language);
    }
  };

  const openNoteModal = (verse: BibleVerse) => {
    setSelectedVerse({
      id: verse.id,
      text: verse.text,
      reference: verse.reference
    });
    setNoteModalOpen(true);
  };

  const openAiModal = (verse: BibleVerse) => {
    setSelectedVerse({
      id: verse.id,
      text: verse.text,
      reference: verse.reference
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
    
    setLoading(true);
    try {
      const searchResults = await bibleApi.searchVerses(searchQuery, selectedTranslation, 20);
      setVerses(searchResults);
      // Clear book/chapter selection when showing search results
      setSelectedBook(null);
      
      // Show search results notification
      toast({
        title: "🔍 Search Complete",
        description: `Found ${searchResults.length} verses matching "${searchQuery}" in ${currentTranslation?.name || 'selected translation'}`,
      });
    } catch (error) {
      console.error('Error searching verses:', error);
      toast({
        title: "Error", 
        description: "Failed to search verses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const oldTestamentBooks = books.filter(book => book.testament === 'Old');
  const newTestamentBooks = books.filter(book => book.testament === 'New');
  const availableTranslations = BIBLE_TRANSLATIONS.filter(t => t.language === selectedLanguage);
  const uniqueLanguages = Array.from(new Set(BIBLE_TRANSLATIONS.map(t => t.language)));
  const currentTranslation = BIBLE_TRANSLATIONS.find(t => t.id === selectedTranslation);

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col">
      {/* Modern Guest User Header */}
      {!user && (
        <ModernHeader variant="default" showDismiss={true} />
      )}

      {/* Compact Header - NOT STICKY */}
      <div className="bg-aura-gradient text-white p-3 border-b flex-shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            <h1 className="text-xl font-divine">Sacred Scripture</h1>
            <Sparkles className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 max-w-6xl">
          {/* Compact Language & Translation Controls */}
          <Card className="mb-3 sm:mb-4">
            <CardContent className="p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {/* Language Selection */}
                <div>
                  <label className="text-xs font-medium mb-1 flex items-center gap-1">
                    <Languages className="h-3 w-3" />
                    Language
                  </label>
                  <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="h-9 sm:h-8 text-sm">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueLanguages.map(language => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Translation Selection */}
                <div>
                  <label className="text-xs font-medium mb-1 block">Translation</label>
                  <Select value={selectedTranslation} onValueChange={handleTranslationChange}>
                    <SelectTrigger className="h-9 sm:h-8 text-sm">
                      <SelectValue placeholder="Select translation" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTranslations.map(translation => (
                        <SelectItem key={translation.id} value={translation.id}>
                          {translation.abbreviation} - {translation.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Section */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search verses... (e.g., 'love', 'John 3:16', 'salvation')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Book and Chapter Selection */}
          <Card className="mb-4">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-xs font-medium mb-1 block">Book</label>
                  <Select
                    value={selectedBook?.id || ''}
                    onValueChange={(bookId) => {
                      const book = books.find(b => b.id === bookId);
                      if (book) {
                        setSelectedBook(book);
                        setSelectedChapter(1);
                      }
                    }}
                    disabled={booksLoading}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder={booksLoading ? "Loading books..." : "Select book"} />
                    </SelectTrigger>
                    <SelectContent>
                      {oldTestamentBooks.length > 0 && (
                        <div className="p-2">
                          <h4 className="font-medium text-xs text-muted-foreground mb-1">Old Testament</h4>
                          {oldTestamentBooks.map(book => (
                            <SelectItem key={book.id} value={book.id}>
                              {book.name}
                            </SelectItem>
                          ))}
                        </div>
                      )}
                      {newTestamentBooks.length > 0 && (
                        <div className="p-2 border-t">
                          <h4 className="font-medium text-xs text-muted-foreground mb-1">New Testament</h4>
                          {newTestamentBooks.map(book => (
                            <SelectItem key={book.id} value={book.id}>
                              {book.name}
                            </SelectItem>
                          ))}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-[100px]">
                  <label className="text-xs font-medium mb-1 block">Chapter</label>
                  <Select
                    value={selectedChapter.toString()}
                    onValueChange={(chapter) => setSelectedChapter(parseInt(chapter))}
                    disabled={!selectedBook}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedBook && Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(chapter => (
                        <SelectItem key={chapter} value={chapter.toString()}>
                          Chapter {chapter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Chapter Navigation */}
              {selectedBook && (
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateChapter('prev')}
                    disabled={selectedChapter <= 1}
                    className="h-8"
                  >
                    <ChevronLeft className="h-3 w-3 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="text-center">
                    <h2 className="text-lg font-semibold">
                      {selectedBook.name} {selectedChapter}
                    </h2>
                    <Badge variant="secondary" className="text-xs">
                      {currentTranslation?.abbreviation || selectedTranslation}
                    </Badge>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateChapter('next')}
                    disabled={selectedChapter >= selectedBook.chapters}
                    className="h-8"
                  >
                    Next
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chapter Content with Enhanced Features */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {selectedBook ? (
                  <>
                    {selectedBook.name} Chapter {selectedChapter}
                    {currentTranslation && (
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        ({currentTranslation.abbreviation})
                      </span>
                    )}
                  </>
                ) : searchQuery ? (
                  <>
                    Search Results for "{searchQuery}"
                    {currentTranslation && (
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        ({currentTranslation.abbreviation})
                      </span>
                    )}
                  </>
                ) : (
                  "Select a book and chapter"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading verses...</span>
                </div>
              ) : verses.length > 0 ? (
                <div className="space-y-3">
                  {verses.map((verse) => {
                    const verseKey = verse.id;
                    const isBookmarked = bookmarks.has(verseKey);
                    const highlight = highlights.get(verseKey);
                    
                    return (
                      <div
                        key={verseKey}
                        className={`group p-3 rounded-lg border hover:shadow-sm ${
                          highlight ? `${getHighlightClasses(verseKey)} border-2` : 
                          isBookmarked ? 'border-primary bg-primary/5' : 'border-transparent hover:border-border hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full min-w-[1.5rem] text-center flex-shrink-0">
                            {verse.verse}
                          </span>
                          <p className="flex-1 leading-relaxed text-sm">
                            {verse.text}
                          </p>
                          
                          {/* Enhanced Action Buttons */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Bookmark */}
                            {user && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleBookmark(verse)}
                                className={`h-6 w-6 p-0 ${isBookmarked ? 'text-primary' : ''}`}
                              >
                                <Bookmark className={`h-3 w-3 ${isBookmarked ? 'fill-current' : ''}`} />
                              </Button>
                            )}
                            
                            {/* Highlighting */}
                            <HighlightSystem
                              verseId={verseKey}
                              currentHighlight={highlight || null}
                              onHighlightChange={(newHighlight) => {
                                if (newHighlight) {
                                  setHighlights(prev => new Map(prev.set(verseKey, newHighlight)));
                                } else {
                                  setHighlights(prev => {
                                    const newMap = new Map(prev);
                                    newMap.delete(verseKey);
                                    return newMap;
                                  });
                                }
                              }}
                              compact={true}
                            />
                            
                            {/* Notes */}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openNoteModal(verse)}
                              className="h-6 w-6 p-0"
                            >
                              <StickyNote className="h-3 w-3" />
                            </Button>
                            
                            {/* AI Analysis */}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openAiModal(verse)}
                              className="h-6 w-6 p-0"
                            >
                              <Brain className="h-3 w-3" />
                            </Button>
                            
                            {/* Share */}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                navigator.clipboard.writeText(`${verse.reference} - ${verse.text}`);
                                toast({ title: "Copied to clipboard", description: "Verse copied successfully" });
                              }}
                            >
                              <Share className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Show reference for search results */}
                        {!selectedBook && (
                          <div className="ml-8 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {verse.reference}
                            </Badge>
                          </div>
                        )}
                        
                        {/* Highlight/Favorite Indicators */}
                        {(highlight || isBookmarked) && (
                          <div className="flex items-center gap-1 mt-2 ml-8">
                            {highlight && (
                              <Badge variant="outline" className="text-xs">
                                {highlight.category}
                              </Badge>
                            )}
                            {isBookmarked && (
                              <Badge variant="outline" className="text-xs">
                                <Bookmark className="h-2 w-2 mr-1 fill-current" />
                                Bookmarked
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Book className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  {searchQuery ? (
                    <>
                      <p>No verses found for "{searchQuery}"</p>
                      <p className="text-xs">Try searching with different keywords or phrases.</p>
                    </>
                  ) : (
                    <>
                      <p>No verses available for this chapter.</p>
                      <p className="text-xs">Try selecting a different translation or chapter.</p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
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