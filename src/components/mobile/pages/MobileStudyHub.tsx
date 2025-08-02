import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { 
  BookOpen, Search, MoreVertical, ArrowLeft, Settings, 
  Target, Users, History, Lightbulb, Star, ChevronRight,
  Filter, Grid3X3, List, Heart, Brain, Scroll, Crown,
  Church, Cross, Shield, Sparkles, Clock, Bookmark,
  Play, Share, Download, Eye, Zap, Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../../hooks/use-toast';

interface StudyModule {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  category: string;
  lessons: number;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  isNew?: boolean;
  isFavorite?: boolean;
}

interface Character {
  name: string;
  title: string;
  description: string;
  keyVerses: string[];
  lessons: string[];
  imageUrl?: string;
  category: string;
}

interface Topic {
  name: string;
  description: string;
  verseCount: number;
  category: string;
  icon: any;
  color: string;
}

const studyModules: StudyModule[] = [
  {
    id: '1',
    title: 'Verse Explorer',
    description: 'Deep dive into individual verses with context and insights',
    icon: Search,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    category: 'Analysis',
    lessons: 25,
    duration: '45 min',
    difficulty: 'Beginner',
    isNew: true
  },
  {
    id: '2',
    title: 'Topical Studies',
    description: 'Explore biblical themes and topics systematically',
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    category: 'Themes',
    lessons: 40,
    duration: '60 min',
    difficulty: 'Intermediate'
  },
  {
    id: '3',
    title: 'Character Studies',
    description: 'Learn from biblical heroes and their journeys',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    category: 'People',
    lessons: 30,
    duration: '55 min',
    difficulty: 'Intermediate',
    isFavorite: true
  },
  {
    id: '4',
    title: 'Historical Context',
    description: 'Understand the historical background of biblical events',
    icon: History,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    category: 'History',
    lessons: 35,
    duration: '50 min',
    difficulty: 'Advanced'
  },
  {
    id: '5',
    title: 'Prophetic Studies',
    description: 'Explore biblical prophecy and its fulfillment',
    icon: Eye,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    category: 'Prophecy',
    lessons: 20,
    duration: '65 min',
    difficulty: 'Advanced'
  },
  {
    id: '6',
    title: 'Prayer & Worship',
    description: 'Deepen your prayer life and worship experience',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    category: 'Spiritual',
    lessons: 15,
    duration: '40 min',
    difficulty: 'Beginner'
  }
];

const characters: Character[] = [
  {
    name: 'David',
    title: 'The Shepherd King',
    description: 'From shepherd boy to king, David\'s life shows God\'s faithfulness',
    keyVerses: ['1 Samuel 16:7', 'Psalm 23:1', '1 Kings 2:2-3'],
    lessons: ['Heart after God', 'Facing Giants', 'Leadership', 'Repentance'],
    category: 'Old Testament'
  },
  {
    name: 'Esther',
    title: 'For Such a Time',
    description: 'Queen Esther\'s courage saved her people from destruction',
    keyVerses: ['Esther 4:14', 'Esther 7:3', 'Esther 9:22'],
    lessons: ['Divine Providence', 'Courage', 'Purpose', 'Intercession'],
    category: 'Old Testament'
  },
  {
    name: 'Peter',
    title: 'The Rock',
    description: 'Impulsive fisherman transformed into church leader',
    keyVerses: ['Matthew 16:16', 'Luke 22:32', 'Acts 2:14'],
    lessons: ['Transformation', 'Failure & Restoration', 'Bold Faith', 'Leadership'],
    category: 'New Testament'
  },
  {
    name: 'Paul',
    title: 'Apostle to Gentiles',
    description: 'Persecutor turned missionary, spreading the Gospel',
    keyVerses: ['Acts 9:15', 'Philippians 3:14', '2 Timothy 4:7'],
    lessons: ['Radical Conversion', 'Perseverance', 'Mission', 'Grace'],
    category: 'New Testament'
  }
];

const topics: Topic[] = [
  { name: 'Faith', description: 'Understanding biblical faith', verseCount: 156, category: 'Spiritual', icon: Star, color: 'bg-yellow-500' },
  { name: 'Love', description: 'God\'s love and loving others', verseCount: 208, category: 'Spiritual', icon: Heart, color: 'bg-red-500' },
  { name: 'Prayer', description: 'Communication with God', verseCount: 134, category: 'Spiritual', icon: Church, color: 'bg-blue-500' },
  { name: 'Salvation', description: 'God\'s plan of redemption', verseCount: 89, category: 'Doctrine', icon: Cross, color: 'bg-purple-500' },
  { name: 'Wisdom', description: 'Biblical wisdom for life', verseCount: 167, category: 'Practical', icon: Brain, color: 'bg-green-500' },
  { name: 'Hope', description: 'Hope in Christ and eternity', verseCount: 92, category: 'Spiritual', icon: Lightbulb, color: 'bg-orange-500' }
];

const MobileStudyHub = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'modules' | 'characters' | 'topics'>('modules');
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<string[]>(['3']);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
    toast({
      title: favorites.includes(id) ? "Removed from Favorites" : "Added to Favorites",
      description: "Study preferences updated."
    });
  };

  const startStudy = (module: StudyModule) => {
    toast({
      title: "Starting Study",
      description: `Beginning ${module.title} study session.`
    });
  };

  const filteredModules = studyModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(studyModules.map(m => m.category)))];

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-white p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Study Hub</h1>
            <p className="text-xs text-purple-100">Deep biblical study tools</p>
          </div>
        </div>
        
        <div className="relative">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white p-2"
            onClick={() => setShowSettings(!showSettings)}
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
          
          {showSettings && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto">
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Study Hub Settings</h3>
                <p className="text-xs text-gray-500">Customize your study experience</p>
              </div>

              <div className="px-4 py-3 border-b border-gray-100">
                <label className="text-xs font-medium text-gray-500 mb-2 block">Search Studies</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search modules, topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
              </div>

              <button
                onClick={() => setActiveTab('modules')}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 ${activeTab === 'modules' ? 'text-purple-700 bg-purple-50' : 'text-gray-700'}`}
              >
                <BookOpen className="h-4 w-4 text-purple-500" />
                <span>Study Modules</span>
              </button>

              <button
                onClick={() => setActiveTab('characters')}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 ${activeTab === 'characters' ? 'text-purple-700 bg-purple-50' : 'text-gray-700'}`}
              >
                <Users className="h-4 w-4 text-green-500" />
                <span>Bible Characters</span>
              </button>

              <button
                onClick={() => setActiveTab('topics')}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 ${activeTab === 'topics' ? 'text-purple-700 bg-purple-50' : 'text-gray-700'}`}
              >
                <Target className="h-4 w-4 text-orange-500" />
                <span>Study Topics</span>
              </button>

              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4 text-blue-500" /> : <Grid3X3 className="h-4 w-4 text-blue-500" />}
                  <span>{viewMode === 'grid' ? 'List View' : 'Grid View'}</span>
                </button>

                <button
                  onClick={() => toast({ title: "Download Studies", description: "Offline download feature coming soon!" })}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                >
                  <Download className="h-4 w-4 text-cyan-500" />
                  <span>Download Studies</span>
                </button>

                <button
                  onClick={() => toast({ title: "Progress Tracking", description: "View your study progress and achievements." })}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                >
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>Study Progress</span>
                </button>

                <button
                  onClick={() => toast({ title: "Study Reminders", description: "Set daily study reminders." })}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                >
                  <Bell className="h-4 w-4 text-pink-500" />
                  <span>Study Reminders</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>



      {/* Content */}
      <ScrollArea className="flex-1 px-4 py-4">
        {activeTab === 'modules' && (
          <div className="space-y-6">
            {/* Categories */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Study Modules */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4' : 'space-y-3'}>
              {filteredModules.map((module) => (
                <Card key={module.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className={`flex ${viewMode === 'grid' ? 'flex-col' : 'items-center'} space-y-3`}>
                      <div className={`flex items-start space-x-3 ${viewMode === 'grid' ? '' : 'flex-1'}`}>
                        <div className={`w-12 h-12 ${module.bgColor} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                          <module.icon className={`h-6 w-6 ${module.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-800">{module.title}</h3>
                            {module.isNew && <Badge className="text-xs bg-green-100 text-green-700">New</Badge>}
                            <button onClick={() => toggleFavorite(module.id)}>
                              <Star className={`h-4 w-4 ${favorites.includes(module.id) ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{module.lessons} lessons</span>
                            <span>{module.duration}</span>
                            <Badge variant="outline" className="text-xs">{module.difficulty}</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center space-x-2 ${viewMode === 'grid' ? 'w-full' : ''}`}>
                        <Button 
                          onClick={() => startStudy(module)}
                          className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                          size="sm"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Study
                        </Button>
                        <Button variant="outline" size="sm" className="p-2">
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'characters' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {characters.map((character, index) => (
                <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Users className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-800">{character.name}</h3>
                          <Badge className="text-xs bg-purple-100 text-purple-700">{character.category}</Badge>
                        </div>
                        <p className="text-sm text-purple-600 font-medium mb-2">{character.title}</p>
                        <p className="text-sm text-gray-600 mb-3">{character.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Scroll className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500">Key Verses: {character.keyVerses.join(', ')}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {character.lessons.map((lesson, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{lesson}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <Button className="w-full mt-3 bg-purple-600 hover:bg-purple-700" size="sm">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Study {character.name}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {topics.map((topic, index) => (
                <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${topic.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                        <topic.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-800">{topic.name}</h3>
                          <Badge className="text-xs bg-gray-100 text-gray-600">{topic.verseCount} verses</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{topic.description}</p>
                        <p className="text-xs text-gray-500">Category: {topic.category}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default MobileStudyHub; 