import React, { useState } from 'react';
import { Plus, MessageCircle, BookOpen, PenTool, Search, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

interface FloatingAction {
  icon: React.ComponentType<any>;
  label: string;
  href?: string;
  action?: () => void;
  color: string;
}

const floatingActions: FloatingAction[] = [
  {
    icon: MessageCircle,
    label: 'Quick Chat',
    href: '/dashboard',
    color: 'bg-orange-500 hover:bg-orange-600'
  },
  {
    icon: BookOpen,
    label: 'Bible',
    href: '/bible',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    icon: PenTool,
    label: 'New Journal',
    href: '/journal',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    icon: Search,
    label: 'AI Study',
    href: '/study-hub',
    color: 'bg-purple-500 hover:bg-purple-600'
  }
];

interface MobileFloatingActionsProps {
  className?: string;
}

export function MobileFloatingActions({ className }: MobileFloatingActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const location = useLocation();

  if (!isMobile || !user) return null;

  // Don't show on certain pages where it might interfere
  const hiddenPaths = ['/auth', '/pricing'];
  if (hiddenPaths.includes(location.pathname)) return null;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleActionClick = () => {
    setIsExpanded(false);
  };

  return (
    <div className={cn("fixed bottom-24 right-4 z-40 lg:hidden", className)}>
      {/* Expanded Actions */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 space-y-3 mb-2">
          {floatingActions.map((action, index) => {
            const IconComponent = action.icon;
            
            if (action.href) {
              return (
                <Link
                  key={action.label}
                  to={action.href}
                  onClick={handleActionClick}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-full shadow-lg transition-all duration-300 transform",
                    action.color,
                    "text-white hover:scale-105 animate-in slide-in-from-bottom duration-300"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="text-sm font-medium whitespace-nowrap">
                    {action.label}
                  </span>
                </Link>
              );
            }

            return (
              <button
                key={action.label}
                onClick={() => {
                  action.action?.();
                  handleActionClick();
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-full shadow-lg transition-all duration-300 transform",
                  action.color,
                  "text-white hover:scale-105 animate-in slide-in-from-bottom duration-300"
                )}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                <IconComponent className="h-5 w-5" />
                <span className="text-sm font-medium whitespace-nowrap">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={toggleExpanded}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform flex items-center justify-center",
          isExpanded 
            ? "bg-red-500 hover:bg-red-600 rotate-45" 
            : "bg-orange-500 hover:bg-orange-600 hover:scale-110",
          "text-white shadow-orange-300/50"
        )}
      >
        {isExpanded ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </button>

      {/* Backdrop for expanded state */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
} 