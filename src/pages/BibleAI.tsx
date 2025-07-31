import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { 
  Bot, BookOpen, MessageSquare, Zap, Brain, Target, 
  CheckCircle, ArrowRight, Sparkles, Star, Users,
  Clock, Shield, Lightbulb, Heart, Search, FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSEO, SEO_CONFIG } from "@/hooks/useSEO";
import { SEOBacklinks, SEOBreadcrumbs } from "@/components/SEOBacklinks";
import { ManualContextualLinks } from "@/components/ContextualLinks";

const BibleAI = () => {
  // SEO optimization
  useSEO(SEO_CONFIG.BIBLE_AI);

  const aiFeatures = [
    {
      icon: Brain,
      title: "Intelligent Scripture Analysis",
      description: "Our advanced Bible AI analyzes verses in context, providing deep theological insights and cross-references instantly.",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: MessageSquare,
      title: "AI Bible Chat Assistant",
      description: "Ask any biblical question and receive thoughtful, doctrinally sound responses from our AI Bible companion.",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: Target,
      title: "Personalized Bible Study",
      description: "Get customized study plans and recommendations based on your spiritual journey and learning preferences.",
      gradient: "from-orange-500 to-orange-600"
    },
    {
      icon: Lightbulb,
      title: "Contextual Bible Insights",
      description: "Understand historical context, cultural background, and theological significance with AI-powered explanations.",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: Search,
      title: "Smart Verse Discovery",
      description: "Find relevant scriptures using natural language queries. Ask about themes, emotions, or situations.",
      gradient: "from-indigo-500 to-indigo-600"
    },
    {
      icon: FileText,
      title: "AI Study Notes Generation",
      description: "Automatically generate comprehensive study notes, sermon outlines, and devotional content.",
      gradient: "from-pink-500 to-pink-600"
    }
  ];

  const benefits = [
    "Instant biblical insights and explanations",
    "24/7 AI Bible study companion",
    "Doctrinally sound theological responses",
    "Multiple Bible translations supported",
    "Cross-reference suggestions",
    "Historical and cultural context",
    "Personalized study recommendations",
    "Sermon and devotional assistance"
  ];

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Hero Section - Bible AI Focus */}
      <section className="relative py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-10 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden pt-24 md:pt-28 lg:pt-32">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 md:w-48 lg:w-64 h-32 md:h-48 lg:h-64 bg-blue-400/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 md:w-64 lg:w-80 h-48 md:h-64 lg:h-80 bg-purple-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative w-full max-w-6xl mx-auto text-center">
          <div className="space-y-6 md:space-y-8">
            {/* Header Icon */}
            <div className="inline-flex items-center justify-center w-16 md:w-20 h-16 md:h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white mx-auto shadow-lg">
              <Bot className="h-8 md:h-10 w-8 md:w-10" />
            </div>

            {/* Main Title */}
            <div className="space-y-4 md:space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="text-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text">
                  Bible AI
                </span>
                <br />
                <span className="text-gray-900">
                  Revolution
                </span>
              </h1>
              
              <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Experience the future of Bible study with AI-powered biblical insights, intelligent scripture analysis, and personalized spiritual guidance. Transform how you study God's Word.
              </p>
            </div>

            {/* Key Features Tags */}
            <div className="flex flex-wrap justify-center gap-3 lg:gap-4 max-w-4xl mx-auto">
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm lg:text-base font-medium">
                🤖 AI Bible Assistant
              </span>
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm lg:text-base font-medium">
                📖 Smart Scripture Analysis
              </span>
              <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm lg:text-base font-medium">
                💬 Intelligent Bible Chat
              </span>
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm lg:text-base font-medium">
                ⚡ Instant Insights
              </span>
            </div>

            {/* CTA Button */}
            <div className="pt-4 lg:pt-6">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-lg lg:text-xl px-8 lg:px-12 py-6 lg:py-8 rounded-xl shadow-lg hover:scale-105 transition-transform">
                <Link to="/auth">
                  <Bot className="h-5 lg:h-6 w-5 lg:w-6 mr-2" />
                  Try Bible AI Free
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Powerful <span className="text-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text">Bible AI</span> Features
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how artificial intelligence transforms biblical study with advanced features designed for modern believers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiFeatures.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white hover:scale-105 p-6">
                <div className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Benefits List */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                Why Choose <span className="text-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text">Bible AI</span>?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Testimonial/Stats */}
            <div className="space-y-6">
              <Card className="p-8 bg-white shadow-lg border-0">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-lg mb-6">
                    "Bible AI has revolutionized my daily Bible study. The insights are profound and the contextual explanations help me understand Scripture like never before."
                  </p>
                  <div className="font-semibold text-gray-900">- Sarah Johnson</div>
                  <div className="text-gray-500">Bible Study Leader</div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
                  <div className="text-gray-600">Bible AI Users</div>
                </div>
                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">1M+</div>
                  <div className="text-gray-600">AI Insights Generated</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Bible AI Works */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              How <span className="text-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text">Bible AI</span> Works
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the simplicity and power of AI-enhanced Bible study in three easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "1", title: "Ask Your Question", desc: "Type any biblical question or enter a verse reference to start your AI-powered study session.", icon: MessageSquare, color: "blue" },
              { num: "2", title: "AI Analysis", desc: "Our advanced Bible AI processes your query using theological knowledge and biblical scholarship.", icon: Brain, color: "purple" },
              { num: "3", title: "Get Insights", desc: "Receive detailed explanations, cross-references, and contextual insights tailored to your spiritual journey.", icon: Lightbulb, color: "green" }
            ].map((step, index) => (
              <Card key={index} className="text-center p-8 hover:shadow-lg transition-shadow">
                <div className={`w-16 h-16 bg-gradient-to-r ${
                  step.color === 'blue' ? 'from-blue-500 to-blue-600' :
                  step.color === 'purple' ? 'from-purple-500 to-purple-600' :
                  'from-green-500 to-green-600'
                } rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg`}>
                  <span className="text-white text-xl font-bold">{step.num}</span>
                </div>
                <div className={`w-12 h-12 ${
                  step.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  step.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                  'bg-green-100 text-green-600'
                } rounded-xl flex items-center justify-center mb-4 mx-auto`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Start Your Bible AI Journey Today
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            Join thousands of believers who are transforming their Bible study with AI-powered insights and intelligent spiritual guidance.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl shadow-lg w-full sm:w-auto">
              <Link to="/auth">
                <Bot className="mr-2 h-5 w-5" />
                Get Started Free
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6 rounded-xl w-full sm:w-auto">
              <Link to="/about">
                <ArrowRight className="mr-2 h-5 w-5" />
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Related AI Bible Tools for SEO */}
      <section className="py-12 bg-gray-50">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
          <ManualContextualLinks context="ai-features" limit={6} />
        </div>
      </section>

      {/* SEO Internal Links */}
      <SEOBacklinks currentPage="/bible-ai" category="ai" />

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-orange-400 mb-3">
                ✦Bible Aura
              </h3>
              <p className="text-gray-400 text-base">
                AI-Powered Biblical Insight
              </p>
            </div>
            
            {/* Menu Section */}
            <div className="text-center md:text-left">
              <h4 className="text-xl font-semibold text-white mb-6">Bible AI Features</h4>
              <nav className="space-y-3">
                <Link to="/bible" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  AI Bible Study
                </Link>
                <Link to="/study" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Smart Scripture Analysis
                </Link>
                <Link to="/journal" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  AI Bible Chat
                </Link>
                <Link to="/sermons" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  AI Sermon Assistant
                </Link>
              </nav>
            </div>
            
            {/* Contact Section */}
            <div className="text-center md:text-left">
              <h4 className="text-xl font-semibold text-white mb-6">Contact</h4>
              <div className="space-y-3">
                <p className="text-gray-400">@bible_aura.ai</p>
                <a 
                  href="mailto:bibleaura.contact@gmail.com" 
                  className="block text-gray-400 hover:text-orange-400 transition-colors duration-300"
                >
                  bibleaura.contact@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="text-center text-gray-400 text-sm">
              <span>&copy; 2024 ✦Bible Aura. All rights reserved. Bible AI Technology by </span>
              <a 
                href="https://www.instagram.com/benaiah_4?igsh=cGZuYmI2YWw0d25r" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 transition-colors duration-300 underline"
              >
                Benaiah Nicholas Nimal
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BibleAI; 