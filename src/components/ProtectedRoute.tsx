import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getCachedSession, clearCachedSession, isSessionValid } from '@/lib/auth-cache';
import { supabase } from '@/integrations/supabase/client';
import LoadingScreen from '@/components/LoadingScreen';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);

  // Check Supabase's stored session to verify authentication
  // Don't rely only on local state - verify with Supabase
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check Supabase's stored session first (most reliable)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && isSessionValid(session)) {
          setHasValidSession(true);
          return;
        }

        // Fallback: Check cached session
        const cachedSession = getCachedSession();
        if (cachedSession && isSessionValid(cachedSession)) {
          setHasValidSession(true);
          return;
        }

        // No valid session found
        setHasValidSession(false);
      } catch (error) {
        console.error('Error checking session in ProtectedRoute:', error);
        setHasValidSession(false);
      }
    };

    // Only check if loading is false (auth initialization complete)
    if (!loading) {
      checkSession();
    }
  }, [loading]);

  // Show loading screen while authentication is being determined
  if (loading || hasValidSession === null) {
    return <LoadingScreen message="Checking your authentication..." />;
  }

  // If not authenticated and no valid session, redirect to auth page
  if (!user && !hasValidSession) {
    // Only clear session storage and navigation state
    // DON'T clear Supabase's localStorage - let Supabase manage it
    try {
      sessionStorage.removeItem('navigation-state');
      sessionStorage.removeItem('auth-redirect');
      // Only clear our cache, not Supabase's session storage
      clearCachedSession();
      // Don't clear Supabase's localStorage keys - they manage session persistence
    } catch (error) {
      console.error('Error clearing navigation state:', error);
    }
    
    return <Navigate to="/auth" replace />;
  }

  // Render the protected component if authenticated
  // Wrap in error boundary to catch rendering errors
  return <>{children}</>;
};

export default ProtectedRoute; 