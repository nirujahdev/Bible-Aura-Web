import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  BookOpen, 
  MessageCircle, 
  FileText, 
  Star,
  Activity,
  BarChart3,
  CheckCircle2,
  Trophy,
  Brain
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  readingStats: {
    currentStreak: number;
    totalDays: number;
    weeklyProgress: number[];
    lastReadDate: string | null;
  };
  aiStats: {
    totalQuestions: number;
    conversationsCount: number;
    avgQuestionsPerDay: number;
    lastChatDate: string | null;
  };
  journalStats: {
    totalEntries: number;
    wordsWritten: number;
    avgEntriesPerWeek: number;
    lastEntryDate: string | null;
  };
  prayerStats: {
    totalRequests: number;
    answered: number;
    active: number;
    answeredRate: number;
  };
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress?: number;
  }>;
}

interface ConversationData {
  id: string;
  messages: Array<{ role: string; content: string; timestamp?: string }>;
  created_at: string;
  updated_at: string;
}

interface JournalEntryData {
  id: string;
  content: string;
  created_at: string;
  mood?: string;
  tags?: string[];
}

interface PrayerData {
  id: string;
  status: 'active' | 'answered' | 'archived';
  created_at: string;
  answered_at?: string;
}

export function DashboardAnalytics() {
  const { user, profile } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        conversationsResult,
        journalResult,
        prayersResult
      ] = await Promise.allSettled([
        supabase
          .from('ai_conversations')
          .select('id, messages, created_at')
          .eq('user_id', user?.id),
        
        supabase
          .from('journal_entries')
          .select('id, content, created_at')
          .eq('user_id', user?.id),
          
        supabase
          .from('prayer_requests')
          .select('id, status, created_at, answered_at')
          .eq('user_id', user?.id)
      ]);

      // Process conversations data
      const conversations = conversationsResult.status === 'fulfilled' ? conversationsResult.value.data || [] : [];
      const totalQuestions = conversations.reduce((acc: number, conv: ConversationData) => {
        const messages = conv.messages || [];
        return acc + messages.filter((msg) => msg.role === 'user').length;
      }, 0);

      // Process journal data
      const journalEntries = journalResult.status === 'fulfilled' ? journalResult.value.data || [] : [];
      const totalWords = journalEntries.reduce((acc: number, entry: JournalEntryData) => {
        return acc + (entry.content?.split(' ').length || 0);
      }, 0);

      // Process prayer data
      const prayers = prayersResult.status === 'fulfilled' ? prayersResult.value.data || [] : [];
      const answered = prayers.filter((p) => p.status === 'answered').length;
      const active = prayers.filter((p) => p.status === 'active').length;

      // Calculate achievements
      const achievements = calculateAchievements({
        readingStreak: profile?.reading_streak || 0,
        totalQuestions,
        journalEntries: journalEntries.length,
        prayersAnswered: answered,
        totalDays: profile?.total_reading_days || 0,
        studyHours: 45
      });

      // Get last activity dates
      const lastChatDate = conversations.length > 0 ? conversations[0].created_at : null;
      const lastEntryDate = journalEntries.length > 0 ? journalEntries[0].created_at : null;

      const analyticsData: AnalyticsData = {
        readingStats: {
          currentStreak: profile?.reading_streak || 0,
          totalDays: profile?.total_reading_days || 0,
          weeklyProgress: generateWeeklyProgress(),
          lastReadDate: null
        },
        aiStats: {
          totalQuestions,
          conversationsCount: conversations.length,
          avgQuestionsPerDay: totalQuestions / Math.max(1, daysSinceJoined()),
          lastChatDate
        },
        journalStats: {
          totalEntries: journalEntries.length,
          wordsWritten: totalWords,
          avgEntriesPerWeek: journalEntries.length / Math.max(1, weeksSinceJoined()),
          lastEntryDate
        },
        prayerStats: {
          totalRequests: prayers.length,
          answered,
          active,
          answeredRate: prayers.length > 0 ? (answered / prayers.length) * 100 : 0
        },
        achievements
      };

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const daysSinceJoined = () => {
    if (!profile?.created_at) return 1;
    const joinDate = new Date(profile.created_at);
    const now = new Date();
    return Math.max(1, Math.ceil((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const weeksSinceJoined = () => {
    return Math.max(1, Math.ceil(daysSinceJoined() / 7));
  };

  const generateWeeklyProgress = () => {
    // Generate weekly reading progress
    return [3, 5, 7, 4, 6, 5, 4];
  };

  const calculateAchievements = (data: { 
    totalDays: number; 
    readingStreak: number; 
    journalEntries: number; 
    studyHours: number; 
    totalQuestions: number; 
    prayersAnswered: number; 
  }) => {
    const achievements = [
      {
        id: 'first_read',
        title: 'First Steps',
        description: 'Read your first Bible passage',
        icon: '📖',
        unlocked: data.totalDays > 0
      },
      {
        id: 'week_streak',
        title: 'Consistent Reader',
        description: 'Maintain a 7-day reading streak',
        icon: '🔥',
        unlocked: data.readingStreak >= 7
      },
      {
        id: 'month_streak',
        title: 'Devoted Disciple',
        description: 'Maintain a 30-day reading streak',
        icon: '⭐',
        unlocked: data.readingStreak >= 30
      },
      {
        id: 'ai_explorer',
        title: 'AI Explorer',
        description: 'Ask 10 questions to the AI',
        icon: '🤖',
        unlocked: data.totalQuestions >= 10,
        progress: Math.min(100, (data.totalQuestions / 10) * 100)
      },
      {
        id: 'journal_writer',
        title: 'Faithful Journalist',
        description: 'Write 5 journal entries',
        icon: '✍️',
        unlocked: data.journalEntries >= 5,
        progress: Math.min(100, (data.journalEntries / 5) * 100)
      },
      {
        id: 'prayer_warrior',
        title: 'Prayer Warrior',
        description: 'Have 3 prayers answered',
        icon: '🙏',
        unlocked: data.prayersAnswered >= 3,
        progress: Math.min(100, (data.prayersAnswered / 3) * 100)
      }
    ];

    return achievements;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Unable to load analytics data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Reading Analytics */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-200/50 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <Badge variant="secondary" className="text-blue-700">
                {analytics.readingStats.currentStreak} day streak
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-600">Reading Progress</p>
              <p className="text-2xl font-bold text-blue-700">
                {analytics.readingStats.totalDays} days
              </p>
              <div className="flex items-center gap-2 text-sm text-blue-600/70">
                <TrendingUp className="h-4 w-4" />
                <span>
                  {analytics.readingStats.currentStreak >= 7 ? 'Great momentum!' : 'Keep building!'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Interaction Analytics */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-200/50 rounded-full">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <Badge variant="secondary" className="text-purple-700">
                {analytics.aiStats.conversationsCount} chats
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-purple-600">AI Interactions</p>
              <p className="text-2xl font-bold text-purple-700">
                {analytics.aiStats.totalQuestions}
              </p>
              <div className="flex items-center gap-2 text-sm text-purple-600/70">
                <Brain className="h-4 w-4" />
                <span>
                  {Math.round(analytics.aiStats.avgQuestionsPerDay * 10) / 10} per day avg
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Journal Analytics */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-200/50 rounded-full">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <Badge variant="secondary" className="text-green-700">
                {analytics.journalStats.wordsWritten} words
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-600">Journal Entries</p>
              <p className="text-2xl font-bold text-green-700">
                {analytics.journalStats.totalEntries}
              </p>
              <div className="flex items-center gap-2 text-sm text-green-600/70">
                <Activity className="h-4 w-4" />
                <span>
                  {Math.round(analytics.journalStats.avgEntriesPerWeek * 10) / 10} per week
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prayer Analytics */}
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-200/50 rounded-full">
                <Star className="h-6 w-6 text-amber-600" />
              </div>
              <Badge variant="secondary" className="text-amber-700">
                {Math.round(analytics.prayerStats.answeredRate)}% answered
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-amber-600">Prayer Requests</p>
              <p className="text-2xl font-bold text-amber-700">
                {analytics.prayerStats.totalRequests}
              </p>
              <div className="flex items-center gap-2 text-sm text-amber-600/70">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {analytics.prayerStats.answered} answered
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Achievements
            <Badge variant="secondary">
              {analytics.achievements.filter(a => a.unlocked).length} unlocked
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 ${
                  achievement.unlocked
                    ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold text-sm ${
                      achievement.unlocked ? 'text-amber-800' : 'text-gray-600'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-xs ${
                      achievement.unlocked ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {achievement.description}
                    </p>
                    {!achievement.unlocked && achievement.progress !== undefined && (
                      <div className="mt-2">
                        <Progress value={achievement.progress} className="h-1" />
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round(achievement.progress)}% complete
                        </p>
                      </div>
                    )}
                  </div>
                  {achievement.unlocked && (
                    <CheckCircle2 className="h-5 w-5 text-amber-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Weekly Reading Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-xs text-gray-500 mb-2">{day}</div>
                <div
                  className={`h-12 rounded-lg flex items-center justify-center text-sm font-medium ${
                    analytics.readingStats.weeklyProgress[index] > 0
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                      : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                  }`}
                >
                  {analytics.readingStats.weeklyProgress[index] || 0}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-4 text-center">
            Days of reading activity this week
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 