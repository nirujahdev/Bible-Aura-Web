import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { useIsMobile } from '@/hooks/use-mobile';
import { ModernLayout } from '@/components/ModernLayout';
import { BibleAuraChat } from '@/components/BibleAuraChat';

export default function Dashboard() {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  useSEO({
    title: "✦ Bible Aura | AI Chat Dashboard",
    description: "Chat with Bible Aura AI for biblical insights, verse analysis, and spiritual guidance",
    keywords: "Bible AI chat, biblical insights, AI Bible study, scripture analysis"
  });

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <ModernLayout>
      <div className={isMobile ? "h-[100dvh] mobile-safe-area" : "h-screen"}>
        <BibleAuraChat />
      </div>
    </ModernLayout>
  );
} 