import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Search, 
  PenTool, 
  Users, 
  MessageCircle,
  Heart,
  User,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  activeIcon?: React.ComponentType<any>;
  isSpecial?: boolean;
}

const navItems: NavItem[] = [
  { 
    name: 'Chat', 
    href: '/dashboard', 
    icon: MessageCircle,
    isSpecial: true 
  },
  { 
    name: 'Bible', 
    href: '/bible', 
    icon: BookOpen 
  },
  { 
    name: 'Study', 
    href: '/study-hub', 
    icon: Search 
  },
  { 
    name: 'Journal', 
    href: '/journal', 
    icon: PenTool 
  },
  { 
    name: 'More', 
    href: '/profile', 
    icon: Menu 
  }
];

interface MobileBottomNavProps {
  onMoreMenuOpen?: () => void;
}

export function MobileBottomNav({ onMoreMenuOpen }: MobileBottomNavProps) {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!isMobile || !user) return null;

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === href;
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden">
        <div className="px-2 py-1">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const IconComponent = item.icon;
              
              if (item.name === 'More') {
                return (
                  <button
                    key={item.name}
                    onClick={onMoreMenuOpen}
                    className={cn(
                      "flex flex-col items-center justify-center py-2 px-1 min-w-[60px] rounded-lg transition-all duration-200",
                      active 
                        ? "text-orange-500" 
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <div className={cn(
                      "p-1.5 rounded-lg transition-all",
                      active 
                        ? "bg-orange-100" 
                        : "hover:bg-gray-100"
                    )}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <span className="text-xs mt-1 font-medium">
                      {item.name}
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-1 min-w-[60px] rounded-lg transition-all duration-200 relative",
                    active 
                      ? "text-orange-500" 
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-lg transition-all",
                    active 
                      ? "bg-orange-100" 
                      : "hover:bg-gray-100"
                  )}>
                    {item.isSpecial ? (
                      <span className={cn(
                        "text-lg font-bold",
                        active 
                          ? "text-orange-500 drop-shadow-[0_0_6px_rgba(255,165,0,0.6)]" 
                          : "text-orange-400"
                      )}>
                        ✦
                      </span>
                    ) : (
                      <IconComponent className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs mt-1 font-medium">
                    {item.name}
                  </span>
                  {active && (
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-orange-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Padding - Spacer to prevent content from being hidden behind nav */}
      <div className="h-20 lg:hidden" />
    </>
  );
} 