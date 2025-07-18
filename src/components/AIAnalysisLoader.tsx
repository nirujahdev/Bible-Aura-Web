import { Crown, Star, Sparkles } from "lucide-react";

interface AIAnalysisLoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function AIAnalysisLoader({ message = "Seeking divine wisdom...", size = "md" }: AIAnalysisLoaderProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-16 w-16"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className="flex items-center gap-3 animate-sacred-fade-in">
      {/* AI Avatar with Secondary Logo */}
      <div className="relative">
        <div className={`${sizeClasses[size]} flex items-center justify-center bg-primary/10 rounded-full animate-divine-pulse`}>
          <span className="text-primary font-bold">✦AI</span>
        </div>
        <div className="absolute inset-0">
          <Sparkles className="h-3 w-3 text-primary absolute top-0 right-0 animate-celestial-float" />
          <Crown className="h-2 w-2 text-primary/80 absolute bottom-0 left-0 animate-celestial-float" style={{animationDelay: '0.5s'}} />
          <Star className="h-2 w-2 text-primary/60 absolute top-1 left-1 animate-celestial-float" style={{animationDelay: '1s'}} />
        </div>
      </div>
      
      {/* Loading Message */}
      <div className="flex items-center gap-2">
        <div className="spinner-celestial h-4 w-4"></div>
        <span className={`${textSizeClasses[size]} text-muted-foreground font-sacred animate-holy-text-glow`}>
          {message}
        </span>
      </div>
    </div>
  );
}

export default AIAnalysisLoader; 