import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { Heart, Target, Star, Crown, BookOpen, Brain, MessageCircle, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { SEOBacklinks } from "@/components/SEOBacklinks";
import { useSEO, SEO_CONFIG } from "@/hooks/useSEO";

const About = () => {
  // SEO optimization
  useSEO(SEO_CONFIG.ABOUT);
  const founder = {
    name: "Benaiah Nicholas Nimal",
    role: "Founder & Developer",
    description: "A passionate believer and software developer dedicated to creating technology that serves God's kingdom and helps people grow in their faith through accessible Bible study tools.",
    image: "/benaiah.jpg"
  };

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Hero Section */}
      <section className="py-24 pt-32 bg-gradient-to-br from-orange-50 to-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            About <span className="text-primary">Bible Aura</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Spreading the Gospel and making the Bible accessible to everyone through innovative technology
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to="/auth">Join Our Community</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-24 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  To spread the Gospel by making the Bible accessible to everyone, everywhere. We believe that through innovative technology, 
                  every person should be able to understand and engage with God's Word deeply and meaningfully.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  Bible Aura combines cutting-edge AI technology with timeless biblical wisdom to create a platform that serves believers 
                  at every stage of their spiritual journey, breaking down barriers of language, complexity, and accessibility.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <span className="text-lg font-medium">Make Bible study accessible to all</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Brain className="h-6 w-6 text-blue-600" />
                    <span className="text-lg font-medium">AI-powered biblical insights</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Heart className="h-6 w-6 text-red-500" />
                    <span className="text-lg font-medium">Spread the Gospel through technology</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-orange-100 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-700 mb-6">
                  To become the world's most trusted platform for biblical study and spiritual growth, 
                  empowering millions of believers to deepen their relationship with God through accessible, 
                  AI-enhanced Bible study tools.
                </p>
                <p className="text-gray-700 mb-4">
                  We envision a world where everyone can understand the Bible through technology, regardless of their 
                  background, education level, or language, fostering global spiritual growth and biblical literacy.
                </p>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Reaching every nation with God's Word</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Founder Section */}
      <section className="py-24 bg-gradient-to-br from-orange-50 to-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Meet the Founder
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Bible Aura was created by a passionate believer dedicated to using technology to spread God's word and make the Bible accessible to everyone.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Card className="text-center border-2 border-primary/20 shadow-lg">
              <CardHeader>
                <div className="mx-auto mb-6 w-32 h-32 rounded-full overflow-hidden shadow-lg">
                  <img 
                    src={founder.image} 
                    alt={founder.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-2xl text-gray-900">{founder.name}</CardTitle>
                <p className="text-primary font-medium text-lg">{founder.role}</p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">{founder.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Tech Innovation</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 p-3 bg-green-50 rounded-lg">
                    <Heart className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Faith-Driven</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 p-3 bg-purple-50 rounded-lg">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Bible Study</span>
                  </div>
                </div>
                <div className="mt-6">
                  <a 
                    href="https://www.instagram.com/benaiah_4?igsh=cGZuYmI2YWw0d25r" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
                  >
                    Follow on Instagram
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <SEOBacklinks currentPage="/about" category="general" />
      <Footer />
    </div>
  );
};

export default About; 