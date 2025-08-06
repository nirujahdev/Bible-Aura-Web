import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ModernLayout } from '@/components/ModernLayout';
import { 
  BookOpen, ChevronDown, ChevronUp, Heart, Star, 
  MessageCircle, Bot, X, Send, Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getChapterVerses, saveBookmark, type BibleVerse } from '@/lib/local-bible';

interface BibleBook {
  name: string;
  chapters: number;
  testament: 'Old' | 'New';
}

interface ReadingPlan {
  id: string;
  name: string;
  duration_days: number;
  current_day: number;
  progress: number;
  daily_verse: string;
  is_active: boolean;
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
  const [expandedTestament, setExpandedTestament] = useState<'Old' | 'New'>('Old');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string}>>([]);
  const [activeChatMode, setActiveChatMode] = useState('theological');
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  // Plans state
  const [readingPlans, setReadingPlans] = useState<ReadingPlan[]>([]);
  const [activePlan, setActivePlan] = useState<ReadingPlan | null>(null);

  useEffect(() => {
    loadVerses();
    loadReadingPlans();
    // Initialize chat with welcome message
    setChatMessages([{
      id: '1',
      role: 'assistant',
      content: `✦ Welcome! I'm here to help you explore **${selectedBook} ${selectedChapter}**: "${verses[0]?.text.slice(0, 100)}..."\n\nChoose a mode below and ask me anything about this verse!`
    }]);
  }, [selectedBook, selectedChapter]);

  const loadVerses = async () => {
    setLoading(true);
    try {
      const fetchedVerses = await getChapterVerses(selectedBook, selectedChapter, 'english', translation as any);
      setVerses(fetchedVerses || []);
    } catch (error) {
      console.error('Error loading verses:', error);
      toast({
        title: "Error",
        description: "Failed to load Bible verses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReadingPlans = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('reading_progress')
        .select(`
          *,
          reading_plans (*)
        `)
        .eq('user_id', user.id)
        .is('completed_at', null);

      if (error) throw error;

      const plans: ReadingPlan[] = (data || []).map(plan => ({
        id: plan.id,
        name: plan.reading_plans?.name || 'Bible Reading Plan',
        duration_days: plan.reading_plans?.duration_days || 365,
        current_day: plan.current_day || 1,
        progress: ((plan.completed_days?.length || 0) / (plan.reading_plans?.duration_days || 365)) * 100,
        daily_verse: `${selectedBook} ${selectedChapter}:1`,
        is_active: true
      }));

      setReadingPlans(plans);
      if (plans.length > 0) {
        setActivePlan(plans[0]);
      }
    } catch (error) {
      console.error('Error loading reading plans:', error);
    }
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

    const success = await saveBookmark(verse, user.id);
    if (success) {
      toast({
        title: "Added to favorites",
        description: `${verse.book_name} ${verse.chapter}:${verse.verse} saved`
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save to favorites",
        variant: "destructive"
      });
    }
  };

  const addToAI = (verse: BibleVerse) => {
    const verseText = `${verse.book_name} ${verse.chapter}:${verse.verse} - "${verse.text}"`;
    setChatInput(`Tell me about ${verseText}`);
    setSelectedVerse(verse.verse);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: chatInput
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `Thank you for your question about ${selectedBook} ${selectedChapter}. This verse speaks to the heart of Biblical teaching and offers profound insights for modern believers. The theological significance here relates to God's covenant with His people.`
      };
      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const markPlanAsRead = async () => {
    if (!activePlan || !user) return;

    try {
      const { error } = await supabase
        .from('reading_progress')
        .update({
          current_day: activePlan.current_day + 1,
          completed_days: [...(readingPlans[0] as any)?.completed_days || [], activePlan.current_day],
          last_read_at: new Date().toISOString()
        })
        .eq('id', activePlan.id);

      if (error) throw error;

      setActivePlan(prev => prev ? {
        ...prev,
        current_day: prev.current_day + 1,
        progress: ((prev.current_day + 1) / prev.duration_days) * 100
      } : null);

      toast({
        title: "Progress updated",
        description: "Day marked as read!"
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const quitPlan = async () => {
    if (!activePlan) return;

    try {
      const { error } = await supabase
        .from('reading_progress')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', activePlan.id);

      if (error) throw error;

      setActivePlan(null);
      setReadingPlans([]);
      
      toast({
        title: "Plan ended",
        description: "You can start a new plan anytime"
      });
    } catch (error) {
      console.error('Error quitting plan:', error);
    }
  };

  return (
    <ModernLayout>
      <div className="flex h-screen bg-gray-50">
        
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          
          {/* Chapters Section */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Chapters - {selectedBook}</h3>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: BIBLE_BOOKS.find(b => b.name === selectedBook)?.chapters || 27 }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={selectedChapter === i + 1 ? "default" : "outline"}
                  size="sm"
                  className={`h-8 text-xs ${selectedChapter === i + 1 ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                  onClick={() => setSelectedChapter(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          </div>

          {/* Language & Translation */}
          <div className="p-4 border-b border-gray-200 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">🌐 Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Tamil">Tamil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Translation</label>
              <Select value={translation} onValueChange={setTranslation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KJV">KJV - King James Version</SelectItem>
                  <SelectItem value="NIV">NIV - New International Version</SelectItem>
                  <SelectItem value="ESV">ESV - English Standard Version</SelectItem>
                  <SelectItem value="NLT">NLT - New Living Translation</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">✓ Public Domain - Free to use</p>
            </div>
          </div>

          {/* Books Section */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">Books</h3>
              
              {/* Old Testament */}
              <div className="mb-4">
                <Button
                  variant="ghost"
                  className="w-full justify-between p-2 h-auto"
                  onClick={() => setExpandedTestament(expandedTestament === 'Old' ? 'New' : 'Old')}
                >
                  <span className="font-medium">📜 Old Testament</span>
                  <span className="text-sm text-gray-500">39</span>
                  {expandedTestament === 'Old' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                
                {expandedTestament === 'Old' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {BIBLE_BOOKS.filter(book => book.testament === 'Old').map(book => (
                      <div
                        key={book.name}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                          selectedBook === book.name ? 'bg-orange-100 text-orange-800' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setSelectedBook(book.name);
                          setSelectedChapter(1);
                        }}
                      >
                        <span className="text-sm">{book.name}</span>
                        <span className="text-xs text-gray-500">{book.chapters}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* New Testament */}
              <div>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-2 h-auto"
                  onClick={() => setExpandedTestament(expandedTestament === 'New' ? 'Old' : 'New')}
                >
                  <span className="font-medium">✝️ New Testament</span>
                  <span className="text-sm text-gray-500">27</span>
                  {expandedTestament === 'New' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                
                {expandedTestament === 'New' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {BIBLE_BOOKS.filter(book => book.testament === 'New').map(book => (
                      <div
                        key={book.name}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                          selectedBook === book.name ? 'bg-orange-100 text-orange-800' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setSelectedBook(book.name);
                          setSelectedChapter(1);
                        }}
                      >
                        <span className="text-sm">{book.name}</span>
                        <span className="text-xs text-gray-500">{book.chapters}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Plans Section */}
          {activePlan && (
            <div className="p-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">📖 Current Plan</h3>
              <Card>
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm mb-2">{activePlan.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">Day {activePlan.current_day} of {activePlan.duration_days}</p>
                  <Progress value={activePlan.progress} className="h-2 mb-2" />
                  <p className="text-xs text-gray-600 mb-3">Daily verse: {activePlan.daily_verse}</p>
                  <div className="flex gap-1">
                    <Button size="sm" onClick={markPlanAsRead} className="flex-1 bg-green-500 hover:bg-green-600">
                      <Check className="h-3 w-3 mr-1" />
                      Read
                    </Button>
                    <Button size="sm" variant="outline" onClick={quitPlan} className="flex-1">
                      Quit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          
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
              <div className="max-w-4xl space-y-6">
                {verses.map((verse) => (
                  <div key={verse.verse} className="flex gap-4 group">
                    
                    {/* Verse Number */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {verse.verse}
                      </div>
                    </div>

                    {/* Verse Content */}
                    <div className="flex-1">
                      <p className="text-gray-800 leading-relaxed text-lg">{verse.text}</p>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addToAI(verse)}
                          className="text-orange-500 border-orange-500 hover:bg-orange-50"
                        >
                          <Bot className="h-3 w-3 mr-1 text-orange-500" />
                          Add to AI
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addToFavorites(verse)}
                          className="text-red-500 border-red-500 hover:bg-red-50"
                        >
                          <Heart className="h-3 w-3 mr-1" />
                          Favorite
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addToFavorites(verse)}
                          className="text-blue-500 border-blue-500 hover:bg-blue-50"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Bookmark
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - AI Chat */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-orange-500" />
              <h3 className="font-medium">Bible AI Chat</h3>
            </div>
            <span className="text-sm text-gray-500">{selectedBook} {selectedChapter}</span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((message) => (
              <div key={message.id} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <Bot className="h-6 w-6 text-orange-500 flex-shrink-0 mt-1" />
                )}
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">22:48</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Mode Buttons */}
          <div className="p-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {CHAT_MODES.map((mode) => (
                <Button
                  key={mode.id}
                  size="sm"
                  variant={activeChatMode === mode.id ? "default" : "outline"}
                  className={activeChatMode === mode.id ? mode.color : ''}
                  onClick={() => setActiveChatMode(mode.id)}
                >
                  {mode.name}
                </Button>
              ))}
            </div>

            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder={`Ask about ${selectedBook} ${selectedChapter} in theological context...`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <Button size="sm" onClick={sendChatMessage} className="bg-orange-500 hover:bg-orange-600">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Press Enter to send • Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
} 