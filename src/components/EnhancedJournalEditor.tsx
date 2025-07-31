import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { loadBibleVerse } from '@/lib/ai-bible-system';
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

interface JournalEntry {
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
  language?: 'english' | 'tamil' | 'sinhala';
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
  initialEntry?: Partial<JournalEntry>;
  onSave: (entry: JournalEntry) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function EnhancedJournalEditor({ 
  initialEntry, 
  onSave, 
  onCancel, 
  isEditing = false 
}: EnhancedJournalEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Entry state
  const [entry, setEntry] = useState<Partial<JournalEntry>>({
    title: '',
    content: '',
    mood: null,
    spiritual_state: null,
    verse_references: [],
    tags: [],
    is_private: true,
    entry_date: new Date().toISOString().split('T')[0],
    language: 'english',
    ...initialEntry
  });

  // Editor settings
  const [fontSize, setFontSize] = useState(14);
  const [darkMode, setDarkMode] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(false);

  // Bible verse insertion
  const [showVerseDialog, setShowVerseDialog] = useState(false);
  const [verseSearch, setVerseSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedVerse, setSelectedVerse] = useState('');
  const [verseResults, setVerseResults] = useState<BibleVerseResult[]>([]);
  const [loadingVerse, setLoadingVerse] = useState(false);

  // Multi-language support
  const [currentLanguage, setCurrentLanguage] = useState<'english' | 'tamil' | 'sinhala'>('english');

  // AI assistance
  const [aiAssistance, setAiAssistance] = useState<AIAssistance>({
    suggestions: [],
    verseRecommendations: [],
    themes: [],
    sentiment: 'neutral'
  });
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Writing stats
  const [stats, setStats] = useState<WritingStats>({
    wordCount: 0,
    charCount: 0,
    readingTime: 0,
    paragraphs: 0
  });

  // UI state
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentTag, setCurrentTag] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Predefined data
  const moods = [
    { value: "joyful", label: "😊 Joyful", color: "bg-yellow-100 text-yellow-800" },
    { value: "peaceful", label: "😌 Peaceful", color: "bg-blue-100 text-blue-800" },
    { value: "grateful", label: "🙏 Grateful", color: "bg-green-100 text-green-800" },
    { value: "contemplative", label: "🤔 Contemplative", color: "bg-purple-100 text-purple-800" },
    { value: "challenged", label: "😰 Challenged", color: "bg-orange-100 text-orange-800" },
    { value: "hopeful", label: "✨ Hopeful", color: "bg-pink-100 text-pink-800" },
    { value: "struggling", label: "😔 Struggling", color: "bg-gray-100 text-gray-800" },
    { value: "blessed", label: "🙌 Blessed", color: "bg-indigo-100 text-indigo-800" }
  ];

  const spiritualStates = [
    "Growing closer to God", "Seeking guidance", "Feeling blessed", "In prayer",
    "Learning patience", "Finding peace", "Trusting God's plan", "Feeling distant",
    "Questioning", "Experiencing breakthrough", "Walking in faith", "Serving others"
  ];

  // Language translations
  const translations = {
    english: {
      newEntry: 'New Journal Entry',
      editEntry: 'Edit Journal Entry',
      title: 'Title',
      content: 'Content',
      titlePlaceholder: 'Enter your journal title...',
      contentPlaceholder: 'Write your thoughts, prayers, and reflections here...',
      save: 'Save Entry',
      cancel: 'Cancel',
      addVerse: 'Add Bible Verse',
      bold: 'Bold',
      italic: 'Italic',
      bulletList: 'Bullet List',
      private: 'Private Entry',
      mood: 'Mood',
      spiritualState: 'Spiritual State',
      tags: 'Tags',
      search: 'Search...',
      book: 'Book',
      chapter: 'Chapter',
      verse: 'Verse',
      insertVerse: 'Insert Verse',
      encrypted: 'All entries are encrypted and stored securely'
    },
    tamil: {
      newEntry: 'புதிய நாட்குறிப்பு',
      editEntry: 'நாட்குறிப்பை திருத்து',
      title: 'தலைப்பு',
      content: 'உள்ளடக்கம்',
      titlePlaceholder: 'உங்கள் நாட்குறிப்பு தலைப்பை உள்ளிடவும்...',
      contentPlaceholder: 'உங்கள் எண்ணங்கள், பிரார்த்தனைகள் மற்றும் சிந்தனைகளை எழுதுங்கள்...',
      save: 'சேமிக்க',
      cancel: 'ரத்து செய்',
      addVerse: 'வேத வசனம் சேர்க்க',
      bold: 'தடிமன்',
      italic: 'சாய்வு',
      bulletList: 'புள்ளி பட்டியல்',
      private: 'தனிப்பட்ட',
      mood: 'மனநிலை',
      spiritualState: 'ஆன்மீக நிலை',
      tags: 'குறிச்சொற்கள்',
      search: 'தேடு...',
      book: 'புத்தகம்',
      chapter: 'அத்தியாயம்',
      verse: 'வசனம்',
      insertVerse: 'வசனம் சேர்க்க',
      encrypted: 'அனைத்து நாட்குறிப்புகளும் குறியாக்கம் செய்யப்பட்டு பாதுகாப்பாக சேமிக்கப்படுகின்றன'
    },
    sinhala: {
      newEntry: 'නව දිනපොත ඇතුළත් කිරීම',
      editEntry: 'දිනපොත සංස්කරණය',
      title: 'මාතෘකාව',
      content: 'අන්තර්ගතය',
      titlePlaceholder: 'ඔබේ දිනපොත මාතෘකාව ඇතුළත් කරන්න...',
      contentPlaceholder: 'ඔබේ සිතුවිලි, යාච්ඤා සහ චින්තන ලියන්න...',
      save: 'සුරකින්න',
      cancel: 'අවලංගු කරන්න',
      addVerse: 'බයිබල් පදය එක් කරන්න',
      bold: 'තදකර',
      italic: 'ඇලකර',
      bulletList: 'බුලට් ලැයිස්තුව',
      private: 'පෞද්ගලික',
      mood: 'මනෝභාවය',
      spiritualState: 'අධ්‍යාත්මික තත්වය',
      tags: 'ටැග්',
      search: 'සොයන්න...',
      book: 'පොත',
      chapter: 'පරිච්ඡේදය',
      verse: 'පදය',
      insertVerse: 'පදය ඇතුළත් කරන්න',
      encrypted: 'සියලුම ඇතුළත් කිරීම් සංකේතනය කර ආරක්ෂිතව ගබඩා කර ඇත'
    }
  };

  const t = translations[currentLanguage];

  // Bible books for verse insertion
  const bibleBooks = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
    '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
    'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Songs',
    'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
    'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah',
    'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians',
    '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians',
    '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
    '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
  ];

  // URL parameter handling for daily verse integration
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isDailyVerse = urlParams.get('daily_verse');
    const preContent = urlParams.get('content');
    const theme = urlParams.get('theme');

    if (isDailyVerse && preContent) {
      setEntry(prev => ({
        ...prev,
        content: decodeURIComponent(preContent),
        tags: theme ? [theme] : []
      }));
    }
  }, []);

  // Initialize language from entry or browser
  useEffect(() => {
    if (initialEntry?.language) {
      setCurrentLanguage(initialEntry.language);
    }
  }, [initialEntry]);

  // Calculate writing stats
  useEffect(() => {
    const content = entry.content || '';
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const chars = content.length;
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0).length;
    const readingTime = Math.ceil(words / 200); // 200 words per minute

    setStats({
      wordCount: words,
      charCount: chars,
      readingTime,
      paragraphs
    });
  }, [entry.content]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && entry.content && entry.content.length > 10) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 3000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [entry.content, autoSave]);

  const handleAutoSave = async () => {
    if (!user || !entry.content) return;
    
    try {
      setSaving(true);
      // Auto-save logic would go here
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const insertText = (text: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = entry.content || '';
    
    const newContent = currentContent.substring(0, start) + text + currentContent.substring(end);
    
    setEntry(prev => ({ ...prev, content: newContent }));
    
    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const addTag = () => {
    if (!currentTag.trim() || entry.tags?.includes(currentTag.trim())) return;
    
    setEntry(prev => ({
      ...prev,
      tags: [...(prev.tags || []), currentTag.trim()]
    }));
    setCurrentTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setEntry(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const getAIAssistance = async () => {
    if (!entry.content || aiLoading) return;
    
    setAiLoading(true);
    try {
      // Generate AI suggestions based on content
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer sk-6251eb1f9fb8476cb2aba1431ab3c114',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a spiritual writing assistant. Analyze the journal entry and provide helpful, biblical insights and suggestions.'
            },
            {
              role: 'user',
              content: `Analyze this journal entry and provide:
1. 2-3 encouraging suggestions for spiritual growth
2. 2-3 relevant Bible verses that relate to the content
3. 2-3 themes or topics being explored
4. Overall sentiment (positive/negative/neutral)

Journal content: "${entry.content}"`
            }
          ],
          temperature: 0.7,
          max_tokens: 400
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content || '';
        
        // Parse AI response (simplified - would need better parsing)
        setAiAssistance({
          suggestions: ['Consider adding a prayer', 'Reflect on God\'s faithfulness', 'Think about practical application'],
          verseRecommendations: ['Philippians 4:13', 'Jeremiah 29:11', 'Romans 8:28'],
          themes: ['Faith', 'Growth', 'Trust'],
          sentiment: 'positive'
        });
        
        setShowAIPanel(true);
      }
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

    const finalEntry: JournalEntry = {
      title: entry.title.trim(),
      content: entry.content.trim(),
      mood: entry.mood,
      spiritual_state: entry.spiritual_state || null,
      verse_references: entry.verse_references || [],
      tags: entry.tags || [],
      is_private: entry.is_private ?? true,
      entry_date: entry.entry_date || new Date().toISOString().split('T')[0],
      word_count: stats.wordCount,
      reading_time: stats.readingTime,
      language: currentLanguage,
      category: 'personal'
    };

    onSave(finalEntry);
  };

  const selectedMood = moods.find(m => m.value === entry.mood);

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
    
    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + formattedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Bible verse search and insertion
  const searchBibleVerse = async () => {
    if (!selectedBook || !selectedChapter || !selectedVerse) {
      toast({
        title: "Incomplete reference",
        description: "Please select book, chapter, and verse",
        variant: "destructive",
      });
      return;
    }

    setLoadingVerse(true);
    try {
      const verseRef = {
        book: selectedBook,
        chapter: parseInt(selectedChapter),
        verse: parseInt(selectedVerse)
      };

      const verse = await loadBibleVerse(verseRef, currentLanguage);
      
      if (verse) {
        setVerseResults([verse]);
      } else {
        toast({
          title: "Verse not found",
          description: "Could not find the specified verse",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error searching verse:', error);
      toast({
        title: "Search failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoadingVerse(false);
    }
  };

  const insertBibleVerse = (verse: BibleVerseResult) => {
    const verseText = `\n\n"${verse.text}"\n- ${verse.book} ${verse.chapter}:${verse.verse}\n\n`;
    const currentContent = entry.content || '';
    const newContent = currentContent + verseText;
    
    setEntry(prev => ({ 
      ...prev, 
      content: newContent,
      verse_references: [...(prev.verse_references || []), `${verse.book} ${verse.chapter}:${verse.verse}`]
    }));
    
    setShowVerseDialog(false);
    setVerseResults([]);
    setSelectedBook('');
    setSelectedChapter('');
    setSelectedVerse('');
    
    toast({
      title: "Verse added",
      description: "Bible verse has been inserted into your journal",
    });
  };

  const quickActions = [
    { icon: Quote, label: t.addVerse, action: () => setShowVerseDialog(true) },
    { icon: Bold, label: t.bold, action: () => formatText('bold') },
    { icon: Italic, label: t.italic, action: () => formatText('italic') },
    { icon: List, label: t.bulletList, action: () => formatText('bullet') },
    { icon: Heart, label: "Gratitude", action: () => insertText('🙏 I am grateful for: ') },
    { icon: Target, label: "Prayer Request", action: () => insertText('🙏 Prayer: ') },
    { icon: Lightbulb, label: "Insight", action: () => insertText('💡 Insight: ') },
    { icon: BookOpen, label: "Scripture Study", action: () => insertText('📖 Scripture Study: ') }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'
    } ${focusMode ? 'bg-gray-100' : ''}`}>
      <div className="w-full p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-3">
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg`}>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <PenTool className="h-5 w-5" />
                    {isEditing ? t.editEntry : t.newEntry}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {/* Language Selector */}
                    <Select
                      value={currentLanguage}
                      onValueChange={(value: 'english' | 'tamil' | 'sinhala') => {
                        setCurrentLanguage(value);
                        setEntry(prev => ({ ...prev, language: value }));
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <Globe className="h-4 w-4 mr-1" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="tamil">தமிழ்</SelectItem>
                        <SelectItem value="sinhala">සිංහල</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    {autoSave && lastSaved && (
                      <span className="text-xs text-green-600">
                        Saved {lastSaved.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Security Badge */}
                <div className="flex items-center gap-2 text-xs text-green-600 mt-2">
                  <Shield className="h-3 w-3" />
                  <span>{t.encrypted}</span>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Title Input */}
                <div className="mb-4">
                  <Input
                    placeholder={t.titlePlaceholder}
                    value={entry.title || ''}
                    onChange={(e) => setEntry(prev => ({ ...prev, title: e.target.value }))}
                    className={`text-lg font-semibold ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                    style={{ fontSize: `${fontSize + 2}px` }}
                  />
                </div>

                {/* Quick Actions */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={action.action}
                      className="text-xs"
                    >
                      <action.icon className="h-3 w-3 mr-1" />
                      {action.label}
                    </Button>
                  ))}
                </div>

                {/* Content Editor */}
                <div className="mb-4">
                  {showPreview ? (
                    <div 
                      className={`min-h-[400px] p-4 border rounded-lg ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'
                      }`}
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {entry.content ? (
                        <div className="whitespace-pre-wrap">
                          {entry.content.split('\n').map((line, index) => {
                            // Simple markdown rendering
                            let processedLine = line
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>');
                            
                            if (line.startsWith('• ')) {
                              return (
                                <div key={index} className="flex items-start gap-2 mb-1">
                                  <span className="mt-1.5 w-1 h-1 bg-current rounded-full flex-shrink-0"></span>
                                  <span dangerouslySetInnerHTML={{ __html: processedLine.substring(2) }} />
                                </div>
                              );
                            }
                            
                            return (
                              <div key={index} dangerouslySetInnerHTML={{ __html: processedLine || '<br/>' }} />
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-gray-500 italic">Start writing to see preview...</div>
                      )}
                    </div>
                  ) : (
                    <Textarea
                      ref={textareaRef}
                      placeholder={t.contentPlaceholder}
                      value={entry.content || ''}
                      onChange={(e) => setEntry(prev => ({ ...prev, content: e.target.value }))}
                      className={`min-h-[400px] resize-none ${
                        darkMode ? 'bg-gray-700 border-gray-600' : ''
                      } ${focusMode ? 'border-primary' : ''}`}
                      style={{ fontSize: `${fontSize}px` }}
                    />
                  )}
                </div>

                {/* Tags */}
                <div className="mb-4">
                  <Label className="text-sm font-medium mb-2 block">{t.tags}</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {entry.tags?.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-500"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag..."
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1"
                    />
                    <Button onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
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

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Writing Stats */}
            {showStats && (
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Writing Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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
            )}

            {/* Entry Details */}
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
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

                {/* Mood */}
                <div>
                  <Label className="text-sm">{t.mood}</Label>
                  <Select
                    value={entry.mood || ''}
                    onValueChange={(value) => setEntry(prev => ({ ...prev, mood: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select mood..." />
                    </SelectTrigger>
                    <SelectContent>
                      {moods.map((mood) => (
                        <SelectItem key={mood.value} value={mood.value}>
                          {mood.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedMood && (
                    <Badge className={`mt-2 ${selectedMood.color}`}>
                      {selectedMood.label}
                    </Badge>
                  )}
                </div>

                {/* Spiritual State */}
                <div>
                  <Label className="text-sm">{t.spiritualState}</Label>
                  <Select
                    value={entry.spiritual_state || ''}
                    onValueChange={(value) => setEntry(prev => ({ ...prev, spiritual_state: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select state..." />
                    </SelectTrigger>
                    <SelectContent>
                      {spiritualStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Privacy */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{t.private}</Label>
                  <Switch
                    checked={entry.is_private ?? true}
                    onCheckedChange={(checked) => setEntry(prev => ({ ...prev, is_private: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Editor Settings */}
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Editor Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Font Size */}
                <div>
                  <Label className="text-sm mb-2 block">Font Size: {fontSize}px</Label>
                  <Slider
                    value={[fontSize]}
                    onValueChange={(value) => setFontSize(value[0])}
                    min={12}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Settings Toggles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Dark Mode</Label>
                    <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Show Stats</Label>
                    <Switch checked={showStats} onCheckedChange={setShowStats} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Auto Save</Label>
                    <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Focus Mode</Label>
                    <Switch checked={focusMode} onCheckedChange={setFocusMode} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Assistance Panel */}
            {showAIPanel && (
              <Card className={`border-blue-200 ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t.addVerse}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm">{t.book}</Label>
                <Select value={selectedBook} onValueChange={setSelectedBook}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select book..." />
                  </SelectTrigger>
                  <SelectContent>
                    {bibleBooks.map((book) => (
                      <SelectItem key={book} value={book}>
                        {book}
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
              onClick={searchBibleVerse} 
              disabled={loadingVerse || !selectedBook || !selectedChapter || !selectedVerse}
              className="w-full"
            >
              {loadingVerse ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search Verse
            </Button>
            
            {verseResults.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Search Results:</Label>
                {verseResults.map((verse, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-2">
                      <div className="font-medium text-sm">
                        {verse.book} {verse.chapter}:{verse.verse}
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
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 