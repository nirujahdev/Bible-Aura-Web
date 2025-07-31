import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, Plus, Edit3, Trash2, Search, 
  Save, Calendar as CalendarIcon, X,
  ChevronLeft, ChevronRight, RefreshCw, 
  AlertCircle, Clock, FileText
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
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Editor state
  const [entryTitle, setEntryTitle] = useState("");
  const [entryContent, setEntryContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

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
        .order('created_at', { ascending: false })
        .limit(20); // Limit to recent 20 entries

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Loaded entries:', data?.length || 0);
      setEntries(data || []);
      
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
    
    setSaving(true);
    
    try {
      const entryData = {
        user_id: user.id,
        title: entryTitle.trim() || null,
        content: entryContent.trim(),
        entry_date: selectedDate.toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      };

      if (isEditing && editingEntryId) {
        console.log('Updating entry:', editingEntryId);
        const { error } = await supabase
          .from('journal_entries')
          .update(entryData)
          .eq('id', editingEntryId)
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

      // Clear the editor after saving
      clearEditor();
      await loadEntries(); // Reload entries to show the new/updated entry
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Error saving entry",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
      
      // If we're editing the deleted entry, clear the editor
      if (editingEntryId === entryId) {
        clearEditor();
      }
      
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

  const loadEntryIntoEditor = (entry: JournalEntry) => {
    setEntryTitle(entry.title || "");
    setEntryContent(entry.content);
    setIsEditing(true);
    setEditingEntryId(entry.id);
    setSelectedEntry(entry);
  };

  const clearEditor = () => {
    setEntryTitle("");
    setEntryContent("");
    setIsEditing(false);
    setEditingEntryId(null);
    setSelectedEntry(null);
  };

  const startNewEntry = () => {
    clearEditor();
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
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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
        {/* Left Container - Journal Writing Area */}
        <div className="w-1/2 bg-white border-r border-gray-200 p-6">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="p-2 rounded-full bg-orange-100">
                    <BookOpen className="h-6 w-6 text-orange-600" />
                  </div>
                  {isEditing ? 'Edit Entry' : 'New Journal Entry'}
                </h1>
                {isEditing && (
                  <Button
                    onClick={startNewEntry}
                    variant="outline"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Entry
                  </Button>
                )}
              </div>
              <p className="text-gray-600 mt-2">
                {isEditing ? 'Make changes to your journal entry' : 'Write your thoughts, prayers, and reflections'}
              </p>
            </div>

            {/* Editor Form */}
            <div className="flex-1 flex flex-col space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title (optional)
                </label>
                <Input
                  value={entryTitle}
                  onChange={(e) => setEntryTitle(e.target.value)}
                  placeholder="Enter a title for your entry..."
                  className="border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                />
              </div>

              {/* Content Textarea */}
              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <Textarea
                  value={entryContent}
                  onChange={(e) => setEntryContent(e.target.value)}
                  placeholder="Write your thoughts, reflections, prayers..."
                  className="flex-1 min-h-[400px] border-gray-200 focus:border-orange-300 focus:ring-orange-200 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                {isEditing && (
                  <Button
                    onClick={clearEditor}
                    variant="outline"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                )}
                {!isEditing && <div></div>}
                
                <Button 
                  onClick={handleSaveEntry}
                  disabled={saving || !entryContent.trim()}
                  className="bg-orange-500 hover:bg-orange-600 text-white min-w-[120px]"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? 'Update Entry' : 'Save Entry'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Container - Calendar & Recent Journals */}
        <div className="w-1/2 bg-white p-6">
          <div className="h-full flex flex-col space-y-6">
            {/* Calendar Section */}
            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-orange-600" />
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                    head_cell: "text-gray-500 rounded-md w-9 font-normal text-xs",
                    row: "flex w-full mt-1",
                    cell: "text-center text-sm p-0 relative w-9 h-9",
                    day: "h-9 w-9 p-0 font-normal",
                    day_selected: "bg-orange-500 text-white hover:bg-orange-600",
                    day_today: "bg-orange-50 text-orange-600 font-semibold",
                    day_outside: "text-gray-300",
                  }}
                />
              </CardContent>
            </Card>

            {/* Recent Journals Section */}
            <Card className="flex-1 border-orange-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Recent Journals
                  </CardTitle>
                  <Button
                    onClick={loadEntries}
                    variant="ghost"
                    size="sm"
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto">
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
                  ) : entries.length === 0 ? (
                    <div className="p-6 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 mb-4">No journal entries yet</p>
                      <p className="text-sm text-gray-400">Start writing your first entry using the editor on the left</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {entries.map((entry) => (
                        <div
                          key={entry.id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedEntry?.id === entry.id ? 'bg-orange-50 border-r-2 border-orange-500' : ''
                          }`}
                          onClick={() => loadEntryIntoEditor(entry)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-800 truncate flex-1">
                              {entry.title || "Untitled Entry"}
                            </h3>
                            <div className="flex items-center gap-1 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEntry(entry.id);
                                }}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {entry.content}
                          </p>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>{formatDate(entry.created_at)}</span>
                            <span>{formatTime(entry.created_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;