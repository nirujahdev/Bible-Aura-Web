import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useSEO } from '@/hooks/useSEO';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EnhancedSermonGenerator from '@/components/EnhancedSermonGenerator';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Sparkles, BookOpen, Users, TrendingUp, Clock, 
  FileText, Star, Target, Brain, Wand2, 
  ChevronRight, PlusCircle, BarChart3, Calendar,
  MessageSquare, Heart, Award, Globe
} from 'lucide-react';

const SEO_CONFIG = {
  title: "Enhanced Sermon Hub - AI-Powered Sermon Creation | Bible Aura",
  description: "Create comprehensive, theologically sound sermons with our advanced AI-powered sermon generator. Supports multiple languages, denominations, and audience types.",
  keywords: ["AI sermon generator", "sermon writing", "biblical preaching", "theological sermons", "pastoral tools", "sermon creation", "bible study"],
  ogImage: "/✦Bible Aura.svg"
};

interface SermonStats {
  totalSermons: number;
  aiGenerated: number;
  thisWeek: number;
  avgRating: number;
  topicDistribution: { [key: string]: number };
  languageDistribution: { [key: string]: number };
}

interface QuickStartTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  topic?: string;
  scripture?: string;
  sermonType: string;
  audience: string;
  length: string;
  tags: string[];
}

const EnhancedSermonHub: React.FC = () => {
  useSEO(SEO_CONFIG);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'generator' | 'templates' | 'analytics' | 'library'>('generator');
  const [stats, setStats] = useState<SermonStats>({
    totalSermons: 0,
    aiGenerated: 0,
    thisWeek: 0,
    avgRating: 0,
    topicDistribution: {},
    languageDistribution: {}
  });
  const [loading, setLoading] = useState(false);
  const [recentSermons, setRecentSermons] = useState<any[]>([]);

  // Quick Start Templates
  const quickStartTemplates: QuickStartTemplate[] = [
    {
      id: 'sunday-expository',
      title: 'Sunday Expository Sermon',
      description: 'Verse-by-verse exposition for Sunday morning service',
      icon: BookOpen,
      sermonType: 'expository',
      audience: 'general',
      length: 'medium',
      tags: ['sunday', 'expository', 'general']
    },
    {
      id: 'youth-topical',
      title: 'Youth Topical Message',
      description: 'Engaging topical sermon for youth ministry',
      icon: Users,
      topic: 'Identity in Christ',
      sermonType: 'topical',
      audience: 'youth',
      length: 'medium',
      tags: ['youth', 'topical', 'identity']
    },
    {
      id: 'evangelistic-message',
      title: 'Evangelistic Sermon',
      description: 'Gospel-centered message for outreach events',
      icon: Heart,
      topic: 'God\'s Love and Salvation',
      scripture: 'John 3:16',
      sermonType: 'evangelistic',
      audience: 'non-believers',
      length: 'medium',
      tags: ['evangelism', 'gospel', 'salvation']
    },
    {
      id: 'family-devotional',
      title: 'Family Devotional',
      description: 'Short message for family worship time',
      icon: Target,
      sermonType: 'devotional',
      audience: 'families',
      length: 'short',
      tags: ['family', 'devotional', 'short']
    },
    {
      id: 'special-occasion',
      title: 'Special Occasion Sermon',
      description: 'Holiday or special event message',
      icon: Star,
      sermonType: 'topical',
      audience: 'general',
      length: 'medium',
      tags: ['holiday', 'special', 'celebration']
    },
    {
      id: 'deeper-study',
      title: 'In-Depth Bible Study',
      description: 'Comprehensive theological exposition',
      icon: Brain,
      sermonType: 'expository',
      audience: 'mature-believers',
      length: 'long',
      tags: ['study', 'theology', 'mature']
    }
  ];

  useEffect(() => {
    if (user) {
      loadSermonStats();
      loadRecentSermons();
    }
  }, [user]);

  const loadSermonStats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: sermons, error } = await supabase
        .from('sermons')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const totalSermons = sermons?.length || 0;
      const aiGenerated = sermons?.filter(s => s.ai_generated).length || 0;
      const thisWeek = sermons?.filter(s => new Date(s.created_at) > weekAgo).length || 0;

      // Calculate topic distribution
      const topicDistribution: { [key: string]: number } = {};
      const languageDistribution: { [key: string]: number } = {};

      sermons?.forEach(sermon => {
        if (sermon.category) {
          topicDistribution[sermon.category] = (topicDistribution[sermon.category] || 0) + 1;
        }
        if (sermon.language) {
          languageDistribution[sermon.language] = (languageDistribution[sermon.language] || 0) + 1;
        }
      });

      setStats({
        totalSermons,
        aiGenerated,
        thisWeek,
        avgRating: 4.2, // Placeholder for rating system
        topicDistribution,
        languageDistribution
      });

    } catch (error) {
      console.error('Error loading sermon stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentSermons = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('sermons')
        .select('id, title, created_at, category, language, status, ai_generated')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentSermons(data || []);
    } catch (error) {
      console.error('Error loading recent sermons:', error);
    }
  };

  const handleTemplateSelect = (template: QuickStartTemplate) => {
    setActiveTab('generator');
    // The template data would be passed to the generator
    toast({
      title: "Template Selected",
      description: `Starting with ${template.title} template`,
    });
  };

  const handleSermonGenerated = (sermon: any) => {
    loadSermonStats();
    loadRecentSermons();
    toast({
      title: "✦ Sermon Generated!",
      description: "Your sermon has been created and saved",
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-500 rounded-xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Enhanced Sermon Hub</h1>
                <p className="text-gray-600">AI-powered comprehensive sermon creation</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{stats.totalSermons}</p>
                      <p className="text-sm text-gray-600">Total Sermons</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{stats.aiGenerated}</p>
                      <p className="text-sm text-gray-600">AI Generated</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{stats.thisWeek}</p>
                      <p className="text-sm text-gray-600">This Week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{stats.avgRating.toFixed(1)}</p>
                      <p className="text-sm text-gray-600">Avg Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
              <TabsTrigger value="generator" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generator
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Library
              </TabsTrigger>
            </TabsList>

            {/* Enhanced Sermon Generator */}
            <TabsContent value="generator" className="space-y-6">
              <Card className="border-orange-200">
                <CardContent className="p-0">
                  <EnhancedSermonGenerator 
                    onSermonGenerated={handleSermonGenerated}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quick Start Templates */}
            <TabsContent value="templates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-500" />
                    Quick Start Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickStartTemplates.map(template => {
                      const Icon = template.icon;
                      return (
                        <Card 
                          key={template.id} 
                          className="border-2 border-gray-200 hover:border-orange-300 transition-colors cursor-pointer"
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <Icon className="h-5 w-5 text-orange-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 mb-1">{template.title}</h3>
                                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                                <div className="flex flex-wrap gap-1">
                                  {template.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Custom Template Creator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlusCircle className="h-5 w-5 text-orange-500" />
                    Create Custom Template
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wand2 className="h-8 w-8 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Custom Sermon Templates</h3>
                      <p className="text-gray-600 mb-4">Create and save your own sermon templates for future use</p>
                    </div>
                    <Button className="bg-orange-500 hover:bg-orange-600">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Dashboard */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-orange-500" />
                      Sermon Type Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(stats.topicDistribution).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="capitalize text-gray-700">{type}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-orange-500 rounded-full"
                                style={{ width: `${(count / stats.totalSermons) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-600">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-orange-500" />
                      Language Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(stats.languageDistribution).map(([language, count]) => (
                        <div key={language} className="flex items-center justify-between">
                          <span className="capitalize text-gray-700">{language}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-orange-500 rounded-full"
                                style={{ width: `${(count / stats.totalSermons) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-600">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">95%</div>
                      <div className="text-sm text-gray-600">AI Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">8.2</div>
                      <div className="text-sm text-gray-600">Avg Generation Time (s)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">2,847</div>
                      <div className="text-sm text-gray-600">Avg Word Count</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">92%</div>
                      <div className="text-sm text-gray-600">User Satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sermon Library */}
            <TabsContent value="library" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-orange-500" />
                    Recent Sermons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentSermons.length > 0 ? (
                    <div className="space-y-3">
                      {recentSermons.map(sermon => (
                        <div key={sermon.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            <div>
                              <h4 className="font-medium text-gray-800">{sermon.title || 'Untitled Sermon'}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>{new Date(sermon.created_at).toLocaleDateString()}</span>
                                <Badge variant="outline" className="text-xs">
                                  {sermon.category || 'general'}
                                </Badge>
                                {sermon.ai_generated && (
                                  <Badge variant="outline" className="text-xs text-orange-600">
                                    AI Generated
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-800 mb-2">No sermons yet</h3>
                      <p className="text-gray-600 mb-4">Start creating your first sermon with our AI generator</p>
                      <Button 
                        onClick={() => setActiveTab('generator')}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Create First Sermon
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default EnhancedSermonHub; 