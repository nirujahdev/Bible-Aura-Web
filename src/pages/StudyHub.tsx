import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
import { 
  Search, BookOpen, Users, Crown, TreePine, FileText, 
  Settings, Languages, Grid, Table, Clock, Bot, Bookmark,
  Heart, Star, Share, Download, Copy, ExternalLink,
  ChevronRight, ChevronLeft, Plus, Filter, Eye,
  Mic, Calendar, Target, Lightbulb, Compass, Home,
  Globe, Shield, Zap, Building, Library, PenTool,
  MessageCircle, Volume2, Play, Pause, RotateCcw
} from 'lucide-react';

// Types
interface StudyModule {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

interface BibleCharacter {
  id: string;
  name: string;
  description: string;
  period: string;
  testament: 'Old' | 'New';
  category: string;
  key_verses: string[];
  notable_events: string[];
  character_traits: string[];
  image_placeholder: string;
}

interface Parable {
  id: string;
  title: string;
  reference: string;
  summary: string;
  theme: string;
  difficulty: number;
  modern_application: string;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  category: string;
  verse_count: number;
  key_verses: string[];
}

// Study Modules Configuration
const STUDY_MODULES: StudyModule[] = [
  {
    id: 'verse-explorer',
    name: 'Verse Explorer',
    icon: Search,
    description: 'Deep dive into individual verses with context and insights',
    color: 'text-blue-600'
  },
  {
    id: 'topical-study',
    name: 'Topical Study',
    icon: Library,
    description: 'Explore themes and topics across Scripture',
    color: 'text-purple-600'
  },
  {
    id: 'parables-study',
    name: 'Parables Study',
    icon: TreePine,
    description: 'Study Jesus\' parables with modern applications',
    color: 'text-orange-600'
  },
  {
    id: 'bible-characters',
    name: 'Bible Characters',
    icon: Users,
    description: 'Explore biblical figures and their stories',
    color: 'text-red-600'
  }
];

// Mock Data
const MOCK_CHARACTERS: BibleCharacter[] = [
  {
    id: '1',
    name: 'Moses',
    description: 'The great prophet who led the Israelites out of Egypt and received the Ten Commandments.',
    period: '1393-1273 BC',
    testament: 'Old',
    category: 'Prophet',
    key_verses: ['Exodus 3:14', 'Deuteronomy 34:10', 'Numbers 12:3'],
    notable_events: ['Burning Bush', 'Exodus from Egypt', 'Parting of Red Sea', 'Receiving the Law'],
    character_traits: ['Humble', 'Faithful', 'Patient', 'Leader'],
    image_placeholder: 'M'
  },
  {
    id: '2',
    name: 'Jesus Christ',
    description: 'The Son of God, Savior of the world, who came to earth to redeem humanity.',
    period: '4 BC - 30 AD',
    testament: 'New',
    category: 'Savior',
    key_verses: ['John 3:16', 'John 14:6', 'Matthew 28:18'],
    notable_events: ['Birth in Bethlehem', 'Baptism', 'Sermon on the Mount', 'Crucifixion', 'Resurrection'],
    character_traits: ['Love', 'Compassion', 'Wisdom', 'Sacrifice'],
    image_placeholder: 'J'
  },
  {
    id: '3',
    name: 'David',
    description: 'The shepherd boy who became Israel\'s greatest king, known as "a man after God\'s own heart".',
    period: '1040-970 BC',
    testament: 'Old',
    category: 'King',
    key_verses: ['1 Samuel 13:14', 'Psalm 23:1', '2 Samuel 7:16'],
    notable_events: ['Defeating Goliath', 'Anointed as King', 'Bringing Ark to Jerusalem', 'Bathsheba Incident'],
    character_traits: ['Courage', 'Worship', 'Repentant', 'Passionate'],
    image_placeholder: 'D'
  },
  {
    id: '4',
    name: 'Paul',
    description: 'Former persecutor who became the greatest missionary and wrote much of the New Testament.',
    period: '5-67 AD',
    testament: 'New',
    category: 'Apostle',
    key_verses: ['Acts 9:15', 'Philippians 1:21', 'Galatians 2:20'],
    notable_events: ['Road to Damascus', 'Missionary Journeys', 'Writing Epistles', 'Martyrdom'],
    character_traits: ['Zealous', 'Devoted', 'Intellectual', 'Perseverant'],
    image_placeholder: 'P'
  }
];

const MOCK_PARABLES: Parable[] = [
  {
    id: '1',
    title: 'The Good Samaritan',
    reference: 'Luke 10:25-37',
    summary: 'A story about a Samaritan who helps a wounded traveler when others pass by.',
    theme: 'Love and Compassion',
    difficulty: 2,
    modern_application: 'Shows us how to love our neighbors regardless of differences and help those in need.'
  },
  {
    id: '2',
    title: 'The Lost Sheep',
    reference: 'Luke 15:3-7',
    summary: 'A shepherd leaves 99 sheep to find one that is lost.',
    theme: 'God\'s Love for the Lost',
    difficulty: 1,
    modern_application: 'God rejoices when even one person turns to Him, showing His personal care for each individual.'
  }
];

const MOCK_TOPICS: Topic[] = [
  {
    id: '1',
    name: 'Faith',
    description: 'Trust and confidence in God',
    category: 'Spiritual Growth',
    verse_count: 245,
    key_verses: ['Hebrews 11:1', 'Romans 10:17', 'James 2:26']
  },
  {
    id: '2',
    name: 'Prayer',
    description: 'Communication with God',
    category: 'Spiritual Disciplines',
    verse_count: 167,
    key_verses: ['Matthew 6:9-13', '1 Thessalonians 5:17', 'Philippians 4:6-7']
  }
];

const TOPIC_CATEGORIES = [
  'all',
  'Spiritual Growth',
  'Spiritual Disciplines',
  'Character',
  'Relationships',
  'Wisdom',
  'Prophecy'
];

const StudyHub: React.FC = () => {
  // SEO optimization
  useSEO(SEO_CONFIG.STUDY_HUB);
  
  const isMobile = useIsMobile();
  
  // Core state
  const [activeModule, setActiveModule] = useState<string>('verse-explorer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'tamil' | 'sinhala'>('english');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [showRightPanel, setShowRightPanel] = useState(true);
  
  // Character study state
  const [selectedCharacter, setSelectedCharacter] = useState<BibleCharacter | null>(null);
  const [characterFilter, setCharacterFilter] = useState<'all' | 'Old' | 'New'>('all');
  const [characterCategory, setCharacterCategory] = useState<string>('all');
  
  // Parable study state
  const [selectedParable, setSelectedParable] = useState<Parable | null>(null);
  const [parableFilter, setParableFilter] = useState<string>('all');
  
  // Topical study state
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [topicCategory, setTopicCategory] = useState<string>('all');
  
  // Computed values
  const filteredCharacters = useMemo(() => {
    return MOCK_CHARACTERS.filter(character => {
      const testamentMatch = characterFilter === 'all' || character.testament === characterFilter;
      const categoryMatch = characterCategory === 'all' || character.category === characterCategory;
      const searchMatch = searchQuery === '' || 
        character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        character.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return testamentMatch && categoryMatch && searchMatch;
    });
  }, [characterFilter, characterCategory, searchQuery]);

  const filteredParables = useMemo(() => {
    return MOCK_PARABLES.filter(parable => {
      const searchMatch = searchQuery === '' || 
        parable.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parable.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parable.summary.toLowerCase().includes(searchQuery.toLowerCase());
      
      return searchMatch;
    });
  }, [searchQuery]);

  const filteredTopics = useMemo(() => {
    return MOCK_TOPICS.filter(topic => {
      const categoryMatch = topicCategory === 'all' || topic.category === topicCategory;
      const searchMatch = searchQuery === '' || 
        topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return categoryMatch && searchMatch;
    });
  }, [topicCategory, searchQuery]);

  const handleSearch = () => {
    // Handle search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-blue-50 via-white to-purple-50 mobile-safe-area">
      {/* Mobile Header - Responsive */}
      <div className="bg-white border-b border-gray-200 shadow-sm p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Library className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-xl font-bold text-gray-800 mobile-text">Study Hub</h1>
              <p className="text-sm text-gray-600 hidden sm:block">Comprehensive Bible study tools</p>
            </div>
          </div>
          
          {/* Mobile search */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search topics, characters, or parables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 min-h-[44px] border-2 border-gray-200 focus:border-blue-400 touch-optimized"
              />
            </div>
          </div>
        </div>

        {/* Study Module Cards - Mobile Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {STUDY_MODULES.map((module) => {
            const IconComponent = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  activeModule === module.id
                    ? 'border-blue-400 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    activeModule === module.id ? 'bg-blue-500' : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`h-4 w-4 ${
                      activeModule === module.id ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-800">{module.name}</h3>
                    <p className="text-xs text-gray-600 mt-1 hidden sm:block">{module.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area - Mobile Optimized */}
      <div className="p-4 max-w-7xl mx-auto">
        {/* Module Content */}
        {activeModule === 'verse-explorer' && (
          <div className="space-y-6">
            {/* Verse Explorer Header */}
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verse Explorer</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Dive deep into individual verses with context, cross-references, and AI-powered insights
              </p>
            </div>

            {/* Verse Search */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  Explore Verses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter verse reference (e.g., John 3:16) or search keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-11 text-base"
                    />
                  </div>
                  <Button 
                    onClick={handleSearch}
                    className="bg-blue-500 hover:bg-blue-600 h-11 px-6"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>

                {/* Quick Reference Buttons - Mobile Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {['John 3:16', 'Psalm 23:1', 'Romans 8:28', 'Jeremiah 29:11', 'Philippians 4:13', 'Isaiah 41:10'].map((ref) => (
                    <Button
                      key={ref}
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery(ref)}
                      className="text-xs h-9"
                    >
                      {ref}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeModule === 'bible-characters' && (
          <div className="space-y-6">
            {/* Characters Header */}
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Bible Characters</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore the lives and lessons of biblical figures throughout history
              </p>
            </div>

            {/* Filter Controls - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Select value={characterFilter} onValueChange={(value) => setCharacterFilter(value as 'all' | 'Old' | 'New')}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Filter by Testament" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Characters</SelectItem>
                  <SelectItem value="Old">Old Testament</SelectItem>
                  <SelectItem value="New">New Testament</SelectItem>
                </SelectContent>
              </Select>

              <Select value={characterCategory} onValueChange={setCharacterCategory}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Prophet">Prophets</SelectItem>
                  <SelectItem value="King">Kings</SelectItem>
                  <SelectItem value="Apostle">Apostles</SelectItem>
                  <SelectItem value="Savior">Savior</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Characters Grid - Mobile Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCharacters.map((character) => (
                <Card 
                  key={character.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-red-300"
                  onClick={() => setSelectedCharacter(character)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-red-100 text-red-700 font-bold">
                          {character.image_placeholder}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 mb-1">{character.name}</h3>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {character.testament}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {character.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {character.description}
                    </p>
                    
                    <div className="text-xs text-gray-500">
                      <p className="mb-1">📅 {character.period}</p>
                      <p>📖 {character.key_verses.length} key verses</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeModule === 'parables-study' && (
          <div className="space-y-6">
            {/* Parables Header */}
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TreePine className="h-8 w-8 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Parables Study</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Learn from Jesus' parables with modern applications and deep insights
              </p>
            </div>

            {/* Parables Grid - Mobile Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredParables.map((parable) => (
                <Card 
                  key={parable.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-orange-300"
                  onClick={() => setSelectedParable(parable)}
                >
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h3 className="font-bold text-gray-800 mb-2">{parable.title}</h3>
                      <Badge variant="outline" className="text-xs mb-2">
                        {parable.reference}
                      </Badge>
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-xs text-gray-500">Difficulty:</span>
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${
                              i < parable.difficulty ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {parable.summary}
                    </p>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs font-medium text-orange-600 mb-1">Theme:</p>
                      <p className="text-xs text-gray-600">{parable.theme}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeModule === 'topical-study' && (
          <div className="space-y-6">
            {/* Topical Study Header */}
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Topical Study</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore biblical themes and topics with comprehensive verse collections
              </p>
            </div>

            {/* Topic Categories - Mobile Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {TOPIC_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setTopicCategory(category)}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    topicCategory === category
                      ? 'border-purple-400 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <span className="font-medium text-sm">{category}</span>
                </button>
              ))}
            </div>

            {/* Topics Grid - Mobile Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTopics.map((topic) => (
                <Card 
                  key={topic.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-purple-300"
                  onClick={() => setSelectedTopic(topic)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-bold text-gray-800 mb-2">{topic.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {topic.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>📊 {topic.verse_count} verses</span>
                      <Badge variant="outline" className="text-xs">
                        {topic.category}
                      </Badge>
                    </div>
                    
                    {topic.key_verses.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-purple-600 font-medium">
                          Key: {topic.key_verses[0]}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Character Detail Modal - Mobile Optimized */}
      {selectedCharacter && (
        <Dialog open={!!selectedCharacter} onOpenChange={() => setSelectedCharacter(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-red-100 text-red-700 font-bold text-lg">
                    {selectedCharacter.image_placeholder}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-xl">{selectedCharacter.name}</DialogTitle>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{selectedCharacter.testament} Testament</Badge>
                    <Badge variant="outline">{selectedCharacter.category}</Badge>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Period</h4>
                <p className="text-gray-600">{selectedCharacter.period}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                <p className="text-gray-600 leading-relaxed">{selectedCharacter.description}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Character Traits</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCharacter.character_traits.map((trait, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Key Verses</h4>
                <div className="space-y-2">
                  {selectedCharacter.key_verses.map((verse, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <code className="text-sm font-medium text-blue-600">{verse}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Notable Events</h4>
                <div className="space-y-2">
                  {selectedCharacter.notable_events.map((event, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600 text-sm">{event}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Parable Detail Modal - Mobile Optimized */}
      {selectedParable && (
        <Dialog open={!!selectedParable} onOpenChange={() => setSelectedParable(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedParable.title}</DialogTitle>
              <Badge variant="outline" className="w-fit">{selectedParable.reference}</Badge>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Summary</h4>
                <p className="text-gray-600 leading-relaxed">{selectedParable.summary}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Theme</h4>
                <p className="text-gray-600">{selectedParable.theme}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Modern Application</h4>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-gray-700 leading-relaxed">{selectedParable.modern_application}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Difficulty Level</h4>
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${
                        i < selectedParable.difficulty ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`} 
                    />
                  ))}
                  <span className="text-sm text-gray-600">
                    ({selectedParable.difficulty}/5)
                  </span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Topic Detail Modal - Mobile Optimized */}
      {selectedTopic && (
        <Dialog open={!!selectedTopic} onOpenChange={() => setSelectedTopic(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedTopic.name}</DialogTitle>
              <Badge variant="outline" className="w-fit">{selectedTopic.category}</Badge>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                <p className="text-gray-600 leading-relaxed">{selectedTopic.description}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Key Verses ({selectedTopic.key_verses.length})</h4>
                <div className="space-y-2">
                  {selectedTopic.key_verses.map((verse, index) => (
                    <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <code className="text-sm font-medium text-purple-700">{verse}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center pt-4">
                <Button className="bg-purple-500 hover:bg-purple-600">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Start Study Session
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default StudyHub; 