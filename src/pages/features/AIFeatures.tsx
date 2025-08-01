import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { 
  Brain, MessageCircle, Sparkles, Search, Lightbulb, Bot, Zap
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const AIFeatures = () => {
  // SEO optimization for AI Features
  useSEO({
    title: "AI-Powered Bible Study Features | Intelligent Biblical Analysis - Bible Aura",
    description: "Discover Bible Aura's AI features: intelligent biblical analysis, AI chat assistance, verse insights, smart search, and contextual explanations. Transform your Bible study with artificial intelligence.",
    keywords: "AI Bible study, biblical AI, AI Bible analysis, intelligent Bible search, AI Bible chat, biblical artificial intelligence, smart Bible study tools, AI scripture analysis",
    canonicalUrl: "https://bibleaura.xyz/features/ai-features"
  });

  const aiFeatures = [
    {
      title: "AI Biblical Analysis",
      description: "Get deep AI-powered analysis of Bible verses with historical context, theological insights, and practical applications for modern life.",
      icon: Brain,
      features: ["Verse-by-verse analysis", "Historical context", "Theological insights", "Practical applications"],
      link: "/bible-ai"
    },
    {
      title: "AI Chat Assistant",
      description: "Converse with our AI Bible assistant for instant answers to biblical questions, scripture explanations, and spiritual guidance.",
      icon: MessageCircle,
      features: ["24/7 Bible assistance", "Scripture explanations", "Spiritual guidance", "Instant responses"],
      link: "/bible-ai"
    },
    {
      title: "Smart Verse Search",
      description: "Find Bible verses using natural language with our intelligent search that understands context and meaning, not just keywords.",
      icon: Search,
      features: ["Natural language search", "Contextual results", "Multiple translations", "Relevant suggestions"],
      link: "/bible"
    },
    {
      title: "Scripture Insights",
      description: "Discover hidden connections and deeper meanings in Scripture with AI-powered pattern recognition and cross-referencing.",
      icon: Lightbulb,
      features: ["Scripture connections", "Pattern recognition", "Cross-references", "Deeper meanings"],
      link: "/bible-ai"
    },
    {
      title: "Biblical Q&A",
      description: "Ask any biblical question and receive accurate, scripturally-based answers with relevant verse references and explanations.",
      icon: Sparkles,
      features: ["Accurate answers", "Scripture references", "Detailed explanations", "Theological accuracy"],
      link: "/bible-qa"
    },
    {
      title: "AI Study Companion",
      description: "Your personal AI study partner that adapts to your learning style and provides customized study recommendations.",
      icon: Bot,
      features: ["Personalized guidance", "Study recommendations", "Progress tracking", "Adaptive learning"],
      link: "/bible-ai"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-blue-50/50">
      <GlobalNavigation variant="landing" />

      {/* Section 1: Hero */}
      <section className="relative pt-32 pb-20 px-4 md:px-6 lg:px-10 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 text-white mx-auto mb-8 shadow-2xl animate-pulse">
            <Brain className="h-10 w-10" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            <span className="text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text">
              AI-Powered Bible Study
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            Experience revolutionary AI technology that understands Scripture, provides intelligent analysis, and enhances your biblical understanding with personalized insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
              <Link to="/auth">
                <Brain className="h-5 w-5 mr-2" />
                Start AI Bible Study
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-4 rounded-xl hover:scale-105 transition-all duration-300">
              <Link to="/bible-ai">
                <MessageCircle className="h-5 w-5 mr-2" />
                Try AI Assistant
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 2: Features Grid */}
      <section className="py-20 px-4 md:px-6 lg:px-10 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Intelligent Bible Study Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how artificial intelligence can deepen your understanding of Scripture and enhance your spiritual journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="text-center">
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <div className="space-y-2 mb-8">
                      {feature.features.map((item, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-500 justify-center">
                          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full mr-3"></div>
                          {item}
                        </div>
                      ))}
                    </div>
                    
                    <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg transition-all duration-300">
                      <Link to={feature.link}>
                        <Zap className="mr-2 h-4 w-4" />
                        Try {feature.title}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIFeatures; 