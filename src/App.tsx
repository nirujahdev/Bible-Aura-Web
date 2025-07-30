import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from "./hooks/useAuth";
import { Toaster } from "./components/ui/toaster";
import { Sparkles, Star, Heart } from "lucide-react";
import ErrorBoundary from "./components/ErrorBoundary";
import { queryClient } from "./lib/queryClient";
import { Suspense, lazy } from "react";
import LoadingScreen from "./components/LoadingScreen";

// Lazy load all page components for better performance
const Auth = lazy(() => import("./pages/Auth"));
const Home = lazy(() => import("./pages/Home"));
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
const Pricing = lazy(() => import("./pages/Pricing"));
const Careers = lazy(() => import("./pages/Careers"));


// Component imports (keep these as regular imports since they're critical)
import { ModernSidebar as AppSidebar } from "./components/ModernSidebar";
import { BibleApiTest } from "./components/BibleApiTest";
import ProtectedRoute from "./components/ProtectedRoute";

function AppLayout() {
  const location = useLocation();

  // Define routes that should use full-screen layout (no sidebar)
  const fullScreenRoutes = [
    '/',
    '/auth',
    '/about', 
    '/contact',
    '/terms',
    '/privacy',
    '/pricing',
    '/funding',
    '/careers'
  ];

  const isFullScreen = fullScreenRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background decoration with performance optimization */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50 pointer-events-none">
        <div className="absolute top-20 left-20 text-blue-200/20">
          <Sparkles className="h-16 w-16" />
        </div>
        <div className="absolute top-40 right-32 text-orange-200/20">
          <Star className="h-12 w-12" />
        </div>
        <div className="absolute bottom-32 left-1/3 text-pink-200/20">
          <Heart className="h-14 w-14" />
        </div>

      </div>
      
      {isFullScreen ? (
        // Full-screen layout for landing and static pages
        <main className="relative z-10">
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/funding" element={<Navigate to="/pricing" replace />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      ) : (
        // Modern sidebar layout for app pages
        <div className="h-screen">
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Modern Sidebar handles the main layout for chat route */}
              <Route path="/chat" element={
                <ProtectedRoute>
                  <AppSidebar />
                </ProtectedRoute>
              } />
              
              {/* Other routes use individual page layouts */}
              <Route path="/bible-api-test" element={<BibleApiTest />} />
              
              <Route path="/bible" element={
                <ProtectedRoute>
                  <Bible />
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
              
              <Route path="/sermons" element={
                <ProtectedRoute>
                  <Sermons />
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
              
              <Route path="/favorites" element={
                <ProtectedRoute>
                  <Favorites />
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
              
              {/* Fallback route redirects to chat */}
              <Route path="*" element={<Navigate to="/chat" replace />} />
            </Routes>
          </Suspense>
        </div>
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
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
