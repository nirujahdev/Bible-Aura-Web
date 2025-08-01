import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { 
  GraduationCap, Globe, History, Book, Search, Target, Zap
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const AdvancedStudy = () => {
  // SEO optimization for Advanced Study
  useSEO({
    title: "Advanced Bible Study Tools | Greek, Hebrew & Theological Research - Bible Aura",
    description: "Access advanced Bible study tools including Hebrew and Greek word studies, historical context research, theological analysis, and scholarly resources for in-depth biblical research.",
    keywords: "advanced Bible study, Hebrew Greek study, biblical theology, historical context, biblical languages, theological research, biblical scholarship, exegesis tools, biblical commentary",
    canonicalUrl: "https://bibleaura.xyz/features/advanced-study"
  });

  const advancedFeatures = [
    {
      title: "Hebrew & Greek Studies",
      description: "Dive deep into original biblical languages with word studies, etymologies, and linguistic analysis for authentic scriptural understanding.",
      icon: Globe,
      features: ["Original languages", "Word etymologies", "Linguistic analysis", "Authentic meaning"],
      link: "/study-hub"
    },
    {
      title: "Historical Context",
      description: "Understand biblical events within their historical, cultural, and geographical contexts with comprehensive background information.",
      icon: History,
      features: ["Historical background", "Cultural context", "Geographical insights", "Timeline analysis"],
      link: "/study-hub"
    },
    {
      title: "Theological Analysis",
      description: "Explore deep theological concepts, doctrines, and systematic theology with scholarly resources and biblical foundations.",
      icon: GraduationCap,
      features: ["Theological concepts", "Doctrine studies", "Systematic theology", "Biblical foundations"],
      link: "/study-hub"
    },
    {
      title: "Commentary Resources",
      description: "Access scholarly biblical commentaries and interpretations from renowned theologians and biblical scholars throughout history.",
      icon: Book,
      features: ["Scholarly commentaries", "Expert interpretations", "Renowned theologians", "Historical insights"],
      link: "/study-hub"
    },
    {
      title: "Cross-Reference Research",
      description: "Conduct comprehensive cross-reference studies with advanced search tools and thematic connections across Scripture.",
      icon: Search,
      features: ["Advanced search", "Thematic connections", "Scripture links", "Research tools"],
      link: "/bible"
    },
    {
      title: "Academic Resources",
      description: "Access academic-level biblical resources, journals, and scholarly materials for serious biblical research and study.",
      icon: Target,
      features: ["Academic materials", "Scholarly journals", "Research resources", "Serious study"],
      link: "/study-hub"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50">
      <GlobalNavigation variant="landing" />

      {/* Section 1: Hero */}
      <section className="relative pt-32 pb-20 px-4 md:px-6 lg:px-10 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white mx-auto mb-8 shadow-2xl animate-pulse">
            <GraduationCap className="h-10 w-10" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            <span className="text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text">
              Advanced Bible Study
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            Access advanced biblical research tools including Hebrew and Greek studies, historical context, theological analysis, and scholarly resources for serious Bible study.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
              <Link to="/auth">
                <GraduationCap className="h-5 w-5 mr-2" />
                Start Advanced Study
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 px-8 py-4 rounded-xl hover:scale-105 transition-all duration-300">
              <Link to="/study-hub">
                <Book className="h-5 w-5 mr-2" />
                Explore Study Hub
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
              Scholarly Research Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional-grade tools and resources for serious biblical scholarship and in-depth theological research
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
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
                          <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mr-3"></div>
                          {item}
                        </div>
                      ))}
                    </div>
                    
                    <Button asChild className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg transition-all duration-300">
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

export default AdvancedStudy; 