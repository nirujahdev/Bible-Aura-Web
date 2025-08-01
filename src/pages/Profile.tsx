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
import { UnifiedHeader } from "@/components/UnifiedHeader";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 w-full">
      <UnifiedHeader
        icon={User}
        title="My Profile"
        subtitle="Manage your account and spiritual preferences"
      >
        <div className="flex flex-wrap gap-3">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-white/80" />
              <span>{profile?.reading_streak || 0} Day Streak</span>
            </div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Star className="h-4 w-4 text-white/80" />
              <span>Active Member</span>
            </div>
          </div>
        </div>
      </UnifiedHeader>

      {/* Main Content */}
      <div className="w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
        {/* Profile Card */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                <AvatarImage 
                  src={profile?.avatar_url || ''} 
                  alt={profile?.display_name || 'User Avatar'} 
                />
                <AvatarFallback className="text-base sm:text-lg">
                  {(profile?.display_name || user?.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 w-full">
                {editing ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="text-sm font-medium">Display Name</label>
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your display name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Bio</label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about your faith journey..."
                        className="min-h-[80px] mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Favorite Bible Translation</label>
                      <Select value={favoriteTranslation} onValueChange={setFavoriteTranslation}>
                        <SelectTrigger className="mt-1">
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

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button onClick={saveProfile} disabled={loading} className="w-full sm:w-auto">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditing(false)} className="w-full sm:w-auto">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h1 className="text-xl sm:text-2xl font-bold">
                          {profile?.display_name || user?.email?.split('@')[0] || "User"}
                        </h1>
                        <p className="text-muted-foreground text-sm sm:text-base">{user?.email}</p>
                      </div>
                      <Button onClick={() => setEditing(true)} className="w-full sm:w-auto">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>

                    {profile?.bio && (
                      <p className="text-muted-foreground text-sm sm:text-base">{profile.bio}</p>
                    )}

                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      <Badge variant="outline" className="text-xs sm:text-sm">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {profile?.favorite_translation || "ESV"}
                      </Badge>
                      <Badge variant="outline" className="text-xs sm:text-sm">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Prayer Life
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Total Prayers</span>
                <span className="text-xs sm:text-sm font-medium">{stats.totalPrayers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Answered</span>
                <span className="text-xs sm:text-sm font-medium">{stats.answeredPrayers}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Answer Rate</span>
                  <span className="text-xs sm:text-sm font-medium">{prayerAnswerRate}%</span>
                </div>
                <Progress value={prayerAnswerRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                Study & Growth
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Journal Entries</span>
                <span className="text-xs sm:text-sm font-medium">{stats.totalJournalEntries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Bookmarks</span>
                <span className="text-xs sm:text-sm font-medium">{stats.totalBookmarks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">AI Conversations</span>
                <span className="text-xs sm:text-sm font-medium">{stats.totalConversations}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                Ministry & Service
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Sermons Created</span>
                <span className="text-xs sm:text-sm font-medium">{stats.totalSermons}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Active Goals</span>
                <span className="text-xs sm:text-sm font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Achievements</span>
                <span className="text-xs sm:text-sm font-medium">Coming Soon</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Target className="h-4 w-4 sm:h-5 sm:w-5" />
              Spiritual Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 sm:py-8">
              <Target className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Set Your Spiritual Goals</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 px-2">
                Track your spiritual growth with personalized goals and milestones.
              </p>
              <Button variant="outline" disabled className="w-full sm:w-auto">
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