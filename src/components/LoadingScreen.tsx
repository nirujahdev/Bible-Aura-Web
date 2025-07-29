import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = "Loading..." }: LoadingScreenProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 animate-fade-in-up">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-primary">
            ✦Bible Aura
          </h1>
          <p className="text-lg text-muted-foreground">
            {message}
          </p>
        </div>
        
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 