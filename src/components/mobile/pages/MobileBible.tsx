import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Book, Search, MoreVertical, ArrowLeft, Settings, 
  Bookmark, Share, Type, Moon, Sun, ChevronLeft, 
  ChevronRight, ChevronDown, Star, Heart, Copy,
  Play, Pause, Volume2, RotateCcw, Filter, Grid3X3, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../../hooks/use-toast';

interface BibleBook {
  name: string;
  chapters: number;
  testament: 'Old' | 'New';
  category: string;
}

interface Verse {
  number: number;
  text: string;
  highlighted?: boolean;
  bookmarked?: boolean;
}

const bibleBooks: BibleBook[] = [
  // Old Testament
  { name: "Genesis", chapters: 50, testament: "Old", category: "Law" },
  { name: "Exodus", chapters: 40, testament: "Old", category: "Law" },
  { name: "Leviticus", chapters: 27, testament: "Old", category: "Law" },
  { name: "Numbers", chapters: 36, testament: "Old", category: "Law" },
  { name: "Deuteronomy", chapters: 34, testament: "Old", category: "Law" },
  { name: "Psalms", chapters: 150, testament: "Old", category: "Poetry" },
  { name: "Proverbs", chapters: 31, testament: "Old", category: "Poetry" },
  { name: "Isaiah", chapters: 66, testament: "Old", category: "Prophets" },
  
  // New Testament
  { name: "Matthew", chapters: 28, testament: "New", category: "Gospels" },
  { name: "Mark", chapters: 16, testament: "New", category: "Gospels" },
  { name: "Luke", chapters: 24, testament: "New", category: "Gospels" },
  { name: "John", chapters: 21, testament: "New", category: "Gospels" },
  { name: "Acts", chapters: 28, testament: "New", category: "History" },
  { name: "Romans", chapters: 16, testament: "New", category: "Letters" },
  { name: "1 Corinthians", chapters: 16, testament: "New", category: "Letters" },
  { name: "Ephesians", chapters: 6, testament: "New", category: "Letters" },
  { name: "Philippians", chapters: 4, testament: "New", category: "Letters" },
  { name: "Revelation", chapters: 22, testament: "New", category: "Prophecy" }
];

// Sample verses for demonstration
const sampleVerses: Verse[] = [
  { number: 1, text: "In the beginning God created the heavens and the earth." },
  { number: 2, text: "Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters." },
  { number: 3, text: "And God said, 'Let there be light,' and there was light.", highlighted: true },
  { number: 4, text: "God saw that the light was good, and he separated the light from the darkness." },
  { number: 5, text: "God called the light 'day,' and the darkness he called 'night.' And there was evening, and there was morning—the first day." },
  { number: 6, text: "And God said, 'Let there be a vault between the waters to separate water from water.'" },
  { number: 7, text: "So God made the vault and separated the water under the vault from the water above it. And it was so." },
  { number: 8, text: "God called the vault 'sky.' And there was evening, and there was morning—the second day." }
];

const translations = ["KJV", "NIV", "ESV", "NASB", "NLT"];

const MobileBible = () => {
  const { toast } = useToast();
  const [currentBook, setCurrentBook] = useState("Genesis");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentTranslation, setCurrentTranslation] = useState("KJV");
  const [verses, setVerses] = useState<Verse[]>(sampleVerses);
  const [showSettings, setShowSettings] = useState(false);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fontSize, setFontSize] = useState('text-base');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTestament, setSelectedTestament] = useState<'All' | 'Old' | 'New'>('All');

  const currentBookData = bibleBooks.find(book => book.name === currentBook);
  const maxChapter = currentBookData?.chapters || 1;

  const toggleVerse = (verseNumber: number, action: 'highlight' | 'bookmark') => {
    setVerses(prev => prev.map(verse => 
      verse.number === verseNumber 
        ? { ...verse, [action === 'highlight' ? 'highlighted' : 'bookmarked']: !verse[action === 'highlight' ? 'highlighted' : 'bookmarked'] }
        : verse
    ));
    
    toast({
      title: action === 'highlight' ? "Verse Highlighted" : "Verse Bookmarked",
      description: `${currentBook} ${currentChapter}:${verseNumber} has been ${action}ed.`
    });
  };

  const copyVerse = (verse: Verse) => {
    const text = `"${verse.text}" - ${currentBook} ${currentChapter}:${verse.number} (${currentTranslation})`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Verse Copied",
      description: "Bible verse copied to clipboard."
    });
  };

  const shareVerse = (verse: Verse) => {
    const text = `"${verse.text}" - ${currentBook} ${currentChapter}:${verse.number} (${currentTranslation})`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      copyVerse(verse);
    }
  };

  const filteredBooks = bibleBooks.filter(book => {
    const matchesTestament = selectedTestament === 'All' || book.testament === selectedTestament;
    const matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTestament && matchesSearch;
  });

  const navigateChapter = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
    } else if (direction === 'next' && currentChapter < maxChapter) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
    toast({
      title: isPlaying ? "Audio Paused" : "Audio Playing",
      description: `${currentBook} ${currentChapter} audio ${isPlaying ? 'paused' : 'started'}.`
    });
  };

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 via-white to-blue-50'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-white p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Book className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Holy Bible</h1>
            <p className="text-xs text-blue-100">{currentTranslation} Translation</p>
          </div>
        </div>
        
        <div className="relative">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white p-2"
            onClick={() => setShowSettings(!showSettings)}
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
          
          {showSettings && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto">
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Bible Settings</h3>
                <p className="text-xs text-gray-500">Reading preferences & tools</p>
              </div>

              <button
                onClick={() => setShowBookSelector(true)}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
              >
                <Book className="h-4 w-4 text-blue-500" />
                <span>Select Book</span>
              </button>

              <div className="px-4 py-3 border-b border-gray-100">
                <label className="text-xs font-medium text-gray-500 mb-2 block">Translation</label>
                <select 
                  value={currentTranslation}
                  onChange={(e) => setCurrentTranslation(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                >
                  {translations.map(translation => (
                    <option key={translation} value={translation}>{translation}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => toast({ title: "Verse Search", description: "Search feature coming soon!" })}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
              >
                <Search className="h-4 w-4 text-green-500" />
                <span>Search Verses</span>
              </button>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
              >
                {isDarkMode ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-purple-500" />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              <button
                onClick={() => setFontSize(fontSize === 'text-sm' ? 'text-base' : fontSize === 'text-base' ? 'text-lg' : 'text-sm')}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
              >
                <Type className="h-4 w-4 text-orange-500" />
                <span>Font Size ({fontSize.replace('text-', '')})</span>
              </button>

              <button
                onClick={toggleAudio}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
              >
                {isPlaying ? <Pause className="h-4 w-4 text-red-500" /> : <Play className="h-4 w-4 text-green-500" />}
                <span>{isPlaying ? 'Pause Audio' : 'Audio Bible'}</span>
              </button>

              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={() => toast({ title: "Highlights", description: "View your highlighted verses." })}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                >
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>My Highlights</span>
                </button>

                <button
                  onClick={() => toast({ title: "Bookmarks", description: "View your bookmarked verses." })}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                >
                  <Bookmark className="h-4 w-4 text-pink-500" />
                  <span>My Bookmarks</span>
                </button>

                <button
                  onClick={() => toast({ title: "Reading Plan", description: "Set up daily reading plans." })}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                >
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  <span>Reading Plans</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chapter Navigation Only */}
      <div className={`border-b px-4 py-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowBookSelector(true)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-blue-700'}`}
          >
            <span className="font-semibold">{currentBook}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateChapter('prev')}
              disabled={currentChapter === 1}
              className="p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className={`px-3 py-1 rounded-lg font-semibold ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'}`}>
              Chapter {currentChapter}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateChapter('next')}
              disabled={currentChapter === maxChapter}
              className="p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Verses */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-4">
          <div className={`text-center pb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {currentBook} Chapter {currentChapter}
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentTranslation} Translation
            </p>
          </div>

          {verses.map((verse) => (
            <div
              key={verse.number}
              className={`group p-4 rounded-xl transition-all ${
                verse.highlighted 
                  ? isDarkMode ? 'bg-yellow-900/30 border border-yellow-600' : 'bg-yellow-50 border border-yellow-200'
                  : isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className={`text-sm font-bold px-2 py-1 rounded-lg flex-shrink-0 ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-blue-100 text-blue-700'
                }`}>
                  {verse.number}
                </span>
                
                <div className="flex-1">
                  <p className={`leading-relaxed ${fontSize} ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    {verse.text}
                  </p>
                  
                  <div className="flex items-center space-x-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleVerse(verse.number, 'highlight')}
                      className={`p-2 ${verse.highlighted ? 'bg-yellow-100 text-yellow-700' : ''}`}
                    >
                      <Star className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleVerse(verse.number, 'bookmark')}
                      className={`p-2 ${verse.bookmarked ? 'bg-red-100 text-red-700' : ''}`}
                    >
                      <Heart className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyVerse(verse)}
                      className="p-2"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareVerse(verse)}
                      className="p-2"
                    >
                      <Share className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Book Selector Modal */}
      {showBookSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className={`w-full max-h-[80vh] rounded-t-2xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Select Book
                </h3>
                <Button variant="ghost" onClick={() => setShowBookSelector(false)}>
                  ✕
                </Button>
              </div>
              
              <Input
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-3"
              />
              
              <div className="flex space-x-2">
                {['All', 'Old', 'New'].map(testament => (
                  <Button
                    key={testament}
                    variant={selectedTestament === testament ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTestament(testament as any)}
                  >
                    {testament === 'All' ? 'All' : `${testament} Testament`}
                  </Button>
                ))}
              </div>
            </div>
            
            <ScrollArea className="max-h-96 p-4">
              <div className="grid grid-cols-1 gap-2">
                {filteredBooks.map((book) => (
                  <button
                    key={book.name}
                    onClick={() => {
                      setCurrentBook(book.name);
                      setCurrentChapter(1);
                      setShowBookSelector(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      currentBook === book.name
                        ? isDarkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-50 text-blue-700'
                        : isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{book.name}</p>
                      <p className="text-xs opacity-70">{book.category} • {book.chapters} chapters</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {book.testament}
                    </Badge>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileBible; 