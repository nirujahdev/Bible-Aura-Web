import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, Edit3, Camera, BookOpen, Heart, MessageCircle, 
  Calendar, Award, Target, TrendingUp, Save, Star, Sparkles 
} from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  favorite_translation: string | null;
  reading_streak: number | null;
  total_reading_days: number | null;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  totalPrayers: number;
  answeredPrayers: number;
  totalJournalEntries: number;
  totalSermons: number;
  totalBookmarks: number;
  totalConversations: number;
}

const Profile = () => {
  const { user, profile: authProfile } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalPrayers: 0,
    answeredPrayers: 0,
    totalJournalEntries: 0,
    totalSermons: 0,
    totalBookmarks: 0,
    totalConversations: 0
  });
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [favoriteTranslation, setFavoriteTranslation] = useState("");
  const [loading, setLoading] = useState(false);

  const translations = [
    { value: "ESV", label: "English Standard Version" },
    { value: "NIV", label: "New International Version" },
    { value: "KJV", label: "King James Version" },
    { value: "NASB", label: "New American Standard Bible" },
    { value: "NLT", label: "New Living Translation" },
    { value: "NKJV", label: "New King James Version" }
  ];

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || "");
        setBio(data.bio || "");
        setFavoriteTranslation(data.favorite_translation || "ESV");
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      const [
        prayersResponse,
        answeredPrayersResponse,
        journalResponse,
        sermonsResponse,
        bookmarksResponse,
        conversationsResponse
      ] = await Promise.all([
        supabase.from('prayer_requests').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('prayer_requests').select('id', { count: 'exact' }).eq('user_id', user.id).eq('status', 'answered'),
        supabase.from('journal_entries').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('sermons').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('bookmarks').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('ai_conversations').select('id', { count: 'exact' }).eq('user_id', user.id)
      ]);

      setStats({
        totalPrayers: prayersResponse.count || 0,
        answeredPrayers: answeredPrayersResponse.count || 0,
        totalJournalEntries: journalResponse.count || 0,
        totalSermons: sermonsResponse.count || 0,
        totalBookmarks: bookmarksResponse.count || 0,
        totalConversations: conversationsResponse.count || 0
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const profileData = {
        user_id: user.id,
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        favorite_translation: favoriteTranslation
      };

      if (profile) {
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert(profileData);
        
        if (error) throw error;
      }

      await loadProfile();
      setEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const prayerAnswerRate = stats.totalPrayers > 0 
    ? Math.round((stats.answeredPrayers / stats.totalPrayers) * 100) 
    : 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
            <p className="text-muted-foreground">
              Please sign in to view your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Unique Profile Banner - Blue Personal Theme */}
      <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-700 text-white border-b sticky top-0 z-10 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-300/20 to-cyan-200/10 rounded-full -translate-y-32 translate-x-32 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-teal-300/15 to-blue-400/10 rounded-full translate-y-40 -translate-x-40"></div>
          <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-cyan-300/70 rounded-full animate-ping delay-500"></div>
          <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-white/50 rounded-full animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Profile Icon & Title */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-300/30 rounded-full blur-lg"></div>
                <div className="relative p-4 bg-gradient-to-br from-cyan-400/20 to-blue-300/20 rounded-full backdrop-blur-sm border border-white/30">
                  <User className="h-8 w-8 text-cyan-200" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center gap-3">
                  My Profile
                  <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-cyan-300 animate-pulse" />
                </h1>
                <p className="text-blue-100 text-sm sm:text-base lg:text-lg mt-1 font-medium">
                  Manage your account and spiritual preferences
                </p>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="flex flex-wrap gap-3 sm:ml-auto">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-blue-200" />
                  <span>{profile?.reading_streak || 0} Day Streak</span>
                </div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Star className="h-4 w-4 text-cyan-300" />
                  <span>Active Member</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage 
                  src={profile?.avatar_url || ''} 
                  alt={profile?.display_name || 'User Avatar'} 
                />
                <AvatarFallback className="text-lg">
                  {(profile?.display_name || user?.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Display Name</label>
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your display name"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Bio</label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about your faith journey..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Favorite Bible Translation</label>
                      <Select value={favoriteTranslation} onValueChange={setFavoriteTranslation}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {translations.map((translation) => (
                            <SelectItem key={translation.value} value={translation.value}>
                              {translation.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={saveProfile} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold">
                          {profile?.display_name || user?.email?.split('@')[0] || "User"}
                        </h1>
                        <p className="text-muted-foreground">{user?.email}</p>
                      </div>
                      <Button onClick={() => setEditing(true)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>

                    {profile?.bio && (
                      <p className="text-muted-foreground">{profile.bio}</p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {profile?.favorite_translation || "ESV"}
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        Joined {new Date(profile?.created_at || user.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Reading Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Reading Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Current Streak</span>
                  <span className="text-sm text-muted-foreground">
                    {profile?.reading_streak || 0} days
                  </span>
                </div>
                <Progress value={(profile?.reading_streak || 0)} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Total Reading Days</span>
                  <span className="text-sm text-muted-foreground">
                    {profile?.total_reading_days || 0} days
                  </span>
                </div>
                <Progress value={Math.min((profile?.total_reading_days || 0) / 365 * 100, 100)} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Prayer Life
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Prayers</span>
                <span className="text-sm font-medium">{stats.totalPrayers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Answered</span>
                <span className="text-sm font-medium">{stats.answeredPrayers}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Answer Rate</span>
                  <span className="text-sm font-medium">{prayerAnswerRate}%</span>
                </div>
                <Progress value={prayerAnswerRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                Study & Growth
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Journal Entries</span>
                <span className="text-sm font-medium">{stats.totalJournalEntries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Bookmarks</span>
                <span className="text-sm font-medium">{stats.totalBookmarks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">AI Conversations</span>
                <span className="text-sm font-medium">{stats.totalConversations}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                Ministry & Service
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Sermons Created</span>
                <span className="text-sm font-medium">{stats.totalSermons}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Goals</span>
                <span className="text-sm font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Achievements</span>
                <span className="text-sm font-medium">Coming Soon</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Spiritual Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Set Your Spiritual Goals</h3>
              <p className="text-muted-foreground mb-4">
                Track your spiritual growth with personalized goals and milestones.
              </p>
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;