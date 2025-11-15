import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { clearCachedSession } from '@/lib/auth-cache';
import LoadingScreen from '@/components/LoadingScreen';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Show loading screen ONLY while useAuth is initializing
  // Trust useAuth's state - it already handles session restoration
  if (loading) {
    return <LoadingScreen message="Checking your authentication..." />;
  }

  // If not authenticated, redirect to auth page
  // Don't double-check session - useAuth already did this
  if (!user) {
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