import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { SEOBacklinks } from "@/components/SEOBacklinks";
import { useSEO, SEO_CONFIG } from "@/hooks/useSEO";
import { useAuth } from "@/hooks/useAuth";

const About = () => {
  // SEO optimization
  useSEO(SEO_CONFIG.ABOUT);
  const { user, loading } = useAuth();
  
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

      {/* Quick Status Check */}
      <section className="py-4 bg-green-50 border-b border-green-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">✅ Routing Fixed! This page loaded successfully</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Auth Status: {loading ? 'Loading...' : (user ? `Logged in as ${user.email}` : 'Not logged in')}
          </p>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-24 pt-32 bg-gradient-to-br from-orange-50 to-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-8 text-center">
              About <span className="text-primary">Bible Aura</span>
            </h1>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                Bible Aura is a free AI Bible study tool created to help anyone understand God's Word easily. You can use it anytime and on any device. We use modern technology to explain the Bible in simple, clear ways so every believer can grow in their faith.
              </p>
              <p>
                Bible Aura removes common struggles like language difficulty, confusion, or lack of guidance. With AI chat, verse explanations, Tamil and English support, daily devotions, and reading plans, Bible Aura makes Bible learning easy, personal, and accessible for everyone.
              </p>
              <p>
                Our goal is to share the Gospel through technology and help people stay connected to God's Word in their everyday life.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/auth">Join Our Community</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">Get in Touch</Link>
              </Button>
            </div>
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
                <p className="text-lg text-gray-600 leading-relaxed">
                  To make the Bible simple, clear, and easy to understand for everyone, no matter their age, background, or language.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-orange-100 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-700 leading-relaxed">
                  To become a trusted Bible companion for millions of people around the world, helping them grow spiritually through simple, AI-powered Bible tools.
                </p>
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
              About the Founder
            </h2>
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
                <CardTitle className="text-2xl text-gray-900">
                  <a 
                    href="https://benaiahnicholasnimal.vercel.app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors duration-200"
                  >
                    {founder.name}
                  </a>
                </CardTitle>
                <p className="text-primary font-medium text-lg">{founder.role}</p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Bible Aura was created by Benaiah Nicholas Nimal, a young believer passionate about spreading the Gospel through technology. He built Bible Aura to help people understand the Bible better with the help of AI.
                </p>
                
                <div className="mt-6">
                  <a 
                    href="https://www.instagram.com/bible_aura.xyz/" 
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