import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { searchVerses, getAllBooks, getChapterVerses, BibleVerse, BibleBook } from '@/lib/local-bible';
import { supabase } from '@/integrations/supabase/client';
import { 
  Save, X, Wand2, Palette, Type, Quote, BookOpen, Calendar,
  Heart, Star, Bookmark, Tag, Mic, Volume2, Eye, EyeOff,
  Bold, Italic, List, Heading, RotateCcw, MoreHorizontal,
  Sparkles, RefreshCw, Plus, Minus, Search, Settings
} from 'lucide-react';

interface JournalEntryForm {
  id?: string;
  title: string;
  content: string;
  mood: string | null;
  spiritual_state?: string | null;
  verse_reference?: string | null;
  verse_text?: string | null;
  verse_references?: string[];
  tags?: string[];
  is_private?: boolean;
  entry_date?: string;
  word_count?: number;
  reading_time?: number;
  language?: 'english' | 'tamil' | 'sinhala';
  category?: string;
  metadata?: any;
  is_pinned?: boolean;
  template_used?: string | null;
}

interface WritingStats {
  wordCount: number;
  charCount: number;
  readingTime: number;
  paragraphs: number;
}

interface AIAssistance {
  suggestions: string[];
  verseRecommendations: string[];
  themes: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface BibleVerseResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  language: 'english' | 'tamil' | 'sinhala';
}

interface EnhancedJournalEditorProps {
  initialEntry?: Partial<JournalEntryForm>;
  onSave: (entry: JournalEntryForm) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

// Language translations
const translations = {
  english: {
    title: 'Journal Entry',
    save: 'Save Entry',
    cancel: 'Cancel',
    content: 'Write your thoughts...',
    addVerse: 'Add Bible Verse',
    book: 'Book',
    chapter: 'Chapter',
    verse: 'Verse',
    searchVerse: 'Search Verses',
    insertVerse: 'Insert Verse',
    wordCount: 'Word Count',
    readingTime: 'Reading Time',
    aiInsights: 'AI Insights'
  },
  tamil: {
    title: 'பத்திரிகை பதிவு',
    save: 'பதிவு சேமி',
    cancel: 'ரத்து செய்',
    content: 'உங்கள் எண்ணங்களை எழுதுங்கள்...',
    addVerse: 'வேதபகுதி சேர்',
    book: 'புத்தகம்',
    chapter: 'அத்தியாயம்',
    verse: 'வசனம்',
    searchVerse: 'வசனங்களை தேடு',
    insertVerse: 'வசனம் சேர்',
    wordCount: 'சொல் எண்ணிக்கை',
    readingTime: 'வாசிப்பு நேரம்',
    aiInsights: 'AI நுண்ணறிவு'
  },
  sinhala: {
    title: 'දිනපොත ප්‍රවේශය',
    save: 'ඇතුළත් කිරීම සුරකින්න',
    cancel: 'අවලංගු කරන්න',
    content: 'ඔබේ සිතිවිලි ලියන්න...',
    addVerse: 'බයිබල් පදය එක් කරන්න',
    book: 'පොත',
    chapter: 'පරිච්ඡේදය',
    verse: 'පදය',
    searchVerse: 'පදය සොයන්න',
    insertVerse: 'පදය ඇතුළු කරන්න',
    wordCount: 'වචන ගණන',
    readingTime: 'කියවීමේ කාලය',
    aiInsights: 'AI තීක්ෂණතා'
  }
};

export function EnhancedJournalEditor({
  initialEntry,
  onSave,
  onCancel,
  isEditing = false
}: EnhancedJournalEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Core states
  const [entry, setEntry] = useState<Partial<JournalEntryForm>>({
    title: '',
    content: '',
    mood: null,
    spiritual_state: null,
    verse_references: [],
    tags: [],
    is_private: true,
    entry_date: new Date().toISOString().split('T')[0],
    language: 'english',
    category: 'personal',
    ...initialEntry
  });

  const [saving, setSaving] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'english' | 'tamil' | 'sinhala'>('english');
  
  // Writing stats
  const [stats, setStats] = useState<WritingStats>({
    wordCount: 0,
    charCount: 0,
    readingTime: 0,
    paragraphs: 0
  });

  // Bible verse functionality
  const [showVerseDialog, setShowVerseDialog] = useState(false);
  const [verseSearchQuery, setVerseSearchQuery] = useState('');
  const [verseResults, setVerseResults] = useState<BibleVerse[]>([]);
  const [loadingVerse, setLoadingVerse] = useState(false);
  const [bibleBooks, setBibleBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedVerse, setSelectedVerse] = useState('');

  // AI assistance
  const [aiAssistance, setAiAssistance] = useState<AIAssistance>({
    suggestions: [],
    verseRecommendations: [],
    themes: [],
    sentiment: 'neutral'
  });
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const t = translations[currentLanguage];

  // Load Bible books on mount
  useEffect(() => {
    const loadBibleBooks = async () => {
      try {
        const books = await getAllBooks();
        setBibleBooks(books);
      } catch (error) {
        console.error('Error loading Bible books:', error);
      }
    };
    loadBibleBooks();
  }, []);

  // Calculate writing stats
  useEffect(() => {
    const content = entry.content || '';
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    const readingTimeMinutes = Math.ceil(words.length / 200); // Average reading speed

    setStats({
      wordCount: words.length,
      charCount: content.length,
      readingTime: readingTimeMinutes,
      paragraphs: content.split('\n\n').filter(p => p.trim().length > 0).length
    });
  }, [entry.content]);

  // Bible verse search by keyword
  const searchBibleVersesByKeyword = async () => {
    if (!verseSearchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a keyword to search for verses",
        variant: "destructive",
      });
      return;
    }

    setLoadingVerse(true);
    try {
      const results = await searchVerses(
        verseSearchQuery,
        currentLanguage === 'tamil' ? 'tamil' : 'english',
        selectedBook || undefined
      );
      
      // Limit results to first 20 for performance
      setVerseResults(results.slice(0, 20));
      
      if (results.length === 0) {
        toast({
          title: "No verses found",
          description: "Try different keywords or check spelling. If Bible files are not available, this feature may not work offline.",
        });
      } else {
        toast({
          title: "Search completed",
          description: `Found ${results.length} verse${results.length === 1 ? '' : 's'}`,
        });
      }
    } catch (error) {
      console.error('Error searching verses:', error);
      toast({
        title: "Search failed",
        description: "Bible files may not be available. You can still write your journal entry and add verse references manually.",
        variant: "destructive",
      });
      // Don't block the user from continuing - they can still write without Bible verses
    } finally {
      setLoadingVerse(false);
    }
  };

  // Search specific verse by reference
  const searchSpecificVerse = async () => {
    if (!selectedBook || !selectedChapter || !selectedVerse) {
      toast({
        title: "Complete reference required",
        description: "Please select book, chapter, and verse",
        variant: "destructive",
      });
      return;
    }

    setLoadingVerse(true);
    try {
      const verses = await getChapterVerses(
        selectedBook,
        parseInt(selectedChapter),
        currentLanguage === 'tamil' ? 'tamil' : 'english'
      );
      
      const specificVerse = verses.find(v => v.verse === parseInt(selectedVerse));
      if (specificVerse) {
        setVerseResults([specificVerse]);
        toast({
          title: "Verse found",
          description: `${selectedBook} ${selectedChapter}:${selectedVerse}`,
        });
      } else {
        toast({
          title: "Verse not found",
          description: "Please check the verse reference or try a different chapter/verse number",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading verse:', error);
      toast({
        title: "Error loading verse",
        description: "Bible files may not be available. You can manually type the verse reference in your journal.",
        variant: "destructive",
      });
    } finally {
      setLoadingVerse(false);
    }
  };

  // Insert Bible verse into content
  const insertBibleVerse = (verse: BibleVerse) => {
    const verseReference = `${verse.book_name} ${verse.chapter}:${verse.verse}`;
    const verseText = `\n\n"${verse.text}" - ${verseReference}\n\n`;
    
    setEntry(prev => ({
      ...prev,
      content: (prev.content || '') + verseText,
      verse_references: [...(prev.verse_references || []), verseReference]
    }));

    setShowVerseDialog(false);
    setVerseResults([]);
    setVerseSearchQuery('');
    
    toast({
      title: "Verse added",
      description: `${verseReference} has been added to your journal`,
    });
  };

  // Get AI assistance
  const getAIAssistance = async () => {
    if (!entry.content?.trim()) {
      toast({
        title: "No content to analyze",
        description: "Please write some content first",
        variant: "destructive",
      });
      return;
    }

    setAiLoading(true);
    try {
      // Mock AI analysis for demo purposes
      // In production, this would connect to your preferred AI service
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time
      
      const aiResponse = {
        suggestions: [
          'Consider adding a prayer about this reflection',
          'Think about how this applies to your daily life',
          'Reflect on God\'s faithfulness in similar situations'
        ],
        verseRecommendations: ['Philippians 4:13', 'Jeremiah 29:11', 'Romans 8:28'],
        themes: ['Faith', 'Growth', 'Trust'],
        sentiment: 'positive' as const
      };
      
      setAiAssistance(aiResponse);
      setShowAIPanel(true);
      
      toast({
        title: "AI insights generated",
        description: "Your spiritual insights are ready to explore",
      });
    } catch (error) {
      console.error('AI assistance error:', error);
      toast({
        title: "AI assistance unavailable",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!entry.title?.trim() || !entry.content?.trim()) {
      toast({
        title: "Missing information",
        description: "Please add a title and content to your journal entry",
        variant: "destructive",
      });
      return;
    }

    const finalEntry: JournalEntryForm = {
      title: entry.title.trim(),
      content: entry.content.trim(),
      mood: null, // Always null since we removed mood
      spiritual_state: null, // Always null since we removed spiritual state
      verse_references: entry.verse_references || [],
      tags: [], // Always empty since we removed tags
      is_private: true, // Always private
      entry_date: entry.entry_date || new Date().toISOString().split('T')[0],
      word_count: stats.wordCount,
      reading_time: stats.readingTime,
      language: currentLanguage,
      category: 'personal'
    };

    onSave(finalEntry);
  };

  // Text formatting functions
  const formatText = (format: 'bold' | 'italic' | 'bullet') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = entry.content || '';
    const selectedText = currentContent.substring(start, end);
    
    let formattedText = '';
    
    switch (format) {
      case 'bold':
        formattedText = selectedText ? `**${selectedText}**` : '**bold text**';
        break;
      case 'italic':
        formattedText = selectedText ? `*${selectedText}*` : '*italic text*';
        break;
      case 'bullet': {
        const lines = selectedText ? selectedText.split('\n') : ['bullet point'];
        formattedText = lines.map(line => line.trim() ? `• ${line.trim()}` : '•').join('\n');
        break;
      }
    }
    
    const newContent = currentContent.substring(0, start) + formattedText + currentContent.substring(end);
    setEntry(prev => ({ ...prev, content: newContent }));
    
    // Reset cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = start + formattedText.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const isMobile = useIsMobile();

  // Mobile-optimized modal sizing
  const getModalClasses = () => {
    if (isMobile) {
      return {
        container: "fixed inset-0 z-50 bg-black/50 mobile-safe-area",
        modal: "bg-white w-full h-full flex flex-col", // Full screen on mobile
        content: "flex-1 overflow-hidden flex flex-col"
      };
    }
    return {
      container: "fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4",
      modal: "bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden",
      content: "flex flex-col h-[85vh]"
    };
  };

  const modalClasses = getModalClasses();

  return (
    <div className={modalClasses.container}>
      <div className={modalClasses.modal}>
        <div className={modalClasses.content}>
          
          {/* Mobile-Optimized Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-2 flex-1">
              <Button
                onClick={onCancel}
                variant="ghost"
                className="min-h-[44px] min-w-[44px] p-0 touch-optimized"
              >
                <X className="h-5 w-5" />
              </Button>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                {isEditing ? 'Edit Entry' : 'New Journal Entry'}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Mobile settings toggle */}
              {isMobile && (
                <Button
                  variant="ghost"
                  onClick={() => setShowSettings(!showSettings)}
                  className="min-h-[44px] min-w-[44px] p-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white min-h-[44px] px-4 touch-optimized"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isMobile ? 'Save' : 'Save Entry'}
              </Button>
            </div>
          </div>

          {/* Mobile-First Content Area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            
            {/* Title Input - Mobile Optimized */}
            <div className="p-3 sm:p-4 border-b border-gray-100">
              <Input
                placeholder="Entry title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg sm:text-xl font-semibold border-none shadow-none px-0 focus-visible:ring-0 placeholder:text-gray-400 min-h-[44px] touch-optimized"
                autoFocus={!isMobile} // Avoid auto-focus on mobile to prevent keyboard issues
              />
            </div>

            {/* Mobile Settings Panel */}
            {isMobile && showSettings && (
              <div className="p-3 border-b border-gray-100 bg-gray-50">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.id} value={cat.id} className="text-sm">
                            <span className="mr-2">{cat.icon}</span>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-600">Mood</Label>
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MOODS.map(moodOption => (
                          <SelectItem key={moodOption.id} value={moodOption.id} className="text-sm">
                            <span className="mr-2">{moodOption.emoji}</span>
                            {moodOption.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile-Optimized Toolbar */}
            <div className="flex items-center justify-between p-2 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-1">
                {/* Essential formatting tools only on mobile */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting('bold')}
                  className="min-h-[40px] min-w-[40px] p-0 touch-optimized"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting('italic')}
                  className="min-h-[40px] min-w-[40px] p-0 touch-optimized"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting('list')}
                  className="min-h-[40px] min-w-[40px] p-0 touch-optimized"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBibleVerse(true)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 min-h-[40px] px-3 touch-optimized"
                >
                  <Quote className="h-4 w-4 mr-1" />
                  {isMobile ? 'Verse' : 'Add Bible Verse'}
                </Button>
              </div>
            </div>

            {/* Main Content Editor - Mobile Optimized */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto mobile-scroll">
              <Textarea
                placeholder="Write your thoughts, prayers, and reflections..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full min-h-[300px] border-none shadow-none resize-none focus-visible:ring-0 text-base leading-relaxed touch-optimized mobile-text"
                style={{ 
                  fontSize: isMobile ? '16px' : '14px', // Prevent zoom on iOS
                  lineHeight: '1.6'
                }}
              />
            </div>

            {/* Desktop Settings Sidebar */}
            {!isMobile && (
              <div className="w-80 border-l border-gray-200 bg-gray-50/50 overflow-y-auto">
                {/* Desktop settings content */}
                {/* ... existing desktop settings code ... */}
              </div>
            )}

            {/* Mobile Quick Actions Footer */}
            {isMobile && (
              <div className="p-3 border-t border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {mood}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 