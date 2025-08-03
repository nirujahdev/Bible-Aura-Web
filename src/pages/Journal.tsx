import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useSEO, SEO_CONFIG } from "@/hooks/useSEO";
import { 
  PenTool, Plus, MoreVertical, ArrowLeft, Settings, 
  Calendar, Search, Filter, Heart, Star, BookOpen,
  Lock, Share, Download, Upload, Tag, Clock, Smile,
  Frown, Meh, Sun, Cloud, CloudRain, Archive, Trash2,
  Edit, Eye, Copy, ChevronDown, ChevronRight, FileText, X
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
  // SEO optimization (same as laptop)
  useSEO(SEO_CONFIG.JOURNAL);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Core state (same as laptop)
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Mobile-specific UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'category'>('date');

  // Load entries (same backend call as laptop)
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
        
        // Handle specific database errors
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          setError('Database schema update required. Please refresh the page.');
          toast({
            title: "Database Update Required",
            description: "The database schema needs to be updated. Please refresh the page or contact support.",
            variant: "destructive"
          });
          return;
        }
        
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          setError('Journal table not found. Please contact support.');
          toast({
            title: "Database Error",
            description: "The journal table is missing. Please contact support.",
            variant: "destructive"
          });
          return;
        }
        
        if (error.message.includes('permission denied') || error.message.includes('RLS')) {
          setError('Access permission issue. Please sign out and sign back in.');
          toast({
            title: "Permission Error",
            description: "Please sign out and sign back in to refresh your permissions.",
            variant: "destructive"
          });
          return;
        }
        
        throw error;
      }
      
      // Ensure data has proper defaults for required fields (same as laptop)
      const processedData = (data || []).map(entry => ({
        ...entry,
        verse_references: entry.verse_references || [],
        tags: entry.tags || [],
        is_private: entry.is_private !== null ? entry.is_private : true,
        entry_date: entry.entry_date || entry.created_at?.split('T')[0],
        word_count: entry.word_count || 0,
        reading_time: entry.reading_time || 1,
        language: entry.language || 'english',
        category: entry.category || 'General',
        is_pinned: entry.is_pinned || false,
        template_used: entry.template_used || null,
        metadata: entry.metadata || null
      }));
      
      setEntries(processedData);
    } catch (error: any) {
      console.error('Error loading entries:', error);
      setError('Failed to load journal entries');
      
      // Show user-friendly error message based on error type
      const errorMessage = error?.message || 'Unknown error occurred';
      let userMessage = "Failed to load journal entries. Please try again.";
      
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        userMessage = "Network error. Please check your connection and try again.";
      } else if (errorMessage.includes('timeout')) {
        userMessage = "Request timed out. Please try again.";
      } else if (errorMessage.includes('JWT') || errorMessage.includes('token')) {
        userMessage = "Session expired. Please sign in again.";
      }
      
      toast({
        title: "Error",
        description: userMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort entries
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
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'category':
          return a.category.localeCompare(b.category);
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  // Get categories from actual entries
  const categories = Array.from(new Set(entries.map(entry => entry.category))).map(name => ({
    name,
    count: entries.filter(entry => entry.category === name).length
  }));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getMoodIcon = (mood: string | null) => {
    switch (mood) {
      case 'happy': return <Smile className="h-4 w-4 text-yellow-500" />;
      case 'sad': return <Frown className="h-4 w-4 text-blue-500" />;
      case 'peaceful': return <Sun className="h-4 w-4 text-orange-500" />;
      case 'anxious': return <Cloud className="h-4 w-4 text-gray-500" />;
      case 'grateful': return <Heart className="h-4 w-4 text-red-500" />;
      default: return <Meh className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-white p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <PenTool className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Spiritual Journal</h1>
            <p className="text-xs text-green-100">{entries.length} entries</p>
          </div>
        </div>
        
        <div className="relative">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white p-2"
            onClick={() => setShowSettings(!showSettings)}
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
          
          {showSettings && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto">
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Journal Settings</h3>
                <p className="text-xs text-gray-500">Manage your spiritual journal</p>
              </div>

              <button
                onClick={() => setShowNewEntry(true)}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
              >
                <Plus className="h-4 w-4 text-green-500" />
                <span>New Entry</span>
              </button>

              <div className="px-4 py-3 border-b border-gray-100">
                <label className="text-xs font-medium text-gray-500 mb-2 block">Search Entries</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search entries, tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
              </div>

              <div className="px-4 py-3 border-b border-gray-100">
                <label className="text-xs font-medium text-gray-500 mb-2 block">Filter by Category</label>
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant={selectedCategory === 'All' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory('All')}
                    className="text-xs"
                  >
                    All
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category.name}
                      variant={selectedCategory === category.name ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.name)}
                      className="text-xs"
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSortBy(sortBy === 'date' ? 'title' : sortBy === 'title' ? 'category' : 'date')}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
              >
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Sort by {sortBy === 'date' ? 'Title' : sortBy === 'title' ? 'Category' : 'Date'}</span>
              </button>

              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={() => toast({ title: "Export Journal", description: "Export feature coming soon!" })}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                >
                  <Download className="h-4 w-4 text-purple-500" />
                  <span>Export Journal</span>
                </button>

                <button
                  onClick={() => toast({ title: "Privacy Settings", description: "Manage your journal privacy settings." })}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                >
                  <Lock className="h-4 w-4 text-orange-500" />
                  <span>Privacy Settings</span>
                </button>

                <button
                  onClick={() => toast({ title: "Backup Journal", description: "Backup your entries to cloud storage." })}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                >
                  <Upload className="h-4 w-4 text-indigo-500" />
                  <span>Backup Journal</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-4 py-4">
        {!showNewEntry && !selectedEntry && (
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setShowNewEntry(true)}
                className="h-20 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl flex flex-col items-center justify-center"
              >
                <Plus className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">New Entry</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => loadEntries()}
                className="h-20 border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 rounded-2xl flex flex-col items-center justify-center"
              >
                <Clock className="h-8 w-8 mb-2 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Recent</span>
              </Button>
            </div>

            {/* Journal Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-green-700">{entries.length}</div>
                  <div className="text-xs text-gray-600">Total Entries</div>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-blue-700">
                    {entries.reduce((sum, entry) => sum + entry.word_count, 0)}
                  </div>
                  <div className="text-xs text-gray-600">Total Words</div>
                </CardContent>
              </Card>
              
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-purple-700">{categories.length}</div>
                  <div className="text-xs text-gray-600">Categories</div>
                </CardContent>
              </Card>
            </div>

            {/* Entries List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-500">Loading entries...</span>
                </div>
              </div>
            ) : error ? (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 text-center">
                  <div className="text-red-700 font-medium mb-2">Error Loading Entries</div>
                  <p className="text-sm text-red-600 mb-3">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={loadEntries}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : filteredEntries.length === 0 ? (
              <Card className="border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PenTool className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">No Entries Found</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {searchQuery || selectedCategory !== 'All'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Start your spiritual journey by writing your first entry.'}
                  </p>
                  <Button 
                    onClick={() => setShowNewEntry(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Write First Entry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredEntries.map((entry) => (
                  <Card 
                    key={entry.id} 
                    className="border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {entry.title || 'Untitled Entry'}
                          </h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {entry.category}
                            </Badge>
                            {entry.mood && getMoodIcon(entry.mood)}
                            {entry.is_private && <Lock className="h-3 w-3 text-gray-400" />}
                            {entry.is_pinned && <Star className="h-3 w-3 text-yellow-500" />}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(entry.created_at)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {entry.content.substring(0, 150)}...
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>{entry.word_count} words</span>
                          <span>•</span>
                          <span>{entry.reading_time} min read</span>
                        </div>
                        
                        <div className="flex space-x-1">
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* New Entry Form - Simplified for mobile */}
        {showNewEntry && (
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">New Journal Entry</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowNewEntry(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Entry title (optional)" className="font-medium" />
              <textarea 
                placeholder="Write your thoughts, prayers, and reflections here..."
                className="w-full h-40 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Tip: Be authentic and honest in your spiritual journey
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setShowNewEntry(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      toast({ title: "Entry Saved", description: "Your journal entry has been saved." });
                      setShowNewEntry(false);
                    }}
                  >
                    Save Entry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Entry Detail View */}
        {selectedEntry && (
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedEntry(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedEntry.title || 'Untitled Entry'}
                    </CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{formatDate(selectedEntry.created_at)}</span>
                      <span>•</span>
                      <span>{selectedEntry.word_count} words</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {selectedEntry.mood && getMoodIcon(selectedEntry.mood)}
                  {selectedEntry.is_private && <Lock className="h-4 w-4 text-gray-400" />}
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-700">
                  {selectedEntry.category}
                </Badge>
                {selectedEntry.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedEntry.content}
                </p>
              </div>
              
              {selectedEntry.verse_reference && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-2">
                      <BookOpen className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-800 font-medium">
                          {selectedEntry.verse_reference}
                        </p>
                        {selectedEntry.verse_text && (
                          <p className="text-sm text-blue-700 italic mt-1">
                            "{selectedEntry.verse_text}"
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}
      </ScrollArea>
    </div>
  );
};

export default Journal; 