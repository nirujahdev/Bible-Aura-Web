import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { subscriptionService, SubscriptionInfo, UsageInfo, ResourceType } from "@/lib/subscription-service";
import { 
  User, Edit3, Camera, BookOpen, Heart, MessageCircle, 
  Calendar, Award, Target, TrendingUp, Save, Star, Sparkles,
  Shield, Mail, Lock, Eye, EyeOff, Settings, Type, 
  Languages, Bot, Bell, Palette, Moon, Sun, Crown, CreditCard
} from "lucide-react";
import { ModernLayout } from "@/components/ModernLayout";

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
  const { user, profile: authProfile, resetPassword } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalPrayers: 0,
    answeredPrayers: 0,
    totalJournalEntries: 0,
    totalSermons: 0,
    totalBookmarks: 0,
    totalConversations: 0
  });

  // Subscription states
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [usageStats, setUsageStats] = useState<Record<ResourceType, UsageInfo> | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  // Profile editing states
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [favoriteTranslation, setFavoriteTranslation] = useState("");

  // Password reset states
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);

  // App Settings states
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [showVerseNumbers, setShowVerseNumbers] = useState(true);
  const [defaultAIMode, setDefaultAIMode] = useState("chat");
  const [defaultLanguage, setDefaultLanguage] = useState("english");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  const translations = [
    { value: "ESV", label: "English Standard Version" },
    { value: "NIV", label: "New International Version" },
    { value: "KJV", label: "King James Version" },
    { value: "NASB", label: "New American Standard Bible" },
    { value: "NLT", label: "New Living Translation" },
    { value: "NKJV", label: "New King James Version" }
  ];

  const aiModes = [
    { value: "chat", label: "💬 AI Chat" },
    { value: "verse", label: "📖 Verse Analysis" },
    { value: "parable", label: "🌱 Parables" },
    { value: "character", label: "👤 Bible Characters" },
    { value: "qa", label: "❓ Quick Q&A" }
  ];

  const languages = [
    { value: "english", label: "English" },
    { value: "tamil", label: "Tamil" }
  ];

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
      loadSubscriptionInfo();
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

  const loadSubscriptionInfo = async () => {
    if (!user) return;

    setSubscriptionLoading(true);
    try {
      const [subscription, usage] = await Promise.all([
        subscriptionService.getSubscriptionInfo(user.id),
        subscriptionService.getAllUsageStats(user.id)
      ]);

      setSubscriptionInfo(subscription);
      setUsageStats(usage);
    } catch (error) {
      console.error("Failed to load subscription info:", error);
    } finally {
      setSubscriptionLoading(false);
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

  // Add password reset function
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetLoading(true);

    try {
      const email = resetEmail || user?.email;
      if (!email) {
        toast({
          title: "Error",
          description: "Email address is required",
          variant: "destructive"
        });
        return;
      }

      const result = await resetPassword(email);
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Password Reset Sent",
          description: "Please check your email for password reset instructions",
        });
        setShowPasswordReset(false);
        setResetEmail("");
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const prayerAnswerRate = stats.totalPrayers > 0 
    ? Math.round((stats.answeredPrayers / stats.totalPrayers) * 100) 
    : 0;

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'free': return 'Free';
      case 'pro': return 'Pro';
      case 'supporter': return 'Supporter';
      case 'partner': return 'Partner';
      default: return 'Free';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'text-gray-600';
      case 'pro': return 'text-blue-600';
      case 'supporter': return 'text-purple-600';
      case 'partner': return 'text-gold-600';
      default: return 'text-gray-600';
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'supporter': return 'bg-purple-100 text-purple-800';
      case 'partner': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
    <ModernLayout>
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 w-full ${isMobile ? 'mobile-safe-area' : ''}`}>
        <div className={isMobile ? "p-3 sm:p-6" : "p-6"}>
          <div className={`flex items-center gap-4 mb-6 ${isMobile ? 'flex-col text-center sm:flex-row sm:text-left' : ''}`}>
            <div className={`p-3 bg-orange-500 rounded-xl ${isMobile ? 'mx-auto sm:mx-0' : ''}`}>
              <User className="h-8 w-8 text-white" />
            </div>
            <div className={isMobile ? 'text-center sm:text-left' : ''}>
              <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-xl sm:text-2xl' : 'text-2xl'}`}>Profile & Settings</h1>
              <p className={`text-gray-600 ${isMobile ? 'text-sm sm:text-base' : ''}`}>Manage your account, preferences, and spiritual settings</p>
            </div>
          </div>
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
        </div>

      {/* Main Content */}
      <div className="w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
        
        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full grid-cols-2 mb-6 ${isMobile ? 'h-auto' : ''}`}>
            <TabsTrigger value="profile" className={`flex items-center gap-2 ${isMobile ? 'p-2 text-sm' : ''}`}>
              <User className="h-4 w-4" />
              {isMobile ? 'Profile' : 'Profile'}
            </TabsTrigger>
            <TabsTrigger value="settings" className={`flex items-center gap-2 ${isMobile ? 'p-2 text-sm' : ''}`}>
              <Settings className="h-4 w-4" />
              {isMobile ? 'Settings' : 'Settings'}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab Content */}
          <TabsContent value="profile" className="space-y-6">
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

        {/* Subscription Information */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptionLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : subscriptionInfo ? (
              <div className="space-y-4">
                {/* Current Plan */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-orange-50 to-blue-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${subscriptionInfo.plan !== 'free' ? 'bg-orange-100' : 'bg-gray-100'}`}>
                      <Crown className={`h-5 w-5 ${subscriptionInfo.plan !== 'free' ? 'text-orange-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-base sm:text-lg">
                        {getPlanDisplayName(subscriptionInfo.plan)} Plan
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: <span className={`font-medium ${subscriptionInfo.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                          {subscriptionInfo.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <Badge className={`${getPlanBadgeColor(subscriptionInfo.plan)} px-3 py-1`}>
                    {getPlanDisplayName(subscriptionInfo.plan)}
                  </Badge>
                </div>

                {/* Plan Details */}
                {subscriptionInfo.currentPeriodEnd && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {subscriptionInfo.cancelAtPeriodEnd 
                        ? `Subscription ends on ${new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString()}`
                        : `Next billing on ${new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString()}`
                      }
                    </div>
                  </div>
                )}

                {/* Usage Overview */}
                {usageStats && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">This Month's Usage</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* AI Features */}
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-800 text-sm mb-2">AI Features</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>AI Chat</span>
                            <span>{usageStats.ai_chat.currentUsage}/{subscriptionService.formatLimit(usageStats.ai_chat.limitAmount)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Verse Analysis</span>
                            <span>{usageStats.verse_analysis.currentUsage}/{subscriptionService.formatLimit(usageStats.verse_analysis.limitAmount)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content Features */}
                      <div className="p-3 bg-green-50 rounded-lg">
                        <h5 className="font-medium text-green-800 text-sm mb-2">Content</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Journal Entries</span>
                            <span>{usageStats.journal_entries.currentUsage}/{subscriptionService.formatLimit(usageStats.journal_entries.limitAmount)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Bookmarks</span>
                            <span>{usageStats.bookmarks.currentUsage}/{subscriptionService.formatLimit(usageStats.bookmarks.limitAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reset Date */}
                    <div className="text-xs text-gray-500 text-center pt-2 border-t">
                      Usage resets on {new Date(usageStats.ai_chat.resetDate).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {/* Upgrade Button for Free Users */}
                {subscriptionInfo.plan === 'free' && (
                  <div className="p-4 bg-gradient-to-r from-orange-100 to-blue-100 rounded-lg border-2 border-dashed border-orange-200">
                    <div className="text-center">
                      <Sparkles className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-gray-900 mb-1">Unlock More Features</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Upgrade to Pro for unlimited AI conversations, advanced study tools, and more!
                      </p>
                      <Button variant="default" size="sm" onClick={() => window.location.href = '/pricing'}>
                        <Crown className="h-4 w-4 mr-2" />
                        View Pricing
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">Unable to load subscription information</p>
                <Button variant="outline" size="sm" onClick={loadSubscriptionInfo} className="mt-2">
                  Retry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Security Section */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              Account Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Password</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Reset your password to maintain account security
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordReset(!showPasswordReset)}
                  className="w-full sm:w-auto"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Reset Password
                </Button>
              </div>

              {showPasswordReset && (
                <div className="p-3 sm:p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <form onSubmit={handlePasswordReset} className="space-y-3">
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        placeholder={user?.email || "Enter your email"}
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave empty to use your account email ({user?.email})
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        type="submit" 
                        disabled={isResetLoading}
                        className="w-full sm:w-auto"
                      >
                        {isResetLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Reset Email
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setShowPasswordReset(false);
                          setResetEmail("");
                        }}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </CardContent>
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
          </TabsContent>

          {/* Settings Tab Content */}
          <TabsContent value="settings" className="space-y-6">
            
            {/* Reading Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-blue-600" />
                  Reading Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Font Size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Line Height: {lineHeight}
                  </label>
                  <input
                    type="range"
                    min="1.2"
                    max="2.0"
                    step="0.1"
                    value={lineHeight}
                    onChange={(e) => setLineHeight(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Show Verse Numbers</label>
                    <p className="text-xs text-gray-500">Display verse numbers when reading</p>
                  </div>
                  <Switch checked={showVerseNumbers} onCheckedChange={setShowVerseNumbers} />
                </div>
              </CardContent>
            </Card>

            {/* AI Chat Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-orange-600" />
                  AI Chat Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Default AI Mode</label>
                  <Select value={defaultAIMode} onValueChange={setDefaultAIMode}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aiModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Default Language</label>
                  <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* App Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  App Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                    <p className="text-xs text-gray-500">Receive daily verse and prayer reminders</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Dark Mode</label>
                    <p className="text-xs text-gray-500">Switch to dark theme</p>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Auto-Save</label>
                    <p className="text-xs text-gray-500">Automatically save your work</p>
                  </div>
                  <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                </div>

                <div className="pt-4 border-t">
                  <Button onClick={saveProfile} disabled={loading} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save All Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

          </TabsContent>
        </Tabs>
      </div>
    </div>
    </ModernLayout>
  );
};

export default Profile;