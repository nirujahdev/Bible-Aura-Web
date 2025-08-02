import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  reading_streak: number;
  total_reading_days: number;
  favorite_translation: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    let subscription: any;
    
    // Faster loading timeout
    const loadingTimeout = setTimeout(() => {
      if (isMounted && !initialized) {
        console.log('Auth loading timeout, setting loading to false');
        setLoading(false);
        setInitialized(true);
      }
    }, 1500);

    const initializeAuth = async () => {
      try {
        if (typeof window === 'undefined') {
          console.log('Server-side render, skipping auth initialization');
          if (isMounted) {
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        // Check for URL-based auth first (magic links, OAuth callbacks)
        const urlHash = window.location.hash;
        const urlSearch = window.location.search;
        const hasAuthParams = urlHash.includes('access_token') || 
                             urlHash.includes('refresh_token') ||
                             urlSearch.includes('token_hash') ||
                             urlSearch.includes('type=');

        if (hasAuthParams) {
          console.log('Auth parameters detected in URL, waiting for Supabase to process...');
          // Wait a bit longer for URL-based auth to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Get current session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 4000)
        );

        const { data: { session }, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (isMounted) {
            clearTimeout(loadingTimeout);
            setLoading(false);
            setInitialized(true);
            setSession(null);
            setUser(null);
            setProfile(null);
          }
          return;
        }

        if (isMounted) {
          clearTimeout(loadingTimeout);
          console.log('Session found:', !!session);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Fetch profile asynchronously
            fetchUserProfile(session.user.id).catch(error => {
              console.error('Profile fetch error:', error);
            });
          } else {
            setProfile(null);
          }
          
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          clearTimeout(loadingTimeout);
          setLoading(false);
          setInitialized(true);
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      }
    };

    // Set up auth state listener with enhanced error handling
    try {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!isMounted) return;
          
          console.log('Auth state change:', event, !!session);
          
          try {
            clearTimeout(loadingTimeout);
            
            // Handle different auth events
            if (event === 'SIGNED_IN') {
              console.log('User signed in successfully');
              setSession(session);
              setUser(session?.user ?? null);
              
              if (session?.user) {
                fetchUserProfile(session.user.id).catch(error => {
                  console.error('Profile fetch error in sign in:', error);
                });
              }
            } else if (event === 'SIGNED_OUT') {
              console.log('User signed out');
              setSession(null);
              setUser(null);
              setProfile(null);
            } else if (event === 'TOKEN_REFRESHED') {
              console.log('Token refreshed');
              setSession(session);
              setUser(session?.user ?? null);
            } else {
              // Handle other events
              setSession(session);
              setUser(session?.user ?? null);
              
              if (session?.user && !profile) {
                fetchUserProfile(session.user.id).catch(error => {
                  console.error('Profile fetch error in auth state change:', error);
                });
              } else if (!session) {
                setProfile(null);
              }
            }
            
            if (!initialized) {
              setLoading(false);
              setInitialized(true);
            }
          } catch (error) {
            console.error('Auth state change error:', error);
            if (!initialized) {
              setLoading(false);
              setInitialized(true);
            }
          }
        }
      );
      subscription = authSubscription;
    } catch (error) {
      console.error('Auth listener setup error:', error);
      if (isMounted) {
        clearTimeout(loadingTimeout);
        setLoading(false);
        setInitialized(true);
      }
    }

    // Initialize auth
    initializeAuth();

    return () => {
      isMounted = false;
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from auth:', error);
        }
      }
      clearTimeout(loadingTimeout);
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      if (!userId || typeof window === 'undefined') {
        return;
      }

      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 6000)
      );

      const { data, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        console.log('Profile fetched successfully');
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        let userFriendlyMessage = error.message;
        let showResetOption = false;
        
        // Provide more user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          userFriendlyMessage = 'Invalid email or password. Please check your credentials and try again.';
          showResetOption = true;
        } else if (error.message.includes('Email not confirmed')) {
          userFriendlyMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Too many requests')) {
          userFriendlyMessage = 'Too many attempts. Please wait a few minutes before trying again.';
        } else if (error.message.includes('wrong password') || error.message.includes('incorrect password')) {
          userFriendlyMessage = 'Incorrect password. Would you like to reset your password?';
          showResetOption = true;
        }

        toast({
          title: "Sign in failed",
          description: userFriendlyMessage + (showResetOption ? ' Click "Forgot Password?" to reset it.' : ''),
          variant: "destructive",
        });
        
        return { error: new Error(userFriendlyMessage) };
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to your account.",
        });
        return { error: null };
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      if (!email) {
        throw new Error('Email address is required');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      const redirectUrl = `${window.location.origin}/auth`;
      
      const { error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: true,
        },
      });

      if (error) {
        let userFriendlyMessage = error.message;
        
        if (error.message.includes('rate limit')) {
          userFriendlyMessage = 'Too many magic link requests. Please wait a few minutes before trying again.';
        } else if (error.message.includes('invalid email')) {
          userFriendlyMessage = 'Please enter a valid email address.';
        }

        toast({
          title: "Magic link failed",
          description: userFriendlyMessage,
          variant: "destructive",
        });
        
        return { error: new Error(userFriendlyMessage) };
      } else {
        toast({
          title: "Check your email!",
          description: "We've sent you a magic link to sign in. The link will expire in 10 minutes.",
        });
        return { error: null };
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      toast({
        title: "Magic link failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Check if Google OAuth is properly configured
      const redirectUrl = `${window.location.origin}/auth`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google OAuth error:', error);
        
        let userFriendlyMessage = 'Google sign-in is currently unavailable. Please try email/password or magic link instead.';
        
        if (error.message.includes('not configured')) {
          userFriendlyMessage = 'Google sign-in is not properly configured. Please contact support or use email authentication.';
        } else if (error.message.includes('unauthorized')) {
          userFriendlyMessage = 'Google authentication is not authorized for this domain. Please use email authentication instead.';
        }

        toast({
          title: "Google sign-in unavailable",
          description: userFriendlyMessage,
          variant: "destructive",
        });
        
        return { error: new Error(userFriendlyMessage) };
      } else {
        toast({
          title: "Redirecting to Google",
          description: "Please complete authentication with Google in the popup window.",
        });
        return { error: null };
      }
    } catch (error: unknown) {
      console.error('Google sign-in error:', error);
      const errorMessage = 'Unable to connect to Google. Please try email/password authentication instead.';
      
      toast({
        title: "Authentication error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { error: new Error(errorMessage) };
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true);
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const redirectUrl = `${window.location.origin}/auth`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName?.trim() || null,
          },
        },
      });

      if (error) {
        let userFriendlyMessage = error.message;
        
        if (error.message.includes('already registered')) {
          userFriendlyMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (error.message.includes('weak password')) {
          userFriendlyMessage = 'Please choose a stronger password with at least 6 characters.';
        } else if (error.message.includes('invalid email')) {
          userFriendlyMessage = 'Please enter a valid email address.';
        }

        toast({
          title: "Sign up failed",
          description: userFriendlyMessage,
          variant: "destructive",
        });
        
        return { error: new Error(userFriendlyMessage) };
      } else {
        // Check if email confirmation is required
        if (data.user && !data.session) {
          toast({
            title: "Check your email!",
            description: "We've sent you a confirmation link. Please check your email and click the link to activate your account.",
          });
        } else {
          toast({
            title: "Welcome to Bible Aura!",
            description: "Account created successfully! You can now start exploring.",
          });
        }
        
        return { error: null };
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear local state immediately
      setSession(null);
      setUser(null);
      setProfile(null);
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out error",
        description: "There was an issue signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      } else {
        // Refresh profile data
        await fetchUserProfile(user.id);
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
        return { error: null };
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (!email) {
        throw new Error('Email address is required');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      const redirectUrl = `${window.location.origin}/auth?tab=reset`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        let userFriendlyMessage = error.message;
        
        if (error.message.includes('rate limit')) {
          userFriendlyMessage = 'Too many password reset requests. Please wait a few minutes before trying again.';
        } else if (error.message.includes('user not found')) {
          userFriendlyMessage = 'No account found with this email address. Please check your email or sign up for a new account.';
        } else if (error.message.includes('invalid email')) {
          userFriendlyMessage = 'Please enter a valid email address.';
        }

        toast({
          title: "Password reset failed",
          description: userFriendlyMessage,
          variant: "destructive",
        });
        
        return { error: new Error(userFriendlyMessage) };
      } else {
        toast({
          title: "Password reset email sent!",
          description: "Please check your email and click the link to reset your password. The link will expire in 1 hour.",
        });
        return { error: null };
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      toast({
        title: "Password reset failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      if (!user) {
        throw new Error('You must be logged in to update your password');
      }

      if (!newPassword) {
        throw new Error('New password is required');
      }

      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        let userFriendlyMessage = error.message;
        
        if (error.message.includes('weak password')) {
          userFriendlyMessage = 'Please choose a stronger password with at least 6 characters.';
        } else if (error.message.includes('same password')) {
          userFriendlyMessage = 'Please choose a different password from your current one.';
        }

        toast({
          title: "Password update failed",
          description: userFriendlyMessage,
          variant: "destructive",
        });
        
        return { error: new Error(userFriendlyMessage) };
      } else {
        toast({
          title: "Password updated successfully!",
          description: "Your password has been changed. Please use your new password for future sign-ins.",
        });
        return { error: null };
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      toast({
        title: "Password update failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signIn,
    signInWithMagicLink,
    signInWithGoogle,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}