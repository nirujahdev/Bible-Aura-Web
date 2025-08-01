import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { 
  User, Heart, BookOpen, FileText, Target, TrendingUp,
  Calendar, Zap
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const PersonalTools = () => {
  // SEO optimization for Personal Tools
  useSEO({
    title: "Personal Bible Study Tools | Journal, Favorites & Progress Tracking - Bible Aura",
    description: "Enhance your spiritual journey with personal Bible study tools: digital journal, verse favorites, reading progress tracking, study plans, and spiritual growth analytics.",
    keywords: "digital Bible journal, verse favorites, Bible reading progress, study plans, spiritual growth tracking, personal Bible tools, Bible bookmarks, reading analytics",
    canonicalUrl: "https://bibleaura.xyz/features/personal-tools"
  });

  const personalFeatures = [
    {
      title: "Digital Journal",
      description: "Record your spiritual thoughts, prayers, and reflections with our secure digital journal featuring rich text editing and search capabilities.",
      icon: FileText,
      features: ["Rich text editor", "Private & secure", "Search entries", "Daily reflections"],
      link: "/journal"
    },
    {
      title: "Verse Favorites",
      description: "Save and organize your favorite Bible verses into collections with personal notes and easy sharing options for encouragement.",
      icon: Heart,
      features: ["Save verses", "Create collections", "Personal notes", "Share favorites"],
      link: "/favorites"
    },
    {
      title: "Reading Progress",
      description: "Track your Bible reading journey with detailed analytics, reading streaks, and progress visualization to maintain consistency.",
      icon: TrendingUp,
      features: ["Reading analytics", "Progress streaks", "Goal tracking", "Visual progress"],
      link: "/dashboard"
    },
    {
      title: "Study Plans",
      description: "Create and follow personalized Bible reading plans with daily goals, reminders, and progress tracking for structured study.",
      icon: Target,
      features: ["Custom plans", "Daily goals", "Reminders", "Progress tracking"],
      link: "/dashboard"
    },
    {
      title: "Spiritual Calendar",
      description: "Organize your spiritual activities with an integrated calendar for prayer times, Bible study sessions, and church events.",
      icon: Calendar,
      features: ["Event scheduling", "Prayer reminders", "Study sessions", "Church events"],
      link: "/dashboard"
    },
    {
      title: "Study Profile",
      description: "Manage your personal Bible study preferences, achievements, and spiritual growth milestones in your personalized profile.",
      icon: User,
      features: ["Study preferences", "Achievements", "Growth milestones", "Personal stats"],
      link: "/profile"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-blue-50/50">
      <GlobalNavigation variant="landing" />

      {/* Section 1: Hero */}
      <section className="relative pt-32 pb-20 px-4 md:px-6 lg:px-10 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-blue-600 text-white mx-auto mb-8 shadow-2xl animate-pulse">
            <User className="h-10 w-10" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            <span className="text-transparent bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 bg-clip-text">
              Personal Study Tools
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            Personalize your spiritual journey with powerful tools to track progress, organize favorites, journal reflections, and manage your Bible study experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
              <Link to="/auth">
                <User className="h-5 w-5 mr-2" />
                Start Personal Study
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-green-300 text-green-700 hover:bg-green-50 px-8 py-4 rounded-xl hover:scale-105 transition-all duration-300">
              <Link to="/journal">
                <FileText className="h-5 w-5 mr-2" />
                Open Journal
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
              Your Personal Study Toolkit
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Organize, track, and enhance your spiritual journey with personalized tools designed for meaningful growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {personalFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
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
                          <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mr-3"></div>
                          {item}
                        </div>
                      ))}
                    </div>
                    
                    <Button asChild className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg transition-all duration-300">
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

export default PersonalTools; 