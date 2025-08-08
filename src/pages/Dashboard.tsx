import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { BibleAuraChat } from '@/components/BibleAuraChat';

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
    <div className="h-screen">
      <BibleAuraChat />
    </div>
  );
} 