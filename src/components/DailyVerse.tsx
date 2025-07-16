import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Share, Heart, Sparkles, Star } from "lucide-react";

const DailyVerse = () => {
  return (
    <Card className="card-sacred bg-aura-gradient border-0 shadow-divine relative overflow-hidden group">
      {/* Divine Background Animation */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full animate-celestial-float"></div>
        <div className="absolute bottom-6 left-6 w-4 h-4 bg-white/30 rounded-full animate-celestial-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-white/40 rounded-full animate-celestial-float" style={{animationDelay: '2s'}}></div>
      </div>

      <CardContent className="p-8 relative z-10">
        {/* Sacred Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <BookOpen className="h-6 w-6 text-white animate-sacred-glow" />
              <Sparkles className="h-3 w-3 text-white/80 absolute -top-1 -right-1 animate-celestial-float" />
            </div>
            <span className="text-lg font-sacred text-white">Today's Divine Verse</span>
          </div>
          
          {/* Divine Action Buttons */}
          <div className="flex gap-3">
            <Button variant="ghost" size="icon" 
                    className="h-10 w-10 hover:bg-white/20 transition-divine group">
              <Heart className="h-5 w-5 text-white group-hover:animate-divine-pulse-fast" />
            </Button>
            <Button variant="ghost" size="icon" 
                    className="h-10 w-10 hover:bg-white/20 transition-divine group">
              <Share className="h-5 w-5 text-white group-hover:animate-spiritual-wave" />
            </Button>
          </div>
        </div>
        
        {/* Sacred Scripture Text */}
        <div className="relative">
          <blockquote className="text-2xl font-holy text-white leading-relaxed mb-6 animate-sacred-fade-in relative">
            <div className="absolute -left-4 -top-2">
              <Star className="h-4 w-4 text-white/60 animate-celestial-float" />
            </div>
            "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, to give you hope and a future."
            <div className="absolute -right-2 -bottom-2">
              <Star className="h-3 w-3 text-white/60 animate-celestial-float" style={{animationDelay: '1s'}} />
            </div>
          </blockquote>
        </div>
        
        {/* Divine Reference */}
        <p className="text-lg text-white/90 mb-8 font-sacred animate-sacred-fade-in" style={{animationDelay: '0.2s'}}>
          📖 Jeremiah 29:11 (NIV)
        </p>
        
        {/* Sacred Action Button */}
        <Button className="btn-divine w-full group animate-sacred-fade-in" style={{animationDelay: '0.4s'}}>
          <Sparkles className="h-5 w-5 mr-2 group-hover:animate-sacred-spin" />
          Explore This Passage
        </Button>
      </CardContent>

      {/* Divine Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-1000 
                      transform -translate-x-full group-hover:translate-x-full">
      </div>
    </Card>
  );
};

export default DailyVerse;