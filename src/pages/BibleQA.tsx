import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';

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
    references: ['Proverbs 3:5-6', 'Romans 12:2', 'Psalm 25:9'],
    popularity: 88,
    is_favorite: true,
    created_at: '2024-01-10'
  },
  {
    id: '3',
    question: 'Why does God allow suffering?',
    answer: 'This is one of the most profound questions in theology. While we may not fully understand God\'s purposes, Scripture teaches that suffering can result from living in a fallen world, our own choices, or God\'s sovereign plan for growth and refinement. God uses suffering to develop character, deepen faith, and draw us closer to Him. The ultimate answer is found in Christ, who suffered for our redemption.',
    category: 'Theology',
    references: ['Romans 8:28', 'James 1:2-4', 'Job 1-2', 'Isaiah 53'],
    popularity: 92,
    is_favorite: false,
    created_at: '2024-01-08'
  },
  {
    id: '4',
    question: 'What is the Trinity?',
    answer: 'The Trinity is the Christian doctrine that God exists as three distinct persons - Father, Son, and Holy Spirit - while remaining one God in essence. Each person is fully God, yet they are not three gods but one. This mystery is revealed throughout Scripture and is fundamental to Christian faith, showing God\'s complex yet unified nature.',
    category: 'Theology',
    references: ['Matthew 28:19', '2 Corinthians 13:14', 'John 1:1', 'Genesis 1:26'],
    popularity: 85,
    is_favorite: false,
    created_at: '2024-01-05'
  },
  {
    id: '5',
    question: 'How should Christians handle money?',
    answer: 'The Bible provides extensive guidance on money management. Christians are called to be good stewards, giving generously, avoiding debt when possible, saving wisely, and not letting money become an idol. The principle of tithing (giving 10%) is often practiced, but the heart attitude of generosity and trust in God\'s provision is most important.',
    category: 'Stewardship',
    references: ['Malachi 3:10', 'Luke 12:15', '1 Timothy 6:10', 'Proverbs 22:7'],
    popularity: 78,
    is_favorite: true,
    created_at: '2024-01-03'
  }
];

const QA_CATEGORIES = ['All', 'Salvation', 'Christian Living', 'Theology', 'Stewardship', 'Prayer', 'Relationships'];

export default function BibleQA() {
  useSEO(SEO_CONFIG.BIBLE_QA);
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popularity');
  const [qaItems, setQaItems] = useState<QAItem[]>(MOCK_QA);

  const filteredQA = qaItems
    .filter(item => {
      const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'popularity') return b.popularity - a.popularity;
      if (sortBy === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return a.question.localeCompare(b.question);
    });

  const toggleFavorite = (itemId: string) => {
    if (!user) return;
    setQaItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, is_favorite: !item.is_favorite } : item
    ));
  };

  return (
    <PageLayout padding="none" maxWidth="full">
      <>
      <div className="h-full bg-gray-50">
      {/* Unique Q&A Banner - Green Knowledge Theme */}
      <div className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 text-white border-b sticky top-0 z-10 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-36 translate-x-36 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 -translate-x-48"></div>
          <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-ping delay-1000"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/30 rounded-full animate-ping delay-500"></div>
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            {/* Icon with glow effect */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-md"></div>
                <div className="relative p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                  <HelpCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center gap-3">
                  Bible Q&A
                  <Lightbulb className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-300 animate-pulse" />
                </h1>
                <p className="text-emerald-100 text-sm sm:text-base lg:text-lg mt-1 font-medium">
                  Find answers to common biblical questions
                </p>
              </div>
            </div>

            {/* Stats badges */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:ml-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageCircle className="h-4 w-4" />
                  <span>{filteredQA.length} Questions</span>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <BookOpen className="h-4 w-4" />
                  <span>Expert Answers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
              <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search and Filter */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions and answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {QA_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popularity">Most Popular</SelectItem>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="alphabetical">A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Q&A List */}
          {filteredQA.length > 0 ? (
            <div className="space-y-4">
              <Accordion type="single" collapsible className="space-y-4">
                {filteredQA.map((item) => (
                  <Card key={item.id}>
                    <AccordionItem value={item.id} className="border-none">
                      <CardHeader className="pb-2">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-start justify-between w-full mr-4">
                            <div className="flex items-start gap-3 text-left">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <HelpCircle className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-base leading-tight">
                                  {item.question}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary">{item.category}</Badge>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Star className="h-3 w-3" />
                                    <span>{item.popularity}% helpful</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                      </CardHeader>
                      <AccordionContent>
                        <CardContent className="pt-0">
                          <div className="ml-11 space-y-4">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                              <p className="text-sm leading-relaxed">{item.answer}</p>
                            </div>
                            
                            {item.references.length > 0 && (
                              <div className="border-t pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <BookOpen className="h-4 w-4 text-primary" />
                                  <span className="text-sm font-medium">Scripture References:</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {item.references.map((ref, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {ref}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between border-t pt-4">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>Added {new Date(item.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => toggleFavorite(item.id)}
                                  className={item.is_favorite ? 'text-red-500' : 'text-gray-400'}
                                  disabled={!user}
                                >
                                  <Heart className={`h-4 w-4 ${item.is_favorite ? 'fill-current' : ''}`} />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Share className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </AccordionContent>
                    </AccordionItem>
                  </Card>
                ))}
              </Accordion>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Questions Found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or category filter
                </p>
                <Button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {!user && (
            <Card className="mt-6 border-primary/20">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Join the Community</h3>
                <p className="text-muted-foreground mb-4">
                  Sign in to save favorite Q&As, ask questions, and get personalized recommendations
                </p>
                <Button asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
      </>
    </PageLayout>
  );
} 