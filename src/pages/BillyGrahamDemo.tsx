import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { UnifiedHeader } from '@/components/UnifiedHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Search, 
  Calendar,
  Heart,
  RefreshCw,
  Quote,
  Sparkles,
  User
} from 'lucide-react';
import { billyGrahamDevotional, ProcessedDevotion } from '@/lib/billy-graham-devotional';
import { BillyGrahamDiagnostic } from '@/components/BillyGrahamDiagnostic';

const BillyGrahamDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [allDevotions, setAllDevotions] = useState<ProcessedDevotion[]>([]);
  const [todaysVerse, setTodaysVerse] = useState<ProcessedDevotion | null>(null);
  const [searchResults, setSearchResults] = useState<ProcessedDevotion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedDevotion, setSelectedDevotion] = useState<ProcessedDevotion | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDevotionalData();
  }, []);

  const loadDevotionalData = async () => {
    setLoading(true);
    try {
      // Load today's verse
      const todayVerse = await billyGrahamDevotional.getTodaysVerse();
      setTodaysVerse(todayVerse);

      // Load all devotions
      const allDevs = await billyGrahamDevotional.getAllDevotions();
      setAllDevotions(allDevs);

      if (allDevs.length > 0) {
        setSelectedDevotion(allDevs[0]);
      }

      toast({
        title: "Billy Graham Devotionals Loaded",
        description: `Successfully loaded ${allDevs.length} daily devotions`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load Billy Graham devotional data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await billyGrahamDevotional.searchDevotions(searchTerm);
      setSearchResults(results);
      
      toast({
        title: "Search Complete",
        description: `Found ${results.length} devotions matching "${searchTerm}"`,
      });
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search devotions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    const devotion = allDevotions.find(d => d.day === day);
    setSelectedDevotion(devotion || null);
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await billyGrahamDevotional.refreshData();
      await loadDevotionalData();
      
      toast({
        title: "Data Refreshed",
        description: "Billy Graham devotional data has been reloaded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const DevotionCard = ({ devotion }: { devotion: ProcessedDevotion }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
          onClick={() => setSelectedDevotion(devotion)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            {devotion.title}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {devotion.theme}
          </Badge>
        </div>
        <CardDescription className="font-medium text-orange-600">
          {devotion.verse_reference}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <blockquote className="text-sm italic text-gray-600 border-l-4 border-orange-200 pl-4 mb-3">
          "{devotion.verse_text.substring(0, 100)}..."
        </blockquote>
        <p className="text-sm text-gray-700 line-clamp-3">
          {devotion.devotional_content.substring(0, 150)}...
        </p>
      </CardContent>
    </Card>
  );

  return (
    <PageLayout>
      <UnifiedHeader 
        icon={BookOpen}
        title="Billy Graham Devotionals"
        subtitle="30-Day 'Living in Christ' Daily Devotional Collection"
      />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold text-lg">{allDevotions.length}</h3>
              <p className="text-sm text-muted-foreground">Daily Devotions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <User className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold text-lg">Billy Graham</h3>
              <p className="text-sm text-muted-foreground">Evangelist Author</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-semibold text-lg">
                Day {todaysVerse?.day || new Date().getDate()}
              </h3>
              <p className="text-sm text-muted-foreground">Today's Reading</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <RefreshCw 
                className={`h-8 w-8 mx-auto mb-2 text-orange-500 cursor-pointer hover:text-orange-600 ${loading ? 'animate-spin' : ''}`}
                onClick={refreshData}
              />
              <h3 className="font-semibold text-lg">Live Data</h3>
              <p className="text-sm text-muted-foreground">From Storage</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="today">Today's Verse</TabsTrigger>
            <TabsTrigger value="all">All 30 Days</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="viewer">Devotion Viewer</TabsTrigger>
            <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
          </TabsList>

          {/* Today's Verse Tab */}
          <TabsContent value="today" className="space-y-6">
            {todaysVerse ? (
              <Card className="bg-gradient-to-br from-blue-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-amber-500" />
                    Today's Billy Graham Devotion
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{todaysVerse.theme}</Badge>
                    <Badge variant="secondary">Day {todaysVerse.day}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-white rounded-lg p-6 border-l-4 border-orange-400">
                    <h3 className="font-semibold text-orange-600 mb-2">
                      {todaysVerse.verse_reference}
                    </h3>
                    <blockquote className="text-lg italic text-gray-800 leading-relaxed">
                      "{todaysVerse.verse_text}"
                    </blockquote>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Quote className="h-5 w-5 text-blue-500" />
                      Billy Graham's Teaching
                    </h4>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {todaysVerse.devotional_content}
                    </p>
                    <div className="border-t pt-4">
                      <h5 className="font-medium text-gray-700 mb-2">Reflection:</h5>
                      <p className="text-gray-600 italic">
                        {todaysVerse.reflection}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    {loading ? 'Loading today\'s devotion...' : 'No devotion available for today'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* All 30 Days Tab */}
          <TabsContent value="all" className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allDevotions.map((devotion) => (
                <DevotionCard key={devotion.day} devotion={devotion} />
              ))}
            </div>
            {allDevotions.length === 0 && !loading && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No devotions loaded. Try refreshing the data.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Billy Graham Devotionals
                </CardTitle>
                <CardDescription>
                  Search through verses, teachings, reflections, and themes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search devotions... (e.g., 'faith', 'John 3:16', 'love')"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={loading}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {searchResults.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((devotion) => (
                  <DevotionCard key={`search-${devotion.day}`} devotion={devotion} />
                ))}
              </div>
            )}

            {searchTerm && searchResults.length === 0 && !loading && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No devotions found for "{searchTerm}". Try different keywords.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Devotion Viewer Tab */}
          <TabsContent value="viewer" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              {/* Day Selector */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Select Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                      <Button
                        key={day}
                        variant={selectedDay === day ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => handleDaySelect(day)}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Devotion Display */}
              <div className="md:col-span-3">
                {selectedDevotion ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {selectedDevotion.title}
                        <Badge variant="outline">{selectedDevotion.theme}</Badge>
                      </CardTitle>
                      <CardDescription className="font-medium text-orange-600">
                        {selectedDevotion.verse_reference}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <blockquote className="text-lg italic text-gray-800 leading-relaxed">
                          "{selectedDevotion.verse_text}"
                        </blockquote>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Billy Graham's Teaching:</h4>
                        <p className="text-gray-700 leading-relaxed">
                          {selectedDevotion.devotional_content}
                        </p>
                      </div>
                      
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Reflection:</h4>
                        <p className="text-gray-600 italic">
                          {selectedDevotion.reflection}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">
                        Select a day to view the devotion
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Diagnostic Tab */}
          <TabsContent value="diagnostic" className="space-y-6">
            <BillyGrahamDiagnostic />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default BillyGrahamDemo; 