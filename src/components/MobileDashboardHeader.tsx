import React, { useState } from 'react';
import { Search, Bell, User, Settings, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MobileDashboardHeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function MobileDashboardHeader({ 
  title = "Dashboard",
  subtitle,
  showSearch = false,
  searchPlaceholder = "Search...",
  onSearch,
  className = ""
}: MobileDashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const isMobile = useIsMobile();
  const { user, profile } = useAuth();

  if (!isMobile || !user) return null;

  const getUserName = () => {
    if (profile?.display_name) {
      return profile.display_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Friend';
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div className={cn(
      "sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-30 lg:hidden",
      className
    )}>
      <div className="px-4 py-3">
        {/* Main Header Row */}
        <div className="flex items-center justify-between mb-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-xl">
              <span className="text-xl font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                ✦
              </span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />
            </Button>

            {/* Profile */}
            <Link to="/profile">
              <Avatar className="h-10 w-10 ring-2 ring-gray-200 hover:ring-orange-300 transition-all">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-orange-500 text-white font-semibold text-sm">
                  {getUserName().charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className={cn(
            "relative transition-all duration-200",
            isSearchFocused ? "scale-[1.02]" : ""
          )}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={cn(
                "pl-10 pr-4 h-11 rounded-xl border-gray-200 bg-gray-50/50 transition-all duration-200",
                isSearchFocused ? "bg-white border-orange-300 shadow-sm" : "hover:bg-gray-100"
              )}
            />
          </div>
        )}

        {/* Quick Stats or Greeting */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {getUserName()}!
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span>{profile?.reading_streak || 0} day streak</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 