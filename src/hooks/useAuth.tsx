import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, hasSupabaseCredentials } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone_number?: string | null;
  age?: number | null;
  denomination?: string | null;
  agreed_to_terms?: boolean;
  agreed_to_privacy?: boolean;
  is_over_13?: boolean;
  reading_streak: number;
  total_reading_days: number;
  favorite_translation: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  deleteProfile: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load user profile from database
  const loadUserProfile = async (userId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist - create it
          await createProfile(userId);
        } else {
          console.error('Error loading profile:', error);
        }
        return;
      }

      if (data) {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };

  // Create default profile for new user
  const createProfile = async (userId: string): Promise<void> => {
    try {
      // Get current user data for defaults
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      const displayName = 
        authUser?.user_metadata?.full_name ||
        authUser?.user_metadata?.name ||
        authUser?.user_metadata?.display_name ||
        authUser?.email?.split('@')[0] ||
        'Bible Aura Member';

      const profileData = {
        user_id: userId,
        display_name: displayName,
        avatar_url: authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture || null,
        phone_number: null,
        age: null,
        denomination: null,
        agreed_to_terms: false,
        agreed_to_privacy: false,
        is_over_13: false,
        favorite_translation: 'ESV',
        reading_streak: 0,
        total_reading_days: 0,
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        // If profile already exists (duplicate key), just load it
        if (error.code === '23505') {
          await loadUserProfile(userId);
          return;
        }
        console.error('Error creating profile:', error);
        return;
      }

      if (data) {
        setProfile(data as Profile);
        console.log('✅ Profile created successfully');
      }
    } catch (error) {
      console.error('Error in createProfile:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    let authSubscription: any;

    const initializeAuth = async () => {
      try {
        if (!hasSupabaseCredentials) {
          console.warn('⚠️ Supabase credentials not configured');
          if (isMounted) {
            setLoading(false);
          }
          return;
        }

        // Get initial session from Supabase (reads from localStorage)
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          if (isMounted) {
            setLoading(false);
          }
          return;
        }

        if (initialSession && isMounted) {
          setSession(initialSession);
          setUser(initialSession.user);
          
          // Load profile
          await loadUserProfile(initialSession.user.id);
        }

        if (isMounted) {
          setLoading(false);
        }

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMounted) return;

            console.log('Auth state changed:', event);

            if (event === 'SIGNED_IN' && session) {
              setSession(session);
              setUser(session.user);
              
              // Ensure profile exists
              await loadUserProfile(session.user.id);
            } else if (event === 'SIGNED_OUT') {
              setSession(null);
              setUser(null);
              setProfile(null);
            } else if (event === 'TOKEN_REFRESHED' && session) {
              setSession(session);
              setUser(session.user);
            } else if (event === 'USER_UPDATED' && session) {
              setSession(session);
              setUser(session.user);
              
              if (session.user) {
                await loadUserProfile(session.user.id);
              }
            }
          }
        );

        authSubscription = subscription;
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      if (!email || !password) {
        const errorMsg = 'Email and password are required';
        toast({
          title: "Sign in failed",
          description: errorMsg,
          variant: "destructive",
        });
        return { error: new Error(errorMsg) };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        let message = error.message;
        
        if (error.message.includes('Invalid login credentials')) {
          message = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          message = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Too many requests')) {
          message = 'Too many attempts. Please wait a few minutes before trying again.';
        }

        toast({
          title: "Sign in failed",
          description: message,
          variant: "destructive",
        });
        
        return { error: new Error(message) };
      }

      if (data?.session && data?.user) {
        setSession(data.session);
        setUser(data.user);
        await loadUserProfile(data.user.id);

        toast({
          title: "Welcome back!",
          description: "Successfully signed in to your account.",
        });
      }

      return { error: null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      toast({
        title: "Sign in failed",
        description: message,
        variant: "destructive",
      });
      return { error: new Error(message) };
    }
  };

  // Magic link sign-in (kept for interface compatibility, but returns error)
  const signInWithMagicLink = async (email: string): Promise<{ error: Error | null }> => {
    toast({
      title: "Not available",
      description: "Magic link sign-in is not available. Please use email/password or Google sign-in.",
      variant: "destructive",
    });
    return { error: new Error('Magic link sign-in is not available') };
  };

  // Sign in with Google OAuth
  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    try {
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
        let message = 'Google sign-in is currently unavailable. Please try email/password instead.';
        
        if (error.message?.includes('not configured') || error.message?.includes('not enabled')) {
          message = 'Google sign-in is not properly configured. Please contact support or use email authentication.';
        } else if (error.message?.includes('popup') || error.message?.includes('blocked')) {
          message = 'Popup was blocked. Please allow popups for this site and try again.';
        }

        toast({
          title: "Google sign-in unavailable",
          description: message,
          variant: "destructive",
        });
        
        return { error: new Error(message) };
      }

      // OAuth redirect will happen automatically
      toast({
        title: "Redirecting to Google",
        description: "Please complete authentication with Google.",
      });
      
      return { error: null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to connect to Google. Please try email/password authentication instead.';
      
      toast({
        title: "Authentication error",
        description: message,
        variant: "destructive",
      });
      
      return { error: new Error(message) };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      if (!email || !password) {
        const errorMsg = 'Email and password are required';
        toast({
          title: "Sign up failed",
          description: errorMsg,
          variant: "destructive",
        });
        return { error: new Error(errorMsg) };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        const errorMsg = 'Please enter a valid email address';
        toast({
          title: "Sign up failed",
          description: errorMsg,
          variant: "destructive",
        });
        return { error: new Error(errorMsg) };
      }

      if (password.length < 8) {
        const errorMsg = 'Password must be at least 8 characters long';
        toast({
          title: "Sign up failed",
          description: errorMsg,
          variant: "destructive",
        });
        return { error: new Error(errorMsg) };
      }

      const redirectUrl = `${window.location.origin}/auth`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        let message = error.message;
        let isEmailExists = false;

        // Check if email already exists
        const emailExistsPatterns = [
          'already registered',
          'already exists',
          'User already registered',
          'email already registered',
          'Email address already registered',
          'User with this email address has already been registered',
          'duplicate key value',
          'violates unique constraint',
        ];

        const lowerMsg = error.message?.toLowerCase() || '';
        isEmailExists = emailExistsPatterns.some(pattern => 
          lowerMsg.includes(pattern.toLowerCase())
        ) || (error as any).status === 422;

        if (isEmailExists) {
          message = 'An account with this email already exists. Please sign in instead.';
          toast({
            title: "Sign up failed",
            description: message,
            variant: "destructive",
          });
          return { error: new Error(message) };
        }

        // Handle database errors (user might be created)
        if (error.message?.includes('Database error saving new user') || 
            error.message?.includes('error saving new user')) {
          if (data?.user) {
            // User was created, just profile creation had an issue
            await createProfile(data.user.id);
            toast({
              title: "Account created!",
              description: "Your account has been created. Setting up your profile...",
            });
            return { error: null };
          }
          message = 'Sign up encountered an error. If your account was created, please try signing in. Otherwise, please try again.';
        } else if (error.message?.includes('weak password')) {
          message = 'Please choose a stronger password with at least 8 characters.';
        } else if (error.message?.includes('invalid email')) {
          message = 'Please enter a valid email address.';
        } else if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
          message = 'Unable to create account. Please try again or contact support.';
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
          message = 'Network error. Please check your connection and try again.';
        }

        toast({
          title: "Sign up failed",
          description: message,
          variant: "destructive",
        });
        return { error: new Error(message) };
      }

      // Success - user was created
      if (data?.user) {
        if (data.session) {
          // Session available immediately (no email confirmation required)
          setSession(data.session);
          setUser(data.user);
          
          // Create profile immediately
          await createProfile(data.user.id);
          
          toast({
            title: "Welcome to Bible Aura!",
            description: "Account created successfully! You can now start exploring.",
          });
        } else {
          // Email confirmation required
          toast({
            title: "Check your email!",
            description: "We've sent you a confirmation link. Please check your email and click the link to activate your account.",
          });
          
          // Try to create profile anyway (will complete after email confirmation)
          if (data.user.id) {
            await createProfile(data.user.id);
          }
        }
      }

      return { error: null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      toast({
        title: "Sign up failed",
        description: message,
        variant: "destructive",
      });
      return { error: new Error(message) };
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      setUser(null);
      setSession(null);
      setProfile(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        toast({
          title: "Sign out failed",
          description: "There was an issue signing you out. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<Profile>): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .is('deleted_at', null);

      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      await loadUserProfile(user.id);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      return { error: null };
    } catch (error: unknown) {
      const message = (error as Error).message;
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  // Delete profile (soft delete)
  const deleteProfile = async (): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Delete failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      setProfile(null);
      localStorage.removeItem(`profile_modal_seen_${user.id}`);
      
      toast({
        title: "Profile deleted",
        description: "Your profile has been deleted. You can create a new one anytime.",
      });
      return { error: null };
    } catch (error: unknown) {
      const message = (error as Error).message;
      toast({
        title: "Delete failed",
        description: message,
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
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
        let message = error.message;
        
        if (error.message.includes('rate limit')) {
          message = 'Too many password reset requests. Please wait a few minutes before trying again.';
        } else if (error.message.includes('user not found')) {
          message = 'No account found with this email address. Please check your email or sign up for a new account.';
        } else if (error.message.includes('invalid email')) {
          message = 'Please enter a valid email address.';
        }

        toast({
          title: "Password reset failed",
          description: message,
          variant: "destructive",
        });
        
        return { error: new Error(message) };
      }

      toast({
        title: "Password reset email sent!",
        description: "Please check your email and click the link to reset your password. The link will expire in 1 hour.",
      });
      return { error: null };
    } catch (error: unknown) {
      const message = (error as Error).message;
      toast({
        title: "Password reset failed",
        description: message,
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  // Update password
  const updatePassword = async (newPassword: string): Promise<{ error: Error | null }> => {
    try {
      if (!user) {
        throw new Error('You must be logged in to update your password');
      }

      if (!newPassword) {
        throw new Error('New password is required');
      }

      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        let message = error.message;
        
        if (error.message.includes('weak password')) {
          message = 'Please choose a stronger password with at least 8 characters.';
        } else if (error.message.includes('same password')) {
          message = 'Please choose a different password from your current one.';
        }

        toast({
          title: "Password update failed",
          description: message,
          variant: "destructive",
        });
        
        return { error: new Error(message) };
      }

      toast({
        title: "Password updated successfully!",
        description: "Your password has been changed. Please use your new password for future sign-ins.",
      });
      return { error: null };
    } catch (error: unknown) {
      const message = (error as Error).message;
      toast({
        title: "Password update failed",
        description: message,
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
    deleteProfile,
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
