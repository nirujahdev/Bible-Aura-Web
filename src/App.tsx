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
import Features from '@/pages/Features';

// Import main application pages
import Bible from '@/pages/Bible';
import EnhancedBible from '@/pages/EnhancedBible';
import BiblePageExact from '@/pages/BiblePageExact';
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
import Community from '@/pages/Community';
import SubscriptionSuccess from '@/pages/SubscriptionSuccess';
import SubscriptionCancelled from '@/pages/SubscriptionCancelled';
import Songs from '@/pages/Songs';
import SermonLibrary from '@/pages/SermonLibrary';

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

// Protected Route wrapper
import ProtectedRoute from '@/components/ProtectedRoute';

const queryClient = new QueryClient();

// Public pages that don't require authentication (for SEO)
const PublicBibleStudyPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
    <div className="text-center max-w-2xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">✦ Bible Study Hub</h1>
      <p className="text-xl text-gray-600 mb-8">
        Access powerful AI-powered Bible study tools, verse analysis, and spiritual insights. 
        Join thousands of believers deepening their faith through intelligent Bible study.
      </p>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-700">Features Include:</h2>
        <ul className="text-left text-gray-600 space-y-2">
          <li>• AI-powered Bible chat and Q&A</li>
          <li>• Multiple Bible translations (KJV, NIV, ESV, etc.)</li>
          <li>• Digital journal and note-taking</li>
          <li>• Character and topical studies</li>
          <li>• Community discussions and prayer requests</li>
          <li>• Sermon writing and teaching tools</li>
        </ul>
        <a 
          href="/auth" 
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors mt-6"
        >
          Start Your Bible Study Journey
        </a>
      </div>
    </div>
  </div>
);

const PlaceholderPage = ({ title, description }: { title: string; description: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">✦ {title}</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">{description}</p>
      <a href="/auth" className="text-blue-500 hover:text-blue-700 underline text-lg">
        Sign In / Sign Up to Access Full Features
      </a>
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
                {/* Public routes - Accessible to Google crawlers */}
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/features" element={<Features />} />
                
                {/* Public feature pages - SEO optimized */}
                <Route path="/features/bible-study" element={<BibleStudy />} />
                <Route path="/features/ai-features" element={<AIFeatures />} />
                <Route path="/features/personal-tools" element={<PersonalTools />} />
                <Route path="/features/content-creation" element={<ContentCreation />} />
                <Route path="/features/learning-resources" element={<LearningResources />} />
                <Route path="/features/advanced-study" element={<AdvancedStudy />} />
                
                {/* Public blog post routes */}
                <Route path="/blog/how-ai-transforms-bible-study" element={<HowAITransformsBibleStudy />} />
                <Route path="/blog/ai-bible-insights-accuracy" element={<AIBibleInsightsAccuracy />} />
                <Route path="/blog/bible-study-ai-benefits" element={<BibleStudyAIBenefits />} />
                <Route path="/blog/bible-ai-vs-traditional-study" element={<BibleAIVsTraditionalStudy />} />
                <Route path="/blog/:slug" element={<PlaceholderPage title="Blog Article" description="This blog article is being prepared. Check back soon!" />} />
                
                {/* Public study pages for SEO */}
                <Route path="/study-hub" element={<PublicBibleStudyPage />} />
                <Route path="/bible-qa" element={<PlaceholderPage title="Bible Q&A" description="Get answers to your Bible questions with AI-powered insights and community wisdom." />} />
                <Route path="/topical-study" element={<PlaceholderPage title="Topical Bible Study" description="Explore Bible topics in depth with guided studies on faith, prayer, love, and more." />} />
                <Route path="/parables-study" element={<PlaceholderPage title="Parables Study" description="Discover the deeper meanings of Jesus' parables with interactive study guides and historical context." />} />
                <Route path="/community" element={<PlaceholderPage title="Bible Study Community" description="Connect with fellow believers, share insights, and grow together in faith through community discussions." />} />
                <Route path="/sermons" element={<PlaceholderPage title="Sermon Library & Tools" description="Access sermon writing tools, browse sermon library, and create inspiring messages with AI assistance." />} />
                <Route path="/sermon-writer" element={<PlaceholderPage title="AI Sermon Writer" description="Create powerful sermons with AI assistance, structured outlines, and biblical insights." />} />
                <Route path="/songs" element={<PlaceholderPage title="Worship Songs & Hymns" description="Discover Christian songs, hymns, and worship music for personal devotion and church services." />} />
                
                {/* Protected routes - Require authentication */}
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
                    <BiblePageExact />
                  </ProtectedRoute>
                } />
                
                <Route path="/enhanced-bible" element={
                  <ProtectedRoute>
                    <EnhancedBible />
                  </ProtectedRoute>
                } />
                
                <Route path="/journal" element={
                  <ProtectedRoute>
                    <Journal />
                  </ProtectedRoute>
                } />
                
                <Route path="/favorites" element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                {/* Subscription pages */}
                <Route path="/subscription-success" element={<SubscriptionSuccess />} />
                <Route path="/subscription-cancelled" element={<SubscriptionCancelled />} />
                
                {/* 404 fallback */}
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
