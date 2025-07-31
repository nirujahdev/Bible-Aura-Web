import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { 
  BookOpen, Bot, Wrench, Library, BookOpenCheck, PenTool,
  MessageCircle, Star, ArrowRight, Sparkles, ChevronDown, ChevronUp,
  Send, User, Zap, LogIn, Search, FileText, MessageSquare, Edit,
  Shield, Eye, Users
} from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const featureCategories = [
    {
      number: "01",
      title: "Bible Study",
      description: "Comprehensive biblical study tools",
      features: [
        "Bible Reading",
        "Verse Search", 
        "Cross References",
        "Multiple Translations",
        "Verse Analysis",
        "Topical Study"
      ],
      gradient: "from-blue-500 to-blue-600"
    },
    {
      number: "02",
      title: "AI Features", 
      description: "AI-powered spiritual insights",
      features: [
        "AI Chat Oracle",
        "Biblical Q&A",
        "AI Analysis", 
        "Scripture Insights",
        "Contextual Explanations",
        "Smart Recommendations"
      ],
      gradient: "from-purple-500 to-purple-600"
    },
    {
      number: "03",
      title: "Personal Tools",
      description: "Personalized spiritual journey", 
      features: [
        "Journal",
        "Favorites",
        "Bookmarks",
        "Notes",
        "Reading Progress", 
        "Profile"
      ],
      gradient: "from-green-500 to-green-600"
    },
    {
      number: "04", 
      title: "Learning Resources",
      description: "Rich spiritual content library",
      features: [
        "Sermon Library",
        "Sermons",
        "Songs", 
        "Study Plans",
        "Daily Verses",
        "Bible Characters"
      ],
      gradient: "from-orange-500 to-orange-600"
    },
    {
      number: "05",
      title: "Advanced Study",
      description: "Deep theological exploration",
      features: [
        "Hebrew/Greek Words",
        "Historical Context",
        "Theological Topics",
        "Commentary Access",
        "Parable Studies",
        "Cross References"
      ],
      gradient: "from-indigo-500 to-indigo-600"
    },
    {
      number: "06",
      title: "Content Creation", 
      description: "Create and share spiritual content",
      features: [
        "Sermon Preparation",
        "Study Notes",
        "Personal Reflections",
        "Prayer Writing",
        "Teaching Materials", 
        "Ministry Resources"
      ],
      gradient: "from-pink-500 to-pink-600"
    }
  ];

  const faqItems = [
    {
      question: "Is Bible Aura completely free to use?",
      answer: "Yes! Bible Aura offers a comprehensive free tier with access to core features including Bible reading, basic AI insights, and study tools. Premium features are available for enhanced functionality."
    },
    {
      question: "How accurate are the AI-generated insights?",
      answer: "Our AI is trained on sound theological resources and biblical scholarship. All insights are generated to align with orthodox Christian doctrine, though we always recommend comparing with trusted commentaries and pastoral guidance."
    },
    {
      question: "Can I use Bible Aura offline?",
      answer: "Yes! Bible Aura includes offline capabilities for core features like Bible reading and personal notes. Some AI features require an internet connection for the most up-to-date insights."
    },
    {
      question: "What Bible translations are available?",
      answer: "Bible Aura supports multiple popular translations including KJV, NIV, ESV, NASB, and many others. You can easily switch between translations for comparison and deeper study."
    },
    {
      question: "How does the AI Chat feature work?",
      answer: "Our AI Chat Oracle is trained on biblical knowledge and can answer questions about Scripture, provide spiritual guidance, and help with Bible study. It's like having a knowledgeable biblical scholar available 24/7."
    }
  ];

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
            <span className="text-orange-600 mr-2">✦</span>
            START YOUR JOURNEY
          </Button>
        </div>
      </section>

      {/* How Bible Aura Works Section - Enhanced Design */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center justify-center w-14 md:w-16 h-14 md:h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-6 md:mb-8 animate-pulse">
              <span className="text-xl md:text-2xl font-bold">✦</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 px-4">
              How Bible Aura Works
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Your spiritual journey made simple through our powerful platform
            </p>
          </div>

          {/* Process Steps - Enhanced Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
            {[
              { 
                num: "1", 
                title: "Login & Sign In", 
                desc: "Create your free account or sign in to access your personalized Bible study experience and sync your progress across devices.", 
                color: "blue",
                icon: LogIn 
              },
              { 
                num: "2", 
                title: "Full Bible Access", 
                desc: "Access multiple Bible translations, search verses, explore cross-references, and dive deep into Scripture with our comprehensive biblical database.", 
                color: "green",
                icon: BookOpen 
              },
              { 
                num: "3", 
                title: "Study Resources", 
                desc: "Utilize extensive study materials, commentaries, theological resources, and reading plans to deepen your biblical understanding.", 
                color: "orange",
                icon: Search 
              },
              { 
                num: "4", 
                title: "Ask AI & Analysis", 
                desc: "Get instant biblical insights, contextual explanations, and spiritual guidance through our advanced AI-powered analysis tools.", 
                color: "purple",
                icon: MessageSquare 
              },
              { 
                num: "5", 
                title: "Write Journals & Sermons", 
                desc: "Document your spiritual journey, create personal reflections, prepare sermons, and organize your thoughts with powerful writing tools.", 
                color: "pink",
                icon: Edit 
              }
            ].map((step, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white hover:scale-105 p-6 md:p-8 relative overflow-hidden">
                {/* Background Pattern */}
                <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${
                  step.color === 'blue' ? 'from-blue-500 to-blue-600' :
                  step.color === 'green' ? 'from-green-500 to-green-600' :
                  step.color === 'orange' ? 'from-orange-500 to-orange-600' :
                  step.color === 'purple' ? 'from-purple-500 to-purple-600' :
                  'from-pink-500 to-pink-600'
                }`}></div>

                <div className="relative">
                  {/* Step Number and Icon */}
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className={`w-12 md:w-14 h-12 md:h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg group-hover:scale-110 transition-transform bg-gradient-to-r ${
                      step.color === 'blue' ? 'from-blue-500 to-blue-600' :
                      step.color === 'green' ? 'from-green-500 to-green-600' :
                      step.color === 'orange' ? 'from-orange-500 to-orange-600' :
                      step.color === 'purple' ? 'from-purple-500 to-purple-600' :
                      'from-pink-500 to-pink-600'
                    }`}>
                      {step.num}
                    </div>
                    <div className={`w-10 md:w-12 h-10 md:h-12 rounded-xl flex items-center justify-center ${
                      step.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      step.color === 'green' ? 'bg-green-100 text-green-600' :
                      step.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                      step.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                      'bg-pink-100 text-pink-600'
                    } group-hover:scale-110 transition-transform`}>
                      <step.icon className="h-5 md:h-6 w-5 md:w-6" />
                    </div>
                  </div>
                  
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">{step.desc}</p>

                  {/* Progress Indicator */}
                  <div className="mt-4 md:mt-6 flex items-center gap-1 md:gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`h-1.5 md:h-2 rounded-full ${
                        i < parseInt(step.num) ? 
                        `bg-gradient-to-r ${
                          step.color === 'blue' ? 'from-blue-500 to-blue-600' :
                          step.color === 'green' ? 'from-green-500 to-green-600' :
                          step.color === 'orange' ? 'from-orange-500 to-orange-600' :
                          step.color === 'purple' ? 'from-purple-500 to-purple-600' :
                          'from-pink-500 to-pink-600'
                        }` : 'bg-gray-200'
                      } ${i === 0 ? 'w-6 md:w-8' : 'w-3 md:w-4'}`}></div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Call to Action in This Section */}
          <div className="text-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-xl shadow-lg w-full sm:w-auto">
              <Link to="/auth">
                <span className="mr-2">✦</span>
                Get Started Now
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Bible Aura Features Section - Clean Numbered Design */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center justify-center w-14 md:w-16 h-14 md:h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-6 md:mb-8">
              <span className="text-xl md:text-2xl font-bold">✦</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 px-4">
              <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">
                Bible Aura Features
              </span>
            </h2>
            <div className="w-20 md:w-24 h-1 bg-gradient-to-r from-orange-500 to-purple-500 mx-auto mb-4 md:mb-6"></div>
            <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto px-4">
              Discover all the powerful tools and features designed to enhance your spiritual journey with cutting-edge AI technology
            </p>
          </div>

          {/* Features Grid - Clean Numbered Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featureCategories.map((category, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white hover:scale-105 overflow-hidden">
                <CardHeader className="pb-4 md:pb-6 relative">
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                  
                  {/* Number and Title */}
                  <div className="relative flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className={`w-10 md:w-12 h-10 md:h-12 bg-gradient-to-r ${category.gradient} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                      <span className="text-white text-base md:text-lg font-bold">{category.number}</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2">
                        {category.title}
                      </CardTitle>
                      <p className="text-gray-600 text-xs md:text-sm">{category.description}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative pt-0 px-4 md:px-6 pb-4 md:pb-6">
                  <div className="space-y-2 md:space-y-3">
                    {category.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-gray-700 group-hover:text-gray-900 transition-colors">
                        <div className={`w-1.5 md:w-2 h-1.5 md:h-2 bg-gradient-to-r ${category.gradient} rounded-full mr-3 md:mr-4 flex-shrink-0`}></div>
                        <span className="font-medium text-xs md:text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - Expandable */}
      <section className="py-12 md:py-20 bg-white">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-4xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center justify-center w-14 md:w-16 h-14 md:h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-6 md:mb-8">
              <MessageCircle className="h-6 md:h-8 w-6 md:w-8" />
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 px-4">
              Frequently Asked Questions
            </h2>
            <div className="w-20 md:w-24 h-1 bg-gradient-to-r from-orange-500 to-purple-500 mx-auto mb-4 md:mb-6"></div>
            <p className="text-lg md:text-xl text-gray-600 px-4">
              Get answers to common questions about Bible Aura
            </p>
          </div>

          {/* FAQ Items - Expandable */}
          <div className="space-y-3 md:space-y-4">
            {faqItems.map((faq, index) => (
              <Card key={index} className="border border-orange-100 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-4 md:p-6 text-left hover:bg-orange-50 transition-colors duration-200 flex justify-between items-center"
                  >
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                    <div className="text-orange-500 flex-shrink-0">
                      {expandedFaq === index ? (
                        <ChevronUp className="h-4 md:h-5 w-4 md:w-5" />
                      ) : (
                        <ChevronDown className="h-4 md:h-5 w-4 md:w-5" />
                      )}
                    </div>
                  </button>
                  
                  {/* Expandable Content */}
                  <div className={`transition-all duration-300 overflow-hidden ${
                    expandedFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-4 md:px-6 pb-4 md:pb-6 border-t border-orange-100">
                      <p className="text-gray-600 leading-relaxed pt-4 text-sm md:text-base">{faq.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Usage Transparency Section - Google OAuth Requirement */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 md:w-16 h-14 md:h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white mb-6">
              <Shield className="h-6 md:h-8 w-6 md:w-8" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Your Data & <span className="text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text">Privacy</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              We are committed to protecting your privacy and being transparent about how we use your data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* What We Collect */}
            <Card className="hover:shadow-lg transition-shadow bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <Eye className="h-5 w-5 mr-3 text-blue-600" />
                  What We Collect
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                    <p className="text-sm"><strong>Basic Account Info:</strong> Email address and name for account creation</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                    <p className="text-sm"><strong>Usage Data:</strong> Bible study preferences and reading progress</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                    <p className="text-sm"><strong>Content:</strong> Your journal entries, notes, and bookmarks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How We Use It */}
            <Card className="hover:shadow-lg transition-shadow bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-3 text-indigo-600" />
                  How We Use Your Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                    <p className="text-sm"><strong>Personalization:</strong> Provide tailored Bible study recommendations</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                    <p className="text-sm"><strong>AI Insights:</strong> Generate contextual biblical analysis and answers</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                    <p className="text-sm"><strong>Service Improvement:</strong> Enhance our AI and user experience</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              We never sell your personal data. Read our complete privacy policy for detailed information.
            </p>
            <Button asChild variant="outline" className="border-blue-200 hover:bg-blue-50">
              <Link to="/privacy">
                <Shield className="mr-2 h-4 w-4" />
                View Privacy Policy
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - Exact Match with Contact Page */}
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
              <h4 className="text-xl font-semibold text-white mb-6">Menu</h4>
              <nav className="space-y-3">
                <Link to="/about" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  About
                </Link>
                <Link to="/careers" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Careers
                </Link>
                <Link to="/bible-ai" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Bible AI
                </Link>
                <Link to="/auth" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Sign In
                </Link>
              </nav>
            </div>
            
            {/* Blog Section */}
            <div className="text-center md:text-left">
              <h4 className="text-xl font-semibold text-white mb-6">Bible AI Blog</h4>
              <nav className="space-y-3">
                <Link to="/blog" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  All Articles
                </Link>
                <Link to="/blog/how-ai-transforms-bible-study" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  AI Bible Study Guide
                </Link>
                <Link to="/blog/bible-ai-vs-traditional-study" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  AI vs Traditional Study
                </Link>
                <Link to="/blog/ai-bible-insights-accuracy" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  AI Insights Accuracy
                </Link>
              </nav>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left text-gray-400">
              <div>
                <Link to="/terms" className="hover:text-orange-400 transition-colors duration-300 text-sm">
                  Terms of Use
                </Link>
                <span className="mx-2">|</span>
                <Link to="/privacy" className="hover:text-orange-400 transition-colors duration-300 text-sm">
                  Privacy Policy
                </Link>
              </div>
              
              <div className="text-sm">
                {/* Mobile/Tablet: Two lines */}
                <div className="lg:hidden">
                  <div className="mb-2">
                    <span>&copy; 2024 ✦Bible Aura. All rights reserved.</span>
                  </div>
                  <div>
                    <span>Developed by </span>
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
                
                {/* Desktop/Laptop: One line */}
                <div className="hidden lg:block">
                  <span>&copy; 2024 ✦Bible Aura. All rights reserved. Developed by </span>
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
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 