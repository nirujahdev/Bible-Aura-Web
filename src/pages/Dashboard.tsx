import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileOptimizedLayout } from '@/components/MobileOptimizedLayout';
import { BibleAuraChat } from '@/components/BibleAuraChat';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  useSEO({
    title: "✦ Bible Aura | AI Chat Dashboard",
    description: "Chat with Bible Aura AI for biblical insights, verse analysis, and spiritual guidance",
    keywords: "Bible AI chat, biblical insights, AI Bible study, scripture analysis"
  });

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
      {isMobile ? (
        <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-gray-50 to-white overflow-hidden">
          <BibleAuraChat />
        </div>
      ) : (
        <MobileOptimizedLayout>
          <div className="h-screen">
            <BibleAuraChat />
          </div>
        </MobileOptimizedLayout>
      )}
    </ErrorBoundary>
  );
} 