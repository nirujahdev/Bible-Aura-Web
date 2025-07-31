import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedJournalEditor } from "@/components/EnhancedJournalEditor";
import { 
  Mic, Plus, Edit3, Trash2, Search, 
  Save, Calendar as CalendarIcon, X,
  ChevronLeft, ChevronRight, RefreshCw, 
  AlertCircle, Clock, FileText, Sparkles,
  BookOpen, Users, Volume2, Globe, Quote
} from "lucide-react";

interface SermonEntry {
  id: string;
  title: string | null;
  content: string;
  scripture_reference?: string | null;
  main_points?: string[];
  congregation?: string | null;
  sermon_date?: string;
  duration?: number; // in minutes
  notes?: string | null;
  tags?: string[];
  is_draft?: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  word_count?: number;
  estimated_time?: number;
  language?: 'english' | 'tamil' | 'sinhala';
  category?: string;
  outline?: string | null;
  illustrations?: string[];
  applications?: string[];
}

const SermonWriter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Core state
  const [sermons, setSermons] = useState<SermonEntry[]>([]);
  const [selectedSermon, setSelectedSermon] = useState<SermonEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Partial<SermonEntry> | null>(null);

  useEffect(() => {
    if (user) {
      loadSermons();
    }
  }, [user]);

  const loadSermons = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading sermons for user:', user.id);
      
      const { data, error } = await supabase
        .from('sermons')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Loaded sermons:', data?.length || 0);
      setSermons((data || []) as SermonEntry[]);
      
    } catch (error) {
      console.error('Error loading sermons:', error);
      setError('Failed to load sermons');
      toast({
        title: "Error loading sermons",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewSermon = () => {
    setEditingSermon({
      title: '',
      content: '',
      scripture_reference: '',
      congregation: '',
      sermon_date: new Date().toISOString().split('T')[0],
      is_draft: true,
      language: 'english'
    });
    setIsEditing(false);
    setShowEditor(true);
  };

  const handleEditSermon = (sermon: SermonEntry) => {
    setEditingSermon(sermon);
    setIsEditing(true);
    setShowEditor(true);
  };

  const handleSaveSermon = async (sermonData: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save sermons",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    
    try {
      const finalData = {
        user_id: user.id,
        title: sermonData.title?.trim() || null,
        content: sermonData.content.trim(),
        scripture_reference: sermonData.scripture_reference || null,
        congregation: sermonData.congregation || null,
        sermon_date: sermonData.sermon_date || new Date().toISOString().split('T')[0],
        is_draft: sermonData.is_draft ?? true,
        word_count: sermonData.word_count || 0,
        estimated_time: sermonData.estimated_time || 0,
        language: sermonData.language || 'english',
        updated_at: new Date().toISOString()
      };

      if (isEditing && editingSermon?.id) {
        console.log('Updating sermon:', editingSermon.id);
        const { error } = await supabase
          .from('sermons')
          .update(finalData)
          .eq('id', editingSermon.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        
        toast({
          title: "Sermon updated",
          description: "Your sermon has been saved successfully",
        });
      } else {
        console.log('Creating new sermon with data:', finalData);
        const { data, error } = await supabase
          .from('sermons')
          .insert(finalData)
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        
        console.log('Sermon created successfully:', data);
        toast({
          title: "Sermon created",
          description: "Your new sermon has been saved",
        });
      }

      // Close editor and reload sermons
      handleCloseEditor();
      await loadSermons();
    } catch (error) {
      console.error('Error saving sermon:', error);
      toast({
        title: "Error saving sermon",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSermon = async (sermonId: string) => {
    if (!confirm('Are you sure you want to delete this sermon? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sermons')
        .delete()
        .eq('id', sermonId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Sermon deleted",
        description: "The sermon has been removed successfully",
      });

      // If the deleted sermon was selected, clear the selection
      if (selectedSermon?.id === sermonId) {
        setSelectedSermon(null);
      }

      // Reload sermons
      await loadSermons();
    } catch (error) {
      console.error('Error deleting sermon:', error);
      toast({
        title: "Error deleting sermon",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingSermon(null);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const getLanguageFlag = (language?: string) => {
    switch (language) {
      case 'tamil': return '🇮🇳';
      case 'sinhala': return '🇱🇰';
      default: return '🇺🇸';
    }
  };

  const getSermonStatus = (sermon: SermonEntry) => {
    if (sermon.is_draft) {
      return <Badge variant="secondary">Draft</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">Complete</Badge>;
  };

  // Show editor when editing/creating
  if (showEditor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Mic className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {isEditing ? 'Edit Sermon' : 'New Sermon'}
                </h1>
                <p className="text-gray-600">Write and organize your sermon content</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCloseEditor}
                variant="outline"
                className="border-gray-300"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sermon Title
                      </label>
                      <Input
                        placeholder="Enter sermon title..."
                        value={editingSermon?.title || ''}
                        onChange={(e) => setEditingSermon(prev => ({ ...prev, title: e.target.value }))}
                        className="text-lg"
                      />
                    </div>

                    {/* Scripture Reference */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Scripture Reference
                      </label>
                      <Input
                        placeholder="e.g., John 3:16, Romans 8:28-30"
                        value={editingSermon?.scripture_reference || ''}
                        onChange={(e) => setEditingSermon(prev => ({ ...prev, scripture_reference: e.target.value }))}
                      />
                    </div>

                    {/* Content Editor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sermon Content
                      </label>
                      <Textarea
                        placeholder="Write your sermon content here..."
                        value={editingSermon?.content || ''}
                        onChange={(e) => setEditingSermon(prev => ({ ...prev, content: e.target.value }))}
                        className="min-h-[400px] resize-y"
                      />
                    </div>

                    {/* Additional Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Congregation
                        </label>
                        <Input 
                          placeholder="e.g., Sunday Service, Youth Group" 
                          value={editingSermon?.congregation || ''}
                          onChange={(e) => setEditingSermon(prev => ({ ...prev, congregation: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sermon Date
                        </label>
                        <Input 
                          type="date" 
                          value={editingSermon?.sermon_date || ''}
                          onChange={(e) => setEditingSermon(prev => ({ ...prev, sermon_date: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Save Buttons */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button
                        onClick={() => handleSaveSermon({ ...editingSermon, is_draft: true })}
                        variant="outline"
                        className="border-purple-300 text-purple-600"
                        disabled={saving}
                      >
                        {saving ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save as Draft
                      </Button>
                      <Button
                        onClick={() => handleSaveSermon({ ...editingSermon, is_draft: false })}
                        className="bg-purple-500 hover:bg-purple-600"
                        disabled={saving}
                      >
                        {saving ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Sermon
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Sermon Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Sermon Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <select 
                      className="w-full p-2 border rounded-md text-sm"
                      value={editingSermon?.language || 'english'}
                      onChange={(e) => setEditingSermon(prev => ({ ...prev, language: e.target.value as any }))}
                    >
                      <option value="english">🇺🇸 English</option>
                      <option value="tamil">🇮🇳 Tamil</option>
                      <option value="sinhala">🇱🇰 Sinhala</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Sermon Tools */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Sermon Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Quote className="h-4 w-4 mr-2" />
                    Add Scripture
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Study Notes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Illustrations
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Timing Guide
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main sermon list view
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Left Container - Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-4">
          <div className="h-full flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Mic className="h-6 w-6 text-purple-600" />
                Sermon Writer
              </h1>
              <Button
                onClick={handleNewSermon}
                size="sm"
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>

            {/* Calendar Section */}
            <Card className="border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-purple-600" />
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
                    day_selected: "bg-purple-500 text-white hover:bg-purple-600",
                    day_today: "bg-purple-50 text-purple-600 font-semibold",
                    day_outside: "text-gray-300",
                  }}
                />
              </CardContent>
            </Card>

            {/* Recent Sermons Section */}
            <Card className="flex-1 border-purple-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    Recent Sermons ({sermons.length})
                  </CardTitle>
                  <Button
                    onClick={loadSermons}
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
                      <RefreshCw className="h-5 w-5 animate-spin text-purple-500" />
                    </div>
                  ) : error ? (
                    <div className="p-4 text-center">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
                      <p className="text-red-600 text-xs mb-2">{error}</p>
                      <Button onClick={loadSermons} size="sm" variant="outline" className="text-xs">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    </div>
                  ) : sermons.length === 0 ? (
                    <div className="p-4 text-center">
                      <Mic className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-gray-500 text-xs mb-1">No sermons yet</p>
                      <p className="text-gray-400 text-xs">Start writing your first sermon!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {sermons.map((sermon) => (
                        <div
                          key={sermon.id}
                          className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedSermon?.id === sermon.id ? 'bg-purple-50 border-r-2 border-purple-500' : ''
                          }`}
                          onClick={() => setSelectedSermon(sermon)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-1 flex-1">
                              <span className="text-xs">{getLanguageFlag(sermon.language)}</span>
                              <h3 className="font-medium text-gray-800 truncate text-sm">
                                {sermon.title || "Untitled Sermon"}
                              </h3>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditSermon(sermon);
                                }}
                                className="h-5 w-5 p-0 text-gray-400 hover:text-purple-600"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSermon(sermon.id);
                                }}
                                className="h-5 w-5 p-0 text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                            {sermon.content}
                          </p>
                          <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                            <span>{formatDate(sermon.created_at)}</span>
                            <span>{formatTime(sermon.created_at)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            {getSermonStatus(sermon)}
                            {sermon.scripture_reference && (
                              <span className="inline-block bg-blue-100 text-blue-700 text-xs px-1 py-0.5 rounded">
                                📖 {sermon.scripture_reference}
                              </span>
                            )}
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

        {/* Right Container - Sermon Display */}
        <div className="flex-1 bg-white p-8">
          <div className="h-full flex flex-col max-w-4xl mx-auto">
            {selectedSermon ? (
              <div className="h-full flex flex-col">
                {/* Sermon Header */}
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getLanguageFlag(selectedSermon.language)}</span>
                      <h1 className="text-2xl font-bold text-gray-800">
                        {selectedSermon.title || "Untitled Sermon"}
                      </h1>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditSermon(selectedSermon)}
                        variant="outline"
                        size="sm"
                        className="border-purple-300 text-purple-600 hover:bg-purple-50"
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteSermon(selectedSermon.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span>{formatDate(selectedSermon.created_at)}</span>
                    <span>•</span>
                    <span>{formatTime(selectedSermon.created_at)}</span>
                    {selectedSermon.word_count && (
                      <>
                        <span>•</span>
                        <span>{selectedSermon.word_count} words</span>
                      </>
                    )}
                    {selectedSermon.estimated_time && (
                      <>
                        <span>•</span>
                        <span>{selectedSermon.estimated_time} min read</span>
                      </>
                    )}
                  </div>

                  {selectedSermon.scripture_reference && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                        📖 {selectedSermon.scripture_reference}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    {getSermonStatus(selectedSermon)}
                    {selectedSermon.congregation && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {selectedSermon.congregation}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Sermon Content */}
                <div className="flex-1 overflow-auto">
                  <div className="prose prose-lg max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {selectedSermon.content}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Mic className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h2 className="text-xl font-semibold text-gray-600 mb-2">No sermon selected</h2>
                  <p className="text-gray-500 mb-4">Choose a sermon from the sidebar to view or edit it</p>
                  <Button onClick={handleNewSermon} className="bg-purple-500 hover:bg-purple-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Sermon
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

export default SermonWriter; 