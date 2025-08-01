import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { 
  BookOpen, Heart, Bookmark, StickyNote, TrendingUp, User,
  ArrowLeft, Sparkles, Zap
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const PersonalTools = () => {
  // SEO optimization for Personal Tools features
  useSEO({
    title: "Personal Bible Study Tools | Journal, Favorites & Progress Tracking - Bible Aura",
    description: "Enhance your personal Bible study with Bible Aura's tools: Spiritual Journal, Favorites, Bookmarks, Notes, Reading Progress, and Profile management. Track your spiritual growth effectively.",
    keywords: "personal Bible tools, spiritual journal, Bible favorites, bookmarks, study notes, reading progress, Bible profile, personal Bible study, spiritual growth tracking",
    canonicalUrl: "https://bibleaura.xyz/features/personal-tools"
  });

  const personalToolsFeatures = [
    {
      title: "Journal",
      description: "Document your spiritual journey with guided prompts, AI insights, and personal reflections for meaningful growth tracking.",
      icon: BookOpen,
      features: ["Guided reflection prompts", "AI spiritual insights", "Private journaling", "Growth tracking", "Daily devotions"],
      link: "/journal",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Favorites",
      description: "Save and organize your favorite Bible verses, passages, and study materials for quick access and reference.",
      icon: Heart,
      features: ["Verse collections", "Quick access", "Organized categories", "Sharing options", "Sync across devices"],
      link: "/favorites",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Bookmarks",
      description: "Mark important Bible passages and studies to easily return to your place and continue your spiritual exploration.",
      icon: Bookmark,
      features: ["Chapter bookmarks", "Study markers", "Progress tracking", "Quick navigation", "Personal labels"],
      link: "/favorites",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Notes",
      description: "Take detailed study notes with verse connections, AI insights, and organized study materials for deeper understanding.",
      icon: StickyNote,
      features: ["Verse-linked notes", "AI enhancements", "Study organization", "Search functionality", "Export options"],
      link: "/journal",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Reading Progress",
      description: "Track your Bible reading journey with detailed progress reports, streaks, and personalized reading goals.",
      icon: TrendingUp,
      features: ["Reading streaks", "Progress reports", "Goal setting", "Achievement badges", "Reading statistics"],
      link: "/dashboard",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Profile",
      description: "Manage your personal Bible study preferences, goals, and spiritual growth milestones in one centralized location.",
      icon: User,
      features: ["Personal preferences", "Study goals", "Growth milestones", "Account settings", "Spiritual metrics"],
      link: "/profile",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ];

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-32 px-4 md:px-6 lg:px-10 bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden pt-24 md:pt-28 lg:pt-32">
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
            <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-xl">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Personal <span className="text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text">Tools</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Personalize your Bible study experience with tools designed to track, organize, and enhance your spiritual growth journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4">
              <Link to="/journal">
                <BookOpen className="mr-2 h-5 w-5" />
                Start Your Journey
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
              Comprehensive Personal Bible Study Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to organize, track, and enhance your personal Bible study experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalToolsFeatures.map((feature, index) => (
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
                  
                  <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
                    <Link to={feature.link}>
                      <Zap className="mr-2 h-4 w-4" />
                      Use This Tool
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 md:px-6 lg:px-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Personalize Your Bible Study?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start using our personal tools to track your spiritual growth and organize your Bible study experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4">
              <Link to="/dashboard">
                <TrendingUp className="mr-2 h-5 w-5" />
                View Your Progress
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

export default PersonalTools; 