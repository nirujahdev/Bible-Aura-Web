import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MessageCircle, BookOpen, Music, Users, Headphones, 
  Heart, FileText, User, Settings, HelpCircle, TreePine, 
  Mic, Star, Search, Library, Home, Plus, Menu, PenTool,
  LogOut
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
  tooltip: string;
}

const sidebarItems: SidebarItem[] = [
  { name: 'AI Chat', href: '/ai-chat', icon: MessageCircle, tooltip: 'AI Bible Chat Assistant' },
  { name: 'Bible', href: '/bible', icon: BookOpen, tooltip: 'Bible Study' },
  { name: 'Songs', href: '/songs', icon: Music, tooltip: 'Worship Songs' },
  { name: 'Study Hub', href: '/study-hub', icon: Library, tooltip: 'Study Hub - Q&A, Sermons, Parables & Bible Characters' },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      {/* Mobile Top Header - Always visible on mobile */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4 h-16">
          {/* Left: Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 hover:bg-gray-100 rounded-xl"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </Button>
            </SheetTrigger>
            
            <SheetContent side="left" className="w-[320px] p-0 bg-white">
              {/* Mobile Header */}
              <div className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-3">
                    <span className="text-xl font-bold">✦</span>
                  </div>
                  <h1 className="text-xl font-bold">Bible Aura</h1>
                  <p className="text-sm text-white/80 mt-1">AI Biblical Assistant</p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-1">
                  {sidebarItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all ${
                        location.pathname === item.href 
                          ? 'bg-orange-50 border-l-4 border-orange-500' 
                          : ''
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${
                        location.pathname === item.href 
                          ? 'text-orange-500' 
                          : 'text-gray-600'
                      }`} />
                      <span className={`font-medium text-sm ${
                        location.pathname === item.href 
                          ? 'text-orange-500' 
                          : 'text-gray-700'
                      }`}>
                        {item.name}
                      </span>
                    </Link>
                  ))}
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
                          <Settings className="h-4 w-4 mr-1" />
                          Profile
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-red-600"
                        onClick={() => signOut()}
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Center: Logo and Title */}
          <div className="flex items-center space-x-2">
            <span className="text-orange-600 font-bold text-2xl">✦</span>
            <h1 className="text-lg font-bold text-gray-900">Bible Aura</h1>
          </div>

          {/* Right: User Avatar */}
          {user && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold text-sm">
                {getUserName().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-16 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex-col shadow-sm">
          {/* Logo - Fixed at top */}
          <div className="flex-shrink-0 p-3 border-b border-gray-100">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">✦</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 py-4 space-y-2 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <div key={item.name} className="relative group px-3">
                  <Link
                    to={item.href}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110",
                      isActive 
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-200" 
                        : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 shadow-sm border border-gray-100"
                    )}
                    title={item.tooltip}
                  >
                    <item.icon className="h-5 w-5" />
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

          {/* Bottom Section - Fixed */}
          <div className="flex-shrink-0 border-t border-gray-100 p-3 space-y-2 bg-gradient-to-t from-white to-gray-50">
            {/* Settings */}
            <div className="relative group">
              <Link
                to="/profile"
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110",
                  location.pathname === '/profile' 
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-200" 
                    : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 shadow-sm border border-gray-100"
                )}
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </Link>
              
              {/* Tooltip */}
              <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                Settings
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </div>

            {/* User Avatar */}
            {user && (
              <div className="relative group">
                <Link
                  to="/profile"
                  className="w-10 h-10 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-orange-400 transition-all duration-300 block transform hover:scale-110 shadow-sm"
                  title="Profile"
                >
                  <Avatar className="w-full h-full">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-semibold">
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

        {/* Main Content */}
        <div className="flex-1 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
} 