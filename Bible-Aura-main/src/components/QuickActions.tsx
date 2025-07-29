import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Search, Heart, Calendar, Sparkles, Star, Crown } from "lucide-react";
import { Link } from "react-router-dom";

const QuickActions = () => {
  const divineActions = [
    {
      icon: MessageCircle,
      title: "Ask AI Oracle",
      description: "Seek divine guidance",
      link: "/chat",
      color: "from-orange-500 to-red-500",
      delay: "0s"
    },
    {
      icon: Search,
      title: "Sacred Search",
      description: "Find holy verses",
      link: "/bible",
      color: "from-orange-400 to-orange-600",
      delay: "0.1s"
    },
    {
      icon: Heart,
      title: "Prayer Garden",
      description: "Commune with divine",
      link: "/prayers",
      color: "from-orange-600 to-red-600",
      delay: "0.2s"
    },
    {
      icon: Calendar,
      title: "Daily Devotion",
      description: "Spiritual scheduling",
      link: "/plans",
      color: "from-orange-300 to-orange-500",
      delay: "0.3s"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {divineActions.map((action, index) => (
        <Card 
          key={action.title} 
          className="card-sacred group hover:scale-105 transition-celestial cursor-pointer animate-sacred-fade-in"
          style={{animationDelay: action.delay}}
        >
          <CardContent className="p-6">
            <Link to={action.link} className="block">
              <div className="text-center space-y-4">
                {/* Divine Icon Container */}
                <div className="relative mx-auto w-16 h-16 mb-4">
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} rounded-2xl animate-divine-pulse group-hover:animate-divine-pulse-fast`}>
                  </div>
                  <div className="relative flex items-center justify-center w-full h-full">
                    <action.icon className="h-8 w-8 text-white animate-sacred-glow group-hover:animate-celestial-bounce" />
                    <Sparkles className="h-3 w-3 text-white/80 absolute -top-1 -right-1 animate-celestial-float" />
                  </div>
                </div>

                {/* Sacred Text */}
                <div>
                  <h3 className="font-sacred text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground group-hover:text-primary/70 transition-colors">
                    {action.description}
                  </p>
                </div>

                {/* Divine Action Button */}
                <Button 
                  className="btn-divine w-full group-hover:scale-105 transition-divine"
                  size="sm"
                >
                  <Star className="h-4 w-4 mr-2 animate-celestial-float" />
                  Begin Journey
                </Button>
              </div>

              {/* Celestial Hover Effect */}
              <div className="absolute inset-0 bg-sacred-radial opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none"></div>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuickActions;