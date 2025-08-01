import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { 
  Edit, FileText, PenTool, Lightbulb, Users, Target, Zap
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const ContentCreation = () => {
  // SEO optimization for Content Creation
  useSEO({
    title: "Sermon Creation Tools | AI-Powered Sermon Writing & Content Creation - Bible Aura",
    description: "Create powerful sermons and Bible study content with AI-powered writing tools, sermon templates, outline generators, and scripture integration for pastors and ministry leaders.",
    keywords: "sermon creation, sermon writing tools, AI sermon generator, sermon templates, sermon outlines, Bible content creation, pastor tools, ministry content, sermon preparation",
    canonicalUrl: "https://bibleaura.xyz/features/content-creation"
  });

  const contentFeatures = [
    {
      title: "AI Sermon Assistant",
      description: "Create compelling sermons with AI-powered writing assistance that helps generate outlines, expand ideas, and refine your message with biblical accuracy.",
      icon: Edit,
      features: ["AI writing assistance", "Sermon outlines", "Content expansion", "Biblical accuracy"],
      link: "/sermon-writer"
    },
    {
      title: "Sermon Templates",
      description: "Access professional sermon templates and structures including three-point sermons, expository preaching, and topical study formats.",
      icon: FileText,
      features: ["Professional templates", "Multiple structures", "Customizable formats", "Easy organization"],
      link: "/sermon-writer"
    },
    {
      title: "Scripture Integration",
      description: "Seamlessly integrate Bible verses into your content with automatic formatting, cross-references, and multiple translation options.",
      icon: PenTool,
      features: ["Verse integration", "Auto-formatting", "Cross-references", "Multiple translations"],
      link: "/sermon-writer"
    },
    {
      title: "Outline Generator",
      description: "Generate structured sermon outlines and study guides with main points, sub-points, and supporting scripture references automatically.",
      icon: Lightbulb,
      features: ["Structured outlines", "Main points", "Sub-points", "Scripture support"],
      link: "/sermon-writer"
    },
    {
      title: "Audience Engagement",
      description: "Create content that resonates with your congregation using tools for illustrations, applications, and interactive elements.",
      icon: Users,
      features: ["Illustrations", "Applications", "Interactive elements", "Audience targeting"],
      link: "/sermon-writer"
    },
    {
      title: "Content Library",
      description: "Organize and manage your sermons, studies, and content in a searchable library with tags, categories, and easy sharing options.",
      icon: Target,
      features: ["Content organization", "Searchable library", "Tags & categories", "Easy sharing"],
      link: "/sermons"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-red-50/50">
      <GlobalNavigation variant="landing" />

      {/* Section 1: Hero */}
      <section className="relative pt-32 pb-20 px-4 md:px-6 lg:px-10 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white mx-auto mb-8 shadow-2xl animate-pulse">
            <Edit className="h-10 w-10" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            <span className="text-transparent bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text">
              Sermon Creation Tools
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            Create powerful sermons and Bible study content with AI-powered writing tools, professional templates, and seamless scripture integration designed for pastors and ministry leaders.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
              <Link to="/auth">
                <Edit className="h-5 w-5 mr-2" />
                Start Creating Sermons
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50 px-8 py-4 rounded-xl hover:scale-105 transition-all duration-300">
              <Link to="/sermon-writer">
                <PenTool className="h-5 w-5 mr-2" />
                Try Sermon Writer
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
              Professional Content Creation Suite
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create compelling sermons and Bible study content that engages and inspires your congregation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contentFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
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
                          <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mr-3"></div>
                          {item}
                        </div>
                      ))}
                    </div>
                    
                    <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg transition-all duration-300">
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

export default ContentCreation; 