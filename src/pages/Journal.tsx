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
import { useSEO, SEO_CONFIG } from "@/hooks/useSEO";
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
  spiritual_state: string | null;
  verse_reference: string | null;
  verse_text: string | null;
  verse_references: string[];
  tags: string[];
  is_private: boolean;
  entry_date: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  word_count: number;
  reading_time: number;
  language: 'english' | 'tamil' | 'sinhala';
  category: string;
  metadata: any;
  is_pinned: boolean;
  template_used: string | null;
}

const Journal = () => {
  // SEO optimization
  useSEO(SEO_CONFIG.JOURNAL);
  
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
      
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Ensure data has proper defaults for required fields
      const processedData = (data || []).map(entry => ({
        ...entry,
        verse_references: entry.verse_references || [],
        tags: entry.tags || [],
        is_private: entry.is_private !== null ? entry.is_private : true,
        entry_date: entry.entry_date || entry.created_at?.split('T')[0],
        word_count: entry.word_count || 0,
        reading_time: entry.reading_time || 1,
        language: entry.language || 'english',
        category: entry.category || 'personal',
        metadata: entry.metadata || null,
        is_pinned: entry.is_pinned || false
      }));
      
      setEntries(processedData);
      
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

  const handleSaveEntry = async (entryData: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save journal entries",
        variant: "destructive",
      });
      return;
    }

    if (!entryData.title?.trim() || !entryData.content?.trim()) {
      toast({
        title: "Missing information",
        description: "Please add a title and content to your journal entry",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    
    try {
      // Prepare data with all required fields and proper types
      const finalData = {
        user_id: user.id,
        title: entryData.title?.trim() || null,
        content: entryData.content?.trim() || '',
        mood: entryData.mood || null,
        spiritual_state: entryData.spiritual_state || null,
        verse_references: Array.isArray(entryData.verse_references) ? entryData.verse_references : [],
        verse_reference: entryData.verse_reference || null,
        verse_text: entryData.verse_text || null,
        tags: Array.isArray(entryData.tags) ? entryData.tags : [],
        is_private: entryData.is_private !== undefined ? entryData.is_private : true,
        entry_date: entryData.entry_date || new Date().toISOString().split('T')[0],
        word_count: typeof entryData.word_count === 'number' ? entryData.word_count : 0,
        reading_time: typeof entryData.reading_time === 'number' ? entryData.reading_time : 1,
        language: entryData.language || 'english',
        category: entryData.category || 'personal',
        is_pinned: entryData.is_pinned || false,
        template_used: entryData.template_used || null,
        metadata: entryData.metadata || null,
        updated_at: new Date().toISOString()
      };

      

      if (isEditing && editingEntry?.id) {
        
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
        
        const { data, error } = await supabase
          .from('journal_entries')
          .insert(finalData)
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        
        
        toast({
          title: "Entry created",
          description: "Your new journal entry has been saved",
        });
      }

      // Close editor and reload entries
      handleCloseEditor();
      await loadEntries();
    } catch (error: any) {
      console.error('Error saving entry:', error);
      
      // Provide more specific error messages
      let errorMessage = "Please try again";
      if (error.message?.includes('column')) {
        errorMessage = "Database schema issue. Please refresh the page and try again.";
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message?.includes('permission') || error.message?.includes('access')) {
        errorMessage = "Permission denied. Please sign in again.";
      }
      
      toast({
        title: "Error saving entry",
        description: errorMessage,
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

  const isMobile = window.innerWidth < 768; // Define isMobile here

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      {/* Enhanced Journal Editor Modal - Mobile optimized */}
      {showEditor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
            <div className="flex flex-col h-[95vh]">
              {/* Editor Header - Mobile optimized */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                  {isEditing ? 'Edit Entry' : 'New Journal Entry'}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSaveEntry}
                    disabled={saving}
                    className="bg-orange-500 hover:bg-orange-600 text-white h-9 px-4"
                  >
                    {saving ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save
                      </div>
                    )}
                  </Button>
                  <Button
                    onClick={handleCloseEditor}
                    variant="outline"
                    className="h-9 w-9 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Editor Content - Mobile optimized */}
              <div className="flex-1 overflow-auto">
                {useEnhancedEditor ? (
                  <EnhancedJournalEditor
                    initialEntry={editingEntry}
                    onSave={handleSaveEntry}
                    onCancel={handleCloseEditor}
                  />
                ) : (
                  <div className="p-4 space-y-4">
                    {/* Simple Editor for mobile fallback */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <Input
                        placeholder="Entry title..."
                        value={editingEntry?.title || ''}
                        onChange={(e) => setEditingEntry(prev => ({
                          ...prev,
                          title: e.target.value
                        }))}
                        className="h-11"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content
                      </label>
                      <Textarea
                        placeholder="Write your thoughts, prayers, and reflections..."
                        value={editingEntry?.content || ''}
                        onChange={(e) => setEditingEntry(prev => ({
                          ...prev,
                          content: e.target.value
                        }))}
                        className="min-h-[300px] text-base leading-relaxed"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Journal Interface - Mobile optimized */}
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Left Sidebar - Responsive */}
        <div className="w-full lg:w-80 bg-white border-b lg:border-r lg:border-b-0 border-gray-200 flex flex-col lg:h-screen">
          {/* Header - Mobile optimized */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-gray-800">Journal</h1>
                  <p className="text-sm text-gray-600 hidden sm:block">Record your spiritual journey</p>
                </div>
              </div>
              
              <Button
                onClick={handleNewEntry}
                className="bg-orange-500 hover:bg-orange-600 text-white h-10 px-4 rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">New Entry</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>

          {/* Calendar and Entries - Mobile optimized layout */}
          <div className="flex-1 flex flex-col lg:flex-col xl:flex-row gap-4 p-4 overflow-auto">
            {/* Calendar Section - Responsive */}
            <Card className="flex-shrink-0 border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-orange-600" />
                  <span className="hidden sm:inline">Calendar</span>
                  <span className="sm:hidden">Calendar</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="w-full overflow-hidden">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    className="rounded-lg"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell: "text-muted-foreground rounded-md w-8 lg:w-9 font-normal text-xs",
                      row: "flex w-full mt-2",
                      cell: "text-center text-sm p-0 relative w-8 lg:w-9 h-8 lg:h-9",
                      day: "h-8 lg:h-9 w-8 lg:w-9 p-0 font-normal text-xs",
                      day_selected: "bg-orange-500 text-white hover:bg-orange-600",
                      day_today: "bg-orange-50 text-orange-600 font-semibold",
                      day_outside: "text-gray-300",
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recent Journals Section - Mobile optimized */}
            <Card className="flex-1 border-orange-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="hidden sm:inline">Recent Entries ({entries.length})</span>
                    <span className="sm:hidden">Recent ({entries.length})</span>
                  </CardTitle>
                  <Button
                    onClick={loadEntries}
                    variant="ghost"
                    size="sm"
                    disabled={loading}
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-60 lg:max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center py-6">
                      <RefreshCw className="h-5 w-5 animate-spin text-orange-500" />
                    </div>
                  ) : error ? (
                    <div className="p-4 text-center">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
                      <p className="text-red-600 text-sm mb-2">{error}</p>
                      <Button onClick={loadEntries} size="sm" variant="outline" className="text-xs h-8">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    </div>
                  ) : entries.length === 0 ? (
                    <div className="p-4 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-gray-500 text-sm mb-1">No entries yet</p>
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
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-sm">{getLanguageFlag(entry.language)}</span>
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
                                className="h-6 w-6 p-0 text-gray-400 hover:text-orange-600"
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
                            <span className="hidden sm:inline">{formatDate(entry.created_at)}</span>
                            <span className="sm:hidden">{formatDate(entry.created_at).split(',')[0]}</span>
                            <span>{formatTime(entry.created_at)}</span>
                          </div>
                          {entry.verse_references && entry.verse_references.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {entry.verse_references.slice(0, 2).map((verse, index) => (
                                <span key={index} className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
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

        {/* Right Container - Entry Display - Mobile optimized */}
        <div className="flex-1 bg-white p-4 lg:p-8">
          <div className="h-full flex flex-col max-w-4xl mx-auto">
            {selectedEntry ? (
              <div className="h-full flex flex-col">
                {/* Entry Header - Mobile optimized */}
                <div className="mb-4 lg:mb-6 pb-3 lg:pb-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getLanguageFlag(selectedEntry.language)}</span>
                      <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
                        {selectedEntry.title || "Untitled Entry"}
                      </h1>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditEntry(selectedEntry)}
                        variant="outline"
                        size="sm"
                        className="border-orange-300 text-orange-600 hover:bg-orange-50 h-9"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteEntry(selectedEntry.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50 h-9"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  {/* Entry Metadata - Mobile optimized */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{formatDate(selectedEntry.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(selectedEntry.created_at)}</span>
                    </div>
                    {selectedEntry.word_count > 0 && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{selectedEntry.word_count} words</span>
                      </div>
                    )}
                    {selectedEntry.reading_time > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{selectedEntry.reading_time} min read</span>
                      </div>
                    )}
                  </div>

                  {/* Tags and References - Mobile optimized */}
                  {(selectedEntry.tags && selectedEntry.tags.length > 0) || 
                   (selectedEntry.verse_references && selectedEntry.verse_references.length > 0) ? (
                    <div className="mt-3 space-y-2">
                      {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {selectedEntry.tags.map((tag, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {selectedEntry.verse_references && selectedEntry.verse_references.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {selectedEntry.verse_references.map((verse, index) => (
                            <span key={index} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                              📖 {verse}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Entry Content - Optimized for mobile reading */}
                <div className="flex-1 overflow-auto">
                  <div className={`prose prose-lg max-w-none ${
                    isMobile ? 'prose-base' : 'prose-lg'
                  }`}>
                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {selectedEntry.content}
                    </div>
                  </div>

                  {/* Mood and Spiritual State - Mobile optimized */}
                  {(selectedEntry.mood || selectedEntry.spiritual_state) && (
                    <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
                      <h3 className="font-semibold text-orange-800 mb-2">Reflection</h3>
                      <div className="space-y-2 text-sm">
                        {selectedEntry.mood && (
                          <div>
                            <span className="font-medium text-orange-700">Mood: </span>
                            <span className="text-gray-700">{selectedEntry.mood}</span>
                          </div>
                        )}
                        {selectedEntry.spiritual_state && (
                          <div>
                            <span className="font-medium text-orange-700">Spiritual State: </span>
                            <span className="text-gray-700">{selectedEntry.spiritual_state}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Featured Verse - Mobile optimized */}
                  {selectedEntry.verse_text && selectedEntry.verse_reference && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <h3 className="font-semibold text-blue-800 mb-2">Featured Verse</h3>
                      <blockquote className="text-blue-900 italic mb-2">
                        "{selectedEntry.verse_text}"
                      </blockquote>
                      <cite className="text-blue-700 font-medium text-sm">
                        — {selectedEntry.verse_reference}
                      </cite>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Empty State - Mobile optimized */
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Welcome to your Journal
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Record your spiritual journey, prayers, and reflections. 
                    Select an entry from the sidebar or create a new one to get started.
                  </p>
                  <Button
                    onClick={handleNewEntry}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Write Your First Entry
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