import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useSEO, SEO_CONFIG } from "@/hooks/useSEO";

const Features = () => {
  // SEO optimization
  useSEO(SEO_CONFIG.FEATURES);
  const featureCategories = [
    {
      number: "01",
      title: "Bible Study",
      description: "Comprehensive biblical study tools",
      features: [
        "Bible Reading",
        "Verse Search", 
        "Cross References",
        "Multiple Translations",
        "Verse Analysis",
        "Topical Study"
      ],
      gradient: "from-blue-500 to-blue-600"
    },
    {
      number: "02",
      title: "AI Features", 
      description: "AI-powered spiritual insights",
      features: [
        "AI Chat Oracle",
        "Biblical Q&A",
        "AI Analysis", 
        "Scripture Insights",
        "Contextual Explanations",
        "Smart Recommendations"
      ],
      gradient: "from-purple-500 to-purple-600"
    },
    {
      number: "03",
      title: "Personal Tools",
      description: "Personalized spiritual journey", 
      features: [
        "Journal",
        "Favorites",
        "Bookmarks",
        "Notes",
        "Reading Progress", 
        "Profile"
      ],
      gradient: "from-green-500 to-green-600"
    },
    {
      number: "04", 
      title: "Learning Resources",
      description: "Rich spiritual content library",
      features: [
        "Sermon Library",
        "Sermons",
        "Songs", 
        "Study Plans",
        "Daily Verses",
        "Bible Characters"
      ],
      gradient: "from-orange-500 to-orange-600"
    },
    {
      number: "05",
      title: "Advanced Study",
      description: "Deep theological exploration",
      features: [
        "Hebrew/Greek Words",
        "Historical Context",
        "Theological Topics",
        "Commentary Access",
        "Parable Studies",
        "Cross References"
      ],
      gradient: "from-indigo-500 to-indigo-600"
    },
    {
      number: "06",
      title: "Content Creation", 
      description: "Create and share spiritual content",
      features: [
        "Sermon Preparation",
        "Study Notes",
        "Personal Reflections",
        "Prayer Writing",
        "Teaching Materials", 
        "Ministry Resources"
      ],
      gradient: "from-pink-500 to-pink-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-32 px-4 md:px-6 lg:px-10 bg-gradient-to-br from-orange-50 via-white to-amber-50 overflow-hidden pt-24 md:pt-28 lg:pt-32">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 md:w-48 lg:w-64 h-32 md:h-48 lg:h-64 bg-orange-400/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 md:w-64 lg:w-80 h-48 md:h-64 lg:h-80 bg-yellow-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative w-full max-w-7xl mx-auto text-center">
          {/* Header Icon */}
          <div className="inline-flex items-center justify-center w-16 md:w-20 h-16 md:h-20 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mx-auto mb-8 shadow-lg">
            <span className="text-2xl md:text-3xl font-bold">✦</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6">
            <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">
              Bible Aura Features
            </span>
          </h1>
          
          <div className="w-24 md:w-32 h-1 bg-gradient-to-r from-orange-500 to-purple-500 mx-auto mb-8"></div>
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
            Discover all the powerful tools and features designed to enhance your spiritual journey with cutting-edge AI technology
          </p>

          {/* CTA Button */}
          <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:scale-105 transition-transform">
            <Link to="/auth">
              <Sparkles className="h-5 w-5 mr-2" />
              EXPLORE ALL FEATURES
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {featureCategories.map((category, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white hover:scale-105 overflow-hidden h-full">
                <CardHeader className="pb-6 relative">
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                  
                  {/* Number and Title */}
                  <div className="relative flex items-start gap-4 mb-6">
                    <div className={`w-14 h-14 bg-gradient-to-r ${category.gradient} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                      <span className="text-white text-lg font-bold">{category.number}</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                        {category.title}
                      </CardTitle>
                      <p className="text-gray-600 text-sm">{category.description}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative pt-0 px-6 pb-6">
                  <div className="space-y-3">
                    {category.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-gray-700 group-hover:text-gray-900 transition-colors">
                        <div className={`w-2 h-2 bg-gradient-to-r ${category.gradient} rounded-full mr-4 flex-shrink-0`}></div>
                        <span className="font-medium text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Ready to Transform Your Bible Study?
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            Start your spiritual journey today with all these powerful features at your fingertips.
          </p>
          <Button asChild size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl shadow-lg">
            <Link to="/auth">
              <span className="text-orange-600 mr-2">✦</span>
              START YOUR JOURNEY
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features; 