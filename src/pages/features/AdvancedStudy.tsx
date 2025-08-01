import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { 
  Languages, Globe, BookOpen, FileText,
  ArrowLeft, Sparkles, Zap
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const AdvancedStudy = () => {
  // SEO optimization for Advanced Study features
  useSEO({
    title: "Advanced Bible Study Tools | Hebrew, Greek & Theology - Bible Aura",
    description: "Master advanced Bible study with Bible Aura's tools: Hebrew/Greek Words, Historical Context, Theological Topics, and Commentary Access. Deepen your biblical scholarship with professional resources.",
    keywords: "advanced Bible study, Hebrew Greek words, historical context, theological topics, Bible commentary, biblical scholarship, original languages, theological research, advanced biblical analysis",
    canonicalUrl: "https://bibleaura.xyz/features/advanced-study"
  });

  const advancedStudyFeatures = [
    {
      title: "Hebrew/Greek Words",
      description: "Explore original Hebrew and Greek words with definitions, etymology, usage patterns, and theological significance for deeper understanding.",
      icon: Languages,
      features: ["Original language study", "Word definitions", "Etymology research", "Usage patterns", "Theological significance"],
      link: "/bible-ai",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Historical Context",
      description: "Understand biblical events within their historical, cultural, and geographical context with comprehensive background information.",
      icon: Globe,
      features: ["Historical background", "Cultural context", "Geographical insights", "Archaeological findings", "Timeline connections"],
      link: "/bible-ai",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Theological Topics",
      description: "Dive deep into systematic theology with comprehensive studies on major biblical doctrines and theological concepts.",
      icon: BookOpen,
      features: ["Systematic theology", "Doctrinal studies", "Theological concepts", "Cross-references", "Scholarly analysis"],
      link: "/topical-study",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Commentary Access",
      description: "Access renowned biblical commentaries and scholarly works from leading theologians and biblical scholars throughout history.",
      icon: FileText,
      features: ["Renowned commentaries", "Scholarly works", "Historical perspectives", "Modern interpretations", "Academic resources"],
      link: "/study-hub",
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-32 px-4 md:px-6 lg:px-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden pt-24 md:pt-28 lg:pt-32">
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
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-xl">
              <Languages className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Advanced <span className="text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text">Study</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Professional-grade biblical study tools for scholars, pastors, and serious students seeking deep theological understanding and original language insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4">
              <Link to="/bible-ai">
                <Languages className="mr-2 h-5 w-5" />
                Start Advanced Study
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-500 hover:text-white px-8 py-4">
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
              Professional Biblical Scholarship Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access scholarly resources and advanced study tools for deep theological research and biblical analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {advancedStudyFeatures.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className={`w-20 h-20 ${feature.bgColor} rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-10 w-10 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 mb-6 leading-relaxed text-center">
                    {feature.description}
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    {feature.features.map((item, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-500">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                        {item}
                      </div>
                    ))}
                  </div>
                  
                  <Button asChild className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3">
                    <Link to={feature.link}>
                      <Zap className="mr-2 h-4 w-4" />
                      Access Advanced Tool
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Excellence Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Scholarly Excellence in Biblical Study
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced tools trusted by seminaries, pastors, and biblical scholars worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Languages className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Original Languages</h3>
              <p className="text-gray-600">
                Study Hebrew and Greek with comprehensive linguistic tools and scholarly resources.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Historical Accuracy</h3>
              <p className="text-gray-600">
                Access verified historical and archaeological information from leading academic sources.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Scholarly Resources</h3>
              <p className="text-gray-600">
                Access commentaries and theological works from renowned biblical scholars and theologians.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 md:px-6 lg:px-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready for Advanced Biblical Scholarship?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join seminaries, pastors, and scholars who rely on our advanced study tools for serious biblical research.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4">
              <Link to="/bible-ai">
                <Languages className="mr-2 h-5 w-5" />
                Start Hebrew/Greek Study
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-4">
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

export default AdvancedStudy; 