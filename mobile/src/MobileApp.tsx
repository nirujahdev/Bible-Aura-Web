import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';

// Pages - Auth & Dashboard
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
import NotFound from '@/pages/NotFound';
import EnhancedBible from '@/pages/EnhancedBible';

// Capacitor plugins
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('JWT')) {
          return false;
        }
        if (error instanceof Error && error.message.includes('permission')) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Component to handle mobile app startup and routing
const MobileAppRouter: React.FC = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Configure status bar for mobile
    StatusBar.setStyle({ style: Style.Dark });
    
    // Hide splash screen after app loads
    SplashScreen.hide();
  }, []);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading Bible Aura...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Mobile root route - redirect based on auth status */}
      <Route 
        path="/" 
        element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />} 
      />
      
      {/* Auth route - only show if not authenticated */}
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/dashboard" replace /> : <Auth />} 
      />

      {/* Protected routes */}
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
        <ErrorBoundary>
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
        <ErrorBoundary>
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

      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function MobileApp() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App mobile-app">
            <MobileAppRouter />
          </div>
          <Toaster />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default MobileApp;
