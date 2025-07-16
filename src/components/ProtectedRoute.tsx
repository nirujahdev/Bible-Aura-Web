import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show loading while checking authentication
    return (
      <div className="min-h-screen bg-aura-gradient flex items-center justify-center overflow-hidden">
        <div className="text-center space-y-8 animate-divine-scale-in">
          <div className="relative mx-auto">
            <img 
              src="/✦Bible Aura.svg" 
              alt="Bible Aura" 
              className="h-32 w-32 animate-sacred-glow mx-auto drop-shadow-2xl"
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-divine text-white animate-holy-text-glow">
              ✦Bible Aura
            </h1>
            <p className="text-xl text-white/90 font-sacred animate-sacred-fade-in">
              Verifying your access...
            </p>
          </div>
          <div className="flex justify-center animate-sacred-fade-in">
            <div className="spinner-celestial h-12 w-12"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to auth page if not authenticated
    return <Navigate to="/auth" replace />;
  }

  // Render the protected component if authenticated
  return <>{children}</>;
};

export default ProtectedRoute; 