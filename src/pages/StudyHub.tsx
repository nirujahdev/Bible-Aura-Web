import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  MessageCircle, 
  Search, 
  BookOpen, 
  Heart, 
  Share, 
  Star,
  HelpCircle,
  Lightbulb,
  Users,
  Calendar,
  Mic,
  TreePine,
  Target,
  Filter,
  Play,
  Pause,
  Download,
  Bookmark
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Import existing components
import SermonArchive from '@/components/SermonArchive';
import ParablesDatabase from '@/components/ParablesDatabase';
import TopicalBibleStudy from '@/components/TopicalBibleStudy';

interface QAItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  references: string[];
  popularity: number;
  is_favorite: boolean;
  created_at: string;
}

const MOCK_QA: QAItem[] = [
  {
    id: '1',
    question: 'What does it mean to be born again?',
    answer: 'Being "born again" refers to the spiritual transformation that occurs when someone accepts Jesus Christ as their Lord and Savior. Jesus explained this concept to Nicodemus in John 3:3, saying that unless one is born again, they cannot see the kingdom of God. This spiritual rebirth involves repentance from sin, faith in Christ, and receiving the Holy Spirit, which creates a new spiritual life within the believer.',
    category: 'Salvation',
    references: ['John 3:3-7', '2 Corinthians 5:17', 'Titus 3:5'],
    popularity: 95,
    is_favorite: false,
    created_at: '2024-01-15'
  },
  {
    id: '2',
    question: 'How can I know God\'s will for my life?',
    answer: 'Discovering God\'s will involves prayer, studying Scripture, seeking wise counsel, and being attentive to the Holy Spirit\'s guidance. God promises to direct our paths when we trust in Him. Regular Bible study, prayer, and communion with fellow believers help us understand God\'s character and desires for our lives.',
    category: 'Christian Living',
    references: ['Proverbs 3:5-6', 'James 1:5', 'Romans 12:2'],
    popularity: 88,
    is_favorite: true,
    created_at: '2024-01-10'
  },
  {
    id: '3',
    question: 'What is the difference between grace and mercy?',
    answer: 'Grace is receiving what we don\'t deserve (God\'s favor and salvation), while mercy is not receiving what we do deserve (punishment for our sins). Grace gives us salvation and eternal life, while mercy spares us from the wrath and judgment we deserve because of our sin.',
    category: 'Theology',
    references: ['Ephesians 2:8-9', 'Lamentations 3:22-23', 'Titus 3:5'],
    popularity: 82,
    is_favorite: false,
    created_at: '2024-01-08'
  },
  {
    id: '4',
    question: 'How should Christians handle depression and anxiety?',
    answer: 'Christians dealing with depression and anxiety should seek both spiritual support and professional help when needed. God cares about our mental health. Prayer, Scripture reading, fellowship with believers, and professional counseling can all be part of God\'s healing process. Remember that seeking help is a sign of wisdom, not weakness.',
    category: 'Christian Living',
    references: ['Philippians 4:6-7', 'Psalm 34:18', '1 Peter 5:7'],
    popularity: 91,
    is_favorite: true,
    created_at: '2024-01-05'
  },
  {
    id: '5',
    question: 'What happens when we die?',
    answer: 'According to Scripture, when believers die, their souls immediately go to be with Christ in heaven while their bodies await resurrection. For unbelievers, their souls go to a place of separation from God. At the final judgment, all will be resurrected - believers to eternal life and unbelievers to eternal separation from God.',
    category: 'Eschatology',
    references: ['2 Corinthians 5:8', 'Luke 16:19-31', 'Revelation 20:11-15'],
    popularity: 89,
    is_favorite: false,
    created_at: '2024-01-03'
  }
];

const QA_CATEGORIES = [
  'All',
  'Salvation',
  'Christian Living',
  'Theology',
  'Prayer',
  'Bible Study',
  'Relationships',
  'Eschatology',
  'Church Life'
];

export default function StudyHub() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('qa');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [qaItems, setQaItems] = useState<QAItem[]>(MOCK_QA);

  const filteredQAItems = qaItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: string) => {
    setQaItems(prev => prev.map(item => 
      item.id === id ? { ...item, is_favorite: !item.is_favorite } : item
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📚 Study Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your comprehensive resource for Bible study, sermons, Q&A, and spiritual growth
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="qa" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Bible Q&A
            </TabsTrigger>
            <TabsTrigger value="sermons" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Sermons
            </TabsTrigger>
            <TabsTrigger value="parables" className="flex items-center gap-2">
              <TreePine className="h-4 w-4" />
              Parables
            </TabsTrigger>
            <TabsTrigger value="topical" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Topical Study
            </TabsTrigger>
          </TabsList>

          {/* Bible Q&A Tab */}
          <TabsContent value="qa" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Bible Questions & Answers
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {QA_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredQAItems.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      {filteredQAItems.map((item) => (
                        <AccordionItem key={item.id} value={item.id}>
                          <AccordionTrigger className="text-left">
                            <div className="flex items-start justify-between w-full pr-4">
                              <span className="font-medium">{item.question}</span>
                              <div className="flex items-center gap-2 ml-4">
                                <Badge variant="secondary" className="text-xs">
                                  {item.category}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(item.id);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Heart 
                                    className={`h-4 w-4 ${
                                      item.is_favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                                    }`} 
                                  />
                                </Button>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-4">
                              <p className="text-gray-700 leading-relaxed">
                                {item.answer}
                              </p>
                              
                              {item.references.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-sm text-gray-900 mb-2">
                                    Scripture References:
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {item.references.map((ref, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {ref}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between pt-4 border-t">
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Star className="h-4 w-4" />
                                    {item.popularity}% helpful
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(item.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                
                                <Button variant="ghost" size="sm">
                                  <Share className="h-4 w-4 mr-2" />
                                  Share
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="text-center py-12">
                      <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No questions found
                      </h3>
                      <p className="text-gray-600">
                        Try adjusting your search or category filter.
                      </p>
                    </div>
                  )}
                </div>

                {/* Popular Categories */}
                <div className="mt-8 pt-8 border-t">
                  <h3 className="font-medium text-gray-900 mb-4">Popular Categories</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {QA_CATEGORIES.slice(1).map(category => {
                      const count = qaItems.filter(item => item.category === category).length;
                      return (
                        <Button
                          key={category}
                          variant="outline"
                          onClick={() => setSelectedCategory(category)}
                          className="justify-between h-auto p-3"
                        >
                          <span className="text-sm">{category}</span>
                          <Badge variant="secondary" className="text-xs">
                            {count}
                          </Badge>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sermons Tab */}
          <TabsContent value="sermons">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Sermon Library
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SermonArchive />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parables Tab */}
          <TabsContent value="parables">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5" />
                  Parables Study
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ParablesDatabase />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Topical Study Tab */}
          <TabsContent value="topical">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Topical Bible Study
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TopicalBibleStudy />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Access Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('qa')}>
            <CardContent className="p-6 text-center">
              <HelpCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Quick Q&A</h3>
              <p className="text-sm text-gray-600">Get answers to common Bible questions</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('sermons')}>
            <CardContent className="p-6 text-center">
              <Mic className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Listen & Learn</h3>
              <p className="text-sm text-gray-600">Access thousands of inspiring sermons</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('parables')}>
            <CardContent className="p-6 text-center">
              <TreePine className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Story Wisdom</h3>
              <p className="text-sm text-gray-600">Explore Jesus' parables and their meanings</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('topical')}>
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Deep Dive</h3>
              <p className="text-sm text-gray-600">Study specific topics in depth</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 