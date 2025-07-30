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
      <div className="bg-orange-500 text-white relative overflow-hidden">
        <div className="w-full px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-4 w-4 text-amber-200" />
              <span className="text-sm font-medium">
                Unlock AI-powered biblical insights with a free account
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                asChild 
                className="bg-white text-orange-600 hover:bg-orange-50 font-semibold shadow-sm h-8 px-4 text-sm"
              >
                <Link to="/auth">Get Started</Link>
              </Button>
              
              {showDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-white hover:bg-white/10 h-8 w-8 p-0"
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

  if (variant === 'premium') {
    return (
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 text-white relative overflow-hidden">
        {/* Simplified background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-2 left-10 w-2 h-2 bg-white rounded-full"></div>
          <div className="absolute bottom-2 right-20 w-1.5 h-1.5 bg-white rounded-full"></div>
          <div className="absolute top-3 right-40 w-1 h-1 bg-white rounded-full"></div>
        </div>
        
        <div className="w-full px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Crown className="h-8 w-8 text-yellow-300" />
                <Sparkles className="h-3 w-3 text-white absolute -top-1 -right-1" />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold">Premium Features Available</h3>
                  <Badge className="bg-yellow-400 text-purple-900 font-semibold">NEW</Badge>
                </div>
                
                <p className="text-sm text-purple-100">
                  Unlock AI biblical analysis, unlimited chats, and premium study tools
                </p>
                
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-purple-200">
                  <div className="flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    AI Analysis
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    Study Tools
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    Unlimited Access
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                asChild 
                className="bg-white text-purple-600 hover:bg-purple-50 font-bold shadow-lg"
              >
                <Link to="/auth">
                  Start Free Trial
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              
              {showDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-white hover:bg-white/10 h-9 w-9 p-0"
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

  // Default variant - simplified
  return (
    <div className="bg-white border-b border-gray-200 relative shadow-sm">
      {/* Clean background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-3 left-16 w-2 h-2 bg-orange-500 rounded-full"></div>
        <div className="absolute bottom-2 right-24 w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
        <div className="absolute top-2 right-16 w-1 h-1 bg-orange-500 rounded-full"></div>
        <div className="absolute bottom-3 left-32 w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
      </div>
      
      <div className="w-full px-4 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Sparkles className="h-10 w-10 text-orange-500" />
              <Star className="h-3 w-3 text-amber-500 absolute -top-1 -right-1" />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                  Welcome to ✦Bible Aura
                </h2>
                <Badge className="bg-orange-500 text-white font-bold text-xs">
                  AI POWERED
                </Badge>
              </div>
              
              <p className="text-sm lg:text-base text-gray-600 mb-3">
                Experience scripture like never before with AI-powered insights, personalized study plans, and intelligent biblical analysis.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  AI Biblical Analysis
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Multiple Translations
                </div>
                <div className="flex items-center gap-1">
                  <Bookmark className="h-3 w-3" />
                  Personal Study Tools
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  Community Features
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <Button 
              asChild 
              className="bg-orange-500 text-white hover:bg-orange-600 font-bold shadow-lg text-sm lg:text-base px-6 py-2.5"
            >
              <Link to="/auth">
                Start Your Journey
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline"
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm px-4"
            >
              <Link to="/about">Learn More</Link>
            </Button>
            
            {showDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-gray-500 hover:bg-gray-100 h-10 w-10 p-0 self-center"
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