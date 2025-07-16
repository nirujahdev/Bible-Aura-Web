import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Star, LogIn, Crown, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface PremiumFeaturePromptProps {
  title: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  className?: string;
}

export function PremiumFeaturePrompt({ 
  title, 
  description, 
  features, 
  icon, 
  className = "" 
}: PremiumFeaturePromptProps) {
  return (
    <div className={`min-h-screen bg-background flex items-center justify-center ${className}`}>
      <div className="max-w-2xl mx-auto p-8">
        <Card className="card-sacred border-2 border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-aura-gradient w-fit">
              {icon}
            </div>
            <CardTitle className="text-2xl font-divine text-primary mb-2 flex items-center justify-center gap-2">
              <Crown className="h-6 w-6" />
              {title}
            </CardTitle>
            <p className="text-muted-foreground font-sacred">
              {description}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Features Preview */}
            <div className="grid gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Star 
                    className="h-5 w-5 text-amber-500 mt-1 animate-celestial-float" 
                    style={{animationDelay: `${index * 0.5}s`}} 
                  />
                  <div>
                    <p className="text-sm text-muted-foreground">{feature}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="space-y-3 pt-4 border-t">
              <Button 
                asChild 
                className="w-full bg-aura-gradient hover:opacity-90 transition-divine group"
              >
                <Link to="/auth">
                  <LogIn className="h-4 w-4 mr-2 group-hover:animate-spiritual-wave" />
                  Sign In to Access {title}
                </Link>
              </Button>
              <Button 
                asChild 
                className="w-full hover-divine border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <Link to="/auth">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Free Account
                </Link>
              </Button>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" />
                Premium feature • Join thousands of believers
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 