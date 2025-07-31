import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { searchVerses, getAllBooks, getChapterVerses, BibleVerse, BibleBook } from '@/lib/local-bible';
import {
  Save,
  RefreshCw,
  FileText,
  Sparkles,
  Quote,
  Hash,
  Clock,
  Target,
  Heart,
  BookOpen,
  PenTool,
  Type,
  Palette,
  Eye,
  EyeOff,
  Copy,
  Share2,
  Calendar,
  Tag,
  Volume2,
  Mic,
  MicOff,
  Lightbulb,
  Brain,
  Plus,
  X,
  Check,
  Edit3,
  Settings,
  BarChart3,
  Bold,
  Italic,
  List,
  Search,
  Globe,
  Shield
} from 'lucide-react';

interface JournalEntryForm {
  id?: string;
  title: string;
  content: string;
  mood: string | null;
  spiritual_state?: string | null;
  verse_references?: string[];
  tags?: string[];
  is_private?: boolean;
  entry_date?: string;
  word_count?: number;
  reading_time?: number;
  language?: string;
  category?: string;
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
      case 'bullet':
        const lines = selectedText ? selectedText.split('\n') : ['bullet point'];
        formattedText = lines.map(line => line.trim() ? `• ${line.trim()}` : '•').join('\n');
        break;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {isEditing ? 'Edit Journal Entry' : 'New Journal Entry'}
              </h1>
              <p className="text-gray-600">Express your thoughts and spiritual reflections</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={currentLanguage} onValueChange={(value: 'english' | 'tamil' | 'sinhala') => setCurrentLanguage(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">🇺🇸 English</SelectItem>
                <SelectItem value="tamil">🇮🇳 Tamil</SelectItem>
                <SelectItem value="sinhala">🇱🇰 Sinhala</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardContent className="p-6">
                {/* Title */}
                <div className="mb-4">
                  <Input
                    placeholder="Entry title..."
                    value={entry.title || ''}
                    onChange={(e) => setEntry(prev => ({ ...prev, title: e.target.value }))}
                    className="text-lg font-medium border-0 px-0 focus-visible:ring-0 placeholder:text-gray-400"
                  />
                </div>

                {/* Formatting Toolbar */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText('bold')}
                    className="h-8"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText('italic')}
                    className="h-8"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText('bullet')}
                    className="h-8"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVerseDialog(true)}
                    className="h-8 text-blue-600 hover:text-blue-700"
                  >
                    <Quote className="h-4 w-4 mr-1" />
                    Add Bible Verse
                  </Button>
                </div>

                {/* Content Editor */}
                <div className="mb-4">
                  <Textarea
                    ref={textareaRef}
                    placeholder={t.content}
                    value={entry.content || ''}
                    onChange={(e) => setEntry(prev => ({ ...prev, content: e.target.value }))}
                    className="min-h-[400px] border-0 px-0 resize-none focus-visible:ring-0 placeholder:text-gray-400 text-base leading-relaxed"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {t.save}
                    </Button>
                    <Button variant="outline" onClick={onCancel}>
                      {t.cancel}
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    onClick={getAIAssistance}
                    disabled={aiLoading}
                  >
                    {aiLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    AI Insights
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Writing Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Writing Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Words:</span>
                  <span className="font-medium">{stats.wordCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Characters:</span>
                  <span className="font-medium">{stats.charCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Reading time:</span>
                  <span className="font-medium">{stats.readingTime} min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Paragraphs:</span>
                  <span className="font-medium">{stats.paragraphs}</span>
                </div>
              </CardContent>
            </Card>

            {/* Entry Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Entry Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date */}
                <div>
                  <Label className="text-sm">Entry Date</Label>
                  <Input
                    type="date"
                    value={entry.entry_date || ''}
                    onChange={(e) => setEntry(prev => ({ ...prev, entry_date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* AI Assistance Panel */}
            {showAIPanel && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-blue-700">Suggestions</Label>
                    <ul className="text-xs space-y-1 mt-1">
                      {aiAssistance.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-gray-600">• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-blue-700">Related Verses</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {aiAssistance.verseRecommendations.map((verse, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {verse}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Bible Verse Dialog */}
      <Dialog open={showVerseDialog} onOpenChange={setShowVerseDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t.addVerse}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">Search by Keyword</TabsTrigger>
              <TabsTrigger value="reference">Find by Reference</TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for verses by keyword (e.g., 'love', 'faith', 'hope')"
                    value={verseSearchQuery}
                    onChange={(e) => setVerseSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchBibleVersesByKeyword()}
                    className="flex-1"
                  />
                  <Select value={selectedBook} onValueChange={setSelectedBook}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by book (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Books</SelectItem>
                      {bibleBooks.map((book) => (
                        <SelectItem key={book.id} value={book.name}>
                          {book.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={searchBibleVersesByKeyword} 
                  disabled={loadingVerse || !verseSearchQuery.trim()}
                  className="w-full"
                >
                  {loadingVerse ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search Verses
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="reference" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">{t.book}</Label>
                  <Select value={selectedBook} onValueChange={setSelectedBook}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select book..." />
                    </SelectTrigger>
                    <SelectContent>
                      {bibleBooks.map((book) => (
                        <SelectItem key={book.id} value={book.name}>
                          {book.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm">{t.chapter}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    placeholder="1"
                  />
                </div>
                
                <div>
                  <Label className="text-sm">{t.verse}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={selectedVerse}
                    onChange={(e) => setSelectedVerse(e.target.value)}
                    placeholder="1"
                  />
                </div>
              </div>
              
              <Button 
                onClick={searchSpecificVerse} 
                disabled={loadingVerse || !selectedBook || !selectedChapter || !selectedVerse}
                className="w-full"
              >
                {loadingVerse ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Find Verse
              </Button>
            </TabsContent>
          </Tabs>
          
          {verseResults.length > 0 && (
            <div className="space-y-3 mt-6">
              <Label className="text-sm font-medium">Search Results:</Label>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {verseResults.map((verse, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-2">
                      <div className="font-medium text-sm text-blue-600">
                        {verse.book_name} {verse.chapter}:{verse.verse}
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        "{verse.text}"
                      </div>
                      <Button
                        onClick={() => insertBibleVerse(verse)}
                        size="sm"
                        className="mt-2"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {t.insertVerse}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 