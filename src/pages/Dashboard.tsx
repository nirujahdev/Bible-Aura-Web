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
  useEffect(() => {
    if (!loading && user && profile && !hasCheckedProfile) {
      setHasCheckedProfile(true);
      
      // Check if profile is incomplete
      const isIncomplete = 
        !profile.display_name ||
        !profile.agreed_to_terms ||
        !profile.agreed_to_privacy ||
        !profile.is_over_13;

      // Check if user has seen the modal before (stored in localStorage)
      const hasSeenModal = localStorage.getItem(`profile_modal_seen_${user.id}`);
      
      if (isIncomplete && !hasSeenModal) {
        // Small delay to ensure dashboard is loaded
        setTimeout(() => {
          setShowProfileModal(true);
        }, 500);
      }
    } else if (!loading && user && !profile) {
      // Profile doesn't exist yet, show modal
      setHasCheckedProfile(true);
      const hasSeenModal = localStorage.getItem(`profile_modal_seen_${user.id}`);
      if (!hasSeenModal) {
        setTimeout(() => {
          setShowProfileModal(true);
        }, 500);
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
      <MobileOptimizedLayout>
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