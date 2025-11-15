import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, hasSupabaseCredentials } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getCachedSession, setCachedSession, clearCachedSession, shouldUseCachedSession, isSessionValid } from '@/lib/auth-cache';

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
  signUp: (email: string, password: string, userData?: {
    displayName?: string;
    phoneNumber?: string;
    age?: number;
    denomination?: string | null;
    agreedToTerms?: boolean;
    agreedToPrivacy?: boolean;
    isOver13?: boolean;
  }) => Promise<{ error: Error | null }>;
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
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  // Helper function to check if profile exists (including soft-deleted)
  const checkProfileExists = async (userId: string): Promise<{ exists: boolean; isDeleted: boolean }> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, deleted_at')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" which is fine
        console.error('Error checking profile existence:', error);
        return { exists: false, isDeleted: false };
      }
      
      if (!data) {
        return { exists: false, isDeleted: false };
      }
      
      return { 
        exists: true, 
        isDeleted: data.deleted_at !== null 
      };
    } catch (error) {
      console.error('Error in checkProfileExists:', error);
      return { exists: false, isDeleted: false };
    }
  };

  const createDefaultProfile = async (userId: string): Promise<{ success: boolean; error?: any }> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const authUser = userData?.user;

      // Check if profile exists (including soft-deleted)
      const { exists, isDeleted } = await checkProfileExists(userId);
      
      if (exists && !isDeleted) {
        // Profile exists and is not deleted, just load it
        await loadUserProfile(userId);
        return { success: true };
      }
      
      // If profile is soft-deleted, try to restore it first
      if (exists && isDeleted) {
        // Wait briefly for trigger to potentially restore it
        await new Promise(resolve => setTimeout(resolve, 300));
        const { exists: existsAfterWait, isDeleted: isDeletedAfterWait } = await checkProfileExists(userId);
        if (existsAfterWait && !isDeletedAfterWait) {
          await loadUserProfile(userId);
          return { success: true };
        }
      }

      const fallbackName =
        authUser?.user_metadata?.full_name ||
        authUser?.user_metadata?.name ||
        authUser?.user_metadata?.display_name ||
        authUser?.email?.split('@')[0] ||
        'Bible Aura Member';

      // For email/password sign-ups, trigger won't create profile
      // So we create it immediately without waiting
      // Only wait briefly if this might be an OAuth user (but we should know from context)
      
      // Quick check if trigger created it (for OAuth users)
      await new Promise(resolve => setTimeout(resolve, 200)); // Very brief wait
      const { exists: existsAfterWait } = await checkProfileExists(userId);
      if (existsAfterWait) {
        await loadUserProfile(userId);
        return { success: true };
      }

      // Create profile immediately (don't wait for trigger that may not exist)
      const profilePayload = {
        user_id: userId,
        display_name: fallbackName,
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

      // Use upsert with conflict handling - trigger might have created it
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        // If it's a unique constraint violation, profile was likely created by trigger
        if (error.code === '23505' || error.message?.includes('duplicate key')) {
          console.log('Profile already exists (likely created by trigger), loading it...');
          await loadUserProfile(userId);
          return { success: true };
        }
        
        console.error('❌ Error creating default profile:', error);
        
        // More detailed error logging
        if (error.code === 'PGRST301' || error.message?.includes('permission denied') || error.message?.includes('RLS')) {
          console.error('RLS policy blocking profile creation. Check RLS policies.');
          return { success: false, error: new Error('Permission denied: Unable to create profile. Please contact support.') };
        } else if (error.message?.includes('violates not-null constraint')) {
          console.error('Missing required fields. Check database schema.');
          return { success: false, error: new Error('Profile creation failed: Missing required fields.') };
        }
        
        return { success: false, error };
      }

      if (data) {
        console.log('✅ Profile created successfully:', data);
        setProfile(data as Profile);
        return { success: true };
      }
      
      return { success: false, error: new Error('Profile creation returned no data') };
    } catch (creationError: any) {
      console.error('❌ Error creating default profile:', creationError);
      return { success: false, error: creationError };
    }
  };

  useEffect(() => {
    let isMounted = true;
    let subscription: any;
    
    console.log('🔐 Auth initialization started');
    
    // Faster loading timeout to prevent white screens - reduced to 1s
    const initTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.log('⚡ Auth initialization timeout - setting loading to false');
        setLoading(false);
        setInitialized(true);
      }
    }, 1000); // Reduced from 2s to 1s for faster perceived loading

    const initializeAuth = async () => {
      try {
        // Skip auth initialization if credentials are not configured
        if (!hasSupabaseCredentials) {
          console.warn('⚠️ Supabase credentials not configured - skipping auth initialization');
          if (isMounted) {
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        // STEP 1: Check cached session SYNCHRONOUSLY FIRST (instant load)
        // This provides immediate UI response for returning users
        const cachedSession = shouldUseCachedSession() && isSessionValid(getCachedSession()) ? getCachedSession() : null;
        
        if (cachedSession && isMounted) {
          console.log('⚡ Using cached session immediately:', cachedSession.user?.email);
          setUser(cachedSession.user);
          setSession(cachedSession);
          
          // Set loading to false IMMEDIATELY (no async delay)
          setLoading(false);
          setInitialized(true);
          
          // Load profile in background (don't block)
          if (cachedSession.user) {
            loadUserProfile(cachedSession.user.id).catch(err => {
              console.error('Error loading profile from cache:', err);
            });
          }
        }

        // STEP 2: Verify with Supabase's actual session (runs in background)
        // This ensures we have the most up-to-date session from localStorage
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          // If we had cached session but Supabase says invalid, clear it
          if (cachedSession) {
            clearCachedSession();
            if (isMounted) {
              setUser(null);
              setSession(null);
            }
          }
          if (isMounted && !cachedSession) {
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        // STEP 3: If Supabase has a session, use it (overwrites cache if different)
        if (session && isSessionValid(session) && isMounted) {
          // Only update if different from cached (to avoid unnecessary re-renders)
          if (!cachedSession || cachedSession.user?.id !== session.user.id) {
            console.log('✅ Using Supabase session:', session.user?.email);
            setUser(session.user);
            setSession(session);
          }
          
          // Update cache with fresh session
          setCachedSession(session);
          
          // Set loading/initialized if not already set
          if (!cachedSession) {
            setLoading(false);
            setInitialized(true);
            
            // Load profile in background
            if (session.user) {
              loadUserProfile(session.user.id).catch(err => {
                console.error('Error loading profile:', err);
              });
            }
          }
          return;
        }

        // STEP 4: No valid session found
        if (!session && !cachedSession) {
          console.log('ℹ️ No active session found');
          clearCachedSession();
          
          if (isMounted) {
            setLoading(false);
            setInitialized(true);
          }
        }
        
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        // If error but we had cached session, keep it
        if (!getCachedSession() && isMounted) {
          clearCachedSession();
          setLoading(false);
          setInitialized(true);
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
            clearTimeout(initTimeout); // Clear the new timeout
            
            // Handle different auth events
            if (event === 'SIGNED_IN') {
              console.log('User signed in successfully');
              setSession(session);
              setUser(session?.user ?? null);
              // Cache session
              if (session) {
                setCachedSession(session);
              }
              
              if (session?.user) {
                // For OAuth users, ensure profile exists
                const isOAuthUser = session.user.app_metadata?.provider !== 'email' || 
                                   session.user.app_metadata?.providers?.includes('google') ||
                                   session.user.identities?.some((id: any) => id.provider === 'google');
                if (isOAuthUser) {
                  // Try to load profile first, then create if needed (reduced delays)
                  loadUserProfile(session.user.id).catch(async () => {
                    // If profile doesn't exist, wait briefly for trigger, then create
                    await new Promise(resolve => setTimeout(resolve, 300));
                    const { data: profileCheck } = await supabase
                      .from('profiles')
                      .select('user_id')
                      .eq('user_id', session.user.id)
                      .maybeSingle();
                    if (!profileCheck) {
                      console.log('Profile not created by trigger, creating manually...');
                      const profileResult = await createDefaultProfile(session.user.id);
                      if (!profileResult.success) {
                        console.error('❌ Failed to create profile in OAuth callback:', profileResult.error);
                      }
                    }
                  });
                } else {
                  await loadUserProfile(session.user.id);
                }
              }
            } else if (event === 'SIGNED_OUT') {
              console.log('User signed out');
              setSession(null);
              setUser(null);
              setProfile(null);
              // Clear cache
              clearCachedSession();
            } else if (event === 'TOKEN_REFRESHED') {
              console.log('Token refreshed');
              setSession(session);
              setUser(session?.user ?? null);
              // Update cache
              if (session) {
                setCachedSession(session);
              }
              // Reload profile if user exists
              if (session?.user) {
                await loadUserProfile(session.user.id);
              }
            } else if (event === 'USER_UPDATED') {
              console.log('User updated');
              setSession(session);
              setUser(session?.user ?? null);
              // Update cache
              if (session) {
                setCachedSession(session);
              }
              if (session?.user) {
                await loadUserProfile(session.user.id);
              }
            } else {
              // Handle other events (PASSWORD_RECOVERY, etc.)
              setSession(session);
              setUser(session?.user ?? null);
              // Update cache
              if (session) {
                setCachedSession(session);
              } else {
                clearCachedSession();
              }
              
              if (session?.user && !profile) {
                await loadUserProfile(session.user.id);
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
        clearTimeout(initTimeout);
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
      clearTimeout(initTimeout);
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      if (!userId || typeof window === 'undefined') {
        return;
      }

      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null) // Only get non-deleted profiles
        .single();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 4000) // Reduced from 6s to 4s
      );

      const result = await Promise.race([profilePromise, timeoutPromise]) as any;
      const data = result?.data ?? result;
      const error = result?.error;

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          console.log('Profile not found, creating default profile...');
          const profileResult = await createDefaultProfile(userId);
          if (!profileResult.success) {
            console.error('❌ Failed to create profile after not found error:', profileResult.error);
          }
        } else {
          console.error('Error fetching profile:', error);
          // Try to create profile anyway if it's a permission error
          if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
            console.log('Permission error, attempting to create profile...');
            const profileResult = await createDefaultProfile(userId);
            if (!profileResult.success) {
              console.error('❌ Failed to create profile after permission error:', profileResult.error);
            }
          }
        }
        return;
      }

      if (data) {
        console.log('Profile fetched successfully');
        setProfile(data as Profile);
      } else {
        // No data returned, create default profile
        console.log('No profile data, creating default profile...');
        const profileResult = await createDefaultProfile(userId);
        if (!profileResult.success) {
          console.error('❌ Failed to create profile after no data:', profileResult.error);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
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
        let userFriendlyMessage = error.message;
        
        // Provide more user-friendly error messages
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('invalid login') ||
            error.message.includes('Invalid email or password')) {
          userFriendlyMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          userFriendlyMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Too many requests')) {
          userFriendlyMessage = 'Too many attempts. Please wait a few minutes before trying again.';
        } else if (error.message.includes('wrong password') || error.message.includes('incorrect password')) {
          userFriendlyMessage = 'Incorrect password. Please check your credentials and try again.';
        }

        toast({
          title: "Sign in failed",
          description: userFriendlyMessage,
          variant: "destructive",
        });
        
        return { error: new Error(userFriendlyMessage) };
      }
      
      // Explicitly set user and session from the response
      if (data?.user) {
        setUser(data.user);
        let finalSession = data.session;
        
        if (data.session) {
          setSession(data.session);
          // Cache session immediately
          setCachedSession(data.session);
        } else {
          // If no session in response, try to get it with retries (reduced retries)
          // This ensures session is available before redirect
          let retries = 0;
          const maxRetries = 3; // Reduced from 5 to 3
          let currentSession = null;
          
          while (!currentSession && retries < maxRetries) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              currentSession = session;
              finalSession = session;
              setSession(session);
              // Cache session
              setCachedSession(session);
              break;
            }
            // Reduced wait time
            await new Promise(resolve => setTimeout(resolve, 200)); // Reduced from 300ms
            retries++;
          }
          
          if (!currentSession && retries >= maxRetries) {
            console.warn('Session not available after sign-in');
          }
        }
        
        // Load profile asynchronously to not block the response
        // Don't let profile loading errors block sign-in
        if (finalSession?.user) {
          loadUserProfile(finalSession.user.id).catch(err => {
            console.error('Error loading profile after sign-in:', err);
            // Try to create profile if it doesn't exist
            if (err?.code === 'PGRST116' || err?.message?.includes('not found')) {
              createDefaultProfile(finalSession.user.id).then(profileResult => {
                if (!profileResult.success) {
                  console.error('❌ Error creating profile after sign-in:', profileResult.error);
                }
              }).catch(createErr => {
                console.error('❌ Error creating profile after sign-in (catch):', createErr);
              });
            }
          });
        }
      }
      
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to your account.",
      });
      return { error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: new Error(errorMessage) };
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
      
      console.log('Initiating Google OAuth sign-in', { redirectUrl, origin: window.location.origin });
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error('Google OAuth error:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        
        let userFriendlyMessage = 'Google sign-in is currently unavailable. Please try email/password or magic link instead.';
        
        // More specific error handling
        if (error.message?.includes('not configured') || 
            error.message?.includes('not enabled') ||
            error.message?.includes('provider_not_enabled')) {
          userFriendlyMessage = 'Google sign-in is not properly configured in Supabase. Please contact support or use email authentication.';
        } else if (error.message?.includes('unauthorized') || 
                   error.message?.includes('permission') ||
                   error.message?.includes('access_denied')) {
          userFriendlyMessage = 'Google authentication is not authorized for this domain. Please use email authentication instead.';
        } else if (error.message?.includes('popup') || 
                   error.message?.includes('blocked')) {
          userFriendlyMessage = 'Popup was blocked. Please allow popups for this site and try again.';
        } else if (error.message?.includes('redirect_uri_mismatch')) {
          userFriendlyMessage = 'Redirect URL mismatch. Please check your Google OAuth configuration.';
        } else if (error.message?.includes('invalid_client')) {
          userFriendlyMessage = 'Invalid Google OAuth client configuration. Please contact support.';
        }

        toast({
          title: "Google sign-in unavailable",
          description: userFriendlyMessage,
          variant: "destructive",
        });
        
        return { error: new Error(userFriendlyMessage) };
      } else {
        // OAuth redirect will happen automatically
        console.log('Google OAuth redirect initiated', { data });
        toast({
          title: "Redirecting to Google",
          description: "Please complete authentication with Google.",
        });
        return { error: null };
      }
    } catch (error: unknown) {
      console.error('Google sign-in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unable to connect to Google. Please try email/password authentication instead.';
      
      toast({
        title: "Authentication error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { error: new Error(errorMessage) };
    }
  };

  const signUp = async (email: string, password: string) => {
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
      
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      // CRITICAL: Always set user and session if they exist
      // For new users, session is typically available immediately unless email confirmation is required
      let finalSession = data?.session;
      
      if (data?.user) {
        setUser(data.user);
        
        if (data.session) {
          // Session is available - user is automatically signed in (no email confirmation needed)
          setSession(data.session);
          // Cache session immediately for persistence
          setCachedSession(data.session);
          finalSession = data.session;
          
          // Create profile immediately for new email/password users
          // Don't wait for database trigger - create it synchronously
          const profileResult = await createDefaultProfile(data.user.id);
          if (!profileResult.success) {
            console.error('❌ Profile creation failed during sign-up:', profileResult.error);
            // Don't block sign-up, but try again in background
            setTimeout(async () => {
              const retryResult = await createDefaultProfile(data.user.id);
              if (!retryResult.success) {
                console.error('❌ Profile creation retry failed:', retryResult.error);
                // Show error to user so they know to complete profile
                toast({
                  title: "Account created, but profile setup failed",
                  description: "Your account was created successfully. Please complete your profile in settings.",
                  variant: "destructive",
                });
              } else {
                console.log('✅ Profile created successfully on retry');
              }
            }, 1000);
          } else {
            console.log('✅ Profile created for new user during sign-up');
          }
        } else {
          // No session means email confirmation is required
          // Try to get session with retries (reduced retries)
          let retries = 0;
          const maxRetries = 3;
          let newSession = null;
          
          while (!newSession && retries < maxRetries) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              newSession = session;
              finalSession = session;
              setSession(session);
              // Cache session
              setCachedSession(session);
              
              // Create profile if session is available
              const profileResult = await createDefaultProfile(data.user.id);
              if (!profileResult.success) {
                console.error('❌ Profile creation failed:', profileResult.error);
                // Retry in background
                setTimeout(async () => {
                  const retryResult = await createDefaultProfile(data.user.id);
                  if (!retryResult.success) {
                    console.error('❌ Profile creation retry failed:', retryResult.error);
                  }
                }, 1000);
              }
              break;
            }
            // Reduced wait time
            await new Promise(resolve => setTimeout(resolve, 200));
            retries++;
          }
          
          if (!newSession && retries >= maxRetries) {
            // Email confirmation required - session will be available after email verification
            console.log('Email confirmation required - session will be available after verification');
            // Try to create profile anyway (for email confirmation flow)
            setTimeout(async () => {
              const profileResult = await createDefaultProfile(data.user.id);
              if (!profileResult.success) {
                console.error('❌ Profile creation failed for email confirmation flow:', profileResult.error);
              }
            }, 1000);
          }
        }
      }

      if (error) {
        // Log the full error for debugging
        console.error('❌ Sign up error details:', {
          message: error.message,
          status: (error as any).status,
          code: (error as any).code,
          error: error,
          userData: data?.user ? 'exists' : 'missing'
        });
        
        let userFriendlyMessage = error.message;
        let isEmailAlreadyRegistered = false;
        
        // Check for email already registered errors first (most common case)
        // Supabase returns various error messages for existing users
        const emailExistsPatterns = [
          'already registered',
          'already exists',
          'User already registered',
          'email already registered',
          'Email address already registered',
          'An account with this email already exists',
          'User with this email address has already been registered',
          'duplicate key value',
          'violates unique constraint',
          'email address is already registered',
          'this email is already registered',
        ];
        
        // Also check error status codes (422 is common for validation/conflict errors)
        const lowerErrorMsg = error.message?.toLowerCase() || '';
        isEmailAlreadyRegistered = emailExistsPatterns.some(pattern => 
          lowerErrorMsg.includes(pattern.toLowerCase())
        ) || (error as any).status === 422;
        
        if (isEmailAlreadyRegistered) {
          userFriendlyMessage = 'An account with this email already exists. Please sign in instead.';
          
          // If we have user data despite the error, it might have been created
          // but Supabase still returned an error - treat as success
          if (data?.user) {
            console.log('User exists but got error - likely already registered, redirecting to sign in');
            toast({
              title: "Account already exists",
              description: "An account with this email already exists. Please sign in instead.",
              variant: "destructive",
            });
            return { error: new Error(userFriendlyMessage) };
          }
          
          // No user data - definitely already registered
          toast({
            title: "Sign up failed",
            description: userFriendlyMessage,
            variant: "destructive",
          });
          return { error: new Error(userFriendlyMessage) };
        }
        
        // Handle "Database error saving new user" - this usually means trigger had an issue
        // but the user was still created, so we should treat it as success
        if (error.message?.includes('Database error saving new user') || 
            error.message?.includes('error saving new user') ||
            error.message?.includes('saving new user')) {
          // User was likely created, just profile creation had an issue
          if (data?.user) {
            console.log('User created but profile creation had an issue, will retry...');
            // Try to create profile asynchronously
            setTimeout(async () => {
              if (data.user) {
                const profileResult = await createDefaultProfile(data.user.id);
                if (!profileResult.success) {
                  console.error('❌ Error creating profile in background:', profileResult.error);
                  toast({
                    title: "Profile setup incomplete",
                    description: "Your account was created, but profile setup failed. Please complete your profile in settings.",
                    variant: "destructive",
                  });
                }
              }
            }, 1000);
            // Return success since user was created
            toast({
              title: "Account created!",
              description: "Your account has been created. Setting up your profile...",
            });
            return { error: null };
          }
          // No user data but got this error - unclear state
          userFriendlyMessage = 'Sign up encountered an error. If your account was created, please try signing in. Otherwise, please try again.';
        } else if (error.message?.includes('weak password') || error.message?.includes('Password')) {
          userFriendlyMessage = 'Please choose a stronger password with at least 8 characters.';
        } else if (error.message?.includes('invalid email') || error.message?.includes('Email')) {
          userFriendlyMessage = 'Please enter a valid email address.';
        } else if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
          userFriendlyMessage = 'Unable to create account. Please try again or contact support.';
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
          userFriendlyMessage = 'Network error. Please check your connection and try again.';
        }

        // Only show error if user wasn't created
        if (!data?.user) {
          toast({
            title: "Sign up failed",
            description: userFriendlyMessage,
            variant: "destructive",
          });
          return { error: new Error(userFriendlyMessage) };
        }
        // If user was created, continue with profile setup below
      }

      // Success handling - show appropriate message based on session status
      if (data?.user) {
        if (finalSession) {
          // User is signed in immediately
          toast({
            title: "Welcome to Bible Aura!",
            description: "Account created successfully! You can now start exploring.",
          });
          
          // Ensure profile is loaded after sign-up
          if (data.user.id) {
            setTimeout(async () => {
              await loadUserProfile(data.user.id).catch(err => {
                console.error('Error loading profile after sign-up:', err);
              });
            }, 500);
          }
        } else {
          // Email confirmation required
          toast({
            title: "Check your email!",
            description: "We've sent you a confirmation link. Please check your email and click the link to activate your account.",
          });
          
          // Try to create profile for email confirmation flow (will complete after email confirmation)
          setTimeout(async () => {
            const profileResult = await createDefaultProfile(data.user.id);
            if (!profileResult.success) {
              console.error('❌ Profile creation failed for email confirmation flow:', profileResult.error);
              // Profile will be created after email confirmation when user signs in
            }
          }, 1000);
        }
      }
      
      return { error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: new Error(errorMessage) };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear local state first for immediate UI feedback
      setUser(null);
      setSession(null);
      setProfile(null);
      // Clear cache
      clearCachedSession();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
      console.error('Error signing out:', error);
      toast({
          title: "Sign out failed",
        description: "There was an issue signing you out. Please try again.",
        variant: "destructive",
      });
        // State already cleared, so user is effectively signed out
      } else {
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // State already cleared, so user is effectively signed out
      clearCachedSession();
    } finally {
      setLoading(false);
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
        .eq('user_id', user.id)
        .is('deleted_at', null); // Only update non-deleted profiles

      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      } else {
        // Refresh profile data
        await loadUserProfile(user.id);
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

  const deleteProfile = async () => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      // Soft delete: set deleted_at timestamp instead of actually deleting
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
      } else {
        // Clear profile from state (user won't see it anymore)
        setProfile(null);
        
        // Clear localStorage flag so modal shows again if they log back in
        localStorage.removeItem(`profile_modal_seen_${user.id}`);
        
        toast({
          title: "Profile deleted",
          description: "Your profile has been deleted. You can create a new one anytime.",
        });
        return { error: null };
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      toast({
        title: "Delete failed",
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

      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        let userFriendlyMessage = error.message;
        
        if (error.message.includes('weak password')) {
          userFriendlyMessage = 'Please choose a stronger password with at least 8 characters.';
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