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
      {/* Sidebar */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-3">
        {/* Logo */}
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
          <span className="text-white font-bold text-lg">✦</span>
        </div>

        {/* Navigation Icons */}
        <div className="flex flex-col space-y-2 flex-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <div key={item.name} className="relative group">
                <Link
                  to={item.href}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105",
                    isActive 
                      ? "bg-orange-500 text-white shadow-lg" 
                      : "bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  )}
                >
                  <item.icon className="h-6 w-6" />
                </Link>
                
                {/* Tooltip */}
                <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.tooltip}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col space-y-2">
          {/* Settings */}
          <div className="relative group">
            <Link
              to="/profile"
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105",
                location.pathname === '/profile' 
                  ? "bg-orange-500 text-white shadow-lg" 
                  : "bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              )}
            >
              <Settings className="h-6 w-6" />
            </Link>
            
            {/* Tooltip */}
            <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Settings
            </div>
          </div>

          {/* User Avatar */}
          {user && (
            <div className="relative group">
              <Link
                to="/profile"
                className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-orange-400 transition-all duration-200 hover:scale-105"
              >
                <Avatar className="w-full h-full">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-orange-500 text-white text-sm font-semibold">
                    {getUserName().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              
              {/* Tooltip */}
              <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Profile
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