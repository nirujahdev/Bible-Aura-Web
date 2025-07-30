import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MessageCircle, BookOpen, Music, Users, Headphones, 
  Heart, FileText, User, Settings, HelpCircle, TreePine, 
  Mic, Star, Search, Library, Home, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface ModernLayoutProps {
  children: ReactNode;
}

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  tooltip: string;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Chat', href: '/', icon: MessageCircle, tooltip: 'AI Chat' },
  { name: 'Bible', href: '/bible', icon: BookOpen, tooltip: 'Bible Study' },
  { name: 'Songs', href: '/songs', icon: Music, tooltip: 'Worship Songs' },
  { name: 'Characters', href: '/bible-characters', icon: Users, tooltip: 'Bible Characters' },
  { name: 'Study Hub', href: '/study', icon: BookOpen, tooltip: 'Study Hub - Q&A, Sermons, Parables & Topics' },
  { name: 'Sermons', href: '/sermons', icon: Headphones, tooltip: 'Sermons' },
  { name: 'Favorites', href: '/favorites', icon: Heart, tooltip: 'Favorites' },
  { name: 'Journal', href: '/journal', icon: FileText, tooltip: 'Journal' },
];

export function ModernLayout({ children }: ModernLayoutProps) {
  const location = useLocation();
  const { user, profile } = useAuth();

  const getUserName = () => {
    if (profile?.display_name) {
      return profile.display_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Friend';
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Compact Scrollable Sidebar */}
      <div className="w-14 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        {/* Logo - Fixed at top */}
        <div className="flex-shrink-0 p-2 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">✦</span>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto py-2 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <div key={item.name} className="relative group px-2">
                <Link
                  to={item.href}
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
                    isActive 
                      ? "bg-orange-500 text-white shadow-md" 
                      : "bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  )}
                  title={item.tooltip}
                >
                  <item.icon className="h-5 w-5" />
                </Link>
                
                {/* Tooltip */}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 ml-1">
                  {item.tooltip}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Section - Fixed */}
        <div className="flex-shrink-0 border-t border-gray-100 p-2 space-y-1">
          {/* Settings */}
          <div className="relative group">
            <Link
              to="/profile"
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
                location.pathname === '/profile' 
                  ? "bg-orange-500 text-white shadow-md" 
                  : "bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              )}
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>
            
            {/* Tooltip */}
            <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 ml-1">
              Settings
            </div>
          </div>

          {/* User Avatar */}
          {user && (
            <div className="relative group">
              <Link
                to="/profile"
                className="w-10 h-10 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-orange-400 transition-all duration-200 block"
                title="Profile"
              >
                <Avatar className="w-full h-full">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-orange-500 text-white text-xs font-semibold">
                    {getUserName().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              
              {/* Tooltip */}
              <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 ml-1">
                {getUserName()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white">
        {children}
      </div>
    </div>
  );
} 