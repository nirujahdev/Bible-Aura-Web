import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, Plus, Edit3, Trash2, Search, 
  Save, Calendar as CalendarIcon, X, Menu,
  ChevronLeft, ChevronRight, RefreshCw, 
  AlertCircle, MoreHorizontal
} from "lucide-react";

interface JournalEntry {
  id: string;
  title: string | null;
  content: string;
  entry_date?: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const Journal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Core state
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
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

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  useEffect(() => {
    filterEntries();
  }, [entries, searchQuery]);

  const loadEntries = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading entries for user:', user.id);
      
      const { data, error } = await supabase
        .from('journal_entries')
        .select('id, title, content, entry_date, created_at, updated_at, user_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Loaded entries:', data?.length || 0);
      setEntries(data || []);
      
      // Auto-select first entry if none selected and entries exist
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

    if (searchQuery) {
      filtered = filtered.filter(entry =>
        (entry.title && entry.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
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

    if (!entryContent.trim()) {
      toast({
        title: "Missing content",
        description: "Please write some content for your entry",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const entryData = {
        user_id: user.id,
        title: entryTitle.trim() || null,
        content: entryContent.trim(),
        entry_date: selectedDate.toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      };

      if (editingEntry) {
        console.log('Updating entry:', editingEntry.id);
        const { error } = await supabase
          .from('journal_entries')
          .update(entryData)
          .eq('id', editingEntry.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        
        toast({
          title: "Entry updated",
          description: "Your journal entry has been saved successfully",
        });
      } else {
        console.log('Creating new entry with data:', entryData);
        const { data, error } = await supabase
          .from('journal_entries')
          .insert(entryData)
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        
        console.log('Entry created successfully:', data);
        toast({
          title: "Entry created",
          description: "Your new journal entry has been saved",
        });
      }

      closeEntryDialog();
      await loadEntries(); // Reload entries to show the new/updated entry
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Error saving entry",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
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
      await loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error deleting entry",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEntryDialog = (entry?: JournalEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setEntryTitle(entry.title || "");
      setEntryContent(entry.content);
    } else {
      setEditingEntry(null);
      setEntryTitle("");
      setEntryContent("");
    }
    setShowNewEntryDialog(true);
  };

  const closeEntryDialog = () => {
    setShowNewEntryDialog(false);
    setEditingEntry(null);
    setEntryTitle("");
    setEntryContent("");
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
        {/* Left Sidebar - Simple Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Journals</h2>
          
          {/* Simple All Entries button */}
          <div className="space-y-2 mb-8">
            <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium bg-orange-50 text-orange-600">
              All Entries
            </button>
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
            ) : error ? (
              <div className="p-6 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadEntries} size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
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
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate">
                            {entry.title || "Untitled Entry"}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{entry.content}</p>
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
                  <h1 className="text-2xl font-bold text-gray-800">
                    {selectedEntry.title || "Untitled Entry"}
                  </h1>
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
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {selectedEntry.content}
                  </div>
                </div>
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
              <label className="block text-sm font-medium mb-2">Title (optional)</label>
              <Input
                value={entryTitle}
                onChange={(e) => setEntryTitle(e.target.value)}
                placeholder="Enter a title for your entry..."
                className="border-gray-200 focus:border-orange-300 focus:ring-orange-200"
              />
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
                disabled={loading || !entryContent.trim()}
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