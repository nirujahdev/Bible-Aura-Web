import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Star, 
  Bookmark, 
  StickyNote, 
  Palette, 
  Search, 
  Filter,
  BookOpen,
  Calendar,
  Trash2,
  Share
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';

interface FavoriteVerse {
  id: string;
  verse_id: string;
  book?: string;
  chapter?: number;
  verse?: number;
  text?: string;
  created_at: string;
}

interface FavoriteNote {
  id: string;
  title?: string;
  content: string;
  category: string;
  verse_id: string;
  tags: string[];
  created_at: string;
}

interface FavoriteHighlight {
  id: string;
  verse_id: string;
  color: string;
  category: string;
  created_at: string;
}

export default function Favorites() {
  useSEO(SEO_CONFIG.FAVORITES);
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('verses');
  const [favoriteVerses, setFavoriteVerses] = useState<FavoriteVerse[]>([]);
  const [favoriteNotes, setFavoriteNotes] = useState<FavoriteNote[]>([]);
  const [favoriteHighlights, setFavoriteHighlights] = useState<FavoriteHighlight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load bookmarked verses
      const { data: bookmarksData, error: bookmarksError } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (bookmarksError) throw bookmarksError;
      setFavoriteVerses((bookmarksData as unknown as FavoriteVerse[]) || []);

      // Mock favorite notes (would need notes table)
      setFavoriteNotes([]);
      
      // Mock favorite highlights (would need highlights table)
      setFavoriteHighlights([]);

    } catch (error) {
      console.error('Error loading favorites:', error);
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavoriteVerse = async (verseId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', verseId)
        .eq('user_id', user.id);

      if (error) throw error;

      setFavoriteVerses(prev => prev.filter(v => v.id !== verseId));
      toast({
        title: "Removed from favorites",
        description: "Verse removed from favorites",
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove favorite",
        variant: "destructive",
      });
    }
  };

  const filteredVerses = favoriteVerses.filter(verse => 
    verse.book?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    verse.verse_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center w-full">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your favorite verses, notes, and highlights
            </p>
            <Button asChild className="w-full">
              <Link to="/auth">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageLayout padding="none" maxWidth="full">


      {/* Main Content */}
      <div className="flex-1 overflow-auto min-h-screen bg-background">
        <div className="w-full px-4 py-6">
          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search favorites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="verses" className="flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Verses ({favoriteVerses.length})
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                Notes ({favoriteNotes.length})
              </TabsTrigger>
              <TabsTrigger value="highlights" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Highlights ({favoriteHighlights.length})
              </TabsTrigger>
            </TabsList>

            {/* Favorite Verses */}
            <TabsContent value="verses">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Loading favorites...</p>
                </div>
              ) : filteredVerses.length > 0 ? (
                <div className="grid gap-4">
                  {filteredVerses.map((verse) => (
                    <Card key={verse.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="h-4 w-4 text-primary" />
                              <h3 className="font-semibold text-lg">
                                {verse.book} {verse.chapter}:{verse.verse}
                              </h3>
                              <Badge variant="secondary">Bookmarked</Badge>
                            </div>
                            {verse.text && (
                              <p className="text-muted-foreground mb-3 leading-relaxed">
                                {verse.text}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              Added {new Date(verse.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-4">
                            <Button variant="ghost" size="sm">
                              <Share className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeFavoriteVerse(verse.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Favorite Verses Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start bookmarking verses while reading the Bible to see them here
                    </p>
                    <Button asChild>
                      <Link to="/bible">Browse Bible</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Favorite Notes */}
            <TabsContent value="notes">
              <Card>
                <CardContent className="p-12 text-center">
                  <StickyNote className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Favorite Notes Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Take notes on verses and mark them as favorites to see them here
                  </p>
                  <Button asChild>
                    <Link to="/bible">Start Taking Notes</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favorite Highlights */}
            <TabsContent value="highlights">
              <Card>
                <CardContent className="p-12 text-center">
                  <Palette className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Favorite Highlights Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Highlight verses and mark them as favorites to see them here
                  </p>
                  <Button asChild>
                    <Link to="/bible">Start Highlighting</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
} 