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
import { 
  User, Edit3, BookOpen, Heart, 
  Calendar, Award, Target, TrendingUp, Save, Star,
  Shield, Mail, Lock, Eye, EyeOff, Settings, Type, 
  Languages, Bot, LogOut,
  Trash2, AlertTriangle
} from "lucide-react";
import { MobileOptimizedLayout } from "@/components/MobileOptimizedLayout";

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
  totalSermons: number;
  totalBookmarks: number;
  totalFavorites: number;
  totalConversations: number;
  totalHighlights: number;
}

const Profile = () => {
  const { user, profile: authProfile, resetPassword, deleteProfile, updatePassword, signOut } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalSermons: 0,
    totalBookmarks: 0,
    totalFavorites: 0,
    totalConversations: 0,
    totalHighlights: 0
  });


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
  
  // Update password states
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatePasswordLoading, setIsUpdatePasswordLoading] = useState(false);
  
  // Delete account states
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  // App Settings states
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [showVerseNumbers, setShowVerseNumbers] = useState(true);
  const [defaultAIMode, setDefaultAIMode] = useState("chat");
  const [defaultLanguage, setDefaultLanguage] = useState("english");
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
      
      // Set up real-time subscription for profile updates
      const profileSubscription = supabase
        .channel('profile-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Profile change detected:', payload);
            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              setProfile(payload.new as UserProfile);
            } else if (payload.eventType === 'DELETE') {
              setProfile(null);
            }
          }
        )
        .subscribe();

      // Set up real-time subscription for stats updates
      const statsChannels = [
        supabase
          .channel('bookmark-stats')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_bible_bookmarks',
              filter: `user_id=eq.${user.id}`
            },
            () => {
              loadStats(); // Reload stats when bookmarks change
            }
          )
          .subscribe(),
        supabase
          .channel('favorite-stats')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_bible_favorites',
              filter: `user_id=eq.${user.id}`
            },
            () => {
              loadStats(); // Reload stats when favorites change
            }
          )
          .subscribe(),
        supabase
          .channel('conversation-stats')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'ai_conversations',
              filter: `user_id=eq.${user.id}`
            },
            () => {
              loadStats(); // Reload stats when conversations change
            }
          )
          .subscribe(),
        supabase
          .channel('sermon-stats')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'sermons',
              filter: `user_id=eq.${user.id}`
            },
            () => {
              loadStats(); // Reload stats when sermons change
            }
          )
          .subscribe(),
      ];

      return () => {
        profileSubscription.unsubscribe();
        statsChannels.forEach(channel => channel.unsubscribe());
      };
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null) // Only get non-deleted profiles
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
        sermonsResponse,
        bookmarksResponse,
        favoritesResponse,
        conversationsResponse,
        highlightsResponse
      ] = await Promise.all([
        supabase.from('sermons').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('user_bible_bookmarks').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('user_bible_favorites').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('ai_conversations').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('verse_highlights').select('id', { count: 'exact' }).eq('user_id', user.id)
      ]);

      setStats({
        totalSermons: sermonsResponse.count || 0,
        totalBookmarks: bookmarksResponse.count || 0,
        totalFavorites: favoritesResponse.count || 0,
        totalConversations: conversationsResponse.count || 0,
        totalHighlights: highlightsResponse.count || 0
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
          .eq('user_id', user.id)
          .is('deleted_at', null); // Only update non-deleted profiles
        
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

  // Update password function (change password when logged in)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatePasswordLoading(true);

    try {
      const result = await updatePassword(newPassword);
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Password Updated",
          description: "Your password has been successfully updated",
        });
        setShowUpdatePassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error('Update password error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatePasswordLoading(false);
    }
  };

  // Delete account function
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast({
        title: "Error",
        description: "Please type 'DELETE' to confirm account deletion",
        variant: "destructive"
      });
      return;
    }

    setIsDeleteLoading(true);

    try {
      const result = await deleteProfile();
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Account Deleted",
          description: "Your account has been deleted. You will be signed out.",
        });
        
        // Sign out after a short delay
        setTimeout(async () => {
          await signOut();
          window.location.href = '/auth';
        }, 2000);
      }
    } catch (error) {
      console.error('Delete account error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
    <MobileOptimizedLayout>
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 w-full ${isMobile ? 'mobile-safe-area' : ''}`}>
        <div className={isMobile ? "p-3 sm:p-6" : "p-6"}>
          <div className={`flex items-center gap-4 mb-6 ${isMobile ? 'flex-col text-center sm:flex-row sm:text-left' : ''}`}>
            <div className={`p-3 bg-orange-500 rounded-xl ${isMobile ? 'mx-auto sm:mx-0' : ''}`}>
              <User className="h-8 w-8 text-white" />
            </div>
            <div className={isMobile ? 'text-center sm:text-left flex-1' : 'flex-1'}>
              <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-xl sm:text-2xl' : 'text-2xl'}`}>Profile & Settings</h1>
              <p className={`text-gray-600 ${isMobile ? 'text-sm sm:text-base' : ''}`}>Manage your account, preferences, and spiritual settings</p>
            </div>
            <Button 
              variant="destructive" 
              onClick={async () => {
                await signOut();
                window.location.href = '/auth';
              }}
              className={`${isMobile ? 'w-full sm:w-auto' : ''}`}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
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

              {/* Update Password Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Change Password</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Update your password while logged in
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowUpdatePassword(!showUpdatePassword)}
                  className="w-full sm:w-auto"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>

              {showUpdatePassword && (
                <div className="p-3 sm:p-4 border rounded-lg bg-green-50 border-green-200">
                  <form onSubmit={handleUpdatePassword} className="space-y-3">
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password (min 8 characters)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        type="submit" 
                        disabled={isUpdatePasswordLoading}
                        className="w-full sm:w-auto"
                      >
                        {isUpdatePasswordLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Update Password
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setShowUpdatePassword(false);
                          setNewPassword("");
                          setConfirmPassword("");
                        }}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Delete Account Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-sm sm:text-base text-red-900">Delete Account</p>
                    <p className="text-xs sm:text-sm text-red-700">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteAccount(!showDeleteAccount)}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>

              {showDeleteAccount && (
                <div className="p-3 sm:p-4 border rounded-lg bg-red-50 border-red-300">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-900 mb-2">Warning: This action cannot be undone</h4>
                        <p className="text-sm text-red-800 mb-4">
                          Deleting your account will:
                        </p>
                        <ul className="text-sm text-red-700 space-y-1 mb-4 list-disc list-inside">
                          <li>Remove your profile and all personal information</li>
                          <li>Delete all your bookmarks, favorites, and highlights</li>
                          <li>Remove all your AI conversations and sermons</li>
                          <li>Sign you out immediately</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2 text-red-900">
                        Type <span className="font-bold">DELETE</span> to confirm:
                      </label>
                      <Input
                        type="text"
                        placeholder="Type DELETE to confirm"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="w-full border-red-300"
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isDeleteLoading || deleteConfirmText !== "DELETE"}
                        className="w-full sm:w-auto"
                      >
                        {isDeleteLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete My Account
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setShowDeleteAccount(false);
                          setDeleteConfirmText("");
                        }}
                        className="w-full sm:w-auto border-red-300 text-red-700 hover:bg-red-100"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
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
                <BookOpen className="h-4 w-4 text-blue-500" />
                Study & Growth
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Bookmarks</span>
                <span className="text-xs sm:text-sm font-medium">{stats.totalBookmarks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Favorites</span>
                <span className="text-xs sm:text-sm font-medium">{stats.totalFavorites}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Highlights</span>
                <span className="text-xs sm:text-sm font-medium">{stats.totalHighlights}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Bot className="h-4 w-4 text-purple-500" />
                AI & Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">AI Conversations</span>
                <span className="text-xs sm:text-sm font-medium">{stats.totalConversations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Sermons Created</span>
                <span className="text-xs sm:text-sm font-medium">{stats.totalSermons}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Reading Streak</span>
                <span className="text-xs sm:text-sm font-medium">{profile?.reading_streak || 0} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Total Reading Days</span>
                <span className="text-xs sm:text-sm font-medium">{profile?.total_reading_days || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

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
            
            <div className="pt-4">
              <Button onClick={saveProfile} disabled={loading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save All Settings
              </Button>
            </div>

          </TabsContent>
        </Tabs>
      </div>
    </div>
    </MobileOptimizedLayout>
  );
};

export default Profile;