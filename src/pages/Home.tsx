import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { 
  BookOpen, MessageCircle, Star, Sparkles, Send, User, Zap, Mic, Bot, FileText, BarChart3,
  Shield, CheckCircle, Users, Edit, Pen, Target, Clock, Lightbulb
} from "lucide-react";
import { Link } from "react-router-dom";
import { ManualContextualLinks } from "@/components/ContextualLinks";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import { useSEO, SEO_CONFIG } from "@/hooks/useSEO";

const Home = () => {
  // SEO optimization
  useSEO(SEO_CONFIG.HOME);

  return (
    <div className="min-h-screen bg-background w-full">
      <GlobalNavigation variant="landing" />

      {/* Hero Section - Laptop optimized spacing */}
      <section className="relative pt-12 md:pt-16 lg:pt-24 pb-16 md:pb-20 lg:pb-32 px-4 md:px-6 lg:px-10 bg-gradient-to-br from-orange-50 via-white to-amber-50 overflow-hidden">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left Side - Content - Laptop focused */}
            <div className="text-center lg:text-left order-2 lg:order-1 space-y-6 lg:space-y-8">
              {/* Main Headline - Laptop optimized */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-gray-900">
                Transform Your 
                <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text block lg:inline lg:ml-3">
                  Bible Study
                </span>
                <span className="block mt-2 lg:mt-0"> with AI</span>
              </h1>

              {/* Subheadline - Refined for laptops */}
              <p className="text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Experience the future of biblical learning with AI-powered insights, personalized study plans, and intelligent scripture analysis.
              </p>

              {/* Feature Tags - Optimized spacing */}
              <div className="flex justify-center lg:justify-start gap-2 lg:gap-3">
                <span className="px-2 md:px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs lg:text-sm font-medium">
                  ⚡ AI Insights
                </span>
                <span className="px-2 md:px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs lg:text-sm font-medium">
                  📖 All in one Bible
                </span>
                <span className="px-2 md:px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs lg:text-sm font-medium">
                  💬 AI Chat
                </span>
              </div>

              {/* CTA Button - No animations */}
              <div className="pt-2 lg:pt-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-base lg:text-lg px-6 lg:px-8 py-4 lg:py-5 rounded-xl shadow-lg hover:scale-105 transition-transform w-full sm:w-auto">
                  <Link to="/auth">
                    <Sparkles className="h-4 lg:h-5 w-4 lg:w-5 mr-2" />
                    START YOUR JOURNEY
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Side - Phone Animation - Laptop optimized */}
            <div className="relative flex justify-center order-2">
              {/* Phone Mockup - Better laptop proportions */}
              <div className="relative w-64 md:w-72 lg:w-80 xl:w-96 h-auto">
                {/* Phone Frame */}
                <div className="bg-gray-900 p-2 md:p-3 rounded-3xl shadow-2xl">
                  <div className="bg-white rounded-2xl overflow-hidden">
                    {/* Screen Content */}
                    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                      
                      {/* Header */}
                      <div className="text-center">
                        <h3 className="font-bold text-gray-900 text-lg md:text-xl">✦Bible Aura</h3>
                        <p className="text-gray-600 text-sm">AI-Powered Bible Study</p>
                      </div>

                      {/* Chat Interface */}
                      <div className="space-y-3">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">"What does John 3:16 mean?"</p>
                        </div>
                        <div className="bg-orange-500 text-white p-3 rounded-lg">
                          <p className="text-sm">John 3:16 reveals God's incredible love...</p>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-50 p-2 rounded-lg text-center">
                          <BookOpen className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                          <p className="text-xs text-blue-700 font-medium">Bible</p>
                        </div>
                        <div className="bg-purple-50 p-2 rounded-lg text-center">
                          <Bot className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                          <p className="text-xs text-purple-700 font-medium">AI Chat</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements - Reduced animation */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Compact for laptops */}
      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">50K+</h3>
              <p className="text-gray-600 font-medium">Active Users</p>
            </div>
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">1M+</h3>
              <p className="text-gray-600 font-medium">AI Conversations</p>
            </div>
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">99%</h3>
              <p className="text-gray-600 font-medium">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Clean design */}
      <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
              Powerful Features for 
              <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text"> Every Believer</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're a new believer or biblical scholar, our AI-powered tools adapt to your spiritual journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:scale-105 text-center p-6 md:p-8">
              <div className="w-14 md:w-16 h-14 md:h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Bot className="h-6 md:h-8 w-6 md:w-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">AI Insights</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                Get intelligent explanations and contextual analysis of Scripture
              </p>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:scale-105 text-center p-6 md:p-8">
              <div className="w-14 md:w-16 h-14 md:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto group-hover:scale-110 transition-transform">
                <MessageCircle className="h-6 md:h-8 w-6 md:w-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">AI Chat</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                Ask questions and receive instant biblical guidance
              </p>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:scale-105 text-center p-6 md:p-8">
              <div className="w-14 md:w-16 h-14 md:h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto group-hover:scale-110 transition-transform">
                <FileText className="h-6 md:h-8 w-6 md:w-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Personal Journal</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                Document your spiritual journey with AI assistance
              </p>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:scale-105 text-center p-6 md:p-8">
              <div className="w-14 md:w-16 h-14 md:h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 md:h-8 w-6 md:w-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Study Tools</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                Access comprehensive Bible study resources
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
            Transform Your Spiritual Life with AI-Powered Insights
          </h2>
          <p className="text-base md:text-lg lg:text-xl mb-6 md:mb-8 opacity-90 max-w-3xl mx-auto">
            Start your spiritual transformation today with AI-powered biblical insights and community support.
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100 text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-xl shadow-lg w-full sm:w-auto">
            <span className="text-orange-600 mr-2">✦</span>
            START YOUR JOURNEY
          </Button>
        </div>
      </section>

      {/* Professional Sermon Writer Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full shadow-xl mb-6">
              <Edit className="h-8 w-8 text-white" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Professional Sermon Writer
            </h2>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Create compelling sermons with AI assistance. From outline to delivery, our tools help pastors and speakers craft impactful biblical messages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Sermon Ideas</h3>
              <p className="text-sm text-gray-600">Get inspired with AI-generated sermon topics and themes</p>
            </Card>
            
            <Card className="text-center p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Structured Outlines</h3>
              <p className="text-sm text-gray-600">Create well-organized sermon outlines with biblical flow</p>
            </Card>
            
            <Card className="text-center p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Time Management</h3>
              <p className="text-sm text-gray-600">Optimize sermon length and pacing for maximum impact</p>
            </Card>
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-all">
              <Link to="/sermon-writer">
                <Pen className="mr-2 h-5 w-5" />
                Start Writing Sermons
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* Privacy Section - Clean and Small */}
      <section className="py-12 bg-gray-50">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Your Privacy Matters
            </h3>
            
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              We protect your spiritual journey with enterprise-grade security. Your data stays private and secure.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                asChild 
                size="sm" 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2 text-sm"
              >
                <Link to="/privacy">
                  Privacy Policy
                </Link>
              </Button>
              <Button 
                asChild 
                size="sm" 
                variant="outline"
                className="border border-blue-500 text-blue-600 hover:bg-blue-50 px-6 py-2 text-sm"
              >
                <Link to="/terms">
                  Terms of Service
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home; 