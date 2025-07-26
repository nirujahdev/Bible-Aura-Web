import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  MessageCircle, 
  FileText, 
  Star, 
  TrendingUp,
  Activity,
  Award,
  ArrowRight,
  Brain
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface BookmarkData {
  id: string;
  bible_verses?: {
    bible_books?: {
      name: string;
    };
    chapter: number;
    verse: number;
    text_esv?: string;
  };
  created_at: string;
}

interface ConversationData {
  id: string;
  title: string;
  messages: Array<{ role: string; content: string; timestamp?: string }>;
  created_at: string;
  updated_at: string;
}

interface JournalEntryData {
  id: string;
  title: string;
  content: string;
  mood: string;
  created_at: string;
}

interface PrayerData {
  id: string;
  title: string;
  status: 'active' | 'answered';
  created_at: string;
  answered_at?: string;
  content?: string;
}

// Bible Study Widget
export function BibleStudyWidget() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBibleData();
    }
  }, [user]);

  const fetchBibleData = async () => {
    try {
      const { data: bookmarksData } = await supabase
        .from('bookmarks')
        .select(`
          id,
          notes,
          color,
          created_at,
          bible_verses (
            chapter,
            verse,
            text_esv,
            bible_books (name)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      setBookmarks(bookmarksData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bible data:', error);
      setLoading(false);
    }
  };

  return (
    <Card className="h-full border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <BookOpen className="h-5 w-5" />
          Bible Study
          <Badge variant="secondary" className="ml-auto">
            {bookmarks.length} saved
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{bookmarks.length}</div>
            <div className="text-xs text-orange-600/70">Bookmarks</div>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">4</div>
            <div className="text-xs text-orange-600/70">Translations</div>
          </div>
        </div>

        {/* Recent Bookmarks */}
        {bookmarks.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-orange-800">Recent Bookmarks</h4>
            {bookmarks.slice(0, 2).map((bookmark: BookmarkData) => (
              <div key={bookmark.id} className="p-2 bg-white/60 rounded-lg text-xs">
                <div className="font-semibold text-orange-700">
                  {bookmark.bible_verses?.bible_books?.name} {bookmark.bible_verses?.chapter}:{bookmark.bible_verses?.verse}
                </div>
                <div className="text-orange-600/70 line-clamp-2">
                  {bookmark.bible_verses?.text_esv?.slice(0, 80)}...
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-orange-600/70 text-sm py-4">
            No bookmarks yet. Start reading to save verses!
          </div>
        )}

        <Link to="/bible">
          <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
            <BookOpen className="mr-2 h-4 w-4" />
            Open Bible
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// AI Chat Widget
export function AIChatWidget() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    if (user) {
      fetchChatData();
    }
  }, [user]);

  const fetchChatData = async () => {
    try {
      const { data: convData } = await supabase
        .from('ai_conversations')
        .select('id, title, messages, created_at')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(3);

      setConversations(convData || []);
      
      const totalQuestionCount = convData?.reduce((acc: number, conv: ConversationData) => {
        const messages = conv.messages || [];
        return acc + messages.filter((msg) => msg.role === 'user').length;
      }, 0) || 0;
      
      setTotalQuestions(totalQuestionCount);
    } catch (error) {
      console.error('Error fetching chat data:', error);
    }
  };

  return (
    <Card className="h-full border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <span className="text-purple-600">✦</span>
          <MessageCircle className="h-5 w-5" />
          Bible Aura AI Assistant
          <Badge variant="secondary" className="ml-auto">
            {totalQuestions} questions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{conversations.length}</div>
            <div className="text-xs text-purple-600/70">Conversations</div>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{totalQuestions}</div>
            <div className="text-xs text-purple-600/70">Questions Asked</div>
          </div>
        </div>

        {/* Recent Conversations */}
        {conversations.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-purple-800">Recent Chats</h4>
            {conversations.slice(0, 2).map((conv: ConversationData) => (
              <div key={conv.id} className="p-2 bg-white/60 rounded-lg text-xs">
                <div className="font-semibold text-green-700 line-clamp-1">
                  {conv.title || 'Untitled Conversation'}
                </div>
                <div className="text-green-600/70 text-xs">
                  {new Date(conv.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-purple-600/70 text-sm py-4">
            No conversations yet. Ask your first question!
          </div>
        )}

        <Link to="/chat">
          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
            <MessageCircle className="mr-2 h-4 w-4" />
            Start Chatting
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Journal Widget
export function JournalWidget() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);

  useEffect(() => {
    if (user) {
      fetchJournalData();
    }
  }, [user]);

  const fetchJournalData = async () => {
    try {
      const { data: entriesData } = await supabase
        .from('journal_entries')
        .select('id, title, content, mood, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      setEntries(entriesData || []);
      
      // Calculate total words
      const totalWords = entriesData?.reduce((acc: number, entry: JournalEntryData) => {
        return acc + (entry.content?.split(' ').length || 0);
      }, 0) || 0;

      setTotalEntries(entriesData?.length || 0);
    } catch (error) {
      console.error('Error fetching journal data:', error);
    }
  };

  return (
    <Card className="h-full border-green-200 bg-gradient-to-br from-green-50 to-green-100/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <FileText className="h-5 w-5" />
          Journal
          <Badge variant="secondary" className="ml-auto">
            {totalEntries} entries
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalEntries}</div>
            <div className="text-xs text-green-600/70">Total Entries</div>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {entries.length > 0 ? Math.ceil((Date.now() - new Date(entries[0]?.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
            </div>
            <div className="text-xs text-green-600/70">Days Since Last</div>
          </div>
        </div>

        {/* Recent Entries */}
        {entries.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-800">Recent Entries</h4>
            {entries.slice(0, 2).map((entry: JournalEntryData) => (
              <div key={entry.id} className="p-2 bg-white/60 rounded-lg text-xs">
                <div className="text-purple-600/70 text-xs mb-1">
                  {new Date(entry.created_at).toLocaleDateString()}
                </div>
                <div className="text-purple-700 line-clamp-2">
                  {entry.content?.slice(0, 80)}...
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-green-600/70 text-sm py-4">
            No journal entries yet. Start writing!
          </div>
        )}

        <Link to="/journal">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
            <FileText className="mr-2 h-4 w-4" />
            Open Journal
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Prayer Requests Widget
export function PrayerWidget() {
  const { user } = useAuth();
  const [prayers, setPrayers] = useState([]);
  const [stats, setStats] = useState({ active: 0, answered: 0, total: 0 });

  useEffect(() => {
    if (user) {
      fetchPrayerData();
    }
  }, [user]);

  const fetchPrayerData = async () => {
    try {
      const { data: prayersData } = await supabase
        .from('prayer_requests')
        .select('id, title, status, created_at, answered_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setPrayers(prayersData || []);
      
      const active = prayersData?.filter(p => p.status === 'active').length || 0;
      const answered = prayersData?.filter(p => p.status === 'answered').length || 0;
      const total = prayersData?.length || 0;
      
      setStats({ active, answered, total });
    } catch (error) {
      console.error('Error fetching prayer data:', error);
    }
  };

  return (
    <Card className="h-full border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <Star className="h-5 w-5" />
          Prayer Requests
          <Badge variant="secondary" className="ml-auto">
            {stats.active} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">{stats.active}</div>
            <div className="text-xs text-amber-600/70">Active</div>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">{stats.answered}</div>
            <div className="text-xs text-amber-600/70">Answered</div>
          </div>
        </div>

        {/* Recent Prayers */}
        {prayers.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-amber-800">Recent Requests</h4>
            {prayers.slice(0, 2).map((prayer: PrayerData) => (
              <div key={prayer.id} className="p-2 bg-white/60 rounded-lg text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    prayer.status === 'answered' ? 'bg-green-100 text-green-700' :
                    prayer.status === 'active' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {prayer.status}
                  </span>
                  <span className="text-orange-600/70 text-xs">
                    {new Date(prayer.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-orange-700 line-clamp-2">
                  {prayer.content?.slice(0, 60)}...
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-amber-600/70 text-sm py-4">
            No prayer requests yet. Add your first one!
          </div>
        )}

        <Link to="/prayers">
          <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
            <Star className="mr-2 h-4 w-4" />
            Manage Prayers
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Reading Progress Widget
export function ReadingProgressWidget() {
  const { profile } = useAuth();
  
  // Calculate progress percentage
  const streakProgress = Math.min((profile?.reading_streak || 0) / 30, 1) * 100;
  
  return (
    <Card className="h-full border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-teal-800">
          <TrendingUp className="h-5 w-5" />
          Reading Progress
          <Badge variant="secondary" className="ml-auto">
            {profile?.reading_streak || 0} days
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Stats */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-teal-700">Current Streak</span>
              <span className="text-teal-600">{profile?.reading_streak || 0}/30 days</span>
            </div>
            <Progress value={streakProgress} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-teal-600">{profile?.reading_streak || 0}</div>
              <div className="text-xs text-teal-600/70">Current Streak</div>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-teal-600">{profile?.total_reading_days || 0}</div>
              <div className="text-xs text-teal-600/70">Total Days</div>
            </div>
          </div>
        </div>

        {/* Achievement */}
        <div className="p-3 bg-white/60 rounded-lg border border-teal-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-full">
              <Award className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <div className="font-semibold text-teal-700 text-sm">
                {profile?.reading_streak >= 7 ? '🔥 On Fire!' : '📖 Getting Started'}
              </div>
              <div className="text-teal-600/70 text-xs">
                {profile?.reading_streak >= 7 
                  ? 'Amazing reading streak!' 
                  : 'Keep reading to build your streak'
                }
              </div>
            </div>
          </div>
        </div>

        <Link to="/bible">
          <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
            <BookOpen className="mr-2 h-4 w-4" />
            Continue Reading
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
} 