import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileOptimizedLayout } from '@/components/MobileOptimizedLayout';
import { BibleAuraChat } from '@/components/BibleAuraChat';
import { ProfileCompletionModal } from '@/components/ProfileCompletionModal';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const isMobile = useIsMobile();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

  useSEO({
    title: "✦ Bible Aura | AI Chat Dashboard",
    description: "Chat with Bible Aura AI for biblical insights, verse analysis, and spiritual guidance",
    keywords: "Bible AI chat, biblical insights, AI Bible study, scripture analysis"
  });

  // Check if profile needs completion
  // Only show modal in dashboard, NOT during login
  useEffect(() => {
    if (!loading && user && !hasCheckedProfile) {
      setHasCheckedProfile(true);
      
      // Check if profile is incomplete or doesn't exist
      const isIncomplete = !profile || 
        !profile.display_name ||
        !profile.agreed_to_terms ||
        !profile.agreed_to_privacy ||
        !profile.is_over_13;

      // Check if user has seen the modal before (stored in localStorage)
      // Reset this flag if profile was deleted (soft delete)
      const hasSeenModal = localStorage.getItem(`profile_modal_seen_${user.id}`);
      
      // Show modal if:
      // 1. Profile is incomplete AND user hasn't seen modal
      // 2. Profile doesn't exist AND user hasn't seen modal
      if (isIncomplete && !hasSeenModal) {
        // Small delay to ensure dashboard is loaded (not during login redirect)
        setTimeout(() => {
          setShowProfileModal(true);
        }, 1000);
      }
    }
  }, [user, profile, loading, hasCheckedProfile]);

  const handleProfileComplete = () => {
    setShowProfileModal(false);
    if (user) {
      // Mark as seen so it doesn't show again
      localStorage.setItem(`profile_modal_seen_${user.id}`, 'true');
    }
  };

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Wrap in error boundary to catch any component errors
  return (
    <ErrorBoundary>
      <MobileOptimizedLayout hideHeader={true}>
        <div className={isMobile ? "h-[100dvh] mobile-safe-area" : "h-screen"}>
          <BibleAuraChat />
          <ProfileCompletionModal 
            open={showProfileModal} 
            onComplete={handleProfileComplete}
          />
        </div>
      </MobileOptimizedLayout>
    </ErrorBoundary>
  );
} 