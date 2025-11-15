import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getAllBooks, getChapterVerses, TranslationCode, BIBLE_TRANSLATIONS } from "@/lib/local-bible";
import { 
  Mic, Plus, Edit3, Trash2, Save, X, RefreshCw, 
  AlertCircle, Clock, FileText, BookOpen, 
  Users, ChevronLeft, ChevronRight, Send, MessageCircle, 
  Bot, Copy, Download, Maximize2, Minimize2, PanelLeftOpen, 
  PanelRightOpen, BarChart3, Target, Award, Menu, Settings
} from "lucide-react";
import { format } from 'date-fns';
import SermonToolbar from '@/components/SermonToolbar';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { callOpenAIAPI } from '@/lib/openai-api-helper';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface SermonEntry {
  id: string;
  title: string | null;
  content: string;
  scripture_reference?: string | null;
  scripture_references?: string[] | null;
  main_points?: string[];
  congregation?: string | null;
  sermon_date?: string;
  duration?: number;
  notes?: string | null;
  private_notes?: string | null;
  tags?: string[];
  is_draft?: boolean;
  status?: 'draft' | 'ready' | 'delivered' | 'archived';
  created_at: string;
  updated_at: string;
  user_id: string;
  word_count?: number;
  estimated_time?: number;
  estimated_duration?: number;
  language?: 'english' | 'tamil' | 'sinhala';
  category?: string;
  outline?: string | null;
  illustrations?: string[];
  applications?: string[];
  series_name?: string | null;
  template_type?: string | null;
  ai_generated?: boolean;
  last_auto_save?: string | null;
  version?: number;
  delivered_at?: string | null;
  recording_url?: string | null;
  feedback_score?: number | null;
  view_count?: number;
}

interface BibleBook {
  id: string;
  name: string;
  testament: 'old' | 'new';
  chapters: number;
}

interface BibleVerse {
  id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface SermonStats {
  total: number;
  ready: number;
  delivered: number;
  drafts: number;
}

const SermonWriter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Core sermon state
  const [sermons, setSermons] = useState<SermonEntry[]>([]);
  const [editingSermon, setEditingSermon] = useState<Partial<SermonEntry> | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<SermonStats>({ total: 0, ready: 0, delivered: 0, drafts: 0 });
  
  // Layout state - Mobile optimized: sidebars closed by default on mobile
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(!isMobile);
  const [rightPanelOpen, setRightPanelOpen] = useState(!isMobile);
  const [activeRightTab, setActiveRightTab] = useState('bible');
  
  // Mobile-specific states
  const [mobileLeftSheetOpen, setMobileLeftSheetOpen] = useState(false);
  const [mobileRightSheetOpen, setMobileRightSheetOpen] = useState(false);
  
  // Bible state
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [selectedTranslation, setSelectedTranslation] = useState<TranslationCode>('KJV');
  const [bibleLoading, setBibleLoading] = useState(false);
  
  // AI Chat state
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  // Advanced editor features
  const [autoSave, setAutoSave] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [darkMode, setDarkMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [wordGoal, setWordGoal] = useState(1500);
  
  // Editor refs
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const aiScrollRef = useRef<HTMLDivElement>(null);
  const autoSaveRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (user) {
      loadSermons();
      loadBooks();
    }
  }, [user]);

  useEffect(() => {
    if (selectedBook) {
      loadChapter();
    }
  }, [selectedBook, selectedChapter, selectedTranslation]);

  useEffect(() => {
    calculateStats();
  }, [sermons]);

  // Auto-save functionality - Optimized for mobile and desktop
  useEffect(() => {
    if (autoSave && editingSermon && editingSermon.content && editingSermon.content.trim().length > 0) {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
      
      // Mobile: Save more frequently for better reliability
      // Desktop: Save less frequently to reduce server load
      const saveInterval = isMobile ? 1500 : 2000;
      
      autoSaveRef.current = setTimeout(() => {
        handleSaveSermon(true);
      }, saveInterval);
    }
    
    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [editingSermon?.content, autoSave, isMobile]);

  const loadSermons = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sermons')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSermons((data || []) as SermonEntry[]);
    } catch (error) {
      console.error('Error loading sermons:', error);
      toast({
        title: "Error loading sermons",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = sermons.length;
    const ready = sermons.filter(s => !s.is_draft && s.content.trim().length > 0).length;
    const delivered = sermons.filter(s => s.status === 'delivered').length; // Assuming status field exists
    const drafts = sermons.filter(s => s.is_draft).length;
    
    setStats({ total, ready, delivered, drafts });
  };

  const loadBooks = async () => {
    try {
      const booksData = await getAllBooks();
      setBooks(booksData);
      if (booksData.length > 0) {
        setSelectedBook(booksData[0]);
      }
    } catch (error) {
      console.error('Error loading books:', error);
    }
  };

  const loadChapter = async () => {
    if (!selectedBook) return;
    setBibleLoading(true);
    try {
      const chapterVerses = await getChapterVerses(
        selectedBook.name, 
        selectedChapter, 
        'english',
        selectedTranslation
      );
      setVerses(chapterVerses);
    } catch (error) {
      console.error('Error loading chapter:', error);
    } finally {
      setBibleLoading(false);
    }
  };

  const handleNewSermon = () => {
    setEditingSermon({
      title: '',
      content: '',
      scripture_reference: '',
      congregation: '',
      sermon_date: new Date().toISOString().split('T')[0],
      is_draft: true,
      language: 'english'
    });
    setIsEditing(false);
  };

  const handleSaveSermon = useCallback(async (isAutoSave = false) => {
    if (!user || !editingSermon) return;

    if (!isAutoSave) setSaving(true);
    try {
      const finalData = {
        user_id: user.id,
        title: editingSermon.title?.trim() || 'Untitled Sermon',
        content: editingSermon.content?.trim() || '',
        scripture_reference: editingSermon.scripture_reference || null,
        scripture_references: editingSermon.scripture_reference ? [editingSermon.scripture_reference] : null,
        congregation: editingSermon.congregation || null,
        sermon_date: editingSermon.sermon_date || new Date().toISOString().split('T')[0],
        is_draft: editingSermon.is_draft ?? true,
        word_count: editingSermon.content?.trim().split(/\s+/).filter(w => w.length > 0).length || 0,
        estimated_time: Math.ceil((editingSermon.content?.trim().split(/\s+/).filter(w => w.length > 0).length || 0) / 150),
        estimated_duration: Math.ceil((editingSermon.content?.trim().split(/\s+/).filter(w => w.length > 0).length || 0) / 150),
        language: editingSermon.language || 'english',
        category: editingSermon.category || 'general',
        tags: editingSermon.tags || [],
        notes: editingSermon.notes || null,
        private_notes: editingSermon.private_notes || null,
        status: editingSermon.status || 'draft',
        updated_at: new Date().toISOString()
      };

      if (isEditing && editingSermon?.id) {
        const { error } = await supabase
          .from('sermons')
          .update(finalData)
          .eq('id', editingSermon.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating sermon:', error);
          
          // Handle specific database column issues
          if (error.message?.includes('column') && error.message?.includes('does not exist')) {
            const missingColumn = error.message.match(/column "([^"]+)"/)?.[1];
            console.log(`Missing column detected: ${missingColumn}`);
            
            // Retry with basic data only
            const basicData = {
              title: editingSermon.title?.trim() || 'Untitled Sermon',
              content: editingSermon.content?.trim() || '',
              scripture_reference: editingSermon.scripture_reference || null,
              updated_at: new Date().toISOString()
            };
            
            const { error: retryError } = await supabase
              .from('sermons')
              .update(basicData)
              .eq('id', editingSermon.id)
              .eq('user_id', user.id);
              
            if (retryError) {
              throw new Error(retryError.message || 'Failed to update sermon even with basic data');
            }
          } else {
            throw error;
          }
        }
        
        if (!isAutoSave) {
          toast({
            title: "Sermon updated",
            description: "Your sermon has been saved successfully",
          });
        }
      } else {
        const { data, error } = await supabase
          .from('sermons')
          .insert([{
            ...finalData,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        let sermonId = null;

        if (error) {
          console.error('Error creating sermon:', error);
          
          // Handle specific database column issues
          if (error.message?.includes('column') && error.message?.includes('does not exist')) {
            const missingColumn = error.message.match(/column "([^"]+)"/)?.[1];
            console.log(`Missing column detected: ${missingColumn}`);
            
            // Retry with basic data only
            const basicData = {
              user_id: user.id,
              title: editingSermon.title?.trim() || 'Untitled Sermon',
              content: editingSermon.content?.trim() || '',
              scripture_reference: editingSermon.scripture_reference || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            const { data: retryData, error: retryError } = await supabase
              .from('sermons')
              .insert([basicData])
              .select()
              .single();
              
            if (retryError) {
              throw new Error(retryError.message || 'Failed to create sermon even with basic data');
            }
            
            sermonId = retryData?.id;
          } else {
            throw error;
          }
        } else {
          sermonId = data?.id;
        }
        
        // Update editing sermon with the new ID
        if (sermonId) {
          setEditingSermon(prev => ({ ...prev, id: sermonId }));
          setIsEditing(true);
        }
        
        if (!isAutoSave) {
          toast({
            title: "Sermon created",
            description: "Your new sermon has been saved",
          });
        }
      }

      await loadSermons();
    } catch (error) {
      console.error('Error saving sermon:', error);
      if (!isAutoSave) {
        toast({
          title: "Error saving sermon",
          description: error.message || "Please try again",
          variant: "destructive",
        });
      }
    } finally {
      if (!isAutoSave) setSaving(false);
    }
  }, [user, editingSermon, isEditing, loadSermons]);

  const handleSaveClick = () => {
    handleSaveSermon(false);
  };

  const insertVerseIntoSermon = (verse: BibleVerse) => {
    const verseText = `\n\n"${verse.text}" - ${verse.book_name} ${verse.chapter}:${verse.verse}\n\n`;
    
    if (editorRef.current) {
      const start = editorRef.current.selectionStart;
      const end = editorRef.current.selectionEnd;
      const currentContent = editingSermon?.content || '';
      const newContent = currentContent.slice(0, start) + verseText + currentContent.slice(end);
      
      setEditingSermon(prev => ({ ...prev, content: newContent }));
      
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          editorRef.current.setSelectionRange(start + verseText.length, start + verseText.length);
        }
      }, 0);
    } else {
      setEditingSermon(prev => ({ 
        ...prev, 
        content: (prev?.content || '') + verseText 
      }));
    }
    
    toast({
      title: "Verse added",
      description: `${verse.book_name} ${verse.chapter}:${verse.verse} added to sermon`,
    });
  };

  const handleFormatText = (format: string, formattedText?: string) => {
    if (!editorRef.current || !formattedText) return;
    
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = editingSermon?.content || '';
    
    const newContent = currentContent.slice(0, start) + formattedText + currentContent.slice(end);
    setEditingSermon(prev => ({ ...prev, content: newContent }));
    
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
        editorRef.current.setSelectionRange(start + formattedText.length, start + formattedText.length);
      }
    }, 0);
  };

  const handleExportSermon = (format: string) => {
    if (!editingSermon) return;
    
    const title = editingSermon.title || 'Untitled Sermon';
    const content = `# ${title}\n\n**Scripture:** ${editingSermon.scripture_reference || 'N/A'}\n**Date:** ${editingSermon.sermon_date || 'TBD'}\n**Congregation:** ${editingSermon.congregation || 'N/A'}\n\n---\n\n${editingSermon.content}`;
    
    let blob;
    let filename;
    
    switch (format) {
      case 'txt':
        blob = new Blob([content], { type: 'text/plain' });
        filename = `${title}.txt`;
        break;
      case 'md':
        blob = new Blob([content], { type: 'text/markdown' });
        filename = `${title}.md`;
        break;
      case 'html': {
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <style>
        body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #333; border-bottom: 2px solid #333; }
        h2 { color: #666; }
        blockquote { border-left: 4px solid #ddd; padding-left: 16px; margin: 16px 0; font-style: italic; }
    </style>
</head>
<body>
    ${content.replace(/\n/g, '<br>').replace(/# (.*)/g, '<h1>$1</h1>').replace(/## (.*)/g, '<h2>$1</h2>').replace(/> (.*)/g, '<blockquote>$1</blockquote>')}
</body>
</html>`;
        blob = new Blob([htmlContent], { type: 'text/html' });
        filename = `${title}.html`;
        break;
      }
      default:
        return;
    }
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const insertQuickText = (text: string) => {
    if (editorRef.current) {
      const start = editorRef.current.selectionStart;
      const currentContent = editingSermon?.content || '';
      const newContent = currentContent.slice(0, start) + text + currentContent.slice(start);
      
      setEditingSermon(prev => ({ ...prev, content: newContent }));
      
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          editorRef.current.setSelectionRange(start + text.length, start + text.length);
        }
      }, 0);
    }
  };

  const sendAIMessage = async () => {
    if (!aiInput.trim() || !user) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: aiInput,
      timestamp: new Date().toISOString()
    };

    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setAiLoading(true);

    try {
      const response = await callOpenAIAPI(aiInput, {
        systemPrompt: "You are a biblical studies assistant helping with sermon preparation. Provide thoughtful, biblically sound insights.",
        maxTokens: 500,
        temperature: 0.7,
        model: 'gpt-4o-mini'
      });

      const data = { choices: [{ message: { content: response } }] };
      
      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date().toISOString()
      };

      setAiMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending AI message:', error);
      toast({
        title: "AI Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    return format(new Date(timeString), 'h:mm a');
  };

  // Helper function to render left panel content (used in desktop sidebar and mobile sheet)
  const renderLeftPanelContent = () => (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className={cn("text-sm", isMobile && "text-base")}>Sermon Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className={cn("block font-medium text-gray-700 mb-1", isMobile ? "text-sm" : "text-sm")}>
              Title
            </label>
            <Input
              placeholder="Enter sermon title..."
              value={editingSermon?.title || ''}
              onChange={(e) => setEditingSermon(prev => ({ ...prev, title: e.target.value }))}
              className={cn(isMobile && "text-base")} // Prevent zoom on iOS
            />
          </div>
          
          <div>
            <label className={cn("block font-medium text-gray-700 mb-1", isMobile ? "text-sm" : "text-sm")}>
              Scripture Reference
            </label>
            <Input
              placeholder="e.g., John 3:16"
              value={editingSermon?.scripture_reference || ''}
              onChange={(e) => setEditingSermon(prev => ({ ...prev, scripture_reference: e.target.value }))}
              className={cn(isMobile && "text-base")}
            />
          </div>
          
          <div>
            <label className={cn("block font-medium text-gray-700 mb-1", isMobile ? "text-sm" : "text-sm")}>
              Congregation
            </label>
            <Input
              placeholder="e.g., Sunday Service"
              value={editingSermon?.congregation || ''}
              onChange={(e) => setEditingSermon(prev => ({ ...prev, congregation: e.target.value }))}
              className={cn(isMobile && "text-base")}
            />
          </div>
          
          <div>
            <label className={cn("block font-medium text-gray-700 mb-1", isMobile ? "text-sm" : "text-sm")}>
              Date
            </label>
            <Input
              type="date"
              value={editingSermon?.sermon_date || ''}
              onChange={(e) => setEditingSermon(prev => ({ ...prev, sermon_date: e.target.value }))}
              className={cn(isMobile && "text-base")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className={cn("text-sm", isMobile && "text-base")}>Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className={cn("flex justify-between", isMobile ? "text-sm" : "text-sm")}>
            <span>Words:</span>
            <span>{editingSermon?.content?.trim().split(/\s+/).filter(w => w.length > 0).length || 0}</span>
          </div>
          <div className={cn("flex justify-between", isMobile ? "text-sm" : "text-sm")}>
            <span>Estimated Time:</span>
            <span>{Math.ceil((editingSermon?.content?.trim().split(/\s+/).filter(w => w.length > 0).length || 0) / 150)} min</span>
          </div>
          <div className={cn("flex justify-between", isMobile ? "text-sm" : "text-sm")}>
            <span>Characters:</span>
            <span>{editingSermon?.content?.length || 0}</span>
          </div>
          <div className={cn("flex justify-between", isMobile ? "text-sm" : "text-sm")}>
            <span>Progress:</span>
            <span>{Math.round(((editingSermon?.content?.trim().split(/\s+/).filter(w => w.length > 0).length || 0) / wordGoal) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all" 
              style={{ width: `${Math.min(100, ((editingSermon?.content?.trim().split(/\s+/).filter(w => w.length > 0).length || 0) / wordGoal) * 100)}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className={cn("text-sm", isMobile && "text-base")}>Editor Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-save" className={cn("text-sm", isMobile && "text-base")}>Auto-save</Label>
            <Switch
              id="auto-save"
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="focus-mode" className={cn("text-sm", isMobile && "text-base")}>Focus mode</Label>
            <Switch
              id="focus-mode"
              checked={focusMode}
              onCheckedChange={setFocusMode}
            />
          </div>

          <div>
            <Label className={cn("text-sm", isMobile && "text-base")}>Font size: {fontSize}px</Label>
            <Slider
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
              max={24}
              min={12}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className={cn("text-sm", isMobile && "text-base")}>Word goal: {wordGoal}</Label>
            <Slider
              value={[wordGoal]}
              onValueChange={(value) => setWordGoal(value[0])}
              max={5000}
              min={500}
              step={100}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>
    </>
  );

  // Helper function to render right panel content (Bible & AI tabs)
  const renderRightPanelContent = () => (
    <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="h-full flex flex-col">
      <TabsList className={cn("grid grid-cols-2", isMobile ? "m-2 mb-2" : "m-4 mb-0")}>
        <TabsTrigger value="bible" className="gap-2">
          <BookOpen className="h-4 w-4" />
          Bible
        </TabsTrigger>
        <TabsTrigger value="ai" className="gap-2">
          <Bot className="h-4 w-4" />
          AI Chat
        </TabsTrigger>
      </TabsList>

      <TabsContent value="bible" className={cn("flex-1 flex flex-col", isMobile ? "m-2 mt-0" : "m-4 mt-0")}>
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Bible Reference
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4">
            <div className="space-y-2">
              <Select value={selectedTranslation} onValueChange={(value: TranslationCode) => setSelectedTranslation(value)}>
                <SelectTrigger className={cn(isMobile && "text-base")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BIBLE_TRANSLATIONS.filter(t => t.language === 'english').slice(0, 8).map((trans) => (
                    <SelectItem key={trans.code} value={trans.code}>
                      {trans.code} - {trans.name.split(' ').slice(0, 2).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedBook?.name || ''} onValueChange={(bookName) => {
                const book = books.find(b => b.name === bookName);
                if (book) {
                  setSelectedBook(book);
                  setSelectedChapter(1);
                }
              }}>
                <SelectTrigger className={cn(isMobile && "text-base")}>
                  <SelectValue placeholder="Select book" />
                </SelectTrigger>
                <SelectContent>
                  {books.map((book) => (
                    <SelectItem key={book.name} value={book.name}>
                      {book.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedBook && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedChapter(Math.max(1, selectedChapter - 1))}
                    disabled={selectedChapter <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Select value={selectedChapter.toString()} onValueChange={(value) => setSelectedChapter(parseInt(value))}>
                    <SelectTrigger className={cn("flex-1", isMobile && "text-base")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => (
                        <SelectItem key={chapter} value={chapter.toString()}>
                          Chapter {chapter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedChapter(Math.min(selectedBook.chapters, selectedChapter + 1))}
                    disabled={selectedChapter >= selectedBook.chapters}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1">
              {bibleLoading ? (
                <div className="flex justify-center py-4">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {verses.map((verse) => (
                    <div
                      key={verse.id}
                      className={cn(
                        "p-3 rounded-lg border hover:bg-gray-50 cursor-pointer group",
                        isMobile && "p-2"
                      )}
                      onClick={() => insertVerseIntoSermon(verse)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="font-medium text-purple-600 text-sm">
                            {verse.verse}
                          </span>
                          <p className={cn("text-gray-700 mt-1", isMobile ? "text-sm" : "text-sm")}>
                            {verse.text}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            insertVerseIntoSermon(verse);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="ai" className={cn("flex-1 flex flex-col", isMobile ? "m-2 mt-0" : "m-4 mt-0")}>
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 mb-4" ref={aiScrollRef}>
              <div className="space-y-4">
                {aiMessages.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Ask me anything about your sermon!</p>
                  </div>
                )}
                
                {aiMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-3 w-3 text-purple-600" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                      <div className={cn(
                        "rounded-lg px-3 py-2 text-sm",
                        message.role === 'user'
                          ? 'bg-purple-500 text-white ml-auto'
                          : 'bg-gray-100 text-gray-800',
                        isMobile && "text-sm"
                      )}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {aiLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-3 w-3 text-purple-600" />
                    </div>
                    <div className="bg-gray-100 rounded-lg px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="flex gap-2">
              <Input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask about sermon ideas..."
                className={cn(isMobile && "text-base")}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendAIMessage();
                  }
                }}
                disabled={aiLoading}
              />
              <Button
                onClick={sendAIMessage}
                disabled={!aiInput.trim() || aiLoading}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  // If no sermon is being edited, show the sermon dashboard
  if (!editingSermon) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className={cn("max-w-7xl mx-auto", isMobile ? "p-3" : "p-6")}>
          <div className={cn(
            "flex items-center justify-between mb-6",
            isMobile ? "flex-col gap-3 items-start" : ""
          )}>
            <div className="flex items-center gap-3">
              <Mic className={cn("text-purple-600", isMobile ? "h-6 w-6" : "h-8 w-8")} />
              <div>
                <h1 className={cn("font-bold text-gray-800", isMobile ? "text-xl" : "text-2xl")}>Sermon Writer</h1>
                {!isMobile && <p className="text-gray-600">Create and manage your sermons</p>}
              </div>
            </div>
            <Button
              onClick={handleNewSermon}
              className="bg-purple-500 hover:bg-purple-600"
              size={isMobile ? "sm" : "default"}
            >
              <Plus className={cn("h-4 w-4", !isMobile && "mr-2")} />
              {!isMobile && "New Sermon"}
              {isMobile && "New"}
            </Button>
          </div>

          {/* Statistics Dashboard */}
          <div className={cn(
            "grid gap-4 mb-8",
            isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
          )}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-sm text-gray-600">Total Sermons</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.ready}</p>
                    <p className="text-sm text-gray-600">Ready</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Mic className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
                    <p className="text-sm text-gray-600">Delivered</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Edit3 className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.drafts}</p>
                    <p className="text-sm text-gray-600">Drafts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sermons Grid */}
          <div className={cn(
            "grid gap-6",
            isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}>
            {sermons.map((sermon) => (
              <Card key={sermon.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">
                    {sermon.title || "Untitled Sermon"}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={sermon.is_draft ? "secondary" : "default"}>
                      {sermon.is_draft ? "Draft" : "Ready"}
                    </Badge>
                    {sermon.scripture_reference && (
                      <Badge variant="outline" className="text-xs">
                        {sermon.scripture_reference}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {sermon.content || "No content yet..."}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                    <span>{format(new Date(sermon.created_at), 'MMM d, yyyy')}</span>
                                      <span>{sermon.word_count || 0} words</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, ((sermon.word_count || 0) / wordGoal) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingSermon(sermon);
                      setIsEditing(true);
                    }}
                    className="flex-1"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {sermons.length === 0 && !loading && (
            <div className="text-center py-12">
              <Mic className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">No sermons yet</h2>
              <p className="text-gray-500 mb-4">Start writing your first sermon!</p>
              <Button onClick={handleNewSermon} className="bg-purple-500 hover:bg-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                Create New Sermon
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full-page sermon editor
  return (
    <div className={cn(
      isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen',
      'bg-white flex flex-col',
      isMobile && 'pb-16' // Add padding for mobile bottom toolbar
    )}>
      {/* Header - Mobile Optimized */}
      <div className={cn(
        "border-b bg-white flex-shrink-0",
        isMobile ? "px-3 py-2" : "px-6 py-4"
      )}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Button
              variant="ghost"
              size={isMobile ? "sm" : "default"}
              onClick={() => setEditingSermon(null)}
              className={cn(
                isMobile && "px-2"
              )}
            >
              <ChevronLeft className={cn("h-4 w-4", !isMobile && "mr-2")} />
              {!isMobile && "Back to Sermons"}
            </Button>
            {!isMobile && <Separator orientation="vertical" className="h-6" />}
            <div className="flex items-center gap-2 min-w-0">
              <Mic className={cn("text-purple-600 flex-shrink-0", isMobile ? "h-5 w-5" : "h-6 w-6")} />
              <h1 className={cn(
                "font-semibold truncate",
                isMobile ? "text-base" : "text-xl"
              )}>
                {isEditing ? 'Edit Sermon' : 'New Sermon'}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Mobile: Use Sheets for sidebars */}
            {isMobile ? (
              <>
                <Sheet open={mobileLeftSheetOpen} onOpenChange={setMobileLeftSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="px-2">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[85vw] sm:w-[400px] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Sermon Details</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 space-y-4">
                      {/* Left Panel Content */}
                      {renderLeftPanelContent()}
                    </div>
                  </SheetContent>
                </Sheet>
                
                <Sheet open={mobileRightSheetOpen} onOpenChange={setMobileRightSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="px-2">
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[85vw] sm:w-[400px] overflow-hidden p-0 flex flex-col">
                    <SheetHeader className="px-4 pt-4 pb-2 border-b">
                      <SheetTitle>
                        {activeRightTab === 'bible' ? 'Bible Reference' : 'AI Assistant'}
                      </SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto">
                      {renderRightPanelContent()}
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRightPanelOpen(!rightPanelOpen)}
                >
                  <PanelRightOpen className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </>
            )}
            
            {!isMobile && <Separator orientation="vertical" className="h-6" />}
            <Button
              onClick={handleSaveClick}
              disabled={saving}
              size={isMobile ? "sm" : "default"}
              className={cn(
                "bg-purple-500 hover:bg-purple-600",
                isMobile && "px-3"
              )}
            >
              {saving ? (
                <RefreshCw className={cn("animate-spin", isMobile ? "h-4 w-4" : "h-4 w-4 mr-2")} />
              ) : (
                <Save className={cn(isMobile ? "h-4 w-4" : "h-4 w-4 mr-2")} />
              )}
              {!isMobile && "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Sermon Details (Desktop) */}
        {!isMobile && leftPanelOpen && (
          <div className="w-80 border-r bg-gray-50 p-4 space-y-4 overflow-y-auto flex-shrink-0">
            {renderLeftPanelContent()}
          </div>
        )}


        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          <SermonToolbar
            editorRef={editorRef}
            onFormatText={handleFormatText}
            wordCount={editingSermon?.content?.trim().split(/\s+/).filter(w => w.length > 0).length || 0}
            estimatedTime={Math.ceil((editingSermon?.content?.trim().split(/\s+/).filter(w => w.length > 0).length || 0) / 150)}
            sermonContent={editingSermon?.content || ''}
            sermonTitle={editingSermon?.title || ''}
            onExport={handleExportSermon}
            onInsertQuickText={insertQuickText}
          />
          <div className={cn(
            "flex-1",
            isMobile ? "p-3" : "p-6",
            focusMode ? 'bg-gray-100' : ''
          )}>
            <Textarea
              ref={editorRef}
              placeholder="Write your sermon content here..."
              value={editingSermon?.content || ''}
              onChange={(e) => setEditingSermon(prev => ({ ...prev, content: e.target.value }))}
              className={cn(
                "w-full h-full resize-none border-0 focus:ring-0 leading-relaxed",
                focusMode ? 'bg-white shadow-lg rounded-lg' : '',
                isMobile ? 'p-4 text-base' : 'p-8' // Larger text on mobile, prevent zoom
              )}
              style={{ 
                minHeight: isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 250px)',
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                maxWidth: focusMode ? '800px' : '100%',
                margin: focusMode ? '0 auto' : '0'
              }}
            />
          </div>
        </div>

        {/* Right Panel - Bible & AI (Desktop) */}
        {!isMobile && rightPanelOpen && (
          <div className="w-96 border-l bg-white overflow-hidden flex-shrink-0">
            {renderRightPanelContent()}
          </div>
        )}
      </div>
    </div>
  );
};

export default SermonWriter; 