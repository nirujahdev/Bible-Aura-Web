import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSEO } from '@/hooks/useSEO';
import { ModernLayout } from '@/components/ModernLayout';
import { 
  Search, BookOpen, Users, Crown, TreePine, Library, 
  Heart, Star, Share, Languages, Grid, Filter,
  ChevronDown, Plus, Eye, ExternalLink, 
  PenTool, Lightbulb, Globe, Clock, Settings,
  ChevronLeft, ChevronRight, BookmarkPlus, Brain,
  MessageSquare, Sparkles, Send, Save, X,
  FileText, Tag, Calendar, TrendingUp
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
  
  // Journal/Notes State
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalNotes, setJournalNotes] = useState('');
  const [journalTitle, setJournalTitle] = useState('');
  const [journalCategory, setJournalCategory] = useState('study');
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiConversation, setAiConversation] = useState<Array<{role: string, content: string}>>([]);

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
      insights: [
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
      insights: [
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
      insights: [
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
      category: 'Knowledge',
      difficulty: 'Advanced',
      estimatedTime: '75 min',
      tags: ['wisdom', 'decisions', 'proverbs', 'discernment'],
      insights: [
        'The fear of the Lord is the beginning of wisdom',
        'God generously gives wisdom to those who ask',
        'All treasures of wisdom are found in Christ'
      ]
    },
    {
      id: 'hope',
      title: 'Hope & Future Promise',
      subtitle: 'Eternal Perspective',
      description: 'Discover the hope we have in Christ and how it transforms our perspective on trials and eternity.',
      verseCount: 84,
      keyVerses: ['Romans 15:13', '1 Peter 1:3', 'Jeremiah 29:11'],
      category: 'Future',
      difficulty: 'Intermediate',
      estimatedTime: '55 min',
      tags: ['hope', 'future', 'promises', 'eternity'],
      insights: [
        'God fills believers with joy and peace through hope',
        'We have a living hope through Christ\'s resurrection',
        'God has plans for our welfare and future'
      ]
    },
    {
      id: 'forgiveness',
      title: 'Forgiveness & Redemption',
      subtitle: 'Grace & Mercy',
      description: 'Learn about God\'s forgiveness and how to extend forgiveness to others through biblical examples.',
      verseCount: 72,
      keyVerses: ['Ephesians 4:32', 'Matthew 6:14-15', '1 John 1:9'],
      category: 'Grace',
      difficulty: 'Intermediate',
      estimatedTime: '65 min',
      tags: ['forgiveness', 'redemption', 'grace', 'mercy'],
      insights: [
        'We forgive others as God has forgiven us',
        'Forgiveness is essential for receiving God\'s forgiveness',
        'God is faithful to forgive when we confess our sins'
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
      id: 'esther',
      name: 'Esther',
      role: 'Queen & Deliverer',
      testament: 'Old Testament',
      timeframe: '519-465 BC',
      description: 'Jewish queen of Persia who courageously risked her life to save the Jewish people from destruction.',
      traits: ['Brave', 'Wise', 'Beautiful', 'Strategic', 'Faithful'],
      notableEvents: ['Chosen as Queen', 'Fast and Prayer', 'Revealing Her Identity', 'Saving the Jewish People', 'Establishment of Purim'],
      lessons: [
        'God positions us for His purposes',
        'Courage is required to stand for what\'s right',
        'Prayer and fasting prepare us for action'
      ],
      color: 'bg-yellow-100 text-yellow-800',
      icon: '👸',
      keyVerses: ['Esther 4:14', 'Esther 7:3', 'Esther 9:28'],
      modernApplication: 'Christians can learn about using their influence for justice and standing up for the oppressed.'
    },
    {
      id: 'paul',
      name: 'Paul (Saul)',
      role: 'Apostle & Missionary',
      testament: 'New Testament',
      timeframe: '5-67 AD',
      description: 'Former persecutor of Christians who became the greatest missionary and church planter, writing much of the New Testament.',
      traits: ['Zealous', 'Transformed', 'Dedicated', 'Bold', 'Scholarly'],
      notableEvents: ['Road to Damascus Conversion', 'Three Missionary Journeys', 'Church Planting', 'Prison Ministry', 'Writing Epistles'],
      lessons: [
        'God can transform anyone, regardless of their past',
        'Suffering often accompanies effective ministry',
        'The Gospel is for all people, not just one group'
      ],
      color: 'bg-orange-100 text-orange-800',
      icon: '✍️',
      keyVerses: ['Acts 9:15', 'Philippians 3:7-8', '2 Corinthians 12:9'],
      modernApplication: 'Modern Christians can learn about evangelism, church leadership, and persevering through trials.'
    },
    {
      id: 'mary-mother',
      name: 'Mary (Mother of Jesus)',
      role: 'Mother of Messiah',
      testament: 'New Testament',
      timeframe: '18 BC - 41 AD',
      description: 'The virgin chosen by God to bear His Son, demonstrating faith, obedience, and devotion throughout her life.',
      traits: ['Faithful', 'Humble', 'Trusting', 'Devoted', 'Pondering'],
      notableEvents: ['Annunciation by Angel Gabriel', 'Birth of Jesus', 'Presentation at Temple', 'Wedding at Cana', 'At the Cross'],
      lessons: [
        'God chooses the humble to accomplish great things',
        'Saying "yes" to God requires faith and trust',
        'Pondering God\'s words brings understanding'
      ],
      color: 'bg-pink-100 text-pink-800',
      icon: '🌹',
      keyVerses: ['Luke 1:38', 'Luke 2:19', 'John 19:25'],
      modernApplication: 'Believers can learn about submission to God\'s will, faith in difficult circumstances, and devotion to Christ.'
    }
  ];

  // Enhanced Parables with deeper insights
  const parables = [
    {
      id: 'good-samaritan',
      title: 'The Good Samaritan',
      theme: 'Love & Compassion',
      reference: 'Luke 10:25-37',
      difficulty: 2,
      summary: 'Jesus tells the story of a Samaritan who showed mercy to a Jewish man beaten by robbers, demonstrating true neighborly love.',
      modernApplication: 'Help others regardless of their background, race, or social status. True love crosses all boundaries.',
      keyLessons: ['Show mercy to all people', 'Love transcends social barriers', 'Actions prove our faith'],
      historicalContext: 'Jews and Samaritans had centuries of ethnic and religious tension, making this story shocking to Jesus\' audience.',
      practicalSteps: [
        'Look for opportunities to help those in need',
        'Overcome prejudices and stereotypes',
        'Be willing to invest time and resources in others'
      ],
      reflectionQuestions: [
        'Who are the "Samaritans" in your life?',
        'What prevents you from showing mercy to others?',
        'How can you be a better neighbor?'
      ],
      stars: '⭐⭐'
    },
    {
      id: 'prodigal-son',
      title: 'The Prodigal Son',
      theme: 'Forgiveness & Grace',
      reference: 'Luke 15:11-32',
      difficulty: 3,
      summary: 'A story of a wayward son who squanders his inheritance but returns home to find his father\'s unconditional love and forgiveness.',
      modernApplication: 'God always welcomes us back with open arms when we repent, no matter how far we\'ve wandered.',
      keyLessons: ['God\'s forgiveness is unlimited', 'Repentance leads to restoration', 'Grace triumphs over judgment'],
      historicalContext: 'In Jewish culture, asking for inheritance early was like wishing your father dead - an ultimate insult.',
      practicalSteps: [
        'Return to God when you\'ve strayed',
        'Forgive others as God has forgiven you',
        'Celebrate when others come to faith'
      ],
      reflectionQuestions: [
        'Are you more like the younger or older son?',
        'What keeps you from fully accepting God\'s grace?',
        'How can you extend grace to others?'
      ],
      stars: '⭐⭐⭐'
    },
    {
      id: 'mustard-seed',
      title: 'The Mustard Seed',
      theme: 'Kingdom Growth',
      reference: 'Matthew 13:31-32',
      difficulty: 2,
      summary: 'Jesus compares God\'s kingdom to a tiny mustard seed that grows into a large tree, showing how small beginnings can have huge impact.',
      modernApplication: 'Don\'t despise small beginnings. God can use small acts of faith to accomplish great things.',
      keyLessons: ['Small faith can grow exponentially', 'God\'s kingdom starts small but spreads', 'Patience is required for growth'],
      historicalContext: 'Mustard seeds were the smallest seeds known to farmers in ancient Palestine, yet grew into large shrubs.',
      practicalSteps: [
        'Start with small acts of faith',
        'Be patient with spiritual growth',
        'Trust God with the results'
      ],
      reflectionQuestions: [
        'What small seeds of faith can you plant today?',
        'How has God grown small beginnings in your life?',
        'Where do you need patience in your spiritual journey?'
      ],
      stars: '⭐⭐'
    }
  ];

  const navigationTabs = [
    { id: 'topical', name: 'Topical Studies', icon: Library, count: topicalStudies.length },
    { id: 'characters', name: 'Bible Characters', icon: Users, count: bibleCharacters.length },
    { id: 'parables', name: 'Parables', icon: TreePine, count: parables.length }
  ];

  const handleStudyNow = (item: any) => {
    toast({
      title: "Study Started",
      description: `Opening ${item.title || item.name} study...`
    });
  };

  const handleAddToJournal = (item: any) => {
    setJournalTitle(`Study Notes: ${item.title || item.name}`);
    setJournalNotes(`Study started for: ${item.title || item.name}\n\nKey insights:\n- `);
    setJournalOpen(true);
  };

  const handleSaveJournal = async () => {
    if (!journalTitle || !journalNotes) {
      toast({
        title: "Missing Information",
        description: "Please add both a title and notes before saving.",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically save to database
    // For now, we'll just show success message
    toast({
      title: "Journal Saved",
      description: "Your study notes have been saved successfully!"
    });
    
    // Reset form
    setJournalTitle('');
    setJournalNotes('');
    setJournalOpen(false);
  };

  const handleAIAssistant = async () => {
    if (!aiMessage.trim()) return;
    
    const newMessage = { role: 'user', content: aiMessage };
    setAiConversation(prev => [...prev, newMessage]);
    
    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant',
        content: `I'd be happy to help you study this topic! Based on your question about "${aiMessage}", here are some key biblical insights and practical applications...`
      };
      setAiConversation(prev => [...prev, aiResponse]);
    }, 1000);
    
    setAiMessage('');
  };

  const filteredParables = parables.filter(parable => {
    const matchesSearch = parable.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         parable.theme.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'All' || parable.difficulty.toString() === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <ModernLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
        
        {/* Top Navigation Bar */}
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
              <div className="hidden md:flex">
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

              {/* Right - Actions */}
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                
                {/* Journal Sheet Trigger */}
                <Sheet open={journalOpen} onOpenChange={setJournalOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <PenTool className="h-4 w-4 mr-2" />
                      Journal
                    </Button>
                  </SheetTrigger>
                </Sheet>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden pb-4">
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

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* TOPICAL STUDIES */}
          {activeSection === 'topical' && (
            <div className="space-y-6">
              
              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search topical studies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-40">
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

              {/* Studies Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <Card key={study.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {study.difficulty}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {study.estimatedTime}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg font-bold text-gray-900 leading-tight">
                              {study.title}
                            </CardTitle>
                            <p className="text-sm text-orange-600 font-medium mt-1">
                              {study.subtitle}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-orange-600">{study.verseCount}</div>
                            <div className="text-xs text-gray-500">verses</div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {study.description}
                        </p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {study.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Key Insights */}
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Key Insights</p>
                          <div className="space-y-1">
                            {study.insights.slice(0, 2).map((insight, index) => (
                              <div key={index} className="text-xs text-gray-600 flex items-start gap-1">
                                <span className="text-orange-500 mt-0.5">•</span>
                                {insight}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Key Verses */}
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Key Verses</p>
                          <div className="space-y-1">
                            {study.keyVerses.map((verse, index) => (
                              <div key={index} className="text-xs text-orange-600 font-medium">
                                {verse}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleStudyNow(study)}
                              className="bg-orange-500 hover:bg-orange-600"
                            >
                              <BookOpen className="h-3 w-3 mr-2" />
                              Study Now
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddToJournal(study)}
                            >
                              <Plus className="h-3 w-3 mr-2" />
                              Journal
                            </Button>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Heart className="h-3 w-3 text-gray-400" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Share className="h-3 w-3 text-gray-400" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* BIBLE CHARACTERS */}
          {activeSection === 'characters' && (
            <div className="space-y-6">
              
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search biblical characters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Testament" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Testament</SelectItem>
                      <SelectItem value="old">Old Testament</SelectItem>
                      <SelectItem value="new">New Testament</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="king">King</SelectItem>
                      <SelectItem value="prophet">Prophet</SelectItem>
                      <SelectItem value="apostle">Apostle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Characters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bibleCharacters.map((character) => (
                  <Card key={character.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${character.color}`}>
                          {character.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-gray-900">{character.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{character.role}</Badge>
                            <span className="text-xs text-gray-500">{character.testament}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{character.timeframe}</div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-gray-400">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {character.description}
                      </p>

                      {/* Character Traits */}
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Character Traits</p>
                        <div className="flex flex-wrap gap-1">
                          {character.traits.map((trait, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Key Lessons */}
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Key Lessons</p>
                        <div className="space-y-1">
                          {character.lessons.slice(0, 2).map((lesson, index) => (
                            <div key={index} className="text-xs text-gray-600 flex items-start gap-1">
                              <span className="text-orange-500 mt-0.5">•</span>
                              {lesson}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Modern Application */}
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Modern Application</p>
                        <p className="text-xs text-gray-600">
                          {character.modernApplication}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleStudyNow(character)}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            <BookOpen className="h-3 w-3 mr-2" />
                            Study
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddToJournal(character)}
                          >
                            <Plus className="h-3 w-3 mr-2" />
                            Journal
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Share className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* PARABLES STUDY */}
          {activeSection === 'parables' && (
            <div className="space-y-6">
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search parables..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-40">
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

              {/* Parables Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredParables.map((parable) => (
                  <Card key={parable.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-gray-900">{parable.title}</CardTitle>
                          <p className="text-sm text-orange-600 font-medium mt-1">{parable.theme}</p>
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
                    
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Summary</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{parable.summary}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Modern Application</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{parable.modernApplication}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Key Lessons</p>
                        <div className="space-y-1">
                          {parable.keyLessons.map((lesson, index) => (
                            <div key={index} className="text-xs text-gray-600 flex items-start gap-1">
                              <span className="text-orange-500 mt-0.5">•</span>
                              {lesson}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Historical Context</p>
                        <p className="text-xs text-gray-600 leading-relaxed">{parable.historicalContext}</p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleStudyNow(parable)}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            <BookOpen className="h-3 w-3 mr-2" />
                            Study
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddToJournal(parable)}
                          >
                            <Plus className="h-3 w-3 mr-2" />
                            Journal
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm">
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

        {/* Journal/Notes Sidebar */}
        <Sheet open={journalOpen} onOpenChange={setJournalOpen}>
          <SheetContent side="right" className="w-[400px] sm:w-[500px] p-0">
            <SheetHeader className="p-6 border-b">
              <SheetTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-orange-500" />
                Study Journal
              </SheetTitle>
            </SheetHeader>
            
            <div className="flex-1 flex flex-col h-full">
              {/* Journal Form */}
              <div className="flex-1 p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">
                    Title
                  </label>
                  <Input
                    placeholder="Enter study title..."
                    value={journalTitle}
                    onChange={(e) => setJournalTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">
                    Category
                  </label>
                  <Select value={journalCategory} onValueChange={setJournalCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="study">Bible Study</SelectItem>
                      <SelectItem value="reflection">Personal Reflection</SelectItem>
                      <SelectItem value="prayer">Prayer Points</SelectItem>
                      <SelectItem value="insight">Divine Insight</SelectItem>
                      <SelectItem value="question">Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-900 mb-2 block">
                    Notes
                  </label>
                  <Textarea
                    placeholder="Write your study notes, insights, and reflections..."
                    value={journalNotes}
                    onChange={(e) => setJournalNotes(e.target.value)}
                    className="min-h-[200px] resize-none"
                  />
                </div>

                {/* AI Assistant Toggle */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">AI Study Assistant</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
                    >
                      {aiAssistantOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>

                  {aiAssistantOpen && (
                    <div className="space-y-3 pt-3 border-t">
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {aiConversation.map((message, index) => (
                          <div key={index} className={`text-xs p-2 rounded ${
                            message.role === 'user' 
                              ? 'bg-orange-50 text-orange-800 ml-4' 
                              : 'bg-purple-50 text-purple-800 mr-4'
                          }`}>
                            <span className="font-medium">
                              {message.role === 'user' ? 'You: ' : 'AI: '}
                            </span>
                            {message.content}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ask AI about this study..."
                          value={aiMessage}
                          onChange={(e) => setAiMessage(e.target.value)}
                          className="text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && handleAIAssistant()}
                        />
                        <Button
                          size="sm"
                          onClick={handleAIAssistant}
                          disabled={!aiMessage.trim()}
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t p-6 space-y-3">
                <Button
                  onClick={handleSaveJournal}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save to Journal
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setJournalOpen(false)}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

      </div>
    </ModernLayout>
  );
};

export default StudyHub; 