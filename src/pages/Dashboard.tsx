import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { ModernLayout } from '@/components/ModernLayout';
import EnhancedAIChat from '@/components/EnhancedAIChat';

export default function Dashboard() {
  const { user } = useAuth();

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
      <div className="h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <EnhancedAIChat />
      </div>
    </ModernLayout>
  );
} 