import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MessageCircle, BookOpen, BarChart3, 
  Heart, FileText, User, Settings,
  Headphones, Home, PenTool
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
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
  tooltip?: string;
}

const sidebarItems: SidebarItem[] = [
  { name: 'AI Chat', href: '/dashboard', icon: () => <span className="text-2xl font-bold">✦</span>, tooltip: 'AI Chat Dashboard' },
  { name: 'Bible', href: '/bible', icon: BookOpen, tooltip: 'Bible Study' },
  { name: 'Analytics', href: '/study-hub', icon: BarChart3, tooltip: 'Study Hub' },
  { name: 'Sermons', href: '/sermons', icon: PenTool, tooltip: 'Sermons' },
  { name: 'Favorites', href: '/favorites', icon: Heart, tooltip: 'Favorites' },
  { name: 'Journal', href: '/journal', icon: FileText, tooltip: 'Journal' },
];

export function ModernLayout({ children }: ModernLayoutProps) {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-white flex">
      {/* Desktop Sidebar - Exactly matching the image */}
      <div className="hidden lg:flex w-16 bg-white border-r border-gray-100 flex-col shadow-sm">
        {/* Navigation Icons */}
        <div className="flex-1 py-6 px-2 space-y-2">
          {sidebarItems.map((item) => {
            const active = isActive(item.href);
            const IconComponent = item.icon;
            return (
              <div key={item.name} className="relative group">
                <Link
                  to={item.href}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 relative",
                    active 
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-300/50" 
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  )}
                  title={item.tooltip}
                >
                  {item.name === 'AI Chat' ? (
                    <span className={cn(
                      "text-2xl font-bold",
                      active 
                        ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
                        : "text-orange-500 drop-shadow-[0_0_6px_rgba(255,165,0,0.6)]"
                    )}>
                      ✦
                    </span>
                  ) : (
                    <IconComponent className="h-6 w-6" />
                  )}
                </Link>
                
                {/* Tooltip */}
                <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {item.tooltip}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Section - Settings and User */}
        <div className="p-2 space-y-2 border-t border-gray-100">
          {/* Settings */}
          <div className="relative group">
            <Link
              to="/profile"
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
                isActive('/profile') 
                  ? "bg-orange-500 text-white shadow-lg" 
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              )}
              title="Settings & Profile"
            >
              <User className="h-6 w-6" />
            </Link>
            
            {/* Tooltip */}
            <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg">
              Settings & Profile
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>

          {/* User Avatar */}
          {user && (
            <div className="relative group">
              <Link
                to="/profile"
                className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-orange-400 transition-all duration-300 block shadow-sm"
                title={`Profile: ${getUserName()}`}
              >
                <Avatar className="w-full h-full">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-orange-500 text-white text-sm font-semibold rounded-xl">
                    {getUserName().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              
              {/* Tooltip */}
              <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                {getUserName()}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="fixed top-4 left-4 z-50 h-10 w-10 p-0 hover:bg-gray-100 rounded-xl bg-white shadow-sm"
            >
              <div className="h-5 w-5 flex flex-col justify-center space-y-1">
                <div className="h-0.5 bg-gray-600 rounded"></div>
                <div className="h-0.5 bg-gray-600 rounded"></div>
                <div className="h-0.5 bg-gray-600 rounded"></div>
              </div>
            </Button>
          </SheetTrigger>
          
          <SheetContent side="left" className="w-[280px] p-0 bg-white">
            {/* Mobile Header */}
            <div className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-3">
                  <span className="text-2xl font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">✦</span>
                </div>
                <h1 className="text-xl font-bold">Bible Aura</h1>
                <p className="text-sm text-white/80 mt-1">AI Biblical Assistant</p>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-1">
                {sidebarItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all ${
                        isActive(item.href) 
                          ? 'bg-orange-50 border-l-4 border-orange-500' 
                          : ''
                      }`}
                    >
                      {item.name === 'AI Chat' ? (
                        <span className={cn(
                          "text-xl font-bold",
                          isActive(item.href) 
                            ? "text-orange-500 drop-shadow-[0_0_6px_rgba(255,165,0,0.6)]" 
                            : "text-orange-500 drop-shadow-[0_0_4px_rgba(255,165,0,0.4)]"
                        )}>
                          ✦
                        </span>
                      ) : (
                        <IconComponent className={`h-5 w-5 ${
                          isActive(item.href) 
                            ? 'text-orange-500' 
                            : 'text-gray-600'
                        }`} />
                      )}
                      <span className={`font-medium text-sm ${
                        isActive(item.href) 
                          ? 'text-orange-500' 
                          : 'text-gray-700'
                      }`}>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="p-4 border-t bg-gray-50/50">
              {user && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-orange-500 text-white">
                        {getUserName().charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-800">
                        {getUserName()}
                      </div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/profile">
                      <Button variant="outline" size="sm" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                        <User className="h-4 w-4 mr-1" />
                        Profile
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-red-600"
                      onClick={() => signOut()}
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white">
        {children}
      </div>
    </div>
  );
} 