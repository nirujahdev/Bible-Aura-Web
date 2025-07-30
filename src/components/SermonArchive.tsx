import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, 
  Search, Filter, Bookmark, BookmarkCheck, Share2, Download, 
  Star, StarIcon, Clock, Calendar, MapPin, User, Book,
  ChevronLeft, ChevronRight, Mic, Users, Globe, Award,
  ExternalLink, Link, Copy, FileText, History, Heart,
  BookOpen, Headphones, Video, Transcript, Info
} from "lucide-react";

interface Preacher {
  id: string;
  name: string;
  birth_year: number | null;
  death_year: number | null;
  biography: string;
  theological_tradition: string;
  era: 'Classic' | 'Modern' | 'Contemporary';
  nationality: string;
  denominational_affiliation: string;
  notable_works: string[];
  photo_url: string | null;
  website_url: string | null;
}

interface Sermon {
  id: string;
  preacher: Preacher;
  title: string;
  scripture_reference: string;
  content_text: string;
  audio_url: string | null;
  video_url: string | null;
  transcript: string | null;
  sermon_date: string | null;
  location: string;
  occasion: string;
  duration_minutes: number | null;
  themes: string[];
  theological_points: string[];
  rhetorical_analysis: { structure: string; techniques: string[] };
  historical_context: string;
  series_name: string | null;
  series_order: number | null;
  language: string;
  translation_used: string;
  view_count: number;
  rating: number;
}

interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
}

const SermonArchive = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // State management
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [preachers, setPreachers] = useState<Preacher[]>([]);
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [bookmarkedSermons, setBookmarkedSermons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const sermonsPerPage = 12;
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPreacher, setSelectedPreacher] = useState("all");
  const [selectedEra, setSelectedEra] = useState("all");
  const [selectedTheme, setSelectedTheme] = useState("all");
  const [selectedTranslation, setSelectedTranslation] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [hasAudio, setHasAudio] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  
  // Audio player state
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1
  });
  
  // UI state
  const [showPreacherBio, setShowPreacherBio] = useState(false);
  const [selectedPreacherBio, setSelectedPreacherBio] = useState<Preacher | null>(null);
  const [showSermonDetails, setShowSermonDetails] = useState(false);

  // Famous preachers by era
  const famousPreachers = {
    Classic: [
      "Charles Spurgeon", "John Chrysostom", "Augustine", "Jonathan Edwards",
      "George Whitefield", "John Wesley", "Martin Luther", "John Calvin",
      "Thomas Aquinas", "Origen", "Clement of Alexandria", "Basil the Great"
    ],
    Modern: [
      "John Stott", "Martyn Lloyd-Jones", "A.W. Tozer",
      "Watchman Nee", "Oswald Chambers", "F.B. Meyer", "G. Campbell Morgan",
      "Alexander Maclaren", "Joseph Parker", "R.W. Dale", "Phillips Brooks"
    ],
    Contemporary: [
      "John MacArthur", "R.C. Sproul", "Tim Keller", "David Platt",
      "John Piper", "Paul Washer", "Francis Chan", "Matt Chandler",
      "Steven Furtick", "Andy Stanley", "Rick Warren", "Craig Groeschel"
    ]
  };

  // Common sermon themes
  const commonThemes = [
    "Salvation", "Grace", "Faith", "Love", "Hope", "Peace", "Joy",
    "Prayer", "Worship", "Discipleship", "Leadership", "Service",
    "Stewardship", "Evangelism", "Missions", "Church", "Family",
    "Suffering", "Trials", "Victory", "Eternal Life", "Second Coming"
  ];

  useEffect(() => {
    fetchSermons();
    fetchPreachers();
    if (user) {
      fetchBookmarkedSermons();
    }
  }, [user]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setAudioState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0
      }));
    };

    const handleEnded = () => {
      setAudioState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', updateTime);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', updateTime);
    };
  }, [selectedSermon]);

  const fetchSermons = async () => {
    try {
      const { data, error } = await supabase
        .from('famous_sermons')
        .select(`
          *,
          preacher:preachers(*)
        `)
        .order('rating', { ascending: false })
        .order('view_count', { ascending: false });

      if (error) throw error;
      setSermons(data || []);
    } catch (error: unknown) {
      toast({
        title: "Error loading sermons",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPreachers = async () => {
    try {
      const { data, error } = await supabase
        .from('preachers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setPreachers(data || []);
    } catch (error: unknown) {
      console.error('Error fetching preachers:', error);
    }
  };

  const fetchBookmarkedSermons = async () => {
    try {
      const { data, error } = await supabase
        .from('user_sermon_bookmarks')
        .select('sermon_id')
        .eq('user_id', user?.id);

      if (error) throw error;
      setBookmarkedSermons(data?.map(b => b.sermon_id) || []);
    } catch (error: unknown) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const toggleBookmark = async (sermonId: string) => {
    if (!user) return;

    try {
      if (bookmarkedSermons.includes(sermonId)) {
        const { error } = await supabase
          .from('user_sermon_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('sermon_id', sermonId);

        if (error) throw error;
        setBookmarkedSermons(prev => prev.filter(id => id !== sermonId));
        toast({ title: "Bookmark removed" });
      } else {
        const { error } = await supabase
          .from('user_sermon_bookmarks')
          .insert({
            user_id: user.id,
            sermon_id: sermonId
          });

        if (error) throw error;
        setBookmarkedSermons(prev => [...prev, sermonId]);
        toast({ title: "Bookmark added" });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error updating bookmark",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const playAudio = (sermon: Sermon) => {
    if (!sermon.audio_url) return;

    const audio = audioRef.current;
    if (!audio) return;

    if (selectedSermon?.id === sermon.id) {
      if (audioState.isPlaying) {
        audio.pause();
        setAudioState(prev => ({ ...prev, isPlaying: false }));
      } else {
        audio.play();
        setAudioState(prev => ({ ...prev, isPlaying: true }));
      }
    } else {
      setSelectedSermon(sermon);
      audio.src = sermon.audio_url;
      audio.load();
      audio.play();
      setAudioState(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const seekAudio = (time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setAudioState(prev => ({ ...prev, currentTime: time }));
    }
  };

  const changeVolume = (volume: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      setAudioState(prev => ({ ...prev, volume }));
    }
  };

  const changePlaybackRate = (rate: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = rate;
      setAudioState(prev => ({ ...prev, playbackRate: rate }));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const incrementViewCount = async (sermonId: string) => {
    try {
      await supabase
        .from('famous_sermons')
        .update({ view_count: (selectedSermon?.view_count || 0) + 1 })
        .eq('id', sermonId);
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const shareSermon = async (sermon: Sermon) => {
    const shareText = `"${sermon.title}" by ${sermon.preacher.name}`;
    
    if (navigator.share) {
      await navigator.share({
        title: sermon.title,
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText + ` - ${window.location.href}`);
      toast({ title: "Link copied to clipboard" });
    }
  };

  // Filter and sort sermons
  const filteredSermons = useMemo(() => {
    const filtered = sermons.filter(sermon => {
      const matchesSearch = !searchQuery || 
        sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sermon.preacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sermon.themes.some(theme => theme.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesPreacher = selectedPreacher === "all" || sermon.preacher.id === selectedPreacher;
      const matchesEra = selectedEra === "all" || sermon.preacher.era === selectedEra;
      const matchesTheme = selectedTheme === "all" || sermon.themes.includes(selectedTheme);
      const matchesTranslation = selectedTranslation === "all" || sermon.translation_used === selectedTranslation;
      const matchesAudio = !hasAudio || sermon.audio_url;
      const matchesVideo = !hasVideo || sermon.video_url;
      
      return matchesSearch && matchesPreacher && matchesEra && matchesTheme && 
             matchesTranslation && matchesAudio && matchesVideo;
    });

    // Sort sermons
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'preacher':
          return a.preacher.name.localeCompare(b.preacher.name);
        case 'date':
          return new Date(b.sermon_date || 0).getTime() - new Date(a.sermon_date || 0).getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'views':
          return b.view_count - a.view_count;
        case 'duration':
          return (b.duration_minutes || 0) - (a.duration_minutes || 0);
        default:
          return b.rating - a.rating; // relevance
      }
    });

    return filtered;
  }, [sermons, searchQuery, selectedPreacher, selectedEra, selectedTheme, 
      selectedTranslation, hasAudio, hasVideo, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredSermons.length / sermonsPerPage);
  const paginatedSermons = filteredSermons.slice(
    (currentPage - 1) * sermonsPerPage,
    currentPage * sermonsPerPage
  );

  const renderSermonCard = (sermon: Sermon) => {
    const isBookmarked = bookmarkedSermons.includes(sermon.id);
    const isCurrentlyPlaying = selectedSermon?.id === sermon.id && audioState.isPlaying;

    return (
      <Card key={sermon.id} className="hover:shadow-lg transition-all duration-300">
        <CardContent className="p-0">
          {/* Sermon Header */}
          <div className="p-4 border-b">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={sermon.preacher.photo_url || ''} />
                <AvatarFallback>
                  {sermon.preacher.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg leading-tight mb-1">
                  {sermon.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  by <span 
                    className="font-medium cursor-pointer hover:text-orange-600"
                    onClick={() => {
                      setSelectedPreacherBio(sermon.preacher);
                      setShowPreacherBio(true);
                    }}
                  >
                    {sermon.preacher.name}
                  </span>
                </p>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {sermon.sermon_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(sermon.sermon_date).getFullYear()}
                    </span>
                  )}
                  {sermon.duration_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {sermon.duration_minutes}min
                    </span>
                  )}
                  {sermon.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {sermon.location}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleBookmark(sermon.id)}
                >
                  {isBookmarked ? 
                    <BookmarkCheck className="h-4 w-4 text-orange-600" /> :
                    <Bookmark className="h-4 w-4" />
                  }
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => shareSermon(sermon)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Scripture Reference */}
          {sermon.scripture_reference && (
            <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                <Book className="h-3 w-3 inline mr-1" />
                {sermon.scripture_reference}
              </p>
            </div>
          )}

          {/* Sermon Content Preview */}
          <div className="p-4">
            <div className="flex flex-wrap gap-1 mb-3">
              {sermon.themes.slice(0, 3).map(theme => (
                <Badge key={theme} variant="secondary" className="text-xs">
                  {theme}
                </Badge>
              ))}
              {sermon.themes.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{sermon.themes.length - 3} more
                </Badge>
              )}
            </div>

            {sermon.content_text && (
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                {sermon.content_text.substring(0, 150)}...
              </p>
            )}

            {/* Media Controls */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {sermon.audio_url && (
                  <Button
                    size="sm"
                    variant={isCurrentlyPlaying ? "default" : "outline"}
                    onClick={() => playAudio(sermon)}
                  >
                    {isCurrentlyPlaying ? (
                      <Pause className="h-4 w-4 mr-1" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    Audio
                  </Button>
                )}
                
                {sermon.video_url && (
                  <Button size="sm" variant="outline">
                    <Video className="h-4 w-4 mr-1" />
                    Video
                  </Button>
                )}
                
                {sermon.transcript && (
                  <Button size="sm" variant="outline">
                    <FileText className="h-4 w-4 mr-1" />
                    Transcript
                  </Button>
                )}
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedSermon(sermon);
                  setShowSermonDetails(true);
                  incrementViewCount(sermon.id);
                }}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Details
              </Button>
            </div>

            {/* Rating and Stats */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <StarIcon
                      key={star}
                      className={`h-3 w-3 ${
                        star <= sermon.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {sermon.rating.toFixed(1)}
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{sermon.view_count} views</span>
                <Badge variant="outline" className="text-xs">
                  {sermon.preacher.era}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="h-screen bg-background overflow-hidden flex flex-col">
        <div className="bg-aura-gradient text-white p-4 border-b flex-shrink-0">
          <div className="w-full">
            <div className="flex items-center gap-2">
              <Mic className="h-6 w-6" />
              <h1 className="text-2xl font-divine">Sermon Archive</h1>
              <Star className="h-5 w-5" />
            </div>
            <p className="text-white/80 mt-1">Famous sermons from renowned preachers across history</p>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading sermon archive...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-aura-gradient text-white p-4 border-b flex-shrink-0">
        <div className="w-full">
          <div className="flex items-center gap-2">
            <Mic className="h-6 w-6" />
            <h1 className="text-2xl font-divine">Sermon Archive</h1>
            <Star className="h-5 w-5" />
          </div>
          <p className="text-white/80 mt-1">Famous sermons from renowned preachers across history</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Search and Filters */}
          <div className="p-6 border-b bg-gray-50 dark:bg-gray-900/50">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sermons, preachers, themes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedPreacher} onValueChange={setSelectedPreacher}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Preachers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Preachers</SelectItem>
                    {preachers.map(preacher => (
                      <SelectItem key={preacher.id} value={preacher.id}>
                        {preacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedEra} onValueChange={setSelectedEra}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Eras" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Eras</SelectItem>
                    <SelectItem value="Classic">Classic</SelectItem>
                    <SelectItem value="Modern">Modern</SelectItem>
                    <SelectItem value="Contemporary">Contemporary</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="preacher">Preacher</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="views">Views</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-wrap gap-4 items-center">
                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Themes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Themes</SelectItem>
                    {commonThemes.map(theme => (
                      <SelectItem key={theme} value={theme}>
                        {theme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedTranslation} onValueChange={setSelectedTranslation}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Translation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Translations</SelectItem>
                    <SelectItem value="KJV">KJV</SelectItem>
                    <SelectItem value="ESV">ESV</SelectItem>
                    <SelectItem value="NIV">NIV</SelectItem>
                    <SelectItem value="NASB">NASB</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={hasAudio}
                      onChange={(e) => setHasAudio(e.target.checked)}
                      className="rounded"
                    />
                    <Headphones className="h-4 w-4" />
                    Has Audio
                  </label>
                  
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={hasVideo}
                      onChange={(e) => setHasVideo(e.target.checked)}
                      className="rounded"
                    />
                    <Video className="h-4 w-4" />
                    Has Video
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sermons Grid */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  Showing {paginatedSermons.length} of {filteredSermons.length} sermons
                </p>
                
                {/* Pagination */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedSermons.map(renderSermonCard)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Player */}
      {selectedSermon && selectedSermon.audio_url && (
        <div className="border-t bg-white dark:bg-gray-900 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => playAudio(selectedSermon)}
              >
                {audioState.isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">{selectedSermon.title}</span>
                  <span>{formatTime(audioState.currentTime)} / {formatTime(audioState.duration)}</span>
                </div>
                <Progress 
                  value={(audioState.currentTime / audioState.duration) * 100 || 0}
                  className="cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = x / rect.width;
                    seekAudio(percentage * audioState.duration);
                  }}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Select 
                  value={audioState.playbackRate.toString()} 
                  onValueChange={(value) => changePlaybackRate(parseFloat(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5x</SelectItem>
                    <SelectItem value="0.75">0.75x</SelectItem>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="1.25">1.25x</SelectItem>
                    <SelectItem value="1.5">1.5x</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => changeVolume(audioState.volume === 0 ? 1 : 0)}
                >
                  {audioState.volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          <audio
            ref={audioRef}
            onPlay={() => setAudioState(prev => ({ ...prev, isPlaying: true }))}
            onPause={() => setAudioState(prev => ({ ...prev, isPlaying: false }))}
          />
        </div>
      )}

      {/* Preacher Biography Dialog */}
      <Dialog open={showPreacherBio} onOpenChange={setShowPreacherBio}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {selectedPreacherBio?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedPreacherBio && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedPreacherBio.photo_url || ''} />
                  <AvatarFallback>
                    {selectedPreacherBio.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{selectedPreacherBio.name}</h2>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    {selectedPreacherBio.birth_year && (
                      <span>
                        {selectedPreacherBio.birth_year}
                        {selectedPreacherBio.death_year && ` - ${selectedPreacherBio.death_year}`}
                      </span>
                    )}
                    <span>{selectedPreacherBio.nationality}</span>
                    <Badge variant="outline">{selectedPreacherBio.era}</Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Biography</h3>
                  <p className="text-muted-foreground">{selectedPreacherBio.biography}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Theological Tradition:</span> {selectedPreacherBio.theological_tradition}
                    </div>
                    <div>
                      <span className="font-medium">Denomination:</span> {selectedPreacherBio.denominational_affiliation}
                    </div>
                    {selectedPreacherBio.notable_works && selectedPreacherBio.notable_works.length > 0 && (
                      <div>
                        <span className="font-medium">Notable Works:</span>
                        <ul className="list-disc list-inside mt-1 ml-4">
                          {selectedPreacherBio.notable_works.map((work, index) => (
                            <li key={index} className="text-muted-foreground">{work}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedPreacherBio.website_url && (
                <div className="pt-4 border-t">
                  <Button variant="outline" asChild>
                    <a 
                      href={selectedPreacherBio.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sermon Details Dialog */}
      <Dialog open={showSermonDetails} onOpenChange={setShowSermonDetails}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedSermon?.title}</DialogTitle>
          </DialogHeader>
          {selectedSermon && (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="context">Context</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Sermon Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Preacher:</span> {selectedSermon.preacher.name}</div>
                      <div><span className="font-medium">Scripture:</span> {selectedSermon.scripture_reference}</div>
                      {selectedSermon.sermon_date && (
                        <div><span className="font-medium">Date:</span> {new Date(selectedSermon.sermon_date).toLocaleDateString()}</div>
                      )}
                      <div><span className="font-medium">Location:</span> {selectedSermon.location}</div>
                      <div><span className="font-medium">Duration:</span> {selectedSermon.duration_minutes} minutes</div>
                      <div><span className="font-medium">Translation:</span> {selectedSermon.translation_used}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Themes</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSermon.themes.map(theme => (
                        <Badge key={theme} variant="secondary">{theme}</Badge>
                      ))}
                    </div>
                    
                    {selectedSermon.series_name && (
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">Series</h3>
                        <p className="text-sm">{selectedSermon.series_name}</p>
                        {selectedSermon.series_order && (
                          <p className="text-xs text-muted-foreground">Part {selectedSermon.series_order}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="content" className="mt-6">
                <ScrollArea className="h-96">
                  <div className="prose dark:prose-invert max-w-none">
                    {selectedSermon.content_text && (
                      <p className="whitespace-pre-wrap">{selectedSermon.content_text}</p>
                    )}
                    {selectedSermon.transcript && (
                      <div className="mt-6">
                        <h3 className="font-semibold mb-3">Transcript</h3>
                        <p className="whitespace-pre-wrap">{selectedSermon.transcript}</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="analysis" className="mt-6">
                {selectedSermon.theological_points && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Theological Points</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">
                        {JSON.stringify(selectedSermon.theological_points, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                
                {selectedSermon.rhetorical_analysis && (
                  <div className="space-y-4 mt-6">
                    <h3 className="font-semibold">Rhetorical Analysis</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">
                        {JSON.stringify(selectedSermon.rhetorical_analysis, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="context" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Historical Context</h3>
                    <p className="text-muted-foreground">{selectedSermon.historical_context}</p>
                  </div>
                  
                  {selectedSermon.occasion && (
                    <div>
                      <h3 className="font-semibold mb-2">Occasion</h3>
                      <p className="text-muted-foreground">{selectedSermon.occasion}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SermonArchive; 