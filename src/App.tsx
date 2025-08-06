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


// Import feature pages
import BibleStudy from '@/pages/features/BibleStudy';
import AIFeatures from '@/pages/features/AIFeatures';
import PersonalTools from '@/pages/features/PersonalTools';
import ContentCreation from '@/pages/features/ContentCreation';
import LearningResources from '@/pages/features/LearningResources';
import AdvancedStudy from '@/pages/features/AdvancedStudy';

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
                <Route path="/features/bible-study" element={<BibleStudy />} />
                <Route path="/features/ai-features" element={<AIFeatures />} />
                <Route path="/features/personal-tools" element={<PersonalTools />} />
                <Route path="/features/content-creation" element={<ContentCreation />} />
                <Route path="/features/learning-resources" element={<LearningResources />} />
                <Route path="/features/advanced-study" element={<AdvancedStudy />} />
                
                {/* Protected routes removed - no dashboard */}
                
                {/* Placeholder routes for missing pages */}
                <Route path="/features" element={<PlaceholderPage title="All Features" description="Explore all Bible Aura features in one place. Coming soon!" />} />
                <Route path="/contact" element={<PlaceholderPage title="Contact Us" description="Get in touch with the Bible Aura team. Contact form coming soon!" />} />
                <Route path="/bible" element={<PlaceholderPage title="Digital Bible" description="Read and study the Bible with AI assistance. Coming soon!" />} />
                <Route path="/bible-ai" element={<PlaceholderPage title="Bible AI Chat" description="Chat with our AI Bible assistant. Coming soon!" />} />
                <Route path="/bible-qa" element={<PlaceholderPage title="Bible Q&A" description="Ask questions about the Bible and get AI-powered answers. Coming soon!" />} />
                <Route path="/journal" element={<PlaceholderPage title="Bible Journal" description="Keep a digital Bible journal with AI insights. Coming soon!" />} />
                <Route path="/study-hub" element={<PlaceholderPage title="Study Hub" description="Comprehensive Bible study resources. Coming soon!" />} />
                <Route path="/sermons" element={<PlaceholderPage title="Sermon Library" description="Browse our collection of inspiring sermons. Coming soon!" />} />
                <Route path="/sermon-writer" element={<PlaceholderPage title="Sermon Writer" description="Create sermons with AI assistance. Coming soon!" />} />
                <Route path="/songs" element={<PlaceholderPage title="Christian Songs" description="Discover Christian music and hymns. Coming soon!" />} />
                <Route path="/favorites" element={<PlaceholderPage title="Favorite Verses" description="Save and organize your favorite Bible verses. Coming soon!" />} />
                <Route path="/topical-study" element={<PlaceholderPage title="Topical Study" description="Study the Bible by topics and themes. Coming soon!" />} />
                <Route path="/parables" element={<PlaceholderPage title="Parables Study" description="Study the parables of Jesus with AI insights. Coming soon!" />} />
                <Route path="/bible-characters" element={<PlaceholderPage title="Bible Characters" description="Learn about biblical characters and their stories. Coming soon!" />} />
                <Route path="/profile" element={<PlaceholderPage title="User Profile" description="Manage your Bible Aura profile and preferences. Coming soon!" />} />
                
                {/* Blog post routes */}
                <Route path="/blog/:slug" element={<PlaceholderPage title="Blog Article" description="This blog article is being prepared. Check back soon!" />} />
                
                {/* Subscription routes */}
                <Route path="/subscription/success" element={<PlaceholderPage title="Subscription Successful" description="Thank you for subscribing to Bible Aura! Your subscription is now active." />} />
                <Route path="/subscription/cancelled" element={<PlaceholderPage title="Subscription Cancelled" description="Your subscription was cancelled. You can try again anytime." />} />
                
                {/* Fallback */}
                <Route path="*" element={
                  <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-orange-500 mb-4">✦Bible Aura</h1>
                      <p className="text-muted-foreground">Page not found</p>
                      <p className="text-sm text-gray-500 mt-2">
                        <a href="/" className="text-orange-500 hover:underline">Go back to Home</a>
                      </p>
                    </div>
                  </div>
                } />
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
