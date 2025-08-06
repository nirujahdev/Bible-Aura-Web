import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Analytics } from '@vercel/analytics/react';

// Import basic pages
import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import About from '@/pages/About';
import Blog from '@/pages/Blog';
import Pricing from '@/pages/Pricing';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';

// Import main application pages
import Bible from '@/pages/Bible';
import EnhancedBible from '@/pages/EnhancedBible';
import BibleQA from '@/pages/BibleQA';
import Journal from '@/pages/Journal';
import StudyHub from '@/pages/StudyHub';
import Sermons from '@/pages/Sermons';
import SermonWriter from '@/pages/SermonWriter';
import EnhancedSermonHub from '@/pages/EnhancedSermonHub';
import Favorites from '@/pages/Favorites';
import TopicalStudy from '@/pages/TopicalStudy';
import ParablesStudy from '@/pages/ParablesStudy';
import Profile from '@/pages/Profile';
import SubscriptionSuccess from '@/pages/SubscriptionSuccess';
import SubscriptionCancelled from '@/pages/SubscriptionCancelled';

// Import feature pages
import BibleStudy from '@/pages/features/BibleStudy';
import AIFeatures from '@/pages/features/AIFeatures';
import PersonalTools from '@/pages/features/PersonalTools';
import ContentCreation from '@/pages/features/ContentCreation';
import LearningResources from '@/pages/features/LearningResources';
import AdvancedStudy from '@/pages/features/AdvancedStudy';

// Import blog pages
import HowAITransformsBibleStudy from '@/pages/blog/HowAITransformsBibleStudy';
import AIBibleInsightsAccuracy from '@/pages/blog/AIBibleInsightsAccuracy';
import BibleStudyAIBenefits from '@/pages/blog/BibleStudyAIBenefits';
import BibleAIVsTraditionalStudy from '@/pages/blog/BibleAIVsTraditionalStudy';

// Import components
import ProtectedRoute from '@/components/ProtectedRoute';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Simple placeholder component for missing pages
const PlaceholderPage = ({ title, description }: { title: string; description: string }) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center max-w-md mx-auto p-8">
      <h1 className="text-3xl font-bold text-orange-500 mb-4">✦Bible Aura</h1>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>
      <div className="space-y-2">
        <a href="/" className="block text-orange-500 hover:underline">← Back to Home</a>
        <a href="/auth" className="block text-blue-500 hover:underline">Sign In / Sign Up</a>
      </div>
    </div>
  </div>
);

function App() {
  console.log('✦ Bible Aura App rendering...');

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="App min-h-screen bg-background">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/pricing" element={<Pricing />} />
                
                {/* Feature pages */}
                <Route path="/features" element={<PlaceholderPage title="All Features" description="Explore all Bible Aura features in one place. Coming soon!" />} />
                <Route path="/features/bible-study" element={<BibleStudy />} />
                <Route path="/features/ai-features" element={<AIFeatures />} />
                <Route path="/features/personal-tools" element={<PersonalTools />} />
                <Route path="/features/content-creation" element={<ContentCreation />} />
                <Route path="/features/learning-resources" element={<LearningResources />} />
                <Route path="/features/advanced-study" element={<AdvancedStudy />} />
                
                {/* Blog post routes */}
                <Route path="/blog/how-ai-transforms-bible-study" element={<HowAITransformsBibleStudy />} />
                <Route path="/blog/ai-bible-insights-accuracy" element={<AIBibleInsightsAccuracy />} />
                <Route path="/blog/bible-study-ai-benefits" element={<BibleStudyAIBenefits />} />
                <Route path="/blog/bible-ai-vs-traditional-study" element={<BibleAIVsTraditionalStudy />} />
                <Route path="/blog/:slug" element={<PlaceholderPage title="Blog Article" description="This blog article is being prepared. Check back soon!" />} />
                
                {/* Main Application - Dashboard and AI chat */}
                <Route path="/app" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/ai-chat" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/bible" element={
                  <ProtectedRoute>
                    <Bible />
                  </ProtectedRoute>
                } />
                
                <Route path="/enhanced-bible" element={
                  <ProtectedRoute>
                    <EnhancedBible />
                  </ProtectedRoute>
                } />
                
                <Route path="/bible-qa" element={
                  <ProtectedRoute>
                    <BibleQA />
                  </ProtectedRoute>
                } />
                
                <Route path="/journal" element={
                  <ProtectedRoute>
                    <Journal />
                  </ProtectedRoute>
                } />
                
                <Route path="/study-hub" element={
                  <ProtectedRoute>
                    <StudyHub />
                  </ProtectedRoute>
                } />
                
                <Route path="/sermons" element={
                  <ProtectedRoute>
                    <Sermons />
                  </ProtectedRoute>
                } />
                
                <Route path="/sermon-writer" element={
                  <ProtectedRoute>
                    <SermonWriter />
                  </ProtectedRoute>
                } />
                
                <Route path="/enhanced-sermon-hub" element={
                  <ProtectedRoute>
                    <EnhancedSermonHub />
                  </ProtectedRoute>
                } />
                
                <Route path="/favorites" element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                } />
                
                <Route path="/topical-study" element={
                  <ProtectedRoute>
                    <TopicalStudy />
                  </ProtectedRoute>
                } />
                
                <Route path="/parables" element={
                  <ProtectedRoute>
                    <ParablesStudy />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                {/* Subscription routes */}
                <Route path="/subscription/success" element={<SubscriptionSuccess />} />
                <Route path="/subscription/cancelled" element={<SubscriptionCancelled />} />
                
                {/* Additional utility routes */}
                <Route path="/contact" element={<PlaceholderPage title="Contact Us" description="Get in touch with the Bible Aura team. Contact form coming soon!" />} />
                <Route path="/bible-characters" element={<PlaceholderPage title="Bible Characters" description="Learn about biblical characters and their stories. Coming soon!" />} />
                
                {/* Fallback - 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Analytics />
            </div>
          </Router>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
