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
    summary: 'A story about showing mercy and compassion to those in need, regardless of social barriers.',
    theme: 'Love & Compassion',
    difficulty: 2,
    modern_application: 'Help others regardless of their background, race, or social status.'
  },
  {
    id: '2',
    title: 'The Prodigal Son',
    reference: 'Luke 15:11-32',
    summary: 'A tale of forgiveness, redemption, and a father\'s unconditional love.',
    theme: 'Forgiveness & Grace',
    difficulty: 3,
    modern_application: 'God always welcomes us back with open arms when we repent.'
  },
  {
    id: '3',
    title: 'The Sower',
    reference: 'Matthew 13:1-23',
    summary: 'Different types of soil represent how people receive God\'s word.',
    theme: 'Kingdom of Heaven',
    difficulty: 3,
    modern_application: 'Prepare your heart to receive God\'s truth and let it grow.'
  }
];

const MOCK_TOPICS: Topic[] = [
  {
    id: '1',
    name: 'Prayer',
    description: 'Communication with God through various forms of prayer and worship.',
    category: 'Spiritual Disciplines',
    verse_count: 127,
    key_verses: ['Matthew 6:9-13', '1 Thessalonians 5:17', 'James 5:16']
  },
  {
    id: '2',
    name: 'Faith',
    description: 'Trust and belief in God\'s promises and character.',
    category: 'Core Beliefs',
    verse_count: 89,
    key_verses: ['Hebrews 11:1', 'Romans 10:17', 'James 2:17']
  },
  {
    id: '3',
    name: 'Love',
    description: 'God\'s love for us and our love for God and others.',
    category: 'Character Traits',
    verse_count: 156,
    key_verses: ['1 John 4:8', '1 Corinthians 13:4-7', 'John 3:16']
  }
];

export default function StudyHub() {
  useSEO(SEO_CONFIG.STUDY_HUB);
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // State Management
  const [activeModule, setActiveModule] = useState('verse-explorer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [viewMode, setViewMode] = useState('card');
  const [showRightPanel, setShowRightPanel] = useState(!isMobile);
  
  // Module-specific states
  const [selectedVerse, setSelectedVerse] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [verseNumber, setVerseNumber] = useState('');
  
  // Character filtering
  const [characterFilter, setCharacterFilter] = useState('All');
  const [testamentFilter, setTestamentFilter] = useState('All');
  
  // Saved items
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [recentStudies, setRecentStudies] = useState<string[]>([]);

  // Filtered data based on search
  const filteredCharacters = useMemo(() => {
    return MOCK_CHARACTERS.filter(character => {
      const matchesSearch = character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           character.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = characterFilter === 'All' || character.category === characterFilter;
      const matchesTestament = testamentFilter === 'All' || character.testament === testamentFilter;
      return matchesSearch && matchesCategory && matchesTestament;
    });
  }, [searchQuery, characterFilter, testamentFilter]);

  const filteredParables = useMemo(() => {
    return MOCK_PARABLES.filter(parable => 
      parable.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parable.theme.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredTopics = useMemo(() => {
    return MOCK_TOPICS.filter(topic => 
      topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Render module content
  const renderModuleContent = () => {
    switch (activeModule) {
      case 'verse-explorer':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Book" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="genesis">Genesis</SelectItem>
                  <SelectItem value="exodus">Exodus</SelectItem>
                  <SelectItem value="matthew">Matthew</SelectItem>
                  <SelectItem value="john">John</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Chapter"
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                type="number"
              />
              <Input
                placeholder="Verse"
                value={verseNumber}
                onChange={(e) => setVerseNumber(e.target.value)}
                type="number"
              />
            </div>
            
            {selectedBook && selectedChapter && verseNumber && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {selectedBook} {selectedChapter}:{verseNumber}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Verse Text</h4>
                    <p className="text-lg leading-relaxed">
                      "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Historical Context</h4>
                      <p className="text-sm text-gray-600">
                        Jesus spoke these words to Nicodemus, a Pharisee who came to him at night seeking truth.
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Theological Insight</h4>
                      <p className="text-sm text-gray-600">
                        This verse reveals the heart of the Gospel - God's sacrificial love and the gift of eternal life.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Simple Explanation</h4>
                    <p className="text-sm text-gray-600">
                      God loves everyone so much that He sent Jesus to save us. When we believe in Jesus, we get to live forever with God.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Verse
                    </Button>
                    <Button variant="outline" size="sm">
                      <Bookmark className="h-4 w-4 mr-2" />
                      Bookmark
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'topical-study':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Topical Study</h2>
              <Select value="difficulty" onValueChange={() => {}}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="difficulty">Difficulty</SelectItem>
                  <SelectItem value="testament">Testament</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTopics.map((topic) => (
                <Card key={topic.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{topic.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">{topic.category}</Badge>
                      </div>
                      <Badge variant="outline">{topic.verse_count} verses</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">{topic.description}</p>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Key Verses</h4>
                      <div className="flex flex-wrap gap-1">
                        {topic.key_verses.map((verse, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {verse}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <Button variant="outline" size="sm">Study Now</Button>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Heart className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'parables-study':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Parables Study</h2>
              <Button variant="outline">
                <TreePine className="h-4 w-4 mr-2" />
                Similar Parables
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredParables.map((parable) => (
                <Card key={parable.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{parable.title}</CardTitle>
                        <Badge variant="secondary" className="mt-1">{parable.theme}</Badge>
                      </div>
                      <div className="flex">
                        {[...Array(parable.difficulty)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-amber-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium mb-1">Reference</h4>
                      <p className="text-sm text-gray-600">{parable.reference}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Summary</h4>
                      <p className="text-sm text-gray-600">{parable.summary}</p>
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium mb-1">Modern Application</h4>
                      <p className="text-sm text-gray-600">{parable.modern_application}</p>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <Button variant="outline" size="sm">Read Full</Button>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <BookOpen className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'bible-characters':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">Bible Characters</h2>
              <div className="flex gap-2">
                <Select value={testamentFilter} onValueChange={setTestamentFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Old">Old Testament</SelectItem>
                    <SelectItem value="New">New Testament</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={characterFilter} onValueChange={setCharacterFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Roles</SelectItem>
                    <SelectItem value="Prophet">Prophet</SelectItem>
                    <SelectItem value="King">King</SelectItem>
                    <SelectItem value="Apostle">Apostle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCharacters.map((character) => (
                <Card key={character.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {character.image_placeholder}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{character.name}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary">{character.category}</Badge>
                          <Badge variant="outline" className="text-xs">
                            {character.testament} Testament
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {character.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{character.period}</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Character Traits</h4>
                      <div className="flex flex-wrap gap-1">
                        {character.character_traits.map((trait, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Notable Events</h4>
                      <ul className="space-y-1">
                        {character.notable_events.slice(0, 2).map((event, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                            <span className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                            <span>{event}</span>
                          </li>
                        ))}
                        {character.notable_events.length > 2 && (
                          <li className="text-xs text-gray-500">
                            +{character.notable_events.length - 2} more...
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <Button variant="outline" size="sm">Learn More</Button>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <BookOpen className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Select a study module</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Navigation */}
      <div className={`${isMobile ? 'hidden' : 'w-64'} bg-white border-r border-gray-200 flex flex-col`}>
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Library className="h-6 w-6 text-blue-600" />
            Study Hub
          </h1>
          <p className="text-sm text-gray-500 mt-1">Advanced Bible Study</p>
        </div>
        
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {STUDY_MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <Button
                  key={module.id}
                  variant={activeModule === module.id ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 h-auto p-3 ${
                    activeModule === module.id ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                  onClick={() => setActiveModule(module.id)}
                >
                  <Icon className={`h-5 w-5 ${module.color}`} />
                  <div className="text-left">
                    <div className="font-medium">{module.name}</div>
                    <div className="text-xs text-gray-500 font-normal">
                      {module.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search any verse, topic or person"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-32">
                  <Languages className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="tamil">தமிழ்</SelectItem>
                  <SelectItem value="sinhala">සිංහල</SelectItem>
                </SelectContent>
              </Select>
              
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'card' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                  className="px-3"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="px-3"
                >
                  <Table className="h-4 w-4" />
                </Button>
              </div>
              
              {/* AI Button */}
              <Button variant="outline" className="gap-2">
                <Bot className="h-4 w-4" />
                AI Explain
              </Button>
              
              {/* Right Panel Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRightPanel(!showRightPanel)}
              >
                <ChevronRight className={`h-4 w-4 transition-transform ${showRightPanel ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Main Canvas */}
          <div className="flex-1 p-6 overflow-auto">
            {renderModuleContent()}
          </div>
          
          {/* Right Panel */}
          {showRightPanel && (
            <div className="w-80 bg-white border-l border-gray-200 p-4">
              <div className="space-y-6">
                {/* Quick Save */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    Quick Notes
                  </h3>
                  <Textarea 
                    placeholder="Save thoughts and insights..."
                    className="min-h-20"
                  />
                  <Button size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Save to Journal
                  </Button>
                </div>
                
                {/* Recent Studies */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent Studies
                  </h3>
                  <div className="space-y-2">
                    <div className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium">John 3:16 Analysis</div>
                      <div className="text-xs text-gray-500">2 hours ago</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium">Prayer Topic Study</div>
                      <div className="text-xs text-gray-500">Yesterday</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium">David Character Study</div>
                      <div className="text-xs text-gray-500">3 days ago</div>
                    </div>
                  </div>
                </div>
                
                {/* Bookmarks */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Bookmark className="h-4 w-4" />
                    Bookmarks
                  </h3>
                  <div className="space-y-2">
                    <div className="p-2 border rounded text-sm flex items-center justify-between">
                      <span>Romans 8:28</span>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="p-2 border rounded text-sm flex items-center justify-between">
                      <span>Good Samaritan</span>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Suggested Insights */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    AI Suggestions
                  </h3>
                  <div className="space-y-2">
                    <div className="p-2 bg-blue-50 rounded text-sm">
                      <div className="font-medium text-blue-800">Related Topic</div>
                      <div className="text-blue-600">Explore "Forgiveness" theme</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded text-sm">
                      <div className="font-medium text-green-800">Character Connection</div>
                      <div className="text-green-600">Study Peter's character arc</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 