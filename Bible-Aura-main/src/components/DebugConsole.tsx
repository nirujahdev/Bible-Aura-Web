import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: Date;
}

export function DebugConsole() {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Capture console errors
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      setErrors(prev => [...prev, {
        message: `ERROR: ${message}`,
        timestamp: new Date()
      }]);
      
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      setErrors(prev => [...prev, {
        message: `WARN: ${message}`,
        timestamp: new Date()
      }]);
      
      originalWarn.apply(console, args);
    };

    // Capture unhandled errors
    const handleError = (event: ErrorEvent) => {
      setErrors(prev => [...prev, {
        message: `UNHANDLED ERROR: ${event.message}`,
        stack: event.error?.stack,
        timestamp: new Date()
      }]);
    };

    // Capture unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      setErrors(prev => [...prev, {
        message: `UNHANDLED REJECTION: ${event.reason}`,
        timestamp: new Date()
      }]);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    // Show debug console if there are errors
    if (errors.length > 0) {
      setIsVisible(true);
    }

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // Auto-show if errors occur
  useEffect(() => {
    if (errors.length > 0) {
      setIsVisible(true);
    }
  }, [errors]);

  if (!isVisible || errors.length === 0) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Debug ({errors.length})
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-red-700 text-sm flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Debug Console ({errors.length} errors)
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0 text-red-700 hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-0 max-h-60 overflow-y-auto">
          <div className="space-y-2">
            {errors.slice(-5).map((error, index) => (
              <Alert key={index} className="border-red-200 bg-white">
                <AlertDescription className="text-xs">
                  <div className="font-mono text-red-600 mb-1">
                    {error.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="text-red-800 break-all">
                    {error.message}
                  </div>
                  {error.stack && (
                    <pre className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">
                      {error.stack.slice(0, 200)}...
                    </pre>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setErrors([])}
              className="text-xs"
            >
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-xs"
            >
              Reload
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 