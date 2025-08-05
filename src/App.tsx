import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
// import { ModernLayout } from '@/components/ModernLayout'; // REMOVED - CAUSING ERRORS
import ProtectedRoute from '@/components/ProtectedRoute';
// import SmartRedirect from '@/components/SmartRedirect'; // REMOVED - NOT USED
import ErrorBoundary from '@/components/ErrorBoundary';

// Pages
import Home from '@/pages/Home';
import About from '@/pages/About';
import Features from '@/pages/Features';
import Funding from '@/pages/Pricing';
// import Contact from '@/pages/Contact'; // REMOVED - not in original navigation
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Bible from '@/pages/Bible';
import BibleAI from '@/pages/BibleAI';
import BibleQA from '@/pages/BibleQA';
import Journal from '@/pages/Journal';
import StudyHub from '@/pages/StudyHub';
import TopicalStudy from '@/pages/TopicalStudy';
import ParablesStudy from '@/pages/ParablesStudy';
import Sermons from '@/pages/Sermons';
import SermonWriter from '@/pages/SermonWriter';
import SermonLibrary from '@/pages/SermonLibrary';
import Songs from '@/pages/Songs';
import Favorites from '@/pages/Favorites';
import Profile from '@/pages/Profile';
import Blog from '@/pages/Blog';
import NotFound from '@/pages/NotFound';
import SubscriptionSuccess from '@/pages/SubscriptionSuccess';
import SubscriptionCancelled from '@/pages/SubscriptionCancelled';

// Feature pages
import AIFeatures from '@/pages/features/AIFeatures';
import BibleStudy from '@/pages/features/BibleStudy';
import PersonalTools from '@/pages/features/PersonalTools';
import ContentCreation from '@/pages/features/ContentCreation';
import LearningResources from '@/pages/features/LearningResources';
import AdvancedStudy from '@/pages/features/AdvancedStudy';

// Blog posts
import HowAITransformsBibleStudy from '@/pages/blog/HowAITransformsBibleStudy';
import BibleStudyAIBenefits from '@/pages/blog/BibleStudyAIBenefits';
import AIBibleInsightsAccuracy from '@/pages/blog/AIBibleInsightsAccuracy';
import BibleAIVsTraditionalStudy from '@/pages/blog/BibleAIVsTraditionalStudy';

import './App.css';
import EnhancedBible from '@/pages/EnhancedBible';
import EnhancedSermonHub from '@/pages/EnhancedSermonHub';

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
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes - ModernLayout removed to fix errors */}
              <Route path="/" element={<Home />} />
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
                  <Funding />
                </ErrorBoundary>
              } />
              <Route path="/auth" element={
                <ErrorBoundary>
                  <Auth />
                </ErrorBoundary>
              } />
              <Route path="/blog" element={<Blog />} />
              
              {/* Feature pages */}
              <Route path="/features/ai" element={<AIFeatures />} />
              <Route path="/features/bible-study" element={<BibleStudy />} />
              <Route path="/features/personal-tools" element={<PersonalTools />} />
              <Route path="/features/content-creation" element={<ContentCreation />} />
              <Route path="/features/learning-resources" element={<LearningResources />} />
              <Route path="/features/advanced-study" element={<AdvancedStudy />} />
              
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
                  <ProtectedRoute><Dashboard /></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/bible" element={
                <ErrorBoundary>
                  <ProtectedRoute><Bible /></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/enhanced-bible" element={
                <ErrorBoundary>
                  <ProtectedRoute><EnhancedBible /></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/bible-ai" element={
                <ErrorBoundary>
                  <ProtectedRoute><BibleAI /></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/bible-qa" element={
                <ErrorBoundary>
                  <ProtectedRoute><BibleQA /></ProtectedRoute>
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
                  <ProtectedRoute><Journal /></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/study-hub" element={
                <ErrorBoundary>
                  <ProtectedRoute><StudyHub /></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/topical-study" element={
                <ErrorBoundary>
                  <ProtectedRoute><TopicalStudy /></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/parables" element={
                <ErrorBoundary>
                  <ProtectedRoute><ParablesStudy /></ProtectedRoute>
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
                  <ProtectedRoute><Sermons /></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/sermon-writer" element={
                <ErrorBoundary>
                  <ProtectedRoute><SermonWriter /></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/sermon-library" element={
                <ErrorBoundary>
                  <ProtectedRoute><SermonLibrary /></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/songs" element={
                <ErrorBoundary>
                  <ProtectedRoute><Songs /></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/favorites" element={
                <ErrorBoundary>
                  <ProtectedRoute><Favorites /></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/profile" element={
                <ErrorBoundary>
                  <ProtectedRoute><Profile /></ProtectedRoute>
                </ErrorBoundary>
              } />

              <Route path="/enhanced-sermon-hub" element={
                <ErrorBoundary>
                  <ProtectedRoute><EnhancedSermonHub /></ProtectedRoute>
                </ErrorBoundary>
              } />

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
