import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Brain, 
  MessageSquare, 
  BookOpen, 
  Search, 
  Calendar, 
  Lightbulb,
  Target,
  Zap,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const AIFeaturesShowcase = () => {
  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI Bible Analysis",
      description: "Deep scriptural insights with contextual understanding and cross-references",
      badge: "Advanced",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Interactive Bible Q&A",
      description: "Ask questions about scripture and receive thoughtful, biblically-grounded answers",
      badge: "Popular",
      color: "from-green-500 to-blue-500"
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: "Smart Chat Assistant",
      description: "Conversational Bible study companion for deeper spiritual discussions",
      badge: "New",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Topical Bible Study",
      description: "Explore themes and topics across scripture with AI-curated connections",
      badge: "Featured",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Lightbulb className="h-8 w-8" />,
      title: "Parables Database",
      description: "Comprehensive collection with modern applications and interpretations",
      badge: "Complete",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Reading Plan Generator",
      description: "Personalized Bible reading plans tailored to your spiritual journey",
      badge: "Smart",
      color: "from-teal-500 to-green-500"
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
              <div className="w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <Badge variant="outline" className="text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800">
              AI-Powered
            </Badge>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Powerful AI-Enhanced
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Bible Study Features
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experience Scripture like never before with our intelligent study tools designed to deepen your understanding and strengthen your faith journey.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden relative"
            >
              {/* Gradient Border Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  >
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {feature.description}
                </CardDescription>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-600 dark:text-blue-400 p-0 h-auto font-medium group-hover:translate-x-1 transition-transform"
                >
                  Learn More
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="h-full w-full bg-white/5 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Zap className="h-6 w-6" />
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                Ready to Transform Your Bible Study?
              </h3>
              <p className="text-lg sm:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Enhance your spiritual journey with our AI-powered biblical tools and insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 text-lg"
                >
                  Start Your Journey
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3 text-lg"
                >
                  Watch Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIFeaturesShowcase; 