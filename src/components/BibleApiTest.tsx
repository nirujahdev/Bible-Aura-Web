import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Search, 
  RefreshCw, 
  Globe, 
  Eye,
  Download,
  Library,
  Languages,
  Shuffle
} from 'lucide-react';
import { bibleApi, BibleVerse, BibleBook, BibleSummary, BIBLE_TRANSLATIONS } from '@/lib/bible-api';

export function BibleApiTest() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedBible, setSelectedBible] = useState('de4e12af7f28f599-02'); // KJV default
  const [availableBibles, setAvailableBibles] = useState<BibleSummary[]>([]);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [randomVerse, setRandomVerse] = useState<BibleVerse | null>(null);

  // Load available Bibles on component mount
  useEffect(() => {
    loadAvailableBibles();
  }, []);

  // Load books when Bible selection changes
  useEffect(() => {
    if (selectedBible) {
      loadBooks();
    }
  }, [selectedBible]);

  const loadAvailableBibles = async () => {
    setLoading(true);
    try {
      const bibles = await bibleApi.getBibles();
      setAvailableBibles(bibles);
      toast({
        title: "Bibles Loaded",
        description: `Found ${bibles.length} available Bible translations`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load available Bibles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    if (!selectedBible) return;
    
    setLoading(true);
    try {
      const booksData = await bibleApi.getBooks(selectedBible);
      setBooks(booksData);
      if (booksData.length > 0) {
        setSelectedBook(booksData[0].id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load books",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadChapterVerses = async (bookId: string, chapterNumber: number = 1) => {
    if (!selectedBible || !bookId) return;
    
    setLoading(true);
    try {
      const chapters = await bibleApi.getChapters(selectedBible, bookId);
      if (chapters.length > 0) {
        const targetChapter = chapters.find(ch => ch.number === chapterNumber.toString()) || chapters[0];
        const versesData = await bibleApi.getVerses(selectedBible, targetChapter.id);
        setVerses(versesData);
        toast({
          title: "Chapter Loaded",
          description: `Loaded ${versesData.length} verses from ${bookId} Chapter ${targetChapter.number}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chapter verses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchVerses = async () => {
    if (!searchQuery.trim() || !selectedBible) return;
    
    setLoading(true);
    try {
      const results = await bibleApi.searchVerses(selectedBible, searchQuery, 20);
      const formattedResults: BibleVerse[] = results.verses.map(verse => ({
        id: verse.id,
        orgId: verse.orgId,
        book: verse.bookId,
        bookId: verse.bookId,
        chapter: parseInt(verse.chapterId.split('.')[1]) || 1,
        verse: parseInt(verse.id.split('.')[2]) || 1,
        text: verse.text,
        reference: verse.reference,
        bibleId: selectedBible
      }));
      setSearchResults(formattedResults);
      toast({
        title: "Search Complete",
        description: `Found ${results.verseCount} verses matching "${searchQuery}"`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search verses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRandomVerse = async () => {
    setLoading(true);
    try {
      const verse = await bibleApi.getRandomVerse(selectedBible);
      setRandomVerse(verse);
      if (verse) {
        toast({
          title: "Random Verse",
          description: `Got verse from ${verse.reference}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get random verse",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedTranslation = BIBLE_TRANSLATIONS.find(t => t.id === selectedBible);
  const languages = bibleApi.getAvailableLanguages();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            Bible API Test - Multi-Language Support
            <Badge variant="outline" className="ml-auto">
              API.Bible Integration
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <div className="flex gap-2">
                {languages.map(lang => (
                  <Badge 
                    key={lang.code} 
                    variant={selectedTranslation?.languageCode === lang.code ? "default" : "outline"}
                    className="cursor-pointer"
                  >
                    {lang.nativeName} ({lang.translations.length})
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bible-select">Bible Translation</Label>
              <Select value={selectedBible} onValueChange={setSelectedBible}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a Bible translation" />
                </SelectTrigger>
                <SelectContent>
                  {BIBLE_TRANSLATIONS.map(translation => (
                    <SelectItem key={translation.id} value={translation.id}>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {translation.abbreviation} - {translation.name}
                        <Badge variant="outline" className="text-xs">
                          {translation.language}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex gap-2">
                <Button onClick={loadAvailableBibles} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
                <Button onClick={getRandomVerse} variant="outline" size="sm">
                  <Shuffle className="h-4 w-4 mr-1" />
                  Random
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse Books</TabsTrigger>
          <TabsTrigger value="search">Search Verses</TabsTrigger>
          <TabsTrigger value="random">Random Verse</TabsTrigger>
          <TabsTrigger value="info">API Info</TabsTrigger>
        </TabsList>

        {/* Browse Books Tab */}
        <TabsContent value="browse" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Books List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Library className="h-5 w-5" />
                  Books ({books.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {books.map(book => (
                      <Button
                        key={book.id}
                        variant={selectedBook === book.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => {
                          setSelectedBook(book.id);
                          loadChapterVerses(book.id, 1);
                        }}
                      >
                        {book.name}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chapter Verses */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Chapter Verses ({verses.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {verses.map((verse, index) => (
                      <div key={verse.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-1">
                            {verse.verse}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-gray-800 leading-relaxed">{verse.text}</p>
                            <p className="text-sm text-gray-500 mt-2">{verse.reference}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Verses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search for verses (e.g., 'love', 'faith', 'hope')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchVerses()}
                />
                <Button onClick={searchVerses} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
              
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {searchResults.map((verse, index) => (
                    <div key={`${verse.id}-${index}`} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                      <p className="text-gray-800 leading-relaxed mb-2">{verse.text}</p>
                      <p className="text-blue-600 font-medium">{verse.reference}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Random Verse Tab */}
        <TabsContent value="random" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shuffle className="h-5 w-5" />
                Random Verse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={getRandomVerse} disabled={loading} size="lg">
                <Shuffle className="h-5 w-5 mr-2" />
                Get Random Verse
              </Button>
              
              {randomVerse && (
                <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                  <blockquote className="text-lg text-gray-800 leading-relaxed mb-4">
                    "{randomVerse.text}"
                  </blockquote>
                  <cite className="text-orange-600 font-semibold">
                    — {randomVerse.reference}
                  </cite>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Supported Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {languages.map(lang => (
                    <div key={lang.code} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">{lang.name}</h3>
                        <Badge>{lang.nativeName}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Available translations: {lang.translations.length}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {lang.translations.map(trans => (
                          <Badge key={trans.id} variant="outline" className="text-xs">
                            {trans.abbreviation}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  API Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Cache Stats</h3>
                    <div className="text-sm text-blue-600">
                      <p>Cached items: {bibleApi.getCacheStats().size}</p>
                      <p>Available Bibles: {availableBibles.length}</p>
                      <p>Books loaded: {books.length}</p>
                      <p>Verses displayed: {verses.length}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Current Selection</h3>
                    <div className="text-sm text-green-600">
                      <p>Bible: {selectedTranslation?.name}</p>
                      <p>Language: {selectedTranslation?.language}</p>
                      <p>Script: {selectedTranslation?.script}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Loading...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
} 