import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { Toaster } from "./components/ui/toaster";
import { SidebarProvider } from "./components/ui/sidebar";
import { Sparkles, Star, Heart } from "lucide-react";
import ErrorBoundary from "./components/ErrorBoundary";

// Page imports
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Bible from "./pages/Bible";
import Chat from "./pages/Chat";
import Journal from "./pages/Journal";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import BibleQA from "./pages/BibleQA";
import BibleCharacters from "./pages/BibleCharacters";
import ParablesStudy from "./pages/ParablesStudy";
import TopicalStudy from "./pages/TopicalStudy";
import SermonLibrary from "./pages/SermonLibrary";
import Sermons from "./pages/Sermons";
import Songs from "./pages/Songs";
import Favorites from "./pages/Favorites";
import Funding from "./pages/Funding";
import Careers from "./pages/Careers";
import HeaderDemo from "./pages/HeaderDemo";
import VerseDemo from "./pages/VerseDemo";

// Component imports
import { AppSidebar } from "./components/AppSidebar";
import ProtectedRoute from "./components/ProtectedRoute";

// Component to handle layout based on route
function AppLayout() {
  const location = useLocation();
  
  // Routes that should display without sidebar (full-screen)
  const fullScreenRoutes = ["/", "/auth", "/about", "/contact", "/terms", "/privacy", "/funding", "/careers"];
  const isFullScreen = fullScreenRoutes.includes(location.pathname);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full"></div>
        <div className="absolute top-1/3 -left-8 w-32 h-32 bg-gradient-to-tr from-orange-200/20 to-transparent rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/6 w-20 h-20 bg-gradient-to-bl from-amber-200/15 to-transparent rounded-full"></div>
        
        <Sparkles className="h-4 w-4 text-primary/30 absolute top-20 left-1/4" />
        <Star className="h-3 w-3 text-orange-400/40 absolute top-1/2 right-1/3" />
        <Heart className="h-5 w-5 text-white/50 absolute bottom-6 right-8" />
      </div>
      
      {isFullScreen ? (
        // Full-screen layout for landing and static pages
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/funding" element={<Funding />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      ) : (
        // Sidebar layout for app pages
        <div className="flex h-screen relative z-10">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/header-demo" element={<HeaderDemo />} />
              <Route path="/verse-demo" element={<VerseDemo />} />
              
              {/* Protected Routes */}
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
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
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
              <Route path="/parables" element={
                <ProtectedRoute>
                  <ParablesStudy />
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
              <Route path="/sermons" element={
                <ProtectedRoute>
                  <Sermons />
                </ProtectedRoute>
              } />
              <Route path="/songs" element={
                <ProtectedRoute>
                  <Songs />
                </ProtectedRoute>
              } />
              <Route path="/favorites" element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SidebarProvider>
          <Router>
            <AppLayout />
            <Toaster />
          </Router>
        </SidebarProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
