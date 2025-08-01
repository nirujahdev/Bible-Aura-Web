import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { 
  BookOpen, Search, Users, TreePine, FileText, Globe, 
  ArrowLeft, Sparkles, Target, BookMarked
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const BibleStudy = () => {
  // SEO optimization for Bible Study features
  useSEO({
    title: "Bible Study Tools | Comprehensive Scripture Study Features - Bible Aura",
    description: "Discover Bible Aura's complete Bible study toolkit: verse search, cross-references, multiple translations, verse analysis, topical studies, character studies, and parable exploration. Enhanced with AI-powered insights.",
    keywords: "Bible study tools, verse search, cross references, Bible translations, verse analysis, topical Bible study, Bible characters, parables study, scripture study, biblical research, Bible study app",
    canonicalUrl: "https://bibleaura.xyz/features/bible-study"
  });

  const bibleStudyFeatures = [
    {
      title: "Bible Reading",
      description: "Read the complete Bible with multiple translations, beautiful typography, and distraction-free design for focused study.",
      icon: BookOpen,
      features: ["Multiple translations (KJV, NIV, ESV, NASB)", "Clean reading interface", "Chapter navigation", "Bookmarking system"],
      link: "/bible",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Verse Search",
      description: "Powerful search functionality to find any Bible verse by topic, keyword, or scripture reference with instant results.",
      icon: Search,
      features: ["Advanced keyword search", "Topic-based search", "Scripture reference lookup", "Search history"],
      link: "/bible",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Cross References",
      description: "Discover related verses and parallel passages that connect throughout Scripture for deeper understanding.",
      icon: Target,
      features: ["Automatic cross-references", "Related verse suggestions", "Thematic connections", "Study links"],
      link: "/bible",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Multiple Translations",
      description: "Compare different Bible translations side-by-side to understand the nuances and depth of Scripture.",
      icon: Globe,
      features: ["Translation comparison", "Side-by-side reading", "Translation notes", "Language options"],
      link: "/bible",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Verse Analysis",
      description: "In-depth analysis of Bible verses with historical context, original language insights, and theological commentary.",
      icon: Sparkles,
      features: ["Historical context", "Original language insights", "Theological commentary", "Cultural background"],
      link: "/bible-ai",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Topical Study",
      description: "Explore Bible topics and themes with organized studies on faith, love, hope, salvation, and hundreds more topics.",
      icon: FileText,
      features: ["200+ Bible topics", "Organized study guides", "Progressive learning", "Topic connections"],
      link: "/topical-study",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Bible Characters",
      description: "Study the lives, lessons, and legacies of biblical characters from Adam to the Apostles with detailed profiles.",
      icon: Users,
      features: ["Character biographies", "Life lessons", "Character timelines", "Related verses"],
      link: "/study-hub",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Parables Study",
      description: "Understand Jesus' parables with explanations, historical context, and practical applications for modern life.",
      icon: TreePine,
      features: ["All 40+ parables", "Historical context", "Modern applications", "Interactive explanations"],
      link: "/parables-study",
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    }
  ];

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-32 px-4 md:px-6 lg:px-10 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden pt-24 md:pt-28 lg:pt-32">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto mb-8">
          <Button asChild variant="ghost" className="text-gray-600 hover:text-orange-600">
            <Link to="/features" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to All Features
            </Link>
          </Button>
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Bible <span className="text-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text">Study Tools</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Comprehensive Bible study features designed to help you explore, understand, and apply God's Word with depth and clarity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4">
              <Link to="/bible">
                <BookOpen className="mr-2 h-5 w-5" />
                Start Bible Study
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white px-8 py-4">
              <Link to="/auth">
                <Sparkles className="mr-2 h-5 w-5" />
                Get Started Free
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Bible Study Toolkit
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to study God's Word effectively, from basic reading to advanced analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bibleStudyFeatures.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    {feature.features.map((item, idx) => (
                      <div key={idx} className="flex items-center text-xs text-gray-500">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        {item}
                      </div>
                    ))}
                  </div>
                  
                  <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                    <Link to={feature.link}>
                      Explore Feature
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 md:px-6 lg:px-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Deepen Your Bible Study?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start exploring God's Word with our comprehensive study tools and AI-powered insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4">
              <Link to="/bible">
                <BookMarked className="mr-2 h-5 w-5" />
                Start Studying Now
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4">
              <Link to="/features">
                <Sparkles className="mr-2 h-5 w-5" />
                View All Features
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BibleStudy; 