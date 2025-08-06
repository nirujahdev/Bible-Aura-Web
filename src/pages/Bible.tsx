import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, Bookmark, Heart, ChevronLeft, ChevronRight, 
  Book, MessageCircle, FileText, Highlighter, Copy, Share2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  BibleBook, 
  BibleVerse, 
  getAllBooks, 
  getChapterVerses, 
  searchVerses, 
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

const ENGLISH_TRANSLATIONS = BIBLE_TRANSLATIONS.filter(t => t.language === 'english');

export default function Bible() {
  // SEO optimization
  useSEO(SEO_CONFIG.BIBLE);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'tamil'>('english');
  const [selectedTranslation, setSelectedTranslation] = useState<TranslationCode>('KJV');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [highlights, setHighlights] = useState<Map<string, string>>(new Map());
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<{id: string, text: string, reference: string} | null>(null);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [showChapterSelector, setShowChapterSelector] = useState(false);

  useEffect(() => {
    loadBooks();
    if (user) {
      loadBookmarks();
      loadFavorites();
      loadHighlights();
    }
  }, [user, selectedLanguage]);

  useEffect(() => {
    if (selectedBook) {
      loadChapter();
    }
  }, [selectedBook, selectedChapter, selectedLanguage, selectedTranslation]);

  const loadBooks = async () => {
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

  const loadBookmarks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('verse_id')
        .eq('user_id', user.id)
        .eq('category', 'bookmark');
      
      if (error) throw error;
      
      const bookmarkSet = new Set<string>(data?.map(item => item.verse_id) || []);
      setBookmarks(bookmarkSet);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('bookmarks')
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
        .from('bookmarks')
        .select('verse_id, highlight_color')
        .eq('user_id', user.id)
        .not('highlight_color', 'is', null);
      
      if (error) throw error;
      
      const highlightMap = new Map<string, string>();
      data?.forEach(item => {
        if (item.highlight_color) {
          highlightMap.set(item.verse_id, item.highlight_color);
        }
      });
      setHighlights(highlightMap);
    } catch (error) {
      console.error('Error loading highlights:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
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

  const addToJournal = async (verse: BibleVerse) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to save to journal",
        variant: "destructive"
      });
      return;
    }

    try {
      const journalEntry = `Bible Study Reflection - ${new Date().toLocaleDateString()}

"${verse.text}" - ${verse.book_name} ${verse.chapter}:${verse.verse}

Reflection:
[Add your thoughts and insights about this verse here]

What does this verse mean to me?
[Personal reflection space]

How can I apply this to my life?
[Application notes]`;

      const { error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          title: `${verse.book_name} ${verse.chapter}:${verse.verse} Reflection`,
          content: journalEntry,
          entry_date: new Date().toISOString(),
          verse_references: [`${verse.book_name} ${verse.chapter}:${verse.verse}`],
          verse_reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
          verse_text: verse.text
        });

      if (error) throw error;

      toast({
        title: "Added to Journal",
        description: `${verse.book_name} ${verse.chapter}:${verse.verse} saved to your journal`,
      });
    } catch (error) {
      console.error('Error adding to journal:', error);
      toast({
        title: "Error",
        description: "Failed to save to journal",
        variant: "destructive"
      });
    }
  };

  const addToBookmarks = async (verse: BibleVerse) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to save bookmarks",
        variant: "destructive"
      });
      return;
    }

    const verseId = verse.id;
    const isBookmarked = bookmarks.has(verseId);

    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('verse_id', verseId)
          .eq('category', 'bookmark');
        
        if (error) throw error;
        
        const newBookmarks = new Set(bookmarks);
        newBookmarks.delete(verseId);
        setBookmarks(newBookmarks);
        
        toast({
          title: "Bookmark Removed",
          description: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
        });
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .upsert({
            user_id: user.id,
            verse_id: verseId,
            book_name: verse.book_name,
            chapter: verse.chapter,
            verse: verse.verse,
            verse_text: verse.text,
            verse_reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
            category: 'bookmark',
            color: 'blue'
          });
        
        if (error) throw error;
        
        const newBookmarks = new Set(bookmarks);
        newBookmarks.add(verseId);
        setBookmarks(newBookmarks);
        
        toast({
          title: "Bookmarked",
          description: `${verse.book_name} ${verse.chapter}:${verse.verse} added to bookmarks`,
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive"
      });
    }
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
          .from('bookmarks')
          .update({ is_favorite: false })
          .eq('user_id', user.id)
          .eq('verse_id', verseId);
        
        if (error) throw error;
        
        const newFavorites = new Set(favorites);
        newFavorites.delete(verseId);
        setFavorites(newFavorites);
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .upsert({
            user_id: user.id,
            verse_id: verseId,
            book_name: verse.book_name,
            chapter: verse.chapter,
            verse: verse.verse,
            verse_text: verse.text,
            verse_reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
            is_favorite: true,
            category: 'favorite',
            color: 'red'
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
        .from('bookmarks')
        .upsert({
          user_id: user.id,
          verse_id: verse.id,
          book_name: verse.book_name,
          chapter: verse.chapter,
          verse: verse.verse,
          verse_text: verse.text,
          verse_reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
          highlight_color: color,
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
      setShowBookSelector(false);
    }
  };

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

  const oldTestamentBooks = books.filter(book => book.testament === 'old');
  const newTestamentBooks = books.filter(book => book.testament === 'new');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Orange Top Bar with Chapter/Verse Navigation */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          {/* Top Controls Row */}
          <div className="flex items-center justify-between mb-4">
            {/* Left: Book and Translation Selectors */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Book className="h-6 w-6" />
                <h1 className="text-xl font-bold">Bible Study</h1>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Language Selector */}
                <Select value={selectedLanguage} onValueChange={(value: 'english' | 'tamil') => setSelectedLanguage(value)}>
                  <SelectTrigger className="w-32 bg-white/20 border-white/30 text-white">
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

                {/* Translation Selector */}
                {selectedLanguage === 'english' && (
                  <Select value={selectedTranslation} onValueChange={(value: TranslationCode) => setSelectedTranslation(value)}>
                    <SelectTrigger className="w-40 bg-white/20 border-white/30 text-white">
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
                )}
              </div>
            </div>

            {/* Right: Search */}
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Search verses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-white/20 border-white/30 text-white placeholder-white/70"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={loading}
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Book and Chapter Navigation Row */}
          {selectedBook && (
            <div className="flex items-center justify-between">
              {/* Book Selection */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowBookSelector(!showBookSelector)}
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  {selectedBook.name}
                </Button>
                
                {showBookSelector && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-50 w-96">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Old Testament</h3>
                        <div className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto">
                          {oldTestamentBooks.map((book) => (
                            <Button
                              key={book.id}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleBookSelect(book.name)}
                              className="text-xs justify-start h-8"
                            >
                              {book.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">New Testament</h3>
                        <div className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto">
                          {newTestamentBooks.map((book) => (
                            <Button
                              key={book.id}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleBookSelect(book.name)}
                              className="text-xs justify-start h-8"
                            >
                              {book.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chapter Navigation */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigateChapter('prev')}
                    disabled={selectedChapter <= 1}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    onClick={() => setShowChapterSelector(!showChapterSelector)}
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 min-w-24"
                  >
                    Chapter {selectedChapter}
                  </Button>
                  
                  {showChapterSelector && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-50">
                      <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto">
                        {Array.from({ length: selectedBook.chapters || 1 }, (_, i) => i + 1).map((chapter) => (
                          <Button
                            key={chapter}
                            variant={selectedChapter === chapter ? "default" : "ghost"}
                            size="sm"
                            onClick={() => {
                              setSelectedChapter(chapter);
                              setShowChapterSelector(false);
                            }}
                            className="h-8 w-8 text-sm"
                          >
                            {chapter}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigateChapter('next')}
                    disabled={selectedChapter >= (selectedBook.chapters || 1)}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {verses.length} verses
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Search Results ({searchResults.length})
            </h2>
            <div className="space-y-4">
              {searchResults.slice(0, 10).map((verse) => (
                <div key={verse.id} className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="font-medium text-orange-600 mb-2">
                    {verse.book_name} {verse.chapter}:{verse.verse}
                  </div>
                  <div className="text-gray-700 leading-relaxed">
                    {verse.text}
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-8" />
          </div>
        )}

        {/* Verses Display */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading verses...</p>
            </div>
          </div>
        ) : selectedBook && verses.length > 0 ? (
          <div className="space-y-6">
            {verses.map((verse) => {
              const verseId = verse.id;
              const isBookmarked = bookmarks.has(verseId);
              const isFavorited = favorites.has(verseId);
              const highlightColor = highlights.get(verseId);
              
              return (
                <div
                  key={verse.id}
                  className={`group relative rounded-xl transition-all duration-200 p-6 ${
                    highlightColor 
                      ? `bg-${highlightColor}-100 border-l-4 border-${highlightColor}-400` 
                      : 'hover:bg-orange-50 bg-white border-l-4 border-orange-200 hover:border-orange-400 shadow-sm'
                  }`}
                >
                  {/* Verse Content */}
                  <div className="flex items-start gap-6">
                    {/* Verse Number */}
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-lg shadow-sm">
                        {verse.verse}
                      </span>
                    </div>
                    
                    {/* Verse Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 leading-relaxed font-normal text-xl leading-9">
                        {verse.text}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className={`flex items-center justify-end gap-2 mt-4 ${
                    isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  } transition-opacity`}>
                    
                    {/* AI Chat */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openAiChat(verse)}
                      className="h-10 w-10 p-0 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                      title="Ask AI"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </Button>

                    {/* Favorite Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(verse)}
                      className={`h-10 w-10 p-0 ${
                        isFavorited 
                          ? 'text-red-500 hover:text-red-600 bg-red-50' 
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                      title="Add to Favorites"
                    >
                      <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                    </Button>

                    {/* Bookmark Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addToBookmarks(verse)}
                      className={`h-10 w-10 p-0 ${
                        isBookmarked 
                          ? 'text-blue-500 hover:text-blue-600 bg-blue-50' 
                          : 'text-gray-400 hover:text-blue-500'
                      }`}
                      title="Bookmark"
                    >
                      <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </Button>

                    {/* Add to Journal */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addToJournal(verse)}
                      className="h-10 w-10 p-0 text-gray-400 hover:text-green-500"
                      title="Add to Journal"
                    >
                      <FileText className="h-5 w-5" />
                    </Button>

                    {/* Highlight Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => highlightVerse(verse, 'yellow')}
                      className="h-10 w-10 p-0 text-gray-400 hover:text-yellow-500"
                      title="Highlight"
                    >
                      <Highlighter className="h-5 w-5" />
                    </Button>

                    {/* Copy Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyVerse(verse)}
                      className="h-10 w-10 p-0 text-gray-400 hover:text-gray-600"
                      title="Copy"
                    >
                      <Copy className="h-5 w-5" />
                    </Button>

                    {/* Share Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => shareVerse(verse)}
                      className="h-10 w-10 p-0 text-gray-400 hover:text-gray-600"
                      title="Share"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <Book className="mx-auto mb-4 text-gray-400 h-20 w-20" />
              <h3 className="font-semibold text-gray-700 mb-2 text-xl">
                Select a Book to Begin Reading
              </h3>
              <p className="text-gray-500">
                Choose a book from the orange top bar to start your Bible study journey.
              </p>
            </div>
          </div>
        )}
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
      {aiChatOpen && selectedVerse && (
        <BibleAIChat
          verseId={selectedVerse.id}
          verseText={selectedVerse.text}
          verseReference={selectedVerse.reference}
          isOpen={aiChatOpen}
          onClose={() => setAiChatOpen(false)}
        />
      )}
    </div>
  );
}