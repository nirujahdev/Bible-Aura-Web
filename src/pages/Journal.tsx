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
  is_pinned: boolean;
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
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user?.id)
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
    try {
      if (editingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('journal_entries')
          .update({
            ...entryData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEntry.id);

        if (error) throw error;

        toast({
          title: "Entry updated",
          description: "Your journal entry has been updated successfully.",
        });
      } else {
        // Create new entry
        const { error } = await supabase
          .from('journal_entries')
          .insert({
            ...entryData,
            user_id: user?.id,
            entry_date: selectedDate?.toISOString() || new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;

        toast({
          title: "Entry saved",
          description: "Your journal entry has been saved successfully.",
        });
      }

      setShowEditor(false);
      setEditingEntry(null);
      loadEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Error saving entry",
        description: "Failed to save your journal entry. Please try again.",
        variant: "destructive"
      });
    }
  };

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
                  <h1 className="text-lg font-semibold text-gray-900">Journal</h1>
                  <p className="text-sm text-gray-500">{entries.length} entries</p>
                </div>
              </div>
              <Button
                onClick={handleNewEntry}
                className="bg-orange-500 hover:bg-orange-600 h-9 w-9 p-0 rounded-xl"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1 h-8"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendar
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1 h-8"
                onClick={() => setViewMode('list')}
              >
                <FileText className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
          </div>

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <>
              {/* Mini Calendar */}
              <div className="p-4 border-b border-gray-200">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border-0"
                  components={{
                    DayContent: ({ date }) => {
                      const dayEntries = getEntriesForDate(date);
                      const hasEntries = dayEntries.length > 0;
                      
                      return (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <span className={`text-sm ${
                            isSameDay(date, selectedDate || new Date()) 
                              ? 'font-semibold' 
                              : ''
                          }`}>
                            {format(date, 'd')}
                          </span>
                          {hasEntries && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"></div>
                          )}
                        </div>
                      );
                    }
                  }}
                />
              </div>

              {/* Selected Date Entries */}
              <div className="flex-1 overflow-hidden">
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-900">
                    {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedDateEntries.length} {selectedDateEntries.length === 1 ? 'entry' : 'entries'}
                  </p>
                </div>

                <ScrollArea className="flex-1 p-3">
                  {selectedDateEntries.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 mb-3">No entries for this date</p>
                      <Button
                        onClick={handleNewEntry}
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Entry
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateEntries.map((entry) => (
                        <Card 
                          key={entry.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleEditEntry(entry)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                                {entry.title || 'Untitled Entry'}
                              </h4>
                              {getMoodIcon(entry.mood)}
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {entry.content}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {entry.category}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {format(new Date(entry.created_at), 'h:mm a')}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <>
              {/* Search and Filter */}
              <div className="p-4 border-b border-gray-200 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-9 px-3 text-sm border border-gray-200 rounded-md bg-white"
                >
                  <option value="All">All Categories</option>
                  {categories.map(category => (
                    <option key={category.name} value={category.name}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Entries List */}
              <ScrollArea className="flex-1 p-3">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading entries...</p>
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-3">
                      {searchQuery || selectedCategory !== 'All' ? 'No matching entries found' : 'No entries yet'}
                    </p>
                    <Button
                      onClick={handleNewEntry}
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Entry
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredEntries.map((entry) => (
                      <Card 
                        key={entry.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleEditEntry(entry)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                              {entry.title || 'Untitled Entry'}
                            </h4>
                            {getMoodIcon(entry.mood)}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {entry.content}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {entry.category}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {formatDate(entry.entry_date)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </>
          )}
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