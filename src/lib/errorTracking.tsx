// Error Tracking and Monitoring Utility for Bible Aura
import React from 'react';

interface ErrorTrackingConfig {
  environment: string;
  enableConsoleLogging: boolean;
  enableUserFeedback: boolean;
  sampleRate: number;
}

interface ErrorContext {
  user?: {
    id?: string;
    email?: string;
  };
  page?: string;
  action?: string;
  component?: string;
  additionalData?: Record<string, any>;
}

class ErrorTracker {
  private config: ErrorTrackingConfig;
  private isInitialized = false;
  private userContext: any = null;

  constructor(config: ErrorTrackingConfig) {
    this.config = config;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Set up global error handlers
      this.setupGlobalErrorHandlers();
      
      this.isInitialized = true;
      console.log('Error tracking initialized successfully');
    } catch (error) {
      console.error('Failed to initialize error tracking:', error);
    }
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason, {
        component: 'global',
        action: 'unhandled_promise_rejection',
        additionalData: {
          promise: event.promise
        }
      });
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        component: 'global',
        action: 'global_error',
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });
  }

  captureError(error: Error | string, context?: ErrorContext) {
    try {
      const errorMessage = typeof error === 'string' ? error : error.message;
      const errorStack = typeof error === 'object' ? error.stack : undefined;

      // Create comprehensive error report
      const errorReport = {
        message: errorMessage,
        stack: errorStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        user: this.userContext,
        context: context,
        environment: this.config.environment
      };

      // Log to console if enabled
      if (this.config.enableConsoleLogging) {
        console.group('🔥 Error Captured');
        console.error('Message:', errorMessage);
        console.error('Context:', context);
        console.error('Full Report:', errorReport);
        if (errorStack) console.error('Stack:', errorStack);
        console.groupEnd();
      }

      // Send to analytics
      this.sendToAnalytics(error, context);

      // Store locally for potential later submission
      this.storeErrorLocally(errorReport);

    } catch (trackingError) {
      console.error('Error in error tracking:', trackingError);
    }
  }

  private sendToAnalytics(error: Error | string, context?: ErrorContext) {
    // Send to Google Analytics or other analytics platforms
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as any).gtag;
      gtag('event', 'exception', {
        description: typeof error === 'string' ? error : error.message,
        fatal: false,
        custom_map: context
      });
    }

    // Send to any other analytics services
    if (typeof window !== 'undefined' && 'dataLayer' in window) {
      (window as any).dataLayer.push({
        event: 'error_tracked',
        error_message: typeof error === 'string' ? error : error.message,
        error_context: context
      });
    }
  }

  private storeErrorLocally(errorReport: any) {
    try {
      const storedErrors = JSON.parse(localStorage.getItem('bible_aura_errors') || '[]');
      storedErrors.push(errorReport);
      
      // Keep only last 10 errors
      if (storedErrors.length > 10) {
        storedErrors.shift();
      }
      
      localStorage.setItem('bible_aura_errors', JSON.stringify(storedErrors));
    } catch (e) {
      console.error('Failed to store error locally:', e);
    }
  }

  setUser(user: { id?: string; email?: string; [key: string]: any }) {
    this.userContext = user;
  }

  addBreadcrumb(message: string, category: string = 'navigation', level: 'info' | 'warning' | 'error' = 'info') {
    if (this.config.enableConsoleLogging) {
      console.log(`🍞 Breadcrumb [${category}]: ${message}`);
    }

    // Store breadcrumbs locally
    try {
      const breadcrumbs = JSON.parse(localStorage.getItem('bible_aura_breadcrumbs') || '[]');
      breadcrumbs.push({
        message,
        category,
        level,
        timestamp: Date.now()
      });
      
      // Keep only last 20 breadcrumbs
      if (breadcrumbs.length > 20) {
        breadcrumbs.shift();
      }
      
      localStorage.setItem('bible_aura_breadcrumbs', JSON.stringify(breadcrumbs));
    } catch (e) {
      console.error('Failed to store breadcrumb:', e);
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
    if (this.config.enableConsoleLogging) {
      console.log(`📝 Message [${level}]: ${message}`, context);
    }

    // Send message to analytics
    this.sendToAnalytics(message, context);
  }

  // Get stored errors for manual submission
  getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem('bible_aura_errors') || '[]');
    } catch (e) {
      return [];
    }
  }

  // Clear stored errors after successful submission
  clearStoredErrors() {
    try {
      localStorage.removeItem('bible_aura_errors');
      localStorage.removeItem('bible_aura_breadcrumbs');
    } catch (e) {
      console.error('Failed to clear stored errors:', e);
    }
  }
}

// Create and configure error tracker
const errorTracker = new ErrorTracker({
  environment: import.meta.env.MODE || 'development',
  enableConsoleLogging: import.meta.env.DEV || import.meta.env.VITE_ENABLE_CONSOLE_LOGS === 'true',
  enableUserFeedback: true,
  sampleRate: import.meta.env.PROD ? 0.1 : 1.0
});

// React Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorTracker.captureError(error, {
      component: 'ErrorBoundary',
      action: 'component_error',
      additionalData: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      }
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="error-boundary p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">We've been notified about this error and will fix it soon.</p>
          <button 
            onClick={this.resetError}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export the configured error tracker
export { errorTracker };

// Utility functions for common error scenarios
export const trackError = (error: Error | string, context?: ErrorContext) => {
  errorTracker.captureError(error, context);
};

export const trackUser = (user: { id?: string; email?: string }) => {
  errorTracker.setUser(user);
};

export const trackBreadcrumb = (message: string, category?: string) => {
  errorTracker.addBreadcrumb(message, category);
};

export const trackMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  errorTracker.captureMessage(message, level);
};

// Initialize error tracking
errorTracker.initialize();

export default errorTracker; 