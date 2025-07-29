import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Bug, HelpCircle } from 'lucide-react';

interface WidgetErrorBoundaryProps {
  children: ReactNode;
  widgetName: string;
  fallbackMessage?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showRetry?: boolean;
}

interface WidgetErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class WidgetErrorBoundary extends Component<WidgetErrorBoundaryProps, WidgetErrorBoundaryState> {
  constructor(props: WidgetErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<WidgetErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Widget Error [${this.props.widgetName}]:`, error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, this would send to an error tracking service like Sentry
    console.log('Logging error to service:', {
      widget: this.props.widgetName,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      const { widgetName, fallbackMessage, showRetry = true } = this.props;
      const maxRetries = 3;
      const canRetry = showRetry && this.state.retryCount < maxRetries;

      return (
        <Card className="h-full border-red-200 bg-red-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              {widgetName} Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <Bug className="h-4 w-4" />
              <AlertDescription>
                {fallbackMessage || `The ${widgetName} widget encountered an error and couldn't load properly.`}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              {canRetry && (
                <Button 
                  onClick={this.handleRetry}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again ({this.state.retryCount}/{maxRetries})
                </Button>
              )}

              <div className="text-center">
                <p className="text-xs text-red-600/70">
                  If this persists, try refreshing the page
                </p>
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left">
                <summary className="cursor-pointer text-xs text-red-600/70 hover:text-red-600 flex items-center gap-1">
                  <HelpCircle className="h-3 w-3" />
                  Debug Info
                </summary>
                <div className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto max-h-24">
                  <div className="font-medium text-red-800">Error:</div>
                  <div className="text-red-700">{this.state.error.message}</div>
                  {this.state.error.stack && (
                    <>
                      <div className="font-medium text-red-800 mt-2">Stack:</div>
                      <pre className="text-red-600 whitespace-pre-wrap">
                        {this.state.error.stack.slice(0, 200)}...
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Simple functional wrapper for easier usage
export function withWidgetErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  widgetName: string,
  options?: {
    fallbackMessage?: string;
    showRetry?: boolean;
  }
) {
  return function WrappedComponent(props: T) {
    return (
      <WidgetErrorBoundary 
        widgetName={widgetName}
        fallbackMessage={options?.fallbackMessage}
        showRetry={options?.showRetry}
      >
        <Component {...props} />
      </WidgetErrorBoundary>
    );
  };
}

export default WidgetErrorBoundary; 