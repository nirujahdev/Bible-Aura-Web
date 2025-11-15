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

  const createDefaultProfile = async (userId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const authUser = userData?.user;

      // Check if profile exists (including soft-deleted)
      const { exists, isDeleted } = await checkProfileExists(userId);
      
      if (exists && !isDeleted) {
        // Profile exists and is not deleted, just load it
        await loadUserProfile(userId);
        return;
      }
      
      // If profile is soft-deleted, the trigger will restore it on next login
      // So we should wait a bit for the trigger to complete, then check again
      if (exists && isDeleted) {
        // Wait for trigger to potentially restore it
        await new Promise(resolve => setTimeout(resolve, 500));
        const { exists: existsAfterWait, isDeleted: isDeletedAfterWait } = await checkProfileExists(userId);
        if (existsAfterWait && !isDeletedAfterWait) {
          await loadUserProfile(userId);
          return;
        }
      }

      const fallbackName =
        authUser?.user_metadata?.full_name ||
        authUser?.user_metadata?.name ||
        authUser?.user_metadata?.display_name ||
        authUser?.email?.split('@')[0] ||
        'Bible Aura Member';

      // Wait a bit for trigger to potentially create the profile
      // The trigger should handle profile creation, but if it hasn't, we'll create it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check again if profile was created by trigger
      const { exists: existsAfterWait } = await checkProfileExists(userId);
      if (existsAfterWait) {
        await loadUserProfile(userId);
        return;
      }

      // If trigger didn't create it, create it manually as fallback
      // fallbackName was already declared above, reuse it

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
          return;
        }
        
        console.error('Error creating default profile:', error);
        // Log detailed error
        if (error.code === 'PGRST301' || error.message?.includes('permission denied')) {
          console.error('RLS policy blocking profile creation. Trigger should handle this.');
          // Don't retry - let trigger handle it or user can complete profile via modal
        } else if (error.message?.includes('violates not-null constraint')) {
          console.error('Missing required fields. Check database schema.');
        }
        return;
      }

      if (data) {
        console.log('Profile created successfully:', data);
        setProfile(data as Profile);
      }
    } catch (creationError) {
      console.error('Error creating default profile:', creationError);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let subscription: any;
    
    console.log('🔐 Auth initialization started');
    
    // Faster loading timeout to prevent white screens
    const initTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.log('⚡ Auth initialization timeout - setting loading to false');
        setLoading(false);
        setInitialized(true);
      }
    }, 2000); // Reduced from default to prevent long white screens

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

        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          if (isMounted) {
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        if (session?.user && isMounted) {
          console.log('✅ User found in session:', session.user.email);
          setUser(session.user);
          setSession(session);
          
          // Load profile
          await loadUserProfile(session.user.id);
        } else {
          console.log('ℹ️ No active session found');
        }
        
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
        
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (isMounted) {
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
              
              if (session?.user) {
                // For OAuth users, ensure profile exists
                const isOAuthUser = session.user.app_metadata?.provider !== 'email' || 
                                   session.user.app_metadata?.providers?.includes('google') ||
                                   session.user.identities?.some((id: any) => id.provider === 'google');
                if (isOAuthUser) {
                  // Give trigger a moment to create profile, then load it
                  setTimeout(async () => {
                    await loadUserProfile(session.user.id);
                    // If profile still doesn't exist after trigger, create it
                    setTimeout(async () => {
                      const { data: profileCheck } = await supabase
                        .from('profiles')
                        .select('user_id')
                        .eq('user_id', session.user.id)
                        .single();
                      if (!profileCheck) {
                        console.log('Profile not created by trigger, creating manually...');
                        await createDefaultProfile(session.user.id);
                      }
                    }, 1000);
                  }, 500);
                } else {
                  await loadUserProfile(session.user.id);
                }
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
              // Reload profile if user exists
              if (session?.user) {
                await loadUserProfile(session.user.id);
              }
            } else if (event === 'USER_UPDATED') {
              console.log('User updated');
              setSession(session);
              setUser(session?.user ?? null);
              if (session?.user) {
                await loadUserProfile(session.user.id);
              }
            } else {
              // Handle other events (PASSWORD_RECOVERY, etc.)
              setSession(session);
              setUser(session?.user ?? null);
              
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
        setTimeout(() => reject(new Error('Profile fetch timeout')), 6000)
      );

      const result = await Promise.race([profilePromise, timeoutPromise]) as any;
      const data = result?.data ?? result;
      const error = result?.error;

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          console.log('Profile not found, creating default profile...');
          await createDefaultProfile(userId);
        } else {
          console.error('Error fetching profile:', error);
          // Try to create profile anyway if it's a permission error
          if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
            console.log('Permission error, attempting to create profile...');
            await createDefaultProfile(userId);
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
        await createDefaultProfile(userId);
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
        // Explicitly set user and session from the response
        if (data?.user && data?.session) {
          setUser(data.user);
          setSession(data.session);
          // Load profile asynchronously to not block the response
          loadUserProfile(data.user.id).catch(err => {
            console.error('Error loading profile after sign-in:', err);
          });
        }
        
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

  const signUp = async (email: string, password: string, userData?: {
    displayName?: string;
    phoneNumber?: string;
    age?: number;
    denomination?: string | null;
    agreedToTerms?: boolean;
    agreedToPrivacy?: boolean;
    isOver13?: boolean;
  }) => {
    try {
      setLoading(true);
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const redirectUrl = `${window.location.origin}/auth`;
      
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: userData?.displayName?.trim() || null,
            phone_number: userData?.phoneNumber?.trim() || null,
            age: userData?.age || null,
            denomination: userData?.denomination || null,
          },
        },
      });

      if (error) {
        let userFriendlyMessage = error.message;
        
        // Handle "Database error saving new user" - this usually means trigger had an issue
        // but the user was still created, so we should treat it as success
        if (error.message?.includes('Database error saving new user') || 
            error.message?.includes('error saving new user')) {
          // User was likely created, just profile creation had an issue
          // Check if user exists and continue
          if (data?.user) {
            console.log('User created but profile creation had an issue, will retry...');
            // Don't return error - let the profile creation retry logic handle it
            // Set user and session so they can proceed
            setUser(data.user);
            if (data.session) {
              setSession(data.session);
            }
            // Try to create profile asynchronously
            setTimeout(async () => {
              if (data.user) {
                await createDefaultProfile(data.user.id);
              }
            }, 1000);
            // Return success since user was created
            toast({
              title: "Account created!",
              description: "Your account has been created. Setting up your profile...",
            });
            return { error: null };
          }
          userFriendlyMessage = 'Account may have been created. Please try signing in.';
        } else if (error.message?.includes('already registered') || error.message?.includes('already exists') || error.message?.includes('User already registered')) {
          userFriendlyMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (error.message?.includes('weak password') || error.message?.includes('Password')) {
          userFriendlyMessage = 'Please choose a stronger password with at least 8 characters.';
        } else if (error.message?.includes('invalid email') || error.message?.includes('Email')) {
          userFriendlyMessage = 'Please enter a valid email address.';
        } else if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
          userFriendlyMessage = 'Unable to create account. Please try again or contact support.';
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
          userFriendlyMessage = 'Network error. Please check your connection and try again.';
        }

        toast({
          title: "Sign up failed",
          description: userFriendlyMessage,
          variant: "destructive",
        });
        
        return { error: new Error(userFriendlyMessage) };
      }

      // If user was created, let trigger create the profile, then update with additional data if provided
      if (data.user) {
        try {
          // Wait for trigger to create the profile (up to 2 seconds with retries)
          let profileExists = false;
          let retries = 0;
          const maxRetries = 4;
          
          while (!profileExists && retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const { exists } = await checkProfileExists(data.user.id);
            if (exists) {
              profileExists = true;
              break;
            }
            retries++;
          }
          
          // If profile was created by trigger, update it with any additional user data
          if (profileExists && (userData?.displayName || userData?.phoneNumber || userData?.age || userData?.denomination || userData?.agreedToTerms || userData?.agreedToPrivacy || userData?.isOver13)) {
            const updateData: Partial<Profile> = {};
            
            if (userData?.displayName) updateData.display_name = userData.displayName.trim();
            if (userData?.phoneNumber) updateData.phone_number = userData.phoneNumber.trim();
            if (userData?.age) updateData.age = userData.age;
            if (userData?.denomination !== undefined) updateData.denomination = userData.denomination;
            if (userData?.agreedToTerms !== undefined) updateData.agreed_to_terms = userData.agreedToTerms;
            if (userData?.agreedToPrivacy !== undefined) updateData.agreed_to_privacy = userData.agreedToPrivacy;
            if (userData?.isOver13 !== undefined) updateData.is_over_13 = userData.isOver13;
            
            // Only update if there's data to update
            if (Object.keys(updateData).length > 0) {
              const { error: updateError, data: updatedProfile } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('user_id', data.user.id)
                .is('deleted_at', null)
                .select()
                .single();
              
              if (!updateError && updatedProfile) {
                setProfile(updatedProfile as Profile);
                console.log('Profile updated with user data:', updatedProfile);
              } else if (updateError) {
                console.error('Error updating profile with user data:', updateError);
                // Load profile anyway if update fails
                await loadUserProfile(data.user.id);
              }
            } else {
              // Just load the profile created by trigger
              await loadUserProfile(data.user.id);
            }
          } else if (profileExists) {
            // Profile exists but no additional data to update
            await loadUserProfile(data.user.id);
          } else {
            // Trigger didn't create profile (shouldn't happen, but fallback)
            console.warn('Profile not created by trigger, creating manually as fallback');
            await createDefaultProfile(data.user.id);
          }
        } catch (profileError) {
          console.error('Error handling profile after signup:', profileError);
          // Try to load profile anyway in case it was created
          if (data.user) {
            try {
              await loadUserProfile(data.user.id);
            } catch (loadError) {
              console.error('Error loading profile:', loadError);
            }
          }
        }
      }

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
      setLoading(true);
      
      // Clear local state first for immediate UI feedback
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