import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Sparkles, Crown, Heart, BookOpen, Brain, Bookmark, X, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface ModernHeaderProps {
  onDismiss?: () => void;
  variant?: 'default' | 'premium' | 'minimal';
  showDismiss?: boolean;
}

export function ModernHeader({ 
  onDismiss, 
  variant = 'default',
  showDismiss = true 
}: ModernHeaderProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  if (variant === 'minimal') {
    return (
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 left-20 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-3 right-32 w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-2 left-40 w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-4 w-4 text-amber-200 animate-spin" style={{animationDuration: '3s'}} />
              <span className="text-sm font-medium">
                Unlock AI-powered biblical insights with a free account
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                asChild 
                className="bg-white text-orange-600 hover:bg-orange-50 font-semibold shadow-sm h-8 px-4 text-sm"
              >
                <Link to="/auth">
                  Join Free
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
              
              {showDismiss && (
                <Button
                  onClick={handleDismiss}
                  className="text-white hover:bg-white/10 bg-transparent border-none p-1 h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'premium') {
    return (
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white relative overflow-hidden">
        {/* Premium animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
          <div className="absolute top-2 left-10 w-2 h-2 bg-white rounded-full animate-bounce opacity-60"></div>
          <div className="absolute bottom-2 right-20 w-1.5 h-1.5 bg-white rounded-full animate-bounce opacity-40" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-3 right-40 w-1 h-1 bg-white rounded-full animate-bounce opacity-50" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <Crown className="h-7 w-7 sm:h-8 sm:w-8 text-amber-300" />
                  <Sparkles className="h-3 w-3 text-white absolute -top-1 -right-1 animate-pulse" />
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-base sm:text-lg mb-1">Unlock Premium Biblical Experience</h3>
                <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
                  Access AI-powered verse analysis, unlimited notes, advanced search, and personalized spiritual insights
                </p>
                
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">
                    <Brain className="h-3 w-3 mr-1" />
                    AI Analysis
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">
                    <Bookmark className="h-3 w-3 mr-1" />
                    Smart Notes
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">
                    <Heart className="h-3 w-3 mr-1" />
                    Personal Journey
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 lg:flex-shrink-0">
              <Button 
                asChild 
                className="bg-white text-purple-600 hover:bg-purple-50 font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Link to="/auth">
                  <Star className="h-4 w-4 mr-2" />
                  Start Free Trial
                </Link>
              </Button>
              
                             {showDismiss && (
                 <Button
                   onClick={handleDismiss}
                   className="text-white hover:bg-white/10 bg-transparent border-none p-2"
                 >
                   <X className="h-4 w-4" />
                 </Button>
               )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white relative overflow-hidden shadow-lg">
      {/* Modern animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        <div className="absolute top-3 left-16 w-2 h-2 bg-white rounded-full animate-float opacity-60"></div>
        <div className="absolute bottom-2 right-24 w-1.5 h-1.5 bg-white rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-2 right-16 w-1 h-1 bg-white rounded-full animate-float opacity-50" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-3 left-32 w-1.5 h-1.5 bg-white rounded-full animate-float opacity-45" style={{animationDelay: '0.5s'}}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left side - Content */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <Star className="h-3 w-3 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            
            <div className="min-w-0">
              <h2 className="font-bold text-xl lg:text-2xl mb-2 leading-tight">
                Enhance Your Bible Study Experience
              </h2>
              <p className="text-white/95 text-sm lg:text-base leading-relaxed mb-3">
                Create a free account to bookmark verses, take notes, and unlock AI-powered biblical insights
              </p>
              
              {/* Feature highlights */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-xs lg:text-sm">
                  <Bookmark className="h-3 w-3 text-amber-300" />
                  <span className="text-white/90">Save Verses</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs lg:text-sm">
                  <Brain className="h-3 w-3 text-amber-300" />
                  <span className="text-white/90">AI Insights</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs lg:text-sm">
                  <Heart className="h-3 w-3 text-amber-300" />
                  <span className="text-white/90">Personal Notes</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Actions */}
          <div className="flex items-center gap-3 lg:flex-shrink-0">
            <Button 
              asChild 
              className="bg-white text-orange-600 hover:bg-orange-50 font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm lg:text-base px-6 py-2.5"
            >
              <Link to="/auth">
                <Sparkles className="h-4 w-4 mr-2" />
                Join Free
              </Link>
            </Button>
            
            <Button 
              asChild 
              className="border-2 border-white/40 text-white hover:bg-white/10 font-semibold backdrop-blur-sm transition-all duration-300 bg-transparent text-sm px-4"
            >
              <Link to="/auth">
                Sign In
              </Link>
            </Button>
            
                         {showDismiss && (
               <Button
                 onClick={handleDismiss}
                 className="text-white hover:bg-white/10 bg-transparent border-none p-2 ml-2"
               >
                 <X className="h-4 w-4" />
               </Button>
             )}
          </div>
        </div>
      </div>
      
      {/* Bottom highlight line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
    </div>
  );
} 