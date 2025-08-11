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
      <div className="px-3 py-2 pr-14"> {/* Added right padding to avoid overlap with three-dot menu */}
        {/* Main Header Row */}
        <div className="flex items-center justify-start mb-2"> {/* Changed from justify-between to justify-start */}
          {/* Logo & Title */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-500 rounded-lg">
              <span className="text-sm font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                ✦
              </span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-xs text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className={cn(
            "relative transition-all duration-200 mb-2",
            isSearchFocused ? "scale-[1.02]" : ""
          )}>
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={cn(
                "pl-8 pr-3 h-9 rounded-lg border-gray-200 bg-gray-50/50 transition-all duration-200 text-sm",
                isSearchFocused ? "bg-white border-orange-300 shadow-sm" : "hover:bg-gray-100"
              )}
            />
          </div>
        )}

        {/* Quick Stats or Greeting */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {getUserName()}!
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-xs">{profile?.reading_streak || 0} day streak</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 