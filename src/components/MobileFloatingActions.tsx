import React from 'react';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileFloatingActionsProps {
  onMoreMenuOpen?: () => void;
}

export function MobileFloatingActions({ onMoreMenuOpen }: MobileFloatingActionsProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!isMobile || !user) return null;

  return (
    <>
      {/* Floating Side Menu Button */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 lg:hidden">
        <button
          onClick={onMoreMenuOpen}
          className={cn(
            "flex items-center justify-center w-12 h-12",
            "bg-white border border-gray-200 rounded-full shadow-lg",
            "text-gray-600 hover:text-orange-500",
            "hover:shadow-xl hover:border-orange-200",
            "transition-all duration-300",
            "backdrop-blur-sm bg-white/95"
          )}
          aria-label="Open menu"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </>
  );
} 