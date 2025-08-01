import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { Toaster } from "./components/ui/toaster";
import ErrorBoundary from "./components/ErrorBoundary";
import { queryClient } from "./lib/queryClient";
import { Suspense, lazy } from "react";
import LoadingScreen from "./components/LoadingScreen";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Lazy load all page components for better performance
const Auth = lazy(() => import("./pages/Auth"));
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Bible = lazy(() => import("./pages/Bible"));
const BibleAI = lazy(() => import("./pages/BibleAI"));
const Blog = lazy(() => import("./pages/Blog"));

// Blog post pages
const HowAITransformsBibleStudy = lazy(() => import("./pages/blog/HowAITransformsBibleStudy"));
const BibleAIVsTraditionalStudy = lazy(() => import("./pages/blog/BibleAIVsTraditionalStudy"));
const BibleStudyAIBenefits = lazy(() => import("./pages/blog/BibleStudyAIBenefits"));
const AIBibleInsightsAccuracy = lazy(() => import("./pages/blog/AIBibleInsightsAccuracy"));

const Journal = lazy(() => import("./pages/Journal"));
const Profile = lazy(() => import("./pages/Profile"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const BibleQA = lazy(() => import("./pages/BibleQA"));
const ParablesStudy = lazy(() => import("./pages/ParablesStudy"));
const TopicalStudy = lazy(() => import("./pages/TopicalStudy"));
const StudyHub = lazy(() => import("./pages/StudyHub"));
const Sermons = lazy(() => import("./pages/Sermons"));
const SermonWriter = lazy(() => import("./pages/SermonWriter"));
const Songs = lazy(() => import("./pages/Songs"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Features = lazy(() => import("./pages/Features"));
const SubscriptionSuccess = lazy(() => import("./pages/SubscriptionSuccess"));
const SubscriptionCancelled = lazy(() => import("./pages/SubscriptionCancelled"));

// Component imports
import ProtectedRoute from "./components/ProtectedRoute";
import { ModernLayout } from "./components/ModernLayout";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public landing pages - no authentication required */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/features" element={<Features />} />
        
        {/* SEO-Optimized Landing Pages */}
        <Route path="/bible-ai" element={<BibleAI />} />
        <Route path="/ai-bible-study" element={<BibleAI />} />
        <Route path="/bible-chat" element={<BibleAI />} />
        <Route path="/digital-bible" element={<BibleAI />} />
        <Route path="/bible-journal" element={<BibleAI />} />
        
        {/* Blog Pages */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/how-ai-transforms-bible-study" element={<HowAITransformsBibleStudy />} />
        <Route path="/blog/bible-ai-vs-traditional-study" element={<BibleAIVsTraditionalStudy />} />
        <Route path="/blog/bible-study-ai-benefits" element={<BibleStudyAIBenefits />} />
        <Route path="/blog/ai-bible-insights-accuracy" element={<AIBibleInsightsAccuracy />} />
        <Route path="/blog/ai-bible-chat-features" element={<BibleAI />} />
        <Route path="/blog/smart-bible-search-techniques" element={<BibleAI />} />
        <Route path="/blog/biblical-ai-assistant-guide" element={<BibleAI />} />
        <Route path="/blog/christian-ai-technology-future" element={<BibleAI />} />

        {/* Protected app routes - authentication required */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ModernLayout>
              <Dashboard />
            </ModernLayout>
          </ProtectedRoute>
        } />
        
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
              <StudyHub />
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

        {/* Subscription Pages */}
        <Route path="/subscription/success" element={<SubscriptionSuccess />} />
        <Route path="/subscription/cancelled" element={<SubscriptionCancelled />} />

        {/* Legacy redirects */}
        <Route path="/chat" element={<Navigate to="/" replace />} />
        <Route path="/funding" element={<Navigate to="/pricing" replace />} />

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-white">
              <AppRoutes />
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
        {/* React Query DevTools - only shows in development */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
      <Analytics />
      <SpeedInsights />
    </ErrorBoundary>
  );
}

export default App;
