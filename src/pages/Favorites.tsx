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
import { MobileOptimizedLayout } from '@/components/MobileOptimizedLayout';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';

interface FavoriteVerse {
  id: string;
  verse_id: string;
  book_name: string;
  chapter: number;
  verse_number: number;
  verse_text: string;
  verse_reference: string;
  translation: string;
  created_at: string;
}

interface BookmarkedVerse {
  id: string;
  verse_id: string;
  book_name: string;
  chapter: number;
  verse_number: number;
  verse_text: string;
  verse_reference: string;
  translation: string;
  category: string;
  highlight_color: string;
  created_at: string;
}

export default function Favorites() {
  useSEO(SEO_CONFIG.FAVORITES);
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('verses');
  const [favoriteVerses, setFavoriteVerses] = useState<FavoriteVerse[]>([]);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<BookmarkedVerse[]>([]);
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
      // Use offline-first service
      const { FavoritesService, BookmarksService } = await import('@/lib/bookmarks-favorites-service');
      
      // Load favorite verses (works offline)
      const favoritesData = await FavoritesService.getUserFavorites(user.id);
      setFavoriteVerses(favoritesData || []);

      // Load bookmarked verses (works offline)
      const bookmarksData = await BookmarksService.getUserBookmarks(user.id);
      setBookmarkedVerses(bookmarksData || []);

    } catch (error) {
      console.error('Error loading favorites and bookmarks:', error);
      toast({
        title: "Error",
        description: "Failed to load favorites and bookmarks. Using offline data if available.",
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
        .from('user_bible_favorites')
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

  const removeBookmark = async (bookmarkId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_bible_bookmarks')
        .delete()
        .eq('id', bookmarkId)
        .eq('user_id', user.id);

      if (error) throw error;

      setBookmarkedVerses(prev => prev.filter(b => b.id !== bookmarkId));
      toast({
        title: "Removed from bookmarks",
        description: "Verse removed from bookmarks",
      });
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to remove bookmark",
        variant: "destructive",
      });
    }
  };

  const filteredVerses = favoriteVerses.filter(verse => 
    verse.book_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    verse.verse_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookmarks = bookmarkedVerses.filter(verse => 
    verse.book_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    <MobileOptimizedLayout>


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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="verses" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Favorites ({favoriteVerses.length})
              </TabsTrigger>
              <TabsTrigger value="bookmarks" className="flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Bookmarks ({bookmarkedVerses.length})
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
                    <Card key={verse.id} className="hover:shadow-md transition-shadow bg-white">
                      <CardContent className="p-4">
                        {/* Header Section */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 flex-shrink-0 fill-current" />
                            <h3 className="font-bold text-base sm:text-lg text-gray-900 truncate">
                              {verse.book_name} {verse.chapter}:{verse.verse_number}
                            </h3>
                            <span className="text-orange-500 text-xs sm:text-sm font-medium flex-shrink-0">Favorite</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 ml-2 flex-shrink-0">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Share functionality
                                if (navigator.share) {
                                  navigator.share({
                                    title: `${verse.book_name} ${verse.chapter}:${verse.verse_number}`,
                                    text: verse.verse_text || '',
                                  }).catch(() => {});
                                } else {
                                  navigator.clipboard.writeText(`${verse.book_name} ${verse.chapter}:${verse.verse_number}\n\n${verse.verse_text || ''}`);
                                  toast({
                                    title: "Copied to clipboard",
                                    description: "Verse text copied to clipboard",
                                  });
                                }
                              }}
                            >
                              <Share className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFavoriteVerse(verse.id);
                              }}
                              className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                            >
                              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                          </div>
                        </div>

                        {/* Verse Content */}
                        {verse.verse_text && (
                          <p className="text-gray-900 text-sm sm:text-base leading-relaxed mb-3">
                            {verse.verse_text}
                          </p>
                        )}

                        {/* Footer Section */}
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 pt-2 border-t border-gray-100">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span>Added {new Date(verse.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
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

            {/* Bookmarked Verses */}
            <TabsContent value="bookmarks">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Loading bookmarks...</p>
                </div>
              ) : filteredBookmarks.length > 0 ? (
                <div className="grid gap-4">
                  {filteredBookmarks.map((bookmark) => (
                    <Card key={bookmark.id} className="hover:shadow-md transition-shadow bg-white">
                      <CardContent className="p-4">
                        {/* Header Section */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 flex-shrink-0" />
                            <h3 className="font-bold text-base sm:text-lg text-gray-900 truncate">
                              {bookmark.book_name} {bookmark.chapter}:{bookmark.verse_number}
                            </h3>
                            <span className="text-orange-500 text-xs sm:text-sm font-medium flex-shrink-0">Bookmark</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 ml-2 flex-shrink-0">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Share functionality
                                if (navigator.share) {
                                  navigator.share({
                                    title: `${bookmark.book_name} ${bookmark.chapter}:${bookmark.verse_number}`,
                                    text: bookmark.verse_text || '',
                                  }).catch(() => {});
                                } else {
                                  navigator.clipboard.writeText(`${bookmark.book_name} ${bookmark.chapter}:${bookmark.verse_number}\n\n${bookmark.verse_text || ''}`);
                                  toast({
                                    title: "Copied to clipboard",
                                    description: "Verse text copied to clipboard",
                                  });
                                }
                              }}
                            >
                              <Share className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeBookmark(bookmark.id);
                              }}
                              className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                            >
                              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                          </div>
                        </div>

                        {/* Verse Content */}
                        {bookmark.verse_text && (
                          <p className="text-gray-900 text-sm sm:text-base leading-relaxed mb-3">
                            {bookmark.verse_text}
                          </p>
                        )}

                        {/* Footer Section */}
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 pt-2 border-t border-gray-100">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span>Added {new Date(bookmark.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Bookmarked Verses Yet</h3>
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
          </Tabs>
        </div>
      </div>
    </MobileOptimizedLayout>
  );
} 