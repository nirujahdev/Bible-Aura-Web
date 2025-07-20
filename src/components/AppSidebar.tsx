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

// Mobile Navigation Component - Simplified
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
            className="fixed top-4 left-4 z-50 h-12 w-12 p-0 bg-white border shadow-md hover:bg-gray-50 rounded-lg"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-80 p-0">
          {/* Mobile Header */}
                     <div className="p-4 border-b bg-primary">
             <div className="flex items-center gap-3">
               <div className="h-14 w-14 flex items-center justify-center bg-white/20 rounded-lg">
                 <span className="text-3xl font-bold text-white">✦</span>
               </div>
               <div>
                 <h1 className="text-xl font-bold text-white">Bible Aura</h1>
                 <p className="text-sm text-white/80">AI Biblical Insights</p>
               </div>
             </div>
           </div>

          {/* Mobile Navigation */}
          <div className="flex-1 px-4 py-4 overflow-y-auto">
            {navigation.map((group) => (
              <div key={group.title} className="mb-6">
                <div className="text-sm font-semibold text-gray-700 mb-3 px-2">
                  {group.title}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.title}
                      to={item.url}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 ${
                        location.pathname === item.url 
                          ? 'bg-blue-50 border border-blue-200' 
                          : ''
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${
                        location.pathname === item.url 
                          ? 'text-blue-600' 
                          : 'text-gray-600'
                      }`} />
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${
                          location.pathname === item.url 
                            ? 'text-blue-700' 
                            : 'text-gray-700'
                        }`}>
                          {item.title}
                          {!user && item.requiresAuth && (
                            <Star className="h-3 w-3 text-amber-500 inline ml-1" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Footer */}
          <div className="p-4 border-t bg-gray-50">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                      {profile?.display_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-800 truncate">
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
                  <Button variant="outline" size="sm" onClick={signOut} className="w-full">
                    <LogOut className="h-4 w-4 mr-1" />
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-sm text-gray-700 font-medium mb-1">Welcome to Bible Aura</p>
                  <p className="text-xs text-gray-500">Sign in for full features</p>
                </div>
                <Link to="/auth">
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white">
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
  const navigation = user ? authenticatedNavigation : guestNavigation

  // Return mobile navigation for mobile devices
  if (isMobile) {
    return <MobileNavigation navigation={navigation} user={user} profile={profile} signOut={signOut} />
  }

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      {/* Desktop Header */}
      <SidebarHeader className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 flex items-center justify-center bg-primary/10 rounded-lg">
              <span className="text-2xl font-bold text-primary">✦</span>
            </div>
            {isExpanded && (
              <div>
                <h1 className="text-xl font-bold text-gray-800">Bible Aura</h1>
                <p className="text-sm text-gray-600">AI Biblical Insights</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </SidebarHeader>

      {/* Desktop Content */}
      <SidebarContent className="px-4 py-4">
        {navigation.map((group) => (
          <SidebarGroup key={group.title} className="mb-6">
            {isExpanded && (
              <SidebarGroupLabel className="text-sm font-semibold text-gray-700 mb-3">
                {group.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item) => (
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
                        <item.icon className={`h-5 w-5 ${
                          location.pathname === item.url 
                            ? 'text-blue-600' 
                            : 'text-gray-600'
                        }`} />
                        {isExpanded && (
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm flex items-center gap-2">
                              <span className="truncate">{item.title}</span>
                              {!user && item.requiresAuth && (
                                <Star className="h-3 w-3 text-amber-500" />
                              )}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {item.description}
                            </div>
                          </div>
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
  )
}