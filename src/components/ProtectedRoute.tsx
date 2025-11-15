import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Show loading screen while auth is initializing
  if (loading) {
    return <LoadingScreen message="Checking your authentication..." />;
  }

  // If not authenticated, redirect to auth page
  if (!user) {
    // Clear session storage for navigation state only
    // Don't touch Supabase's localStorage - it manages sessions
    try {
      sessionStorage.removeItem('navigation-state');
      sessionStorage.removeItem('auth-redirect');
    } catch (error) {
      // Ignore errors
    }
    
    return <Navigate to="/auth" replace />;
  }

  // Render the protected component if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
