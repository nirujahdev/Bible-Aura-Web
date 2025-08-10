import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSEO } from '@/hooks/useSEO';
import { ModernLayout } from '@/components/ModernLayout';
import { 
  Search, BookOpen, Users, Crown, TreePine, Library, 
  Heart, Star, Share, Plus, Eye, ArrowLeft
} from 'lucide-react';

// Import individual study components
import { PrayerStudy } from '@/studies/topical/Prayer';
import { JesusStudy } from '@/studies/characters/Jesus';
import { GoodSamaritanStudy } from '@/studies/parables/GoodSamaritan';

// SEO Configuration for Study Hub
const SEO_CONFIG = {
  title: "Study Hub - Comprehensive Bible Study Tools | Bible Aura",
  description: "Explore in-depth Bible studies with our comprehensive Study Hub. Access topical studies, character profiles, and parable explanations to deepen your faith journey.",
  keywords: "bible study, topical study, bible characters, parables, spiritual growth, christian education",
  ogTitle: "Study Hub - Deep Bible Study Made Simple",
};

const StudyHub = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // SEO optimization
  useSEO(SEO_CONFIG);

  const [activeSection, setActiveSection] = useState('topical');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  
  // Current study state
  const [currentStudy, setCurrentStudy] = useState<{type: string, id: string} | null>(null);

  // Enhanced Topical Study Data with more depth
  const topicalStudies = [
    {
      id: 'prayer',
      title: 'Prayer & Intercession',
      subtitle: 'Spiritual Disciplines',
      description: 'Discover the power of prayer through biblical examples, different prayer types, and practical applications for daily spiritual growth.',
      verseCount: 127,
      keyVerses: ['Matthew 6:9-13', '1 Thessalonians 5:17', 'James 5:16'],
      category: 'Spiritual Growth',
      difficulty: 'Beginner',
      estimatedTime: '45 min',
      tags: ['prayer', 'worship', 'intercession', 'spiritual-discipline'],
      keyInsights: [
        'Jesus taught us to pray with the Lord\'s Prayer as our model',
        'Paul encourages continuous prayer in all circumstances',
        'Effective prayer involves faith, persistence, and alignment with God\'s will'
      ]
    },
    {
      id: 'faith',
      title: 'Faith & Trust',
      subtitle: 'Core Biblical Foundations',
      description: 'Explore biblical faith through the stories of great faith heroes and understand how to apply faith principles in modern life.',
      verseCount: 89,
      keyVerses: ['Hebrews 11:1', 'Romans 10:17', 'James 2:17'],
      category: 'Foundation',
      difficulty: 'Intermediate',
      estimatedTime: '60 min',
      tags: ['faith', 'trust', 'belief', 'foundation'],
      keyInsights: [
        'Faith is confidence in God\'s promises even when unseen',
        'Faith comes through hearing God\'s word',
        'True faith is demonstrated through actions and works'
      ]
    },
    {
      id: 'love',
      title: 'Divine Love & Relationships',
      subtitle: 'Character & Relationships',
      description: 'Understand God\'s unconditional love and learn how to express Christ-like love in all relationships.',
      verseCount: 156,
      keyVerses: ['1 John 4:8', '1 Corinthians 13:4-7', 'John 3:16'],
      category: 'Relationships',
      difficulty: 'Beginner',
      estimatedTime: '50 min',
      tags: ['love', 'relationships', 'agape', 'compassion'],
      keyInsights: [
        'God is love - it\'s His very nature and essence',
        'Love is patient, kind, and seeks the good of others',
        'God\'s love for humanity motivated the ultimate sacrifice'
      ]
    },
    {
      id: 'wisdom',
      title: 'Biblical Wisdom & Decision Making',
      subtitle: 'Practical Living',
      description: 'Gain biblical wisdom for life decisions through Proverbs, Ecclesiastes, and the teachings of Jesus.',
      verseCount: 98,
      keyVerses: ['Proverbs 9:10', 'James 1:5', 'Colossians 2:3'],
      category: 'Practical Living',
      difficulty: 'Advanced',
      estimatedTime: '75 min',
      tags: ['wisdom', 'decisions', 'proverbs', 'discernment'],
      keyInsights: [
        'The fear of the Lord is the beginning of wisdom',
        'God generously gives wisdom to those who ask',
        'In Christ are hidden all treasures of wisdom and knowledge'
      ]
    }
  ];

  // Enhanced Bible Characters with more detail
  const bibleCharacters = [
    {
      id: 'moses',
      name: 'Moses',
      role: 'Prophet & Lawgiver',
      testament: 'Old Testament',
      timeframe: '1393-1273 BC',
      description: 'The great prophet who led the Israelites out of Egypt, received the Ten Commandments, and established the foundation of Jewish law.',
      traits: ['Humble', 'Faithful', 'Patient', 'Leader', 'Intercession'],
      notableEvents: ['Burning Bush Encounter', 'Ten Plagues of Egypt', 'Exodus from Egypt', 'Receiving the Ten Commandments', 'Parting the Red Sea', '40 Years in Wilderness'],
      lessons: [
        'God uses ordinary people for extraordinary purposes',
        'Humility is essential for effective leadership',
        'Intercession for others reflects God\'s heart'
      ],
      color: 'bg-blue-100 text-blue-800',
      icon: '👑',
      keyVerses: ['Exodus 3:10', 'Numbers 12:3', 'Deuteronomy 34:10'],
      modernApplication: 'Leaders today can learn about servant leadership, intercession, and trusting God through difficulties.'
    },
    {
      id: 'jesus',
      name: 'Jesus Christ',
      role: 'Savior & Lord',
      testament: 'New Testament',
      timeframe: '4 BC - 30 AD',
      description: 'The Son of God who became human to save humanity, teaching with perfect wisdom and love, and conquering death through His resurrection.',
      traits: ['Compassionate', 'Wise', 'Holy', 'Humble', 'Sacrificial'],
      notableEvents: ['Virgin Birth', 'Baptism', 'Transfiguration', 'Crucifixion', 'Resurrection', 'Ascension'],
      lessons: [
        'Perfect love requires perfect sacrifice',
        'Humility and service mark true greatness',
        'Forgiveness has the power to transform lives'
      ],
      color: 'bg-gold-100 text-gold-800',
      icon: '✝️',
      keyVerses: ['John 3:16', 'John 14:6', 'Philippians 2:5-8'],
      modernApplication: 'Jesus provides the perfect model for living with love, sacrifice, and purpose in every relationship and situation.'
    },
    {
      id: 'david',
      name: 'King David',
      role: 'King & Psalmist',
      testament: 'Old Testament',
      timeframe: '1040-970 BC',
      description: 'The shepherd boy who became Israel\'s greatest king, a man after God\'s own heart who wrote many psalms.',
      traits: ['Courageous', 'Worshipful', 'Repentant', 'Passionate', 'Strategic'],
      notableEvents: ['Defeating Goliath', 'Anointed as King', 'Bringing the Ark to Jerusalem', 'Sin with Bathsheba', 'Writing Psalms'],
      lessons: [
        'God looks at the heart, not outward appearance',
        'Genuine repentance leads to restoration',
        'Worship should be central to our lives'
      ],
      color: 'bg-purple-100 text-purple-800',
      icon: '🎵',
      keyVerses: ['1 Samuel 16:7', 'Psalm 51:10', '2 Samuel 7:16'],
      modernApplication: 'David shows us how to maintain a worshipful heart through both victories and failures, always returning to God in repentance.'
    },
    {
      id: 'paul',
      name: 'Apostle Paul',
      role: 'Apostle & Missionary',
      testament: 'New Testament',
      timeframe: '5-67 AD',
      description: 'Former persecutor of Christians who became the greatest missionary and theologian of the early church, writing much of the New Testament.',
      traits: ['Zealous', 'Intellectual', 'Missionary-hearted', 'Persistent', 'Transformative'],
      notableEvents: ['Conversion on Damascus Road', 'Three Missionary Journeys', 'Writing Epistles', 'Imprisonment', 'Martyrdom'],
      lessons: [
        'God can radically transform anyone',
        'The Gospel is for all people, not just one group',
        'Suffering for Christ can lead to greater ministry'
      ],
      color: 'bg-green-100 text-green-800',
      icon: '📜',
      keyVerses: ['Acts 9:15', 'Philippians 3:7-8', '2 Timothy 4:7'],
      modernApplication: 'Paul demonstrates how education, passion, and complete surrender to God can be used to reach people across cultural boundaries.'
    }
  ];

  // Enhanced Parables with deeper insights
  const parables = [
    {
      id: 'good-samaritan',
      title: 'The Good Samaritan',
      reference: 'Luke 10:25-37',
      theme: 'Love & Compassion',
      difficulty: 2,
      stars: '⭐⭐⭐⭐⭐',
      summary: 'Jesus tells of a Samaritan who shows mercy to a wounded traveler, demonstrating true neighborly love that transcends cultural barriers.',
      keyLessons: [
        'Love extends beyond cultural and racial boundaries',
        'Actions speak louder than religious titles',
        'Mercy requires both compassion and sacrifice'
      ],
      modernApplication: 'In our diverse world, this parable challenges us to show practical love to all people, especially those different from us.',
      historicalContext: 'Samaritans were despised by Jews, making the hero choice shocking to Jesus\' audience.',
      practicalSteps: [
        'Look for opportunities to help regardless of background',
        'Let compassion drive action, not just feeling',
        'Consider the cost and choose love anyway'
      ]
    },
    {
      id: 'prodigal-son',
      title: 'The Prodigal Son',
      reference: 'Luke 15:11-32',
      theme: 'Forgiveness & Grace',
      difficulty: 2,
      stars: '⭐⭐⭐⭐⭐',
      summary: 'A story of a wayward son who squanders his inheritance but finds forgiveness and restoration from his loving father.',
      keyLessons: [
        'God\'s love is unconditional and always waiting',
        'True repentance leads to complete restoration',
        'Grace can create resentment in religious hearts'
      ],
      modernApplication: 'This parable shows God\'s heart for the lost and challenges us to extend the same grace to others.',
      historicalContext: 'In ancient culture, asking for inheritance early was like wishing the father was dead.',
      practicalSteps: [
        'Recognize God\'s patient love in your own life',
        'Practice forgiveness without conditions',
        'Celebrate restoration rather than harboring resentment'
      ]
    },
    {
      id: 'talents',
      title: 'The Parable of the Talents',
      reference: 'Matthew 25:14-30',
      theme: 'Stewardship & Responsibility',
      difficulty: 3,
      stars: '⭐⭐⭐⭐',
      summary: 'Three servants receive different amounts of money to invest, revealing principles about faithfulness and accountability in God\'s kingdom.',
      keyLessons: [
        'God gives different gifts and expects faithful stewardship',
        'Fear of failure can lead to spiritual paralysis',
        'Faithfulness in small things leads to greater opportunities'
      ],
      modernApplication: 'This parable challenges us to actively use our God-given abilities, resources, and opportunities for His kingdom.',
      historicalContext: 'A talent was an enormous sum of money, equivalent to 15+ years of wages for a common laborer.',
      practicalSteps: [
        'Identify your God-given talents and resources',
        'Take faithful action rather than playing it safe',
        'Invest in kingdom purposes, not just personal gain'
      ]
    }
  ];

  // Navigation tabs data
  const navigationTabs = [
    { id: 'topical', name: 'Topical Studies', icon: TreePine, count: topicalStudies.length },
    { id: 'characters', name: 'Bible Characters', icon: Users, count: bibleCharacters.length },
    { id: 'parables', name: 'Parables', icon: Crown, count: parables.length }
  ];

  // Handler functions
  const handleStudyNow = (study: any) => {
    setCurrentStudy({ type: activeSection, id: study.id });
  };

  const handleBackToOverview = () => {
    setCurrentStudy(null);
  };

  const filteredParables = parables.filter(parable => {
    const matchesSearch = parable.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         parable.theme.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'All' || parable.difficulty.toString() === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  // Render individual study component
  const renderStudyComponent = () => {
    if (!currentStudy) return null;

    const { type, id } = currentStudy;

    switch (type) {
      case 'topical':
        if (id === 'prayer') return <PrayerStudy onBack={handleBackToOverview} />;
        break;
      case 'characters':
        if (id === 'jesus') return <JesusStudy onBack={handleBackToOverview} />;
        break;
      case 'parables':
        if (id === 'good-samaritan') return <GoodSamaritanStudy onBack={handleBackToOverview} />;
        break;
    }

    // Fallback for studies not yet implemented
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={handleBackToOverview} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Study Component</h1>
            <p className="text-gray-600">This study will be available soon.</p>
          </div>
        </div>

        <Card className="p-6">
          <p className="text-center text-gray-500">
            This study component is under development. Please check back soon!
          </p>
        </Card>
      </div>
    );
  };

  // If viewing individual study, render it full width
  if (currentStudy) {
    return (
      <ModernLayout>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
          <div className="max-w-7xl mx-auto">
            {renderStudyComponent()}
          </div>
        </div>
      </ModernLayout>
    );
  }

  // Main overview interface - Full Width Design
  return (
    <ModernLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
        
        {/* Full Width Content Area */}
        <div className="w-full overflow-y-auto">
          {/* Top Navigation Bar - Sticky */}
          <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                
                {/* Left - Study Hub Title */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Library className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Study Hub</h1>
                    <p className="text-sm text-gray-600">Advanced Bible Study Tools</p>
                  </div>
                </div>

                {/* Center - Navigation Tabs */}
                <div className="hidden lg:flex">
                  <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
                    <TabsList className="bg-gray-100">
                      {navigationTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="flex items-center gap-2 px-4 py-2"
                          >
                            <Icon className="h-4 w-4" />
                            {tab.name}
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {tab.count}
                            </Badge>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </Tabs>
                </div>

                {/* Right - Search */}
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              {/* Mobile Navigation & Search */}
              <div className="lg:hidden pb-4 space-y-3">
                <div className="relative sm:hidden">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search studies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full bg-gray-50 border-0 focus:bg-white"
                  />
                </div>
                <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
                  <TabsList className="w-full bg-gray-100">
                    {navigationTabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <TabsTrigger
                          key={tab.id}
                          value={tab.id}
                          className="flex-1 flex items-center gap-1 text-xs"
                        >
                          <Icon className="h-3 w-3" />
                          <span className="hidden xs:inline">{tab.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {tab.count}
                          </Badge>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Study Content - Full Width Container */}
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            
            {/* TOPICAL STUDIES */}
            {activeSection === 'topical' && (
              <div className="space-y-8">
                
                {/* Search and Filter Bar */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search topical studies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/80 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  <div className="flex items-center gap-4 w-full lg:w-auto">
                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                      <SelectTrigger className="w-full lg:w-40 bg-white/80">
                        <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Levels</SelectItem>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Full Width Studies Grid - Optimized for Large Screens */}
                <div className="grid gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
                  {topicalStudies
                    .filter(study => 
                      study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      study.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      study.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .filter(study => 
                      difficultyFilter === 'All' || study.difficulty === difficultyFilter
                    )
                    .map((study) => (
                      <Card key={study.id} className="group hover:shadow-2xl transition-all duration-500 ease-in-out border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:scale-[1.02] hover:bg-white/95 relative overflow-hidden">
                        {/* Background gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <CardHeader className="pb-4 relative z-10">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={study.difficulty === 'Beginner' ? 'default' : 
                                         study.difficulty === 'Intermediate' ? 'secondary' : 'destructive'} 
                                  className="text-xs font-medium"
                                >
                                  {study.difficulty}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {study.estimatedTime}
                                </Badge>
                              </div>
                              <CardTitle className="text-lg font-bold text-gray-900 leading-tight group-hover:text-orange-700 transition-colors duration-300">
                                {study.title}
                              </CardTitle>
                              <p className="text-sm text-orange-600 font-medium">{study.category}</p>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="text-2xl font-bold text-orange-500">{study.verseCount}</div>
                              <p className="text-xs text-gray-500 font-medium">verses</p>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-5 relative z-10">
                          <div>
                            <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{study.description}</p>
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-900 mb-2">Key Insights</p>
                            <div className="space-y-1">
                              {study.keyInsights.slice(0, 2).map((insight, index) => (
                                <div key={index} className="text-xs text-gray-600 flex items-start gap-2 leading-relaxed">
                                  <span className="text-orange-500 mt-1 text-xs">➤</span>
                                  <span>{insight}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-900 mb-2">Key Verses</p>
                            <div className="flex flex-wrap gap-1">
                              {study.keyVerses.slice(0, 3).map((verse, index) => (
                                <Badge key={index} variant="outline" className="text-xs text-orange-600 border-orange-200">
                                  {verse}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 pt-2">
                            {study.tags.slice(0, 4).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleStudyNow(study)}
                                className="bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                              >
                                <BookOpen className="h-3 w-3 mr-2" />
                                Study Now
                              </Button>
                            </div>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500">
                              <Share className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* BIBLE CHARACTERS */}
            {activeSection === 'characters' && (
              <div className="space-y-8">
                
                {/* Search and Filter Bar */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search biblical characters..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/80 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  <div className="flex items-center gap-4 w-full lg:w-auto">
                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                      <SelectTrigger className="w-full lg:w-40 bg-white/80">
                        <SelectValue placeholder="All Characters" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Characters</SelectItem>
                        <SelectItem value="1">Major Figures</SelectItem>
                        <SelectItem value="2">Prophets</SelectItem>
                        <SelectItem value="3">Kings & Leaders</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Full Width Characters Grid */}
                <div className="grid gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
                  {bibleCharacters.map((character) => (
                    <Card key={character.id} className="group hover:shadow-2xl transition-all duration-500 ease-in-out border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:scale-[1.02] hover:bg-white/95 relative overflow-hidden">
                      {/* Background gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <CardHeader className="pb-4 relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">{character.name}</CardTitle>
                            <p className="text-sm text-blue-600 font-medium mt-1">{character.testament}</p>
                            <p className="text-sm text-gray-600 font-medium mt-1">{character.role}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg">{character.icon}</div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {character.testament === 'Old Testament' ? 'OT' : 'NT'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-5 relative z-10">
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Background</p>
                          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{character.description}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Key Lessons</p>
                          <div className="space-y-1">
                            {character.lessons.slice(0, 2).map((lesson, index) => (
                              <div key={index} className="text-xs text-gray-600 flex items-start gap-2 leading-relaxed">
                                <span className="text-blue-500 mt-1">➤</span>
                                <span>{lesson}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Key Verses</p>
                          <div className="flex flex-wrap gap-1">
                            {character.keyVerses.slice(0, 3).map((verse, index) => (
                              <Badge key={index} variant="outline" className="text-xs text-blue-600 border-blue-200">
                                {verse}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleStudyNow(character)}
                              className="bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                            >
                              <BookOpen className="h-3 w-3 mr-2" />
                              Study
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-500">
                            <Share className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* PARABLES */}
            {activeSection === 'parables' && (
              <div className="space-y-8">
                
                {/* Search and Filter Bar */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search parables..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/80 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  <div className="flex items-center gap-4 w-full lg:w-auto">
                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                      <SelectTrigger className="w-full lg:w-40 bg-white/80">
                        <SelectValue placeholder="All Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Difficulty</SelectItem>
                        <SelectItem value="1">Beginner</SelectItem>
                        <SelectItem value="2">Intermediate</SelectItem>
                        <SelectItem value="3">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Full Width Parables Grid */}
                <div className="grid gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
                  {filteredParables.map((parable) => (
                    <Card key={parable.id} className="group hover:shadow-2xl transition-all duration-500 ease-in-out border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:scale-[1.02] hover:bg-white/95 relative overflow-hidden">
                      {/* Background gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <CardHeader className="pb-4 relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300">{parable.title}</CardTitle>
                            <p className="text-sm text-green-600 font-medium mt-1">{parable.theme}</p>
                            <p className="text-sm text-gray-600 font-medium mt-1">{parable.reference}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg">{parable.stars}</div>
                            <Badge variant="outline" className="text-xs mt-1">
                              Level {parable.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-5 relative z-10">
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Summary</p>
                          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{parable.summary}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Modern Application</p>
                          <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{parable.modernApplication}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Key Lessons</p>
                          <div className="space-y-1">
                            {parable.keyLessons.slice(0, 2).map((lesson, index) => (
                              <div key={index} className="text-xs text-gray-600 flex items-start gap-2 leading-relaxed">
                                <span className="text-green-500 mt-1">➤</span>
                                <span>{lesson}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Historical Context</p>
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{parable.historicalContext}</p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleStudyNow(parable)}
                              className="bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                            >
                              <BookOpen className="h-3 w-3 mr-2" />
                              Study
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-500">
                            <Share className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModernLayout>
  );
};

export default StudyHub; 