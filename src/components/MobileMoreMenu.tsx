import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Heart, 
  Users, 
  PenTool, 
  Settings, 
  LogOut,
  Crown,
  BookOpen,
  Calendar,
  Star,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface MobileMoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const moreMenuItems = [
  { 
    name: 'Sermons', 
    href: '/sermons', 
    icon: PenTool,
    description: 'Sermon library & writer'
  },
  { 
    name: 'Community', 
    href: '/community', 
    icon: Users,
    description: 'Connect with believers'
  },
  { 
    name: 'Favorites', 
    href: '/favorites', 
    icon: Heart,
    description: 'Saved verses & content'
  },
  { 
    name: 'Topical Study', 
    href: '/topical-study', 
    icon: BookOpen,
    description: 'Theme-based studies'
  },
  { 
    name: 'Parables Study', 
    href: '/parables-study', 
    icon: Star,
    description: 'Learn from parables'
  }
];

const profileMenuItems = [
  { 
    name: 'Profile & Settings', 
    href: '/profile', 
    icon: User,
    description: 'Account & preferences'
  },
  { 
    name: 'Subscription', 
    href: '/pricing', 
    icon: Crown,
    description: 'Manage subscription'
  }
];

export function MobileMoreMenu({ isOpen, onClose }: MobileMoreMenuProps) {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const getUserName = () => {
    if (profile?.display_name) {
      return profile.display_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Friend';
  };

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] lg:hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">More Options</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)]">
          {/* User Profile Section */}
          {user && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                <Avatar className="h-12 w-12 ring-2 ring-orange-200">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-orange-500 text-white font-semibold">
                    {getUserName().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {getUserName()}
                  </div>
                  <div className="text-sm text-gray-600">{user?.email}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                    <Calendar className="h-3 w-3" />
                    <span>{profile?.reading_streak || 0} days</span>
                  </div>
                  <div className="text-xs text-gray-500">Reading streak</div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Access</h3>
            <div className="space-y-2">
              {moreMenuItems.map((item) => {
                const active = isActive(item.href);
                const IconComponent = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                      active 
                        ? "bg-orange-50 border border-orange-200 text-orange-600" 
                        : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      active 
                        ? "bg-orange-100" 
                        : "bg-gray-100"
                    )}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Profile & Settings */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Account</h3>
            <div className="space-y-2">
              {profileMenuItems.map((item) => {
                const active = isActive(item.href);
                const IconComponent = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                      active 
                        ? "bg-orange-50 border border-orange-200 text-orange-600" 
                        : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      active 
                        ? "bg-orange-100" 
                        : "bg-gray-100"
                    )}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sign Out */}
          <div className="p-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                signOut();
                onClose();
              }}
            >
              <div className="p-2 bg-red-100 rounded-lg">
                <LogOut className="h-5 w-5" />
              </div>
              <span className="font-medium">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
} 