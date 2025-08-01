import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { 
  BookOpen, Search, Bookmark, Heart, Cross, Book,
  Globe, Target, Crown, ArrowRight, Zap
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const BibleStudy = () => {
  // SEO optimization for Bible Study
  useSEO({
    title: "Bible Study Tools | Multiple Translations & AI-Powered Reading - Bible Aura",
    description: "Experience comprehensive Bible study with multiple translations, verse search, cross-references, and AI-powered insights. Transform your Scripture reading with Bible Aura's advanced study tools.",
    keywords: "Bible study, Bible reading, multiple translations, verse search, cross references, Bible tools, Scripture study, KJV, NIV, ESV, biblical study tools",
    canonicalUrl: "https://bibleaura.xyz/features/bible-study"
  });

  const bibleFeatures = [
    {
      title: "Multi-Translation Reading",
      description: "Access and compare multiple Bible translations side-by-side including KJV, NIV, ESV, NASB, NLT, and more for comprehensive understanding.",
      icon: Book,
      features: ["10+ Popular translations", "Side-by-side comparison", "Instant translation switching", "Parallel reading view"],
      link: "/bible",
      color: "blue",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      title: "Verse Search & Discovery",
      description: "Powerful search functionality to find specific verses, topics, or keywords across all translations with instant results.",
      icon: Search,
      features: ["Advanced keyword search", "Topic-based discovery", "Cross-translation results", "Smart suggestions"],
      link: "/bible",
      color: "green",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      title: "Cross References",
      description: "Explore connections between verses and passages with comprehensive cross-referencing system for deeper biblical understanding.",
      icon: Cross,
      features: ["Verse connections", "Thematic links", "Reference chains", "Related passages"],
      link: "/bible",
      color: "purple",
      gradient: "from-purple-500 to-violet-600"
    },
    {
      title: "Personal Bookmarks",
      description: "Save your favorite verses, passages, and study notes for quick access and personal reflection during your spiritual journey.",
      icon: Bookmark,
      features: ["Save favorite verses", "Organize collections", "Personal notes", "Quick access"],
      link: "/favorites",
      color: "orange",
      gradient: "from-orange-500 to-red-500"
    },
    {
      title: "Daily Reading Plans",
      description: "Follow structured reading plans designed to guide you through Scripture systematically with progress tracking.",
      icon: Target,
      features: ["Structured plans", "Progress tracking", "Daily reminders", "Multiple plan options"],
      link: "/bible",
      color: "teal",
      gradient: "from-teal-500 to-cyan-600"
    },
    {
      title: "Language Support",
      description: "Study Scripture in multiple languages including Tamil translations for diverse linguistic understanding of God's Word.",
      icon: Globe,
      features: ["Tamil translations", "Multiple languages", "Cultural context", "Linguistic insights"],
      link: "/bible",
      color: "pink",
      gradient: "from-pink-500 to-rose-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-6 lg:px-10 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          {/* Animated Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white mx-auto mb-8 shadow-2xl transform hover:scale-110 transition-transform duration-500">
            <BookOpen className="h-10 w-10 animate-pulse" />
          </div>

          {/* Title with Gradient Animation */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in">
            <span className="text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text animate-gradient">
              Bible Study
            </span>
          </h1>
          
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 mx-auto mb-8 rounded-full animate-pulse"></div>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12 animate-fade-in-up">
            Immerse yourself in Scripture with comprehensive study tools, multiple translations, and intelligent features designed to enhance your biblical understanding
          </p>

          {/* Quick Access Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up delay-300">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
              <Link to="/bible">
                <BookOpen className="h-5 w-5 mr-2" />
                Start Reading
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl hover:scale-105 transition-all duration-300">
              <Link to="/favorites">
                <Bookmark className="h-5 w-5 mr-2" />
                My Bookmarks
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 md:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-fade-in">
              Comprehensive Study Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up">
              Everything you need for deep, meaningful Bible study in one comprehensive platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bibleFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Background Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  
                  <CardHeader className="text-center pb-4 relative">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="text-center relative">
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <div className="space-y-3 mb-8">
                      {feature.features.map((item, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-500 justify-center group-hover:text-gray-700 transition-colors duration-300">
                          <div className={`w-2 h-2 bg-gradient-to-r ${feature.gradient} rounded-full mr-3 group-hover:scale-125 transition-transform duration-300`}></div>
                          {item}
                        </div>
                      ))}
                    </div>
                    
                    <Button asChild className={`w-full bg-gradient-to-r ${feature.gradient} hover:scale-105 text-white shadow-lg transition-all duration-300 group-hover:shadow-xl`}>
                      <Link to={feature.link}>
                        <Zap className="mr-2 h-4 w-4" />
                        Explore {feature.title}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bible Reading Experience */}
      <section className="py-20 px-4 md:px-6 lg:px-10 bg-gradient-to-r from-blue-900/5 via-indigo-900/5 to-purple-900/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8 animate-fade-in-right">
              <div>
                <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Enhanced <span className="text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">Reading Experience</span>
                </h3>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Transform your Bible study with intuitive features designed to help you understand Scripture more deeply and connect with God's Word in meaningful ways.
                </p>
              </div>

              <div className="space-y-6">
                                 <div className="flex items-start space-x-4">
                   <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg">
                     <Book className="h-6 w-6" />
                   </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Multiple Translations</h4>
                    <p className="text-gray-600">Access KJV, NIV, ESV, NASB, NLT, and more in one platform</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg">
                    <Crown className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Smart Features</h4>
                    <p className="text-gray-600">Intelligent search, cross-references, and contextual insights</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                    <Heart className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Personal Touch</h4>
                    <p className="text-gray-600">Save favorites, add notes, and track your reading progress</p>
                  </div>
                </div>
              </div>

              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
                <Link to="/auth">
                  <Target className="h-5 w-5 mr-2" />
                  Start Studying Today
                </Link>
              </Button>
            </div>

            {/* Right Side - Visual */}
            <div className="flex justify-center animate-fade-in-left">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-500">
                  <div className="text-center">
                    <BookOpen className="h-24 w-24 text-blue-600 mx-auto mb-4 animate-pulse" />
                    <div className="space-y-2">
                      <div className="w-16 h-2 bg-blue-300 rounded-full mx-auto animate-pulse"></div>
                      <div className="w-12 h-2 bg-indigo-300 rounded-full mx-auto animate-pulse delay-150"></div>
                      <div className="w-20 h-2 bg-purple-300 rounded-full mx-auto animate-pulse delay-300"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-500">
                  <Bookmark className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fade-in-left {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out forwards;
        }
        
        .animate-fade-in-left {
          animation: fade-in-left 0.8s ease-out forwards;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default BibleStudy; 