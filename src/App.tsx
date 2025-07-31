import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { Toaster } from "./components/ui/toaster";
import ErrorBoundary from "./components/ErrorBoundary";
import { queryClient } from "./lib/queryClient";
import { Suspense, lazy } from "react";
import LoadingScreen from "./components/LoadingScreen";

// Lazy load all page components for better performance
const Auth = lazy(() => import("./pages/Auth"));
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Bible = lazy(() => import("./pages/Bible"));

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
const StudyHub = lazy(() => import("./pages/StudyHub"));
const Sermons = lazy(() => import("./pages/Sermons"));
const SermonWriter = lazy(() => import("./pages/SermonWriter"));
const Songs = lazy(() => import("./pages/Songs"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Careers = lazy(() => import("./pages/Careers"));

// Component imports
import ProtectedRoute from "./components/ProtectedRoute";
import { ModernLayout } from "./components/ModernLayout";

function AppLayout() {
  // Component to handle root route - shows landing page or dashboard based on auth
  const LandingOrDashboard = () => {
    const { user } = useAuth();
    
    if (user) {
      // User is authenticated, show dashboard with consistent layout
      return (
        <ModernLayout>
          <Dashboard />
        </ModernLayout>
      );
    } else {
      // User is not authenticated, show landing page
      return <Home />;
    }
  };
  const location = useLocation();

  // Define routes that should use landing layout (no sidebar)
  const landingRoutes = [
    '/auth',
    '/about', 
    '/contact',
    '/terms',
    '/privacy',
    '/pricing',
    '/funding',
    '/careers'
  ];

  const isLandingPage = landingRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-white">
      {isLandingPage ? (
        // Landing page layout for static pages
        <main>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
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
        // Modern app layout with sidebar for all app pages
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Root route - Landing page for non-authenticated, Dashboard for authenticated */}
            <Route path="/" element={<LandingOrDashboard />} />
            
            {/* Dashboard route */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <ModernLayout>
                  <Dashboard />
                </ModernLayout>
              </ProtectedRoute>
            } />
            
            {/* All other app routes */}
            <Route path="/bible" element={
              <ProtectedRoute>
                <ModernLayout>
                  <Bible />
                </ModernLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/songs" element={
              <ProtectedRoute>
                <ModernLayout>
                  <Songs />
                </ModernLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/study" element={
              <ProtectedRoute>
                <ModernLayout>
                  <StudyHub />
                </ModernLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/study-hub" element={
              <ProtectedRoute>
                <ModernLayout>
                  <StudyHub />
                </ModernLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/bible-qa" element={
              <ProtectedRoute>
                <ModernLayout>
                  <StudyHub />
                </ModernLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/bible-characters" element={
              <ProtectedRoute>
                <ModernLayout>
                  <BibleCharacters />
                </ModernLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/sermons" element={
              <ProtectedRoute>
                <ModernLayout>
                  <Sermons />
                </ModernLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/sermon-writer" element={
              <ProtectedRoute>
                <ModernLayout>
                  <SermonWriter />
                </ModernLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/topical-study" element={
              <ProtectedRoute>
                <ModernLayout>
                  <StudyHub />
                </ModernLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/sermon-library" element={
              <ProtectedRoute>
                <ModernLayout>
                  <StudyHub />
                </ModernLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/parables-study" element={
              <ProtectedRoute>
                <ModernLayout>
                  <StudyHub />
                </ModernLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/favorites" element={
              <ProtectedRoute>
                <ModernLayout>
                  <Favorites />
                </ModernLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/journal" element={
              <ProtectedRoute>
                <ModernLayout>
                  <Journal />
                </ModernLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <ModernLayout>
                  <Profile />
                </ModernLayout>
              </ProtectedRoute>
            } />

            {/* Legacy chat route redirects to home */}
            <Route path="/chat" element={<Navigate to="/" replace />} />
            
            {/* Fallback route redirects to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
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
