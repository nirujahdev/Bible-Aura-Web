import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { 
  Mic, FileText, Music, BookOpen, Calendar,
  ArrowLeft, Sparkles, Zap
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const LearningResources = () => {
  // SEO optimization for Learning Resources features
  useSEO({
    title: "Learning Resources | Sermons, Songs & Study Plans - Bible Aura",
    description: "Access Bible Aura's comprehensive learning resources: Sermon Library, Sermons, Songs, Study Plans, and Daily Verses. Enhance your spiritual education with curated biblical content.",
    keywords: "learning resources, sermon library, Christian sermons, worship songs, Bible study plans, daily verses, spiritual education, biblical learning, Christian resources",
    canonicalUrl: "https://bibleaura.xyz/features/learning-resources"
  });

  const learningResourcesFeatures = [
    {
      title: "Sermon Library",
      description: "Access thousands of biblically sound sermons from renowned pastors and theologians for spiritual growth and inspiration.",
      icon: Mic,
      features: ["Thousands of sermons", "Renowned pastors", "Topic-based search", "Audio & transcript", "Bookmark favorites"],
      link: "/sermon-library",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Sermons",
      description: "Browse curated sermon collections organized by topics, biblical books, and spiritual themes for targeted learning.",
      icon: FileText,
      features: ["Curated collections", "Topic organization", "Biblical book series", "Spiritual themes", "Study guides"],
      link: "/sermons",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Songs",
      description: "Discover worship songs, hymns, and spiritual music with lyrics and biblical connections for worship and meditation.",
      icon: Music,
      features: ["Worship songs", "Traditional hymns", "Lyrics included", "Biblical connections", "Worship playlists"],
      link: "/songs",
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      title: "Study Plans",
      description: "Follow structured Bible study plans designed for different levels, topics, and spiritual growth objectives.",
      icon: BookOpen,
      features: ["Structured plans", "Multiple levels", "Topic-focused", "Progress tracking", "Flexible schedules"],
      link: "/study-hub",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Daily Verses",
      description: "Receive inspiring daily Bible verses with commentary, reflection questions, and practical applications for daily living.",
      icon: Calendar,
      features: ["Daily inspiration", "Verse commentary", "Reflection questions", "Practical applications", "Sharing options"],
      link: "/dashboard",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-32 px-4 md:px-6 lg:px-10 bg-gradient-to-br from-purple-50 via-white to-pink-50 overflow-hidden pt-24 md:pt-28 lg:pt-32">
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
            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full shadow-xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Learning <span className="text-transparent bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text">Resources</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Comprehensive collection of sermons, songs, study plans, and daily inspiration to enrich your spiritual education and growth.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-4">
              <Link to="/sermon-library">
                <Mic className="mr-2 h-5 w-5" />
                Explore Resources
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white px-8 py-4">
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
              Rich Learning Resources Library
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access thousands of sermons, songs, and study materials to enhance your spiritual education
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningResourcesFeatures.map((feature, index) => (
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
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                        {item}
                      </div>
                    ))}
                  </div>
                  
                  <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
                    <Link to={feature.link}>
                      <Zap className="mr-2 h-4 w-4" />
                      Access Resource
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-purple-500 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 md:px-6 lg:px-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Expand Your Biblical Knowledge?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Access thousands of learning resources to deepen your understanding of God's Word.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4">
              <Link to="/sermon-library">
                <Mic className="mr-2 h-5 w-5" />
                Browse Sermons
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4">
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

export default LearningResources; 