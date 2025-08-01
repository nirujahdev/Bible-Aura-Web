import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { 
  Mic, FileText, PenTool, ArrowLeft, Sparkles, 
  BookOpen, Edit, Zap
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const ContentCreation = () => {
  // SEO optimization for Content Creation features
  useSEO({
    title: "Content Creation Tools | Sermon Writing & Study Notes - Bible Aura",
    description: "Create powerful biblical content with Bible Aura's AI-powered tools: Sermon Preparation, Study Notes, and Personal Reflections. Professional content creation for pastors, teachers, and Bible students.",
    keywords: "sermon writing, sermon preparation, study notes, personal reflections, biblical content creation, AI sermon writer, pastor tools, Bible study notes, Christian content creation",
    canonicalUrl: "https://bibleaura.xyz/features/content-creation"
  });

  const contentCreationFeatures = [
    {
      title: "Sermon Preparation",
      description: "Create compelling sermons with AI-powered writing assistance, biblical insights, and professional templates for powerful preaching.",
      icon: Mic,
      features: ["AI writing assistant", "Sermon templates", "Biblical integration", "Speaking time calculator", "Outline generator"],
      link: "/sermon-writer",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Study Notes",
      description: "Take comprehensive study notes with AI-enhanced insights, verse connections, and organized study materials for deeper learning.",
      icon: FileText,
      features: ["AI-enhanced notes", "Verse connections", "Study organization", "Cross-references", "Topic categorization"],
      link: "/journal",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Personal Reflections",
      description: "Document your spiritual journey with guided reflection prompts, AI insights, and personalized spiritual growth tracking.",
      icon: PenTool,
      features: ["Guided reflections", "AI prompts", "Growth tracking", "Private journaling", "Spiritual insights"],
      link: "/journal",
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-32 px-4 md:px-6 lg:px-10 bg-gradient-to-br from-purple-50 via-white to-green-50 overflow-hidden pt-24 md:pt-28 lg:pt-32">
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
            <div className="p-4 bg-gradient-to-r from-purple-500 to-green-600 rounded-full shadow-xl">
              <Edit className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Content <span className="text-transparent bg-gradient-to-r from-purple-500 to-green-600 bg-clip-text">Creation</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Professional tools for creating powerful biblical content, from sermons to study notes, enhanced with AI-powered insights and assistance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-green-600 hover:from-purple-600 hover:to-green-700 text-white px-8 py-4">
              <Link to="/sermon-writer">
                <Mic className="mr-2 h-5 w-5" />
                Start Creating
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
              Professional Content Creation Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create compelling biblical content with AI-powered assistance and professional templates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contentCreationFeatures.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className={`w-24 h-24 ${feature.bgColor} rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-12 w-12 ${feature.color}`} />
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
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        {item}
                      </div>
                    ))}
                  </div>
                  
                  <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-green-600 hover:from-purple-600 hover:to-green-700 text-white py-3">
                    <Link to={feature.link}>
                      <Zap className="mr-2 h-4 w-4" />
                      Start Creating
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Content Creation Process */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              How Content Creation Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered tools guide you through the entire content creation process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">1. Choose Your Content Type</h3>
              <p className="text-gray-600">
                Select from sermons, study notes, or personal reflections to begin your content creation journey.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">2. AI-Powered Assistance</h3>
              <p className="text-gray-600">
                Get AI suggestions, biblical insights, and writing assistance tailored to your content type and topic.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Edit className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">3. Create & Refine</h3>
              <p className="text-gray-600">
                Use our professional editor to craft, refine, and perfect your biblical content with real-time assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-purple-500 to-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 md:px-6 lg:px-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Create Powerful Biblical Content?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join pastors, teachers, and Bible students who are creating impactful content with our AI-powered tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4">
              <Link to="/sermon-writer">
                <Mic className="mr-2 h-5 w-5" />
                Write Your First Sermon
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

export default ContentCreation; 