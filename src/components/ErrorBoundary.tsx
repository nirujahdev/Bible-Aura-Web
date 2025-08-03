import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      retryCount: 0
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Show error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🐛 ERROR DETAILS:');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Component stack:', errorInfo.componentStack);
    }
    
    this.setState({
      error,
      errorInfo,
    });

    // Log error to your error reporting service here
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // You can integrate with services like Sentry, LogRocket, etc.
    console.error('Error logged:', {
      error: error.toString(),
      errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  };

  private handleRetry = () => {
    if (this.state.retryCount < 3) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    } else {
      // Reload the page after 3 retries
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private getErrorMessage = (error: Error | null): string => {
    if (!error) return 'An unexpected error occurred';

    const message = error.message.toLowerCase();
    
    // Database/Supabase errors
    if (message.includes('column') && message.includes('does not exist')) {
      return 'Database schema issue detected. Our team has been notified and this will be fixed shortly.';
    }
    
    if (message.includes('relation') && message.includes('does not exist')) {
      return 'Database table missing. Please try refreshing the page or contact support.';
    }
    
    if (message.includes('permission denied') || message.includes('row level security')) {
      return 'Access permission issue. Please sign out and sign back in to refresh your session.';
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }
    
    if (message.includes('jwt') || message.includes('token')) {
      return 'Session expired. Please sign in again to continue.';
    }
    
    // Generic error for other cases
    return 'Something went wrong. We\'ve logged this error and will investigate.';
  };

  private getRecoveryActions = (error: Error | null) => {
    if (!error) return [];

    const message = error.message.toLowerCase();
    const actions = [];

    if (message.includes('column') || message.includes('relation')) {
      actions.push({
        label: 'Refresh Database Schema',
        action: () => window.location.reload(),
        variant: 'default' as const
      });
    }

    if (message.includes('permission') || message.includes('jwt') || message.includes('token')) {
      actions.push({
        label: 'Sign Out & Sign In',
        action: () => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/auth';
        },
        variant: 'outline' as const
      });
    }

    // Always include retry and home options
    actions.push({
      label: this.state.retryCount < 3 ? 'Try Again' : 'Reload Page',
      action: this.handleRetry,
      variant: 'default' as const
    });

    actions.push({
      label: 'Go to Home',
      action: this.handleGoHome,
      variant: 'outline' as const
    });

    return actions;
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.getErrorMessage(this.state.error);
      const recoveryActions = this.getRecoveryActions(this.state.error);

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full border-red-200 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl text-slate-800">
                Oops! Something went wrong
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-slate-600 leading-relaxed">
                  {errorMessage}
                </p>
                
                {this.state.retryCount > 0 && (
                  <p className="text-sm text-slate-500 mt-2">
                    Retry attempt: {this.state.retryCount}/3
                  </p>
                )}
              </div>

              <div className="space-y-2">
                {recoveryActions.map((action, index) => (
                  <Button
                    key={index}
                    onClick={action.action}
                    variant={action.variant}
                    className="w-full"
                    size="sm"
                  >
                    {action.label === 'Try Again' && <RefreshCw className="w-4 h-4 mr-2" />}
                    {action.label === 'Go to Home' && <Home className="w-4 h-4 mr-2" />}
                    {action.label}
                  </Button>
                ))}
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-slate-500 flex items-center gap-1">
                    <Bug className="w-3 h-3" />
                    Technical Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-slate-100 rounded text-slate-700 font-mono text-xs overflow-auto max-h-32">
                    <div><strong>Error Name:</strong> {this.state.error.name}</div>
                    <div><strong>Error Message:</strong> {this.state.error.message}</div>
                    <div><strong>Error:</strong> {this.state.error.toString()}</div>
                    {this.state.errorInfo && (
                      <div className="mt-2">
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 