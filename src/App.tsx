import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ModernLayout } from '@/components/ModernLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import SmartRedirect from '@/components/SmartRedirect';
import ErrorBoundary from '@/components/ErrorBoundary';
import { logDatabaseStatus } from '@/utils/databaseTest';

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
    // Run database health check on startup in development
    if (process.env.NODE_ENV === 'development') {
      logDatabaseStatus();
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          {/* <SmartRedirect /> */}
          <div className="App">
            <Routes>
              {/* Public routes - ModernLayout removed to fix errors */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Funding />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/blog" element={<Blog />} />
              
              {/* Feature pages */}
              <Route path="/features/ai" element={<AIFeatures />} />
              <Route path="/features/bible-study" element={<BibleStudy />} />
              <Route path="/features/personal-tools" element={<PersonalTools />} />
              <Route path="/features/content-creation" element={<ContentCreation />} />
              <Route path="/features/learning" element={<LearningResources />} />
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
                      <p className="text-gray-600 mb-4">Unable to load dashboard. Please try refreshing.</p>
                      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded">
                        Refresh Page
                      </button>
                    </div>
                  </div>
                }>
                  <ProtectedRoute><ModernLayout><Dashboard /></ModernLayout></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/bible" element={
                <ErrorBoundary>
                  <ProtectedRoute><ModernLayout><EnhancedBible /></ModernLayout></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/bible-ai" element={
                <ErrorBoundary>
                  <ProtectedRoute><ModernLayout><BibleAI /></ModernLayout></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/bible-qa" element={
                <ErrorBoundary>
                  <ProtectedRoute><ModernLayout><BibleQA /></ModernLayout></ProtectedRoute>
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
                  <ProtectedRoute><ModernLayout><Journal /></ModernLayout></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/study-hub" element={
                <ErrorBoundary>
                  <ProtectedRoute><ModernLayout><StudyHub /></ModernLayout></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/topical-study" element={
                <ErrorBoundary>
                  <ProtectedRoute><ModernLayout><TopicalStudy /></ModernLayout></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/parables" element={
                <ErrorBoundary>
                  <ProtectedRoute><ModernLayout><ParablesStudy /></ModernLayout></ProtectedRoute>
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
                  <ProtectedRoute><ModernLayout><Sermons /></ModernLayout></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/sermon-writer" element={
                <ErrorBoundary>
                  <ProtectedRoute><ModernLayout><SermonWriter /></ModernLayout></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/sermon-library" element={
                <ErrorBoundary>
                  <ProtectedRoute><ModernLayout><SermonLibrary /></ModernLayout></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/songs" element={
                <ErrorBoundary>
                  <ProtectedRoute><ModernLayout><Songs /></ModernLayout></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/favorites" element={
                <ErrorBoundary>
                  <ProtectedRoute><ModernLayout><Favorites /></ModernLayout></ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/profile" element={
                <ErrorBoundary>
                  <ProtectedRoute><ModernLayout><Profile /></ModernLayout></ProtectedRoute>
                </ErrorBoundary>
              } />

              {/* Catch all route */}
              <Route path="*" element={<ModernLayout><NotFound /></ModernLayout>} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
