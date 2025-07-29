import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BookOpen, MessageCircle, Zap, Heart, ChevronDown, ChevronUp, Bot, Library, Users, Database } from "lucide-react";
import { Link } from "react-router-dom";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import heroSpiritual from "@/assets/hero-spiritual.jpg";
import { useState } from "react";

const Landing = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const howItWorksSteps = [
    {
      step: "1",
      title: "Login & Sign In",
      description: "Create your free account or sign in to access your personalized Bible study experience and sync your progress across devices.",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      step: "2", 
      title: "Full Bible Access",
      description: "Access multiple Bible translations, search verses, explore cross-references, and dive deep into Scripture with our comprehensive biblical database.",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      step: "3",
      title: "Study Resources",
      description: "Utilize extensive study materials, commentaries, theological resources, and reading plans to deepen your biblical understanding.",
      gradient: "from-orange-500 to-amber-600"
    },
    {
      step: "4",
      title: "Ask AI & Analysis",
      description: "Get instant biblical insights, contextual explanations, and spiritual guidance through our advanced AI-powered analysis tools.",
      gradient: "from-purple-500 to-violet-600"
    },
    {
      step: "5",
      title: "Write Journals & Sermons",
      description: "Document your spiritual journey, create personal reflections, prepare sermons, and organize your thoughts with powerful writing tools.",
      gradient: "from-pink-500 to-rose-600"
    }
  ];

  const faqs = [
    {
      question: "Is Bible Aura completely free to use?",
      answer: "Yes! Bible Aura is completely free to use. We believe everyone should have access to powerful Bible study tools regardless of their financial situation. The platform is supported by donations from our community."
    },
    {
      question: "How accurate are the AI-generated insights?",
      answer: "Our AI is trained on theological resources and biblical scholarship to provide accurate, contextual insights. However, we always encourage users to study Scripture prayerfully and consult with spiritual mentors and pastors for important life decisions."
    },
    {
      question: "Can I use Bible Aura offline?",
      answer: "Bible Aura is a web-based platform that requires an internet connection for most features. However, you can download and save your notes, highlights, and favorite verses for offline reference."
    },
    {
      question: "What Bible translations are available?",
      answer: "We offer multiple popular translations including ESV, NIV, NASB, KJV, and many others. You can easily switch between translations while studying to compare different renderings of the text."
    },
    {
      question: "Is my personal information and study data secure?",
      answer: "Absolutely. We take your privacy seriously and use industry-standard encryption to protect your data. Your personal study notes, prayers, and journal entries are private and secure."
    },
    {
      question: "Can I share my study notes with others?",
      answer: "Yes! Bible Aura includes sharing features that allow you to share insights, notes, and favorite verses with friends, family, or your Bible study group while maintaining your privacy settings."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Hero Section with Background Image */}
      <section 
        className="text-white relative overflow-hidden min-h-screen flex items-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url(${heroSpiritual})`
        }}
      >
        {/* Background overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="w-full px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold drop-shadow-md leading-relaxed">
                AI-Powered Biblical Insight
              </h1>
            </div>

            
            <div className="flex flex-row gap-2 sm:gap-4 justify-center mb-8 sm:mb-12 px-4 sm:px-0">
              <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-white/90 font-bold px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg shadow-lg transition-all duration-300 hover:scale-105 flex-1 sm:flex-none">
                <Link to="/auth">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-orange-600" />
                  Get Started
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white bg-white/10 hover:bg-white hover:text-orange-600 font-bold px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 flex-1 sm:flex-none">
                <Link to="/pricing">
                  Support Us
                </Link>
              </Button>
            </div>

            <div className="flex flex-row flex-wrap justify-center gap-3 sm:gap-6 md:gap-8 text-white/95 px-2 sm:px-0">
              <div className="flex items-center justify-center gap-1 sm:gap-2 drop-shadow-md">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400 flex-shrink-0" />
                <span className="font-medium text-xs sm:text-sm md:text-base whitespace-nowrap">AI Insights</span>
              </div>
              <div className="flex items-center justify-center gap-1 sm:gap-2 drop-shadow-md">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400 flex-shrink-0" />
                <span className="font-medium text-xs sm:text-sm md:text-base whitespace-nowrap">All in one Bible</span>
              </div>
              <div className="flex items-center justify-center gap-1 sm:gap-2 drop-shadow-md">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400 flex-shrink-0" />
                <span className="font-medium text-xs sm:text-sm md:text-base whitespace-nowrap">AI Chat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transform Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-50">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-14 md:mb-16">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 sm:w-10 md:w-12 h-px bg-orange-500"></div>
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                  <div className="w-8 sm:w-10 md:w-12 h-px bg-orange-500"></div>
                </div>
              </div>
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
                Transform Your
              </h2>
              <h3 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-orange-500 mb-6 sm:mb-8">
                Bible Study Experience
              </h3>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Grow deeper in your faith with Bible Aura's AI-powered spiritual tools and biblical insights.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-14 md:mb-16">
              {/* Smart Analysis */}
              <Card className="text-center border-0 shadow-lg bg-orange-50 hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                  <div className="mx-auto mb-3 sm:mb-4 p-3 sm:p-4 bg-orange-500 rounded-full w-fit">
                    <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl text-gray-900">Smart Analysis</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <p className="text-sm sm:text-base text-gray-600">
                    Get instant insights and context for any Bible verse
                  </p>
                </CardContent>
              </Card>

              {/* AI Companion */}
              <Card className="text-center border-0 shadow-lg bg-blue-50 hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                  <div className="mx-auto mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-500 rounded-full w-fit">
                    <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl text-gray-900">AI Companion</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <p className="text-sm sm:text-base text-gray-600">
                    Chat with our AI for spiritual guidance and questions
                  </p>
                </CardContent>
              </Card>

              {/* Study Tools */}
              <Card className="text-center border-0 shadow-lg bg-purple-50 hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-4 p-4 bg-purple-500 rounded-full w-fit">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">Study Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Access comprehensive Bible study resources
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CTA Section */}
            <div className="text-center px-2 sm:px-0">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-white">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 leading-tight">
                  Transform Your Spiritual Life with AI-Powered Insights
                </h3>
                <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto opacity-90 leading-relaxed px-2 sm:px-0">
                  Start your spiritual transformation today with AI-powered biblical insights and community support.
                </p>
                <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-white/90 font-bold px-6 sm:px-8 md:px-10 py-4 sm:py-6 text-base sm:text-lg md:text-xl transition-all duration-300 hover:scale-105">
                  <Link to="/auth">
                    <Zap className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-orange-600" />
                    START YOUR JOURNEY
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Bible Aura Works - Vertical Roadmap */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              How Bible Aura Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Your spiritual journey made simple through our powerful platform
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Mobile: Vertical Stack */}
            <div className="lg:hidden space-y-8">
              {howItWorksSteps.map((step, index) => (
                <div key={index} className="relative">
                  <Card className={`p-6 bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl`}>
                    <CardContent className="p-0">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${step.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                          <span className="text-white font-bold text-lg">{step.step}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Connecting line for mobile */}
                  {index < howItWorksSteps.length - 1 && (
                    <div className="flex justify-center py-4">
                      <div className="w-1 h-8 bg-gradient-to-b from-gray-300 to-gray-200 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop: Horizontal Roadmap */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Horizontal Line */}
                <div className="absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-green-500 via-orange-500 via-purple-500 to-pink-500 rounded-full shadow-lg"></div>
                
                <div className="grid grid-cols-5 gap-4">
                  {howItWorksSteps.map((step, index) => (
                    <div key={index} className="relative">
                      {/* Step Number Circle on Line */}
                      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-8 h-8 z-20">
                        <div className={`w-full h-full rounded-full bg-gradient-to-r ${step.gradient} flex items-center justify-center shadow-xl border-4 border-white`}>
                          <span className="text-white font-bold text-sm">{step.step}</span>
                        </div>
                      </div>

                      {/* Step Card */}
                      <div className="pt-24">
                        <Card className={`p-6 bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 rounded-3xl h-full`}>
                          <CardContent className="p-0 text-center">
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${step.gradient} flex items-center justify-center shadow-lg`}>
                              <span className="text-white font-bold text-xl">{step.step}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">
                              {step.title}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {step.description}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Made more visible */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-gradient-to-br from-green-400 to-blue-400 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full animate-bounce delay-500"></div>
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-6">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Bible Aura Features
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-purple-500 mx-auto mb-6 rounded-full"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover all the powerful tools and features designed to enhance your spiritual journey with cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 md:gap-8 px-2 sm:px-0">
            {/* Bible Study */}
            <div className="group h-full">
              <Card className="h-full flex flex-col p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border-2 border-blue-100 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:rotate-1 hover:border-blue-300 group-hover:bg-gradient-to-br group-hover:from-blue-100 group-hover:to-indigo-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-blue-300/20 to-indigo-300/20 rounded-full transform translate-x-12 sm:translate-x-16 -translate-y-12 sm:-translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                <CardHeader className="pb-3 sm:pb-4 relative z-10 flex-shrink-0">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3 group-hover:text-blue-700 transition-colors">
                    <span className="text-2xl sm:text-3xl md:text-4xl">📖</span>
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Bible Study</span>
                  </CardTitle>
                  <p className="text-gray-600 mt-2 text-sm sm:text-base">Comprehensive biblical study tools</p>
                </CardHeader>
                <CardContent className="flex-grow relative z-10">
                  <div className="text-sm text-gray-700 space-y-2 sm:space-y-3">
                    {["Bible Reading", "Verse Search", "Cross References", "Multiple Translations", "Verse Analysis", "Topical Study"].map((feature, index) => (
                      <div key={feature} className={`flex items-center gap-2 sm:gap-3 opacity-100 hover:bg-blue-50 p-1.5 sm:p-2 rounded-lg transition-colors`}>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse flex-shrink-0"></div>
                        <p className="hover:text-blue-600 transition-colors text-xs sm:text-sm">{feature}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Features */}
            <div className="group h-full">
              <Card className="h-full flex flex-col p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border-2 border-purple-100 shadow-xl bg-gradient-to-br from-purple-50 to-pink-100 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:rotate-1 hover:border-purple-300 group-hover:bg-gradient-to-br group-hover:from-purple-100 group-hover:to-pink-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full transform translate-x-12 sm:translate-x-16 -translate-y-12 sm:-translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                <CardHeader className="pb-3 sm:pb-4 relative z-10 flex-shrink-0">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3 group-hover:text-purple-700 transition-colors">
                    <span className="text-2xl sm:text-3xl md:text-4xl">🤖</span>
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI Features</span>
                  </CardTitle>
                  <p className="text-gray-600 mt-2 text-sm sm:text-base">AI-powered spiritual insights</p>
                </CardHeader>
                <CardContent className="flex-grow relative z-10">
                  <div className="text-sm text-gray-700 space-y-2 sm:space-y-3">
                    {["AI Chat Oracle", "Biblical Q&A", "AI Analysis", "Scripture Insights", "Contextual Explanations", "Smart Recommendations"].map((feature, index) => (
                      <div key={feature} className={`flex items-center gap-2 sm:gap-3 opacity-100 hover:bg-purple-50 p-1.5 sm:p-2 rounded-lg transition-colors`}>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse flex-shrink-0"></div>
                        <p className="hover:text-purple-600 transition-colors text-xs sm:text-sm">{feature}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Personal Tools */}
            <div className="group h-full">
              <Card className="h-full flex flex-col p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border-2 border-green-100 shadow-xl bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:rotate-1 hover:border-green-300 group-hover:bg-gradient-to-br group-hover:from-green-100 group-hover:to-emerald-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-green-300/20 to-emerald-300/20 rounded-full transform translate-x-12 sm:translate-x-16 -translate-y-12 sm:-translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                <CardHeader className="pb-3 sm:pb-4 relative z-10 flex-shrink-0">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3 group-hover:text-green-700 transition-colors">
                    <span className="text-2xl sm:text-3xl md:text-4xl">🛠</span>
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Personal Tools</span>
                  </CardTitle>
                  <p className="text-gray-600 mt-2 text-sm sm:text-base">Personalized spiritual journey</p>
                </CardHeader>
                <CardContent className="flex-grow relative z-10">
                  <div className="text-sm text-gray-700 space-y-2 sm:space-y-3">
                    {["Journal", "Favorites", "Bookmarks", "Notes", "Reading Progress", "Profile"].map((feature, index) => (
                      <div key={feature} className={`flex items-center gap-2 sm:gap-3 opacity-100 hover:bg-green-50 p-1.5 sm:p-2 rounded-lg transition-colors`}>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse flex-shrink-0"></div>
                        <p className="hover:text-green-600 transition-colors text-xs sm:text-sm">{feature}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Learning Resources */}
            <div className="group h-full">
              <Card className="h-full flex flex-col p-8 rounded-3xl border-2 border-orange-100 shadow-xl bg-gradient-to-br from-orange-50 to-amber-100 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:rotate-1 hover:border-orange-300 group-hover:bg-gradient-to-br group-hover:from-orange-100 group-hover:to-amber-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-300/20 to-amber-300/20 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                <CardHeader className="pb-4 relative z-10 flex-shrink-0">
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3 group-hover:text-orange-700 transition-colors">
                    <span className="text-4xl">📚</span>
                    <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Learning Resources</span>
                  </CardTitle>
                  <p className="text-gray-600 mt-2">Rich spiritual content library</p>
                </CardHeader>
                <CardContent className="flex-grow relative z-10">
                  <div className="text-sm text-gray-700 space-y-3">
                    {["Sermon Library", "Sermons", "Songs", "Study Plans", "Daily Verses", "Bible Characters"].map((feature, index) => (
                      <div key={feature} className={`flex items-center gap-3 opacity-100 hover:bg-orange-50 p-2 rounded-lg transition-colors`}>
                        <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full animate-pulse"></div>
                        <p className="hover:text-orange-600 transition-colors">{feature}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Study */}
            <div className="group h-full">
              <Card className="h-full flex flex-col p-8 rounded-3xl border-2 border-indigo-100 shadow-xl bg-gradient-to-br from-indigo-50 to-blue-100 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:rotate-1 hover:border-indigo-300 group-hover:bg-gradient-to-br group-hover:from-indigo-100 group-hover:to-blue-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-300/20 to-blue-300/20 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                <CardHeader className="pb-4 relative z-10 flex-shrink-0">
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3 group-hover:text-indigo-700 transition-colors">
                    <span className="text-4xl">📘</span>
                    <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Advanced Study</span>
                  </CardTitle>
                  <p className="text-gray-600 mt-2">Deep theological exploration</p>
                </CardHeader>
                <CardContent className="flex-grow relative z-10">
                  <div className="text-sm text-gray-700 space-y-3">
                    {["Hebrew/Greek Words", "Historical Context", "Theological Topics", "Commentary Access", "Parable Studies", "Cross References"].map((feature, index) => (
                      <div key={feature} className={`flex items-center gap-3 opacity-100 hover:bg-indigo-50 p-2 rounded-lg transition-colors`}>
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full animate-pulse"></div>
                        <p className="hover:text-indigo-600 transition-colors">{feature}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Creation */}
            <div className="group h-full">
              <Card className="h-full flex flex-col p-8 rounded-3xl border-2 border-pink-100 shadow-xl bg-gradient-to-br from-pink-50 to-rose-100 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:rotate-1 hover:border-pink-300 group-hover:bg-gradient-to-br group-hover:from-pink-100 group-hover:to-rose-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-300/20 to-rose-300/20 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                <CardHeader className="pb-4 relative z-10 flex-shrink-0">
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3 group-hover:text-pink-700 transition-colors">
                    <span className="text-4xl">✍️</span>
                    <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Content Creation</span>
                  </CardTitle>
                  <p className="text-gray-600 mt-2">Create and share spiritual content</p>
                </CardHeader>
                <CardContent className="flex-grow relative z-10">
                  <div className="text-sm text-gray-700 space-y-3">
                    {["Sermon Preparation", "Study Notes", "Personal Reflections", "Prayer Writing", "Teaching Materials", "Ministry Resources"].map((feature, index) => (
                      <div key={feature} className={`flex items-center gap-3 opacity-100 hover:bg-pink-50 p-2 rounded-lg transition-colors`}>
                        <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full animate-pulse"></div>
                        <p className="hover:text-pink-600 transition-colors">{feature}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced FAQ Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/3 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-8 shadow-lg shadow-orange-500/25">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto mb-6 rounded-full shadow-lg shadow-orange-500/50"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get answers to common questions about Bible Aura
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-4">
                <Card className={`border border-orange-200 bg-orange-50/50 hover:bg-orange-50 transition-all duration-500 transform hover:scale-[1.02] ${openFaq === index ? 'shadow-2xl shadow-orange-500/20 bg-orange-50 border-orange-300' : 'shadow-lg'}`}>
                  <CardHeader 
                    className="cursor-pointer p-6"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-left text-gray-900 font-semibold pr-4">
                        {faq.question}
                      </CardTitle>
                      <div className={`p-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>
                        {openFaq === index ? (
                          <ChevronUp className="h-5 w-5 text-white" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-white" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <CardContent className="pt-0 pb-6 px-6">
                      <div className="border-t border-orange-200 pt-4">
                        <p className="text-gray-700 leading-relaxed text-base">
                          {faq.answer}
                        </p>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
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
                <Link to="/dashboard" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Dashboard
                </Link>
                <Link to="/auth" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Sign In
                </Link>
              </nav>
            </div>
            
            {/* Contact Section */}
            <div className="text-center md:text-left">
              <h4 className="text-xl font-semibold text-white mb-6">Contact</h4>
              <div className="space-y-3">
                <p className="text-gray-400">@bible_aura.ai</p>
                <a 
                  href="mailto:bibleinsightai.contact@gmail.com" 
                  className="block text-gray-400 hover:text-orange-400 transition-colors duration-300"
                >
                  bibleinsightai.contact@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left text-gray-400">
              <div className="order-2 md:order-1">
                <Link to="/terms" className="hover:text-orange-400 transition-colors duration-300 text-sm">
                  Terms of Use
                </Link>
                <span className="mx-2">|</span>
                <Link to="/privacy" className="hover:text-orange-400 transition-colors duration-300 text-sm">
                  Privacy Policy
                </Link>
              </div>
              
              <div className="text-sm order-1 md:order-2 leading-relaxed">
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

export default Landing; 