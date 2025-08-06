import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSEO } from '@/hooks/useSEO';
import { ModernLayout } from '@/components/ModernLayout';
import { 
  Search, BookOpen, Users, Crown, TreePine, Library, 
  Heart, Star, Share, Languages, Grid, Filter,
  ChevronDown, Plus, Eye, ExternalLink, 
  PenTool, Lightbulb, Globe, Clock
} from 'lucide-react';

// SEO Configuration for Study Hub
const SEO_CONFIG = {
  title: "Study Hub - Comprehensive Bible Study Tools | Bible Aura",
  description: "Explore in-depth Bible studies with our comprehensive Study Hub. Access topical studies, character profiles, and parable explanations to deepen your faith journey.",
  keywords: "bible study, topical study, bible characters, parables, spiritual growth, christian education",
  ogTitle: "Study Hub - Deep Bible Study Made Simple",
  ogDescription: "Access comprehensive Bible study tools including topical studies, character profiles, and parable explanations. Perfect for personal study and group discussions."
};

const StudyHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // SEO optimization
  useSEO(SEO_CONFIG);

  const [activeSection, setActiveSection] = useState('topical');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  // Topical Study Data
  const topicalStudies = [
    {
      id: 'prayer',
      title: 'Prayer',
      subtitle: 'Spiritual Disciplines',
      description: 'Communication with God through various forms of prayer and worship.',
      verseCount: 127,
      keyVerses: ['Matthew 6:9-13', '1 Thessalonians 5:17', 'James 5:16'],
      category: 'Spiritual Growth'
    },
    {
      id: 'faith',
      title: 'Faith',
      subtitle: 'Core Beliefs',
      description: 'Trust and belief in God\'s promises and character.',
      verseCount: 89,
      keyVerses: ['Hebrews 11:1', 'Romans 10:17', 'James 2:17'],
      category: 'Foundation'
    },
    {
      id: 'love',
      title: 'Love',
      subtitle: 'Character Traits',
      description: 'God\'s love for us and our love for God and others.',
      verseCount: 156,
      keyVerses: ['1 John 4:8', '1 Corinthians 13:4-7', 'John 3:16'],
      category: 'Relationships'
    },
    {
      id: 'wisdom',
      title: 'Wisdom',
      subtitle: 'Spiritual Understanding',
      description: 'Biblical wisdom and understanding for life decisions.',
      verseCount: 98,
      keyVerses: ['Proverbs 9:10', 'James 1:5', 'Colossians 2:3'],
      category: 'Knowledge'
    },
    {
      id: 'peace',
      title: 'Peace',
      subtitle: 'Inner Rest',
      description: 'God\'s peace that surpasses understanding in all circumstances.',
      verseCount: 67,
      keyVerses: ['Philippians 4:7', 'John 14:27', 'Isaiah 26:3'],
      category: 'Comfort'
    },
    {
      id: 'hope',
      title: 'Hope',
      subtitle: 'Future Promise',
      description: 'Living hope through Christ and eternal promises.',
      verseCount: 84,
      keyVerses: ['Romans 15:13', '1 Peter 1:3', 'Jeremiah 29:11'],
      category: 'Future'
    }
  ];

  // Bible Characters Data
  const bibleCharacters = [
    {
      id: 'moses',
      name: 'Moses',
      role: 'Prophet',
      testament: 'Old Testament',
      timeframe: '1393-1273 BC',
      description: 'The great prophet who led the Israelites out of Egypt and received the Ten Commandments.',
      traits: ['Humble', 'Faithful', 'Patient', 'Leader'],
      notableEvents: ['Burning Bush', 'Exodus from Egypt', 'Ten Commandments', 'Parting Red Sea'],
      color: 'bg-blue-100 text-blue-800',
      icon: '👑'
    },
    {
      id: 'jesus',
      name: 'Jesus Christ',
      role: 'Savior',
      testament: 'New Testament',
      timeframe: '4 BC - 30 AD',
      description: 'The Son of God, Savior of the world, who came to earth to redeem humanity.',
      traits: ['Love', 'Compassion', 'Wisdom', 'Sacrifice'],
      notableEvents: ['Birth in Bethlehem', 'Baptism', 'Crucifixion', 'Resurrection'],
      color: 'bg-purple-100 text-purple-800',
      icon: '✝️'
    },
    {
      id: 'david',
      name: 'David',
      role: 'King',
      testament: 'Old Testament', 
      timeframe: '1040-970 BC',
      description: 'The shepherd boy who became Israel\'s greatest king, known as "a man after God\'s own heart".',
      traits: ['Courage', 'Worship', 'Repentant', 'Passionate'],
      notableEvents: ['Defeating Goliath', 'Anointed as King', 'Writing Psalms', 'Building Temple Plans'],
      color: 'bg-green-100 text-green-800',
      icon: '🎵'
    },
    {
      id: 'mary',
      name: 'Mary',
      role: 'Mother of Jesus',
      testament: 'New Testament',
      timeframe: '18 BC - 41 AD',
      description: 'The virgin chosen by God to bear His Son, showing faith and obedience.',
      traits: ['Faithful', 'Humble', 'Trusting', 'Devoted'],
      notableEvents: ['Annunciation', 'Birth of Jesus', 'Wedding at Cana', 'At the Cross'],
      color: 'bg-pink-100 text-pink-800',
      icon: '🌹'
    },
    {
      id: 'paul',
      name: 'Paul',
      role: 'Apostle',
      testament: 'New Testament',
      timeframe: '5-67 AD',
      description: 'Former persecutor turned missionary who spread Christianity across the Roman Empire.',
      traits: ['Zealous', 'Dedicated', 'Transformed', 'Bold'],
      notableEvents: ['Road to Damascus', 'Missionary Journeys', 'Prison Ministry', 'Letter Writing'],
      color: 'bg-orange-100 text-orange-800',
      icon: '✍️'
    },
    {
      id: 'esther',
      name: 'Esther',
      role: 'Queen',
      testament: 'Old Testament',
      timeframe: '519-465 BC',
      description: 'Jewish queen who courageously saved her people from destruction.',
      traits: ['Brave', 'Wise', 'Beautiful', 'Strategic'],
      notableEvents: ['Chosen as Queen', 'Revealing Identity', 'Saving the Jews', 'Purim Festival'],
      color: 'bg-yellow-100 text-yellow-800',
      icon: '👸'
    }
  ];

  // Parables Study Data
  const parables = [
    {
      id: 'good-samaritan',
      title: 'The Good Samaritan',
      theme: 'Love & Compassion',
      reference: 'Luke 10:25-37',
      difficulty: 2,
      summary: 'A story about showing mercy and compassion to those in need, regardless of social barriers.',
      modernApplication: 'Help others regardless of their background, race, or social status.',
      keyLessons: ['Show mercy to all', 'Love your neighbor', 'Actions over words'],
      stars: '⭐⭐'
    },
    {
      id: 'prodigal-son',
      title: 'The Prodigal Son',
      theme: 'Forgiveness & Grace',
      reference: 'Luke 15:11-32',
      difficulty: 3,
      summary: 'A tale of forgiveness, redemption, and a father\'s unconditional love.',
      modernApplication: 'God always welcomes us back with open arms when we repent.',
      keyLessons: ['God\'s forgiveness', 'Unconditional love', 'Repentance brings restoration'],
      stars: '⭐⭐⭐'
    },
    {
      id: 'sower',
      title: 'The Sower',
      theme: 'Kingdom of Heaven',
      reference: 'Matthew 13:1-23',
      difficulty: 3,
      summary: 'Different types of soil represent how people receive God\'s word.',
      modernApplication: 'Prepare your heart to receive God\'s truth and let it grow.',
      keyLessons: ['Heart condition matters', 'Word of God grows', 'Fruitful living'],
      stars: '⭐⭐⭐'
    },
    {
      id: 'lost-sheep',
      title: 'The Lost Sheep',
      theme: 'God\'s Love',
      reference: 'Luke 15:3-7',
      difficulty: 1,
      summary: 'God rejoices when one lost person returns to Him.',
      modernApplication: 'Every person matters to God, and He actively seeks the lost.',
      keyLessons: ['Individual value', 'God seeks us', 'Heaven rejoices'],
      stars: '⭐'
    },
    {
      id: 'talents',
      title: 'The Talents',
      theme: 'Stewardship',
      reference: 'Matthew 25:14-30',
      difficulty: 3,
      summary: 'Using God-given abilities and resources wisely and faithfully.',
      modernApplication: 'Use your gifts and talents to serve God and others.',
      keyLessons: ['Faithful stewardship', 'Use your gifts', 'Accountability'],
      stars: '⭐⭐⭐'
    },
    {
      id: 'mustard-seed',
      title: 'The Mustard Seed',
      theme: 'Faith Growth',
      reference: 'Matthew 13:31-32',
      difficulty: 2,
      summary: 'Small beginnings can grow into something great in God\'s kingdom.',
      modernApplication: 'Don\'t despise small beginnings; God can do great things.',
      keyLessons: ['Small faith grows', 'God\'s kingdom expands', 'Potential in simplicity'],
      stars: '⭐⭐'
    }
  ];

  const sidebarItems = [
    { id: 'verse-explorer', name: 'Verse Explorer', icon: Search, description: 'Deep dive into individual verses' },
    { id: 'topical', name: 'Topical Study', icon: Library, description: 'Explore themes and topics across' },
    { id: 'parables', name: 'Parables Study', icon: TreePine, description: 'Study Jesus\' parables with moder' },
    { id: 'characters', name: 'Bible Characters', icon: Users, description: 'Explore biblical figures and their' }
  ];

  const handleStudyNow = (item: any) => {
    toast({
      title: "Study Started",
      description: `Opening ${item.title || item.name} study...`
    });
  };

  const handleLearnMore = (item: any) => {
    toast({
      title: "Learn More",
      description: `Getting more details about ${item.title || item.name}...`
    });
  };

  const filteredParables = parables.filter(parable => {
    const matchesSearch = parable.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         parable.theme.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'All' || parable.difficulty.toString() === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <ModernLayout>
      <div className="flex h-screen bg-gray-50">
        
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Library className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Study Hub</h1>
                <p className="text-sm text-gray-600">Advanced Bible Study</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      activeSection === item.id 
                        ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-xs opacity-70 truncate">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* TOPICAL STUDY */}
          {activeSection === 'topical' && (
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b bg-white">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">Topical Study</h2>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Foundation">Foundation</SelectItem>
                      <SelectItem value="Spiritual Growth">Growth</SelectItem>
                      <SelectItem value="Relationships">Relations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">English</span>
                  <Grid className="h-4 w-4 text-gray-500 ml-4" />
                  <Eye className="h-4 w-4 text-gray-500" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topicalStudies.map((topic) => (
                    <Card key={topic.id} className="hover:shadow-lg transition-shadow border border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900">{topic.title}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">{topic.subtitle}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-orange-600">{topic.verseCount}</div>
                            <div className="text-xs text-gray-500">verses</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-700 leading-relaxed">{topic.description}</p>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Key Verses</p>
                          <div className="space-y-1">
                            {topic.keyVerses.map((verse, index) => (
                              <div key={index} className="text-xs text-orange-600 font-medium">
                                {verse}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStudyNow(topic)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            Study Now
                            <Heart className="h-3 w-3 ml-2" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Share className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BIBLE CHARACTERS */}
          {activeSection === 'characters' && (
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b bg-white">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">Bible Characters</h2>
                  <Select value="All" onValueChange={() => {}}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Old">Old Testament</SelectItem>
                      <SelectItem value="New">New Testament</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value="All Roles" onValueChange={() => {}}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Roles">All Roles</SelectItem>
                      <SelectItem value="King">King</SelectItem>
                      <SelectItem value="Prophet">Prophet</SelectItem>
                      <SelectItem value="Apostle">Apostle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bibleCharacters.map((character) => (
                    <Card key={character.id} className="hover:shadow-lg transition-shadow border border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${character.color}`}>
                            {character.icon}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-gray-900">{character.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-medium text-gray-700">{character.role}</span>
                              <span className="text-xs text-gray-500">{character.testament}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-gray-400">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-700 leading-relaxed">{character.description}</p>
                        
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <span>{character.timeframe}</span>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Character Traits</p>
                          <div className="flex flex-wrap gap-1">
                            {character.traits.map((trait, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Notable Events</p>
                          <div className="space-y-1">
                            {character.notableEvents.slice(0, 2).map((event, index) => (
                              <div key={index} className="text-xs text-gray-600">• {event}</div>
                            ))}
                            {character.notableEvents.length > 2 && (
                              <div className="text-xs text-orange-600 font-medium">+{character.notableEvents.length - 2} more...</div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLearnMore(character)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            Learn More
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Share className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PARABLES STUDY */}
          {activeSection === 'parables' && (
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b bg-white">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">Parables Study</h2>
                  <div className="flex items-center gap-2 text-orange-600">
                    <TreePine className="h-4 w-4" />
                    <span className="text-sm font-medium">Similar Parables</span>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-6 border-b bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search any verse, topic or person"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredParables.map((parable) => (
                    <Card key={parable.id} className="hover:shadow-lg transition-shadow border border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-gray-900">{parable.title}</CardTitle>
                            <p className="text-sm text-orange-600 font-medium mt-1">{parable.theme}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg">{parable.stars}</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Reference</p>
                          <p className="text-sm text-orange-600 font-medium">{parable.reference}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Summary</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{parable.summary}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Modern Application</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{parable.modernApplication}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStudyNow(parable)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            Read Full
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Share className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VERSE EXPLORER (Coming Soon) */}
          {activeSection === 'verse-explorer' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Verse Explorer</h3>
                <p className="text-gray-600 mb-4">Deep dive into individual verses with context and insights</p>
                <p className="text-sm text-gray-500">Coming Soon</p>
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar - Quick Notes & Recent Studies */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          
          {/* Quick Notes */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <PenTool className="h-4 w-4 text-gray-500" />
              <h3 className="font-medium text-gray-900">Quick Notes</h3>
            </div>
            <div className="relative">
              <textarea
                placeholder="Save thoughts and insights..."
                className="w-full h-20 p-3 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Button size="sm" className="mt-2 bg-orange-500 hover:bg-orange-600">
                <Plus className="h-3 w-3 mr-2" />
                Save to Journal
              </Button>
            </div>
          </div>

          {/* Recent Studies */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-gray-500" />
              <h3 className="font-medium text-gray-900">Recent Studies</h3>
            </div>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="font-medium text-gray-900">John 3:16 Analysis</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">Prayer Topic Study</p>
                <p className="text-xs text-gray-500">Yesterday</p>
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">David Character Study</p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>

          {/* Bookmarks */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-gray-500" />
              <h3 className="font-medium text-gray-900">Bookmarks</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <span className="text-sm text-gray-700">Romans 8:28</span>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <span className="text-sm text-gray-700">Good Samaritan</span>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </div>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="flex-1 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-gray-500" />
              <h3 className="font-medium text-gray-900">AI Suggestions</h3>
            </div>
            <div className="text-sm text-gray-600">
              <p>Based on your recent studies, you might be interested in exploring themes of redemption and grace.</p>
            </div>
          </div>

        </div>

      </div>
    </ModernLayout>
  );
};

export default StudyHub; 