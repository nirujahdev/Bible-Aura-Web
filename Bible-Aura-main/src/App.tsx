import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from "./hooks/useAuth";
import { Toaster } from "./components/ui/toaster";
import { SidebarProvider } from "./components/ui/sidebar";
import { Sparkles, Star, Heart } from "lucide-react";
import ErrorBoundary from "./components/ErrorBoundary";
import { queryClient } from "./lib/queryClient";
import { Suspense, lazy } from "react";
import LoadingScreen from "./components/LoadingScreen";

// Lazy load all page components for better performance
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Bible = lazy(() => import("./pages/Bible"));
const Chat = lazy(() => import("./pages/Chat"));
const Journal = lazy(() => import("./pages/Journal"));
const Profile = lazy(() => import("./pages/Profile"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const BibleQA = lazy(() => import("./pages/BibleQA"));
const BibleCharacters = lazy(() => import("./pages/BibleCharacters"));
const ParablesStudy = lazy(() => import("./pages/ParablesStudy"));
const TopicalStudy = lazy(() => import("./pages/TopicalStudy"));
const SermonLibrary = lazy(() => import("./pages/SermonLibrary"));
const Sermons = lazy(() => import("./pages/Sermons"));
const Songs = lazy(() => import("./pages/Songs"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Funding = lazy(() => import("./pages/Funding"));
const Careers = lazy(() => import("./pages/Careers"));
const HeaderDemo = lazy(() => import("./pages/HeaderDemo"));
const VerseDemo = lazy(() => import("./pages/VerseDemo"));

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
// Component imports (keep these as regular imports since they're critical)
import { AppSidebar } from "./components/AppSidebar";
import { BibleApiTest } from "./components/BibleApiTest";
import ProtectedRoute from "./components/ProtectedRoute";

// Component to handle layout based on route
function AppLayout() {
  const location = useLocation();
  
  // Routes that should display without sidebar (full-screen)
  const fullScreenRoutes = ["/", "/auth", "/about", "/contact", "/terms", "/privacy", "/funding", "/careers"];
  const isFullScreen = fullScreenRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-background">
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
        <main className="flex-1 min-h-0 overflow-auto relative z-10">
          <Suspense fallback={<LoadingScreen />}>
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
          </Suspense>
        </main>
      ) : (
        // Sidebar layout for app pages
        <SidebarProvider>
          <div className="flex flex-1 min-h-0 relative z-10 bg-gray-50/30">
            <AppSidebar />
            <main className="flex-1 min-h-0 overflow-auto bg-transparent w-full">
              <div className="w-full min-h-full relative">
                <Suspense fallback={<LoadingScreen />}>
                  <Routes>
                    <Route path="/header-demo" element={<HeaderDemo />} />
                    <Route path="/verse-demo" element={<VerseDemo />} />
                    <Route path="/bible-api-test" element={<BibleApiTest />} />
                    
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
                </Suspense>
              </div>
          </main>
        </div>
        </SidebarProvider>
      )}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <AppLayout />
            <Toaster />
          </Router>
        </AuthProvider>
        {/* React Query DevTools - only shows in development */}
        <SpeedInsights />
        <Analytics />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
