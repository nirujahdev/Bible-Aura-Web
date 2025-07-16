import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  StickyNote, 
  Save, 
  Edit3, 
  Trash2, 
  Tag, 
  Calendar, 
  Star, 
  Heart, 
  BookOpen, 
  MessageCircle,
  Plus,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Note {
  id: string;
  verse_id: string;
  content: string;
  title?: string;
  tags: string[];
  category: 'reflection' | 'prayer' | 'study' | 'insight' | 'question';
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
}

interface NoteTakingProps {
  verseId: string;
  verseText: string;
  verseReference: string;
  isOpen: boolean;
  onClose: () => void;
}

const NOTE_CATEGORIES = [
  { value: 'reflection', label: 'Personal Reflection', icon: Heart, color: 'bg-pink-100 text-pink-800' },
  { value: 'prayer', label: 'Prayer Points', icon: Star, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'study', label: 'Bible Study', icon: BookOpen, color: 'bg-blue-100 text-blue-800' },
  { value: 'insight', label: 'Divine Insight', icon: MessageCircle, color: 'bg-purple-100 text-purple-800' },
  { value: 'question', label: 'Questions', icon: StickyNote, color: 'bg-green-100 text-green-800' },
];

export function NoteTaking({ verseId, verseText, verseReference, isOpen, onClose }: NoteTakingProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // New note form state
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'reflection' as Note['category'],
    tags: [] as string[],
    tagInput: ''
  });

  useEffect(() => {
    if (isOpen && user) {
      loadNotes();
    }
  }, [isOpen, user, verseId]);

  const loadNotes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('verse_id', verseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!user || !newNote.content.trim()) return;

    try {
      const noteData = {
        user_id: user.id,
        verse_id: verseId,
        title: newNote.title.trim() || null,
        content: newNote.content.trim(),
        category: newNote.category,
        tags: newNote.tags,
        is_favorite: false
      };

      const { data, error } = await supabase
        .from('notes')
        .insert([noteData])
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => [data, ...prev]);
      setNewNote({
        title: '',
        content: '',
        category: 'reflection',
        tags: [],
        tagInput: ''
      });
      setIsCreating(false);

      toast({
        title: "Note saved",
        description: "Your note has been saved successfully",
      });
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== noteId));
      toast({
        title: "Note deleted",
        description: "Note has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = async (noteId: string, currentFavorite: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_favorite: !currentFavorite })
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, is_favorite: !currentFavorite } : note
      ));
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const addTag = () => {
    if (newNote.tagInput.trim() && !newNote.tags.includes(newNote.tagInput.trim())) {
      setNewNote(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewNote(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5" />
                Notes for {verseReference}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1 italic">
                "{verseText.substring(0, 100)}..."
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto p-6">
          {!user ? (
            <div className="text-center py-8">
              <StickyNote className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Sign in to take notes on this verse</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Create New Note Button */}
              {!isCreating && (
                <Button 
                  onClick={() => setIsCreating(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Note
                </Button>
              )}

              {/* New Note Form */}
              {isCreating && (
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-4">
                      <Input
                        placeholder="Note title (optional)"
                        value={newNote.title}
                        onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                        className="flex-1"
                      />
                      <Select
                        value={newNote.category}
                        onValueChange={(value) => setNewNote(prev => ({ ...prev, category: value as Note['category'] }))}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {NOTE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              <div className="flex items-center gap-2">
                                <cat.icon className="h-4 w-4" />
                                {cat.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Textarea
                      placeholder="Write your note here..."
                      value={newNote.content}
                      onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                      className="min-h-[120px]"
                    />

                    {/* Tags Input */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Add tag..."
                          value={newNote.tagInput}
                          onChange={(e) => setNewNote(prev => ({ ...prev, tagInput: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                          className="flex-1"
                        />
                        <Button onClick={addTag} size="sm" variant="outline">
                          <Tag className="h-4 w-4" />
                        </Button>
                      </div>
                      {newNote.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {newNote.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                              {tag}
                              <button onClick={() => removeTag(tag)}>
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsCreating(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveNote} disabled={!newNote.content.trim()}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Note
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Existing Notes */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading notes...</p>
                </div>
              ) : notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note) => {
                    const category = NOTE_CATEGORIES.find(cat => cat.value === note.category);
                    const CategoryIcon = category?.icon || StickyNote;
                    
                    return (
                      <Card key={note.id} className="relative">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <CategoryIcon className="h-4 w-4" />
                              {note.title && (
                                <h4 className="font-medium">{note.title}</h4>
                              )}
                              <Badge className={category?.color || 'bg-gray-100 text-gray-800'}>
                                {category?.label || note.category}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleFavorite(note.id, note.is_favorite)}
                                className={note.is_favorite ? 'text-yellow-500' : ''}
                              >
                                <Star className={`h-4 w-4 ${note.is_favorite ? 'fill-current' : ''}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNote(note.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-sm leading-relaxed mb-3">{note.content}</p>
                          
                          {note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {note.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(note.created_at).toLocaleDateString()}
                            {note.created_at !== note.updated_at && (
                              <span>• Updated {new Date(note.updated_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notes yet for this verse</p>
                  <p className="text-sm">Click "Add New Note" to get started</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 