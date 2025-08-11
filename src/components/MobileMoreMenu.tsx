import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  X,
  Plus,
  MessageCircle,
  Search,
  Home,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface MobileMoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

// Main navigation items
const mainNavItems = [
  { 
    name: 'AI Chat', 
    href: '/dashboard', 
    icon: MessageCircle,
    description: 'Bible AI Assistant',
    quickAction: { name: 'New Chat', action: 'new-chat' }
  },
  { 
    name: 'Bible', 
    href: '/bible', 
    icon: BookOpen,
    description: 'Read Scripture',
    quickAction: { name: 'Random Verse', action: 'random-verse' }
  },
  { 
    name: 'Study Hub', 
    href: '/study-hub', 
    icon: Search,
    description: 'Bible Study Tools',
    quickAction: { name: 'New Study', action: 'new-study' }
  },
  { 
    name: 'Journal', 
    href: '/journal', 
    icon: PenTool,
    description: 'Personal reflections',
    quickAction: { name: 'New Entry', action: 'new-journal' }
  }
];

// Additional features
const additionalItems = [
  { 
    name: 'Sermons', 
    href: '/sermons', 
    icon: PenTool,
    description: 'Sermon library & writer',
    quickAction: { name: 'Write Sermon', action: 'new-sermon' }
  },
  { 
    name: 'Community', 
    href: '/community', 
    icon: Users,
    description: 'Connect with believers',
    quickAction: { name: 'New Discussion', action: 'new-discussion' }
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
  const navigate = useNavigate();
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
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === href;
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-chat':
        // Reset chat or start new conversation
        navigate('/dashboard');
        window.location.reload();
        break;
      case 'random-verse':
        // Navigate to random verse
        navigate('/bible?random=true');
        break;
      case 'new-study':
        navigate('/study-hub?new=true');
        break;
      case 'new-journal':
        navigate('/journal?new=true');
        break;
      case 'new-sermon':
        navigate('/sermons?new=true');
        break;
      case 'new-discussion':
        navigate('/community?new=true');
        break;
      default:
        break;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Side Menu Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 bg-white shadow-2xl w-72 max-w-[80vw] lg:hidden transform transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center gap-2">
            <MoreVertical className="h-4 w-4 text-orange-500" />
            <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/50 rounded-md transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-full pb-4">
          {/* User Profile Section */}
          {user && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                <Avatar className="h-8 w-8 ring-1 ring-orange-200">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-orange-500 text-white font-semibold text-xs">
                    {getUserName().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-xs truncate">
                    {getUserName()}
                  </div>
                  <div className="text-xs text-gray-600 truncate">{user?.email}</div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full">
                    <Calendar className="h-2.5 w-2.5" />
                    <span className="text-xs">{profile?.reading_streak || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Navigation with Quick Actions */}
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-700 mb-2">Main Navigation</h3>
            <div className="space-y-1">
              {mainNavItems.map((item) => {
                const active = isActive(item.href);
                const IconComponent = item.icon;
                
                return (
                  <div key={item.name} className="space-y-1">
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2.5 p-2 rounded-md transition-all duration-200",
                        active 
                          ? "bg-orange-50 border border-orange-200 text-orange-600" 
                          : "hover:bg-gray-50 text-gray-700"
                      )}
                    >
                      <div className={cn(
                        "p-1 rounded-sm",
                        active 
                          ? "bg-orange-100" 
                          : "bg-gray-100"
                      )}>
                        <IconComponent className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs truncate">{item.name}</div>
                        <div className="text-xs text-gray-500 truncate">{item.description}</div>
                      </div>
                    </Link>
                    
                    {/* Quick Action */}
                    {item.quickAction && (
                      <button
                        onClick={() => handleQuickAction(item.quickAction.action)}
                        className="w-full flex items-center gap-1.5 p-1.5 ml-3 rounded-sm bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
                      >
                        <Plus className="h-2.5 w-2.5" />
                        <span className="text-xs font-medium">{item.quickAction.name}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Features */}
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-700 mb-2">More Features</h3>
            <div className="space-y-1">
              {additionalItems.map((item) => {
                const active = isActive(item.href);
                const IconComponent = item.icon;
                
                return (
                  <div key={item.name} className="space-y-1">
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2.5 p-2 rounded-md transition-all duration-200",
                        active 
                          ? "bg-orange-50 border border-orange-200 text-orange-600" 
                          : "hover:bg-gray-50 text-gray-700"
                      )}
                    >
                      <div className={cn(
                        "p-1 rounded-sm",
                        active 
                          ? "bg-orange-100" 
                          : "bg-gray-100"
                      )}>
                        <IconComponent className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs truncate">{item.name}</div>
                        <div className="text-xs text-gray-500 truncate">{item.description}</div>
                      </div>
                    </Link>
                    
                    {/* Quick Action */}
                    {item.quickAction && (
                      <button
                        onClick={() => handleQuickAction(item.quickAction.action)}
                        className="w-full flex items-center gap-1.5 p-1.5 ml-3 rounded-sm bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
                      >
                        <Plus className="h-2.5 w-2.5" />
                        <span className="text-xs font-medium">{item.quickAction.name}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Profile & Settings */}
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-700 mb-2">Account</h3>
            <div className="space-y-1">
              {profileMenuItems.map((item) => {
                const active = isActive(item.href);
                const IconComponent = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-2.5 p-2 rounded-md transition-all duration-200",
                      active 
                        ? "bg-orange-50 border border-orange-200 text-orange-600" 
                        : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <div className={cn(
                      "p-1 rounded-sm",
                      active 
                        ? "bg-orange-100" 
                        : "bg-gray-100"
                    )}>
                      <IconComponent className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs truncate">{item.name}</div>
                      <div className="text-xs text-gray-500 truncate">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sign Out */}
          <div className="p-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-8 text-red-600 border-red-200 hover:bg-red-50 text-xs"
              onClick={() => {
                signOut();
                onClose();
              }}
            >
              <div className="p-0.5 bg-red-100 rounded-sm">
                <LogOut className="h-3 w-3" />
              </div>
              <span className="font-medium">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
} 