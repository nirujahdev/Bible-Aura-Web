import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { Heart, Users, Target, Lightbulb, Star, Crown, BookOpen, Brain, MessageCircle, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { SEOBacklinks } from "@/components/SEOBacklinks";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Faith-Centered",
      description: "Everything we do is rooted in deep reverence for Scripture and commitment to spiritual growth."
    },
    {
      icon: Brain,
      title: "Innovation",
      description: "We leverage cutting-edge Bible Aura AI technology to make biblical insights more accessible and meaningful."
    },
    {
      icon: Users,
      title: "Community",
      description: "Building a global community of believers united in their journey of faith and discovery."
    },
    {
      icon: Shield,
      title: "Integrity",
      description: "We maintain the highest standards of theological accuracy and ethical responsibility."
    }
  ];

  const developer = {
    name: "Benaiah Nicholas Nimal",
    role: "Founder & Developer",
    description: "A passionate believer and software developer dedicated to creating technology that serves God's kingdom and helps people grow in their faith.",
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
            About <span className="text-primary">✦Bible Aura</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            We're on a mission to make biblical wisdom accessible to everyone through the power of AI and community-driven insights.
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

      {/* Mission Section */}
      <section className="py-24 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Bible Aura was born from a simple belief: that everyone should have access to deep, meaningful biblical insights. 
                We combine cutting-edge Bible Aura AI technology with timeless biblical wisdom to create a platform that serves believers 
                at every stage of their spiritual journey.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Whether you're seeking answers to theological questions, looking for guidance in your daily walk with Christ, 
                or simply wanting to explore the depths of Scripture, Bible Aura is here to guide and support you.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium">✦ Bible Aura AI-Powered Insights</span>
        </div>
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium">Theologically Sound</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-orange-100 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-700 mb-4">
                  To become the world's most trusted platform for biblical study and spiritual growth, 
                  empowering millions of believers to deepen their relationship with God.
                </p>

              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Values Section */}
      <section className="py-24 bg-gradient-to-br from-orange-50 to-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do and shape our approach to serving the global Christian community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center border-2 border-gray-100 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-24 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Meet the Developer
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Bible Aura was created by a passionate believer dedicated to using technology to spread God's word.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-6 w-32 h-32 rounded-full overflow-hidden shadow-lg">
                  <img 
                    src={developer.image} 
                    alt={developer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-2xl text-gray-900">{developer.name}</CardTitle>
                <p className="text-primary font-medium text-lg">{developer.role}</p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-lg leading-relaxed">{developer.description}</p>
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