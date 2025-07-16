import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Target, Lightbulb, ArrowLeft, Star, Crown, BookOpen, Brain, MessageCircle, Shield, Home, Info, Phone, LogIn, UserPlus, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const values = [
    {
      icon: Heart,
      title: "Faith-Centered",
      description: "Everything we do is rooted in deep reverence for Scripture and commitment to spiritual growth."
    },
    {
      icon: Brain,
      title: "Innovation",
      description: "We leverage cutting-edge AI technology to make biblical insights more accessible and meaningful."
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



  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Floating Curved Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-7xl px-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-full shadow-2xl border border-white/20 px-6 lg:px-12 py-4 transition-all duration-500 hover:shadow-3xl hover:scale-[1.02] lg:min-w-[800px]">
          {/* Glowing border effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative flex items-center justify-between">
            {/* Enhanced Logo - Single Line */}
            <div className="hidden lg:flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-500 hover:bg-primary/5 group cursor-pointer">
              <span className="text-xl font-divine text-primary whitespace-nowrap transition-all duration-500 group-hover:text-primary/80 group-hover:scale-105">✦Bible Aura</span>
            </div>
            
            {/* Enhanced Desktop Navigation Items */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Home */}
              <Link 
                to="/" 
                className="group relative flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-500 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-110 active:scale-95"
              >
                <Home className="h-4 w-4 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
                <span className="text-sm font-semibold whitespace-nowrap">Home</span>
                <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
              </Link>
              
              {/* About */}
              <Link 
                to="/about" 
                className="group relative flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-500 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-110 active:scale-95"
              >
                <Info className="h-4 w-4 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
                <span className="text-sm font-semibold whitespace-nowrap">About</span>
                <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
              </Link>
              
              {/* Contact */}
              <Link 
                to="/contact" 
                className="group relative flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-500 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-110 active:scale-95"
              >
                <Phone className="h-4 w-4 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
                <span className="text-sm font-semibold whitespace-nowrap">Contact</span>
                <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
              </Link>
              
              {/* Pricing */}
              <Link 
                to="/pricing" 
                className="group relative flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-500 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-110 active:scale-95"
              >
                <Crown className="h-4 w-4 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
                <span className="text-sm font-semibold whitespace-nowrap">Pricing</span>
                <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
              </Link>
              
              {/* Give */}
              <Link 
                to="/funding" 
                className="group relative flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-500 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-110 active:scale-95"
              >
                <Heart className="h-4 w-4 text-orange-500 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 group-hover:text-white" />
                <span className="text-sm font-semibold whitespace-nowrap text-orange-500 group-hover:text-white">Give</span>
                <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
              </Link>
            </div>
            
            {/* Desktop Auth Button */}
            <div className="hidden lg:flex items-center">
              <Link to="/auth">
                <button className="group flex items-center space-x-2 bg-gradient-to-r from-primary to-primary/80 text-white px-8 py-3 rounded-full hover:from-primary/90 hover:to-primary/70 transition-all duration-500 hover:shadow-xl hover:shadow-primary/30 hover:scale-110 active:scale-95">
                  <div className="flex items-center space-x-1">
                    <LogIn className="h-4 w-4 transition-transform duration-500 group-hover:scale-125" />
                    <UserPlus className="h-4 w-4 transition-transform duration-500 group-hover:scale-125" />
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap">Sign In/Up</span>
                </button>
              </Link>
            </div>

            {/* Enhanced Mobile Menu Button - Centered and Bigger */}
            <div className="lg:hidden flex items-center justify-center w-full">
              {/* Mobile Menu Button - Big and Centered */}
              <button
                onClick={toggleMobileMenu}
                className="group relative p-6 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 transition-all duration-500 hover:scale-125 shadow-lg hover:shadow-xl"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/30 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {isMobileMenuOpen ? (
                  <X className="relative h-8 w-8 text-primary transition-all duration-500 group-hover:rotate-90" />
                ) : (
                  <Menu className="relative h-8 w-8 text-primary transition-all duration-500 group-hover:rotate-180" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 py-6 px-4 animate-sacred-fade-in">
            {/* Enhanced glowing border effect for mobile */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/20 via-transparent to-white/20 opacity-60"></div>
            
            {/* Centered Bible Aura Text */}
            <div className="relative flex items-center justify-center mb-6 pb-4 border-b border-primary/20">
              <span className="text-2xl font-divine text-primary">✦Bible Aura</span>
            </div>
            
            <div className="relative flex flex-col space-y-3">
              {/* Enhanced Mobile Navigation Items */}
              <Link 
                to="/" 
                onClick={closeMobileMenu}
                className="group relative flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-500 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-105 active:scale-95"
              >
                <Home className="h-5 w-5 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
                <span className="text-base font-semibold">Home</span>
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Link>
              
              <Link 
                to="/about" 
                onClick={closeMobileMenu}
                className="group relative flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-500 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-105 active:scale-95"
              >
                <Info className="h-5 w-5 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
                <span className="text-base font-semibold">About</span>
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Link>
              
              <Link 
                to="/contact" 
                onClick={closeMobileMenu}
                className="group relative flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-500 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-105 active:scale-95"
              >
                <Phone className="h-5 w-5 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
                <span className="text-base font-semibold">Contact</span>
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Link>
              
              <Link 
                to="/pricing" 
                onClick={closeMobileMenu}
                className="group relative flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-500 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-105 active:scale-95"
              >
                <Crown className="h-5 w-5 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
                <span className="text-base font-semibold">Pricing</span>
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Link>
              
              <Link 
                to="/funding" 
                onClick={closeMobileMenu}
                className="group relative flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-500 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-105 active:scale-95"
              >
                <Heart className="h-5 w-5 text-orange-500 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 group-hover:text-white" />
                <span className="text-base font-semibold text-orange-500 group-hover:text-white">Give</span>
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Link>

              {/* Enhanced Mobile Auth Button */}
              <div className="border-t border-gradient-to-r from-primary/20 to-primary/10 pt-4 mt-4">
                <Link to="/auth" onClick={closeMobileMenu}>
                  <button className="group relative flex items-center justify-center space-x-3 bg-gradient-to-r from-primary to-primary/80 text-white px-8 py-4 rounded-2xl hover:from-primary/90 hover:to-primary/70 transition-all duration-500 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95 w-full">
                    <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center space-x-2">
                      <LogIn className="h-5 w-5 transition-all duration-500 group-hover:scale-125" />
                      <UserPlus className="h-5 w-5 transition-all duration-500 group-hover:scale-125" />
                    </div>
                    <span className="relative text-base font-bold">Sign In/Up</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            About <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">✦Bible Aura</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transforming spiritual journeys through AI-powered biblical insights, connecting believers worldwide with the timeless wisdom of Scripture.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <Card className="border-2 border-orange-100 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-4">
                <Target className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed text-center">
                To democratize biblical wisdom by making profound spiritual insights accessible to everyone, 
                regardless of their theological background, through innovative AI technology that respects 
                the sacred nature of Scripture while enhancing understanding and personal growth.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-100 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white mb-4">
                <Lightbulb className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed text-center">
                To become the world's most trusted platform for AI-enhanced biblical study, fostering 
                a global community where faith and technology unite to deepen spiritual understanding 
                and transform lives through the power of God's Word.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* About Me Section */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-8 mb-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Profile Image */}
              <div className="text-center md:text-left">
                <div className="relative inline-block">
                  <img 
                    src="/benaiah.jpg" 
                    alt="Benaiah Nicholas Nimal" 
                    className="w-64 h-64 rounded-2xl object-cover shadow-2xl mx-auto md:mx-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-transparent rounded-2xl"></div>
                </div>
              </div>
              
              {/* About Text */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">About Me</h2>
                <h3 className="text-xl font-semibold text-orange-600 mb-4">Benaiah Nicholas Nimal</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  I'm a passionate developer and believer who saw the incredible potential of combining cutting-edge AI technology with biblical wisdom. My journey in software development, coupled with a deep love for Scripture, inspired me to create Bible Aura.
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  With a background in AI development and theological research, I've dedicated myself to building tools that make biblical insights more accessible to believers worldwide. My vision is to bridge the gap between ancient wisdom and modern technology.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  When I'm not coding or studying Scripture, I enjoy exploring how technology can serve the global Christian community and create meaningful spiritual experiences for people from all walks of life.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Our Values</h2>
          <p className="text-gray-600 text-center mb-12">The principles that guide everything we do</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white mb-4">
                    <value.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>





        {/* Technology Section */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Powered by Advanced Technology</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white mb-4">
                <Brain className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI & Machine Learning</h3>
              <p className="text-gray-600 text-sm">Advanced natural language processing for biblical text analysis</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white mb-4">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Theological Database</h3>
              <p className="text-gray-600 text-sm">Comprehensive theological knowledge base with scholarly insights</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white mb-4">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Conversational AI</h3>
              <p className="text-gray-600 text-sm">Interactive chat system for personalized biblical guidance</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Mission</h2>
          <p className="text-gray-600 mb-8">Be part of a community that's transforming how we study and understand Scripture</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3" asChild>
              <Link to="/auth">
                <Star className="mr-2 h-5 w-5" />
                Start Your Journey
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50 px-8 py-3" asChild>
              <Link to="/contact">
                <MessageCircle className="mr-2 h-5 w-5" />
                Get in Touch
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 