import { 
  Home, Book, MessageCircle, BarChart3, Headphones, Map, Bookmark, 
  FileText, Calendar, Heart, TrendingUp, LogOut, User, Settings, 
  Sparkles, Star, LogIn, UserPlus, Menu, X, Music, HelpCircle, 
  Users, BookOpen, Mic, TreePine, LucideIcon 
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useState } from "react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/hooks/useAuth"
import { useSidebar } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { Database } from "@/integrations/supabase/types"

type Profile = Database['public']['Tables']['profiles']['Row']

interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  description?: string;
  requiresAuth?: boolean;
}

interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

// Define all navigation items in a flat structure (no groups)
const allNavigationItems: NavigationItem[] = [
  // Core Features
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Bible",
    url: "/bible",
    icon: Book,
  },
  {
    title: "AI Chat",
    url: "/chat",
    icon: MessageCircle,
  },
  
  // Discovery Features
  {
    title: "Songs",
    url: "/songs",
    icon: Music,
  },
  {
    title: "Bible Q&A",
    url: "/bible-qa",
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
  
  // Advanced Study
  {
    title: "Topical Study",
    url: "/topical-study",
    icon: BookOpen,
  },
  {
    title: "Sermon Library",
    url: "/sermon-library", 
    icon: Mic,
  },
  {
    title: "Parables Study",
    url: "/parables-study",
    icon: TreePine,
  },
  
  // Personal Features
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

// Guest navigation (limited features)
const guestNavigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Songs",
    url: "/songs",
    icon: Music,
  },
  {
    title: "Bible Q&A",
    url: "/bible-qa",
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
];

// Enhanced Mobile Navigation Component
function MobileNavigation({ navigation, user, profile, signOut }: { navigation: NavigationGroup[], user: SupabaseUser | null, profile: Profile | null, signOut: () => void }) {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="fixed top-4 left-4 z-[60] h-12 w-12 p-0 bg-white/95 backdrop-blur-sm border-2 border-primary/20 shadow-lg hover:bg-primary/5 hover:border-primary/40 rounded-xl transition-all duration-300 active:scale-95"
          >
            <div className="relative">
              <Menu className="h-5 w-5 text-gray-700" />
              <span className="absolute -top-0.5 -right-0.5 text-xs font-bold text-primary">✦</span>
            </div>
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-[320px] p-0 bg-white">
          {/* Enhanced Mobile Header */}
          <div className="p-6 bg-gradient-to-r from-primary to-primary/90 text-white">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-3 backdrop-blur-sm">
                <span className="text-xl font-bold">✦</span>
              </div>
              <h1 className="text-xl font-bold">Bible Aura</h1>
              <p className="text-sm text-white/80 mt-1">Biblical Wisdom AI</p>
            </div>
          </div>

          {/* Mobile Navigation with Better Grouping */}
          <div className="flex-1 overflow-y-auto">
            {navigation.map((group) => (
              <div key={group.title} className="px-4 py-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  {group.title}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.title}
                      to={item.url}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 ${
                        location.pathname === item.url 
                          ? 'bg-primary/10 border-l-4 border-primary shadow-sm' 
                          : 'hover:translate-x-1'
                      }`}
                    >
                      <div className="relative flex items-center">
                        <item.icon className={`h-5 w-5 ${
                          location.pathname === item.url 
                            ? 'text-primary' 
                            : 'text-gray-600'
                        }`} />
                        {location.pathname === item.url && (
                          <span className="absolute -top-1 -right-1 text-xs font-bold text-primary">✦</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${
                          location.pathname === item.url 
                            ? 'text-primary font-semibold' 
                            : 'text-gray-700'
                        }`}>
                          {item.title}
                          {!user && item.requiresAuth && (
                            <Star className="h-3 w-3 text-amber-500 inline ml-1" />
                          )}
                        </div>
                        {item.description && (
                          <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Mobile Footer */}
          <div className="p-4 border-t bg-gray-50/50">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border shadow-sm">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {profile?.display_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-800 truncate">
                      {profile?.display_name || 'User'}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/profile">
                    <Button variant="outline" size="sm" className="w-full">
                      <User className="h-4 w-4 mr-1" />
                      Profile
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={signOut} className="w-full text-red-600 border-red-200 hover:bg-red-50">
                    <LogOut className="h-4 w-4 mr-1" />
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center p-3 bg-white rounded-xl">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg mb-2">
                    <span className="text-sm font-bold text-primary">✦</span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium mb-1">Welcome to Bible Aura</p>
                  <p className="text-xs text-gray-500">Sign in to unlock all features</p>
                </div>
                <Link to="/auth">
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white shadow-sm">
                    <LogIn className="h-4 w-4 mr-2" />
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

export function AppSidebar() {
  const location = useLocation()
  const { user, profile, signOut } = useAuth()
  const { state, toggleSidebar } = useSidebar()
  const isExpanded = state === "expanded"
  const isMobile = useIsMobile()
  
  // Choose navigation based on authentication status
  const navigationItems = user ? allNavigationItems : guestNavigationItems

  // Return mobile navigation for mobile devices
  if (isMobile) {
    return <MobileNavigation navigation={[{title: "Menu", items: navigationItems}]} user={user} profile={profile} signOut={signOut} />
  }

  return (
    <>
      {/* Always visible menu trigger when collapsed - Enhanced visibility */}
      {!isExpanded && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="fixed top-6 left-6 z-[9999] h-14 w-14 p-0 bg-white border-2 border-orange-200 shadow-lg hover:bg-orange-50 hover:border-orange-300 rounded-xl transition-all duration-200"
        >
          <div className="relative">
            <Menu className="h-7 w-7 text-gray-700" />
            <span className="absolute -top-1 -right-1 text-xs font-bold text-orange-500">✦</span>
          </div>
        </Button>
      )}
      
      <Sidebar className="border-r border-gray-200 bg-white">
      {/* Desktop Header with Orange Background */}
      <SidebarHeader className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3 flex-1 justify-center">
            {isExpanded ? (
              <div className="text-center">
                <h1 className="text-xl font-bold text-white">✦Bible Aura</h1>
              </div>
            ) : (
              <div className="h-12 w-12 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">✦</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="h-8 w-8 p-0 hover:bg-white/20 text-white"
          >
            {isExpanded ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </SidebarHeader>

      {/* Desktop Content - Flat Menu */}
      <SidebarContent className="px-4 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className={`hover:bg-gray-100 rounded-lg p-3 ${
                      !isExpanded ? 'justify-center' : ''
                    } ${
                      location.pathname === item.url 
                        ? 'bg-blue-50 border border-blue-200 text-blue-700' 
                        : 'text-gray-700'
                    }`}
                  >
                    <Link to={item.url} className="flex items-center gap-3 w-full">
                      {isExpanded ? (
                        <>
                          <item.icon className={`h-5 w-5 flex-shrink-0 ${
                            location.pathname === item.url 
                              ? 'text-blue-600' 
                              : 'text-gray-600'
                          }`} />
                          <span className="font-medium text-sm truncate">{item.title}</span>
                        </>
                      ) : (
                        <div className="relative flex items-center justify-center">
                          <item.icon className={`h-4 w-4 ${
                            location.pathname === item.url 
                              ? 'text-blue-600' 
                              : 'text-gray-600'
                          }`} />
                          <span className={`absolute -top-1 -right-1 text-xs font-bold ${
                            location.pathname === item.url 
                              ? 'text-blue-600' 
                              : 'text-orange-500'
                          }`}>✦</span>
                        </div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Desktop Footer */}
      <SidebarFooter className="p-4 border-t border-gray-200">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                  {profile?.display_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isExpanded && (
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-800 truncate">
                    {profile?.display_name || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                </div>
              )}
            </div>
            {isExpanded && (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/profile">
                  <Button variant="outline" size="sm" className="w-full">
                    <User className="h-4 w-4 mr-1" />
                    Profile
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={signOut} className="w-full">
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {isExpanded && (
              <div className="text-center">
                <p className="text-sm text-gray-700 font-medium mb-1">Welcome to Bible Aura</p>
                <p className="text-xs text-gray-500">Sign in for full features</p>
              </div>
            )}
            <Link to="/auth">
              <Button 
                size="sm" 
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                <LogIn className="h-4 w-4 mr-2" />
                {isExpanded ? "Sign In" : "Sign In"}
              </Button>
            </Link>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
    </>
  )
}