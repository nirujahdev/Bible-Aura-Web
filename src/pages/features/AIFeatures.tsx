import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { 
  Brain, MessageCircle, Sparkles, Search, Lightbulb,
  ArrowLeft, Bot, Zap, BookOpen
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const AIFeatures = () => {
  // SEO optimization for AI Features
  useSEO({
    title: "AI Features | AI-Powered Bible Study & Biblical Analysis - Bible Aura",
    description: "Experience Bible Aura's revolutionary AI features: AI Chat Oracle, Biblical Q&A, AI Analysis, Scripture Insights, and Contextual Explanations. Transform your Bible study with artificial intelligence.",
    keywords: "Bible AI, AI Bible study, AI Chat Oracle, Biblical Q&A, AI Analysis, Scripture Insights, AI Bible assistant, biblical artificial intelligence, AI-powered Bible study, Christian AI",
    canonicalUrl: "https://bibleaura.xyz/features/ai-features"
  });

  const aiFeatures = [
    {
      title: "AI Chat Oracle",
      description: "Converse with our advanced AI Bible assistant trained on Scripture, theology, and biblical scholarship for instant spiritual guidance.",
      icon: MessageCircle,
      features: ["24/7 AI spiritual guide", "Scripture-trained responses", "Theological accuracy", "Contextual conversations"],
      link: "/bible-ai",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Biblical Q&A",
      description: "Get instant answers to your biblical questions with AI-powered responses based on sound doctrine and biblical scholarship.",
      icon: Brain,
      features: ["Instant biblical answers", "Doctrine-based responses", "Scripture references", "Theological accuracy"],
      link: "/bible-qa",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "AI Analysis",
      description: "Deep AI-powered analysis of Bible verses with historical context, original language insights, and theological commentary.",
      icon: Sparkles,
      features: ["Verse-by-verse analysis", "Historical context", "Original language insights", "Theological commentary"],
      link: "/bible-ai",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Scripture Insights",
      description: "Discover hidden meanings and connections in Scripture with AI that understands biblical patterns and themes.",
      icon: Lightbulb,
      features: ["Hidden scriptural patterns", "Cross-reference insights", "Thematic connections", "Spiritual revelations"],
      link: "/bible-ai",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Contextual Explanations",
      description: "Understand Bible passages in their historical, cultural, and literary context with comprehensive AI explanations.",
      icon: Search,
      features: ["Historical context", "Cultural background", "Literary analysis", "Archaeological insights"],
      link: "/bible-ai",
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-32 px-4 md:px-6 lg:px-10 bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-hidden pt-24 md:pt-28 lg:pt-32">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto mb-8">
          <Button asChild variant="ghost" className="text-gray-600 hover:text-orange-600">
            <Link to="/features" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to All Features
            </Link>
          </Button>
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full shadow-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            AI <span className="text-transparent bg-gradient-to-r from-purple-500 to-blue-600 bg-clip-text">Features</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Revolutionary AI-powered tools that bring biblical scholarship, theological insights, and spiritual guidance to your fingertips.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-8 py-4">
              <Link to="/bible-ai">
                <Bot className="mr-2 h-5 w-5" />
                Try AI Features
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white px-8 py-4">
              <Link to="/auth">
                <Sparkles className="mr-2 h-5 w-5" />
                Get Started Free
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Revolutionary AI Bible Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of Bible study with AI that understands Scripture, theology, and spiritual wisdom
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiFeatures.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className={`w-20 h-20 ${feature.bgColor} rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-10 w-10 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    {feature.features.map((item, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-500">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        {item}
                      </div>
                    ))}
                  </div>
                  
                  <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white py-3">
                    <Link to={feature.link}>
                      <Zap className="mr-2 h-4 w-4" />
                      Try This AI Feature
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Technology Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              How Our AI Technology Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Bible Aura's AI is trained on biblical scholarship, theological resources, and centuries of Christian wisdom
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Scripture Training</h3>
              <p className="text-gray-600">
                Our AI is trained on the complete Bible, multiple translations, and thousands of theological resources.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Theological Accuracy</h3>
              <p className="text-gray-600">
                Every response is grounded in sound biblical doctrine and verified against orthodox Christian theology.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Continuous Learning</h3>
              <p className="text-gray-600">
                Our AI continuously improves its understanding of Scripture and adapts to provide better insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 md:px-6 lg:px-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Experience the Future of Bible Study
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands who are discovering deeper biblical truths with our AI-powered study tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4">
              <Link to="/bible-ai">
                <Bot className="mr-2 h-5 w-5" />
                Start AI Bible Study
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4">
              <Link to="/features">
                <Sparkles className="mr-2 h-5 w-5" />
                View All Features
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIFeatures; 