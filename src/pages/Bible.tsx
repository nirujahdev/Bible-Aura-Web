// Bible page - Clean reading and search interface
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, Bookmark, Heart, Share, ChevronLeft, ChevronRight, 
  Book, Languages, StickyNote, BookOpen, Target,
  Copy, Highlighter, FileText,
  ChevronDown, ChevronUp, Menu, Sparkles, PenTool, Share2, X
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { useRightSidebar } from '@/components/MobileOptimizedLayout';
import { 
  BibleBook, 
  BibleVerse, 
  getAllBooks, 
  getChapterVerses, 
  searchVerses,
  BIBLE_TRANSLATIONS,
  TranslationCode
} from '@/lib/local-bible';
import { highlightSearchTerms } from '@/lib/search-utils';
import { NoteTaking } from '@/components/NoteTaking';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
import { MobileOptimizedLayout } from '@/components/MobileOptimizedLayout';
import { ModernLayout } from '@/components/ModernLayout';
import { cn } from '@/lib/utils';
import BibleVerseAIChat from '@/components/BibleVerseAIChat';
import { motion, AnimatePresence } from 'framer-motion';

// New bookmarks and favorites service
import { 
  BibleVerseService, 
  FavoritesService, 
  BookmarksService,
  generateVerseId,
  generateVerseReference
} from '@/lib/bookmarks-favorites-service';

const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'tamil', label: 'Tamil' }
];

// English translations available
const ENGLISH_TRANSLATIONS = BIBLE_TRANSLATIONS.filter(t => t.language === 'english');

// Reading plans removed - focusing on simple Bible reading experience

const HIGHLIGHT_COLORS = [
  { id: 'yellow', name: 'Yellow', color: 'bg-yellow-200 border-yellow-400', dot: 'bg-yellow-400' },
  { id: 'green', name: 'Green', color: 'bg-green-200 border-green-400', dot: 'bg-green-400' },
  { id: 'blue', name: 'Blue', color: 'bg-blue-200 border-blue-400', dot: 'bg-blue-400' },
  { id: 'purple', name: 'Purple', color: 'bg-purple-200 border-purple-400', dot: 'bg-purple-400' },
  { id: 'red', name: 'Red', color: 'bg-red-200 border-red-400', dot: 'bg-red-400' },
  { id: 'pink', name: 'Pink', color: 'bg-pink-200 border-pink-400', dot: 'bg-pink-400' },
  { id: 'orange', name: 'Orange', color: 'bg-orange-200 border-orange-400', dot: 'bg-orange-400' },
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
  const rightSidebar = useRightSidebar();
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
  const [selectedVerse, setSelectedVerse] = useState<{id: string, text: string, reference: string} | null>(null);
  
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [selectedVerseForAI, setSelectedVerseForAI] = useState<BibleVerse | null>(null);
  const [targetVerseNumber, setTargetVerseNumber] = useState<number | null>(null);
  const [selectedVerseForHighlight, setSelectedVerseForHighlight] = useState<string | null>(null);
  const [floatingChapterSelectorOpen, setFloatingChapterSelectorOpen] = useState(false);

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
  // CRITICAL: activeTab should NEVER change automatically - only on explicit user tab clicks
  const [activeTab, setActiveTab] = useState<'read' | 'search'>('read');
  const [readingPlan, setReadingPlan] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [searchFilters, setSearchFilters] = useState({
    testament: 'all',
    book: 'all',
    exactMatch: false
  });
  const [advancedSearchEnabled, setAdvancedSearchEnabled] = useState(false);
  const [fuzzySearchEnabled, setFuzzySearchEnabled] = useState(true); // Enabled by default for better typo tolerance
  const [visibleResultsCount, setVisibleResultsCount] = useState(50);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [showVerseNumbers, setShowVerseNumbers] = useState(true);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [crossReferences, setCrossReferences] = useState<any[]>([]);
  
  // New state for UI improvements
  const [oldTestamentExpanded, setOldTestamentExpanded] = useState(false);
  const [newTestamentExpanded, setNewTestamentExpanded] = useState(false);
  const [showSearchFilters, setShowSearchFilters] = useState(false);
  
  // Mobile sidebar state - completely independent from tab state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Mobile detection
  const isMobile = useIsMobile();
  
  // CRITICAL: Tab state is completely isolated - NEVER changes except on explicit user click
  // This ref helps prevent any accidental state changes
  const tabStateRef = React.useRef<'read' | 'search'>('read');
  
  // Sync ref with state
  React.useEffect(() => {
    tabStateRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    loadBooks();
    loadTamilBookNames();
    if (user) {
      // Use optimized parallel loading for 3x speed improvement
      loadUserData();
      loadReadingProgress();
    }
  }, [user, selectedLanguage]);

  // Set default to Genesis 1:1 when books are loaded
  useEffect(() => {
    if (books.length > 0 && !selectedBook) {
      const genesis = books.find(b => b.name === 'Genesis');
      if (genesis) {
        setSelectedBook(genesis);
        setSelectedChapter(1);
      }
    }
  }, [books, selectedBook]);


  useEffect(() => {
    if (selectedBook) {
      loadChapter();
    }
  }, [selectedBook, selectedChapter, selectedLanguage, selectedTranslation]);

  // Close highlight picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (selectedVerseForHighlight && !target.closest('[data-highlight-container]')) {
        setSelectedVerseForHighlight(null);
      }
    };

    if (selectedVerseForHighlight) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [selectedVerseForHighlight]);

  // Scroll to specific verse when coming from search results
  useEffect(() => {
    if (targetVerseNumber && verses.length > 0 && !loading) {
      // Find the verse element and scroll to it
      const verseElement = document.querySelector(`[data-verse-number="${targetVerseNumber}"]`);
      if (verseElement) {
        setTimeout(() => {
          verseElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
          // Highlight briefly
          verseElement.classList.add('ring-4', 'ring-orange-400', 'ring-offset-2', 'rounded-xl');
          setTimeout(() => {
            verseElement.classList.remove('ring-4', 'ring-orange-400', 'ring-offset-2');
          }, 2000);
          setTargetVerseNumber(null);
        }, 100);
      }
    }
  }, [targetVerseNumber, verses, loading]);

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

  // Listen for bible-action events from MobileMoreMenu
  useEffect(() => {
    const handleBibleAction = (event: CustomEvent) => {
      const action = event.detail?.action;
      
      try {
        switch (action) {
          case 'search-verses':
            setActiveTab('search');
            break;
          case 'book-selection':
            setMobileSidebarOpen(true);
            break;
          case 'translation':
            // Translation selection can be done from sidebar
            setMobileSidebarOpen(true);
            break;
          case 'random-verse':
            getRandomVerse();
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
  }, [getRandomVerse]);

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

  // Optimized: Load all user data in parallel for faster performance
  const loadUserData = async () => {
    if (!user) return;
    
    try {
      // Load all user-specific data in parallel for 3x speed improvement
      const [bookmarksResult, favoritesResult, highlightsResult] = await Promise.all([
        BookmarksService.getUserBookmarks(user.id).catch(err => {
          console.error('Error loading bookmarks:', err);
          return [];
        }),
        FavoritesService.getUserFavorites(user.id).catch(err => {
          console.error('Error loading favorites:', err);
          return [];
        }),
        (async () => {
          try {
            const { data, error } = await supabase
              .from('verse_highlights')
              .select('verse_id, color')
              .eq('user_id', user.id);
            return { data, error };
          } catch (err) {
            console.error('Error loading highlights:', err);
            return { data: null, error: err };
          }
        })()
      ]);

      // Process results with proper typing
      if (bookmarksResult && Array.isArray(bookmarksResult)) {
        const bookmarkSet = new Set<string>(bookmarksResult.map((b: any) => String(b.verse_id)));
        setBookmarks(bookmarkSet);
      }

      if (favoritesResult && Array.isArray(favoritesResult)) {
        const favoriteSet = new Set<string>(favoritesResult.map((f: any) => String(f.verse_id)));
        setFavorites(favoriteSet);
      }

      if (highlightsResult?.data && !highlightsResult.error) {
        const highlightMap = new Map<string, string>();
        highlightsResult.data.forEach((item: any) => {
          if (item.color && item.verse_id) {
            highlightMap.set(String(item.verse_id), item.color);
          }
        });
        setHighlights(highlightMap);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Legacy functions kept for backward compatibility
  const loadBookmarks = async () => {
    if (!user) return;
    try {
      const userBookmarks = await BookmarksService.getUserBookmarks(user.id);
      const bookmarkSet = new Set(userBookmarks.map(b => b.verse_id));
      setBookmarks(bookmarkSet);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const loadFavorites = async () => {
    if (!user) return;
    try {
      const userFavorites = await FavoritesService.getUserFavorites(user.id);
      const favoriteSet = new Set<string>(userFavorites.map(f => f.verse_id));
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
    
    setLoading(true);
    setVisibleResultsCount(50); // Reset visible count on new search
    
    try {
      // Search BOTH English and Tamil simultaneously - no need to switch languages
      const [englishResults, tamilResults] = await Promise.all([
        searchVerses(
          searchQuery, 
          'english',
          searchFilters.book !== 'all' ? searchFilters.book : undefined,
          selectedTranslation,
          {
            fuzzyEnabled: fuzzySearchEnabled,
            maxResults: 200
          }
        ).catch(err => {
          console.error('Error searching English:', err);
          return [];
        }),
        searchVerses(
          searchQuery, 
          'tamil',
          searchFilters.book !== 'all' ? searchFilters.book : undefined,
          'TAMIL',
          {
            fuzzyEnabled: fuzzySearchEnabled,
            maxResults: 200
          }
        ).catch(err => {
          console.error('Error searching Tamil:', err);
          return [];
        })
      ]);
      
      // Combine results from both languages
      let results = [...englishResults, ...tamilResults];
      
      // Sort by relevance score (highest first) - better results come first
      results.sort((a, b) => {
        const scoreA = a.relevanceScore || 0;
        const scoreB = b.relevanceScore || 0;
        return scoreB - scoreA; // Sort descending
      });
      
      // Remove duplicates (same book, chapter, verse) - keep the one with higher relevance
      const uniqueResults = new Map<string, BibleVerse>();
      for (const verse of results) {
        const key = `${verse.book_name}-${verse.chapter}-${verse.verse}`;
        const existing = uniqueResults.get(key);
        if (!existing || (verse.relevanceScore || 0) > (existing.relevanceScore || 0)) {
          uniqueResults.set(key, verse);
        }
      }
      results = Array.from(uniqueResults.values());
      
      // Re-sort after deduplication
      results.sort((a, b) => {
        const scoreA = a.relevanceScore || 0;
        const scoreB = b.relevanceScore || 0;
        return scoreB - scoreA;
      });
      
      // Apply filters after combining results
      if (searchFilters.testament !== 'all') {
        results = results.filter(verse => {
          const book = books.find(b => b.name === verse.book_name);
          return book?.testament === searchFilters.testament;
        });
      }
      
      if (searchFilters.exactMatch) {
        const queryTrimmed = searchQuery.trim();
        if (queryTrimmed.length === 0) {
          results = [];
        } else {
          const queryLower = queryTrimmed.toLowerCase();
          const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);
          
          // For exact match, check for exact phrase match (case-insensitive)
          results = results.filter(verse => {
            // Get clean verse text (remove HTML tags if any)
            const verseText = verse.text.replace(/<[^>]*>/g, '').trim();
            const verseTextLower = verseText.toLowerCase();
            
            // If single word, check word boundaries (case-insensitive)
            if (queryWords.length === 1) {
              const word = queryWords[0];
              // Escape special regex characters
              const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              // Use word boundaries for exact word match
              const wordBoundaryRegex = new RegExp(`\\b${escapedWord}\\b`, 'i');
              return wordBoundaryRegex.test(verseText);
            } else {
              // If multiple words, check exact phrase match with word boundaries
              // Escape special regex characters
              const escapedWords = queryWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
              // Match words in order with word boundaries and flexible whitespace
              const phraseRegex = new RegExp(
                escapedWords.map(w => `\\b${w}\\b`).join('\\s+'),
                'i'
              );
              return phraseRegex.test(verseText);
            }
          });
        }
      }
      
      // Limit to max results for performance
      results = results.slice(0, 500);
      
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No Results",
          description: "No verses found matching your search in English or Tamil",
        });
      } else {
        const englishCount = results.filter(r => r.language === 'english').length;
        const tamilCount = results.filter(r => r.language === 'tamil').length;
        toast({
          title: "Search Complete",
          description: `Found ${results.length} verses (${englishCount} English, ${tamilCount} Tamil)`,
        });
      }
    } catch (error) {
      console.error('Error searching verses:', error);
      toast({
        title: "Search Error",
        description: "Failed to search verses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to highlight exact search terms in verse text
  const highlightVerseText = (verse: BibleVerse, query: string): string => {
    if (!query || !query.trim()) return verse.text;
    
    const queryWords = query.trim().split(/\s+/).filter(word => word.length > 0);
    if (queryWords.length === 0) return verse.text;

    let highlightedText = verse.text;
    
    // Highlight exact word matches (case-insensitive)
    queryWords.forEach(word => {
      const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, (match) => {
        return `<mark class="bg-yellow-200 font-semibold text-gray-900">${match}</mark>`;
      });
    });
    
    return highlightedText;
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
          verse_reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
          verse_text: verse.text,
          verse_references: [`${verse.book_name} ${verse.chapter}:${verse.verse}`],
          category: 'study',
          word_count: journalEntry.trim().split(/\s+/).length,
          reading_time: Math.max(1, Math.ceil(journalEntry.trim().split(/\s+/).length / 200)),
          entry_date: new Date().toISOString().split('T')[0],
          is_private: true,
          language: 'english',
          tags: ['bible-study', 'verse-reflection'],
          metadata: {
            verse_reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
            source: 'bible_reader'
          }
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

    try {
      const result = await BibleVerseService.toggleBookmark(
        user.id, 
        verse, 
        'study', 
        'yellow', 
        selectedTranslation
      );
      
      const verseId = generateVerseId(verse);
      const newBookmarks = new Set(bookmarks);
      
      if (result.isBookmarked) {
        newBookmarks.add(verseId);
      } else {
        newBookmarks.delete(verseId);
      }
      
      setBookmarks(newBookmarks);
      
      toast({
        title: result.action === 'added' ? "Bookmarked" : "Bookmark Removed",
        description: `${verse.book_name} ${verse.chapter}:${verse.verse} ${result.action === 'added' ? 'added to' : 'removed from'} bookmarks`,
      });
    } catch (error) {
      console.error('Error updating bookmark:', error);
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

    try {
      const result = await BibleVerseService.toggleFavorite(
        user.id, 
        verse, 
        selectedTranslation
      );
      
      const verseId = generateVerseId(verse);
      const newFavorites = new Set(favorites);
      
      if (result.isFavorited) {
        newFavorites.add(verseId);
      } else {
        newFavorites.delete(verseId);
      }
      
      setFavorites(newFavorites);

      toast({
        title: result.action === 'added' ? "Added to Favorites" : "Removed from Favorites",
        description: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to save to favorites",
        variant: "destructive"
      });
    }
  };

  // Helper function to get highlight color classes
  const getHighlightClasses = (color: string | undefined) => {
    if (!color) return 'hover:bg-gray-50';
    const colorMap: Record<string, string> = {
      'yellow': 'bg-yellow-100 border-l-4 border-yellow-400',
      'green': 'bg-green-100 border-l-4 border-green-400',
      'blue': 'bg-blue-100 border-l-4 border-blue-400',
      'purple': 'bg-purple-100 border-l-4 border-purple-400',
      'red': 'bg-red-100 border-l-4 border-red-400',
      'pink': 'bg-pink-100 border-l-4 border-pink-400',
      'orange': 'bg-orange-100 border-l-4 border-orange-400',
    };
    const baseClass = colorMap[color] || 'hover:bg-gray-50';
    return `${baseClass} max-w-full overflow-x-hidden`;
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
      const verseId = generateVerseId(verse);
      
      // If color is empty, remove the highlight
      if (!color || color.trim() === '') {
        const { error } = await supabase
          .from('verse_highlights')
          .delete()
          .eq('user_id', user.id)
          .eq('verse_id', verseId);
        
        if (error) throw error;
        
        const newHighlights = new Map(highlights);
        newHighlights.delete(verseId);
        setHighlights(newHighlights);
        
        toast({
          title: "Highlight Removed",
          description: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
        });
        return;
      }
      
      // Add or update highlight
      const { error } = await supabase
        .from('verse_highlights')
        .upsert({
          user_id: user.id,
          verse_id: verseId,
          color: color,
          category: 'highlight'
        }, {
          onConflict: 'user_id,verse_id'
        });
      
      if (error) throw error;
      
      const newHighlights = new Map(highlights);
      newHighlights.set(verseId, color);
      setHighlights(newHighlights);
      
      toast({
        title: "Verse Highlighted",
        description: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
      });
    } catch (error: any) {
      console.error('Error highlighting verse:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to highlight verse",
        variant: "destructive"
      });
    }
  };

  const handleBookSelect = (bookName: string, forceTab?: 'read' | 'search') => {
    const book = books.find(b => b.name === bookName);
    if (book) {
      setSelectedBook(book);
      setSelectedChapter(1);
      // CRITICAL: Only switch tab if explicitly requested from Read tab button clicks
      // NEVER auto-switch when clicking search results - that should stay on 'search'
      // Only switch when user explicitly selects book from Read tab sidebar
      if (forceTab === 'read' && tabStateRef.current !== 'read') {
        // Double-check using ref to ensure we're not accidentally switching
        // Only switch if not already on read tab
        setActiveTab('read');
        tabStateRef.current = 'read';
      }
      // If forceTab is 'search' or undefined, do NOT change tabs
      // This ensures search results clicking never switches tabs
    }
  };

  const oldTestamentBooks = books.filter(book => book.testament === 'old');
  const newTestamentBooks = books.filter(book => book.testament === 'new');

  // Reusable Sidebar Content Component - Works for both mobile and desktop - Clean Modern UI
  const renderSidebarContent = (isMobileSidebar = false) => {
    return (
      <>
        {/* Clean Header with Language/Translation and Search */}
        <div className={cn(
          "p-4 border-b border-gray-200 bg-white",
          !isMobileSidebar && "bg-gradient-to-br from-white to-orange-50/30"
        )}>
          <div className="flex items-center gap-2 mb-3">
            {/* Language Selector */}
            <Select value={selectedLanguage} onValueChange={(value: 'english' | 'tamil') => setSelectedLanguage(value)}>
              <SelectTrigger className="h-9 text-xs flex-shrink-0 border-gray-300 hover:border-orange-400 transition-colors">
                <Languages className="h-3.5 w-3.5 mr-1.5 text-gray-600" />
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

          {/* Search Input - Clean Design - Mobile Optimized */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
            <Input
              placeholder={isMobile ? "Search Bible verses..." : "Search verses..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setActiveTab('search');
                  handleSearch();
                }
              }}
              onFocus={() => {
                if (searchQuery.trim()) {
                  setActiveTab('search');
                }
              }}
              className={cn(
                "pl-9 text-sm border-gray-300 focus:border-orange-400 focus:ring-orange-400/20",
                isMobile ? "h-10 text-base" : "h-9"
              )}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Clean Tabs Design */}
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => {
            if (value === 'read' || value === 'search') {
              setActiveTab(value);
              tabStateRef.current = value;
              if (value === 'read') {
                setSearchResults([]);
              }
              if (isMobileSidebar) {
                setTimeout(() => setMobileSidebarOpen(false), 150);
              }
            }
          }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className={cn(
            "px-4 pt-4 pb-2 border-b border-gray-100",
            isMobileSidebar && "px-3"
          )}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 p-1 h-10">
              <TabsTrigger 
                value="read" 
                className="text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all"
              >
                <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                Books
              </TabsTrigger>
              <TabsTrigger 
                value="search" 
                className="text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all"
              >
                <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                Results
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto scrollbar-hide">
            {/* Read Tab Content - Clean Modern Design */}
            <TabsContent value="read" className="mt-0 p-4 space-y-4 data-[state=active]:animate-in">
              {/* Book Selection - Ultra Clean List Design */}
              <div className="space-y-3">
                <Collapsible defaultOpen={!selectedBook || oldTestamentBooks.some(b => b.id === selectedBook.id)}>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between h-9 text-sm font-semibold text-gray-700 hover:bg-gray-50/50 hover:text-gray-900 transition-colors px-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-orange-500 rounded-full" />
                        <span>Old Testament</span>
                        <Badge variant="secondary" className="ml-1 text-xs font-normal bg-gray-100 text-gray-600">
                          {oldTestamentBooks.length}
                        </Badge>
                      </div>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180 text-gray-400" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1">
                    <div className="space-y-0.5 max-h-[380px] overflow-y-auto scrollbar-hide">
                      {oldTestamentBooks.map((book) => (
                        <Button
                          key={book.id}
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleBookSelect(book.name, 'read');
                            if (isMobileSidebar) {
                              setTimeout(() => setMobileSidebarOpen(false), 200);
                            }
                          }}
                          className={cn(
                            "w-full justify-start h-8 text-xs font-medium transition-all touch-target rounded-md px-3",
                            selectedBook?.id === book.id 
                              ? 'bg-orange-500 hover:bg-orange-600 text-white font-semibold' 
                              : 'text-gray-600 hover:bg-orange-50/50 hover:text-orange-700'
                          )}
                        >
                          {book.name}
                        </Button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible defaultOpen={!selectedBook || newTestamentBooks.some(b => b.id === selectedBook.id)}>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between h-9 text-sm font-semibold text-gray-700 hover:bg-gray-50/50 hover:text-gray-900 transition-colors px-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-blue-500 rounded-full" />
                        <span>New Testament</span>
                        <Badge variant="secondary" className="ml-1 text-xs font-normal bg-gray-100 text-gray-600">
                          {newTestamentBooks.length}
                        </Badge>
                      </div>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180 text-gray-400" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1">
                    <div className="space-y-0.5 max-h-[380px] overflow-y-auto scrollbar-hide">
                      {newTestamentBooks.map((book) => (
                        <Button
                          key={book.id}
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleBookSelect(book.name, 'read');
                            if (isMobileSidebar) {
                              setTimeout(() => setMobileSidebarOpen(false), 200);
                            }
                          }}
                          className={cn(
                            "w-full justify-start h-8 text-xs font-medium transition-all touch-target rounded-md px-3",
                            selectedBook?.id === book.id 
                              ? 'bg-orange-500 hover:bg-orange-600 text-white font-semibold' 
                              : 'text-gray-600 hover:bg-orange-50/50 hover:text-orange-700'
                          )}
                        >
                          {book.name}
                        </Button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </TabsContent>

            {/* Search Tab Content - Clean Modern Design */}
            <TabsContent value="search" className="mt-0 p-4 space-y-4 data-[state=active]:animate-in">
              {/* Search Filters - Clean Design */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-1">
                  Filters
                </h3>
                <div className="flex gap-2">
                  <Select 
                    value={searchFilters.testament} 
                    onValueChange={(value) => setSearchFilters({...searchFilters, testament: value})}
                  >
                    <SelectTrigger className="h-9 text-xs flex-1 border-gray-300 hover:border-orange-400 transition-colors">
                      <SelectValue placeholder="Testament" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Testaments</SelectItem>
                      <SelectItem value="old">Old Testament</SelectItem>
                      <SelectItem value="new">New Testament</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={searchFilters.book} 
                    onValueChange={(value) => setSearchFilters({...searchFilters, book: value})}
                  >
                    <SelectTrigger className="h-9 text-xs flex-1 border-gray-300 hover:border-orange-400 transition-colors">
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

                {/* Search Options - Clean Checkboxes */}
                <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                  <label className="flex items-center gap-2 text-xs cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={fuzzySearchEnabled}
                      onChange={(e) => setFuzzySearchEnabled(e.target.checked)}
                      className="rounded w-4 h-4 border-gray-300 text-orange-500 focus:ring-orange-400/20 cursor-pointer transition-colors"
                    />
                    <span className="text-gray-700 group-hover:text-gray-900">Fuzzy search</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={searchFilters.exactMatch}
                      onChange={(e) => setSearchFilters({...searchFilters, exactMatch: e.target.checked})}
                      className="rounded w-4 h-4 border-gray-300 text-orange-500 focus:ring-orange-400/20 cursor-pointer transition-colors"
                    />
                    <span className="text-gray-700 group-hover:text-gray-900">Exact match</span>
                  </label>
                </div>

              </div>

              {/* Loading indicator for search - Clean Design */}
              {loading && activeTab === 'search' && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-200 border-t-orange-500"></div>
                    <p className="text-sm text-gray-600 font-medium">Searching verses...</p>
                  </div>
                </div>
              )}

              {/* Empty State - Clean Design */}
              {!loading && searchResults.length === 0 && searchQuery.trim() && (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    No verses found
                  </p>
                  <p className="text-xs text-gray-500">
                    Try different keywords or check your spelling
                  </p>
                </div>
              )}

              {/* Search Results - Clean Modern Design */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Results
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {searchResults.length}
                      </Badge>
                    </h3>
                    {searchResults.length > visibleResultsCount && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setVisibleResultsCount(prev => Math.min(prev + 50, searchResults.length))}
                        className="text-xs h-8 hover:bg-orange-50 hover:text-orange-600 touch-target"
                      >
                        Show More ({searchResults.length - visibleResultsCount})
                      </Button>
                    )}
                  </div>
                  <div className={cn(
                    "space-y-2 overflow-y-auto scrollbar-hide pr-1",
                    isMobile ? "max-h-[calc(100vh-300px)]" : "max-h-[500px]"
                  )}>
                    {searchResults.slice(0, visibleResultsCount).map((verse) => {
                      const highlightedText = highlightVerseText(verse, searchQuery);
                      return (
                        <motion.div
                          key={verse.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: isMobile ? 1 : 1.01 }}
                          className={cn(
                            "bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer group",
                            isMobile ? "p-4 min-h-[80px] active:bg-orange-50" : "p-3 min-h-[70px]"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            e.nativeEvent?.stopImmediatePropagation?.();
                            const book = books.find(b => b.name === verse.book_name);
                            if (book) {
                              // CRITICAL: Load book/chapter WITHOUT changing tabs
                              setSelectedBook(book);
                              setSelectedChapter(verse.chapter);
                              // Set target verse to scroll to after chapter loads
                              setTargetVerseNumber(verse.verse);
                              // Switch to read tab to show the verse
                              setActiveTab('read');
                              // Close mobile sidebar
                              if (isMobileSidebar) {
                                setTimeout(() => setMobileSidebarOpen(false), 200);
                              }
                            }
                          }}
                        >
                          <div className={cn(
                            "flex items-center gap-2 mb-2 flex-wrap",
                            isMobile && "mb-3"
                          )}>
                            <span className={cn(
                              "font-semibold text-orange-600 group-hover:text-orange-700",
                              isMobile ? "text-base" : "text-sm"
                            )}>
                              {verse.book_name} {verse.chapter}:{verse.verse}
                            </span>
                            <Badge variant="outline" className="text-xs px-2 py-0.5 border-gray-300">
                              {verse.language === 'english' ? 'EN' : 'TA'}
                            </Badge>
                            {verse.relevanceScore && (
                              <span className="ml-auto text-xs text-gray-400">
                                {Math.round(verse.relevanceScore)}% match
                              </span>
                            )}
                          </div>
                          <div 
                            className={cn(
                              "text-gray-700 leading-relaxed line-clamp-2",
                              isMobile ? "text-base leading-6" : "text-sm"
                            )}
                            dangerouslySetInnerHTML={{ __html: highlightedText }}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </>
    );
  };

  // Choose layout based on device type
  const Layout = isMobile ? MobileOptimizedLayout : ModernLayout;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        {/* Mobile Chapter Navigation - Clean and optimized */}
        {isMobile && selectedBook && (
          <div className="fixed top-14 right-4 z-30 flex items-center gap-1 bg-white rounded-lg shadow-md p-1 border border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateChapter('prev')}
              disabled={selectedChapter <= 1}
              className="h-7 w-7 p-0 hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span className="text-xs font-medium px-2 min-w-[2rem] text-center bg-gray-50 rounded">
              {selectedChapter}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateChapter('next')}
              disabled={selectedChapter >= (selectedBook.chapters || 1)}
              className="h-7 w-7 p-0 hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        )}

        <div className={cn("flex", isMobile ? "flex-col h-[100dvh]" : "h-screen")}>
          {/* Desktop Sidebar */}
          {!isMobile && (
            <div className="w-80 bg-white border-r border-gray-200 overflow-hidden flex flex-col">
              {/* Sidebar Content - Shared component for desktop */}
              {renderSidebarContent()}
            </div>
          )}

          {/* Mobile Sidebar - Sheet Drawer (Left - Keep for backward compatibility if needed) */}
          {isMobile && (
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
              <SheetContent side="left" className="w-[320px] sm:w-[380px] p-0 overflow-hidden flex flex-col">
                <SheetHeader className="px-4 pt-4 pb-3 border-b">
                  <SheetTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-orange-500" />
                    <span className="text-lg font-semibold text-gray-800">Bible Study</span>
                  </SheetTitle>
                </SheetHeader>
                {renderSidebarContent(true)}
              </SheetContent>
            </Sheet>
          )}

          {/* Right Side Sheet - Opened from 3-dot menu */}
          {isMobile && rightSidebar && (
            <Sheet open={rightSidebar?.rightSidebarOpen || false} onOpenChange={rightSidebar?.setRightSidebarOpen || (() => {})}>
              <SheetContent side="right" className="w-[320px] sm:w-[380px] p-0 overflow-hidden flex flex-col">
                <SheetHeader className="px-4 pt-4 pb-3 border-b">
                  <SheetTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-orange-500" />
                    <span className="text-lg font-semibold text-gray-800">Bible Study</span>
                  </SheetTitle>
                </SheetHeader>
                {renderSidebarContent(true)}
              </SheetContent>
            </Sheet>
          )}

          {/* Main Reading Area - Adjust when AI chat is open */}
          <div className={cn(
            "flex-1 flex flex-col bg-white overflow-hidden transition-all duration-300 relative z-10",
            aiChatOpen && "mr-[calc(50%)] lg:mr-[384px]"
          )}>
            {/* Header - Mobile optimized */}
            <div className={`flex-shrink-0 border-b border-gray-200 bg-white ${isMobile ? 'p-3 pt-2' : 'p-4'}`}>
              <div className="flex items-center justify-center">
                {selectedBook && (
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold text-gray-800 text-base sm:text-xl">
                      {getBookDisplayName(selectedBook.name)}
                    </h1>
                    <span className="text-gray-600 text-sm sm:text-base">-</span>
                    <span className="text-orange-600 font-semibold text-base sm:text-xl">
                      Chapter {selectedChapter}
                    </span>
                  </div>
                )}
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

            {/* Verses Display - Scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden mobile-scroll" style={{ WebkitOverflowScrolling: 'touch' }}>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading verses...</p>
                  </div>
                </div>
              ) : selectedBook && verses.length > 0 ? (
                <div className={`${isMobile ? 'p-3 pb-20' : 'p-8'} max-w-4xl mx-auto w-full`}>
                  
                  {/* Mobile Chapter Header removed - now shown in main header */}

                  {/* Verses with Mobile-Optimized Layout */}
                  <div className="space-y-6">
                    {verses.map((verse) => {
                      const verseId = generateVerseId(verse);
                      const isBookmarked = bookmarks.has(verseId);
                      const isFavorited = favorites.has(verseId);
                      const highlightColor = highlights.get(verseId);
                      
                      return (
                        <div
                          key={verse.id}
                          data-verse-number={verse.verse}
                          className={cn(
                            "group relative rounded-xl transition-all duration-200",
                            highlightColor ? getHighlightClasses(highlightColor) : 'hover:bg-gray-50',
                            isMobile ? 'p-3 mx-0' : 'p-4',
                            'overflow-visible'
                          )}
                        >
                          {/* Verse Content - Mobile-Optimized */}
                          <div className="flex items-start gap-4">
                            {/* Verse Number - Enhanced for Mobile */}
                            <div className="flex-shrink-0">
                              <span className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold shadow-sm ${
                                isMobile ? 'w-8 h-8 text-xs' : 'w-12 h-12 text-base'
                              }`}>
                                {verse.verse}
                              </span>
                            </div>
                            
                            {/* Verse Text - Mobile-Optimized Typography with Search Highlighting */}
                            <div className="flex-1 min-w-0">
                              <p 
                                className={`text-gray-800 leading-relaxed font-normal ${
                                  isMobile 
                                    ? 'text-base leading-7' // Optimized mobile text size
                                    : 'text-xl leading-9'
                                }`}
                                dangerouslySetInnerHTML={{ 
                                  __html: searchQuery.trim() 
                                    ? highlightVerseText(verse, searchQuery) 
                                    : verse.text 
                                }}
                              />
                            </div>
                          </div>

                          {/* Action Buttons - Icons Only - Always visible and scrollable on mobile */}
                          <div className={`flex items-center justify-end gap-2 mt-4 overflow-x-auto overflow-y-visible relative ${
                            isMobile ? 'opacity-100 -mx-2 px-2' : 'opacity-0 group-hover:opacity-100'
                          } transition-opacity ${isMobile ? 'pb-2' : ''}`} style={{ overflow: 'visible' }}>
                            
                            {/* AI Chat Icon - Sparkle (✦) */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedVerseForAI(verse);
                                      setAiChatOpen(true);
                                    }}
                                    className={`touch-optimized flex-shrink-0 p-0 ${
                                      isMobile ? 'min-h-[44px] min-w-[44px]' : 'h-9 w-9'
                                    } hover:bg-orange-50`}
                                    title="Ask AI about this verse"
                                  >
                                    <div className={`rounded-full bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 flex items-center justify-center text-white font-bold transition-all ${
                                      isMobile ? 'w-6 h-6 text-base' : 'w-5 h-5 text-sm'
                                    }`}>
                                      ✦
                                    </div>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Ask AI about this verse</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            {/* Favorite Icon */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(verse)}
                              className={`touch-optimized flex-shrink-0 ${
                                isMobile ? 'min-h-[44px] min-w-[44px]' : 'h-9 w-9'
                              } p-0 ${
                                isFavorited 
                                  ? 'text-red-500 hover:text-red-600' 
                                  : 'text-gray-400 hover:text-red-500'
                              }`}
                              title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                            >
                              <Heart className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} ${
                                isFavorited ? 'fill-current' : ''
                              }`} />
                            </Button>

                            {/* Bookmark Icon */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addToBookmarks(verse)}
                              className={`touch-optimized flex-shrink-0 ${
                                isMobile ? 'min-h-[44px] min-w-[44px]' : 'h-9 w-9'
                              } p-0 ${
                                isBookmarked 
                                  ? 'text-blue-500 hover:text-blue-600' 
                                  : 'text-gray-400 hover:text-blue-500'
                              }`}
                              title={isBookmarked ? "Remove from Bookmarks" : "Add to Bookmarks"}
                            >
                              <Bookmark className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} ${
                                isBookmarked ? 'fill-current' : ''
                              }`} />
                            </Button>

                            {/* Highlight Icon */}
                            <div className="relative" data-highlight-container>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedVerseForHighlight(selectedVerseForHighlight === verseId ? null : verseId);
                                      }}
                                      className={cn(
                                        "touch-optimized flex-shrink-0 p-0 relative",
                                        isMobile ? 'min-h-[44px] min-w-[44px]' : 'h-9 w-9',
                                        highlightColor 
                                          ? highlightColor === 'yellow' ? 'text-yellow-500 hover:text-yellow-600' :
                                            highlightColor === 'green' ? 'text-green-500 hover:text-green-600' :
                                            highlightColor === 'blue' ? 'text-blue-500 hover:text-blue-600' :
                                            highlightColor === 'purple' ? 'text-purple-500 hover:text-purple-600' :
                                            highlightColor === 'red' ? 'text-red-500 hover:text-red-600' :
                                            highlightColor === 'pink' ? 'text-pink-500 hover:text-pink-600' :
                                            highlightColor === 'orange' ? 'text-orange-500 hover:text-orange-600' :
                                            'text-gray-400 hover:text-yellow-500'
                                          : 'text-gray-400 hover:text-yellow-500'
                                      )}
                                      title="Highlight verse"
                                    >
                                      <Highlighter className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} ${
                                        highlightColor ? 'fill-current' : ''
                                      }`} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{highlightColor ? `Change ${highlightColor} highlight` : 'Highlight verse'}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              {/* Highlight Color Picker Popup - Small Horizontal Layout */}
                              <AnimatePresence>
                                {selectedVerseForHighlight === verseId && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute bottom-full right-0 mb-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200 z-[100]"
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex flex-nowrap gap-1.5 items-center">
                                      {/* Unhighlight Button */}
                                      {highlightColor && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            highlightVerse(verse, '');
                                            setSelectedVerseForHighlight(null);
                                          }}
                                          onMouseDown={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                          }}
                                          type="button"
                                          className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center flex-shrink-0"
                                          title="Remove highlight"
                                          aria-label="Remove highlight"
                                        >
                                          <X className="h-3 w-3 text-gray-600" />
                                        </button>
                                      )}
                                      {/* Color Options */}
                                      {HIGHLIGHT_COLORS.map(color => {
                                        const colorMap: Record<string, { bg: string; border: string }> = {
                                          yellow: { bg: '#facc15', border: '#ca8a04' },
                                          green: { bg: '#4ade80', border: '#16a34a' },
                                          blue: { bg: '#60a5fa', border: '#2563eb' },
                                          purple: { bg: '#a78bfa', border: '#7c3aed' },
                                          red: { bg: '#f87171', border: '#dc2626' },
                                          pink: { bg: '#f472b6', border: '#db2777' },
                                          orange: { bg: '#fb923c', border: '#ea580c' }
                                        };
                                        const style = colorMap[color.id] || { bg: '#facc15', border: '#ca8a04' };
                                        
                                        return (
                                          <button
                                            key={color.id}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                              highlightVerse(verse, color.id);
                                              setSelectedVerseForHighlight(null);
                                            }}
                                            onMouseDown={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                            }}
                                            type="button"
                                            className={cn(
                                              "w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform flex items-center justify-center flex-shrink-0",
                                              color.id === highlightColor 
                                                ? 'ring-1 ring-offset-1 ring-orange-300' 
                                                : 'hover:shadow-sm'
                                            )}
                                            style={{
                                              backgroundColor: style.bg,
                                              borderColor: color.id === highlightColor ? style.border : '#e5e7eb'
                                            }}
                                            title={color.name}
                                            aria-label={`Highlight with ${color.name}`}
                                          >
                                            {color.id === highlightColor && (
                                              <span className="text-xs font-bold text-white drop-shadow-sm">✓</span>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Copy Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyVerse(verse);
                              }}
                              className={`touch-optimized flex-shrink-0 p-0 ${
                                isMobile ? 'min-h-[44px] min-w-[44px]' : 'h-9 w-9'
                              } text-gray-400 hover:text-gray-600`}
                              title="Copy verse"
                            >
                              <Copy className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
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


      </div>

      {/* AI Chat Side Panel - Side by side, no backdrop */}
      <AnimatePresence>
        {aiChatOpen && selectedVerseForAI && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-gray-200 shadow-lg z-40 flex flex-col"
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
                sidebarMode={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chapter Navigation - Bottom Right */}
      {selectedBook && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateChapter('prev')}
            disabled={selectedChapter <= 1}
            className="h-12 w-12 rounded-full bg-white shadow-lg hover:shadow-xl border-gray-300 hover:border-orange-400 transition-all flex items-center justify-center"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </Button>
          <Button
            className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            size="lg"
          >
            <span className="text-sm font-bold">Ch {selectedChapter}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateChapter('next')}
            disabled={selectedChapter >= (selectedBook.chapters || 1)}
            className="h-12 w-12 rounded-full bg-white shadow-lg hover:shadow-xl border-gray-300 hover:border-orange-400 transition-all flex items-center justify-center"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </Button>
        </div>
      )}
    </Layout>
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
  toast,
  getBookDisplayName
}: any) {
  // Helper function to get highlight color classes
  const getHighlightClasses = (color: string | undefined) => {
    if (!color) return 'hover:bg-gray-50';
    const colorMap: Record<string, string> = {
      'yellow': 'bg-yellow-100 border-l-4 border-yellow-400',
      'green': 'bg-green-100 border-l-4 border-green-400',
      'blue': 'bg-blue-100 border-l-4 border-blue-400',
      'purple': 'bg-purple-100 border-l-4 border-purple-400',
      'red': 'bg-red-100 border-l-4 border-red-400',
      'pink': 'bg-pink-100 border-l-4 border-pink-400',
      'orange': 'bg-orange-100 border-l-4 border-orange-400',
    };
    const baseClass = colorMap[color] || 'hover:bg-gray-50';
    return `${baseClass} max-w-full overflow-x-hidden`;
  };

  return (
    <div
      className={`group p-4 md:p-6 rounded-lg transition-all duration-300 hover:shadow-sm ${
        highlightColor 
          ? getHighlightClasses(highlightColor)
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
          {/* Favorite */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(verse)}
            className="h-6 w-6 md:h-8 md:w-8 p-0"
          >
            <Heart className={`h-3 w-3 md:h-4 w-4 ${
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

        </div>
      </div>
    </div>
  );
}