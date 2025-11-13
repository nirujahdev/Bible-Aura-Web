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
      <div className={isMobile ? "mobile-safe-area" : ""}>
        {/* Quick Links Section */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 border-b border-gray-200">
          <div className="container mx-auto">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <Link to="/reading-plan">
                <Button
                  variant="outline"
                  className="whitespace-nowrap bg-white hover:bg-orange-50 border-orange-200 hover:border-orange-400 text-gray-700 shadow-sm"
                >
                  <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                  <span className="flex items-center gap-1">
                    <span className="text-orange-500 font-bold">✦</span>
                    Bible Reading Planner
                  </span>
                </Button>
              </Link>
              <Link to="/bible">
                <Button
                  variant="outline"
                  className="whitespace-nowrap bg-white hover:bg-orange-50 border-orange-200 hover:border-orange-400 text-gray-700 shadow-sm"
                >
                  <BookOpen className="h-4 w-4 mr-2 text-orange-500" />
                  Read Bible
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* AI Chat */}
        <div className={isMobile ? "h-[calc(100dvh-120px)]" : "h-[calc(100vh-120px)]"}>
          <BibleAuraChat />
        </div>
      </div>
    </MobileOptimizedLayout>
  );
} 