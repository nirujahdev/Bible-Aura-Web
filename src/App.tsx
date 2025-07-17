import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SidebarProvider as CustomSidebarProvider, useSidebar } from "@/hooks/useSidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sparkles, Star, Crown, Heart } from "lucide-react";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Bible from "./pages/Bible";
import Chat from "./pages/Chat";
import Journal from "./pages/Journal";
import Sermons from "./pages/Sermons";

import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Songs from "./pages/Songs";
import BibleQA from "./pages/BibleQA";
import BibleCharacters from "./pages/BibleCharacters";
import VerseDemo from "./pages/VerseDemo";
import HeaderDemo from "./pages/HeaderDemo";
import TopicalStudy from "./pages/TopicalStudy";
import SermonLibrary from "./pages/SermonLibrary";
import ParablesStudy from "./pages/ParablesStudy";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Funding from "./pages/Funding";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

// Divine Loading Component
function DivineLoader() {
  return (
    <div className="min-h-screen bg-aura-gradient flex items-center justify-center overflow-hidden">
      {/* Celestial Background Particles */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full animate-celestial-float opacity-60"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full animate-celestial-float opacity-40" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-1/4 w-3 h-3 bg-white rounded-full animate-celestial-float opacity-30" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-white rounded-full animate-celestial-float opacity-50" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-32 right-20 w-2 h-2 bg-white rounded-full animate-celestial-float opacity-35" style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Divine Loading Container */}
      <div className="text-center space-y-8 animate-divine-scale-in">
        {/* Sacred Logo */}
        <div className="relative mx-auto">
          <div className="relative">
            <img 
              src="/✦Bible Aura.svg" 
              alt="Bible Aura" 
              className="h-32 w-32 animate-sacred-glow mx-auto drop-shadow-2xl"
            />
            <div className="absolute inset-0 h-32 w-32 mx-auto">
              <Star className="h-6 w-6 text-white/60 absolute top-3 left-8 animate-celestial-float" style={{animationDelay: '0.5s'}} />
              <Crown className="h-5 w-5 text-white/50 absolute bottom-6 right-8 animate-celestial-float" style={{animationDelay: '1s'}} />
              <Heart className="h-4 w-4 text-white/40 absolute top-6 right-6 animate-celestial-float" style={{animationDelay: '1.5s'}} />
            </div>
          </div>
        </div>

        {/* Divine Text */}
        <div className="space-y-4">
          <h1 className="text-4xl font-divine text-white animate-holy-text-glow">
                          ✦Bible Aura
          </h1>
          <p className="text-xl text-white/90 font-sacred animate-sacred-fade-in" style={{animationDelay: '0.5s'}}>
            AI-Powered Biblical Insight
          </p>
          <div className="text-white/70 font-holy animate-sacred-fade-in" style={{animationDelay: '1s'}}>
            Preparing your spiritual journey...
          </div>
        </div>

        {/* Sacred Loading Spinner */}
        <div className="flex justify-center animate-sacred-fade-in" style={{animationDelay: '1.5s'}}>
          <div className="spinner-celestial h-12 w-12"></div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const { isExpanded } = useSidebar();
  const location = useLocation();

  if (loading) {
    return <DivineLoader />;
  }

  // For public routes (Landing, Auth) - no sidebar
  const isPublicRoute = location.pathname === '/' || location.pathname === '/auth';
  
  if (isPublicRoute || !user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/funding" element={<Funding />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // For protected routes - with sidebar
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full relative">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className={`hidden lg:block fixed left-0 top-0 h-full z-30 transition-all duration-300 ${
          isExpanded ? 'w-80' : 'w-20'
        }`}>
          <AppSidebar />
        </div>
        
        {/* Mobile-first main content - no margins on mobile */}
        <main className={`flex-1 transition-all duration-300 ${
          'lg:' + (isExpanded ? 'ml-80' : 'ml-20')
        } overflow-hidden`}>
          <Routes>
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/bible" element={
              <ProtectedRoute>
                <Bible />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } />
            <Route path="/journal" element={
              <ProtectedRoute>
                <Journal />
              </ProtectedRoute>
            } />
            <Route path="/sermons" element={
              <ProtectedRoute>
                <Sermons />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/favorites" element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            } />
            <Route path="/songs" element={
              <ProtectedRoute>
                <Songs />
              </ProtectedRoute>
            } />
            <Route path="/bible-qa" element={
              <ProtectedRoute>
                <BibleQA />
              </ProtectedRoute>
            } />
            <Route path="/bible-characters" element={
              <ProtectedRoute>
                <BibleCharacters />
              </ProtectedRoute>
            } />
            <Route path="/topical-study" element={
              <ProtectedRoute>
                <TopicalStudy />
              </ProtectedRoute>
            } />
            <Route path="/sermon-library" element={
              <ProtectedRoute>
                <SermonLibrary />
              </ProtectedRoute>
            } />
            <Route path="/parables-study" element={
              <ProtectedRoute>
                <ParablesStudy />
              </ProtectedRoute>
            } />
            <Route path="/verse-demo" element={
              <ProtectedRoute>
                <VerseDemo />
              </ProtectedRoute>
            } />
            <Route path="/header-demo" element={
              <ProtectedRoute>
                <HeaderDemo />
              </ProtectedRoute>
            } />
            <Route path="/analysis" element={
              <ProtectedRoute>
                <NotFound />
              </ProtectedRoute>
            } />
            <Route path="/journey" element={
              <ProtectedRoute>
                <NotFound />
              </ProtectedRoute>
            } />
            <Route path="/bookmarks" element={
              <ProtectedRoute>
                <NotFound />
              </ProtectedRoute>
            } />
            <Route path="/notes" element={
              <ProtectedRoute>
                <NotFound />
              </ProtectedRoute>
            } />
            <Route path="/plans" element={
              <ProtectedRoute>
                <NotFound />
              </ProtectedRoute>
            } />
            <Route path="/stats" element={
              <ProtectedRoute>
                <NotFound />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CustomSidebarProvider>
            <TooltipProvider>
              <AppContent />
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </CustomSidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
