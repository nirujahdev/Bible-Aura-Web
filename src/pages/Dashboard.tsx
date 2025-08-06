import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
import EnhancedAIChat from '@/components/EnhancedAIChat';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, loading } = useAuth();
  
  // SEO optimization
  useSEO(SEO_CONFIG.DASHBOARD);

  // Redirect to auth if not logged in
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* AI Chat Dashboard Interface */}
      <div className="h-screen flex flex-col">
        <EnhancedAIChat />
      </div>
    </div>
  );
} 