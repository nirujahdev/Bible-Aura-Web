import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  PenTool, Plus, MoreVertical, ArrowLeft, Settings, 
  Calendar, Search, Filter, Heart, Star, BookOpen,
  Lock, Share, Download, Upload, Tag, Clock, Smile,
  Frown, Meh, Sun, Cloud, CloudRain, Archive, Trash2,
  Edit, Eye, Copy, ChevronDown, ChevronRight, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: Date;
  category: string;
  mood?: 'happy' | 'peaceful' | 'grateful' | 'thoughtful' | 'struggling' | 'hopeful';
  tags: string[];
  isPrivate: boolean;
  isFavorite: boolean;
  wordCount: number;
  verseReference?: string;
}

interface Category {
  name: string;
  color: string;
  icon: any;
  count: number;
}

const categories: Category[] = [
  { name: 'Prayer', color: 'bg-blue-500', icon: Heart, count: 12 },
  { name: 'Devotional', color: 'bg-purple-500', icon: BookOpen, count: 8 },
  { name: 'Gratitude', color: 'bg-green-500', icon: Star, count: 15 },
  { name: 'Reflection', color: 'bg-orange-500', icon: Sun, count: 6 },
  { name: 'Growth', color: 'bg-indigo-500', icon: PenTool, count: 9 },
  { name: 'Challenges', color: 'bg-red-500', icon: Cloud, count: 4 }
];

const moods = [
  { name: 'happy', icon: Smile, color: 'text-yellow-500', label: 'Joyful' },
  { name: 'peaceful', icon: Sun, color: 'text-blue-500', label: 'Peaceful' },
  { name: 'grateful', icon: Heart, color: 'text-green-500', label: 'Grateful' },
  { name: 'thoughtful', icon: Meh, color: 'text-purple-500', label: 'Thoughtful' },
  { name: 'struggling', icon: Cloud, color: 'text-gray-500', label: 'Struggling' },
  { name: 'hopeful', icon: Star, color: 'text-orange-500', label: 'Hopeful' }
];

const sampleEntries: JournalEntry[] = [
  {
    id: '1',
    title: 'Morning Gratitude',
    content: 'Today I woke up with such a grateful heart. The Lord has been so faithful in providing for our family during this challenging season. I\'m reminded of Philippians 4:19 - "And my God will meet all your needs according to the riches of his glory in Christ Jesus." This verse has become so real to me lately...',
    date: new Date('2024-02-03'),
    category: 'Gratitude',
    mood: 'grateful',
    tags: ['thankfulness', 'provision', 'family'],
    isPrivate: false,
    isFavorite: true,
    wordCount: 156,
    verseReference: 'Philippians 4:19'
  },
  {
    id: '2',
    title: 'Prayer for Guidance',
    content: 'Lord, I come before you today feeling uncertain about the path ahead. Work has been stressful and I\'m not sure which direction to take. Help me to trust in your timing and your plan. I know you have good plans for me (Jeremiah 29:11) but sometimes it\'s hard to see through the fog of daily life...',
    date: new Date('2024-02-02'),
    category: 'Prayer',
    mood: 'thoughtful',
    tags: ['guidance', 'work', 'trust'],
    isPrivate: true,
    isFavorite: false,
    wordCount: 98,
    verseReference: 'Jeremiah 29:11'
  },
  {
    id: '3',
    title: 'Devotional Insights',
    content: 'Reading through Psalm 23 this morning and verse 4 really stood out: "Even though I walk through the darkest valley, I will fear no evil, for you are with me." The phrase "walk through" reminds me that valleys are not permanent dwelling places. We\'re meant to keep moving, and God walks with us every step...',
    date: new Date('2024-02-01'),
    category: 'Devotional',
    mood: 'hopeful',
    tags: ['psalms', 'comfort', 'presence'],
    isPrivate: false,
    isFavorite: true,
    wordCount: 127,
    verseReference: 'Psalm 23:4'
  }
];

const Journal = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>(sampleEntries);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'category'>('date');

  // New entry state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Reflection');
  const [newMood, setNewMood] = useState<string>('peaceful');
  const [newTags, setNewTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return b.date.getTime() - a.date.getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  const toggleFavorite = (entryId: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { ...entry, isFavorite: !entry.isFavorite }
        : entry
    ));
    toast({
      title: "Updated",
      description: "Entry favorite status updated."
    });
  };

  const deleteEntry = (entryId: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== entryId));
    toast({
      title: "Entry Deleted",
      description: "Journal entry has been deleted."
    });
  };

  const saveNewEntry = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content.",
        variant: "destructive"
      });
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      date: new Date(),
      category: newCategory,
      mood: newMood as any,
      tags: newTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      isPrivate,
      isFavorite: false,
      wordCount: newContent.split(' ').length
    };

    setEntries(prev => [newEntry, ...prev]);
    
    // Reset form
    setNewTitle('');
    setNewContent('');
    setNewCategory('Reflection');
    setNewMood('peaceful');
    setNewTags('');
    setIsPrivate(false);
    setShowNewEntry(false);

    toast({
      title: "Entry Saved",
      description: "Your journal entry has been saved."
    });
  };

  const getMoodIcon = (mood: string) => {
    const moodObj = moods.find(m => m.name === mood);
    return moodObj || moods[0];
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || 'bg-gray-500';
  };

  return (
    <div className="h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-white p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <PenTool className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Spiritual Journal</h1>
            <p className="text-xs text-green-100">{entries.length} entries • {entries.reduce((acc, entry) => acc + entry.wordCount, 0)} words</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white p-2"
            onClick={() => setShowNewEntry(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
          
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
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={() => setSortBy(sortBy === 'date' ? 'title' : sortBy === 'title' ? 'category' : 'date')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 text-gray-700"
                >
                  <Clock className="h-4 w-4" />
                  <span>Sort by {sortBy === 'date' ? 'Title' : sortBy === 'title' ? 'Category' : 'Date'}</span>
                </button>
                <button
                  onClick={() => toast({ title: "Export Journal", description: "Export feature coming soon!" })}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 text-gray-700"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Journal</span>
                </button>
                <button
                  onClick={() => toast({ title: "Privacy Settings", description: "Manage your journal privacy settings." })}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 text-gray-700"
                >
                  <Lock className="h-4 w-4" />
                  <span>Privacy Settings</span>
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 text-gray-700"
                >
                  <Settings className="h-4 w-4" />
                  <span>More Settings</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Categories */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search entries, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm" className="p-2">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Categories */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === 'All' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory('All')}
            className="whitespace-nowrap"
          >
            All ({entries.length})
          </Button>
          {categories.map(category => (
            <Button
              key={category.name}
              variant={selectedCategory === category.name ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.name)}
              className="whitespace-nowrap"
            >
              {category.name} ({category.count})
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-4 py-4">
        {!showNewEntry && !selectedEntry && (
          <div className="space-y-4">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12">
                <PenTool className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Entries Found</h3>
                <p className="text-sm text-gray-500 mb-4">Start your spiritual journey by creating your first journal entry.</p>
                <Button onClick={() => setShowNewEntry(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Entry
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEntries.map((entry) => {
                  const moodInfo = getMoodIcon(entry.mood || 'peaceful');
                  return (
                    <Card key={entry.id} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer">
                      <CardContent className="p-4" onClick={() => setSelectedEntry(entry)}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 ${getCategoryColor(entry.category)} rounded-full`}></div>
                            <h3 className="font-semibold text-gray-800 line-clamp-1">{entry.title}</h3>
                            {entry.isPrivate && <Lock className="h-3 w-3 text-gray-400" />}
                            {entry.isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                          </div>
                          <div className="flex items-center space-x-2">
                            <moodInfo.icon className={`h-4 w-4 ${moodInfo.color}`} />
                            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(entry.id); }}>
                              <Heart className={`h-4 w-4 ${entry.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-3 mb-3">{entry.content}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{entry.date.toLocaleDateString()}</span>
                            <span>{entry.wordCount} words</span>
                            <Badge variant="outline" className="text-xs">{entry.category}</Badge>
                          </div>
                          
                          {entry.tags.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <Tag className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{entry.tags.slice(0, 2).join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* New Entry Form */}
        {showNewEntry && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">New Entry</h2>
              <Button variant="outline" onClick={() => setShowNewEntry(false)}>
                Cancel
              </Button>
            </div>
            
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-4">
                <Input
                  placeholder="Entry title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="font-semibold"
                />
                
                <textarea
                  placeholder="What's on your heart today? Share your thoughts, prayers, and reflections..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full h-40 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                    <select 
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                    >
                      {categories.map(cat => (
                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Mood</label>
                    <select 
                      value={newMood}
                      onChange={(e) => setNewMood(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                    >
                      {moods.map(mood => (
                        <option key={mood.name} value={mood.name}>{mood.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <Input
                  placeholder="Tags (comma separated)"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                />
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="private"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="private" className="text-sm text-gray-700">Make this entry private</label>
                </div>
                
                <Button onClick={saveNewEntry} className="w-full bg-green-600 hover:bg-green-700">
                  <PenTool className="h-4 w-4 mr-2" />
                  Save Entry
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Entry Detail View */}
        {selectedEntry && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setSelectedEntry(null)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => toggleFavorite(selectedEntry.id)}>
                  <Star className={`h-4 w-4 ${selectedEntry.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => deleteEntry(selectedEntry.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
            
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl font-bold text-gray-800">{selectedEntry.title}</h1>
                  {selectedEntry.isPrivate && <Lock className="h-4 w-4 text-gray-400" />}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                  <span>{selectedEntry.date.toLocaleDateString()}</span>
                  <span>{selectedEntry.wordCount} words</span>
                  <Badge className={`${getCategoryColor(selectedEntry.category)} text-white`}>
                    {selectedEntry.category}
                  </Badge>
                  {selectedEntry.mood && (
                    <div className="flex items-center space-x-1">
                      {React.createElement(getMoodIcon(selectedEntry.mood).icon, {
                        className: `h-4 w-4 ${getMoodIcon(selectedEntry.mood).color}`
                      })}
                      <span>{getMoodIcon(selectedEntry.mood).label}</span>
                    </div>
                  )}
                </div>
                
                <div className="prose prose-sm max-w-none">
                  {selectedEntry.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 leading-relaxed text-gray-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                {selectedEntry.verseReference && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-blue-700 font-medium">Referenced Scripture:</p>
                    <p className="text-sm text-blue-600">{selectedEntry.verseReference}</p>
                  </div>
                )}
                
                {selectedEntry.tags.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default Journal; 