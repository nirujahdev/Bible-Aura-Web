import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, ChevronDown, ChevronRight, BookOpen, Bot, 
  Calendar, Target, History, Star, MessageCircle,
  Filter, Grid, List, X, Sparkles
} from 'lucide-react';
import EnhancedAIChat from './EnhancedAIChat';

interface BibleBook {
  id: string;
  name: string;
  chapters: number;
  testament: 'old' | 'new';
  category: string;
}

interface EnhancedBibleSidebarProps {
  books: BibleBook[];
  selectedBook?: BibleBook | null;
  onBookSelect: (book: BibleBook) => void;
  onTabChange?: (tab: string) => void;
  activeTab?: string;
  recentBooks?: BibleBook[];
  bookmarkedBooks?: BibleBook[];
  className?: string;
}

const bookCategories = {
  old: {
    'Law': ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'],
    'History': [
      'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
      '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther'
    ],
    'Poetry & Wisdom': ['Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon'],
    'Major Prophets': ['Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel'],
    'Minor Prophets': [
      'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum',
      'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
    ]
  },
  new: {
    'Gospels': ['Matthew', 'Mark', 'Luke', 'John'],
    'History': ['Acts'],
    'Paul\'s Letters': [
      'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
      'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
      '1 Timothy', '2 Timothy', 'Titus', 'Philemon'
    ],
    'General Letters': ['Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude'],
    'Prophecy': ['Revelation']
  }
};

export function EnhancedBibleSidebar({
  books,
  selectedBook,
  onBookSelect,
  onTabChange,
  activeTab = 'books',
  recentBooks = [],
  bookmarkedBooks = [],
  className = ''
}: EnhancedBibleSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'category' | 'list'>('category');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Gospels']));
  const [showAIChat, setShowAIChat] = useState(false);
  const [filterTestament, setFilterTestament] = useState<'all' | 'old' | 'new'>('all');

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTestament = filterTestament === 'all' || book.testament === filterTestament;
    return matchesSearch && matchesTestament;
  });

  const groupedBooks = React.useMemo(() => {
    const grouped: Record<string, BibleBook[]> = {};
    
    Object.entries(bookCategories).forEach(([testament, categories]) => {
      Object.entries(categories).forEach(([category, bookNames]) => {
        grouped[category] = books.filter(book => 
          bookNames.includes(book.name) &&
          (filterTestament === 'all' || book.testament === filterTestament) &&
          book.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    });
    
    return grouped;
  }, [books, searchQuery, filterTestament]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const tabs = [
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'plans', label: 'Plans', icon: Target },
    { id: 'recent', label: 'Recent', icon: History },
    { id: 'bookmarks', label: 'Saved', icon: Star },
  ];

  return (
    <div className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}>
      {/* Header with Tabs */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-6 h-6 text-orange-600" />
          <h2 className="text-lg font-semibold text-gray-800">Bible Navigator</h2>
        </div>
        
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Chat Button */}
      <div className="p-4 border-b border-gray-200">
        <Dialog open={showAIChat} onOpenChange={setShowAIChat}>
          <DialogTrigger asChild>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
              <Bot className="w-4 h-4 mr-2" />
              Ask AI About Scripture
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                Bible AI Assistant
              </DialogTitle>
            </DialogHeader>
            <div className="h-[500px]">
              <EnhancedAIChat />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content based on active tab */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'books' && (
          <div className="h-full flex flex-col">
            {/* Search and Filters */}
            <div className="p-4 space-y-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {['all', 'old', 'new'].map((testament) => (
                    <Button
                      key={testament}
                      size="sm"
                      variant={filterTestament === testament ? 'default' : 'outline'}
                      onClick={() => setFilterTestament(testament as any)}
                      className="text-xs"
                    >
                      {testament === 'all' ? 'All' : `${testament === 'old' ? 'Old' : 'New'} Testament`}
                    </Button>
                  ))}
                </div>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={viewMode === 'category' ? 'default' : 'outline'}
                    onClick={() => setViewMode('category')}
                  >
                    <Grid className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Books List */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {viewMode === 'category' ? (
                  <div className="space-y-2">
                    {Object.entries(groupedBooks).map(([category, categoryBooks]) => (
                      categoryBooks.length > 0 && (
                        <Collapsible
                          key={category}
                          open={expandedCategories.has(category)}
                          onOpenChange={() => toggleCategory(category)}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-between p-2 h-auto font-medium text-gray-700 hover:bg-gray-100"
                            >
                              <span className="flex items-center gap-2">
                                {category}
                                <Badge variant="outline" className="text-xs">
                                  {categoryBooks.length}
                                </Badge>
                              </span>
                              {expandedCategories.has(category) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-1 ml-4 mt-1">
                            {categoryBooks.map((book) => (
                              <Button
                                key={book.id}
                                variant={selectedBook?.id === book.id ? 'default' : 'ghost'}
                                className="w-full justify-start text-sm"
                                onClick={() => onBookSelect(book)}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>{book.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {book.chapters}
                                  </Badge>
                                </div>
                              </Button>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredBooks.map((book) => (
                      <Button
                        key={book.id}
                        variant={selectedBook?.id === book.id ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => onBookSelect(book)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{book.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${book.testament === 'old' ? 'border-blue-200 text-blue-700' : 'border-green-200 text-green-700'}`}
                            >
                              {book.testament === 'old' ? 'OT' : 'NT'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {book.chapters}
                            </Badge>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {activeTab === 'recent' && (
          <ScrollArea className="flex-1">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Recently Read</h3>
              {recentBooks.length > 0 ? (
                <div className="space-y-1">
                  {recentBooks.map((book) => (
                    <Button
                      key={book.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => onBookSelect(book)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{book.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {book.chapters}
                        </Badge>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No recent books. Start reading to see your history here.
                </p>
              )}
            </div>
          </ScrollArea>
        )}

        {activeTab === 'bookmarks' && (
          <ScrollArea className="flex-1">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Saved Books</h3>
              {bookmarkedBooks.length > 0 ? (
                <div className="space-y-1">
                  {bookmarkedBooks.map((book) => (
                    <Button
                      key={book.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => onBookSelect(book)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{book.name}</span>
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No saved books. Bookmark books you want to study further.
                </p>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

export default EnhancedBibleSidebar; 