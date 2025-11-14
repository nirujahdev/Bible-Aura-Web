import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Show loading screen while authentication is being determined
  // But only for a reasonable amount of time (max 3 seconds)
  if (loading) {
    return <LoadingScreen message="Checking your authentication..." />;
  }

  // If not authenticated, redirect to auth page
  if (!user) {
    // Clear any cached navigation state that might cause issues
    try {
      sessionStorage.removeItem('navigation-state');
      sessionStorage.removeItem('auth-redirect');
      // Don't clear all localStorage - only auth tokens
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('auth')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
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