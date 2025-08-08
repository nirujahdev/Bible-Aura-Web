import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { 
  BookOpen, MessageCircle, Star, Sparkles, Send, User, Zap, Mic, Bot, FileText, BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
// import { SEOBacklinks, QuickActionSEOLinks } from "@/components/SEOBacklinks"; // COMMENTED OUT TO FIX ERRORS
// import { ManualContextualLinks } from "@/components/ContextualLinks"; // COMMENTED OUT TO FIX ERRORS
import Footer from "@/components/Footer";
// import FAQ from "@/components/FAQ"; // COMMENTED OUT TO FIX ERRORS
import { useSEO, SEO_CONFIG } from "@/hooks/useSEO";

const Home = () => {
  // SEO optimization
  useSEO(SEO_CONFIG.HOME);



  return (
    <div className="min-h-screen bg-background w-full">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Hero Section - Optimized for Laptop View */}
      <section className="relative py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-10 bg-gradient-to-br from-gray-50 via-white to-orange-50 overflow-hidden pt-24 md:pt-28 lg:pt-32">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 md:w-48 lg:w-64 h-32 md:h-48 lg:h-64 bg-orange-400/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 md:w-64 lg:w-80 h-48 md:h-64 lg:h-80 bg-yellow-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          {/* Floating icons - Subtle animations */}
          <div className="hidden lg:block absolute top-20 left-20 text-orange-400/20 animate-pulse">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="hidden lg:block absolute top-40 right-32 text-yellow-400/20 animate-pulse delay-500">
            <Star className="h-5 w-5" />
          </div>
        </div>

        <div className="relative w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Content - Optimized Sizing */}
            <div className="text-center lg:text-left flex flex-col justify-center order-1 space-y-4 md:space-y-6 lg:space-y-8">
              {/* Header Icon - No jumping */}
              <div className="inline-flex items-center justify-center w-12 md:w-14 lg:w-16 h-12 md:h-14 lg:h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mx-auto lg:mx-0 shadow-lg">
                <Sparkles className="h-6 md:h-7 lg:h-8 w-6 md:w-7 lg:w-8" />
              </div>

              {/* Main Title - Better proportions */}
              <div className="space-y-3 md:space-y-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                  <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">
                    AI-Powered Biblical Insight
                  </span>
                </h1>
                
                <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Grow deeper in your faith with Bible Aura's AI-powered spiritual tools and biblical insights.
                </p>
              </div>

              {/* Feature Tags - Optimized spacing */}
              <div className="flex justify-center lg:justify-start gap-2 lg:gap-3">
                <span className="px-2 md:px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs lg:text-sm font-medium">
                  🤖 AI Insights
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
                  <Link to="/auth?redirect=%2Fdashboard">
                    <Sparkles className="h-4 lg:h-5 w-4 lg:w-5 mr-2" />
                    START YOUR JOURNEY
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Side - Phone Animation - Laptop optimized */}
            <div className="relative flex justify-center order-2">
              {/* Phone Mockup - Better laptop proportions */}
              <div className="relative transform hover:scale-105 transition-transform duration-500">
                {/* Phone Frame - Smaller for laptop */}
                <div className="relative w-64 md:w-72 lg:w-80 h-[480px] md:h-[540px] lg:h-[600px] bg-black rounded-[2rem] md:rounded-[2.5rem] lg:rounded-[3rem] p-1.5 md:p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden relative">
                    {/* Phone Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 md:p-4 lg:p-5 text-white">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 md:w-9 lg:w-10 h-8 md:h-9 lg:h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm md:text-base lg:text-lg font-bold">✦</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm md:text-base">Bible Aura AI</h3>
                          <p className="text-xs opacity-80">AI Biblical Assistant</p>
                        </div>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="p-3 md:p-4 lg:p-5 space-y-3 md:space-y-4 h-[350px] md:h-[400px] lg:h-[450px] overflow-hidden">
                      {/* User Message */}
                      <div className="flex justify-end animate-slideInRight">
                        <div className="bg-orange-500 text-white p-2.5 md:p-3 rounded-2xl rounded-br-md max-w-xs">
                          <p className="text-xs md:text-sm">What does Romans 8:28 mean?</p>
                        </div>
                      </div>

                      {/* AI Response */}
                      <div className="flex justify-start animate-slideInLeft animation-delay-1000">
                        <div className="bg-gray-100 text-gray-800 p-2.5 md:p-3 rounded-2xl rounded-bl-md max-w-xs">
                          <p className="text-xs md:text-sm">Romans 8:28 teaches us that God works all things together for good for those who love Him. This doesn't mean everything is good, but that God can use even difficult circumstances for our ultimate benefit and His glory.</p>
                        </div>
                      </div>

                      {/* Typing Indicator - Subtle animation */}
                      <div className="flex justify-start animate-pulse animation-delay-2000">
                        <div className="bg-gray-100 p-2.5 md:p-3 rounded-2xl rounded-bl-md">
                          <div className="flex space-x-1">
                            <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-gray-400 rounded-full animate-pulse"></div>
                            <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-gray-400 rounded-full animate-pulse animation-delay-200"></div>
                            <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-gray-400 rounded-full animate-pulse animation-delay-400"></div>
                          </div>
                        </div>
                      </div>

                      {/* Follow-up Question */}
                      <div className="flex justify-end animate-slideInRight animation-delay-3000">
                        <div className="bg-orange-500 text-white p-2.5 md:p-3 rounded-2xl rounded-br-md max-w-xs">
                          <p className="text-xs md:text-sm">Can you give me related verses?</p>
                        </div>
                      </div>

                      {/* AI Related Verses */}
                      <div className="flex justify-start animate-slideInLeft animation-delay-4000">
                        <div className="bg-gray-100 text-gray-800 p-2.5 md:p-3 rounded-2xl rounded-bl-md max-w-xs">
                          <p className="text-xs md:text-sm">Here are related verses:</p>
                          <p className="text-xs mt-1.5 text-blue-600">• Jeremiah 29:11</p>
                          <p className="text-xs text-blue-600">• Philippians 1:6</p>
                          <p className="text-xs text-blue-600">• 1 Corinthians 10:13</p>
                        </div>
                      </div>
                    </div>

                    {/* Input Area */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 lg:p-5 bg-white border-t">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex-1 bg-gray-100 rounded-full px-3 md:px-4 py-2 md:py-2.5">
                          <p className="text-xs md:text-sm text-gray-500">Ask about any Bible verse...</p>
                        </div>
                        <div className="w-8 md:w-9 lg:w-10 h-8 md:h-9 lg:h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                          <Send className="h-3.5 md:h-4 lg:h-5 w-3.5 md:w-4 lg:w-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements Around Phone - Subtle, no bouncing */}
                <div className="hidden lg:block absolute -top-4 -right-4 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center animate-pulse animation-delay-500 shadow-lg">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <div className="hidden lg:block absolute -bottom-4 -left-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center animate-pulse animation-delay-1000 shadow-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="hidden xl:block absolute top-1/2 -left-8 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sermon Writing Feature Showcase */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Mic className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Professional Sermon Writer
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create compelling sermons with our advanced writing tools, Bible integration, and AI assistance
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Integrated Bible Access
                  </h3>
                  <p className="text-gray-600">
                    Access multiple Bible translations instantly. Click any verse to add it directly to your sermon with proper formatting.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Bot className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    AI Writing Assistant
                  </h3>
                  <p className="text-gray-600">
                    Get inspiration, theological insights, and writing suggestions from our biblical AI assistant trained on sound doctrine.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Professional Templates
                  </h3>
                  <p className="text-gray-600">
                    Start with proven sermon structures including three-point sermons, expository preaching, and topical studies.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Smart Analytics
                  </h3>
                  <p className="text-gray-600">
                    Track word count, estimated speaking time, and reading level to perfect your sermon delivery.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                >
                  <Link to="/sermon-writer">
                    <Mic className="h-5 w-5 mr-2" />
                    Start Writing Sermons
                  </Link>
                </Button>
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="bg-white rounded-xl shadow-2xl p-6 border">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Mic className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold text-gray-900">Sermon Writer</span>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="border-b border-gray-200 mb-4">
                    <div className="flex space-x-1 -mb-px">
                      <div className="bg-purple-50 text-purple-600 px-3 py-2 text-sm font-medium border-b-2 border-purple-600">
                        Editor
                      </div>
                      <div className="text-gray-500 px-3 py-2 text-sm">
                        Bible
                      </div>
                      <div className="text-gray-500 px-3 py-2 text-sm">
                        AI Chat
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="font-medium">Title:</span>
                    <span className="bg-gray-50 px-2 py-1 rounded">The Good Shepherd</span>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg text-sm leading-relaxed">
                    <div className="font-semibold text-gray-900 mb-2"># Introduction</div>
                    <div className="text-gray-700 mb-3">
                      Jesus said, "I am the good shepherd. The good shepherd lays down his life for the sheep." - John 10:11
                    </div>
                    <div className="font-semibold text-gray-900 mb-1">## Main Point 1: The Shepherd's Love</div>
                    <div className="text-gray-600 text-xs">The depth of Christ's sacrificial love...</div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                    <span>1,247 words • 8 min read</span>
                    <span className="text-green-600">✓ Live saved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Analysis Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center justify-center w-14 md:w-16 h-14 md:h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-6 md:mb-8">
              <span className="text-xl md:text-2xl font-bold">✦</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 px-4">
              Transform Your
            </h2>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 px-4">
              <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">
                Bible Study Experience
              </span>
            </h3>
            <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto px-4">
              Grow deeper in your faith with Bible Aura's AI-powered spiritual tools and biblical insights.
            </p>
          </div>

          {/* Three Column Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:scale-105 text-center p-6 md:p-8">
              <div className="w-14 md:w-16 h-14 md:h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 md:h-8 w-6 md:w-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Smart Analysis</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                Get instant insights and context for any Bible verse
              </p>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:scale-105 text-center p-6 md:p-8">
              <div className="w-14 md:w-16 h-14 md:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto group-hover:scale-110 transition-transform">
                <MessageCircle className="h-6 md:h-8 w-6 md:w-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">AI Companion</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                Chat with our AI for spiritual guidance and questions
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
                            <span className="text-orange-500 mr-2">✦</span>
            START YOUR JOURNEY
          </Button>
        </div>
      </section>



      {/* Quick Action Links for SEO */}
      <section className="py-12 md:py-16 bg-white">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
          <div className="text-center mb-8">
          </div>
          {/* <QuickActionSEOLinks /> */}
        </div>
      </section>




      {/* FAQ Section */}
      {/* <FAQ /> */}



      {/* SEO Backlinks */}
      {/* <SEOBacklinks currentPage="/" category="general" /> */}

      {/* Enhanced Privacy & Legal Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-blue-50 border-t">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🔒</span>
              </div>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Your Privacy & Security Matter
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
                <h4 className="font-semibold text-gray-900 mb-3">🛡️ Data Protection</h4>
                <p className="text-gray-600 text-sm md:text-base">
                  We only ask for your Google email for account verification and security. Your personal content is encrypted and never shared.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
                <h4 className="font-semibold text-gray-900 mb-3">🔒 Complete Privacy</h4>
                <p className="text-gray-600 text-sm md:text-base">
                  Your journals, sermons, chat conversations, and spiritual journey remain completely private and secure.
                </p>
              </div>
            </div>

            {/* Prominent Legal Links */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-orange-200 max-w-2xl mx-auto">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Legal Information</h4>
              <p className="text-gray-600 mb-6 text-sm md:text-base">
                Learn more about how we protect your data and the terms governing your use of Bible Aura
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  <a href="/privacy-policy.html">
                    🛡️ Privacy Policy
                  </a>
                </Button>
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white px-6 py-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  <a href="/terms-of-service.html">
                    📋 Terms of Service
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home; 