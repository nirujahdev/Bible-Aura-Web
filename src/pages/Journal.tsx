import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useSEO, SEO_CONFIG } from "@/hooks/useSEO";
import { ModernLayout } from "@/components/ModernLayout";
import { EnhancedJournalEditor } from "@/components/EnhancedJournalEditor";
import { 
  PenTool, Plus, Calendar as CalendarIcon, Search, Filter, Heart, Star, BookOpen,
  Lock, Share, Tag, Clock, Smile, Frown, Meh, Sun, Cloud, CloudRain, 
  Edit, Eye, Copy, ChevronDown, ChevronRight, FileText, X, MoreVertical
} from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

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
  is_pinned?: boolean;
  template_used: string | null;
}

const Journal = () => {
  // SEO optimization
  useSEO(SEO_CONFIG.JOURNAL);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // State management
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showEditor, setShowEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Load entries on component mount
  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  const loadEntries = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

      if (error) {
        console.error('Error loading entries:', error);
        toast({
          title: "Error loading entries",
          description: "Failed to load your journal entries. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setEntries(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter entries for selected date
  const selectedDateEntries = entries.filter(entry => 
    selectedDate && isSameDay(new Date(entry.entry_date), selectedDate)
  );

  // Filter and sort entries for list view
  const filteredEntries = entries
    .filter(entry => {
      if (selectedCategory !== 'All' && entry.category !== selectedCategory) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          entry.title?.toLowerCase().includes(query) ||
          entry.content.toLowerCase().includes(query) ||
          entry.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());

  // Get categories from actual entries
  const categories = Array.from(new Set(entries.map(entry => entry.category))).map(name => ({
    name,
    count: entries.filter(entry => entry.category === name).length
  }));

  // Get entries for calendar highlighting
  const getEntriesForDate = (date: Date) => {
    return entries.filter(entry => isSameDay(new Date(entry.entry_date), date));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  const getMoodIcon = (mood: string | null) => {
    switch (mood) {
      case 'happy': return <Smile className="h-4 w-4 text-yellow-500" />;
      case 'sad': return <Frown className="h-4 w-4 text-orange-500" />;
      case 'peaceful': return <Sun className="h-4 w-4 text-orange-500" />;
      case 'anxious': return <Cloud className="h-4 w-4 text-gray-500" />;
      case 'grateful': return <Heart className="h-4 w-4 text-red-500" />;
      default: return <Meh className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleNewEntry = () => {
    setEditingEntry(null);
    setShowEditor(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setShowEditor(true);
  };

  const handleSaveEntry = async (entryData: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save journal entries.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('journal_entries')
          .update({
            title: entryData.title,
            content: entryData.content,
            mood: entryData.mood,
            spiritual_state: entryData.spiritual_state,
            verse_reference: entryData.verse_reference,
            verse_text: entryData.verse_text,
            verse_references: entryData.verse_references || [],
            tags: entryData.tags || [],
            is_private: entryData.is_private !== undefined ? entryData.is_private : true,
            word_count: entryData.word_count || 0,
            reading_time: entryData.reading_time || 0,
            language: entryData.language || 'english',
            category: entryData.category || 'personal',
            metadata: entryData.metadata,
            is_pinned: entryData.is_pinned || false,
            template_used: entryData.template_used,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEntry.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating entry:', error);
          throw error;
        }

        toast({
          title: "Entry updated",
          description: "Your journal entry has been updated successfully.",
        });
      } else {
        // Create new entry
        const { error } = await supabase
          .from('journal_entries')
          .insert({
            title: entryData.title,
            content: entryData.content,
            mood: entryData.mood,
            spiritual_state: entryData.spiritual_state,
            verse_reference: entryData.verse_reference,
            verse_text: entryData.verse_text,
            verse_references: entryData.verse_references || [],
            tags: entryData.tags || [],
            is_private: entryData.is_private !== undefined ? entryData.is_private : true,
            word_count: entryData.word_count || 0,
            reading_time: entryData.reading_time || 0,
            language: entryData.language || 'english',
            category: entryData.category || 'personal',
            metadata: entryData.metadata,
            is_pinned: entryData.is_pinned || false,
            template_used: entryData.template_used,
            user_id: user.id,
            entry_date: entryData.entry_date || selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error creating entry:', error);
          throw error;
        }

        toast({
          title: "Entry saved",
          description: "Your journal entry has been saved successfully.",
        });
      }

      // Close editor and refresh entries
      setShowEditor(false);
      setEditingEntry(null);
      await loadEntries();

    } catch (error: any) {
      console.error('Error saving entry:', error);
      toast({
        title: "Error saving entry",
        description: error?.message || "Failed to save your journal entry. Please try again.",
        variant: "destructive"
      });
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
        description: "Your journal entry has been deleted.",
      });

      await loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete the entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <ModernLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Sign in Required
            </h2>
            <p className="text-gray-600">
              Please sign in to access your journal.
            </p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="h-screen flex bg-gray-50">
        {/* Calendar & Entries Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <PenTool className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">My Journal</h1>
                  <p className="text-sm text-gray-600">Personal reflections</p>
                </div>
              </div>
              <Button 
                onClick={handleNewEntry}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className={viewMode === 'calendar' ? 'bg-orange-500 hover:bg-orange-600' : ''}
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                Calendar
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-orange-500 hover:bg-orange-600' : ''}
              >
                <FileText className="h-4 w-4 mr-1" />
                List
              </Button>
            </div>
          </div>

          {/* Content based on view mode */}
          <div className="flex-1 overflow-hidden">
            {viewMode === 'calendar' ? (
              <div className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    hasEntry: (date) => getEntriesForDate(date).length > 0,
                  }}
                  modifiersStyles={{
                    hasEntry: {
                      backgroundColor: '#f97316',
                      color: 'white',
                      fontWeight: 'bold'
                    }
                  }}
                />
                
                {/* Selected date entries */}
                {selectedDate && (
                  <div className="mt-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {format(selectedDate, 'MMM d, yyyy')}
                    </h3>
                    <ScrollArea className="h-32">
                      <div className="space-y-2">
                        {selectedDateEntries.length > 0 ? (
                          selectedDateEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className="p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                              onClick={() => handleEditEntry(entry)}
                            >
                              <div className="font-medium text-sm text-gray-900 truncate">
                                {entry.title || 'Untitled'}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {entry.word_count} words • {entry.reading_time} min read
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 text-center py-4">
                            No entries for this date
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            ) : (
              // List view
              <div className="p-4">
                {/* Category filter */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="All">All ({entries.length})</option>
                    {categories.map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Entries list */}
                <ScrollArea className="h-[calc(100vh-250px)]">
                  <div className="space-y-3">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="text-gray-500">Loading entries...</div>
                      </div>
                    ) : filteredEntries.length > 0 ? (
                      filteredEntries.map((entry) => (
                        <Card
                          key={entry.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleEditEntry(entry)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-medium truncate">
                                {entry.title || 'Untitled'}
                              </CardTitle>
                              <div className="flex items-center gap-1">
                                {getMoodIcon(entry.mood)}
                                {entry.is_pinned && <Star className="h-3 w-3 text-yellow-500" />}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {entry.content}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{formatDate(entry.entry_date)}</span>
                              <span>{entry.word_count} words</span>
                            </div>
                            {entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {entry.tags.slice(0, 2).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {entry.tags.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{entry.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <PenTool className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <div className="text-gray-500">No entries found</div>
                        <Button
                          onClick={handleNewEntry}
                          className="mt-4 bg-orange-500 hover:bg-orange-600"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create your first entry
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          {!showEditor ? (
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <PenTool className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Welcome to Your Journal
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {selectedDate && viewMode === 'calendar' 
                  ? `Selected: ${format(selectedDate, 'EEEE, MMMM d, yyyy')}`
                  : 'Capture your spiritual journey, thoughts, and prayers in your personal journal.'
                }
              </p>
              <Button
                onClick={handleNewEntry}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 text-base"
              >
                <Plus className="h-5 w-5 mr-2" />
                Start Writing
              </Button>
            </div>
          ) : (
            <div className="w-full h-full">
              <EnhancedJournalEditor
                initialEntry={editingEntry ? {
                  id: editingEntry.id,
                  title: editingEntry.title || '',
                  content: editingEntry.content || '',
                  mood: editingEntry.mood,
                  spiritual_state: editingEntry.spiritual_state,
                  verse_reference: editingEntry.verse_reference,
                  verse_text: editingEntry.verse_text,
                  verse_references: editingEntry.verse_references || [],
                  tags: editingEntry.tags || [],
                  is_private: editingEntry.is_private,
                  entry_date: editingEntry.entry_date,
                  word_count: editingEntry.word_count,
                  reading_time: editingEntry.reading_time,
                  language: editingEntry.language,
                  category: editingEntry.category,
                  metadata: editingEntry.metadata,
                  is_pinned: editingEntry.is_pinned,
                  template_used: editingEntry.template_used
                } : undefined}
                isEditing={!!editingEntry}
                onSave={handleSaveEntry}
                onCancel={() => {
                  setShowEditor(false);
                  setEditingEntry(null);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </ModernLayout>
  );
};

export default Journal; 