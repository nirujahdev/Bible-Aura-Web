import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, BookOpen, MessageSquare, Target, 
  Brain, Search, FileText, ArrowLeft, MoreVertical,
  CheckCircle, Sparkles, Zap, Users, Clock, 
  Shield, Lightbulb, Heart, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';

const BibleAI = () => {
  const { toast } = useToast();
  
  // SEO optimization
  useSEO(SEO_CONFIG.BIBLE_AI);

  const aiFeatures = [
    {
      icon: Brain,
      title: "Intelligent Scripture Analysis",
      description: "Advanced Bible AI analyzes verses in context, providing deep theological insights and cross-references instantly.",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: MessageSquare,
      title: "AI Bible Chat Assistant",
      description: "Ask any biblical question and receive thoughtful, doctrinally sound responses from our AI companion.",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: Target,
      title: "Personalized Bible Study",
      description: "Get customized study plans and recommendations based on your spiritual journey and preferences.",
      gradient: "from-orange-500 to-orange-600"
    },
    {
      icon: Lightbulb,
      title: "Contextual Bible Insights",
      description: "Understand historical context, cultural background, and theological significance with AI explanations.",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: Search,
      title: "Smart Verse Discovery",
      description: "Find relevant scriptures using natural language queries about themes, emotions, or situations.",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-white p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Bible AI</h1>
            <p className="text-xs text-blue-100">AI-powered Bible study</p>
          </div>
        </div>
        
        <div className="relative">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white p-2"
            onClick={() => toast({ title: "AI Features", description: "Explore our AI-powered Bible study tools below." })}
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white mx-auto shadow-lg">
            <Bot className="h-8 w-8" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              <span className="text-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text">
                Bible AI
              </span>
              <br />
              <span className="text-gray-900">Revolution</span>
            </h2>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of Bible study with our advanced AI assistant. Get instant insights, 
              theological analysis, and personalized guidance for your spiritual journey.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                <Zap className="h-5 w-5 mr-2" />
                Try AI Chat Now
              </Button>
            </Link>
            <Link to="/study-hub">
              <Button variant="outline" size="lg">
                <BookOpen className="h-5 w-5 mr-2" />
                Explore Study Tools
              </Button>
            </Link>
          </div>
        </div>

        {/* AI Features Grid */}
        <div>
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Powerful AI Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div>
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Why Choose Bible Aura AI?
          </h3>
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">
              Ready to Transform Your Bible Study?
            </h3>
            <p className="text-blue-100 max-w-lg mx-auto">
              Join thousands of believers who are already experiencing deeper spiritual insights with Bible Aura AI.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                <MessageSquare className="h-5 w-5 mr-2" />
                Start AI Chat
              </Button>
            </Link>
            <Link to="/bible">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <BookOpen className="h-5 w-5 mr-2" />
                Read Bible
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">50K+</div>
            <div className="text-sm text-gray-600">AI Conversations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">10K+</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">95%</div>
            <div className="text-sm text-gray-600">Satisfaction Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">24/7</div>
            <div className="text-sm text-gray-600">AI Available</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BibleAI; 