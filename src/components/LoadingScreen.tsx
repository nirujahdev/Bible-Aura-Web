import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = "Loading..." }: LoadingScreenProps) => {
  const [dots, setDots] = useState('');
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Show tip after 3 seconds
    const tipTimeout = setTimeout(() => {
      setShowTip(true);
    }, 3000);

    return () => {
      clearInterval(dotsInterval);
      clearTimeout(tipTimeout);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 animate-fade-in-up max-w-md px-4">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-primary">
            ✦Bible Aura
          </h1>
          <p className="text-lg text-muted-foreground">
            {message}{dots}
          </p>
        </div>
        
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>

        {showTip && (
          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200 animate-fade-in">
            <p className="text-sm text-orange-700">
              💡 <strong>Tip:</strong> If this takes too long, try refreshing the page or check your internet connection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen; 