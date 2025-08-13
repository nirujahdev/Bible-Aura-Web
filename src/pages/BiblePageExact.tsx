import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ModernLayout } from '@/components/ModernLayout';
import { 
  BookOpen, ChevronDown, ChevronUp, Heart, Star, 
  MessageCircle, Bot, X, Send, Check, Bookmark, Search, Calendar, Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getChapterVerses, type BibleVerse, type TranslationCode } from '@/lib/local-bible';
import { BookmarksService } from '@/lib/bookmarks-favorites-service';
import { Input } from '@/components/ui/input';

interface BibleBook {
  name: string;
  chapters: number;
  testament: 'Old' | 'New';
}

interface SimpleReadingPlan {
  id: string;
  name: string;
  description: string;
  totalDays: number;
  currentDay: number;
  progress: number;
  isActive: boolean;
}

const BIBLE_BOOKS: BibleBook[] = [
  // Old Testament
  { name: 'Genesis', chapters: 50, testament: 'Old' },
  { name: 'Exodus', chapters: 40, testament: 'Old' },
  { name: 'Leviticus', chapters: 27, testament: 'Old' },
  { name: 'Numbers', chapters: 36, testament: 'Old' },
  { name: 'Deuteronomy', chapters: 34, testament: 'Old' },
  { name: 'Joshua', chapters: 24, testament: 'Old' },
  { name: 'Judges', chapters: 21, testament: 'Old' },
  { name: 'Ruth', chapters: 4, testament: 'Old' },
  { name: '1 Samuel', chapters: 31, testament: 'Old' },
  { name: '2 Samuel', chapters: 24, testament: 'Old' },
  { name: '1 Kings', chapters: 22, testament: 'Old' },
  { name: '2 Kings', chapters: 25, testament: 'Old' },
  { name: '1 Chronicles', chapters: 29, testament: 'Old' },
  { name: '2 Chronicles', chapters: 36, testament: 'Old' },
  { name: 'Ezra', chapters: 10, testament: 'Old' },
  { name: 'Nehemiah', chapters: 13, testament: 'Old' },
  { name: 'Esther', chapters: 10, testament: 'Old' },
  { name: 'Job', chapters: 42, testament: 'Old' },
  { name: 'Psalms', chapters: 150, testament: 'Old' },
  { name: 'Proverbs', chapters: 31, testament: 'Old' },
  { name: 'Ecclesiastes', chapters: 12, testament: 'Old' },
  { name: 'Song of Songs', chapters: 8, testament: 'Old' },
  { name: 'Isaiah', chapters: 66, testament: 'Old' },
  { name: 'Jeremiah', chapters: 52, testament: 'Old' },
  { name: 'Lamentations', chapters: 5, testament: 'Old' },
  { name: 'Ezekiel', chapters: 48, testament: 'Old' },
  { name: 'Daniel', chapters: 12, testament: 'Old' },
  { name: 'Hosea', chapters: 14, testament: 'Old' },
  { name: 'Joel', chapters: 3, testament: 'Old' },
  { name: 'Amos', chapters: 9, testament: 'Old' },
  { name: 'Obadiah', chapters: 1, testament: 'Old' },
  { name: 'Jonah', chapters: 4, testament: 'Old' },
  { name: 'Micah', chapters: 7, testament: 'Old' },
  { name: 'Nahum', chapters: 3, testament: 'Old' },
  { name: 'Habakkuk', chapters: 3, testament: 'Old' },
  { name: 'Zephaniah', chapters: 3, testament: 'Old' },
  { name: 'Haggai', chapters: 2, testament: 'Old' },
  { name: 'Zechariah', chapters: 14, testament: 'Old' },
  { name: 'Malachi', chapters: 4, testament: 'Old' },
  // New Testament
  { name: 'Matthew', chapters: 28, testament: 'New' },
  { name: 'Mark', chapters: 16, testament: 'New' },
  { name: 'Luke', chapters: 24, testament: 'New' },
  { name: 'John', chapters: 21, testament: 'New' },
  { name: 'Acts', chapters: 28, testament: 'New' },
  { name: 'Romans', chapters: 16, testament: 'New' },
  { name: '1 Corinthians', chapters: 16, testament: 'New' },
  { name: '2 Corinthians', chapters: 13, testament: 'New' },
  { name: 'Galatians', chapters: 6, testament: 'New' },
  { name: 'Ephesians', chapters: 6, testament: 'New' },
  { name: 'Philippians', chapters: 4, testament: 'New' },
  { name: 'Colossians', chapters: 4, testament: 'New' },
  { name: '1 Thessalonians', chapters: 5, testament: 'New' },
  { name: '2 Thessalonians', chapters: 3, testament: 'New' },
  { name: '1 Timothy', chapters: 6, testament: 'New' },
  { name: '2 Timothy', chapters: 4, testament: 'New' },
  { name: 'Titus', chapters: 3, testament: 'New' },
  { name: 'Philemon', chapters: 1, testament: 'New' },
  { name: 'Hebrews', chapters: 13, testament: 'New' },
  { name: 'James', chapters: 5, testament: 'New' },
  { name: '1 Peter', chapters: 5, testament: 'New' },
  { name: '2 Peter', chapters: 3, testament: 'New' },
  { name: '1 John', chapters: 5, testament: 'New' },
  { name: '2 John', chapters: 1, testament: 'New' },
  { name: '3 John', chapters: 1, testament: 'New' },
  { name: 'Jude', chapters: 1, testament: 'New' },
  { name: 'Revelation', chapters: 22, testament: 'New' },
];

const CHAT_MODES = [
  { id: 'theological', name: 'Theological', color: 'bg-orange-500' },
  { id: 'historical', name: 'Historical', color: 'bg-blue-500' },
  { id: 'cross-reference', name: 'Cross Reference', color: 'bg-purple-500' },
  { id: 'insights', name: 'Insights', color: 'bg-green-500' },
];

export default function BiblePageExact() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Core state
  const [selectedBook, setSelectedBook] = useState<string>('Leviticus');
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [language, setLanguage] = useState<string>('English');
  const [translation, setTranslation] = useState<string>('KJV');
  const [loading, setLoading] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState('read');
  const [expandedTestament, setExpandedTestament] = useState<'Old' | 'New'>('Old');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string}>>([]);
  const [activeChatMode, setActiveChatMode] = useState('theological');
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Simple plans state
  const [readingPlans, setReadingPlans] = useState<SimpleReadingPlan[]>([]);

  useEffect(() => {
    loadVerses();
  }, [selectedBook, selectedChapter]);

  const loadVerses = async () => {
    setLoading(true);
    try {
      const chapterVerses = await getChapterVerses(
        selectedBook, 
        selectedChapter, 
        language.toLowerCase() as 'english' | 'tamil', 
        translation as TranslationCode
      );
      setVerses(chapterVerses);
    } catch (error) {
      console.error('Error loading verses:', error);
      toast({
        title: "Error",
        description: "Failed to load verses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  const searchVerses = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const currentVerses = verses.filter(verse => 
        verse.text.toLowerCase().includes(query.toLowerCase())
      );

      if (currentVerses.length === 0) {
        const allBookVerses = await loadAllBookVerses(selectedBook);
        const bookResults = allBookVerses.filter(verse => 
          verse.text.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(bookResults.slice(0, 20));
      } else {
        setSearchResults(currentVerses);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search verses",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const loadAllBookVerses = async (bookName: string): Promise<BibleVerse[]> => {
    const allVerses: BibleVerse[] = [];
    const book = BIBLE_BOOKS.find(b => b.name === bookName);
    if (!book) return [];

    try {
      for (let chapter = 1; chapter <= book.chapters; chapter++) {
        const chapterVerses = await getChapterVerses(
          bookName, 
          chapter, 
          language.toLowerCase() as 'english' | 'tamil', 
          translation as TranslationCode
        );
        allVerses.push(...chapterVerses);
      }
    } catch (error) {
      console.error('Error loading book verses:', error);
    }
    
    return allVerses;
  };

  const navigateToSearchResult = (verse: BibleVerse) => {
    setSelectedChapter(verse.chapter);
    setActiveTab('read');
    setTimeout(() => {
      const verseElement = document.getElementById(`verse-${verse.verse}`);
      if (verseElement) {
        verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);
  };

  const addToFavorites = async (verse: BibleVerse) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive"
      });
      return;
    }

    try {
      await BookmarksService.addToBookmarks(user.id, verse, 'study', 'yellow', 'KJV');
      toast({
        title: "Added to favorites",
        description: `${verse.book_name} ${verse.chapter}:${verse.verse} saved`
      });
    } catch (error) {
      console.error('Error saving to favorites:', error);
      toast({
        title: "Error",
        description: "Failed to save to favorites",
        variant: "destructive"
      });
    }
  };

  const addToAI = (verse: BibleVerse) => {
    setAiChatOpen(true);
    setChatMessages([{
      id: '1',
      role: 'user',
      content: `Please help me understand this verse: ${verse.book_name} ${verse.chapter}:${verse.verse} - "${verse.text}"`
    }]);
  };

  return (
    <ModernLayout>
      <div className="flex h-screen bg-gray-50">
        
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          
          {/* Read/Search/Plans Menu */}
          <div className="p-4 border-b border-gray-200">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="read" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  <BookOpen className="h-4 w-4" />
                  Read
                </TabsTrigger>
                <TabsTrigger value="search" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  <Search className="h-4 w-4" />
                  Search
                </TabsTrigger>
                <TabsTrigger value="plans" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  <Calendar className="h-4 w-4" />
                  Plans
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Conditional Sidebar Content */}
          {(activeTab === 'read' || activeTab === 'search') && (
            <>
              {/* Chapters Section */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Chapters - {selectedBook}</h3>
                <div className="grid grid-cols-8 gap-2">
                  {Array.from({ length: BIBLE_BOOKS.find(b => b.name === selectedBook)?.chapters || 27 }, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={selectedChapter === i + 1 ? "default" : "outline"}
                      size="sm"
                      className={`h-8 w-8 text-xs p-0 ${selectedChapter === i + 1 ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                      onClick={() => setSelectedChapter(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Books Navigation */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Books</h3>
                  <div className="space-y-1">
                    {BIBLE_BOOKS.map((book) => (
                      <Button
                        key={book.name}
                        variant={selectedBook === book.name ? "default" : "ghost"}
                        className={`w-full justify-start text-left ${selectedBook === book.name ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                        onClick={() => {
                          setSelectedBook(book.name);
                          setSelectedChapter(1);
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{book.name}</span>
                          <span className="text-xs opacity-70">{book.chapters}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Plans Tab Content - Shown in Sidebar */}
          {activeTab === 'plans' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Plans Header */}
              <div className="bg-orange-500 text-white p-4">
                <h2 className="text-lg font-bold">Reading Plans</h2>
                <p className="text-orange-100 text-sm">Track your Bible study progress</p>
              </div>

              {/* Reading Plans Interface */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Your Reading Plans</h3>
                  <Button 
                    size="sm"
                    onClick={() => {
                      const newPlan: SimpleReadingPlan = {
                        id: Date.now().toString(),
                        name: `${selectedBook} Study Plan`,
                        description: `Complete reading plan for ${selectedBook}`,
                        totalDays: BIBLE_BOOKS.find(b => b.name === selectedBook)?.chapters || 1,
                        currentDay: 1,
                        progress: 0,
                        isActive: true
                      };
                      setReadingPlans([newPlan, ...readingPlans]);
                      toast({
                        title: "Plan Created",
                        description: `New reading plan for ${selectedBook} created!`
                      });
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-xs px-2 py-1 h-auto"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Create Plan
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {readingPlans.length > 0 ? (
                    <div className="space-y-3">
                      {readingPlans.map((plan) => (
                        <div key={plan.id} className="border rounded-lg p-3 bg-white shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 text-sm">{plan.name}</h4>
                            {plan.isActive && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{plan.description}</p>
                          <div className="text-xs text-gray-500 mb-2">
                            Day {plan.currentDay} of {plan.totalDays}
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                            <div 
                              className="bg-orange-500 h-1.5 rounded-full transition-all duration-300" 
                              style={{ width: `${(plan.progress / plan.totalDays) * 100}%` }}
                            ></div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <Button
                              size="sm"
                              onClick={() => {
                                const updatedPlan = {
                                  ...plan,
                                  currentDay: Math.min(plan.currentDay + 1, plan.totalDays),
                                  progress: plan.progress + 1
                                };
                                setReadingPlans(plans => 
                                  plans.map(p => p.id === plan.id ? updatedPlan : p)
                                );
                                
                                toast({
                                  title: "Progress Updated",
                                  description: `Marked day ${plan.currentDay} as complete!`
                                });
                              }}
                              disabled={plan.progress >= plan.totalDays}
                              className="bg-orange-500 hover:bg-orange-600 text-xs h-auto py-1"
                            >
                              Mark as Read
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedChapter(plan.currentDay);
                                setActiveTab('read');
                              }}
                              className="text-xs h-auto py-1"
                            >
                              Read Today's Chapter
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 mt-4">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm font-medium mb-1">No Reading Plans Yet</p>
                      <p className="text-xs mb-3">Create a reading plan to track your progress</p>
                      <Button 
                        size="sm"
                        onClick={() => {
                          const newPlan: SimpleReadingPlan = {
                            id: Date.now().toString(),
                            name: `${selectedBook} Study Plan`,
                            description: `Complete reading plan for ${selectedBook}`,
                            totalDays: BIBLE_BOOKS.find(b => b.name === selectedBook)?.chapters || 1,
                            currentDay: 1,
                            progress: 0,
                            isActive: true
                          };
                          setReadingPlans([newPlan]);
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-xs px-2 py-1 h-auto"
                      >
                        Create Your First Plan
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area - Changes based on active tab */}
        <div className="flex-1 flex flex-col">
          
          {/* READ TAB CONTENT */}
          {activeTab === 'read' && (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="bg-orange-500 text-white p-6">
                <h1 className="text-2xl font-bold">{selectedBook} {selectedChapter}</h1>
                <p className="text-orange-100">King James Version</p>
              </div>

              {/* Verses */}
              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading verses...</div>
                  </div>
                ) : (
                  <div className="max-w-4xl space-y-8">
                    {verses.map((verse) => (
                      <div key={verse.verse} id={`verse-${verse.verse}`} className="flex gap-4 group relative py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                        
                        {/* Verse Number */}
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {verse.verse}
                          </div>
                        </div>

                        {/* Verse Content */}
                        <div className="flex-1">
                          <p className="text-gray-800 leading-relaxed text-lg mb-2">{verse.text}</p>
                          
                          {/* Small Action Icons - Only show on hover */}
                          <div className="absolute right-4 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-sm">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => addToAI(verse)}
                              className="w-8 h-8 p-0 text-orange-500 hover:bg-orange-50"
                              title="Add to AI Chat"
                            >
                              <span className="text-lg">✦</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => addToFavorites(verse)}
                              className="w-8 h-8 p-0 text-red-500 hover:bg-red-50"
                              title="Add to Favorites"
                            >
                              <Heart className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => addToFavorites(verse)}
                              className="w-8 h-8 p-0 text-blue-500 hover:bg-blue-50"
                              title="Bookmark"
                            >
                              <Bookmark className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SEARCH TAB CONTENT */}
          {activeTab === 'search' && (
            <div className="h-full flex flex-col">
              {/* Search Header */}
              <div className="bg-orange-500 text-white p-6">
                <h1 className="text-2xl font-bold">Search Verses</h1>
                <p className="text-orange-100">Find verses in {selectedBook}</p>
              </div>

              {/* Search Interface */}
              <div className="flex-1 p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search verses in current book..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchVerses(e.target.value);
                      }}
                      className="pl-10"
                    />
                  </div>
                  {isSearching && (
                    <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  {searchQuery && `Searching in ${selectedBook} for "${searchQuery}"`}
                  {searchResults.length > 0 && ` - ${searchResults.length} results found`}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <div className="space-y-4">
                      {searchResults.map((verse, index) => (
                        <div 
                          key={`${verse.chapter}-${verse.verse}`} 
                          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => navigateToSearchResult(verse)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-orange-600">
                              {verse.book_name} {verse.chapter}:{verse.verse}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToFavorites(verse);
                              }}
                              className="w-6 h-6 p-0 text-blue-500 hover:bg-blue-50"
                              title="Bookmark"
                            >
                              <Bookmark className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-gray-800 leading-relaxed">
                            {verse.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    <div className="text-center text-gray-500 mt-8">
                      No verses found for "{searchQuery}" in {selectedBook}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 mt-8">
                      Enter a search term to find verses
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar - AI Chat (Only show when open) */}
        {aiChatOpen && (
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">AI Assistant</h3>
                  <p className="text-xs text-gray-500">Ask questions about this verse</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setAiChatOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Mode Selector */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex gap-2 flex-wrap">
                {CHAT_MODES.map(mode => (
                  <Button
                    key={mode.id}
                    size="sm"
                    variant={activeChatMode === mode.id ? "default" : "outline"}
                    onClick={() => setActiveChatMode(mode.id)}
                    className={`text-xs ${activeChatMode === mode.id ? mode.color + ' text-white' : ''}`}
                  >
                    {mode.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map(message => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about this verse..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      if (chatInput.trim()) {
                        setChatMessages([...chatMessages, {
                          id: Date.now().toString(),
                          role: 'user',
                          content: chatInput
                        }]);
                        setChatInput('');
                      }
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => {
                    if (chatInput.trim()) {
                      setChatMessages([...chatMessages, {
                        id: Date.now().toString(),
                        role: 'user',
                        content: chatInput
                      }]);
                      setChatInput('');
                    }
                  }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModernLayout>
  );
} 
