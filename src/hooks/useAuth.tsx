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
  ai_message_limit?: number;
  ai_sermon_limit?: number;
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
      // Add timeout wrapper
      const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 8000): Promise<T> => {
        return Promise.race([
          promise,
          new Promise<T>((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout. Please check your internet connection.')), timeoutMs)
          )
        ]);
      };

      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();
      
      const { data, error } = await withTimeout(profilePromise, 8000);
      
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
      // Don't throw - allow app to continue even if profile load fails
    }
  };

  // Create default profile for new user
  // IMPORTANT: This must be called AFTER session is fully established
  const createProfile = async (userId: string): Promise<{ success: boolean; error?: any }> => {
    try {
      // Verify we have an active session first (required for RLS)
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !currentSession) {
        console.error('❌ No active session when creating profile:', sessionError);
        return { 
          success: false, 
          error: new Error('No active session. Cannot create profile without authentication.') 
        };
      }

      if (currentSession.user.id !== userId) {
        console.error('❌ Session user ID mismatch:', {
          sessionUserId: currentSession.user.id,
          requestedUserId: userId
        });
        return { 
          success: false, 
          error: new Error('User ID mismatch. Session not established for this user.') 
        };
      }

      // Check if profile already exists first
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (existingProfile) {
        console.log('✅ Profile already exists, loading it...');
        setProfile(existingProfile as Profile);
        return { success: true };
      }

      // If check returned error other than "not found", log it
      if (checkError && checkError.code !== 'PGRST116') {
        console.warn('⚠️ Error checking for existing profile:', checkError);
      }

      // Get current user data for defaults
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !authUser) {
        console.error('❌ Error getting user data:', userError);
        return { 
          success: false, 
          error: new Error('Cannot get user data for profile creation.') 
        };
      }

      const displayName = 
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.user_metadata?.display_name ||
        authUser.email?.split('@')[0] ||
        'Bible Aura Member';

      const profileData = {
        user_id: userId,
        display_name: displayName,
        avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
        phone_number: null,
        age: null,
        denomination: null,
        agreed_to_terms: false,
        agreed_to_privacy: false,
        is_over_13: false,
        favorite_translation: 'ESV',
        reading_streak: 0,
        total_reading_days: 0,
        ai_message_limit: 50,
        ai_sermon_limit: 5,
      };

      console.log('🔐 Creating profile with session:', {
        userId,
        sessionUserId: currentSession.user.id,
        hasSession: !!currentSession,
        displayName
      });

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        // If profile already exists (duplicate key), just load it
        if (error.code === '23505') {
          console.log('Profile already exists (duplicate key), loading...');
          await loadUserProfile(userId);
          return { success: true };
        }
        
        console.error('❌ Error creating profile:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          userId,
          sessionUserId: currentSession.user.id,
          authUid: (await supabase.auth.getUser()).data.user?.id
        });
        
        return { success: false, error };
      }

      if (data) {
        setProfile(data as Profile);
        console.log('✅ Profile created successfully:', data.id);
        return { success: true };
      }

      return { success: false, error: new Error('Profile creation returned no data') };
    } catch (error) {
      console.error('❌ Error in createProfile:', error);
      return { success: false, error };
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

        // Get initial session from Supabase (reads from localStorage) - with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: any }, error: any }>((resolve) => 
          setTimeout(() => resolve({ data: { session: null }, error: { message: 'Timeout' } }), 5000)
        );
        
        const { data: { session: initialSession }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]);
        
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
          
          // Load profile (don't block on it)
          loadUserProfile(initialSession.user.id).catch(err => {
            console.error('Error loading profile on init:', err);
          });
        }
        
        if (isMounted) {
          setLoading(false);
        }

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!isMounted) return;
          
            console.log('Auth state change:', event);
          
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
      // Get the proper redirect URL - use Site URL from env if available, otherwise use current origin
      const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      const redirectUrl = `${siteUrl}/auth`;
      
      console.log('📧 OAuth redirect URL:', redirectUrl);
      
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

      // Get the proper redirect URL - use Site URL from env if available, otherwise use current origin
      const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      const redirectUrl = `${siteUrl}/auth`;
      
      console.log('🔐 Starting sign-up process for:', email.toLowerCase().trim());
      console.log('📧 Email redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          // Ensure we capture all email types
          data: {
            redirect_to: redirectUrl,
          },
        },
      });

      // Log detailed error information for debugging
      if (error) {
        console.error('❌ Sign up error details:', {
          message: error.message,
          status: (error as any).status,
          code: (error as any).code,
          hasUserData: !!data?.user,
          userId: data?.user?.id,
          email: email.toLowerCase().trim()
        });
      }

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
          'user already exists',
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
            error.message?.includes('error saving new user') ||
            error.message?.includes('saving new user')) {
          
          // Even if there's an error, check if user was created
      if (data?.user) {
            // User was created, just profile creation had an issue
            console.log('✅ User created despite error, waiting for session then creating profile...');
            
            // Wait for session to be fully established
          let retries = 0;
          const maxRetries = 5;
            let sessionEstablished = false;
          
            while (!sessionEstablished && retries < maxRetries) {
              const { data: { session: currentSession } } = await supabase.auth.getSession();
              
              if (currentSession && currentSession.user.id === data.user.id) {
                sessionEstablished = true;
                setSession(currentSession);
                setUser(currentSession.user);
                
                // Now create profile with established session
                const profileResult = await createProfile(data.user.id);
                if (!profileResult.success) {
                  console.error('❌ Profile creation failed:', profileResult.error);
                  toast({
                    title: "Account created!",
                    description: "Your account was created. Profile setup had an issue but you can sign in and complete it later.",
                  });
                } else {
                  toast({
                    title: "Account created!",
                    description: "Your account has been created successfully. You can now sign in.",
                  });
                }
                
                return { error: null };
              }
              
              // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 300));
            retries++;
          }
          
            if (!sessionEstablished) {
              console.error('❌ Session not established after retries');
              toast({
                title: "Account created!",
                description: "Your account was created. Please sign in to complete setup.",
              });
              return { error: null }; // Don't fail sign-up if session takes time
            }
          }
          
          // No user data - check if user exists anyway by trying to sign in
          console.log('⚠️ Error occurred but no user data. Checking if user exists...');
          
          // Try a quick check: attempt to get the user
          try {
            const { data: existingUser } = await supabase.auth.getUser();
            if (existingUser?.user && existingUser.user.email === email.toLowerCase().trim()) {
              // User exists! Sign them in
              console.log('✅ User exists, signing in...');
              const signInResult = await signIn(email, password);
              return signInResult;
            }
          } catch (checkError) {
            console.error('Error checking existing user:', checkError);
          }
          
          // Generic error message
          message = 'Unable to create account. Please check your internet connection and try again. If the problem persists, try signing in instead.';
        } else if (error.message?.includes('weak password') || error.message?.includes('Password')) {
          message = 'Please choose a stronger password with at least 8 characters.';
        } else if (error.message?.includes('invalid email') || error.message?.includes('Email')) {
          message = 'Please enter a valid email address.';
        } else if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
          message = 'Unable to create account due to permissions. Please try again or contact support.';
        } else if (error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
          message = 'Network error. Please check your internet connection and try again.';
        } else if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
          message = 'Too many sign-up attempts. Please wait a few minutes before trying again.';
        } else {
          // Generic error with more helpful message
          message = `Unable to create account: ${error.message || 'Unknown error'}. Please try again or contact support if the problem persists.`;
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
          console.log('✅ User created with session, establishing session then creating profile...');
          
          // Set session first
          setSession(data.session);
          setUser(data.user);
          
          // Wait a brief moment to ensure session is fully propagated
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Verify session is established
          const { data: { session: verifiedSession } } = await supabase.auth.getSession();
          if (!verifiedSession || verifiedSession.user.id !== data.user.id) {
            console.error('❌ Session verification failed:', {
              hasVerifiedSession: !!verifiedSession,
              verifiedUserId: verifiedSession?.user.id,
              expectedUserId: data.user.id
            });
            
            // Retry once
            await new Promise(resolve => setTimeout(resolve, 500));
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (!retrySession || retrySession.user.id !== data.user.id) {
              toast({
                title: "Account created!",
                description: "Your account was created. Please refresh and sign in to complete setup.",
              });
              return { error: null };
            }
          }
          
          // Create profile with verified session
          const profileResult = await createProfile(data.user.id);
          
          if (!profileResult.success) {
            console.error('❌ Profile creation failed:', profileResult.error);
            toast({
              title: "Account created!",
              description: "Your account was created. Profile setup had an issue but you can complete it after signing in.",
            });
          } else {
            toast({
              title: "Welcome to Bible Aura!",
              description: "Account created successfully! You can now start exploring.",
            });
          }
        } else {
          // Email confirmation required
          console.log('⚠️ Email confirmation required - user created but no session');
          console.log('📧 User data:', {
            id: data.user.id,
            email: data.user.email,
            email_confirmed: data.user.email_confirmed_at !== null,
            confirmation_sent_at: data.user.confirmation_sent_at,
          });
          
          // Check if email was actually sent
          if (data.user.confirmation_sent_at) {
        toast({
          title: "Check your email!",
              description: "We've sent you a confirmation link. Please check your inbox (and spam folder) and click the link to activate your account. The link may take a few minutes to arrive.",
              duration: 8000,
        });
          } else {
        toast({
              title: "Account created!",
              description: "Your account was created. If email confirmation is enabled, please check your email. You may also try signing in directly.",
              duration: 8000,
        });
          }
          
          // Don't try to create profile here - wait for email confirmation
          // Profile will be created when user signs in after confirmation
        }
      }
      
      return { error: null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      console.error('❌ Sign-up exception:', error);
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

  // Update profile - handles both insert and update efficiently
  const updateProfile = async (updates: Partial<Profile>): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      // Add timeout wrapper for Supabase queries
      const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
        return Promise.race([
          promise,
          new Promise<T>((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout. Please check your internet connection.')), timeoutMs)
          )
        ]);
      };

      // First check if profile exists (with timeout)
      const checkProfilePromise = supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .single();
      
      const { data: existingProfile } = await withTimeout(checkProfilePromise, 8000);

      const profileData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (existingProfile) {
        // Update existing profile (with timeout)
        const updatePromise = supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', user.id)
          .is('deleted_at', null);
        
        ({ error } = await withTimeout(updatePromise, 8000));
      } else {
        // Insert new profile if doesn't exist (with timeout)
        const insertPromise = supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            ...profileData,
          });
        
        ({ error } = await withTimeout(insertPromise, 8000));
      }

      if (error) {
        toast({
          title: "Update failed",
          description: error.message || "Network error. Please check your connection.",
          variant: "destructive",
        });
        return { error };
      }

      // Reload profile (with timeout, but don't block on it)
      loadUserProfile(user.id).catch(err => {
        console.error('Error reloading profile after update:', err);
        // Don't show error toast - update was successful
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      return { error: null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Network error. Please check your connection.';
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
      return { error: error instanceof Error ? error : new Error(message) };
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

      // Get the proper redirect URL - use Site URL from env if available, otherwise use current origin
      const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      const redirectUrl = `${siteUrl}/auth?tab=reset`;
      
      console.log('📧 Password reset email redirect URL:', redirectUrl);
      
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
