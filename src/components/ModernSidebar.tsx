import { 
  Plus, Home, Grid3X3, HelpCircle, Settings, User, MessageCircle, 
  Book, Music, Users, Headphones, BookOpen, Mic, TreePine, Heart, FileText,
  Star, LogOut, LogIn, LucideIcon, Menu, Search, Bookmark, PenTool
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
import React from "react"

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
    icon: PenTool,
    path: "/journal",
    isSpecial: true
  },
  {
    label: "Songs",
    icon: Music,
    path: "/songs"
  },
  {
    label: "Sermons",
    icon: PenTool,
    path: "/sermons"
  },

  {
    label: "AI Chat",
    icon: MessageCircle,
    path: "/bible-ai"
  }
]

// Sidebar icon navigation - Updated with better icons
const sidebarTopItems: SidebarIconItem[] = [
  { icon: MessageCircle, action: "new", tooltip: "New Chat" },
  { icon: Home, path: "/dashboard", tooltip: "Dashboard" },
  { icon: BookOpen, path: "/bible", tooltip: "Bible" },
  { icon: Search, path: "/study-hub", tooltip: "AI Study" }
]

const sidebarBottomItems: SidebarIconItem[] = [
  { icon: Settings, path: "/profile", tooltip: "Settings" }
]

// Define all navigation items for mobile
const allNavigationItems: NavigationItem[] = [
  {
    title: "Home",
    url: "/dashboard",
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
    icon: Search,
  },
  {
    title: "Sermons",
    url: "/sermons",
    icon: PenTool,
  },

  {
    title: "AI Chat",
    url: "/bible-ai",
    icon: MessageCircle,
  },
  {
    title: "Favorites",
    url: "/favorites",
    icon: Heart,
  },
  {
    title: "Journal",
    url: "/journal",
    icon: PenTool,
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

// Icon Sidebar Component - Updated with better icons
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

// New Clean Mobile Bottom Navigation
function MobileBottomNavigation() {
  const location = useLocation()
  const { user } = useAuth()

  const mobileNavItems = [
    { icon: Home, path: "/dashboard", label: "Home" },
    { icon: BookOpen, path: "/bible", label: "Bible" },
    { icon: Search, path: "/study-hub", label: "Study" },
    { icon: PenTool, path: "/journal", label: "Journal" },
    { icon: User, path: "/profile", label: "Profile" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        {mobileNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
              location.pathname === item.path
                ? 'text-orange-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <item.icon className={`h-6 w-6 mb-1 ${
              location.pathname === item.path
                ? 'text-orange-500'
                : 'text-gray-500'
            }`} />
            <span className={`text-xs font-medium ${
              location.pathname === item.path
                ? 'text-orange-500'
                : 'text-gray-500'
            }`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Main App Sidebar Export - Updated for new mobile design
export function ModernSidebar({ children }: { children?: React.ReactNode }) {
  const isMobile = useIsMobile()
  
  // For mobile, show clean bottom navigation with main content
  if (isMobile) {
    return (
      <div className="h-screen bg-gray-900">
        <div className="pb-20"> {/* Add bottom padding for navigation */}
          {children || <MainContent />}
        </div>
        <MobileBottomNavigation />
      </div>
    )
  }

  // For desktop, show the icon sidebar + main content
  return (
    <div className="flex h-screen">
      <IconSidebar />
      {children || <MainContent />}
    </div>
  )
} 