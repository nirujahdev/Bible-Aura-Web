import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { 
  BookOpen, Search, Bookmark, Heart, Cross, Book,
  Globe, Target, Zap
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const BibleStudy = () => {
  // SEO optimization for Bible Study
  useSEO({
    title: "Bible Study Tools | Multiple Translations & Advanced Scripture Study - Bible Aura",
    description: "Comprehensive Bible study tools with multiple translations, verse search, cross-references, bookmarks, and reading plans. Study Scripture with KJV, NIV, ESV, NASB, and more translations.",
    keywords: "Bible study tools, multiple Bible translations, verse search, cross references, Bible reading, KJV, NIV, ESV, NASB, scripture study, Bible bookmarks, reading plans",
    canonicalUrl: "https://bibleaura.xyz/features/bible-study"
  });

  const bibleFeatures = [
    {
      title: "Multiple Bible Translations",
      description: "Access and compare over 10 popular Bible translations including KJV, NIV, ESV, NASB, NLT with side-by-side reading.",
      icon: Book,
      features: ["10+ Popular translations", "Side-by-side comparison", "Instant switching", "Parallel reading"],
      link: "/bible"
    },
    {
      title: "Advanced Verse Search",
      description: "Find any Bible verse quickly with our powerful search engine that works across all translations and supports keyword, topic, and reference searches.",
      icon: Search,
      features: ["Cross-translation search", "Keyword matching", "Topic discovery", "Reference lookup"],
      link: "/bible"
    },
    {
      title: "Cross References System",
      description: "Explore biblical connections with comprehensive cross-references that link related verses and passages throughout Scripture.",
      icon: Cross,
      features: ["Verse connections", "Thematic links", "Related passages", "Scripture chains"],
      link: "/bible"
    },
    {
      title: "Personal Bookmarks",
      description: "Save and organize your favorite Bible verses and passages with collections, tags, and personal notes for easy access.",
      icon: Bookmark,
      features: ["Save verses", "Organize collections", "Personal notes", "Quick access"],
      link: "/favorites"
    },
    {
      title: "Reading Plans & Progress",
      description: "Follow structured Bible reading plans with progress tracking, daily goals, and achievement badges to maintain consistent study habits.",
      icon: Target,
      features: ["Structured plans", "Progress tracking", "Daily goals", "Achievement badges"],
      link: "/bible"
    },
    {
      title: "Multi-Language Support",
      description: "Study Scripture in multiple languages including English and Tamil translations for diverse linguistic understanding.",
      icon: Globe,
      features: ["English translations", "Tamil Bible", "Language switching", "Cultural context"],
      link: "/bible"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50">
      <GlobalNavigation variant="landing" />

      {/* Section 1: Hero */}
      <section className="relative pt-32 pb-20 px-4 md:px-6 lg:px-10 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white mx-auto mb-8 shadow-2xl animate-pulse">
            <BookOpen className="h-10 w-10" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            <span className="text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text">
              Comprehensive Bible Study
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            Study Scripture with powerful tools including multiple translations, advanced search, cross-references, and personal study features designed for deep biblical understanding.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
              <Link to="/auth">
                <BookOpen className="h-5 w-5 mr-2" />
                Start Bible Study
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl hover:scale-105 transition-all duration-300">
              <Link to="/bible">
                <Search className="h-5 w-5 mr-2" />
                Explore Bible
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 2: Features Grid */}
      <section className="py-20 px-4 md:px-6 lg:px-10 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Bible Study Toolkit
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for comprehensive Scripture study and spiritual growth in one powerful platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bibleFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="text-center">
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <div className="space-y-2 mb-8">
                      {feature.features.map((item, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-500 justify-center">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-3"></div>
                          {item}
                        </div>
                      ))}
                    </div>
                    
                    <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg transition-all duration-300">
                      <Link to={feature.link}>
                        <Zap className="mr-2 h-4 w-4" />
                        Try {feature.title}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BibleStudy; 