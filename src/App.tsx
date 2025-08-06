import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ModernLayout } from '@/components/ModernLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';

// Immediate load pages (small and frequently accessed)
import Home from '@/pages/Home';
import About from '@/pages/About';
import Features from '@/pages/Features';
import Pricing from '@/pages/Pricing';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';

// Lazy load pages (heavy or less frequently accessed)
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Bible = lazy(() => import('@/pages/Bible'));
const BibleAI = lazy(() => import('@/pages/BibleAI'));
const BibleQA = lazy(() => import('@/pages/BibleQA'));
const Journal = lazy(() => import('@/pages/Journal'));
const StudyHub = lazy(() => import('@/pages/StudyHub'));
const TopicalStudy = lazy(() => import('@/pages/TopicalStudy'));
const ParablesStudy = lazy(() => import('@/pages/ParablesStudy'));
const Sermons = lazy(() => import('@/pages/Sermons'));
const SermonWriter = lazy(() => import('@/pages/SermonWriter'));
const SermonLibrary = lazy(() => import('@/pages/SermonLibrary'));
const Songs = lazy(() => import('@/pages/Songs'));
const Favorites = lazy(() => import('@/pages/Favorites'));
const Profile = lazy(() => import('@/pages/Profile'));
const Blog = lazy(() => import('@/pages/Blog'));
const EnhancedBible = lazy(() => import('@/pages/EnhancedBible'));
const EnhancedSermonHub = lazy(() => import('@/pages/EnhancedSermonHub'));
const SubscriptionSuccess = lazy(() => import('@/pages/SubscriptionSuccess'));
const SubscriptionCancelled = lazy(() => import('@/pages/SubscriptionCancelled'));

// Feature pages (lazy loaded)
const AIFeatures = lazy(() => import('@/pages/features/AIFeatures'));
const BibleStudy = lazy(() => import('@/pages/features/BibleStudy'));
const PersonalTools = lazy(() => import('@/pages/features/PersonalTools'));
const ContentCreation = lazy(() => import('@/pages/features/ContentCreation'));
const LearningResources = lazy(() => import('@/pages/features/LearningResources'));
const AdvancedStudy = lazy(() => import('@/pages/features/AdvancedStudy'));

// Blog posts (lazy loaded)
const HowAITransformsBibleStudy = lazy(() => import('@/pages/blog/HowAITransformsBibleStudy'));
const BibleStudyAIBenefits = lazy(() => import('@/pages/blog/BibleStudyAIBenefits'));
const AIBibleInsightsAccuracy = lazy(() => import('@/pages/blog/AIBibleInsightsAccuracy'));
const BibleAIVsTraditionalStudy = lazy(() => import('@/pages/blog/BibleAIVsTraditionalStudy'));

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error instanceof Error && error.message.includes('JWT')) {
          return false;
        }
        // Don't retry on permission errors
        if (error instanceof Error && error.message.includes('permission')) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function App() {
  useEffect(() => {
    // App initialization complete
    console.log('✦ Bible Aura App initialized successfully');
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="App min-h-screen bg-background">
              <Routes>
                {/* Public routes - No layout wrapper for landing pages */}
                <Route path="/" element={
                  <ErrorBoundary>
                    <Home />
                  </ErrorBoundary>
                } />
                <Route path="/about" element={
                  <ErrorBoundary>
                    <About />
                  </ErrorBoundary>
                } />
                <Route path="/features" element={
                  <ErrorBoundary>
                    <Features />
                  </ErrorBoundary>
                } />
                <Route path="/pricing" element={
                  <ErrorBoundary>
                    <Pricing />
                  </ErrorBoundary>
                } />
                <Route path="/auth" element={
                  <ErrorBoundary>
                    <Auth />
                  </ErrorBoundary>
                } />
              <Route path="/blog" element={
                <Suspense fallback={<LoadingScreen />}>
                  <Blog />
                </Suspense>
              } />
              
              {/* Feature pages */}
              <Route path="/features/ai" element={
                <ErrorBoundary>
                  <AIFeatures />
                </ErrorBoundary>
              } />
              <Route path="/features/bible-study" element={
                <ErrorBoundary>
                  <BibleStudy />
                </ErrorBoundary>
              } />
              <Route path="/features/personal-tools" element={
                <ErrorBoundary>
                  <PersonalTools />
                </ErrorBoundary>
              } />
              <Route path="/features/content-creation" element={
                <ErrorBoundary>
                  <ContentCreation />
                </ErrorBoundary>
              } />
              <Route path="/features/learning-resources" element={
                <ErrorBoundary>
                  <LearningResources />
                </ErrorBoundary>
              } />
              <Route path="/features/advanced-study" element={
                <ErrorBoundary>
                  <AdvancedStudy />
                </ErrorBoundary>
              } />
              
              {/* Blog posts */}
              <Route path="/blog/how-ai-transforms-bible-study" element={<HowAITransformsBibleStudy />} />
              <Route path="/blog/bible-study-ai-benefits" element={<BibleStudyAIBenefits />} />
              <Route path="/blog/ai-bible-insights-accuracy" element={<AIBibleInsightsAccuracy />} />
              <Route path="/blog/bible-ai-vs-traditional-study" element={<BibleAIVsTraditionalStudy />} />
              
              {/* Subscription pages */}
              <Route path="/subscription/success" element={<SubscriptionSuccess />} />
              <Route path="/subscription/cancelled" element={<SubscriptionCancelled />} />

              {/* Protected routes with enhanced error handling */}
              <Route path="/dashboard" element={
                <ErrorBoundary fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-xl font-semibold mb-2">Dashboard Error</h2>
                      <p className="text-gray-600 mb-4">Unable to load dashboard. Please refresh or try again.</p>
                      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded">
                        Refresh Page
                      </button>
                    </div>
                  </div>
                }>
                  <ProtectedRoute>
                    <ModernLayout>
                      <Suspense fallback={<LoadingScreen />}>
                        <Dashboard />
                      </Suspense>
                    </ModernLayout>
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/bible" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <ModernLayout>
                      <Suspense fallback={<LoadingScreen />}>
                        <Bible />
                      </Suspense>
                    </ModernLayout>
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/enhanced-bible" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <ModernLayout>
                      <EnhancedBible />
                    </ModernLayout>
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/bible-ai" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <ModernLayout>
                      <Suspense fallback={<LoadingScreen />}>
                        <BibleAI />
                      </Suspense>
                    </ModernLayout>
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/bible-qa" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <ModernLayout>
                      <BibleQA />
                    </ModernLayout>
                  </ProtectedRoute>
                </ErrorBoundary>
              } />

              <Route path="/journal" element={
                <ErrorBoundary fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center max-w-md">
                      <h2 className="text-xl font-semibold mb-2">Journal Error</h2>
                      <p className="text-gray-600 mb-4">Unable to load journal. This might be due to a database issue.</p>
                      <div className="space-y-2">
                        <button onClick={() => window.location.reload()} className="w-full px-4 py-2 bg-blue-600 text-white rounded">
                          Refresh Page
                        </button>
                        <button onClick={() => window.location.href = '/dashboard'} className="w-full px-4 py-2 bg-gray-600 text-white rounded">
                          Go to Dashboard
                        </button>
                      </div>
                    </div>
                  </div>
                }>
                  <ProtectedRoute>
                    <ModernLayout>
                      <Suspense fallback={<LoadingScreen />}>
                        <Journal />
                      </Suspense>
                    </ModernLayout>
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/study-hub" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <ModernLayout>
                      <StudyHub />
                    </ModernLayout>
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/topical-study" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <ModernLayout>
                      <TopicalStudy />
                    </ModernLayout>
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/parables" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <ModernLayout>
                      <ParablesStudy />
                    </ModernLayout>
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/sermons" element={
                <ErrorBoundary fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center max-w-md">
                      <h2 className="text-xl font-semibold mb-2">Sermons Error</h2>
                      <p className="text-gray-600 mb-4">Unable to load sermons. This might be due to a database issue.</p>
                      <div className="space-y-2">
                        <button onClick={() => window.location.reload()} className="w-full px-4 py-2 bg-blue-600 text-white rounded">
                          Refresh Page
                        </button>
                        <button onClick={() => window.location.href = '/dashboard'} className="w-full px-4 py-2 bg-gray-600 text-white rounded">
                          Go to Dashboard
                        </button>
                      </div>
                    </div>
                  </div>
                }>
                  <ProtectedRoute>
                    <ModernLayout>
                      <Suspense fallback={<LoadingScreen />}>
                        <Sermons />
                      </Suspense>
                    </ModernLayout>
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/sermon-writer" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <ModernLayout>
                      <SermonWriter />
                    </ModernLayout>
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/sermon-library" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <ModernLayout>
                      <SermonLibrary />
                    </ModernLayout>
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/songs" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <ModernLayout>
                      <Songs />
                    </ModernLayout>
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/favorites" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <ModernLayout>
                      <Favorites />
                    </ModernLayout>
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/profile" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <ModernLayout>
                      <Profile />
                    </ModernLayout>
                  </ProtectedRoute>
                </ErrorBoundary>
              } />

              <Route path="/enhanced-sermon-hub" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <ModernLayout>
                      <EnhancedSermonHub />
                    </ModernLayout>
                  </ProtectedRoute>
                </ErrorBoundary>
              } />

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
