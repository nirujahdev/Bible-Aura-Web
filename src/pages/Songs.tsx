import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Music, 
  Search, 
  Play, 
  Heart, 
  Share, 
  Download,
  Clock,
  User,
  Star
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

interface Song {
  id: string;
  title: string;
  artist: string;
  category: string;
  duration: string;
  lyrics_preview: string;
  is_favorite: boolean;
}

const MOCK_SONGS: Song[] = [
  {
    id: '1',
    title: 'Amazing Grace',
    artist: 'John Newton',
    category: 'Hymn',
    duration: '4:32',
    lyrics_preview: 'Amazing grace, how sweet the sound, That saved a wretch like me...',
    is_favorite: false
  },
  {
    id: '2',
    title: 'How Great Thou Art',
    artist: 'Stuart Hine',
    category: 'Hymn',
    duration: '3:45',
    lyrics_preview: 'O Lord my God, when I in awesome wonder, Consider all the worlds...',
    is_favorite: true
  },
  {
    id: '3',
    title: 'Way Maker',
    artist: 'Sinach',
    category: 'Contemporary',
    duration: '5:20',
    lyrics_preview: 'You are here, moving in our midst, I worship You, I worship You...',
    is_favorite: false
  },
  {
    id: '4',
    title: 'Great Is Thy Faithfulness',
    artist: 'Thomas Chisholm',
    category: 'Hymn',
    duration: '4:15',
    lyrics_preview: 'Great is thy faithfulness, O God my Father, There is no shadow...',
    is_favorite: false
  },
  {
    id: '5',
    title: 'Blessed Be Your Name',
    artist: 'Matt Redman',
    category: 'Contemporary',
    duration: '4:48',
    lyrics_preview: 'Blessed be your name, In the land that is plentiful...',
    is_favorite: true
  }
];

const SONG_CATEGORIES = ['All', 'Hymn', 'Contemporary', 'Gospel', 'Praise', 'Worship'];

export default function Songs() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [songs, setSongs] = useState<Song[]>(MOCK_SONGS);

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         song.lyrics_preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || song.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (songId: string) => {
    if (!user) {
      return;
    }
    setSongs(prev => prev.map(song => 
      song.id === songId ? { ...song, is_favorite: !song.is_favorite } : song
    ));
  };

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Header */}
      <div className="bg-aura-gradient text-white border-b sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 sm:h-6 sm:w-6" />
            <h1 className="text-xl sm:text-2xl font-divine">Worship Songs</h1>
            <Star className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <p className="text-white/80 mt-1 text-sm sm:text-base">Discover hymns and contemporary worship songs</p>
        </div>
      </div>

      {/* Main Content */}
              <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search songs, artists, or lyrics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {SONG_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Songs Grid */}
          {filteredSongs.length > 0 ? (
            <div className="grid gap-4">
              {filteredSongs.map((song) => (
                <Card key={song.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-aura-gradient rounded-lg flex items-center justify-center text-white">
                          <Music className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg truncate">{song.title}</h3>
                            <Badge variant="secondary">{song.category}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <User className="h-3 w-3" />
                            <span>{song.artist}</span>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>{song.duration}</span>
                          </div>
                          <p className="text-sm text-muted-foreground italic leading-relaxed">
                            {song.lyrics_preview}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <Button variant="ghost" size="sm" className="text-primary">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleFavorite(song.id)}
                          className={song.is_favorite ? 'text-red-500' : 'text-gray-400'}
                          disabled={!user}
                        >
                          <Heart className={`h-4 w-4 ${song.is_favorite ? 'fill-current' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
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
                <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Songs Found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or category filter
                </p>
                <Button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {!user && (
            <Card className="mt-6 border-primary/20">
              <CardContent className="p-6 text-center">
                <Heart className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Sign In for More Features</h3>
                <p className="text-muted-foreground mb-4">
                  Save favorites, create playlists, and access more worship resources
                </p>
                <Button asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
    </div>
  );
} 