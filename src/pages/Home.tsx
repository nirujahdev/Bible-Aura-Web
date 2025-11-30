import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { cn } from "@/lib/utils";
import { 
  BookOpen, MessageCircle, Star, Sparkles, Send, User, Zap, Mic, Bot, FileText, BarChart3, Calendar, Languages, ArrowRight, Smartphone, Share2, Plus, Home as HomeIcon, HelpCircle, ChevronDown, ChevronUp, Search, Mail
} from "lucide-react";
import { Link } from "react-router-dom";
// import { SEOBacklinks, QuickActionSEOLinks } from "@/components/SEOBacklinks"; // COMMENTED OUT TO FIX ERRORS
// import { ManualContextualLinks } from "@/components/ContextualLinks"; // COMMENTED OUT TO FIX ERRORS
import Footer from "@/components/Footer";
// import FAQ from "@/components/FAQ"; // COMMENTED OUT TO FIX ERRORS
import { useSEO, SEO_CONFIG } from "@/hooks/useSEO";
import { usePWA } from "@/hooks/usePWA";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { IOSInstallModal } from "@/components/IOSInstallModal";

const faqs = [
  {
    id: 1,
    question: "What is Bible Aura?",
    answer: "Bible Aura is an AI-powered Bible study platform that provides verse explanations, topical studies, character insights, and Tamil/English Bible support for deeper spiritual understanding."
  },
  {
    id: 2,
    question: "How does Bible Aura's AI Bible assistant work?",
    answer: "Our AI uses advanced retrieval-based reasoning and Bible-specific datasets to give accurate, scripture-focused answers in both Tamil and English."
  },
  {
    id: 3,
    question: "Is Bible Aura biblically accurate?",
    answer: "Bible Aura retrieves Bible passages from verified sources and follows orthodox Christian interpretation. AI responses may vary, but we focus on accuracy and scriptural alignment."
  },
  {
    id: 4,
    question: "Can Bible Aura explain Bible verses?",
    answer: "Yes. You can ask any verse (e.g., \"Romans 8:28 meaning\") and the AI will give a structured verse analysis with context, doctrine, and cross-references."
  },
  {
    id: 5,
    question: "Does Bible Aura support Tamil Bible questions?",
    answer: "Yes. Bible Aura fully supports Tamil Bible explanations, verse meaning, and devotional insights in Tamil."
  },
  {
    id: 6,
    question: "Is Bible Aura free to use?",
    answer: "Yes, Bible Aura is completely free. No subscription fees or hidden payments."
  },
  {
    id: 8,
    question: "Does Bible Aura store my chat history?",
    answer: "Yes, but users can delete their history anytime. We respect your privacy and store only what's needed for your account."
  },
  {
    id: 9,
    question: "Can Bible Aura help with daily Bible reading?",
    answer: "Yes. You can generate custom Bible reading plans, track progress, and get AI-guided daily insights."
  },
  {
    id: 10,
    question: "Does Bible Aura provide topical Bible studies?",
    answer: "Yes. You can explore topics like faith, hope, forgiveness, salvation, love, and more — with scriptures and commentary."
  },
  {
    id: 11,
    question: "Does Bible Aura offer Bible character studies?",
    answer: "Yes. Bible Aura provides structured profiles of characters like David, Paul, Ruth, Esther, Moses, etc."
  },
  {
    id: 12,
    question: "Can I ask Bible Aura personal spiritual questions?",
    answer: "Yes, you can ask about prayer, anxiety, purpose, relationships, and more. AI provides scriptural encouragement."
  },
  {
    id: 13,
    question: "Which Bible translations does Bible Aura use?",
    answer: "Bible Aura uses public domain and licensed Bible translations for English and Tamil support depending on availability."
  },
  {
    id: 14,
    question: "Does Bible Aura work on mobile?",
    answer: "Yes. Bible Aura works on all mobile browsers and is optimized for smartphones."
  },
  {
    id: 15,
    question: "Is Bible Aura safe for children and teens?",
    answer: "Yes. It's designed for clean, biblical use, recommended for users aged 13+."
  },
  {
    id: 16,
    question: "Does Bible Aura need my personal information?",
    answer: "We only require basic details like email for login. No unnecessary data is collected."
  },
  {
    id: 17,
    question: "Is my data secure with Bible Aura?",
    answer: "Yes. We use industry-standard security measures and do not sell your personal information."
  },
  {
    id: 18,
    question: "Can pastors and Bible teachers use Bible Aura?",
    answer: "Absolutely. Many church leaders use our verse tools and contextual analysis features."
  },
  {
    id: 19,
    question: "Does Bible Aura support Bible study groups?",
    answer: "Yes. Bible Aura can be used to prepare group lessons, devotionals, and discussion guides."
  },
  {
    id: 20,
    question: "What languages does Bible Aura support?",
    answer: "Currently English and Tamil, with more languages planned in future."
  },
  {
    id: 21,
    question: "Can Bible Aura compare Bible verses?",
    answer: "Yes. You can ask for related verses, cross-references, and thematic connections."
  },
  {
    id: 22,
    question: "Can the AI give wrong answers?",
    answer: "Yes, AI may sometimes make mistakes. Always verify responses with Scripture."
  },
  {
    id: 23,
    question: "Does Bible Aura interpret dreams or prophecy?",
    answer: "No. Bible Aura focuses strictly on Bible teaching, not supernatural interpretations."
  },
  {
    id: 24,
    question: "Can I share Bible Aura insights with others?",
    answer: "Yes. You can copy and share AI-generated insights freely for ministry or personal use."
  },
  {
    id: 25,
    question: "Does Bible Aura offer devotionals?",
    answer: "Yes. You can request daily devotionals, Bible reflections, and short encouragements."
  },
  {
    id: 26,
    question: "Can I use Bible Aura without creating an account?",
    answer: "Some features may require a login (like reading plans), but basic AI chat is accessible."
  },
  {
    id: 27,
    question: "How is Bible Aura different from other Bible apps?",
    answer: "Bible Aura combines AI reasoning, real-time Bible retrieval, Tamil support, and structured study formats in one clean interface."
  },
  {
    id: 28,
    question: "Does Bible Aura help new Christians?",
    answer: "Yes. The AI simplifies complex verses, provides beginner-friendly explanations, and guides users through foundational topics."
  },
  {
    id: 29,
    question: "Can I request custom Bible reading plans?",
    answer: "Yes. Bible Aura can generate personalized plans based on your goals, schedule, and reading speed."
  },
  {
    id: 30,
    question: "How do I contact Bible Aura for support?",
    answer: "You can email us anytime at contact@bibleaura.xyz for help or suggestions."
  }
];

const Home = () => {
  // SEO optimization
  useSEO(SEO_CONFIG.HOME);
  const { isStandalone } = usePWA();
  const navigate = useNavigate();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [openFaqItems, setOpenFaqItems] = useState<Set<number>>(new Set());

  // Redirect to PWA loader if running in PWA mode
  useEffect(() => {
    if (isStandalone) {
      navigate('/pwa-loader', { replace: true });
    }
  }, [isStandalone, navigate]);



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
                  Answer Bible-related questions, search Scripture, and conduct biblical research with AI-powered tools and insights.
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
                          <h3 className="font-semibold text-sm md:text-base">Bible Aura</h3>
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
              Answer Bible-related questions, search Scripture, and conduct biblical research with AI-powered tools and insights.
            </p>
          </div>

          {/* Three Column Features with Animations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:scale-105 text-center p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: '0s', animationFillMode: 'both' }}>
              <div className="w-14 md:w-16 h-14 md:h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                <Sparkles className="h-6 md:h-8 w-6 md:w-8 text-white group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 group-hover:text-orange-600 transition-colors duration-300">Smart Analysis</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base group-hover:text-gray-700 transition-colors duration-300">
                Get instant insights and context for any Bible verse
              </p>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="flex justify-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:scale-105 text-center p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              <div className="w-14 md:w-16 h-14 md:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                <MessageCircle className="h-6 md:h-8 w-6 md:w-8 text-white group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 group-hover:text-blue-600 transition-colors duration-300">AI Assistant</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base group-hover:text-gray-700 transition-colors duration-300">
                Chat with our AI to answer Bible-related questions and search Scripture
              </p>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="flex justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:scale-105 text-center p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
              <div className="w-14 md:w-16 h-14 md:h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                <BookOpen className="h-6 md:h-8 w-6 md:w-8 text-white group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 group-hover:text-purple-600 transition-colors duration-300">Study Tools</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base group-hover:text-gray-700 transition-colors duration-300">
                Access comprehensive Bible study resources
              </p>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="flex justify-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
            Enhance Your Bible Study with AI-Powered Insights
          </h2>
          <p className="text-base md:text-lg lg:text-xl mb-6 md:mb-8 opacity-90 max-w-3xl mx-auto">
            Start studying the Bible today with AI-powered tools that help you answer questions, search Scripture, and conduct biblical research.
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
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-orange-50">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-6 shadow-lg">
              <HelpCircle className="h-8 w-8" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">
                Frequently Asked Questions
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Find answers to common questions about Bible Aura's features, AI capabilities, and how to get the most out of your Bible study.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search questions..."
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-12 rounded-full border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {faqs
              .filter(faq =>
                faq.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(faqSearchQuery.toLowerCase())
              )
              .map((faq) => {
                const isOpen = openFaqItems.has(faq.id);
                return (
                  <div
                    key={faq.id}
                    className={cn(
                      "bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-200",
                      isOpen && "shadow-md border-orange-200"
                    )}
                  >
                    <button
                      onClick={() => {
                        const newOpenItems = new Set(openFaqItems);
                        if (newOpenItems.has(faq.id)) {
                          newOpenItems.delete(faq.id);
                        } else {
                          newOpenItems.add(faq.id);
                        }
                        setOpenFaqItems(newOpenItems);
                      }}
                      className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <span className="text-lg font-semibold text-gray-900 pr-4">
                        {faq.question}
                      </span>
                      <div className={cn(
                        "flex-shrink-0 transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-orange-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </button>
                    
                    {isOpen && (
                      <div className="px-6 pb-5 pt-0">
                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-gray-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {faqs.filter(faq =>
            faq.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(faqSearchQuery.toLowerCase())
          ).length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No questions found matching your search.</p>
            </div>
          )}

          {/* Contact Section */}
          <div className="mt-16 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 md:p-12 border border-orange-100 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 text-white mb-4">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Can't find the answer you're looking for? We're here to help!
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <a href="mailto:contact@bibleaura.xyz">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </a>
            </Button>
          </div>
        </div>
      </section>



      {/* SEO Backlinks */}
      {/* <SEOBacklinks currentPage="/" category="general" /> */}

      {/* Interactive Features Showcase */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-orange-50 overflow-hidden">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-6 shadow-xl">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features at Your Fingertips
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of Bible study with AI-powered tools designed to deepen your understanding
            </p>
          </div>

          {/* Feature Cards with Animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1: AI Bible Chat */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                  AI Bible Chat
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Ask questions about Scripture and get instant, accurate biblical insights powered by advanced AI.
                </p>
                <div className="flex items-center gap-2 text-orange-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span>Try it now</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Feature 2: Bible Reading */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  Bible Reading
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Read KJV and Tamil Bible translations with verse highlighting, bookmarks, and search functionality.
                </p>
                <div className="flex items-center gap-2 text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span>Explore Bible</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Feature 3: Reading Planner */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                  Reading Planner
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Create personalized Bible reading plans and track your progress with daily, weekly, and calendar views.
                </p>
                <div className="flex items-center gap-2 text-green-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span>Create Plan</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Feature 4: Favorites */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">
                  Favorites
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Save and organize your favorite Bible verses for quick access and personal study.
                </p>
                <div className="flex items-center gap-2 text-pink-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span>View Favorites</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Feature 6: Tamil & English Support */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <Languages className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  Bilingual Support
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Full support for both Tamil and English Bible study with AI responses in both languages.
                </p>
                <div className="flex items-center gap-2 text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span>Learn More</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text mb-2 group-hover:scale-110 transition-transform duration-300">
                24/7
              </div>
              <p className="text-gray-600 font-medium">AI Available</p>
            </div>
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text mb-2 group-hover:scale-110 transition-transform duration-300">
                2+
              </div>
              <p className="text-gray-600 font-medium">Languages</p>
            </div>
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text mb-2 group-hover:scale-110 transition-transform duration-300">
                100%
              </div>
              <p className="text-gray-600 font-medium">Free to Use</p>
            </div>
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-green-500 to-green-600 bg-clip-text mb-2 group-hover:scale-110 transition-transform duration-300">
                ∞
              </div>
              <p className="text-gray-600 font-medium">Bible Verses</p>
            </div>
          </div>
        </div>
      </section>

      {/* PWA Install Section - Android & iOS */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-blue-600 text-white mb-6 shadow-xl">
              <Smartphone className="h-8 w-8" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Install Bible Aura as an App
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Get the full app experience on your phone. Access saved content offline and enjoy a native app feel!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Android Section */}
            <Card className="p-6 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-green-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Android</h3>
                  <p className="text-gray-600 text-sm">Chrome, Samsung Internet</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">
                Tap the install button below, then confirm in the popup. The app will be added to your home screen.
              </p>

              <div className="pt-4">
                <PWAInstallButton />
              </div>
            </Card>

            {/* iOS Section */}
            <Card className="p-6 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-blue-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">iOS</h3>
                  <p className="text-gray-600 text-sm">iPhone & iPad (Safari)</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">
                Tap Share <Share2 className="inline h-4 w-4 text-blue-600 mx-1" /> → "Add to Home Screen" → "Add"
              </p>

              <div className="pt-4">
                <Button
                  onClick={() => setShowIOSModal(true)}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  <HomeIcon className="h-5 w-5 mr-2" />
                  View Instructions
                </Button>
              </div>
            </Card>
          </div>

          {/* Benefits Section */}
          <div className="mt-12 p-6 bg-gradient-to-r from-orange-500 to-blue-600 rounded-2xl text-white">
            <h3 className="text-xl font-bold mb-4 text-center">Why Install as an App?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Zap className="h-6 w-6 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Faster Access</h4>
                <p className="text-sm opacity-90">Open instantly from home screen</p>
              </div>
              <div className="text-center">
                <Sparkles className="h-6 w-6 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Offline Access</h4>
                <p className="text-sm opacity-90">View saved verses and favorites offline</p>
              </div>
              <div className="text-center">
                <Star className="h-6 w-6 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">App Experience</h4>
                <p className="text-sm opacity-90">Feels like a native mobile app</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* iOS Install Modal */}
      <IOSInstallModal open={showIOSModal} onClose={() => setShowIOSModal(false)} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home; 