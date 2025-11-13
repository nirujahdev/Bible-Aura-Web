import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileOptimizedLayout } from '@/components/MobileOptimizedLayout';
import { BibleAuraChat } from '@/components/BibleAuraChat';
import { Button } from '@/components/ui/button';
import { Calendar, BookOpen } from 'lucide-react';

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
    <MobileOptimizedLayout>
      <div className={isMobile ? "h-[100dvh] mobile-safe-area" : "h-screen"}>
        <BibleAuraChat />
      </div>
    </MobileOptimizedLayout>
  );
} 