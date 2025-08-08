import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useSEO, SEO_CONFIG } from "@/hooks/useSEO";
import { ModernLayout } from "@/components/ModernLayout";
import { EnhancedJournalEditor } from "@/components/EnhancedJournalEditor";
import { 
  PenTool, Plus, Calendar as CalendarIcon, Search, Filter, Heart, Star, BookOpen,
  Lock, Share, Tag, Clock, Smile, Frown, Meh, Sun, Cloud, CloudRain, 
  Edit, Eye, Copy, ChevronDown, ChevronRight, FileText, X, MoreVertical, Trash2
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
  // Enhanced state for templates
  const [templateData, setTemplateData] = useState<any>(null);

  // Load entries on component mount
  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  // Enhanced load entries with better error handling
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
        if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
          toast({
            title: "Permission Error",
            description: "Please sign out and sign back in to refresh your permissions.",
            variant: "destructive"
          });
          return;
        }
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          toast({
            title: "Database Error",
            description: "The journal table is missing. Please contact support.",
            variant: "destructive"
          });
          return;
        }
        throw new Error(error.message || 'Failed to load journal entries');
      }

      // Process entries with enhanced metadata handling
      const processedEntries = (data || []).map(entry => ({
        ...entry,
        metadata: entry.metadata || {},
        tags: entry.tags || [],
        verse_references: entry.verse_references || []
      }));

      setEntries(processedEntries);
    } catch (error: any) {
      console.error('Error loading entries:', error);
      toast({
        title: "Error loading entries",
        description: error.message || "Failed to load your journal entries. Please try again.",
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
      const dataToSave = {
        title: entryData.title || null,
        content: entryData.content || '',
        mood: entryData.mood || null,
        spiritual_state: entryData.spiritual_state || null,
        verse_reference: entryData.verse_reference || null,
        verse_text: entryData.verse_text || null,
        verse_references: entryData.verse_references || [],
        tags: entryData.tags || [],
        is_private: entryData.is_private !== undefined ? entryData.is_private : true,
        language: entryData.language || 'english',
        category: entryData.category || 'personal',
        word_count: entryData.word_count || (entryData.content ? entryData.content.trim().split(/\s+/).length : 0),
        reading_time: entryData.reading_time || Math.max(1, Math.ceil((entryData.content ? entryData.content.trim().split(/\s+/).length : 0) / 200)),
        metadata: {
          ...entryData.metadata,
          gratitude_items: entryData.gratitude_items || [],
          prayer_requests: entryData.prayer_requests || [],
          spiritual_insights: entryData.spiritual_insights || [],
          reflection_type: entryData.reflection_type || 'general', // morning, evening, general
          devotion_completed: entryData.devotion_completed || false
        },
        is_pinned: entryData.is_pinned || false,
        template_used: entryData.template_used || null,
        entry_date: entryData.entry_date || selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      };

      if (editingEntry) {
        // Update existing entry
        const { data, error } = await supabase
          .from('journal_entries')
          .update(dataToSave)
          .eq('id', editingEntry.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating entry:', error);
          if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
            throw new Error('You do not have permission to update this entry.');
          }
          if (error.message?.includes('column') && error.message?.includes('does not exist')) {
            throw new Error('Database schema issue. Please refresh the page and try again.');
          }
          throw new Error(error.message || 'Failed to update journal entry');
        }

        toast({
          title: "Entry updated",
          description: "Your journal entry has been updated successfully.",
        });
      } else {
        // Create new entry
        const { data, error } = await supabase
          .from('journal_entries')
          .insert([{
            ...dataToSave,
            user_id: user.id,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating entry:', error);
          if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
            throw new Error('You do not have permission to create journal entries. Please sign out and sign back in.');
          }
          if (error.message?.includes('column') && error.message?.includes('does not exist')) {
            throw new Error('Database schema issue. Please refresh the page and try again.');
          }
          if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
            throw new Error('Database table is missing. Please contact support.');
          }
          throw new Error(error.message || 'Failed to create journal entry');
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
        description: error.message || "Failed to save your journal entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to delete journal entries.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting entry:', error);
        if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
          throw new Error('You do not have permission to delete this entry.');
        }
        throw new Error(error.message || 'Failed to delete journal entry');
      }

      setEntries(prev => prev.filter(e => e.id !== entryId));
      toast({
        title: "Entry deleted",
        description: "Your journal entry has been deleted successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error deleting entry",
        description: error.message || "Failed to delete journal entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Quick template creators for daily devotion
  const createMorningReflection = () => {
    const template = {
      title: `Morning Reflection - ${format(new Date(), 'MMMM do, yyyy')}`,
      content: `🌅 **Morning Prayer & Reflection**

**Today's Scripture:** 
[Add today's verse here]

**Morning Gratitude:**
• 
• 
• 

**Prayer Requests:**
• 
• 

**Goals for Today:**
• 
• 

**How can I serve God today?**


**Morning Prayer:**
"Lord, thank You for this new day. Guide my steps and help me to..."`,
      category: 'devotion',
      reflection_type: 'morning',
      template_used: 'morning_reflection'
    };
    
    setEditingEntry(null);
    setShowEditor(true);
    setTemplateData(template); // Set template data for the editor
  };

  const createEveningReflection = () => {
    const template = {
      title: `Evening Reflection - ${format(new Date(), 'MMMM do, yyyy')}`,
      content: `🌙 **Evening Prayer & Reflection**

**Today's Highlights:**
• 
• 

**What am I grateful for today?**
• 
• 
• 

**How did I see God working today?**


**Areas for Growth:**
• 
• 

**Prayer of Thanksgiving:**
"Heavenly Father, thank You for today. I'm especially grateful for..."

**Tomorrow's Prayer:**
"Lord, help me tomorrow to..."`,
      category: 'devotion',
      reflection_type: 'evening',
      template_used: 'evening_reflection'
    };
    
    setEditingEntry(null);
    setShowEditor(true);
    setTemplateData(template); // Set template data for the editor
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

            {/* Quick Templates for Daily Devotion */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Quick Templates</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={createMorningReflection}
                  className="text-xs border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                >
                  <Sun className="h-3 w-3 mr-1" />
                  Morning
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={createEveningReflection}
                  className="text-xs border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Cloud className="h-3 w-3 mr-1" />
                  Evening
                </Button>
              </div>
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
                              className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 group"
                            >
                              <div className="flex items-center justify-between">
                                <div 
                                  className="flex-1 cursor-pointer"
                                  onClick={() => handleEditEntry(entry)}
                                >
                                  <div className="font-medium text-sm text-gray-900 truncate">
                                    {entry.title || 'Untitled'}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {entry.word_count} words • {entry.reading_time} min read
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditEntry(entry);
                                    }}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => e.stopPropagation()}
                                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete "{entry.title || 'Untitled'}"? 
                                          This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteEntry(entry.id)}
                                          className="bg-red-500 hover:bg-red-600"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
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
                          className="hover:shadow-md transition-shadow group"
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div 
                                className="flex items-center gap-2 flex-1 cursor-pointer"
                                onClick={() => handleEditEntry(entry)}
                              >
                                <CardTitle className="text-sm font-medium truncate">
                                  {entry.title || 'Untitled'}
                                </CardTitle>
                                <div className="flex items-center gap-1">
                                  {getMoodIcon(entry.mood)}
                                  {entry.is_pinned && <Star className="h-3 w-3 text-yellow-500" />}
                                </div>
                              </div>
                              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditEntry(entry)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                          onSelect={(e) => e.preventDefault()}
                                          className="text-red-600 focus:text-red-600"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete "{entry.title || 'Untitled'}"? 
                                            This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteEntry(entry.id)}
                                            className="bg-red-500 hover:bg-red-600"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent 
                            className="pt-0 cursor-pointer"
                            onClick={() => handleEditEntry(entry)}
                          >
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
                  setTemplateData(null); // Clear template data on cancel
                }}
                templateData={templateData} // Pass template data to the editor
              />
            </div>
          )}
        </div>
      </div>
    </ModernLayout>
  );
};

export default Journal; 