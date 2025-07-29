import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, Filter, BookOpen, Bookmark, BookmarkCheck, Share2, 
  Star, Clock, Users, MapPin, Eye, Lightbulb, Target,
  ChevronRight, PlayCircle, PauseCircle, RotateCcw,
  MessageCircle, HelpCircle, Compass, Heart, Crown,
  TreePine, Leaf, Sun, Moon, Building, Fish, Bread,
  Zap, Award, Globe, Library, FileText, Video, Image,
  ArrowRight, CheckCircle, Circle, Play, Info, Download,
  ExternalLink, Copy, Volume2, Layers, Palette, School
} from "lucide-react";

interface Parable {
  id: string;
  title: string;
  alternative_titles: string[];
  scripture_reference: string;
  parable_text: string;
  context: string;
  historical_setting: string;
  cultural_background: string;
  geographical_context: string;
  audience: string;
  occasion: string;
  main_theme: string;
  secondary_themes: string[];
  kingdom_aspect: string;
  moral_lesson: string;
  practical_application: string;
  symbolic_elements: Record<string, string>;
  interpretive_challenges: string;
  rabbinical_parallels: string;
  old_testament_parallels: string[];
  ministry_period: 'Early' | 'Middle' | 'Late';
  difficulty_level: number;
  target_age_group: string;
  study_questions: string[];
  discussion_prompts: string[];
  visual_aids_available: boolean;
}

interface ParableInterpretation {
  id: string;
  interpretation_title: string;
  interpreter_name: string;
  interpreter_tradition: string;
  interpretation_text: string;
  interpretation_type: 'allegorical' | 'moral' | 'eschatological' | 'christological' | 'practical';
  theological_perspective: string;
  scholarly_level: 'beginner' | 'intermediate' | 'advanced' | 'scholarly';
  citations: string[];
}

interface StudyProgress {
  parable_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'reviewed';
  study_notes: string;
  study_time_minutes: number;
  last_studied_at: string;
  completed_at: string | null;
}

const ParablesDatabase = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [parables, setParables] = useState<Parable[]>([]);
  const [selectedParable, setSelectedParable] = useState<Parable | null>(null);
  const [interpretations, setInterpretations] = useState<ParableInterpretation[]>([]);
  const [studyProgress, setStudyProgress] = useState<Record<string, StudyProgress>>({});
  const [loading, setLoading] = useState(true);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  
  // UI state
  const [showParableDetails, setShowParableDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("story");
  const [selectedInterpretation, setSelectedInterpretation] = useState<ParableInterpretation | null>(null);
  const [showStudyMode, setShowStudyMode] = useState(false);
  const [studyTimer, setStudyTimer] = useState(0);
  const [isStudying, setIsStudying] = useState(false);

  // Famous parables data structure
  const parableCategories = [
    {
      name: "Kingdom of Heaven",
      icon: Crown,
      color: "text-yellow-600",
      parables: ["The Sower", "The Mustard Seed", "The Pearl of Great Price", "The Hidden Treasure", "The Ten Virgins"]
    },
    {
      name: "God's Love & Mercy",
      icon: Heart,
      color: "text-red-600",
      parables: ["The Good Samaritan", "The Prodigal Son", "The Lost Sheep", "The Lost Coin", "The Unmerciful Servant"]
    },
    {
      name: "Discipleship",
      icon: Users,
      color: "text-blue-600",
      parables: ["The Rich Young Ruler", "The Cost of Discipleship", "The Two Builders", "The Narrow Gate", "The Good Shepherd"]
    },
    {
      name: "Judgment & Accountability",
      icon: Zap,
      color: "text-purple-600",
      parables: ["The Wheat and Tares", "The Sheep and Goats", "The Rich Man and Lazarus", "The Unforgiving Servant", "The Talents"]
    },
    {
      name: "Prayer & Persistence",
      icon: Compass,
      color: "text-green-600",
      parables: ["The Persistent Widow", "The Friend at Midnight", "The Pharisee and Tax Collector", "The Importunate Friend"]
    },
    {
      name: "Stewardship & Service",
      icon: Building,
      color: "text-orange-600",
      parables: ["The Faithful Steward", "The Unjust Steward", "The Laborers in the Vineyard", "The Minas", "The Two Sons"]
    }
  ];

  // Parable themes for filtering
  const commonThemes = [
    "Kingdom of Heaven", "Forgiveness", "Love", "Mercy", "Justice", "Faith",
    "Discipleship", "Stewardship", "Prayer", "Humility", "Repentance",
    "Eternal Life", "Judgment", "Compassion", "Service", "Wisdom"
  ];

  // Interpretation types
  const interpretationTypes = [
    { value: "allegorical", label: "Allegorical", description: "Symbolic interpretation" },
    { value: "moral", label: "Moral", description: "Ethical teaching focus" },
    { value: "eschatological", label: "Eschatological", description: "End times focus" },
    { value: "christological", label: "Christological", description: "Christ-centered interpretation" },
    { value: "practical", label: "Practical", description: "Contemporary application" }
  ];

  useEffect(() => {
    fetchParables();
    if (user) {
      fetchStudyProgress();
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStudying) {
      interval = setInterval(() => {
        setStudyTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudying]);

  const fetchParables = async () => {
    try {
      const { data, error } = await supabase
        .from('parables')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;
      setParables(data || []);
    } catch (error) {
      toast({
        title: "Error loading parables",
        description: error instanceof Error ? error.message : 'Failed to load parables',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudyProgress = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_parable_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const progressMap: Record<string, StudyProgress> = {};
      data?.forEach(progress => {
        progressMap[progress.parable_id] = progress;
      });
      setStudyProgress(progressMap);
    } catch (error) {
      console.error('Error fetching study progress:', error);
    }
  };

  const fetchInterpretations = async (parableId: string) => {
    try {
      const { data, error } = await supabase
        .from('parable_interpretations')
        .select('*')
        .eq('parable_id', parableId)
        .order('scholarly_level', { ascending: true });

      if (error) throw error;
      setInterpretations(data || []);
    } catch (error) {
      console.error('Error fetching interpretations:', error);
    }
  };

  const updateStudyProgress = async (parable: Parable, status: StudyProgress['status']) => {
    if (!user) return;

    try {
      const existingProgress = studyProgress[parable.id];
      const updateData = {
        user_id: user.id,
        parable_id: parable.id,
        status,
        study_time_minutes: Math.floor(studyTimer / 60),
        last_studied_at: new Date().toISOString(),
        ...(status === 'completed' && { completed_at: new Date().toISOString() })
      };

      const { error } = await supabase
        .from('user_parable_progress')
        .upsert(updateData);

      if (error) throw error;

      setStudyProgress(prev => ({
        ...prev,
        [parable.id]: { ...existingProgress, ...updateData } as StudyProgress
      }));

      toast({
        title: "Progress updated",
        description: `Parable marked as ${status.replace('_', ' ')}`
      });
    } catch (error) {
      toast({
        title: "Error updating progress",
        description: error instanceof Error ? error.message : 'Failed to update progress',
        variant: "destructive",
      });
    }
  };

  const startStudy = (parable: Parable) => {
    setSelectedParable(parable);
    setShowParableDetails(true);
    setShowStudyMode(true);
    setIsStudying(true);
    setStudyTimer(0);
    fetchInterpretations(parable.id);
    
    if (user && !studyProgress[parable.id]) {
      updateStudyProgress(parable, 'in_progress');
    }
  };

  const completeStudy = () => {
    if (selectedParable && user) {
      setIsStudying(false);
      updateStudyProgress(selectedParable, 'completed');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return "bg-green-100 text-green-800";
      case 2: return "bg-blue-100 text-blue-800";
      case 3: return "bg-yellow-100 text-yellow-800";
      case 4: return "bg-orange-100 text-orange-800";
      case 5: return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Circle className="h-4 w-4 text-blue-600 fill-current" />;
      case 'reviewed':
        return <Star className="h-4 w-4 text-yellow-600 fill-current" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getParableIcon = (title: string) => {
    // Return appropriate icon based on parable content
    if (title.toLowerCase().includes('seed') || title.toLowerCase().includes('sower')) return Leaf;
    if (title.toLowerCase().includes('shepherd') || title.toLowerCase().includes('sheep')) return Users;
    if (title.toLowerCase().includes('treasure') || title.toLowerCase().includes('pearl')) return Award;
    if (title.toLowerCase().includes('builder') || title.toLowerCase().includes('house')) return Building;
    if (title.toLowerCase().includes('light') || title.toLowerCase().includes('lamp')) return Sun;
    if (title.toLowerCase().includes('wedding') || title.toLowerCase().includes('feast')) return Heart;
    return TreePine;
  };

  // Filter and sort parables
  const filteredParables = useMemo(() => {
    const filtered = parables.filter(parable => {
      const matchesSearch = !searchQuery || 
        parable.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parable.main_theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parable.secondary_themes.some(theme => theme.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTheme = selectedTheme === "all" || 
        parable.main_theme === selectedTheme ||
        parable.secondary_themes.includes(selectedTheme);
      
      const matchesDifficulty = selectedDifficulty === "all" || 
        parable.difficulty_level.toString() === selectedDifficulty;
      
      const matchesPeriod = selectedPeriod === "all" || parable.ministry_period === selectedPeriod;
      
      const matchesStatus = selectedStatus === "all" || 
        studyProgress[parable.id]?.status === selectedStatus;
      
      return matchesSearch && matchesTheme && matchesDifficulty && matchesPeriod && matchesStatus;
    });

    // Sort parables
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'difficulty':
          return a.difficulty_level - b.difficulty_level;
        case 'theme':
          return a.main_theme.localeCompare(b.main_theme);
        case 'period':
          return a.ministry_period.localeCompare(b.ministry_period);
        case 'progress': {
          const aProgress = studyProgress[a.id]?.status || 'not_started';
          const bProgress = studyProgress[b.id]?.status || 'not_started';
          return aProgress.localeCompare(bProgress);
        }
        default:
          return a.title.localeCompare(b.title);
      }
    });

    return filtered;
  }, [parables, searchQuery, selectedTheme, selectedDifficulty, selectedPeriod, selectedStatus, sortBy, studyProgress]);

  const renderParableCard = (parable: Parable) => {
    const ParableIcon = getParableIcon(parable.title);
    const progress = studyProgress[parable.id];
    
    return (
      <Card key={parable.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <ParableIcon className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-orange-600 transition-colors">
                    {parable.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{parable.scripture_reference}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {user && getStatusIcon(progress?.status)}
                <Badge className={getDifficultyColor(parable.difficulty_level)}>
                  Level {parable.difficulty_level}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {parable.moral_lesson}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">{parable.main_theme}</Badge>
                {parable.secondary_themes.slice(0, 2).map(theme => (
                  <Badge key={theme} variant="outline" className="text-xs">{theme}</Badge>
                ))}
                {parable.secondary_themes.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{parable.secondary_themes.length - 2}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {parable.ministry_period}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {parable.target_age_group}
                  </span>
                  {parable.visual_aids_available && (
                    <span className="flex items-center gap-1">
                      <Image className="h-3 w-3" />
                      Visual
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedParable(parable);
                      setShowParableDetails(true);
                      fetchInterpretations(parable.id);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  
                  {user && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        startStudy(parable);
                      }}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Study
                    </Button>
                  )}
                </div>
              </div>

              {progress && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium capitalize">{progress.status.replace('_', ' ')}</span>
                  </div>
                  {progress.study_time_minutes > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Study time: {progress.study_time_minutes} minutes
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderInterpretationCard = (interpretation: ParableInterpretation) => {
    return (
      <Card key={interpretation.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{interpretation.interpretation_title}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="capitalize">
                {interpretation.interpretation_type}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {interpretation.scholarly_level}
              </Badge>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            by {interpretation.interpreter_name} 
            {interpretation.interpreter_tradition && ` (${interpretation.interpreter_tradition})`}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed mb-3">{interpretation.interpretation_text}</p>
          
          {interpretation.theological_perspective && (
            <div className="mb-3">
              <h5 className="font-medium text-sm mb-1">Theological Perspective</h5>
              <p className="text-sm text-muted-foreground">{interpretation.theological_perspective}</p>
            </div>
          )}
          
          {interpretation.citations && interpretation.citations.length > 0 && (
            <div>
              <h5 className="font-medium text-sm mb-1">Citations</h5>
              <ul className="text-xs text-muted-foreground">
                {interpretation.citations.map((citation, index) => (
                  <li key={index}>• {citation}</li>
                ))}
              </ul>
            </div>
          )}
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
              <BookOpen className="h-6 w-6" />
              <h1 className="text-2xl font-divine">Parables Database</h1>
              <Star className="h-5 w-5" />
            </div>
            <p className="text-white/80 mt-1">Comprehensive collection of Jesus's parables with interactive study tools</p>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading parables database...</p>
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
            <BookOpen className="h-6 w-6" />
            <h1 className="text-2xl font-divine">Parables Database</h1>
            <Star className="h-5 w-5" />
          </div>
          <p className="text-white/80 mt-1">Comprehensive collection of Jesus's parables with interactive study tools</p>
        </div>
      </div>

      {/* Study Timer (when active) */}
      {isStudying && (
        <div className="bg-orange-100 dark:bg-orange-900/30 border-b px-4 py-2">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Studying: {selectedParable?.title}</span>
              <span className="text-sm text-muted-foreground">Time: {formatTime(studyTimer)}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsStudying(!isStudying)}>
                {isStudying ? <PauseCircle className="h-4 w-4 mr-1" /> : <PlayCircle className="h-4 w-4 mr-1" />}
                {isStudying ? 'Pause' : 'Resume'}
              </Button>
              <Button size="sm" onClick={completeStudy}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Search and Filters */}
          <div className="p-6 border-b bg-gray-50 dark:bg-gray-900/50">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search parables, themes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Themes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Themes</SelectItem>
                    {commonThemes.map(theme => (
                      <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulty Levels</SelectItem>
                    <SelectItem value="1">Level 1 (Beginner)</SelectItem>
                    <SelectItem value="2">Level 2 (Easy)</SelectItem>
                    <SelectItem value="3">Level 3 (Intermediate)</SelectItem>
                    <SelectItem value="4">Level 4 (Advanced)</SelectItem>
                    <SelectItem value="5">Level 5 (Expert)</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="difficulty">Difficulty</SelectItem>
                    <SelectItem value="theme">Theme</SelectItem>
                    <SelectItem value="period">Ministry Period</SelectItem>
                    {user && <SelectItem value="progress">Progress</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-wrap gap-4 items-center">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Periods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Periods</SelectItem>
                    <SelectItem value="Early">Early Ministry</SelectItem>
                    <SelectItem value="Middle">Middle Ministry</SelectItem>
                    <SelectItem value="Late">Late Ministry</SelectItem>
                  </SelectContent>
                </Select>
                
                {user && (
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          {/* Parables Grid */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  {filteredParables.length} parables found
                </p>
                
                {user && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{Object.values(studyProgress).filter(p => p.status === 'completed').length} completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Circle className="h-4 w-4 text-blue-600 fill-current" />
                      <span>{Object.values(studyProgress).filter(p => p.status === 'in_progress').length} in progress</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredParables.map(renderParableCard)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Parable Details Dialog */}
      <Dialog open={showParableDetails} onOpenChange={setShowParableDetails}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedParable && getParableIcon(selectedParable.title)({ className: "h-5 w-5" })}
              {selectedParable?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedParable && (
            <div className="h-full overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="story">Story</TabsTrigger>
                  <TabsTrigger value="context">Context</TabsTrigger>
                  <TabsTrigger value="interpretations">Interpretations</TabsTrigger>
                  <TabsTrigger value="study">Study Guide</TabsTrigger>
                  <TabsTrigger value="discussion">Discussion</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-auto mt-4">
                  <TabsContent value="story" className="mt-0">
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold">The Parable</h3>
                          <Badge variant="outline">{selectedParable.scripture_reference}</Badge>
                        </div>
                        <blockquote className="text-lg font-serif italic border-l-4 border-orange-300 pl-6 py-4 bg-orange-50 dark:bg-orange-900/20">
                          {selectedParable.parable_text}
                        </blockquote>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">Main Theme</h4>
                          <p className="text-muted-foreground">{selectedParable.main_theme}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Kingdom Aspect</h4>
                          <p className="text-muted-foreground">{selectedParable.kingdom_aspect}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Moral Lesson</h4>
                        <p className="text-muted-foreground">{selectedParable.moral_lesson}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Practical Application</h4>
                        <p className="text-muted-foreground">{selectedParable.practical_application}</p>
                      </div>

                      {selectedParable.interpretive_challenges && (
                        <div>
                          <h4 className="font-semibold mb-2">Interpretive Challenges</h4>
                          <p className="text-muted-foreground">{selectedParable.interpretive_challenges}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="context" className="mt-0">
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">Historical Setting</h4>
                          <p className="text-muted-foreground">{selectedParable.historical_setting}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Cultural Background</h4>
                          <p className="text-muted-foreground">{selectedParable.cultural_background}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Geographical Context</h4>
                          <p className="text-muted-foreground">{selectedParable.geographical_context}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Original Audience</h4>
                          <p className="text-muted-foreground">{selectedParable.audience}</p>
                        </div>
                      </div>

                      {selectedParable.occasion && (
                        <div>
                          <h4 className="font-semibold mb-2">Occasion</h4>
                          <p className="text-muted-foreground">{selectedParable.occasion}</p>
                        </div>
                      )}

                      {selectedParable.old_testament_parallels && selectedParable.old_testament_parallels.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Old Testament Parallels</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedParable.old_testament_parallels.map((parallel, index) => (
                              <li key={index} className="text-muted-foreground">{parallel}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedParable.rabbinical_parallels && (
                        <div>
                          <h4 className="font-semibold mb-2">Rabbinical Parallels</h4>
                          <p className="text-muted-foreground">{selectedParable.rabbinical_parallels}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="interpretations" className="mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Multiple Interpretations</h3>
                        <div className="flex gap-2">
                          {interpretationTypes.map(type => (
                            <Badge
                              key={type.value}
                              variant={interpretations.some(i => i.interpretation_type === type.value) ? "default" : "outline"}
                              className="text-xs"
                            >
                              {type.label}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <ScrollArea className="h-96">
                        {interpretations.length > 0 ? (
                          interpretations.map(renderInterpretationCard)
                        ) : (
                          <p className="text-muted-foreground text-center py-8">
                            No interpretations available for this parable yet.
                          </p>
                        )}
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  <TabsContent value="study" className="mt-0">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Study Questions</h3>
                        <div className="space-y-3">
                          {selectedParable.study_questions.map((question, index) => (
                            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <p className="font-medium">{index + 1}. {question}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Discussion Prompts</h3>
                        <div className="space-y-3">
                          {selectedParable.discussion_prompts.map((prompt, index) => (
                            <div key={index} className="p-3 border border-orange-200 dark:border-orange-800 rounded-lg">
                              <p className="text-muted-foreground">{prompt}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedParable.symbolic_elements && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Symbolic Elements</h3>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <pre className="text-sm whitespace-pre-wrap">
                              {JSON.stringify(selectedParable.symbolic_elements, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="discussion" className="mt-0">
                    <div className="space-y-6">
                      <div className="text-center py-8">
                        <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Group Discussion Feature</h3>
                        <p className="text-muted-foreground">
                          This feature will allow users to engage in structured discussions about the parable
                          with study groups and other users.
                        </p>
                        <Button className="mt-4" disabled>
                          <Users className="h-4 w-4 mr-2" />
                          Join Discussion (Coming Soon)
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="resources" className="mt-0">
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Download className="h-5 w-5" />
                              Study Materials
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start">
                              <FileText className="h-4 w-4 mr-2" />
                              Download Study Guide
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                              <Image className="h-4 w-4 mr-2" />
                              Visual Aids & Charts
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                              <Palette className="h-4 w-4 mr-2" />
                              Coloring Pages
                            </Button>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <ExternalLink className="h-5 w-5" />
                              External Resources
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start">
                              <Video className="h-4 w-4 mr-2" />
                              Video Commentary
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                              <Volume2 className="h-4 w-4 mr-2" />
                              Audio Teaching
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                              <School className="h-4 w-4 mr-2" />
                              Seminary Courses
                            </Button>
                          </CardContent>
                        </Card>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Quick Actions</h4>
                        <div className="flex flex-wrap gap-3">
                          <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-1" />
                            Share Parable
                          </Button>
                          <Button variant="outline" size="sm">
                            <Copy className="h-4 w-4 mr-1" />
                            Copy Text
                          </Button>
                          <Button variant="outline" size="sm">
                            <BookmarkCheck className="h-4 w-4 mr-1" />
                            Add to Collection
                          </Button>
                          <Button variant="outline" size="sm">
                            <Globe className="h-4 w-4 mr-1" />
                            View on Map
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParablesDatabase; 