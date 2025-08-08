import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
import { 
  BookOpen, Calendar, Target, Settings, Share, Copy, 
  Heart, Star, Bookmark, ChevronLeft, ChevronRight,
  Menu, X, Bot, MessageCircle, Grid, Palette
} from 'lucide-react';

// Import our new components
import EnhancedReadingPlans from '@/components/EnhancedReadingPlans';
import CalendarChapterSelector from '@/components/CalendarChapterSelector';
import EnhancedBibleSidebar from '@/components/EnhancedBibleSidebar';
import { EnhancedAIChat } from '@/components/EnhancedAIChat';
import { QuickAIChatTrigger } from '@/components/QuickAIChatWidget';

// Import existing utilities
import { bibleApi } from '@/lib/bible-api';
import { supabase } from '@/integrations/supabase/client';

interface BibleVerse {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
}

interface BibleBook {
  id: string;
  name: string;
  chapters: number;
  testament: 'old' | 'new';
  category: string;
}

export default function EnhancedBible() {
  useSEO(SEO_CONFIG.BIBLE);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // State for Bible content
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [selectedTranslation, setSelectedTranslation] = useState('KJV');
  const [loading, setLoading] = useState(false);
  
  // State for UI
  const [activeMainTab, setActiveMainTab] = useState('read');
  const [activeSidebarTab, setActiveSidebarTab] = useState('books');
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [showChapterSelector, setShowChapterSelector] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Reading preferences
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [showVerseNumbers, setShowVerseNumbers] = useState(true);
  
  // User data
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [recentBooks, setRecentBooks] = useState<BibleBook[]>([]);
  const [bookmarkedBooks, setBookmarkedBooks] = useState<BibleBook[]>([]);
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);

  const translations = [
    { value: 'KJV', label: 'King James Version' },
    { value: 'ESV', label: 'English Standard Version' },
    { value: 'NIV', label: 'New International Version' },
    { value: 'NASB', label: 'New American Standard Bible' },
    { value: 'NLT', label: 'New Living Translation' },
    { value: 'NKJV', label: 'New King James Version' },
  ];

  useEffect(() => {
    loadBooks();
    if (user) {
      loadUserData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedBook) {
      loadChapter();
      updateRecentBooks();
    }
  }, [selectedBook, selectedChapter, selectedTranslation]);

  const loadBooks = async () => {
    try {
      // Use the actual Bible API to get books
      const bibleId = 'de4e12af7f28f599-02'; // KJV Bible ID
      const apiBooks = bibleApi.getStaticBooks(bibleId);
      
      // Convert to our expected format
      const booksData: BibleBook[] = apiBooks.map(book => ({
        id: book.id.toLowerCase(),
        name: book.name,
        chapters: book.chaptersCount || 1,
        testament: book.testament?.toLowerCase() as 'old' | 'new' || 'old',
        category: book.category || 'Other'
      }));
      
      setBooks(booksData);
      if (booksData.length > 0 && !selectedBook) {
        setSelectedBook(booksData.find(b => b.name === 'Genesis') || booksData[0]);
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
      // Use the actual Bible API to get chapter verses
      const bibleId = 'de4e12af7f28f599-02'; // KJV Bible ID
      const bookId = selectedBook.id.toUpperCase();
      const apiVerses = await bibleApi.fetchChapter(bookId, selectedChapter, bibleId);
      
      // Convert to our expected format
      const verses: BibleVerse[] = apiVerses.map(verse => ({
        book_name: selectedBook.name,
        chapter: selectedChapter,
        verse: verse.verse,
        text: verse.text,
        translation: selectedTranslation
      }));
      
      // If no verses from API, use fallback sample verses
      const fallbackVerses: BibleVerse[] = [
        {
          book_name: selectedBook.name,
          chapter: selectedChapter,
          verse: 1,
          text: "In the beginning God created the heaven and the earth.",
          translation: selectedTranslation
        },
        {
          book_name: selectedBook.name,
          chapter: selectedChapter,
          verse: 2,
          text: "And the earth was without form, and void; and darkness was upon the face of the deep.",
          translation: selectedTranslation
        }
      ];
      
      // Use API verses if available, otherwise use fallback verses
      setVerses(verses.length > 0 ? verses : fallbackVerses);
    } catch (error) {
      console.error('Error loading chapter:', error);
      toast({
        title: "Error",
        description: "Failed to load chapter",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load bookmarks, highlights, etc.
      // This would connect to your existing user data loading logic
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const updateRecentBooks = () => {
    if (!selectedBook) return;
    
    setRecentBooks(prev => {
      const filtered = prev.filter(book => book.id !== selectedBook.id);
      return [selectedBook, ...filtered].slice(0, 10);
    });
  };

  const handleBookSelect = (book: BibleBook) => {
    setSelectedBook(book);
    setSelectedChapter(1);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleChapterSelect = (chapter: number) => {
    setSelectedChapter(chapter);
    setShowChapterSelector(false);
  };

  const navigateChapter = (direction: 'prev' | 'next') => {
    if (!selectedBook) return;
    
    if (direction === 'prev' && selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
    } else if (direction === 'next' && selectedChapter < selectedBook.chapters) {
      setSelectedChapter(selectedChapter + 1);
    }
  };

  const copyVerse = (verse: BibleVerse) => {
    const text = `"${verse.text}" - ${verse.book_name} ${verse.chapter}:${verse.verse} (${verse.translation})`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Verse Copied",
      description: "Bible verse copied to clipboard",
    });
  };

  const shareVerse = (verse: BibleVerse) => {
    const text = `"${verse.text}" - ${verse.book_name} ${verse.chapter}:${verse.verse}`;
    if (navigator.share) {
      navigator.share({
        title: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
        text,
      });
    } else {
      copyVerse(verse);
    }
  };

  const handleNavigateToVerse = (bookName: string, chapter: number) => {
    const book = books.find(b => b.name === bookName);
    if (book) {
      setSelectedBook(book);
      setSelectedChapter(chapter);
      setActiveMainTab('read');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="flex h-screen">
        {/* Enhanced Sidebar */}
        {(showSidebar || !isMobile) && (
          <div className={`${isMobile ? 'fixed inset-y-0 left-0 z-50 w-80' : 'w-80'} bg-white shadow-lg`}>
            <EnhancedBibleSidebar
              books={books}
              selectedBook={selectedBook}
              onBookSelect={handleBookSelect}
              onTabChange={setActiveSidebarTab}
              activeTab={activeSidebarTab}
              recentBooks={recentBooks}
              bookmarkedBooks={bookmarkedBooks}
              onNavigateToVerse={handleNavigateToVerse}
            />
          </div>
        )}

        {/* Mobile Overlay */}
        {isMobile && showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with Navigation */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Mobile Menu & Logo */}
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSidebar(!showSidebar)}
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                )}
                
                <div className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-orange-600" />
                  <h1 className="text-xl font-bold text-gray-800">Bible Reader</h1>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAIChat(true)}
                className="md:hidden"
              >
                <Bot className="w-5 h-5" />
              </Button>

              {/* Settings */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Chapter Navigation */}
          {selectedBook && (
            <div className="bg-white border-b border-gray-200 px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Select value={selectedTranslation} onValueChange={setSelectedTranslation}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {translations.map((translation) => (
                        <SelectItem key={translation.value} value={translation.value}>
                          {translation.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateChapter('prev')}
                    disabled={selectedChapter <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateChapter('next')}
                    disabled={selectedChapter >= selectedBook.chapters}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area - Only Bible Verses */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading verses...</p>
                  </div>
                ) : verses.length > 0 ? (
                  <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {selectedBook?.name} {selectedChapter}
                      </h1>
                      <Badge variant="outline" className="text-xs">
                        {selectedTranslation}
                      </Badge>
                    </div>
                    
                    <div className="space-y-4">
                      {verses.map((verse) => (
                        <div
                          key={`${verse.chapter}-${verse.verse}`}
                          className="flex gap-4 group hover:bg-gray-50 -mx-2 px-2 py-2 rounded"
                        >
                          {showVerseNumbers && (
                            <div className="flex-shrink-0 w-8 text-right">
                              <span className="text-sm font-medium text-gray-400">
                                {verse.verse}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <p 
                              className="text-gray-800 leading-relaxed"
                              style={{ 
                                fontSize: `${fontSize}px`,
                                lineHeight: lineHeight 
                              }}
                            >
                              {verse.text}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => copyVerse(verse)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <Share className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <Heart className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <Bookmark className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      Select a Book to Start Reading
                    </h3>
                    <p className="text-gray-500">
                      Choose a book from the sidebar to begin your Bible study
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Quick AI Chat Widget */}
      <QuickAIChatTrigger
        currentVerse={verses[0]?.text}
        currentBook={selectedBook?.name}
        currentChapter={selectedChapter}
      />

      {/* Chapter Selector Dialog */}
      <Dialog open={showChapterSelector} onOpenChange={setShowChapterSelector}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Chapter</DialogTitle>
          </DialogHeader>
          {selectedBook && (
            <CalendarChapterSelector
              bookName={selectedBook.name}
              totalChapters={selectedBook.chapters}
              currentChapter={selectedChapter}
              completedChapters={completedChapters}
              onChapterSelect={handleChapterSelect}
              onClose={() => setShowChapterSelector(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* AI Chat Dialog */}
      <Dialog open={showAIChat} onOpenChange={setShowAIChat}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              Bible AI Assistant
            </DialogTitle>
          </DialogHeader>
          <div className="h-[500px]">
            <EnhancedAIChat />
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Reading Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Line Height: {lineHeight}
              </label>
              <input
                type="range"
                min="1.2"
                max="2.0"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Show Verse Numbers
              </label>
              <input
                type="checkbox"
                checked={showVerseNumbers}
                onChange={(e) => setShowVerseNumbers(e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 