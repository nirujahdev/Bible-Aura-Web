import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedJournalEditor } from "@/components/EnhancedJournalEditor";
import { 
  BookOpen, Plus, Edit3, Trash2, Search, 
  Save, Calendar as CalendarIcon, X,
  ChevronLeft, ChevronRight, RefreshCw, 
  AlertCircle, Clock, FileText, Sparkles
} from "lucide-react";

interface JournalEntry {
  id: string;
  title: string | null;
  content: string;
  mood: string | null;
  spiritual_state?: string | null;
  verse_reference?: string | null;
  verse_text?: string | null;
  verse_references?: string[];
  tags?: string[];
  is_private?: boolean;
  entry_date?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  word_count?: number;
  reading_time?: number;
  language?: 'english' | 'tamil' | 'sinhala';
  category?: string;
  metadata?: any;
  is_pinned?: boolean;
  template_used?: string;
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
  const [showEditor, setShowEditor] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Partial<JournalEntry> | null>(null);
  const [useEnhancedEditor, setUseEnhancedEditor] = useState(true);

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
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50); // Increased limit for better UX

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

  const handleSaveEntry = async (entryData: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save journal entries",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    
    try {
      const finalData = {
        user_id: user.id,
        title: entryData.title?.trim() || null,
        content: entryData.content.trim(),
        mood: null, // Always null since we removed mood
        spiritual_state: null, // Always null since we removed spiritual state
        verse_references: entryData.verse_references || [],
        tags: [], // Always empty since we removed tags
        is_private: true, // Always private
        entry_date: entryData.entry_date || new Date().toISOString().split('T')[0],
        word_count: entryData.word_count || 0,
        reading_time: entryData.reading_time || 0,
        language: entryData.language || 'english',
        updated_at: new Date().toISOString()
      };

      if (isEditing && editingEntry?.id) {
        console.log('Updating entry:', editingEntry.id);
        const { error } = await supabase
          .from('journal_entries')
          .update(finalData)
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
        console.log('Creating new entry with data:', finalData);
        const { data, error } = await supabase
          .from('journal_entries')
          .insert(finalData)
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

      // Close editor and reload entries
      handleCloseEditor();
      await loadEntries();
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
      
      // If we're editing the deleted entry, close the editor
      if (editingEntry?.id === entryId) {
        handleCloseEditor();
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

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsEditing(true);
    setShowEditor(true);
  };

  const handleNewEntry = () => {
    setEditingEntry(null);
    setIsEditing(false);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setIsEditing(false);
    setEditingEntry(null);
    setSelectedEntry(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getLanguageFlag = (language?: string) => {
    switch (language) {
      case 'tamil': return '🇮🇳';
      case 'sinhala': return '🇱🇰';
      default: return '🇺🇸';
    }
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

  // Show enhanced editor when editing or creating
  if (showEditor) {
    return (
      <EnhancedJournalEditor
        initialEntry={editingEntry || undefined}
        onSave={handleSaveEntry}
        onCancel={handleCloseEditor}
        isEditing={isEditing}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Left Container - Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-4">
          <div className="h-full flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-orange-600" />
                My Journal
              </h1>
              <Button
                onClick={handleNewEntry}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>

            {/* Calendar Section */}
            <Card className="border-orange-200">
              <CardHeader className="pb-2">
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
                    head_cell: "text-gray-500 rounded-md w-8 font-normal text-xs",
                    row: "flex w-full mt-1",
                    cell: "text-center text-sm p-0 relative w-8 h-8",
                    day: "h-8 w-8 p-0 font-normal text-xs",
                    day_selected: "bg-orange-500 text-white hover:bg-orange-600",
                    day_today: "bg-orange-50 text-orange-600 font-semibold",
                    day_outside: "text-gray-300",
                  }}
                />
              </CardContent>
            </Card>

            {/* Recent Journals Section */}
            <Card className="flex-1 border-orange-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    Recent Entries ({entries.length})
                  </CardTitle>
                  <Button
                    onClick={loadEntries}
                    variant="ghost"
                    size="sm"
                    disabled={loading}
                  >
                    <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center py-6">
                      <RefreshCw className="h-5 w-5 animate-spin text-orange-500" />
                    </div>
                  ) : error ? (
                    <div className="p-4 text-center">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
                      <p className="text-red-600 text-xs mb-2">{error}</p>
                      <Button onClick={loadEntries} size="sm" variant="outline" className="text-xs">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    </div>
                  ) : entries.length === 0 ? (
                    <div className="p-4 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-gray-500 text-xs mb-1">No entries yet</p>
                      <p className="text-gray-400 text-xs">Start writing your first entry!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {entries.map((entry) => (
                        <div
                          key={entry.id}
                          className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedEntry?.id === entry.id ? 'bg-orange-50 border-r-2 border-orange-500' : ''
                          }`}
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-1 flex-1">
                              <span className="text-xs">{getLanguageFlag(entry.language)}</span>
                              <h3 className="font-medium text-gray-800 truncate text-sm">
                                {entry.title || "Untitled Entry"}
                              </h3>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditEntry(entry);
                                }}
                                className="h-5 w-5 p-0 text-gray-400 hover:text-orange-600"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEntry(entry.id);
                                }}
                                className="h-5 w-5 p-0 text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                            {entry.content}
                          </p>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>{formatDate(entry.created_at)}</span>
                            <span>{formatTime(entry.created_at)}</span>
                          </div>
                          {entry.verse_references && entry.verse_references.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {entry.verse_references.slice(0, 2).map((verse, index) => (
                                <span key={index} className="inline-block bg-blue-100 text-blue-700 text-xs px-1 py-0.5 rounded">
                                  📖 {verse.split(' ').slice(-1)[0]}
                                </span>
                              ))}
                              {entry.verse_references.length > 2 && (
                                <span className="text-xs text-gray-400">+{entry.verse_references.length - 2}</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Container - Entry Display */}
        <div className="flex-1 bg-white p-8">
          <div className="h-full flex flex-col max-w-4xl mx-auto">
            {selectedEntry ? (
              <div className="h-full flex flex-col">
                {/* Entry Header */}
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getLanguageFlag(selectedEntry.language)}</span>
                      <h1 className="text-2xl font-bold text-gray-800">
                        {selectedEntry.title || "Untitled Entry"}
                      </h1>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditEntry(selectedEntry)}
                        variant="outline"
                        size="sm"
                        className="border-orange-300 text-orange-600 hover:bg-orange-50"
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteEntry(selectedEntry.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{formatDate(selectedEntry.created_at)}</span>
                    <span>•</span>
                    <span>{formatTime(selectedEntry.created_at)}</span>
                    {selectedEntry.word_count && (
                      <>
                        <span>•</span>
                        <span>{selectedEntry.word_count} words</span>
                      </>
                    )}
                    {selectedEntry.reading_time && (
                      <>
                        <span>•</span>
                        <span>{selectedEntry.reading_time} min read</span>
                      </>
                    )}
                  </div>

                  {selectedEntry.verse_references && selectedEntry.verse_references.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedEntry.verse_references.map((verse, index) => (
                        <span key={index} className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                          📖 {verse}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Entry Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="prose prose-gray max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {selectedEntry.content.split('\n').map((line, index) => {
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
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h2 className="text-xl font-semibold text-gray-600 mb-2">Select an entry to read</h2>
                  <p className="text-gray-500 mb-4">Choose from your recent journal entries or create a new one</p>
                  <Button
                    onClick={handleNewEntry}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Write New Entry
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;