import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileMoreMenu } from './MobileMoreMenu';
import { MobileFloatingActions } from './MobileFloatingActions';
import { ModernLayout } from './ModernLayout';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  className?: string;
}

export function MobileOptimizedLayout({ 
  children, 
  showBottomNav = true,
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
      {/* Main Content Area - Full height with mobile padding */}
      <div className="flex-1 overflow-auto">
        <div className={cn(
          "min-h-full",
          showBottomNav ? "pb-16" : "pb-4" // Updated to match smaller bottom nav height
        )}>
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {showBottomNav && <MobileBottomNav />}

      {/* Mobile More Menu */}
      <MobileMoreMenu 
        isOpen={moreMenuOpen}
        onClose={() => setMoreMenuOpen(false)}
      />

      {/* Mobile Floating Actions */}
      <MobileFloatingActions 
        onMoreMenuOpen={() => setMoreMenuOpen(true)}
      />
    </div>
  );
} 