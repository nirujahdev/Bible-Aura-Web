import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
import { ModernLayout } from '@/components/ModernLayout';
import TopicalBibleStudy from '@/components/TopicalBibleStudy';
import ParablesStudyComponent from '@/components/ParablesStudyComponent';
import { 
  Search, BookOpen, Users, Crown, TreePine, FileText, 
  Settings, Languages, Grid, Table, Clock, Bot, Bookmark,
  Heart, Star, Share, Download, Copy, ExternalLink,
  ChevronRight, ChevronLeft, Plus, Filter, Eye,
  Mic, Calendar, Target, Lightbulb, Compass, Home,
  Globe, Shield, Zap, Building, Library, PenTool,
  MessageCircle, Volume2, Play, Pause, RotateCcw, Sparkles
} from 'lucide-react';

const StudyHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // SEO optimization
  useSEO(SEO_CONFIG.STUDY_HUB);

  const [activeTab, setActiveTab] = useState('overview');

  const studyModules = [
    {
      id: 'topical',
      name: 'Topical Study',
      icon: Library,
      description: 'Explore themes and topics across Scripture with comprehensive verse collections',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'parables',
      name: 'Parables Study',
      icon: TreePine,
      description: 'Study Jesus\' parables with modern applications and deep insights',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'characters',
      name: 'Bible Characters',
      icon: Users,
      description: 'Explore biblical figures and their stories (Coming Soon)',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'verse-explorer',
      name: 'Verse Explorer',
      icon: Search,
      description: 'Deep dive into individual verses with context and insights (Coming Soon)',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  return (
    <ModernLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Library className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Study Hub</h1>
                  <p className="text-indigo-100">Comprehensive Bible Study Tools</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="topical" className="flex items-center gap-2">
                <Library className="h-4 w-4" />
                Topical Study
              </TabsTrigger>
              <TabsTrigger value="parables" className="flex items-center gap-2">
                <TreePine className="h-4 w-4" />
                Parables
              </TabsTrigger>
              <TabsTrigger value="more" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                More Tools
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Your Personal Bible Study Center
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Access comprehensive study tools to deepen your understanding of Scripture with 
                    topical studies, parable analysis, and much more.
                  </p>
                </div>

                {/* Study Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {studyModules.map((module) => (
                    <Card 
                      key={module.id} 
                      className={`${module.borderColor} ${module.bgColor} border-2 cursor-pointer hover:shadow-lg transition-all duration-300`}
                      onClick={() => setActiveTab(module.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <module.icon className={`h-6 w-6 ${module.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {module.name}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                              {module.description}
                            </p>
                            <Button 
                              size="sm" 
                              className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                              onClick={() => setActiveTab(module.id)}
                            >
                              <ChevronRight className="h-4 w-4 mr-2" />
                              Explore
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <Card className="bg-white">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-indigo-600">500+</div>
                      <div className="text-sm text-gray-600">Study Topics</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">40+</div>
                      <div className="text-sm text-gray-600">Parables</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">100+</div>
                      <div className="text-sm text-gray-600">Bible Characters</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">31K+</div>
                      <div className="text-sm text-gray-600">Bible Verses</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Topical Study Tab */}
            <TabsContent value="topical" className="mt-0">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-purple-50">
                  <div className="flex items-center gap-3">
                    <Library className="h-6 w-6 text-purple-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Topical Bible Study</h3>
                      <p className="text-sm text-gray-600">Explore biblical themes with comprehensive verse collections</p>
                    </div>
                  </div>
                </div>
                <div className="h-[calc(100vh-300px)]">
                  <TopicalBibleStudy />
                </div>
              </div>
            </TabsContent>

            {/* Parables Tab */}
            <TabsContent value="parables" className="mt-0">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-orange-50">
                  <div className="flex items-center gap-3">
                    <TreePine className="h-6 w-6 text-orange-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Parables Study</h3>
                      <p className="text-sm text-gray-600">Study Jesus' parables with modern applications and insights</p>
                    </div>
                  </div>
                </div>
                <div className="h-[calc(100vh-300px)]">
                  <ParablesStudyComponent />
                </div>
              </div>
            </TabsContent>

            {/* Characters Tab (Placeholder) */}
            <TabsContent value="characters" className="mt-0">
              <div className="text-center py-20">
                <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Bible Characters Study</h3>
                <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                  Explore the lives and stories of biblical figures. This feature is coming soon!
                </p>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <Clock className="h-4 w-4 mr-2" />
                  Coming Soon
                </Button>
              </div>
            </TabsContent>

            {/* More Tools Tab */}
            <TabsContent value="more" className="mt-0">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    More Study Tools Coming Soon
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    We're continuously expanding our study tools to help you dive deeper into God's Word.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { icon: Search, title: "Verse Explorer", description: "Deep dive analysis tool" },
                    { icon: MessageCircle, title: "Study Groups", description: "Collaborative Bible study" },
                    { icon: Calendar, title: "Reading Plans", description: "Structured Bible reading" },
                    { icon: PenTool, title: "Study Notes", description: "Personal note-taking system" },
                    { icon: Target, title: "Memory Verses", description: "Scripture memorization" },
                    { icon: Share, title: "Study Sharing", description: "Share insights with others" }
                  ].map((tool, index) => (
                    <Card key={index} className="border-gray-200">
                      <CardContent className="p-6 text-center">
                        <tool.icon className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                        <h4 className="font-semibold text-gray-900 mb-2">{tool.title}</h4>
                        <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                        <Button variant="outline" size="sm" disabled>
                          <Clock className="h-4 w-4 mr-2" />
                          Coming Soon
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ModernLayout>
  );
};

export default StudyHub; 