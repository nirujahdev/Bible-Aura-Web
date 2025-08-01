import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Heart, 
  Star, 
  Palette, 
  BookOpen, 
  MessageCircle,
  Clock,
  Tag,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Highlight {
  id: string;
  verse_id: string;
  color: HighlightColor;
  category: HighlightCategory;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

type HighlightColor = 
  | 'yellow' 
  | 'green' 
  | 'blue' 
  | 'purple' 
  | 'pink' 
  | 'orange' 
  | 'red' 
  | 'gray';

type HighlightCategory = 
  | 'favorite'
  | 'prayer'
  | 'study'
  | 'memory'
  | 'encouragement'
  | 'wisdom'
  | 'prophecy'
  | 'promise';

interface HighlightSystemProps {
  verseId: string;
  currentHighlight?: Highlight | null;
  onHighlightChange: (highlight: Highlight | null) => void;
  compact?: boolean;
}

const HIGHLIGHT_COLORS = [
  { id: 'yellow' as HighlightColor, name: 'Yellow', bg: 'bg-yellow-200', text: 'text-yellow-800', border: 'border-yellow-300' },
  { id: 'green' as HighlightColor, name: 'Green', bg: 'bg-green-200', text: 'text-green-800', border: 'border-green-300' },
  { id: 'blue' as HighlightColor, name: 'Blue', bg: 'bg-blue-200', text: 'text-blue-800', border: 'border-blue-300' },
  { id: 'purple' as HighlightColor, name: 'Purple', bg: 'bg-purple-200', text: 'text-purple-800', border: 'border-purple-300' },
  { id: 'pink' as HighlightColor, name: 'Pink', bg: 'bg-pink-200', text: 'text-pink-800', border: 'border-pink-300' },
  { id: 'orange' as HighlightColor, name: 'Orange', bg: 'bg-orange-200', text: 'text-orange-800', border: 'border-orange-300' },
  { id: 'red' as HighlightColor, name: 'Red', bg: 'bg-red-200', text: 'text-red-800', border: 'border-red-300' },
  { id: 'gray' as HighlightColor, name: 'Gray', bg: 'bg-gray-200', text: 'text-gray-800', border: 'border-gray-300' },
];

const HIGHLIGHT_CATEGORIES = [
  { id: 'favorite' as HighlightCategory, name: 'Favorite', icon: Heart, color: 'text-red-500' },
  { id: 'prayer' as HighlightCategory, name: 'Prayer', icon: Star, color: 'text-yellow-500' },
  { id: 'study' as HighlightCategory, name: 'Study', icon: BookOpen, color: 'text-blue-500' },
  { id: 'memory' as HighlightCategory, name: 'Memory Verse', icon: MessageCircle, color: 'text-purple-500' },
  { id: 'encouragement' as HighlightCategory, name: 'Encouragement', icon: Heart, color: 'text-green-500' },
  { id: 'wisdom' as HighlightCategory, name: 'Wisdom', icon: Star, color: 'text-indigo-500' },
  { id: 'prophecy' as HighlightCategory, name: 'Prophecy', icon: Clock, color: 'text-orange-500' },
  { id: 'promise' as HighlightCategory, name: 'Promise', icon: Tag, color: 'text-pink-500' },
];

export function HighlightSystem({ verseId, currentHighlight, onHighlightChange, compact = false }: HighlightSystemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<HighlightColor>('yellow');
  const [selectedCategory, setSelectedCategory] = useState<HighlightCategory>('favorite');

  const handleHighlight = async (color: HighlightColor, category: HighlightCategory) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to highlight verses",
        variant: "destructive",
      });
      return;
    }

    try {
      // If already highlighted, update it
      if (currentHighlight) {
        const { data, error } = await supabase
          .from('verse_highlights')
          .update({
            color: color,
            category: category,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentHighlight.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        onHighlightChange(data);
        toast({
          title: "Highlight updated",
          description: `Changed to ${color} highlight`,
        });
      } else {
        // Create new highlight
        const { data, error } = await supabase
          .from('verse_highlights')
          .insert([{
            user_id: user.id,
            verse_id: verseId,
            color: color,
            category: category,
            is_favorite: category === 'favorite'
          }])
          .select()
          .single();

        if (error) throw error;
        onHighlightChange(data);
        toast({
          title: "Verse highlighted",
          description: `Added ${color} highlight`,
        });
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error managing highlight:', error);
      toast({
        title: "Error",
        description: "Failed to update highlight",
        variant: "destructive",
      });
    }
  };

  const handleRemoveHighlight = async () => {
    if (!user || !currentHighlight) return;

    try {
      const { error } = await supabase
        .from('verse_highlights')
        .delete()
        .eq('id', currentHighlight.id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      onHighlightChange(null);
      toast({
        title: "Highlight removed",
        description: "Verse highlight has been removed",
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error removing highlight:', error);
      toast({
        title: "Error",
        description: "Failed to remove highlight",
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) return;

    try {
      if (currentHighlight) {
        // Update existing highlight favorite status
        const { data, error } = await supabase
          .from('verse_highlights')
          .update({
            is_favorite: !currentHighlight.is_favorite,
            category: !currentHighlight.is_favorite ? 'favorite' : currentHighlight.category,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentHighlight.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        onHighlightChange(data);
      } else {
        // Create new favorite highlight
        const { data, error } = await supabase
          .from('verse_highlights')
          .insert([{
            user_id: user.id,
            verse_id: verseId,
            color: 'yellow',
            category: 'favorite',
            is_favorite: true
          }])
          .select()
          .single();

        if (error) throw error;
        onHighlightChange(data);
      }

      toast({
        title: currentHighlight?.is_favorite ? "Removed from favorites" : "Added to favorites",
        description: currentHighlight?.is_favorite ? "Verse removed from favorites" : "Verse added to favorites",
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    }
  };

  const getHighlightClasses = (color: HighlightColor) => {
    const colorConfig = HIGHLIGHT_COLORS.find(c => c.id === color);
    return colorConfig ? `${colorConfig.bg} ${colorConfig.border} border` : '';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleFavorite}
          className={`p-1 h-6 w-6 ${currentHighlight?.is_favorite ? 'text-red-500' : 'text-gray-400'}`}
        >
          <Heart className={`h-3 w-3 ${currentHighlight?.is_favorite ? 'fill-current' : ''}`} />
        </Button>
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`p-1 h-6 w-6 ${currentHighlight ? 'text-primary' : 'text-gray-400'}`}
            >
              <Palette className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Highlight Verse</h4>
                {currentHighlight && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRemoveHighlight}
                    className="text-red-500 hover:text-red-700 p-1 h-6"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-2 block">Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {HIGHLIGHT_COLORS.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`w-full h-8 rounded border-2 transition-all ${
                        selectedColor === color.id ? 'border-gray-400 scale-105' : 'border-gray-200'
                      } ${color.bg}`}
                      title={color.name}
                    >
                      {selectedColor === color.id && (
                        <Check className="h-4 w-4 mx-auto text-gray-700" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-2 block">Category</label>
                <div className="grid grid-cols-2 gap-1">
                  {HIGHLIGHT_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-1 p-2 rounded text-xs transition-colors ${
                        selectedCategory === category.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <category.icon className="h-3 w-3" />
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => handleHighlight(selectedColor, selectedCategory)}
                className="w-full h-8 text-xs"
                size="sm"
              >
                {currentHighlight ? 'Update Highlight' : 'Add Highlight'}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Verse Highlighting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        {currentHighlight && (
          <div className="p-3 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${getHighlightClasses(currentHighlight.color)}`}></div>
                <span className="text-sm font-medium">Currently highlighted</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRemoveHighlight}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {HIGHLIGHT_COLORS.find(c => c.id === currentHighlight.color)?.name}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {HIGHLIGHT_CATEGORIES.find(c => c.id === currentHighlight.category)?.name}
              </Badge>
              {currentHighlight.is_favorite && (
                <Badge variant="outline" className="text-xs text-red-500">
                  <Heart className="h-3 w-3 mr-1 fill-current" />
                  Favorite
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Favorite Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-2">
            <Heart className={`h-4 w-4 ${currentHighlight?.is_favorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
            <span className="text-sm">Mark as Favorite</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleToggleFavorite}
            className={currentHighlight?.is_favorite ? 'text-red-500' : ''}
          >
            {currentHighlight?.is_favorite ? 'Remove' : 'Add'}
          </Button>
        </div>

        {/* Color Selection */}
        <div>
          <label className="text-sm font-medium mb-3 block">Highlight Color</label>
          <div className="grid grid-cols-4 gap-2">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color.id)}
                className={`w-full h-10 rounded border-2 transition-all ${
                  selectedColor === color.id ? 'border-gray-400 scale-105' : 'border-gray-200'
                } ${color.bg} hover:scale-105`}
                title={color.name}
              >
                {selectedColor === color.id && (
                  <Check className="h-5 w-5 mx-auto text-gray-700" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="text-sm font-medium mb-3 block">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {HIGHLIGHT_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 p-3 rounded border transition-colors ${
                  selectedCategory === category.id 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <category.icon className="h-4 w-4" />
                <span className="text-sm">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <Button 
          onClick={() => handleHighlight(selectedColor, selectedCategory)}
          className="w-full"
        >
          {currentHighlight ? 'Update Highlight' : 'Apply Highlight'}
        </Button>
      </CardContent>
    </Card>
  );
} 