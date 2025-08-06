import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
import { Navigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { ModernLayout } from '@/components/ModernLayout';
import EnhancedAIChat from '@/components/EnhancedAIChat';
import { Plus } from 'lucide-react';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Redirect mobile users to landing page
  if (isMobile) {
    return <Navigate to="/" replace />;
  }
  
  // SEO optimization
  useSEO(SEO_CONFIG.DASHBOARD);

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getUserName = () => {
    if (profile?.display_name) return profile.display_name.split(' ')[0];
    if (user?.email) return user.email.split('@')[0];
    return 'Friend';
  };

  return (
    <ModernLayout>
      <div className="h-screen bg-gray-50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-300/50">
              <span className="text-white font-bold text-xl drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">✦</span>
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg">Bible Aura AI</div>
              <div className="text-sm text-gray-600">Welcome back, {getUserName()}!</div>
            </div>
          </div>
        </div>

        {/* Main Chat Interface using Enhanced AI Chat */}
        <div className="h-[calc(100vh-80px)]">
          <EnhancedAIChat />
        </div>
      </div>
    </ModernLayout>
  );
} 