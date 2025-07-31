import { 
  Plus, Home, Grid3X3, HelpCircle, Settings, User, MessageCircle, 
  Book, Music, Users, Headphones, BookOpen, Mic, TreePine, Heart, FileText,
  Star, LogOut, LogIn, LucideIcon, Menu
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/hooks/useAuth"
import { useIsMobile } from "@/hooks/use-mobile"
import { User as SupabaseUser } from "@supabase/supabase-js"
import { Database } from "@/integrations/supabase/types"
import { useState } from "react"

type Profile = Database['public']['Tables']['profiles']['Row']

interface SidebarIconItem {
  icon: any;
  path?: string;
  action?: string;
  tooltip: string;
}

interface GridMenuItem {
  label: string;
  icon: any;
  path: string;
  isSpecial?: boolean;
}

interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  description?: string;
  requiresAuth?: boolean;
}

// Main grid menu items for the center content
const gridMenuItems: GridMenuItem[] = [
  {
    label: "Bible Study",
    icon: BookOpen,
    path: "/bible"
  },
  {
    label: "Study Hub",
    icon: MessageCircle,
    path: "/study-hub"
  },
  {
    label: "Journal",
    icon: Plus,
    path: "/journal",
    isSpecial: true
  },
  {
    label: "Songs",
    icon: Music,
    path: "/songs"
  },
  {
    label: "Characters",
    icon: Users,
    path: "/bible-characters"
  },
  {
    label: "Sermons",
    icon: Headphones,
    path: "/sermons"
  }
]

// Sidebar icon navigation
const sidebarTopItems: SidebarIconItem[] = [
  { icon: Plus, action: "new", tooltip: "New Chat" },
  { icon: Home, path: "/", tooltip: "Home" },
  { icon: BookOpen, path: "/study-hub", tooltip: "Study Hub" },
  { icon: HelpCircle, path: "/study-hub", tooltip: "Help" }
]

const sidebarBottomItems: SidebarIconItem[] = [
  { icon: Settings, path: "/profile", tooltip: "Settings" }
]

// Define all navigation items for mobile
const allNavigationItems: NavigationItem[] = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Bible",
    url: "/bible",
    icon: BookOpen,
  },
  {
    title: "Songs",
    url: "/songs",
    icon: Music,
  },
  {
    title: "Study Hub",
    url: "/study-hub",
    icon: HelpCircle,
  },
  {
    title: "Characters",
    url: "/bible-characters",
    icon: Users,
  },
  {
    title: "Sermons",
    url: "/sermons",
    icon: Headphones,
  },
  {
    title: "Favorites",
    url: "/favorites",
    icon: Heart,
  },
  {
    title: "Journal",
    url: "/journal",
    icon: FileText,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
];

// Main Content Component
function MainContent() {
  const { user, profile } = useAuth()
  const [suggestion] = useState("What biblical principles can guide me through difficult times?")
  
  const getDisplayName = () => {
    if (profile?.display_name) return profile.display_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Friend';
  };

  return (
    <div className="flex-1 bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-8 pb-6">
        <h2 className="text-gray-400 text-lg mb-2">Hello {getDisplayName()}!</h2>
        <h1 className="text-3xl font-medium">How can I assist you today?</h1>
      </div>

      {/* Grid Menu */}
      <div className="px-8 flex-1">
        <div className="grid grid-cols-3 gap-4 max-w-4xl">
          {gridMenuItems.map((item, index) => (
            <Link
              key={item.label}
              to={item.path}
              className={`
                relative p-6 rounded-2xl transition-all duration-200 hover:scale-105 group
                ${item.isSpecial 
                  ? 'bg-gradient-to-br from-orange-400 via-orange-500 to-amber-400 text-gray-900' 
                  : 'bg-gray-800 hover:bg-gray-700 text-white'
                }
              `}
            >
              <div className="flex flex-col items-start h-full">
                <div className={`
                  p-3 rounded-xl mb-4
                  ${item.isSpecial 
                    ? 'bg-white/20' 
                    : 'bg-gray-700 group-hover:bg-gray-600'
                  }
                `}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-lg">{item.label}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Suggestion Bar */}
      <div className="p-8 pt-6">
        <div className="max-w-4xl">
          <p className="text-gray-400 text-sm mb-3">Bible Aura suggestion</p>
          <div className="bg-gradient-to-r from-orange-400/20 via-orange-300/10 to-amber-400/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-amber-400 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-gray-900" />
              </div>
              <p className="text-gray-200 flex-1">{suggestion}</p>
            </div>
            <Button 
              className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl px-6"
              onClick={() => window.location.href = `/study-hub?q=${encodeURIComponent(suggestion)}`}
            >
              Ask
            </Button>
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="p-8 pt-4">
        <div className="max-w-4xl">
          <div className="bg-gray-800 rounded-2xl p-4 flex items-center gap-3">
            <input 
              type="text" 
              placeholder="Message Bible Aura"
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  window.location.href = `/study-hub?q=${encodeURIComponent(e.currentTarget.value)}`;
                }
              }}
            />
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Icon Sidebar Component
function IconSidebar() {
  const location = useLocation()
  const { user, profile, signOut } = useAuth()

  return (
    <div className="w-16 bg-gray-900 flex flex-col items-center py-4 border-r border-gray-800">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">✦</span>
        </div>
      </div>

      {/* Top Navigation */}
      <div className="flex flex-col gap-3 mb-auto">
        {sidebarTopItems.map((item, index) => (
          <div key={index} className="relative group">
            {item.path ? (
              <Link
                to={item.path}
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                  ${location.pathname === item.path 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            ) : (
              <button
                onClick={() => window.location.href = '/study-hub'}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                <item.icon className="h-5 w-5" />
              </button>
            )}
            
            {/* Tooltip */}
            <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {item.tooltip}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-col gap-3">
        {sidebarBottomItems.map((item, index) => (
          <div key={index} className="relative group">
            <Link
              to={item.path!}
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                ${location.pathname === item.path 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <item.icon className="h-5 w-5" />
            </Link>
            
            {/* Tooltip */}
            <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {item.tooltip}
            </div>
          </div>
        ))}

        {/* User Avatar */}
        {user && (
          <div className="relative group mt-3">
            <Link
              to="/profile"
              className="w-10 h-10 rounded-xl overflow-hidden border-2 border-gray-700 hover:border-orange-400 transition-all duration-200"
            >
              <Avatar className="w-full h-full">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-orange-500 text-white text-sm">
                  {(profile?.display_name || user?.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            
            {/* Tooltip */}
            <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Profile
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Mobile Navigation Component - New Modern Design
function MobileNavigation() {
  const location = useLocation()
  const { user, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  const getDisplayName = () => {
    if (profile?.display_name) return profile.display_name.split(' ')[0];
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="fixed top-4 left-4 z-[60] h-12 w-12 p-0 bg-white/95 backdrop-blur-sm border shadow-lg hover:bg-gray-50 rounded-2xl transition-all duration-300"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-[280px] p-0 bg-white border-r">
          {/* Clean Header */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">✦</span>
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">Bible Aura</h1>
                <p className="text-xs text-gray-500">v1.0</p>
              </div>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="px-6 py-4 border-b">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button className="flex-1 bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded-md">
                PERSONAL
              </button>
              <button className="flex-1 text-gray-600 text-sm font-medium py-2 px-4 rounded-md hover:bg-gray-200">
                BUSINESS
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-1">
              {allNavigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    location.pathname === item.url 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`h-5 w-5`} />
                  <span className="font-medium text-sm">{item.title}</span>
                  {item.title === 'Chat' && (
                    <div className="ml-auto">
                      <span className="bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">1</span>
                    </div>
                  )}
                  {item.title === 'Notifications' && (
                    <div className="ml-auto">
                      <span className="bg-green-500 text-white text-xs font-bold rounded-full px-2 py-0.5">24</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {/* Account Section */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">ACCOUNT</h3>
              <div className="space-y-1">
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  <Settings className="h-5 w-5" />
                  <span className="font-medium text-sm">Settings</span>
                </Link>
              </div>
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="p-6 border-t bg-gray-50/50">
            {user ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-blue-500 text-white text-sm font-semibold">
                    {profile?.display_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 truncate">
                    {getDisplayName()}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={signOut}
                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <p className="text-sm text-gray-600 mb-3">Sign in to access all features</p>
                <Link to="/auth">
                  <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

// Main App Sidebar Export
export function ModernSidebar() {
  const isMobile = useIsMobile()
  
  // For mobile, show mobile navigation + main content
  if (isMobile) {
    return (
      <div className="h-screen bg-gray-900">
        <MobileNavigation />
        <MainContent />
      </div>
    )
  }

  // For desktop, show the icon sidebar + main content
  return (
    <div className="flex h-screen">
      <IconSidebar />
      <MainContent />
    </div>
  )
} 