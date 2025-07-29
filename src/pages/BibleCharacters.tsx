import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Search, 
  BookOpen, 
  Heart, 
  Share, 
  Star,
  Crown,
  Shield,
  MapPin,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

interface BibleCharacter {
  id: string;
  name: string;
  description: string;
  period: string;
  testament: 'Old' | 'New';
  category: string;
  key_verses: string[];
  notable_events: string[];
  character_traits: string[];
  is_favorite: boolean;
  image_placeholder: string;
}

const MOCK_CHARACTERS: BibleCharacter[] = [
  {
    id: '1',
    name: 'Moses',
    description: 'The great prophet who led the Israelites out of Egypt and received the Ten Commandments from God on Mount Sinai.',
    period: '1393-1273 BC',
    testament: 'Old',
    category: 'Prophet',
    key_verses: ['Exodus 3:14', 'Deuteronomy 34:10', 'Numbers 12:3'],
    notable_events: ['Burning Bush', 'Exodus from Egypt', 'Parting of Red Sea', 'Receiving the Law'],
    character_traits: ['Humble', 'Faithful', 'Patient', 'Leader'],
    is_favorite: false,
    image_placeholder: 'M'
  },
  {
    id: '2',
    name: 'Jesus Christ',
    description: 'The Son of God, Savior of the world, who came to earth to redeem humanity through His death and resurrection.',
    period: '4 BC - 30 AD',
    testament: 'New',
    category: 'Savior',
    key_verses: ['John 3:16', 'John 14:6', 'Matthew 28:18'],
    notable_events: ['Birth in Bethlehem', 'Baptism', 'Sermon on the Mount', 'Crucifixion', 'Resurrection'],
    character_traits: ['Love', 'Compassion', 'Wisdom', 'Sacrifice'],
    is_favorite: true,
    image_placeholder: 'J'
  },
  {
    id: '3',
    name: 'David',
    description: 'The shepherd boy who became Israel\'s greatest king, known as "a man after God\'s own heart" and writer of many Psalms.',
    period: '1040-970 BC',
    testament: 'Old',
    category: 'King',
    key_verses: ['1 Samuel 13:14', 'Psalm 23:1', '2 Samuel 7:16'],
    notable_events: ['Defeating Goliath', 'Anointed as King', 'Bringing Ark to Jerusalem', 'Bathsheba Incident'],
    character_traits: ['Courage', 'Worship', 'Repentant', 'Passionate'],
    is_favorite: true,
    image_placeholder: 'D'
  },
  {
    id: '4',
    name: 'Paul (Apostle)',
    description: 'Former persecutor of Christians who became the greatest missionary and wrote much of the New Testament.',
    period: '5-67 AD',
    testament: 'New',
    category: 'Apostle',
    key_verses: ['Acts 9:15', 'Philippians 1:21', 'Galatians 2:20'],
    notable_events: ['Road to Damascus', 'Missionary Journeys', 'Writing Epistles', 'Martyrdom in Rome'],
    character_traits: ['Zealous', 'Devoted', 'Intellectual', 'Perseverant'],
    is_favorite: false,
    image_placeholder: 'P'
  },
  {
    id: '5',
    name: 'Mary (Mother of Jesus)',
    description: 'The virgin chosen by God to be the mother of Jesus Christ, demonstrating ultimate faith and obedience.',
    period: '18 BC - 41 AD',
    testament: 'New',
    category: 'Mother',
    key_verses: ['Luke 1:38', 'Luke 1:46-55', 'John 19:25'],
    notable_events: ['Annunciation', 'Birth of Jesus', 'Wedding at Cana', 'At the Cross'],
    character_traits: ['Faithful', 'Humble', 'Trusting', 'Devoted'],
    is_favorite: false,
    image_placeholder: 'M'
  },
  {
    id: '6',
    name: 'Abraham',
    description: 'The father of faith who left his homeland in obedience to God and became the father of many nations.',
    period: '2166-1991 BC',
    testament: 'Old',
    category: 'Patriarch',
    key_verses: ['Genesis 12:1-3', 'Romans 4:16', 'Hebrews 11:8'],
    notable_events: ['Call from Ur', 'Covenant with God', 'Isaac\'s Birth', 'Sacrifice of Isaac'],
    character_traits: ['Faith', 'Obedience', 'Generous', 'Trusting'],
    is_favorite: true,
    image_placeholder: 'A'
  }
];

const CHARACTER_CATEGORIES = ['All', 'Prophet', 'King', 'Apostle', 'Patriarch', 'Judge', 'Mother', 'Savior'];
const TESTAMENTS = ['All', 'Old', 'New'];

export default function BibleCharacters() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTestament, setSelectedTestament] = useState('All');
  const [characters, setCharacters] = useState<BibleCharacter[]>(MOCK_CHARACTERS);

  const filteredCharacters = characters.filter(character => {
    const matchesSearch = character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         character.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || character.category === selectedCategory;
    const matchesTestament = selectedTestament === 'All' || character.testament === selectedTestament;
    return matchesSearch && matchesCategory && matchesTestament;
  });

  const toggleFavorite = (characterId: string) => {
    if (!user) return;
    setCharacters(prev => prev.map(character => 
      character.id === characterId ? { ...character, is_favorite: !character.is_favorite } : character
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Unique Characters Banner - Purple Royal Theme */}
      <div className="bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-800 text-white border-b sticky top-0 z-10 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-yellow-400/20 to-amber-300/10 rounded-full -translate-y-40 translate-x-40"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-300/20 to-pink-400/10 rounded-full translate-y-32 -translate-x-32"></div>
          <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-yellow-300/60 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-white/40 rounded-full animate-ping delay-700"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Main Title Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400/30 rounded-3xl blur-lg"></div>
                <div className="relative p-5 bg-gradient-to-br from-yellow-400/20 to-amber-300/20 rounded-3xl backdrop-blur-sm border border-white/30">
                  <Crown className="h-10 w-10 text-yellow-300" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center gap-3">
                  Bible Characters
                  <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-amber-300" />
                </h1>
                <p className="text-purple-100 text-sm sm:text-base lg:text-lg mt-1 font-medium">
                  Explore the lives and stories of biblical figures
                </p>
              </div>
            </div>

            {/* Character Stats */}
            <div className="flex flex-wrap gap-3 lg:ml-auto">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4 text-purple-200" />
                  <span>{filteredCharacters.length} Characters</span>
                </div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <BookOpen className="h-4 w-4 text-purple-200" />
                  <span>Old & New Testament</span>
                </div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Star className="h-4 w-4 text-yellow-300" />
                  <span>Life Stories</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search biblical characters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={selectedTestament} onValueChange={setSelectedTestament}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Testament" />
                    </SelectTrigger>
                    <SelectContent>
                      {TESTAMENTS.map(testament => (
                        <SelectItem key={testament} value={testament}>
                          {testament} Testament
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHARACTER_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Characters Grid */}
          {filteredCharacters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCharacters.map((character) => (
                <Card key={character.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-aura-gradient rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {character.image_placeholder}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{character.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{character.category}</Badge>
                            <Badge variant="outline" className="text-xs">
                              {character.testament} Testament
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleFavorite(character.id)}
                        className={character.is_favorite ? 'text-red-500' : 'text-gray-400'}
                        disabled={!user}
                      >
                        <Heart className={`h-4 w-4 ${character.is_favorite ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {character.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{character.period}</span>
                    </div>

                    {/* Character Traits */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Character Traits</h4>
                      <div className="flex flex-wrap gap-1">
                        {character.character_traits.map((trait, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Notable Events */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Notable Events</h4>
                      <ul className="space-y-1">
                        {character.notable_events.slice(0, 3).map((event, index) => (
                          <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                            <span className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                            <span>{event}</span>
                          </li>
                        ))}
                        {character.notable_events.length > 3 && (
                          <li className="text-xs text-muted-foreground">
                            +{character.notable_events.length - 3} more...
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Key Verses */}
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        Key Verses
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {character.key_verses.slice(0, 2).map((verse, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {verse}
                          </Badge>
                        ))}
                        {character.key_verses.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{character.key_verses.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Button variant="outline" size="sm" className="text-xs">
                        Learn More
                      </Button>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Share className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <BookOpen className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Characters Found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <Button onClick={() => { 
                  setSearchQuery(''); 
                  setSelectedCategory('All'); 
                  setSelectedTestament('All'); 
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {!user && (
            <Card className="mt-6 border-primary/20">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Enhance Your Study</h3>
                <p className="text-muted-foreground mb-4">
                  Sign in to save favorite characters, create study lists, and access detailed character studies
                </p>
                <Button asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 