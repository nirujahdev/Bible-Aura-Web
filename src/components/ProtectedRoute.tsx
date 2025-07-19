import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from './LoadingScreen';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Show loading screen while authentication is being determined
  if (loading) {
    return <LoadingScreen message="Verifying your access..." />;
  }

  // If not authenticated, redirect to auth page
  if (!user) {
    // Clear any cached navigation state that might cause issues
    try {
      sessionStorage.removeItem('navigation-state');
    } catch (error) {
      console.error('Error clearing navigation state:', error);
    }
    
    return <Navigate to="/auth" replace />;
  }

  // Render the protected component if authenticated
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Error rendering protected route:', error);
    // Fallback to auth page if there's an error rendering the protected content
    return <Navigate to="/auth" replace />;
  }
};

export default ProtectedRoute; 