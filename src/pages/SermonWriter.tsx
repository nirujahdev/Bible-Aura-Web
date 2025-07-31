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
  Mic, Plus, Edit3, Trash2, Search, 
  Save, Calendar as CalendarIcon, X,
  ChevronLeft, ChevronRight, RefreshCw, 
  AlertCircle, Clock, FileText, Sparkles,
  BookOpen, Users, Volume2
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

  const handleSaveSermon = async (sermonData: Omit<SermonEntry, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
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
        main_points: sermonData.main_points || [],
        congregation: sermonData.congregation || null,
        sermon_date: sermonData.sermon_date || new Date().toISOString().split('T')[0],
        duration: sermonData.duration || null,
        notes: sermonData.notes || null,
        tags: sermonData.tags || [],
        is_draft: sermonData.is_draft ?? true,
        word_count: sermonData.word_count || 0,
        estimated_time: sermonData.estimated_time || 0,
        language: sermonData.language || 'english',
        category: sermonData.category || 'general',
        outline: sermonData.outline || null,
        illustrations: sermonData.illustrations || [],
        applications: sermonData.applications || [],
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
    if (!user) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('sermons')
        .delete()
        .eq('id', sermonId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({
        title: "Sermon deleted",
        description: "Your sermon has been deleted",
      });
      
      // If we're editing the deleted sermon, close the editor
      if (editingSermon?.id === sermonId) {
        handleCloseEditor();
      }
      
      await loadSermons();
    } catch (error) {
      console.error('Error deleting sermon:', error);
      toast({
        title: "Error deleting sermon",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSermon = (sermon: SermonEntry) => {
    setEditingSermon(sermon);
    setIsEditing(true);
    setShowEditor(true);
  };

  const handleNewSermon = () => {
    setEditingSermon(null);
    setIsEditing(false);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setIsEditing(false);
    setEditingSermon(null);
    setSelectedSermon(null);
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

  const getSermonStatus = (sermon: SermonEntry) => {
    if (sermon.is_draft) return { text: 'Draft', color: 'bg-yellow-100 text-yellow-700' };
    return { text: 'Complete', color: 'bg-green-100 text-green-700' };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-lg">
          <CardContent className="p-8 text-center">
            <Mic className="h-16 w-16 mx-auto mb-4 text-blue-500" />
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Sermon Writer Access Required</h2>
            <p className="text-gray-600 mb-4">
              Please sign in to access your sermon writing workspace.
            </p>
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="bg-blue-500 hover:bg-blue-600 text-white"
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
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Mic className="h-8 w-8 text-blue-600" />
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

          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sermon Title
                  </label>
                  <Input
                    placeholder="Enter sermon title..."
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
                  />
                </div>

                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sermon Content
                  </label>
                  <Textarea
                    placeholder="Write your sermon content here..."
                    className="min-h-[400px] resize-y"
                  />
                </div>

                {/* Main Points */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Points
                  </label>
                  <Textarea
                    placeholder="List your main sermon points..."
                    className="min-h-[120px]"
                  />
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Congregation
                    </label>
                    <Input placeholder="e.g., Sunday Service, Youth Group" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Duration (minutes)
                    </label>
                    <Input type="number" placeholder="30" />
                  </div>
                </div>

                {/* Save Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="border-blue-300 text-blue-600"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save as Draft
                  </Button>
                  <Button
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Sermon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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
                <Mic className="h-6 w-6 text-blue-600" />
                Sermon Writer
              </h1>
              <Button
                onClick={handleNewSermon}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>

            {/* Calendar Section */}
            <Card className="border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
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
                    day_selected: "bg-blue-500 text-white hover:bg-blue-600",
                    day_today: "bg-blue-50 text-blue-600 font-semibold",
                    day_outside: "text-gray-300",
                  }}
                />
              </CardContent>
            </Card>

            {/* Recent Sermons Section */}
            <Card className="flex-1 border-blue-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
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
                      <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
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
                      {sermons.map((sermon) => {
                        const status = getSermonStatus(sermon);
                        return (
                          <div
                            key={sermon.id}
                            className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                              selectedSermon?.id === sermon.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
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
                                  className="h-5 w-5 p-0 text-gray-400 hover:text-blue-600"
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
                            
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`inline-block text-xs px-2 py-0.5 rounded ${status.color}`}>
                                {status.text}
                              </span>
                              {sermon.scripture_reference && (
                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                                  {sermon.scripture_reference}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                              {sermon.content}
                            </p>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>{formatDate(sermon.created_at)}</span>
                              <div className="flex items-center gap-2">
                                {sermon.duration && (
                                  <span className="flex items-center gap-1">
                                    <Volume2 className="h-3 w-3" />
                                    {sermon.duration}min
                                  </span>
                                )}
                                <span>{formatTime(sermon.created_at)}</span>
                              </div>
                            </div>
                            {sermon.tags && sermon.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {sermon.tags.slice(0, 2).map((tag, index) => (
                                  <span key={index} className="inline-block bg-blue-100 text-blue-700 text-xs px-1 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                                {sermon.tags.length > 2 && (
                                  <span className="text-xs text-gray-400">+{sermon.tags.length - 2}</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
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
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
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
                    {selectedSermon.duration && (
                      <>
                        <span>•</span>
                        <span>{selectedSermon.duration} min sermon</span>
                      </>
                    )}
                  </div>

                  {selectedSermon.scripture_reference && (
                    <div className="mb-2">
                      <span className="inline-block bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded">
                        Scripture: {selectedSermon.scripture_reference}
                      </span>
                    </div>
                  )}

                  {selectedSermon.congregation && (
                    <div className="mb-2">
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                        <Users className="h-3 w-3 inline mr-1" />
                        {selectedSermon.congregation}
                      </span>
                    </div>
                  )}

                  {selectedSermon.tags && selectedSermon.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedSermon.tags.map((tag, index) => (
                        <span key={index} className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sermon Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="prose prose-gray max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {selectedSermon.content.split('\n').map((line, index) => {
                        // Simple markdown rendering
                        let processedLine = line
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>');
                        
                        // Handle bullet points
                        if (line.startsWith('• ')) {
                          return (
                            <div key={index} className="flex items-start gap-2 mb-1">
                              <span className="mt-1.5 w-1 h-1 bg-current rounded-full flex-shrink-0"></span>
                              <span dangerouslySetInnerHTML={{ __html: processedLine.substring(2) }} />
                            </div>
                          );
                        }
                        
                        // Handle main points (numbered)
                        if (line.match(/^\d+\. /)) {
                          return (
                            <div key={index} className="font-semibold text-blue-700 mt-4 mb-2" dangerouslySetInnerHTML={{ __html: processedLine }} />
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
                  <Mic className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h2 className="text-xl font-semibold text-gray-600 mb-2">Select a sermon to read</h2>
                  <p className="text-gray-500 mb-4">Choose from your recent sermons or create a new one</p>
                  <Button
                    onClick={handleNewSermon}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Write New Sermon
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