// PWA Loader - Entry point for PWA installations
// Checks authentication status and redirects accordingly
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePWA } from '@/hooks/usePWA';
import LoadingScreen from '@/components/LoadingScreen';

export default function PWALoader() {
  const { user, loading } = useAuth();
  const { isStandalone } = usePWA();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;

    // If user is logged in, go to dashboard
    if (user) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // If not logged in, go to auth page
    navigate('/auth', { replace: true });
  }, [user, loading, navigate]);

  // Show loading screen while checking auth
  return (
    <LoadingScreen 
      message={loading ? 'Checking authentication...' : 'Loading Bible Aura...'} 
    />
  );
}

