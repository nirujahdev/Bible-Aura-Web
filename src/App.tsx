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
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import Features from '@/pages/Features';
import HelpCenter from '@/pages/HelpCenter';
import Contact from '@/pages/Contact';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';

// Import main application pages
import Bible from '@/pages/BibleRedesigned';
import EnhancedBible from '@/pages/EnhancedBible';
import BibleQA from '@/pages/BibleQA';
import ReadingPlan from '@/pages/ReadingPlan';
import Sermons from '@/pages/Sermons';
import SermonWriter from '@/pages/SermonWriter';
import EnhancedSermonHub from '@/pages/EnhancedSermonHub';
import Favorites from '@/pages/Favorites';
import TopicalStudy from '@/pages/TopicalStudy';
import ParablesStudy from '@/pages/ParablesStudy';
import Profile from '@/pages/Profile';

import SermonLibrary from '@/pages/SermonLibrary';

// Import feature pages
import BibleStudy from '@/pages/features/BibleStudy';
import AIFeatures from '@/pages/features/AIFeatures';
import PersonalTools from '@/pages/features/PersonalTools';
import ContentCreation from '@/pages/features/ContentCreation';
import LearningResources from '@/pages/features/LearningResources';
import AdvancedStudy from '@/pages/features/AdvancedStudy';


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
          <li>• Character and topical studies</li>
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
                <Route path="/features" element={<Features />} />
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                
                {/* Public feature pages - SEO optimized */}
                <Route path="/features/bible-study" element={<BibleStudy />} />
                <Route path="/features/ai-features" element={<AIFeatures />} />
                <Route path="/features/personal-tools" element={<PersonalTools />} />
                <Route path="/features/content-creation" element={<ContentCreation />} />
                <Route path="/features/learning-resources" element={<LearningResources />} />
                <Route path="/features/advanced-study" element={<AdvancedStudy />} />
                

                
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
                    <Bible />
                  </ProtectedRoute>
                } />
                
                <Route path="/enhanced-bible" element={
                  <ProtectedRoute>
                    <EnhancedBible />
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
                
                <Route path="/bible-qa" element={
                  <ProtectedRoute>
                    <BibleQA />
                  </ProtectedRoute>
                } />
                
                <Route path="/reading-plan" element={
                  <ProtectedRoute>
                    <ReadingPlan />
                  </ProtectedRoute>
                } />
                
                <Route path="/topical-study" element={
                  <ProtectedRoute>
                    <TopicalStudy />
                  </ProtectedRoute>
                } />
                
                <Route path="/parables-study" element={
                  <ProtectedRoute>
                    <ParablesStudy />
                  </ProtectedRoute>
                } />
                

                
                <Route path="/sermon-library" element={
                  <ProtectedRoute>
                    <SermonLibrary />
                  </ProtectedRoute>
                } />
                
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
