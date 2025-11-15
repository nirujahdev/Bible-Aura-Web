import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileMoreMenu } from './MobileMoreMenu';
import { ModernLayout } from './ModernLayout';
import {
  Menu,
  MoreVertical,
  X,
  BookOpen,
  PenTool,
  Heart,
  User,
  LogOut
} from 'lucide-react';

type NavIcon = 'star' | 'bible' | 'sermon' | 'favorites' | 'profile';

interface MobileNavItem {
  name: string;
  href: string;
  icon: NavIcon;
  description: string;
}

const NAV_ITEMS: MobileNavItem[] = [
  { name: 'AI Chat', href: '/dashboard', icon: 'star', description: 'Biblical AI Assistant' },
  { name: 'Bible', href: '/bible', icon: 'bible', description: 'Read Scripture' },
  { name: 'Reading Plan', href: '/reading-plan', icon: 'favorites', description: 'Bible Reading Planner' },
  { name: 'Sermons', href: '/sermons', icon: 'sermon', description: 'Sermon Library' },
  { name: 'Favorites', href: '/favorites', icon: 'favorites', description: 'Saved Content' },
  { name: 'Profile', href: '/profile', icon: 'profile', description: 'Account & Settings' }
];

const renderIcon = (icon: NavIcon, className: string): ReactNode => {
  switch (icon) {
    case 'star':
      return <span className={cn('font-semibold', className)}>✦</span>;
    case 'bible':
      return <BookOpen className={className} />;
    case 'sermon':
      return <PenTool className={className} />;
    case 'favorites':
      return <Heart className={className} />;
    case 'profile':
      return <User className={className} />;
    default:
      return null;
  }
};

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
  hideHeader?: boolean;
}

export function MobileOptimizedLayout({ 
  children, 
  className = '',
  hideHeader = false
}: MobileOptimizedLayoutProps) {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const location = useLocation();
  const [hamburgerMenuOpen, setHamburgerMenuOpen] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const navigationItems = NAV_ITEMS;

  useEffect(() => {
    if (!isMobile) return;
    const lockScroll = hamburgerMenuOpen || contextMenuOpen;
    document.body.style.overflow = lockScroll ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [hamburgerMenuOpen, contextMenuOpen, isMobile]);

  // If not mobile or not authenticated, use the original ModernLayout
  if (!isMobile || !user) {
    return <ModernLayout>{children}</ModernLayout>;
  }

  return (
    <div className={cn("min-h-screen bg-white flex flex-col pb-[env(safe-area-inset-bottom)]", className)}>
      {/* Mobile Top Header */}
      {!hideHeader && (
      <div className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left - Hamburger Menu */}
          <button 
            onClick={() => setHamburgerMenuOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open navigation menu"
            aria-expanded={hamburgerMenuOpen}
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          
          {/* Center - Logo */}
          <div className="flex flex-col items-center justify-center leading-tight">
            <div className="flex items-center gap-2">
              <span className="text-orange-500 text-xl font-semibold">✦</span>
              <span className="text-lg font-semibold text-gray-900">Bible Aura</span>
            </div>
            <span className="text-[11px] uppercase tracking-[0.18em] text-orange-500 font-medium">
              Bible AI Assistance
            </span>
          </div>
          
          {/* Right - Contextual Three dots */}
          <button 
            onClick={() => setContextMenuOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open quick actions"
            aria-expanded={contextMenuOpen}
          >
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-full">
          {children}
        </div>
      </div>

      {/* Hamburger Navigation Menu */}
      <MobileNavigationMenu 
        isOpen={hamburgerMenuOpen}
        onClose={() => setHamburgerMenuOpen(false)}
        items={navigationItems}
      />

      {/* Contextual More Menu */}
      <MobileMoreMenu 
        isOpen={contextMenuOpen}
        onClose={() => setContextMenuOpen(false)}
        currentPage={location.pathname}
      />
    </div>
  );
}

// Hamburger Menu Component for All Page Navigation
function MobileNavigationMenu({ isOpen, onClose, items }: { isOpen: boolean; onClose: () => void; items: MobileNavItem[] }) {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return ['/', '/dashboard', '/app', '/ai-chat'].includes(location.pathname);
    }
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Navigation Menu Panel */}
      <div 
        className="fixed left-0 top-0 bottom-0 z-50 bg-white shadow-2xl w-72 max-w-[85vw] lg:hidden transform transition-transform duration-300 translate-x-0"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500/10 via-orange-400/10 to-amber-400/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-orange-500">✦</span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-gray-900">Bible Aura</p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-orange-500 font-medium">
                  Bible AI Assistance
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white transition-colors"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {items.map((item) => {
              const active = isActive(item.href);
              const iconClass = item.icon === 'star' ? 'text-base leading-none' : 'h-5 w-5';
              
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    navigate(item.href);
                    onClose();
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200",
                    active 
                      ? "bg-orange-50 border-orange-200 text-orange-600 shadow-sm"
                      : "border-transparent hover:bg-gray-50 text-gray-700"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                      active ? "bg-white text-orange-500" : "bg-orange-50 text-orange-500"
                    )}
                  >
                    {renderIcon(item.icon, iconClass)}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                  {active && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              signOut();
              onClose();
            }}
            className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Sign out"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <LogOut className="h-5 w-5" />
            </span>
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
} 