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

// Mobile Navigation Component - Vertical Sidebar Design
function MobileNavigation() {
  const location = useLocation()
  const { user, profile, signOut } = useAuth()

  const getDisplayName = () => {
    if (profile?.display_name) return profile.display_name.split(' ')[0];
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const mobileNavItems = [
    { icon: BookOpen, path: "/bible", tooltip: "Bible" },
    { icon: MessageCircle, path: "/study-hub", tooltip: "Study Hub" },
    { icon: FileText, path: "/journal", tooltip: "Journal" },
    { icon: Music, path: "/songs", tooltip: "Songs" },
    { icon: Users, path: "/bible-characters", tooltip: "Characters" },
    { icon: Headphones, path: "/sermons", tooltip: "Sermons" },
    { icon: Heart, path: "/favorites", tooltip: "Favorites" },
    { icon: Settings, path: "/profile", tooltip: "Settings" }
  ];

  return (
    <div className="lg:hidden fixed left-0 top-0 h-full w-16 bg-white border-r border-gray-200 z-50 flex flex-col">
      {/* Traffic Light Dots */}
      <div className="flex justify-center items-center py-4">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
        </div>
      </div>

      {/* Logo/Brand */}
      <div className="flex justify-center py-3">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">✦</span>
        </div>
      </div>

      {/* Navigation Icons */}
      <div className="flex-1 flex flex-col items-center py-4 space-y-4">
        {mobileNavItems.slice(0, -1).map((item, index) => (
          <div key={index} className="relative group">
            <Link
              to={item.path}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-black text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5" />
            </Link>
            
            {/* Tooltip */}
            <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {item.tooltip}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center space-y-3 pb-4">
        {/* Settings */}
        <div className="relative group">
          <Link
            to="/profile"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
              location.pathname === '/profile'
                ? 'bg-black text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings className="h-5 w-5" />
          </Link>
          
          {/* Tooltip */}
          <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            Settings
          </div>
        </div>

        {/* User Avatar */}
        {user ? (
          <div className="relative group">
            <Link
              to="/profile"
              className="w-10 h-10 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-gray-400 transition-all duration-200"
            >
              <Avatar className="w-full h-full">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-gray-600 text-white text-sm font-semibold">
                  {profile?.display_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            
            {/* Tooltip */}
            <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {getDisplayName()}
            </div>
          </div>
        ) : (
          <div className="relative group">
            <Link
              to="/auth"
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all duration-200"
            >
              <User className="h-5 w-5" />
            </Link>
            
            {/* Tooltip */}
            <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Sign In
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Mobile Right Sidebar Component with Page-Specific Options
function MobileRightSidebar() {
  const location = useLocation()
  const { user } = useAuth()

  // Define page-specific options
  const getPageOptions = () => {
    switch (location.pathname) {
      case '/bible':
        return [
          { icon: BookOpen, tooltip: "Reading Plan", action: () => {} },
          { icon: Heart, tooltip: "Bookmark", action: () => {} },
          { icon: MessageCircle, tooltip: "Commentary", action: () => {} },
          { icon: Settings, tooltip: "Text Settings", action: () => {} }
        ];
      case '/study-hub':
        return [
          { icon: Plus, tooltip: "New Study", action: () => {} },
          { icon: FileText, tooltip: "Notes", action: () => {} },
          { icon: Star, tooltip: "Favorites", action: () => {} },
          { icon: Settings, tooltip: "AI Settings", action: () => {} }
        ];
      case '/journal':
        return [
          { icon: Plus, tooltip: "New Entry", action: () => {} },
          { icon: FileText, tooltip: "Templates", action: () => {} },
          { icon: Heart, tooltip: "Favorites", action: () => {} },
          { icon: Settings, tooltip: "Journal Settings", action: () => {} }
        ];
      case '/songs':
        return [
          { icon: Plus, tooltip: "Add Song", action: () => {} },
          { icon: Heart, tooltip: "Favorites", action: () => {} },
          { icon: Music, tooltip: "Playlist", action: () => {} },
          { icon: Settings, tooltip: "Audio Settings", action: () => {} }
        ];
      case '/bible-characters':
        return [
          { icon: Plus, tooltip: "Add Character", action: () => {} },
          { icon: BookOpen, tooltip: "Study Guide", action: () => {} },
          { icon: Heart, tooltip: "Favorites", action: () => {} },
          { icon: Settings, tooltip: "View Settings", action: () => {} }
        ];
      case '/sermons':
        return [
          { icon: Plus, tooltip: "Add Sermon", action: () => {} },
          { icon: Headphones, tooltip: "Audio", action: () => {} },
          { icon: Heart, tooltip: "Favorites", action: () => {} },
          { icon: Settings, tooltip: "Playback Settings", action: () => {} }
        ];
      default:
        return [
          { icon: Home, tooltip: "Home", action: () => window.location.href = '/' },
          { icon: MessageCircle, tooltip: "AI Chat", action: () => window.location.href = '/study-hub' },
          { icon: Heart, tooltip: "Favorites", action: () => window.location.href = '/favorites' },
          { icon: Settings, tooltip: "Settings", action: () => window.location.href = '/profile' }
        ];
    }
  };

  const pageOptions = getPageOptions();

  return (
    <div className="lg:hidden fixed right-0 top-0 h-full w-16 bg-white border-l border-gray-200 z-40 flex flex-col">
      {/* Page Actions */}
      <div className="flex-1 flex flex-col items-center py-8 space-y-4">
        {pageOptions.map((option, index) => (
          <div key={index} className="relative group">
            <button
              onClick={option.action}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
            >
              <option.icon className="h-5 w-5" />
            </button>
            
            {/* Tooltip */}
            <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {option.tooltip}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions - Bottom */}
      <div className="flex flex-col items-center space-y-3 pb-8">
        {/* Search */}
        <div className="relative group">
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200">
            <HelpCircle className="h-5 w-5" />
          </button>
          
          {/* Tooltip */}
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            Search
          </div>
        </div>

        {/* Menu Toggle */}
        <div className="relative group">
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200">
            <Grid3X3 className="h-5 w-5" />
          </button>
          
          {/* Tooltip */}
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            Menu
          </div>
        </div>
      </div>
    </div>
  )
}

// Main App Sidebar Export
export function ModernSidebar() {
  const isMobile = useIsMobile()
  
  // For mobile, show mobile navigation + main content with proper spacing
  if (isMobile) {
    return (
      <div className="h-screen bg-gray-900">
        <MobileNavigation />
        <div className="pl-16 pr-16"> {/* Add left and right padding for fixed sidebars */}
          <MainContent />
        </div>
        <MobileRightSidebar />
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