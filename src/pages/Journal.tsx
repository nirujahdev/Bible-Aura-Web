import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedJournalEditor } from "@/components/EnhancedJournalEditor";
import { 
  BookOpen, Plus, Edit3, Trash2, Search, FileText, 
  Save, Calendar as CalendarIcon, Quote, X, ChevronDown,
  ChevronLeft, ChevronRight, Briefcase, PartyPopper,
  User, MapPin, GraduationCap, Users, Heart,
  Filter, Clock, Hand as Pray, Sparkles, Book,
  Copy, Pin, Feather, AlertCircle, PenTool,
  BarChart3, TrendingUp, Award, Zap, Eye,
  Settings, Palette, Star, Target, CheckCircle2,
  ArrowRight, RefreshCw, Archive, Grid3X3, List,
  Share2, Download, Upload
} from "lucide-react";
import { getAllBooks, getChapterVerses } from "@/lib/local-bible";
import type { Json } from "@/integrations/supabase/types";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  category?: string;
  verse_reference?: string;
  verse_text?: string;
  mood?: string;
  spiritual_state?: string;
  entry_date?: string;
  created_at: string;
  updated_at: string;
  is_pinned?: boolean;
  is_private?: boolean;
  tags?: string[];
  word_count?: number;
  reading_time?: number;
  template_used?: string;
  metadata?: Json;
}

interface JournalStats {
  totalEntries: number;
  thisMonth: number;
  totalWords: number;
  avgWordsPerEntry: number;
  entriesWithVerses: number;
  currentStreak: number;
  favoriteCategory: string;
  topMoods: Array<{ mood: string; count: number }>;
}

const categories = [
  { id: 'personal', name: 'Personal', icon: User, color: 'bg-purple-100 text-purple-800', gradient: 'from-purple-400 to-purple-600' },
  { id: 'prayer', name: 'Prayer', icon: Pray, color: 'bg-indigo-100 text-indigo-800', gradient: 'from-indigo-400 to-indigo-600' },
  { id: 'gratitude', name: 'Gratitude', icon: Heart, color: 'bg-pink-100 text-pink-800', gradient: 'from-pink-400 to-pink-600' },
  { id: 'bible-study', name: 'Bible Study', icon: Book, color: 'bg-blue-100 text-blue-800', gradient: 'from-blue-400 to-blue-600' },
  { id: 'devotional', name: 'Devotional', icon: Sparkles, color: 'bg-violet-100 text-violet-800', gradient: 'from-violet-400 to-violet-600' },
  { id: 'work', name: 'Work', icon: Briefcase, color: 'bg-gray-100 text-gray-800', gradient: 'from-gray-400 to-gray-600' },
  { id: 'events', name: 'Events', icon: PartyPopper, color: 'bg-orange-100 text-orange-800', gradient: 'from-orange-400 to-orange-600' },
  { id: 'trips', name: 'Trips', icon: MapPin, color: 'bg-green-100 text-green-800', gradient: 'from-green-400 to-green-600' },
];

const moods = [
  { value: "joyful", label: "😊 Joyful", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "peaceful", label: "😌 Peaceful", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "grateful", label: "🙏 Grateful", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "contemplative", label: "🤔 Contemplative", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "hopeful", label: "✨ Hopeful", color: "bg-pink-100 text-pink-800 border-pink-200" },
  { value: "blessed", label: "🙌 Blessed", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { value: "reflective", label: "📝 Reflective", color: "bg-violet-100 text-violet-800 border-violet-200" },
  { value: "worship", label: "🎵 Worship", color: "bg-rose-100 text-rose-800 border-rose-200" }
];

const journalTemplates = [
  {
    id: 'daily-reflection',
    name: 'Daily Reflection',
    icon: '📝',
    description: 'A structured daily reflection template',
    color: 'bg-gradient-to-r from-purple-500 to-indigo-600',
    prompts: [
      'What did I learn about God today?',
      'How did I see God working in my life?',
      'What am I grateful for?',
      'What challenges did I face and how did faith help?',
      'Prayer requests for tomorrow:'
    ]
  },
  {
    id: 'bible-study',
    name: 'Bible Study',
    icon: '📖',
    description: 'Deep dive into scripture study',
    color: 'bg-gradient-to-r from-blue-500 to-purple-600',
    prompts: [
      'Scripture passage studied:',
      'Key insights and revelations:',
      'How does this apply to my life?',
      'Questions for further study:',
      'Prayer based on this passage:'
    ]
  },
  {
    id: 'prayer-journal',
    name: 'Prayer Journal',
    icon: '🙏',
    description: 'Focused prayer and intercession',
    color: 'bg-gradient-to-r from-indigo-500 to-purple-600',
    prompts: [
      'Personal prayer requests:',
      'Prayers for family and friends:',
      'Prayers for church and community:',
      'Prayers answered recently:',
      'Scripture promises to claim:'
    ]
  },
  {
    id: 'gratitude',
    name: 'Gratitude',
    icon: '💝',
    description: 'Counting blessings and giving thanks',
    color: 'bg-gradient-to-r from-pink-500 to-purple-600',
    prompts: [
      'Three things I\'m grateful for today:',
      'God\'s provision I noticed:',
      'Relationships I\'m thankful for:',
      'Challenges that became blessings:',
      'Ways to express gratitude:'
    ]
  }
];

const Journal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Core state
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<JournalStats>({
    totalEntries: 0,
    thisMonth: 0,
    totalWords: 0,
    avgWordsPerEntry: 0,
    entriesWithVerses: 0,
    currentStreak: 0,
    favoriteCategory: 'personal',
    topMoods: []
  });
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [activeView, setActiveView] = useState<'dashboard' | 'entries' | 'calendar' | 'analytics'>('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showNewEntryEditor, setShowNewEntryEditor] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  useEffect(() => {
    filterEntries();
    calculateStats();
  }, [entries, selectedCategory, selectedMood, searchQuery]);

  const loadEntries = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const processedEntries = data?.map(entry => ({
        ...entry,
        tags: entry.metadata?.tags || [],
        word_count: entry.metadata?.word_count || 0,
        reading_time: entry.metadata?.reading_time || 0,
        template_used: entry.metadata?.template_used || null
      })) || [];
      
      setEntries(processedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
      setError('Failed to load journal entries. Please try again.');
      toast({
        title: "Error loading entries",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = entries;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(entry => entry.category === selectedCategory);
    }

    if (selectedMood !== 'all') {
      filtered = filtered.filter(entry => entry.mood === selectedMood);
    }

    if (searchQuery) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredEntries(filtered);
  };

  const calculateStats = () => {
    const now = new Date();
    const thisMonth = entries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
    });

    const totalWords = entries.reduce((sum, entry) => sum + (entry.word_count || 0), 0);
    const entriesWithVerses = entries.filter(entry => entry.verse_reference).length;

    // Calculate mood distribution
    const moodCounts = entries.reduce((acc, entry) => {
      if (entry.mood) {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topMoods = Object.entries(moodCounts)
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Calculate favorite category
    const categoryCounts = entries.reduce((acc, entry) => {
      const category = entry.category || 'personal';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteCategory = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'personal';

    setStats({
      totalEntries: entries.length,
      thisMonth: thisMonth.length,
      totalWords,
      avgWordsPerEntry: entries.length > 0 ? Math.round(totalWords / entries.length) : 0,
      entriesWithVerses,
      currentStreak: 3, // TODO: Calculate actual streak
      favoriteCategory,
      topMoods
    });
  };

  const handleSaveEntry = async (entryData: any) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const metadata = {
        tags: entryData.tags || [],
        word_count: entryData.word_count || 0,
        reading_time: entryData.reading_time || 0,
        template_used: entryData.template_used || null,
        spiritual_state: entryData.spiritual_state || null
      };

      const dbEntry = {
        user_id: user.id,
        title: entryData.title,
        content: entryData.content,
        category: entryData.category || 'personal',
        mood: entryData.mood,
        verse_reference: entryData.verse_references?.join(', ') || null,
        entry_date: entryData.entry_date,
        is_private: entryData.is_private ?? true,
        is_pinned: false,
        metadata,
        updated_at: new Date().toISOString()
      };

      if (editingEntry) {
        const { error } = await supabase
          .from('journal_entries')
          .update(dbEntry)
          .eq('id', editingEntry.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast({ title: "Entry updated successfully" });
      } else {
        const { error } = await supabase
          .from('journal_entries')
          .insert(dbEntry);

        if (error) throw error;
        toast({ title: "Entry created successfully" });
      }

      setShowNewEntryEditor(false);
      setShowEditDialog(false);
      setEditingEntry(null);
      loadEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Error saving entry",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({ title: "Entry deleted successfully" });
      setSelectedEntry(null);
      loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error deleting entry",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const togglePin = async (entry: JournalEntry) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({ is_pinned: !entry.is_pinned })
        .eq('id', entry.id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({
        title: entry.is_pinned ? "Entry unpinned" : "Entry pinned",
        description: entry.title,
      });
      
      loadEntries();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const openTemplateDialog = () => {
    setShowTemplateDialog(true);
  };

  const selectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowTemplateDialog(false);
    setShowNewEntryEditor(true);
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : FileText;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : 'bg-gray-100 text-gray-800';
  };

  const getMoodColor = (moodValue: string) => {
    const mood = moods.find(m => m.value === moodValue);
    return mood ? mood.color : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-900">
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-purple-200">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-purple-600" />
              <h2 className="text-2xl font-bold mb-2 text-gray-800">Journal Access Required</h2>
              <p className="text-gray-600 mb-4">
                Please sign in to access your personal spiritual journal.
              </p>
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showNewEntryEditor) {
    const template = selectedTemplate ? journalTemplates.find(t => t.id === selectedTemplate) : null;
    return (
      <EnhancedJournalEditor
        initialEntry={template ? {
          title: '',
          content: template.prompts.map((prompt, i) => `${i + 1}. ${prompt}\n\n`).join(''),
          mood: null,
          spiritual_state: null,
          verse_references: [],
          tags: template ? [template.name] : [],
          is_private: true,
          entry_date: new Date().toISOString().split('T')[0]
        } : {}}
        onSave={handleSaveEntry}
        onCancel={() => {
          setShowNewEntryEditor(false);
          setSelectedTemplate(null);
        }}
        isEditing={false}
      />
    );
  }

  if (showEditDialog && editingEntry) {
    return (
      <EnhancedJournalEditor
        initialEntry={{
          ...editingEntry,
          verse_references: editingEntry.verse_reference ? [editingEntry.verse_reference] : [],
          tags: editingEntry.tags || []
        }}
        onSave={handleSaveEntry}
        onCancel={() => {
          setShowEditDialog(false);
          setEditingEntry(null);
        }}
        isEditing={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-900">
      {/* Glass morphism background overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                My Spiritual Journal
              </h1>
              <p className="text-xl text-purple-100">
                Document your faith journey and spiritual growth
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={openTemplateDialog}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Entry
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2 mb-6 p-1 bg-white/10 backdrop-blur-sm rounded-lg">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
              { id: 'entries', name: 'All Entries', icon: List },
              { id: 'calendar', name: 'Calendar', icon: CalendarIcon },
              { id: 'analytics', name: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeView === tab.id ? "secondary" : "ghost"}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center gap-2 ${
                  activeView === tab.id 
                    ? 'bg-white text-purple-900 shadow-md' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Template Selection Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                Choose a Journal Template
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-purple-300"
                onClick={() => {
                  setSelectedTemplate(null);
                  setShowTemplateDialog(false);
                  setShowNewEntryEditor(true);
                }}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">✨</div>
                  <h3 className="text-lg font-semibold mb-2">Blank Entry</h3>
                  <p className="text-gray-600 text-sm">Start with a clean slate</p>
                </CardContent>
              </Card>

              {journalTemplates.map((template) => (
                <Card 
                  key={template.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-purple-300"
                  onClick={() => selectTemplate(template.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{template.icon}</div>
                    <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                    <p className="text-gray-600 text-sm">{template.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <Card className="bg-white/95 backdrop-blur-sm border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Entries</span>
                  <span className="font-semibold text-lg">{stats.totalEntries}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-semibold text-lg text-purple-600">{stats.thisMonth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Words</span>
                  <span className="font-semibold text-lg">{stats.totalWords.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">With Verses</span>
                  <span className="font-semibold text-lg text-indigo-600">{stats.entriesWithVerses}</span>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="bg-white/95 backdrop-blur-sm border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5 text-purple-600" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Mood</label>
                  <Select value={selectedMood} onValueChange={setSelectedMood}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Moods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Moods</SelectItem>
                      {moods.map(mood => (
                        <SelectItem key={mood.value} value={mood.value}>
                          {mood.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Top Moods */}
            <Card className="bg-white/95 backdrop-blur-sm border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-purple-600" />
                  Top Moods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.topMoods.map(({ mood, count }) => {
                  const moodData = moods.find(m => m.value === mood);
                  return (
                    <div key={mood} className="flex items-center justify-between">
                      <Badge className={getMoodColor(mood)}>
                        {moodData?.label || mood}
                      </Badge>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeView === 'dashboard' && (
              <div className="space-y-6">
                {/* Dashboard Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100">Total Entries</p>
                          <p className="text-3xl font-bold">{stats.totalEntries}</p>
                        </div>
                        <BookOpen className="h-12 w-12 text-purple-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-indigo-100">This Month</p>
                          <p className="text-3xl font-bold">{stats.thisMonth}</p>
                        </div>
                        <TrendingUp className="h-12 w-12 text-indigo-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100">Current Streak</p>
                          <p className="text-3xl font-bold">{stats.currentStreak}</p>
                        </div>
                        <Zap className="h-12 w-12 text-purple-200" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Entries */}
                <Card className="bg-white/95 backdrop-blur-sm border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Clock className="h-6 w-6 text-purple-600" />
                      Recent Entries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {entries.slice(0, 5).length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 mb-4">No journal entries yet</p>
                        <Button onClick={openTemplateDialog} className="bg-purple-600 hover:bg-purple-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Entry
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {entries.slice(0, 5).map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => setSelectedEntry(entry)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{entry.title}</h3>
                                {entry.is_pinned && <Pin className="h-4 w-4 text-purple-600" />}
                              </div>
                              <p className="text-gray-600 text-sm line-clamp-2">{entry.content}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={getCategoryColor(entry.category || 'personal')} variant="secondary">
                                  {categories.find(cat => cat.id === entry.category)?.name || 'Personal'}
                                </Badge>
                                {entry.mood && (
                                  <Badge className={getMoodColor(entry.mood)} variant="outline">
                                    {moods.find(m => m.value === entry.mood)?.label || entry.mood}
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                  {formatDate(entry.created_at)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingEntry(entry);
                                  setShowEditDialog(true);
                                }}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeView === 'entries' && (
              <Card className="bg-white/95 backdrop-blur-sm border-purple-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <List className="h-6 w-6 text-purple-600" />
                      All Entries ({filteredEntries.length})
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === 'list' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
                    </div>
                  ) : filteredEntries.length === 0 ? (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 mb-4">No entries match your current filters</p>
                      <Button 
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                          setSelectedMood('all');
                        }}
                        variant="outline"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                      {filteredEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="p-4 rounded-lg border hover:shadow-md cursor-pointer transition-all duration-200 hover:border-purple-300"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{entry.title}</h3>
                              {entry.is_pinned && <Pin className="h-4 w-4 text-purple-600" />}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePin(entry);
                                }}
                              >
                                <Pin className={`h-4 w-4 ${entry.is_pinned ? 'text-purple-600' : 'text-gray-400'}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingEntry(entry);
                                  setShowEditDialog(true);
                                }}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEntry(entry.id);
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mb-3 line-clamp-3">{entry.content}</p>
                          
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge className={getCategoryColor(entry.category || 'personal')} variant="secondary">
                              {categories.find(cat => cat.id === entry.category)?.name || 'Personal'}
                            </Badge>
                            {entry.mood && (
                              <Badge className={getMoodColor(entry.mood)} variant="outline">
                                {moods.find(m => m.value === entry.mood)?.label || entry.mood}
                              </Badge>
                            )}
                            {entry.verse_reference && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <Book className="h-3 w-3 mr-1" />
                                Verse
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{formatDate(entry.created_at)}</span>
                            <div className="flex items-center gap-4">
                              {entry.word_count && (
                                <span>{entry.word_count} words</span>
                              )}
                              {entry.reading_time && (
                                <span>{entry.reading_time} min read</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeView === 'calendar' && (
              <Card className="bg-white/95 backdrop-blur-sm border-purple-200">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <CalendarIcon className="h-6 w-6 text-purple-600" />
                    Calendar View
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Calendar view coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeView === 'analytics' && (
              <Card className="bg-white/95 backdrop-blur-sm border-purple-200">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                    Analytics & Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Advanced analytics coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Entry Detail Modal */}
        {selectedEntry && (
          <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <Eye className="h-6 w-6 text-purple-600" />
                    {selectedEntry.title}
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingEntry(selectedEntry);
                        setSelectedEntry(null);
                        setShowEditDialog(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePin(selectedEntry)}
                    >
                      <Pin className={`h-4 w-4 mr-2 ${selectedEntry.is_pinned ? 'text-purple-600' : ''}`} />
                      {selectedEntry.is_pinned ? 'Unpin' : 'Pin'}
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Entry metadata */}
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className={getCategoryColor(selectedEntry.category || 'personal')} variant="secondary">
                    {categories.find(cat => cat.id === selectedEntry.category)?.name || 'Personal'}
                  </Badge>
                  {selectedEntry.mood && (
                    <Badge className={getMoodColor(selectedEntry.mood)} variant="outline">
                      {moods.find(m => m.value === selectedEntry.mood)?.label || selectedEntry.mood}
                    </Badge>
                  )}
                  <span className="text-sm text-gray-500">
                    Created {formatDate(selectedEntry.created_at)}
                  </span>
                </div>

                {/* Verse reference */}
                {selectedEntry.verse_reference && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Book className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-blue-800">{selectedEntry.verse_reference}</span>
                      </div>
                      {selectedEntry.verse_text && (
                        <p className="text-blue-700 italic">"{selectedEntry.verse_text}"</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Entry content */}
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {selectedEntry.content}
                  </div>
                </div>

                {/* Tags */}
                {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                {(selectedEntry.word_count || selectedEntry.reading_time) && (
                  <div className="flex items-center gap-6 text-sm text-gray-500 pt-4 border-t">
                    {selectedEntry.word_count && (
                      <span>{selectedEntry.word_count} words</span>
                    )}
                    {selectedEntry.reading_time && (
                      <span>{selectedEntry.reading_time} minute read</span>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Journal;