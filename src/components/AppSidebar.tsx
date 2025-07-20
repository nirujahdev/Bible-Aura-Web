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
  description: string;
  requiresAuth?: boolean;
}

interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

// Define guest navigation (features available without login)
const guestNavigation: NavigationGroup[] = [
  {
    title: "Explore",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        description: "Your spiritual dashboard"
      },
      {
        title: "Read Bible",
        url: "/bible",
        icon: Book,
        description: "Browse scripture"
      },
      {
        title: "Songs",
        url: "/songs",
        icon: Music,
        description: "Worship music"
      },
      {
        title: "Bible Q&A",
        url: "/bible-qa",
        icon: HelpCircle,
        description: "Questions & answers"
      },
      {
        title: "Characters",
        url: "/bible-characters",
        icon: Users,
        description: "Biblical figures"
      }
    ]
  },
  {
    title: "Advanced Study",
    items: [
      {
        title: "Topical Study",
        url: "/topical-study",
        icon: BookOpen,
        description: "500+ theological topics"
      },
      {
        title: "Sermon Library",
        url: "/sermon-library", 
        icon: Mic,
        description: "Famous preacher sermons"
      },
      {
        title: "Parables Study",
        url: "/parables-study",
        icon: TreePine,
        description: "Interactive parable database"
      },
    ]
  },
  {
    title: "Features",
    items: [
      {
        title: "AI Chat",
        url: "/chat",
        icon: MessageCircle,
        description: "Ask questions",
        requiresAuth: true
      },
      {
        title: "Journal",
        url: "/journal",
        icon: FileText,
        description: "Personal notes",
        requiresAuth: true
      },
      {
        title: "Sermons",
        url: "/sermons",
        icon: Headphones,
        description: "Listen & learn",
        requiresAuth: true
      },
      {
        title: "Favorites",
        url: "/favorites",
        icon: Heart,
        description: "Saved content",
        requiresAuth: true
      }
    ]
  }
]

// Define authenticated user navigation (full features)
const authenticatedNavigation: NavigationGroup[] = [
  {
    title: "Core",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        description: "Your home"
      },
      {
        title: "Bible",
        url: "/bible",
        icon: Book,
        description: "Read scripture"
      },
      {
        title: "AI Chat",
        url: "/chat",
        icon: MessageCircle,
        description: "Ask questions"
      },
    ]
  },
  {
    title: "Discovery",
    items: [
      {
        title: "Songs",
        url: "/songs",
        icon: Music,
        description: "Worship music"
      },
      {
        title: "Bible Q&A",
        url: "/bible-qa",
        icon: HelpCircle,
        description: "Questions & answers"
      },
      {
        title: "Characters",
        url: "/bible-characters",
        icon: Users,
        description: "Biblical figures"
      },
      {
        title: "Sermons",
        url: "/sermons",
        icon: Headphones,
        description: "Listen & learn"
      },
    ]
  },
  {
    title: "Advanced Study",
    items: [
      {
        title: "Topical Study",
        url: "/topical-study",
        icon: BookOpen,
        description: "500+ theological topics"
      },
      {
        title: "Sermon Library",
        url: "/sermon-library", 
        icon: Mic,
        description: "Famous preacher sermons"
      },
      {
        title: "Parables Study",
        url: "/parables-study",
        icon: TreePine,
        description: "Interactive parable database"
      },
    ]
  },
  {
    title: "Personal",
    items: [
      {
        title: "Favorites",
        url: "/favorites",
        icon: Heart,
        description: "Your saved content"
      },
      {
        title: "Journal",
        url: "/journal",
        icon: FileText,
        description: "Your notes"
      },
      {
        title: "Profile",
        url: "/profile",
        icon: User,
        description: "Your account"
      },
    ]
  },
]

// Mobile Navigation Component - Simplified without animations
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
            className="fixed top-4 left-4 z-[60] h-12 w-12 p-0 bg-white/95 backdrop-blur-md border-2 border-orange-200/80 shadow-lg hover:bg-orange-50 rounded-xl"
          >
            <Menu className="h-6 w-6 text-orange-600" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="w-[85vw] max-w-[320px] p-0 bg-white border-r-2 border-orange-200/50"
        >
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="p-4 border-b border-orange-200/60 bg-orange-50">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="h-10 w-10 flex items-center justify-center bg-primary/10 rounded-full">
                    <span className="text-lg font-bold text-primary">✦</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-orange-700">
                    ✦Bible Aura
                  </h1>
                  <p className="text-xs text-orange-600 font-medium">
                    AI Biblical Insights
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Navigation Content */}
            <div className="flex-1 px-4 py-4 overflow-y-auto">
              {navigation.map((group) => (
                <div key={group.title} className="mb-6">
                  <div className="text-sm font-bold text-orange-700 mb-3 flex items-center gap-2 px-2">
                    <Star className="h-4 w-4" />
                    {group.title}
                  </div>
                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <Link
                        key={item.title}
                        to={item.url}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 p-4 rounded-xl border border-transparent hover:bg-orange-50 ${
                          location.pathname === item.url 
                            ? 'bg-orange-100 border-orange-300/50' 
                            : ''
                        }`}
                      >
                        <item.icon className={`h-5 w-5 flex-shrink-0 ${
                          location.pathname === item.url 
                            ? 'text-orange-600' 
                            : 'text-gray-600'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm flex items-center gap-2 ${
                            location.pathname === item.url 
                              ? 'text-orange-700' 
                              : 'text-gray-700'
                          }`}>
                            <span className="truncate">{item.title}</span>
                            {!user && item.requiresAuth && (
                              <Star className="h-3 w-3 text-amber-500 flex-shrink-0" />
                            )}
                          </div>
                          <div className={`text-xs truncate ${
                            location.pathname === item.url 
                              ? 'text-orange-600/80' 
                              : 'text-gray-500'
                          }`}>
                            {item.description}
                          </div>
                        </div>
                        {location.pathname === item.url && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-orange-200/60 bg-orange-50 flex-shrink-0">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                    <Avatar className="h-10 w-10 border-2 border-orange-200 flex-shrink-0">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold text-sm">
                        {profile?.display_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-800 truncate">
                        {profile?.display_name || 'User'}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/profile" onClick={() => setOpen(false)}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full bg-white/80 hover:bg-white border-orange-200 hover:border-orange-300 text-orange-700"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        signOut();
                        setOpen(false);
                      }}
                      className="w-full bg-white/80 hover:bg-white border-orange-200 hover:border-orange-300 text-orange-700"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-sm text-orange-700 font-medium mb-2">Welcome to Bible Aura</p>
                    <p className="text-xs text-orange-600/80">Sign in for full features</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Link to="/auth" onClick={() => setOpen(false)}>
                      <Button 
                        size="sm" 
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export function AppSidebar() {
  const location = useLocation()
  const { user, profile, signOut } = useAuth()
  const { state, toggleSidebar, setOpen } = useSidebar()
  const isExpanded = state === "expanded"
  const isMobile = useIsMobile()
  
  // Choose navigation based on authentication status
  const navigation = user ? authenticatedNavigation : guestNavigation

  // Handle hover to expand sidebar
  const handleMouseEnter = () => {
    if (!isExpanded) {
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    // Optional: Auto-collapse on leave (uncomment if desired)
    // collapse();
  };

  // Return mobile navigation for mobile devices
  if (isMobile) {
    return <MobileNavigation navigation={navigation} user={user} profile={profile} signOut={signOut} />
  }

  return (
    <Sidebar 
      className={`border-r border-orange-200 bg-white ${
        isExpanded ? 'w-80' : 'w-20'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Desktop Header */}
      <SidebarHeader className="p-5 border-b border-orange-200/60 bg-orange-50">
        <div className="flex items-center gap-3 justify-between">
          <div className={`flex items-center gap-4`}>
            <div className="relative flex-shrink-0">
              <div className={`${isExpanded ? 'h-14 w-14' : 'h-12 w-12'} flex items-center justify-center bg-primary/10 rounded-full`}>
                <span className={`${isExpanded ? 'text-2xl' : 'text-xl'} font-bold text-primary`}>✦</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full"></div>
            </div>
            {isExpanded && (
              <div>
                <h1 className="text-xl font-bold text-orange-700">
                  ✦Bible Aura
                </h1>
                <p className="text-sm text-orange-600 font-medium">
                  AI Biblical Insights
                </p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
                          onClick={toggleSidebar}
            className="h-9 w-9 p-0 hover:bg-orange-100 flex-shrink-0 border border-orange-200/50"
          >
            {isExpanded ? <X className="h-5 w-5 text-orange-600" /> : <Menu className="h-5 w-5 text-orange-600" />}
          </Button>
        </div>
      </SidebarHeader>

      {/* Desktop Content */}
      <SidebarContent className="px-4 py-5">
        {navigation.map((group, groupIndex) => (
          <SidebarGroup key={group.title} className="mb-6">
            {isExpanded && (
              <SidebarGroupLabel className="text-sm font-bold text-orange-700 mb-3 flex items-center gap-2 px-2">
                <Star className="h-4 w-4" />
                {group.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {group.items.map((item, itemIndex) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === item.url}
                      className={`group hover:bg-orange-50 rounded-xl p-3 border border-transparent ${
                        !isExpanded ? 'justify-center' : ''
                      } ${
                        location.pathname === item.url 
                          ? 'bg-orange-100 border-orange-300/50 text-orange-700' 
                          : 'text-gray-700 hover:text-orange-700'
                      }`}
                    >
                      <Link to={item.url} className="flex items-center gap-3 w-full">
                        <item.icon className={`h-5 w-5 flex-shrink-0 ${
                          location.pathname === item.url 
                            ? 'text-orange-600' 
                            : 'text-gray-600 group-hover:text-orange-600'
                        }`} />
                        {isExpanded && (
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm flex items-center gap-2">
                              <span className="truncate">{item.title}</span>
                              {!user && item.requiresAuth && (
                                <Star className="h-3 w-3 text-amber-500 flex-shrink-0" />
                              )}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {item.description}
                            </div>
                          </div>
                        )}
                        {location.pathname === item.url && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Desktop Footer */}
      <SidebarFooter className="p-4 border-t border-orange-200/60 bg-orange-50">
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
              <Avatar className="h-10 w-10 border-2 border-orange-200 flex-shrink-0">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold text-sm">
                  {profile?.display_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isExpanded && (
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-800 truncate">
                    {profile?.display_name || 'User'}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {user?.email}
                  </div>
                </div>
              )}
            </div>
            {isExpanded && (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/profile">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full bg-white/80 hover:bg-white border-orange-200 hover:border-orange-300 text-orange-700"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={signOut}
                  className="w-full bg-white/80 hover:bg-white border-orange-200 hover:border-orange-300 text-orange-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {isExpanded && (
              <div className="text-center">
                <p className="text-sm text-orange-700 font-medium mb-2">Welcome to Bible Aura</p>
                <p className="text-xs text-orange-600/80">Sign in for full features</p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-2">
              <Link to="/auth">
                <Button 
                  size="sm" 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {isExpanded ? "Sign In" : "Sign In"}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}