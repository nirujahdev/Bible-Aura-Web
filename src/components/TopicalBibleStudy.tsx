import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, Filter, BookOpen, Bookmark, Heart, Share2, Download, 
  Eye, ChevronDown, ChevronRight, Network, Link, Star, Plus,
  ArrowRight, BookmarkCheck, Copy, ExternalLink, Grid3X3,
  Library, Tags, Target, TreePine, Layers, Globe, Home,
  Users, Crown, Shield, Lightbulb, Compass, FileText
} from "lucide-react";

interface Topic {
  id: string;
  name: string;
  description: string;
  category: string;
  level: number;
  parent_topic_id: string | null;
  verse_count: number;
  children?: Topic[];
}

interface TopicVerse {
  id: string;
  topic_id: string;
  verse_id: string;
  relevance_score: number;
  context_notes: string;
  verse: {
    chapter: number;
    verse: number;
    text_esv: string;
    text_kjv: string;
    text_niv: string;
    text_nasb: string;
    book: {
      name: string;
      testament: string;
    };
  };
}

interface CrossReference {
  id: string;
  related_topic: Topic;
  relationship_type: string;
  strength: number;
}

const TopicalBibleStudy = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [topicVerses, setTopicVerses] = useState<TopicVerse[]>([]);
  const [crossReferences, setCrossReferences] = useState<CrossReference[]>([]);
  const [bookmarkedTopics, setBookmarkedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTranslation, setSelectedTranslation] = useState("esv");
  const [testamentFilter, setTestamentFilter] = useState("all");
  const [relevanceFilter, setRelevanceFilter] = useState(0);
  
  // UI state
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showVerseDetails, setShowVerseDetails] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<TopicVerse | null>(null);

  // Main theological categories with 500+ topics
  const mainCategories = [
    {
      name: "Salvation & Redemption",
      icon: Heart,
      color: "text-red-600",
      subcategories: ["Salvation", "Grace", "Faith", "Justification", "Sanctification", "Redemption", "Atonement", "Forgiveness", "Repentance", "Conversion"]
    },
    {
      name: "God & Trinity",
      icon: Crown,
      color: "text-purple-600",
      subcategories: ["God the Father", "Jesus Christ", "Holy Spirit", "Trinity", "Divine Attributes", "God's Nature", "God's Will", "Divine Love", "Divine Justice", "Omnipotence"]
    },
    {
      name: "Prayer & Worship",
      icon: Globe,
      color: "text-blue-600",
      subcategories: ["Prayer", "Worship", "Praise", "Thanksgiving", "Intercession", "Petition", "Meditation", "Fasting", "Spiritual Disciplines", "Liturgy"]
    },
    {
      name: "Christian Living",
      icon: Compass,
      color: "text-green-600",
      subcategories: ["Discipleship", "Character", "Fruit of Spirit", "Holiness", "Obedience", "Service", "Stewardship", "Witness", "Growth", "Maturity"]
    },
    {
      name: "Leadership & Ministry",
      icon: Users,
      color: "text-orange-600",
      subcategories: ["Church Leadership", "Pastoral Care", "Preaching", "Teaching", "Evangelism", "Missions", "Church Growth", "Discipleship", "Mentoring", "Administration"]
    },
    {
      name: "Wisdom & Knowledge",
      icon: Lightbulb,
      color: "text-yellow-600",
      subcategories: ["Wisdom", "Knowledge", "Understanding", "Discernment", "Truth", "Learning", "Teaching", "Counsel", "Guidance", "Insight"]
    },
    {
      name: "Prophecy & Eschatology",
      icon: Eye,
      color: "text-indigo-600",
      subcategories: ["Prophecy", "Second Coming", "End Times", "Resurrection", "Judgment", "Heaven", "Hell", "Kingdom of God", "Millennium", "Eternal Life"]
    },
    {
      name: "Church & Community",
      icon: Home,
      color: "text-teal-600",
      subcategories: ["Church", "Fellowship", "Unity", "Community", "Body of Christ", "Spiritual Gifts", "Ministry", "Service", "Love", "Relationships"]
    },
    {
      name: "Scripture & Revelation",
      icon: BookOpen,
      color: "text-pink-600",
      subcategories: ["Scripture", "Word of God", "Revelation", "Inspiration", "Authority", "Canon", "Interpretation", "Prophecy", "Truth", "Study"]
    },
    {
      name: "Ethics & Morality",
      icon: Shield,
      color: "text-gray-600",
      subcategories: ["Ethics", "Morality", "Righteousness", "Sin", "Temptation", "Purity", "Integrity", "Justice", "Mercy", "Compassion"]
    }
  ];

  // Load topics from database
  useEffect(() => {
    fetchTopics();
    if (user) {
      fetchBookmarkedTopics();
    }
  }, [user]);

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('theological_topics')
        .select('*')
        .order('category', { ascending: true })
        .order('level', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Organize topics hierarchically
      const organizedTopics = organizeTopicsHierarchically(data || []);
      setTopics(organizedTopics);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load topics';
      toast({
        title: "Error loading topics",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const organizeTopicsHierarchically = (topicsData: unknown[]): Topic[] => {
    const topicMap = new Map();
    const rootTopics: Topic[] = [];

    // First pass: create map of all topics
    topicsData.forEach(topic => {
      topicMap.set(topic.id, { ...topic, children: [] });
    });

    // Second pass: organize hierarchy
    topicsData.forEach(topic => {
      const topicNode = topicMap.get(topic.id);
      if (topic.parent_topic_id && topicMap.has(topic.parent_topic_id)) {
        topicMap.get(topic.parent_topic_id).children.push(topicNode);
      } else {
        rootTopics.push(topicNode);
      }
    });

    return rootTopics;
  };

  const fetchBookmarkedTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('user_topic_bookmarks')
        .select('topic_id')
        .eq('user_id', user?.id);

      if (error) throw error;
      setBookmarkedTopics(data?.map(b => b.topic_id) || []);
    } catch (error: unknown) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const fetchTopicVerses = async (topicId: string) => {
    try {
      const { data, error } = await supabase
        .from('topic_verses')
        .select(`
          *,
          verse:bible_verses(
            chapter,
            verse,
            text_esv,
            text_kjv,
            text_niv,
            text_nasb,
            book:bible_books(name, testament)
          )
        `)
        .eq('topic_id', topicId)
        .order('relevance_score', { ascending: false });

      if (error) throw error;
      setTopicVerses(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading verses",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchCrossReferences = async (topicId: string) => {
    try {
      const { data, error } = await supabase
        .from('topic_cross_references')
        .select(`
          *,
          related_topic:theological_topics!related_topic_id(*)
        `)
        .eq('primary_topic_id', topicId)
        .order('strength', { ascending: false });

      if (error) throw error;
      setCrossReferences(data || []);
    } catch (error: any) {
      console.error('Error loading cross-references:', error);
    }
  };

  const handleTopicSelect = async (topic: Topic) => {
    setSelectedTopic(topic);
    await Promise.all([
      fetchTopicVerses(topic.id),
      fetchCrossReferences(topic.id)
    ]);
  };

  const toggleBookmark = async (topicId: string) => {
    if (!user) return;

    try {
      if (bookmarkedTopics.includes(topicId)) {
        const { error } = await supabase
          .from('user_topic_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('topic_id', topicId);

        if (error) throw error;
        setBookmarkedTopics(prev => prev.filter(id => id !== topicId));
        toast({ title: "Bookmark removed" });
      } else {
        const { error } = await supabase
          .from('user_topic_bookmarks')
          .insert({
            user_id: user.id,
            topic_id: topicId
          });

        if (error) throw error;
        setBookmarkedTopics(prev => [...prev, topicId]);
        toast({ title: "Bookmark added" });
      }
    } catch (error: any) {
      toast({
        title: "Error updating bookmark",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyVerseReference = (verse: TopicVerse) => {
    const reference = `${verse.verse.book.name} ${verse.verse.chapter}:${verse.verse.verse}`;
    const text = verse.verse[`text_${selectedTranslation}` as keyof typeof verse.verse] as string;
    const fullText = `"${text}" - ${reference}`;
    
    navigator.clipboard.writeText(fullText);
    toast({ title: "Verse copied to clipboard" });
  };

  const shareVerse = async (verse: TopicVerse) => {
    const reference = `${verse.verse.book.name} ${verse.verse.chapter}:${verse.verse.verse}`;
    const text = verse.verse[`text_${selectedTranslation}` as keyof typeof verse.verse] as string;
    const shareText = `"${text}" - ${reference}`;

    if (navigator.share) {
      await navigator.share({
        title: 'Bible Verse',
        text: shareText,
        url: window.location.href
      });
    } else {
      copyVerseReference(verse);
    }
  };

  // Filter topics based on search and category
  const filteredTopics = useMemo(() => {
    return topics.filter(topic => {
      const matchesSearch = !searchQuery || 
        topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || topic.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [topics, searchQuery, selectedCategory]);

  // Filter verses based on criteria
  const filteredVerses = useMemo(() => {
    return topicVerses.filter(topicVerse => {
      const matchesTestament = testamentFilter === "all" || 
        topicVerse.verse.book.testament === testamentFilter;
      
      const matchesRelevance = topicVerse.relevance_score >= relevanceFilter;
      
      return matchesTestament && matchesRelevance;
    });
  }, [topicVerses, testamentFilter, relevanceFilter]);

  const renderTopicTree = (topicList: Topic[], level = 0) => {
    return topicList.map(topic => (
      <div key={topic.id} className={`ml-${level * 4}`}>
        <div 
          className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-orange-50 dark:hover:bg-orange-900/20 ${
            selectedTopic?.id === topic.id ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300' : 'border-gray-200 dark:border-gray-700'
          }`}
          onClick={() => handleTopicSelect(topic)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {topic.children && topic.children.length > 0 && (
                expandedCategories.includes(topic.id) ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              )}
              <TreePine className="h-4 w-4 text-orange-600" />
              <div>
                <h4 className="font-medium">{topic.name}</h4>
                {topic.description && (
                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{topic.verse_count} verses</Badge>
              {user && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(topic.id);
                  }}
                >
                  {bookmarkedTopics.includes(topic.id) ? 
                    <BookmarkCheck className="h-4 w-4 text-orange-600" /> :
                    <Bookmark className="h-4 w-4" />
                  }
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {topic.children && topic.children.length > 0 && expandedCategories.includes(topic.id) && (
          <div className="mt-2">
            {renderTopicTree(topic.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const renderVerseCard = (topicVerse: TopicVerse) => {
    const verse = topicVerse.verse;
    const verseText = verse[`text_${selectedTranslation}` as keyof typeof verse] as string;
    const reference = `${verse.book.name} ${verse.chapter}:${verse.verse}`;

    return (
      <Card key={topicVerse.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {verse.book.testament}
              </Badge>
              <Badge 
                variant="secondary" 
                className={`text-xs ${
                  topicVerse.relevance_score >= 8 ? 'bg-green-100 text-green-800' :
                  topicVerse.relevance_score >= 6 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                {topicVerse.relevance_score}/10 relevance
              </Badge>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyVerseReference(topicVerse)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => shareVerse(topicVerse)}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedVerse(topicVerse);
                  setShowVerseDetails(true);
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <blockquote className="text-lg font-serif italic leading-relaxed mb-3 border-l-4 border-orange-300 pl-4">
            "{verseText}"
          </blockquote>
          
          <div className="flex justify-between items-center">
            <cite className="text-sm font-medium text-orange-700 dark:text-orange-400">
              {reference}
            </cite>
            {topicVerse.context_notes && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedVerse(topicVerse);
                  setShowVerseDetails(true);
                }}
              >
                <FileText className="h-4 w-4 mr-1" />
                Notes
              </Button>
            )}
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
              <Library className="h-6 w-6" />
              <h1 className="text-2xl font-divine">Topical Bible Study</h1>
              <Star className="h-5 w-5" />
            </div>
            <p className="text-white/80 mt-1">Explore 500+ theological topics with organized verse collections</p>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading theological topics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Header */}
      <div className="bg-aura-gradient text-white border-b sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-2">
            <Library className="h-5 w-5 sm:h-6 sm:w-6" />
            <h1 className="text-xl sm:text-2xl font-divine">Topical Bible Study</h1>
            <Star className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <p className="text-white/80 mt-1 text-sm sm:text-base">Explore 500+ theological topics with organized verse collections</p>
        </div>
      </div>

              <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Topics Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="h-auto lg:sticky lg:top-24">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Tags className="h-5 w-5" />
                  Theological Topics
                </CardTitle>
                
                {/* Search and Filters */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {mainCategories.map(category => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent className="max-h-[600px] lg:max-h-[calc(100vh-300px)] overflow-auto">
                {/* Category Overview */}
                <Accordion type="multiple" value={expandedCategories} onValueChange={setExpandedCategories}>
                  {mainCategories.map(category => {
                    const CategoryIcon = category.icon;
                    const categoryTopics = filteredTopics.filter(t => t.category === category.name);
                    
                    return (
                      <AccordionItem key={category.name} value={category.name}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2">
                            <CategoryIcon className={`h-5 w-5 ${category.color}`} />
                            <span className="text-sm sm:text-base">{category.name}</span>
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {categoryTopics.length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 mt-2">
                            {renderTopicTree(categoryTopics)}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {selectedTopic ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Topic Header */}
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                          <Target className="h-5 w-5 text-orange-600 flex-shrink-0" />
                          <span className="truncate">{selectedTopic.name}</span>
                        </CardTitle>
                        {selectedTopic.description && (
                          <p className="text-muted-foreground mt-1 text-sm sm:text-base">{selectedTopic.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">{selectedTopic.category}</Badge>
                        <Badge variant="secondary" className="text-xs">{filteredVerses.length} verses</Badge>
                        {user && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleBookmark(selectedTopic.id)}
                            className="flex-shrink-0"
                          >
                            {bookmarkedTopics.includes(selectedTopic.id) ? 
                              <BookmarkCheck className="h-4 w-4 mr-1 text-orange-600" /> :
                              <Bookmark className="h-4 w-4 mr-1" />
                            }
                            <span className="hidden sm:inline">
                              {bookmarkedTopics.includes(selectedTopic.id) ? 'Bookmarked' : 'Bookmark'}
                            </span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Content Tabs */}
                <Card>
                  <Tabs defaultValue="verses" className="w-full">
                    <div className="border-b px-4 sm:px-6 pt-4">
                      <TabsList className="grid w-full grid-cols-3 h-auto">
                        <TabsTrigger value="verses" className="text-xs sm:text-sm px-2 sm:px-4">
                          <span className="hidden sm:inline">Verses </span>({filteredVerses.length})
                        </TabsTrigger>
                        <TabsTrigger value="cross-refs" className="text-xs sm:text-sm px-2 sm:px-4">
                          <span className="hidden sm:inline">Cross References </span>({crossReferences.length})
                        </TabsTrigger>
                        <TabsTrigger value="study-tools" className="text-xs sm:text-sm px-2 sm:px-4">
                          Study Tools
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="verses" className="mt-0">
                      <div className="p-4 sm:p-6">
                        {/* Verse Filters */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                          <Select value={selectedTranslation} onValueChange={setSelectedTranslation}>
                            <SelectTrigger className="w-full sm:w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="esv">ESV</SelectItem>
                              <SelectItem value="niv">NIV</SelectItem>
                              <SelectItem value="kjv">KJV</SelectItem>
                              <SelectItem value="nasb">NASB</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select value={testamentFilter} onValueChange={setTestamentFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Testament</SelectItem>
                              <SelectItem value="Old">Old Testament</SelectItem>
                              <SelectItem value="New">New Testament</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <label className="text-sm whitespace-nowrap">Min Relevance:</label>
                            <Select value={relevanceFilter.toString()} onValueChange={(v) => setRelevanceFilter(parseInt(v))}>
                              <SelectTrigger className="w-full sm:w-16">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[0, 5, 6, 7, 8, 9].map(score => (
                                  <SelectItem key={score} value={score.toString()}>{score}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Verses List */}
                        <div className="max-h-[600px] lg:max-h-[calc(100vh-500px)] overflow-auto">
                          <div className="space-y-4">
                            {filteredVerses.length > 0 ? (
                              filteredVerses.map(renderVerseCard)
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No verses found matching your criteria.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="cross-refs" className="mt-0">
                      <div className="p-4 sm:p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Network className="h-5 w-5" />
                          Related Topics
                        </h3>
                        
                        <div className="space-y-3 max-h-[600px] lg:max-h-[calc(100vh-500px)] overflow-auto">
                          {crossReferences.length > 0 ? (
                            crossReferences.map(crossRef => (
                              <Card 
                                key={crossRef.id} 
                                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleTopicSelect(crossRef.related_topic)}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium truncate">{crossRef.related_topic.name}</h4>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {crossRef.related_topic.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <Badge variant="outline" className="capitalize text-xs">
                                      {crossRef.relationship_type}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {crossRef.strength}/10
                                    </Badge>
                                    <ArrowRight className="h-4 w-4" />
                                  </div>
                                </div>
                              </Card>
                            ))
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <Network className="h-12 w-12 mx-auto mb-3 opacity-50" />
                              <p>No cross-references found for this topic.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="study-tools" className="flex-1 overflow-auto">
                      <div className="p-6 space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Study Resources</h3>
                          <div className="grid gap-3">
                            <Button variant="outline" className="justify-start">
                              <Download className="h-4 w-4 mr-2" />
                              Download Study Guide
                            </Button>
                            <Button variant="outline" className="justify-start">
                              <Share2 className="h-4 w-4 mr-2" />
                              Share Topic Collection
                            </Button>
                            <Button variant="outline" className="justify-start">
                              <Plus className="h-4 w-4 mr-2" />
                              Add to Custom Collection
                            </Button>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
                          <div className="grid gap-3">
                            <Button variant="outline" className="justify-start">
                              <BookOpen className="h-4 w-4 mr-2" />
                              View Related Sermons
                            </Button>
                            <Button variant="outline" className="justify-start">
                              <Heart className="h-4 w-4 mr-2" />
                              Find Parables on This Topic
                            </Button>
                            <Button variant="outline" className="justify-start">
                              <Users className="h-4 w-4 mr-2" />
                              Join Study Group
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Library className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a Topic to Begin</h3>
                  <p className="text-muted-foreground">
                    Choose from 500+ theological topics to explore organized Bible verses
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Verse Details Dialog */}
      <Dialog open={showVerseDetails} onOpenChange={setShowVerseDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Verse Details</DialogTitle>
          </DialogHeader>
          {selectedVerse && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">
                  {selectedVerse.verse.book.name} {selectedVerse.verse.chapter}:{selectedVerse.verse.verse}
                </h3>
                <blockquote className="text-lg font-serif italic border-l-4 border-orange-300 pl-4">
                  "{selectedVerse.verse[`text_${selectedTranslation}` as keyof typeof selectedVerse.verse]}"
                </blockquote>
              </div>
              
              {selectedVerse.context_notes && (
                <div>
                  <h4 className="font-medium mb-2">Context Notes</h4>
                  <p className="text-muted-foreground">{selectedVerse.context_notes}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Relevance Score</h4>
                  <Badge variant="secondary">{selectedVerse.relevance_score}/10</Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Testament</h4>
                  <Badge variant="outline">{selectedVerse.verse.book.testament}</Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TopicalBibleStudy; 