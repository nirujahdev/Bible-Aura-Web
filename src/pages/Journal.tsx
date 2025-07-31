import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, Plus, Edit3, Trash2, Search, FileText, 
  Save, Calendar as CalendarIcon, Quote, X, Menu,
  User, MapPin, Briefcase, PartyPopper, Heart,
  Filter, Clock, Hand as Pray, Sparkles, Book,
  ChevronLeft, ChevronRight, Settings, Star,
  RefreshCw, AlertCircle, MoreHorizontal, Pin
} from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  category?: string;
  verse_reference?: string;
  verse_text?: string;
  mood?: string;
  entry_date?: string;
  created_at: string;
  updated_at: string;
  is_pinned?: boolean;
  metadata?: Json;
  user_id: string;
}

const categories = [
  { id: 'work', name: 'Work', icon: Briefcase, color: 'text-orange-600 bg-orange-50' },
  { id: 'events', name: 'Events', icon: PartyPopper, color: 'text-orange-600 bg-orange-50' },
  { id: 'personal', name: 'Personal', icon: User, color: 'text-orange-600 bg-orange-50' },
  { id: 'trips', name: 'Trips', icon: MapPin, color: 'text-orange-600 bg-orange-50' },
  { id: 'education', name: 'Education', icon: BookOpen, color: 'text-orange-600 bg-orange-50' },
  { id: 'social', name: 'Social', icon: Heart, color: 'text-orange-600 bg-orange-50' },
];

const moods = [
  { value: "joyful", label: "😊 Joyful", color: "bg-orange-50 text-orange-800" },
  { value: "peaceful", label: "😌 Peaceful", color: "bg-orange-100 text-orange-800" },
  { value: "grateful", label: "🙏 Grateful", color: "bg-orange-200 text-orange-900" },
  { value: "contemplative", label: "🤔 Contemplative", color: "bg-orange-300 text-orange-900" },
  { value: "hopeful", label: "✨ Hopeful", color: "bg-orange-400 text-white" },
  { value: "blessed", label: "🙌 Blessed", color: "bg-orange-500 text-white" },
];

const Journal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Core state
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Entry form state
  const [showNewEntryDialog, setShowNewEntryDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [entryTitle, setEntryTitle] = useState("");
  const [entryContent, setEntryContent] = useState("");
  const [entryCategory, setEntryCategory] = useState("personal");
  const [entryMood, setEntryMood] = useState("");

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  useEffect(() => {
    filterEntries();
  }, [entries, selectedCategory, searchQuery]);

  const loadEntries = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading entries for user:', user.id);
      
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Loaded entries:', data?.length || 0);
      setEntries(data || []);
      
      // Auto-select first entry if none selected
      if (data && data.length > 0 && !selectedEntry) {
        setSelectedEntry(data[0]);
      }
      
    } catch (error) {
      console.error('Error loading entries:', error);
      setError('Failed to load journal entries');
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

    if (searchQuery) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEntries(filtered);
  };

  const handleSaveEntry = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save journal entries",
        variant: "destructive",
      });
      return;
    }

    if (!entryTitle.trim() || !entryContent.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both title and content",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const entryData = {
        user_id: user.id,
        title: entryTitle.trim(),
        content: entryContent.trim(),
        category: entryCategory,
        mood: entryMood || null,
        entry_date: selectedDate.toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
        metadata: {}
      };

      if (editingEntry) {
        const { error } = await supabase
          .from('journal_entries')
          .update(entryData)
          .eq('id', editingEntry.id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast({
          title: "Entry updated",
          description: "Your journal entry has been saved successfully",
        });
      } else {
        const { data, error } = await supabase
          .from('journal_entries')
          .insert(entryData)
          .select()
          .single();

        if (error) throw error;
        
        toast({
          title: "Entry created",
          description: "Your new journal entry has been saved",
        });
      }

      closeEntryDialog();
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
      
      toast({
        title: "Entry deleted",
        description: "Your journal entry has been deleted",
      });
      
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

  const openEntryDialog = (entry?: JournalEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setEntryTitle(entry.title);
      setEntryContent(entry.content);
      setEntryCategory(entry.category || 'personal');
      setEntryMood(entry.mood || '');
    } else {
      setEditingEntry(null);
      setEntryTitle("");
      setEntryContent("");
      setEntryCategory("personal");
      setEntryMood("");
    }
    setShowNewEntryDialog(true);
  };

  const closeEntryDialog = () => {
    setShowNewEntryDialog(false);
    setEditingEntry(null);
    setEntryTitle("");
    setEntryContent("");
    setEntryCategory("personal");
    setEntryMood("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const entryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (entryDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (entryDate.getTime() === today.getTime() - 86400000) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' })
    };
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : FileText;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-lg">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-orange-500" />
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Journal Access Required</h2>
            <p className="text-gray-600 mb-4">
              Please sign in to access your personal journal.
            </p>
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Left Sidebar - Categories & Calendar */}
        <div className="w-64 bg-white border-r border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Journals</h2>
          
          {/* Categories */}
          <div className="space-y-2 mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-orange-50 text-orange-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Entries
            </button>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-orange-50 text-orange-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* Add New Button */}
          <Button
            onClick={() => openEntryDialog()}
            className="w-full mb-8 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add new
          </Button>

          {/* Mini Calendar */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="w-full"
              classNames={{
                months: "w-full",
                month: "w-full",
                table: "w-full border-collapse",
                head_row: "flex w-full",
                head_cell: "text-gray-500 rounded-md w-8 font-normal text-xs",
                row: "flex w-full mt-1",
                cell: "text-center text-sm p-0 relative w-8 h-8",
                day: "h-8 w-8 p-0 font-normal",
                day_selected: "bg-orange-500 text-white hover:bg-orange-600",
                day_today: "bg-orange-50 text-orange-600",
                day_outside: "text-gray-300",
              }}
            />
          </div>
        </div>

        {/* Middle Panel - Entry List */}
        <div className="w-96 bg-white border-r border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {formatDate(selectedDate.toISOString())}
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 focus:border-orange-300 focus:ring-orange-200"
              />
            </div>
          </div>

          {/* Entry List */}
          <div className="overflow-y-auto h-[calc(100vh-200px)]">
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="p-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">No entries found</p>
                <Button onClick={() => openEntryDialog()} size="sm" className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Entry
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredEntries.map((entry) => {
                  const dateInfo = formatShortDate(entry.created_at);
                  return (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedEntry?.id === entry.id ? 'bg-orange-50 border-r-2 border-orange-500' : ''
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center text-center min-w-[40px]">
                          <span className="text-2xl font-bold text-gray-800">{dateInfo.day}</span>
                          <span className="text-xs text-gray-500 uppercase">{dateInfo.weekday}</span>
                          {entry.is_pinned && <Star className="h-3 w-3 text-orange-500 mt-1" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate">{entry.title}</h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{entry.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {entry.category && (
                              <Badge variant="secondary" className="text-xs bg-orange-50 text-orange-600">
                                {categories.find(cat => cat.id === entry.category)?.name || entry.category}
                              </Badge>
                            )}
                            {entry.mood && (
                              <Badge variant="outline" className="text-xs">
                                {moods.find(m => m.value === entry.mood)?.label || entry.mood}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Entry Detail */}
        <div className="flex-1 bg-white">
          {selectedEntry ? (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-800">{selectedEntry.title}</h1>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEntryDialog(selectedEntry)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEntry(selectedEntry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{formatDate(selectedEntry.created_at)}</span>
                  {selectedEntry.category && (
                    <Badge variant="secondary" className="bg-orange-50 text-orange-600">
                      {categories.find(cat => cat.id === selectedEntry.category)?.name || selectedEntry.category}
                    </Badge>
                  )}
                  {selectedEntry.mood && (
                    <Badge variant="outline">
                      {moods.find(m => m.value === selectedEntry.mood)?.label || selectedEntry.mood}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {selectedEntry.content}
                  </div>
                </div>

                {/* Verse Reference */}
                {selectedEntry.verse_reference && (
                  <div className="mt-6 p-4 bg-orange-50 border-l-4 border-orange-300 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Book className="h-5 w-5 text-orange-600" />
                      <span className="font-semibold text-orange-800">{selectedEntry.verse_reference}</span>
                    </div>
                    {selectedEntry.verse_text && (
                      <p className="text-orange-700 italic">"{selectedEntry.verse_text}"</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">No Entry Selected</h2>
                <p className="text-gray-500">Select an entry from the list to view its content</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New/Edit Entry Dialog */}
      <Dialog open={showNewEntryDialog} onOpenChange={(open) => !open && closeEntryDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={entryTitle}
                onChange={(e) => setEntryTitle(e.target.value)}
                placeholder="Enter a title for your entry..."
                className="border-gray-200 focus:border-orange-300 focus:ring-orange-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select value={entryCategory} onValueChange={setEntryCategory}>
                  <SelectTrigger className="border-gray-200 focus:border-orange-300 focus:ring-orange-200">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mood (optional)</label>
                <Select value={entryMood} onValueChange={setEntryMood}>
                  <SelectTrigger className="border-gray-200 focus:border-orange-300 focus:ring-orange-200">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No mood</SelectItem>
                    {moods.map(mood => (
                      <SelectItem key={mood.value} value={mood.value}>
                        {mood.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <Textarea
                value={entryContent}
                onChange={(e) => setEntryContent(e.target.value)}
                placeholder="Write your thoughts, reflections, prayers..."
                className="min-h-[300px] border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                rows={12}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={closeEntryDialog}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEntry}
                disabled={loading || !entryTitle.trim() || !entryContent.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingEntry ? 'Update Entry' : 'Save Entry'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Journal;