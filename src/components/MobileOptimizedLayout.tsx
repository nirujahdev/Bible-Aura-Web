import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileMoreMenu } from './MobileMoreMenu';
import { ModernLayout } from './ModernLayout';
import { Menu, MoreVertical } from 'lucide-react';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  className?: string;
}

export function MobileOptimizedLayout({ 
  children, 
  showBottomNav = false, // Changed default to false
  className = '' 
}: MobileOptimizedLayoutProps) {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // If not mobile or not authenticated, use the original ModernLayout
  if (!isMobile || !user) {
    return <ModernLayout>{children}</ModernLayout>;
  }

  return (
    <div className={cn("min-h-screen bg-white flex flex-col", className)}>
      {/* Mobile Top Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left - Menu */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          
          {/* Center - Logo */}
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-lg font-bold">✦</span>
            <span className="text-lg font-semibold text-gray-900">Bible Aura</span>
          </div>
          
          {/* Right - Three dots */}
          <button 
            onClick={() => setMoreMenuOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-full">
          {children}
        </div>
      </div>

      {/* Mobile More Menu */}
      <MobileMoreMenu 
        isOpen={moreMenuOpen}
        onClose={() => setMoreMenuOpen(false)}
      />
    </div>
  );
} 