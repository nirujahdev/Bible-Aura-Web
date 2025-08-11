import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { 
  Library, Music, Calendar, BookOpen, FileText, Video, Zap
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const LearningResources = () => {
  // SEO optimization for Learning Resources
  useSEO({
    title: "Bible Learning Resources | Sermons & Study Materials - Bible Aura",
    description: "Access comprehensive Bible learning resources including sermon library, daily devotions, study plans, and educational content for spiritual growth and ministry.",
    keywords: "Bible learning resources, sermon library, daily devotions, Bible study plans, Christian education, ministry resources, spiritual growth materials",
    canonicalUrl: "https://bibleaura.xyz/features/learning-resources"
  });

  const learningFeatures = [
    {
      title: "Sermon Library",
      description: "Access a vast collection of biblical sermons from various speakers and topics, organized by themes, books of the Bible, and series.",
      icon: Library,
      features: ["Sermon collection", "Topic organization", "Multiple speakers", "Searchable content"],
      link: "/sermons"
    },
    {
      title: "Daily Devotions",
      description: "Start each day with curated devotional content, scripture readings, and inspirational messages to strengthen your faith journey.",
      icon: Calendar,
      features: ["Daily content", "Scripture readings", "Inspirational messages", "Faith building"],
      link: "/dashboard"
    },
    {
      title: "Study Plans",
      description: "Follow structured Bible reading and study plans designed to guide you through Scripture systematically with educational content.",
      icon: BookOpen,
      features: ["Structured plans", "Educational content", "Progress tracking", "Multiple options"],
      link: "/bible"
    },
    {
      title: "Study Guides",
      description: "Access comprehensive study guides and educational materials covering biblical topics, character studies, and theological concepts.",
      icon: FileText,
      features: ["Topic studies", "Character profiles", "Theological concepts", "Educational materials"],
      link: "/study-hub"
    },
    {
      title: "Video Content",
      description: "Watch educational videos, biblical teachings, and visual content that enhances your understanding of Scripture and Christian life.",
      icon: Video,
      features: ["Educational videos", "Biblical teachings", "Visual content", "Enhanced learning"],
      link: "/study-hub"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/50 via-white to-purple-50/50">
      <GlobalNavigation variant="landing" />

      {/* Section 1: Hero */}
      <section className="relative pt-32 pb-20 px-4 md:px-6 lg:px-10 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white mx-auto mb-8 shadow-2xl animate-pulse">
            <Library className="h-10 w-10" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            <span className="text-transparent bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text">
              Learning Resources
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            Explore comprehensive Bible learning resources including sermons, daily devotions, study plans, and educational content for spiritual growth and ministry.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
              <Link to="/auth">
                <Library className="h-5 w-5 mr-2" />
                Explore Resources
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-pink-300 text-pink-700 hover:bg-pink-50 px-8 py-4 rounded-xl hover:scale-105 transition-all duration-300">
              <Link to="/sermons">
                <BookOpen className="h-5 w-5 mr-2" />
                Browse Sermons
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
              Comprehensive Learning Library
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access a wide range of educational resources designed to deepen your understanding and strengthen your faith journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {learningFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
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
                          <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mr-3"></div>
                          {item}
                        </div>
                      ))}
                    </div>
                    
                    <Button asChild className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg transition-all duration-300">
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

export default LearningResources; 