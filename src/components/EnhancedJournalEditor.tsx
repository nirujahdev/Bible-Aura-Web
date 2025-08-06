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
import { 
  Save, X, Bold, Italic, List, RefreshCw, Settings
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

interface EnhancedJournalEditorProps {
  initialEntry?: Partial<JournalEntryForm>;
  onSave: (entry: JournalEntryForm) => void;
  onCancel: () => void;
  isEditing?: boolean;
  templateData?: any; // Add templateData prop for daily devotion templates
}

export function EnhancedJournalEditor({
  initialEntry,
  onSave,
  onCancel,
  isEditing = false,
  templateData
}: EnhancedJournalEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Core states - initialize with template data if provided
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
    ...initialEntry,
    ...(templateData || {}) // Apply template data if provided
  });

  // UI states
  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);

  // Writing stats
  const [stats, setStats] = useState<WritingStats>({
    wordCount: 0,
    charCount: 0,
    readingTime: 0,
    paragraphs: 0
  });

  // Constants
  const CATEGORIES = [
    { id: 'personal', name: 'Personal', icon: '📖' },
    { id: 'study', name: 'Study', icon: '🔍' },
    { id: 'prayer', name: 'Prayer', icon: '🙏' },
    { id: 'devotion', name: 'Devotion', icon: '🌅' }, // Add devotion category
  ];

  // Handle template data initialization
  useEffect(() => {
    if (templateData) {
      setEntry(prev => ({
        ...prev,
        ...templateData
      }));
    }
  }, [templateData]);

  // Calculate writing stats
  useEffect(() => {
    const content = entry.content || '';
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    const paragraphs = content.split('\n\n').filter(p => p.trim()).length;
    const readingTime = Math.max(1, Math.ceil(words / 200)); // 200 words per minute

    setStats({
      wordCount: words,
      charCount: chars,
      readingTime,
      paragraphs
    });
  }, [entry.content]);

  const handleSave = async () => {
    if (!entry.title?.trim() || !entry.content?.trim()) {
      toast({
        title: "Missing information",
        description: "Please add a title and content to your journal entry",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const finalEntry: JournalEntryForm = {
        title: entry.title.trim(),
        content: entry.content.trim(),
        mood: entry.mood,
        spiritual_state: entry.spiritual_state,
        verse_references: entry.verse_references || [],
        tags: entry.tags || [],
        is_private: entry.is_private !== undefined ? entry.is_private : true,
        entry_date: entry.entry_date || new Date().toISOString().split('T')[0],
        word_count: stats.wordCount,
        reading_time: stats.readingTime,
        language: entry.language || 'english',
        category: entry.category || 'personal',
        metadata: entry.metadata,
        is_pinned: entry.is_pinned || false,
        template_used: entry.template_used
      };

      await onSave(finalEntry);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
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
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3 flex-1">
          <Button
            onClick={onCancel}
            variant="ghost"
            className="p-2"
          >
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Edit Entry' : 'New Journal Entry'}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              onClick={() => setShowSettings(!showSettings)}
              className="p-2"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            onClick={handleSave}
            disabled={saving || !entry.title?.trim() || !entry.content?.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          
          {/* Title Input */}
          <div className="p-6 border-b border-gray-200">
            <Input
              placeholder="Entry title..."
              value={entry.title || ''}
              onChange={(e) => setEntry(prev => ({ ...prev, title: e.target.value }))}
              className="text-2xl font-bold border-0 shadow-none px-0 focus-visible:ring-0 placeholder:text-gray-400"
              autoFocus={!isMobile}
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('bold')}
                className="p-2 hover:bg-gray-200"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('italic')}
                className="p-2 hover:bg-gray-200"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('bullet')}
                className="p-2 hover:bg-gray-200"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{stats.wordCount} words</span>
              <span>{stats.readingTime} min read</span>
            </div>
          </div>

          {/* Content Editor */}
          <div className="flex-1 p-6 overflow-y-auto">
            <Textarea
              ref={textareaRef}
              placeholder="Write your thoughts, prayers, and reflections here..."
              value={entry.content || ''}
              onChange={(e) => setEntry(prev => ({ ...prev, content: e.target.value }))}
              className="w-full h-full min-h-[400px] border-0 shadow-none resize-none focus-visible:ring-0 text-lg leading-relaxed"
              style={{
                fontSize: isMobile ? '16px' : '18px',
                fontFamily: 'Inter, system-ui, sans-serif'
              }}
            />
          </div>

          {/* Mobile Settings Panel */}
          {isMobile && showSettings && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Category</Label>
                  <Select 
                    value={entry.category || 'personal'} 
                    onValueChange={(value) => setEntry(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">Private Entry</Label>
                  <Switch 
                    checked={entry.is_private !== false}
                    onCheckedChange={(checked) => setEntry(prev => ({ ...prev, is_private: checked }))}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="w-80 border-l border-gray-200 bg-gray-50 p-6 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Category</Label>
                <Select 
                  value={entry.category || 'personal'} 
                  onValueChange={(value) => setEntry(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Private Entry</Label>
                <Switch 
                  checked={entry.is_private !== false}
                  onCheckedChange={(checked) => setEntry(prev => ({ ...prev, is_private: checked }))}
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Entry Date</Label>
                <Input
                  type="date"
                  value={entry.entry_date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEntry(prev => ({ ...prev, entry_date: e.target.value }))}
                />
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Writing Stats</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between">
                    <span>Words:</span>
                    <span className="font-medium">{stats.wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Characters:</span>
                    <span className="font-medium">{stats.charCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reading time:</span>
                    <span className="font-medium">{stats.readingTime} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paragraphs:</span>
                    <span className="font-medium">{stats.paragraphs}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

      </div>
    </div>
  );
} 