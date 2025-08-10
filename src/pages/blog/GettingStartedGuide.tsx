import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { 
  Calendar, Clock, User, ArrowLeft, ArrowRight, Share2, BookOpen, 
  Brain, MessageSquare, Search, Target, CheckCircle, Lightbulb,
  TrendingUp, Star, Quote, ExternalLink, Crown, Zap, Users, Heart,
  Play, Rocket, Settings, Map
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSEO, createBlogPostStructuredData } from "@/hooks/useSEO";
import Footer from "../../components/Footer";
import { SEOBacklinks } from "../../components/SEOBacklinks";

const GettingStartedGuide = () => {
  useSEO({
    title: "Getting Started with Bible Aura: Complete Guide to AI Bible Chat | Tutorial 2024",
    description: "Master Bible Aura with our comprehensive getting started guide. Learn AI Bible chat, features, and study techniques for enhanced biblical understanding.",
    keywords: "Bible Aura tutorial, getting started Bible AI, AI Bible chat guide, Bible Aura how to, Bible AI tutorial, Christian AI guide, Bible study AI help",
    canonicalUrl: "https://bibleaura.xyz/blog/getting-started-bible-aura-complete-guide-ai-bible-chat",
    structuredData: createBlogPostStructuredData(
      "Getting Started with Bible Aura: Complete Guide to AI Bible Chat",
      "Master Bible Aura with our comprehensive getting started guide. Learn AI Bible chat, features, and study techniques for enhanced biblical understanding.",
      "2024-01-15",
      "Bible Aura Team",
      "https://bibleaura.xyz/blog/getting-started-bible-aura-complete-guide-ai-bible-chat"
    )
  });

  const steps = [
    {
      step: 1,
      title: "Create Your Account",
      description: "Sign up for free and set up your personalized Bible study profile",
      action: "Visit bibleaura.xyz and click 'Get Started' - it takes less than 30 seconds",
      icon: Play,
      gradient: "from-blue-500 to-blue-600"
    },
    {
      step: 2,
      title: "Start Your First AI Conversation",
      description: "Ask your first biblical question and experience AI-powered insights",
      action: "Try asking 'What does John 3:16 mean?' or 'How can I grow closer to God?'",
      icon: Brain,
      gradient: "from-purple-500 to-purple-600"
    },
    {
      step: 3,
      title: "Explore Key Features",
      description: "Discover sermon writing, journaling, and community features",
      action: "Navigate through the sidebar to explore Bible reader, journal, and sermon tools",
      icon: Map,
      gradient: "from-green-500 to-green-600"
    },
    {
      step: 4,
      title: "Customize Your Experience",
      description: "Set preferences, choose study plans, and personalize your dashboard",
      action: "Visit settings to choose your preferred Bible translation and study topics",
      icon: Settings,
      gradient: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <GlobalNavigation variant="landing" />
      
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5" />
            <span className="text-blue-100">January 15, 2024</span>
            <Clock className="w-5 h-5 ml-4" />
            <span className="text-blue-100">10 min read</span>
            <User className="w-5 h-5 ml-4" />
            <span className="text-blue-100">Bible Aura Team</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Getting Started with Bible Aura
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
            Your complete guide to mastering AI-powered Bible study and spiritual growth
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Rocket className="w-5 h-5 mr-2" />
              Start Now
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Share2 className="w-5 h-5 mr-2" />
              Share Guide
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <Card className="mb-12 shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardContent className="p-8">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Welcome to the future of Bible study! Whether you're a new believer, seasoned Christian, or ministry leader, this comprehensive guide will help you harness the full power of <strong>Bible Aura's AI assistant</strong> for deeper biblical understanding and spiritual growth.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-6 rounded-lg">
              <p className="text-gray-800 font-medium flex items-center gap-2">
                <Rocket className="w-5 h-5 text-blue-600" />
                <strong>Quick Start:</strong> Most users are having meaningful AI Bible conversations within 2 minutes of signing up.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8 mb-12">
          {steps.map((step, index) => (
            <Card key={index} className="shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <CardHeader className={`bg-gradient-to-r ${step.gradient} text-white p-6`}>
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white/90 mb-1">Step {step.step}</div>
                    <CardTitle className="text-xl text-white">{step.title}</CardTitle>
                    <p className="text-white/90">{step.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Action Step:</p>
                  <p className="text-gray-800">{step.action}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-12 shadow-xl border-0 bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-green-500" />
              Pro Tips for New Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Best Questions to Ask</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• "What's the context of [specific verse]?"</li>
                  <li>• "How can I apply this passage to my life?"</li>
                  <li>• "What are the key themes in [book]?"</li>
                  <li>• "Help me understand this difficult verse"</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Features to Explore First</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• AI Bible Chat for instant answers</li>
                  <li>• Personal journal for insights</li>
                  <li>• Sermon writer for ministry</li>
                  <li>• Community for fellowship</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-12 shadow-xl border-0 bg-gradient-to-r from-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
              <ExternalLink className="w-6 h-6 text-orange-500" />
              Ready to Begin Your Journey?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 mb-6">
              Take your first step into AI-powered Bible study:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <Button asChild className="bg-blue-500 hover:bg-blue-600">
                <Link to="/auth">
                  <Play className="w-4 h-4 mr-2" />
                  Sign Up Free
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50">
                <Link to="/bible-ai">
                  <Brain className="w-4 h-4 mr-2" />
                  Try AI Chat
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                <Link to="/features">
                  <Star className="w-4 h-4 mr-2" />
                  Explore Features
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center py-8 border-t border-gray-200">
          <Button asChild variant="outline" className="flex items-center gap-2">
            <Link to="/blog/5-ways-bible-aura-ai-assistant-deepens-faith-journey">
              <ArrowLeft className="w-4 h-4" />
              Previous Article
            </Link>
          </Button>
          <Button asChild className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-orange-500 text-white">
            <Link to="/blog/bible-aura-vs-traditional-bible-study-ai-difference">
              Next Article
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      <SEOBacklinks currentPage="blog" />
      <Footer />
    </div>
  );
};

export default GettingStartedGuide; 