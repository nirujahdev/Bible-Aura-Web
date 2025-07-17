import { Home, Book, MessageCircle, BarChart3, Headphones, Map, Bookmark, FileText, Calendar, Heart, TrendingUp, LogOut, User, Settings, Sparkles, Star, Crown, LogIn, UserPlus, Menu, X, Music, HelpCircle, Users, BookOpen, Mic, TreePine, LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useState } from "react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/hooks/useAuth"
import { useSidebar } from "@/hooks/useSidebar"
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
    title: "Premium",
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden fixed top-3 left-3 z-[60] h-12 w-12 p-0 bg-white/95 backdrop-blur-md border-2 border-orange-200/80 shadow-md hover:bg-orange-50 rounded-xl touch-manipulation"
          style={{ touchAction: 'manipulation' }}
        >
          <Menu className="h-6 w-6 text-orange-600" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-[85vw] max-w-[320px] p-0 bg-white border-r-2 border-orange-200/50"
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header - Simplified */}
          <div className="p-4 border-b border-orange-200/60 bg-orange-50">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <img 
                  src="/✦Bible Aura.svg" 
                  alt="✦Bible Aura" 
                  className="h-10 w-10"
                />
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

          {/* Mobile Navigation Content - Simplified */}
          <div className="flex-1 px-4 py-4 overflow-y-auto">
            {navigation.map((group) => (
              <div key={group.title} className="mb-6">
                <div className="text-sm font-bold text-orange-700 mb-3 flex items-center gap-2 px-2">
                  <Crown className="h-4 w-4" />
                  {group.title}
                </div>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <Link
                      key={item.title}
                      to={item.url}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 p-4 rounded-xl border border-transparent hover:bg-orange-50 touch-manipulation ${
                        location.pathname === item.url 
                          ? 'bg-orange-100 border-orange-300/50' 
                          : ''
                      }`}
                      style={{ touchAction: 'manipulation', minHeight: '48px' }}
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
            {/* Extra padding at bottom for better scrolling */}
            <div className="h-6"></div>
          </div>

          {/* Mobile Footer - Simplified */}
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
                  <Link to="/profile">
                    <Button 
                      variant="outline" 
                      className="w-full text-xs h-10 border-orange-300/50 hover:bg-orange-50 touch-manipulation"
                      style={{ touchAction: 'manipulation' }}
                    >
                      <User className="h-4 w-4 mr-1" />
                      Profile
                    </Button>
                  </Link>
                  <Button 
                    onClick={signOut} 
                    variant="outline" 
                    className="w-full text-xs h-10 border-orange-300/50 hover:bg-orange-50 touch-manipulation"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center mb-3">
                  <Sparkles className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-orange-800 mb-1">Join ✦Bible Aura</h3>
                  <p className="text-xs text-orange-600/80">Unlock AI insights & premium features</p>
                </div>
                <Button 
                  asChild 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm h-12 touch-manipulation"
                  style={{ touchAction: 'manipulation' }}
                >
                  <Link to="/auth" onClick={() => setOpen(false)}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full text-sm h-12 border-orange-300/50 hover:bg-orange-50 touch-manipulation"
                  style={{ touchAction: 'manipulation' }}
                >
                  <Link to="/auth" onClick={() => setOpen(false)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account
                  </Link>
                </Button>
                <div className="text-center mt-3">
                  <p className="text-xs text-orange-600/70 flex items-center justify-center gap-1">
                    <Star className="h-3 w-3 text-amber-500" />
                    Premium features available
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function AppSidebar() {
  const location = useLocation()
  const { user, profile, signOut } = useAuth()
  const { isExpanded, toggle, expand, collapse } = useSidebar()
  const isMobile = useIsMobile()
  
  // Choose navigation based on authentication status
  const navigation = user ? authenticatedNavigation : guestNavigation

  // Handle hover to expand sidebar
  const handleMouseEnter = () => {
    if (!isExpanded) {
      expand();
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
      {/* Desktop Header - Simplified */}
      <SidebarHeader className="p-5 border-b border-orange-200/60 bg-orange-50">
        <div className="flex items-center gap-3 justify-between">
          <div className={`flex items-center gap-4`}>
            <div className="relative flex-shrink-0">
              <img 
                src="/✦Bible Aura.svg" 
                alt="✦Bible Aura" 
                className={`${isExpanded ? 'h-14 w-14' : 'h-12 w-12'}`}
              />
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
            onClick={toggle}
            className="h-9 w-9 p-0 hover:bg-orange-100 flex-shrink-0 border border-orange-200/50"
          >
            {isExpanded ? <X className="h-5 w-5 text-orange-600" /> : <Menu className="h-5 w-5 text-orange-600" />}
          </Button>
        </div>
      </SidebarHeader>

      {/* Desktop Content - Simplified */}
      <SidebarContent className="px-4 py-5">
        {navigation.map((group, groupIndex) => (
          <SidebarGroup key={group.title} className="mb-6">
            {isExpanded && (
              <SidebarGroupLabel className="text-sm font-bold text-orange-700 mb-3 flex items-center gap-2 px-2">
                <Crown className="h-4 w-4" />
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
                        location.pathname === item.url ? 'bg-orange-100 border-orange-300/50' : ''
                      }`}
                    >
                      <Link to={item.url} className="flex items-center gap-3 w-full">
                        <div className="relative flex-shrink-0">
                          <item.icon className={`h-5 w-5 ${
                            location.pathname === item.url 
                              ? 'text-orange-600' 
                              : 'text-gray-600 group-hover:text-orange-600'
                          }`} />
                        </div>
                        {isExpanded && (
                          <div className="flex-1 min-w-0">
                            <div className={`font-semibold text-sm flex items-center gap-2 truncate ${
                              location.pathname === item.url 
                                ? 'text-orange-700' 
                                : 'text-gray-700 group-hover:text-orange-700'
                            }`}>
                              <span className="truncate">{item.title}</span>
                              {!user && item.requiresAuth && (
                                <Star className="h-3 w-3 text-amber-500 flex-shrink-0" />
                              )}
                            </div>
                            <div className={`text-xs truncate ${
                              location.pathname === item.url 
                                ? 'text-orange-600/80' 
                                : 'text-gray-500 group-hover:text-orange-600/80'
                            }`}>
                              {item.description}
                            </div>
                          </div>
                        )}
                        {isExpanded && location.pathname === item.url && (
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

      {/* Desktop Footer - Simplified */}
      <SidebarFooter className="p-4 border-t border-orange-200/60 bg-orange-50">
        {user ? (
          // Authenticated User Section - Simplified
          <>
            <div className={`bg-orange-100 rounded-xl p-4 mb-3 border border-orange-200/50 ${
              !isExpanded ? 'p-3' : ''
            }`}>
              <div className={`flex items-center gap-3 mb-3 ${!isExpanded ? 'justify-center mb-0' : ''}`}>
                <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-orange-300/50">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-orange-500 text-white text-sm font-bold">
                    {profile?.display_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isExpanded && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-orange-800 truncate">
                      {profile?.display_name || 'User'}
                    </p>
                    <p className="text-xs text-orange-600/80 truncate">
                      {user?.email}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Action Buttons - Simplified */}
              {isExpanded && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8 border-orange-300/50 hover:bg-orange-50">
                    <User className="h-3 w-3 mr-1" />
                    Profile
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8 border-orange-300/50 hover:bg-orange-50">
                    <Settings className="h-3 w-3 mr-1" />
                    Settings
                  </Button>
                </div>
              )}
            </div>

            {/* Sign Out - Simplified */}
            <Button 
              onClick={signOut}
              variant="outline" 
              className={`w-full text-sm h-9 border-orange-300/50 hover:bg-orange-50 ${!isExpanded ? 'px-2' : ''}`}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isExpanded ? 'Sign Out' : ''}
            </Button>
          </>
        ) : (
          // Guest User Section - Simplified
          <div className={`bg-orange-100 rounded-xl p-4 border border-orange-200/50 ${
            !isExpanded ? 'p-3' : ''
          }`}>
            {isExpanded ? (
              <>
                <div className="text-center mb-4">
                  <Sparkles className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-orange-800 mb-1">Join ✦Bible Aura</h3>
                  <p className="text-xs text-orange-600/80">Unlock AI insights & premium features</p>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    asChild 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm h-9"
                  >
                    <Link to="/auth">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full text-sm h-9 border-orange-300/50 hover:bg-orange-50"
                  >
                    <Link to="/auth">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Account
                    </Link>
                  </Button>
                </div>
                
                <div className="text-center mt-3">
                  <p className="text-xs text-orange-600/70 flex items-center justify-center gap-1">
                    <Star className="h-3 w-3 text-amber-500" />
                    Premium features available
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center">
                <Button 
                  asChild 
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 w-10 h-10 p-0"
                >
                  <Link to="/auth">
                    <LogIn className="h-4 w-4 text-white" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}