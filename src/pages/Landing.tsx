import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Star, BookOpen, MessageCircle, PenTool, Sparkles, Heart, Users, Crown, Zap, Home, Info, DollarSign, Quote, Phone, LogIn, UserPlus, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-spiritual.jpg";

const Landing = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Floating Curved Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/95 backdrop-blur-xl rounded-full shadow-2xl border border-white/20 px-8 py-4 transition-all duration-300 hover:shadow-3xl hover:scale-105">
          {/* Glowing border effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative flex items-center justify-between">
            {/* Enhanced Logo */}
            <div className="flex items-center space-x-3 px-3 py-2 rounded-full transition-all duration-300 hover:bg-primary/5">
              <div className="relative">
                <img 
                  src="/✦Bible Aura.svg" 
                  alt="Bible Aura" 
                  className="h-9 w-9 animate-sacred-glow transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              </div>
              <span className="text-xl font-divine text-primary hidden sm:block transition-all duration-300 hover:text-primary/80">✦Bible Aura</span>
            </div>
            
            {/* Enhanced Desktop Navigation Items */}
            <div className="hidden lg:flex items-center space-x-2">
              {/* Home */}
              <a 
                href="#home" 
                className="group relative flex items-center space-x-2 px-5 py-2.5 rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-105"
              >
                <Home className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="text-sm font-semibold">Home</span>
                <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              </a>
              
              {/* Features */}
              <a 
                href="#features" 
                className="group relative flex items-center space-x-2 px-5 py-2.5 rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-105"
              >
                <Sparkles className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="text-sm font-semibold">Features</span>
                <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              </a>
              
              {/* Pricing */}
              <Link 
                to="/pricing" 
                className="group relative flex items-center space-x-2 px-5 py-2.5 rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-105"
              >
                <DollarSign className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="text-sm font-semibold">Pricing</span>
                <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              </Link>
              
              {/* Testimonials */}
              <a 
                href="#testimonials" 
                className="group relative flex items-center space-x-2 px-5 py-2.5 rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-105"
              >
                <Quote className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="text-sm font-semibold">Reviews</span>
                <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              </a>
              
              {/* Contact */}
              <Link 
                to="/contact" 
                className="group relative flex items-center space-x-2 px-5 py-2.5 rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-105"
              >
                <Phone className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="text-sm font-semibold">Contact</span>
                <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              </Link>
            </div>
            
            {/* Desktop Auth Button */}
            <div className="hidden lg:flex items-center">
              <Link to="/auth">
                <button className="group flex items-center space-x-2 bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-2.5 rounded-full hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-105">
                  <UserPlus className="h-4 w-4 transition-transform group-hover:scale-110" />
                  <span className="text-sm font-semibold">Get Started</span>
                </button>
              </Link>
            </div>

            {/* Enhanced Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={toggleMobileMenu}
                className="group relative p-3 rounded-full hover:bg-primary/10 transition-all duration-300 hover:scale-110"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {isMobileMenuOpen ? (
                  <X className="relative h-5 w-5 text-primary transition-all duration-300 group-hover:rotate-90" />
                ) : (
                  <Menu className="relative h-5 w-5 text-primary transition-all duration-300 group-hover:rotate-180" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 bg-white/98 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 py-6 px-4 animate-sacred-fade-in">
            {/* Glowing border effect for mobile */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-primary/10 via-transparent to-primary/10 opacity-50"></div>
            
            <div className="relative flex flex-col space-y-3">
              {/* Enhanced Mobile Navigation Items */}
              <a 
                href="#home" 
                onClick={closeMobileMenu}
                className="group relative flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-105"
              >
                <Home className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="text-sm font-semibold">Home</span>
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
              
              <a 
                href="#features" 
                onClick={closeMobileMenu}
                className="group relative flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-105"
              >
                <Sparkles className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="text-sm font-semibold">Features</span>
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
              
              <Link 
                to="/pricing" 
                onClick={closeMobileMenu}
                className="group relative flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-105"
              >
                <DollarSign className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="text-sm font-semibold">Pricing</span>
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <a 
                href="#testimonials" 
                onClick={closeMobileMenu}
                className="group relative flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-105"
              >
                <Quote className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="text-sm font-semibold">Reviews</span>
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
              
              <Link 
                to="/contact" 
                onClick={closeMobileMenu}
                className="group relative flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-105"
              >
                <Phone className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="text-sm font-semibold">Contact</span>
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

              {/* Enhanced Mobile Auth Button */}
              <div className="border-t border-gradient-to-r from-primary/20 to-primary/10 pt-4 mt-4">
                <Link to="/auth" onClick={closeMobileMenu}>
                  <button className="group relative flex items-center justify-center space-x-3 bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-4 rounded-2xl hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 w-full">
                    <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <UserPlus className="relative h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                    <span className="relative text-base font-bold">Get Started</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen bg-aura-gradient overflow-hidden">
        {/* Animated Background Particles */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full animate-celestial-float opacity-60"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full animate-celestial-float opacity-40" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 left-1/4 w-3 h-3 bg-white rounded-full animate-celestial-float opacity-30" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-white rounded-full animate-celestial-float opacity-50" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-32 right-20 w-2 h-2 bg-white rounded-full animate-celestial-float opacity-35" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        {/* Hero Background Image */}
        <img 
          src={heroImage} 
          alt="Spiritual background" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20 animate-divine-breathe"
        />
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-divine text-white mb-4 animate-sacred-fade-in">
                ✦Bible Aura
              </h1>
              <p className="text-2xl md:text-3xl text-white/90 font-sacred animate-sacred-fade-in" style={{animationDelay: '0.2s'}}>
                AI-Powered Biblical Insight
              </p>
              <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto animate-sacred-fade-in" style={{animationDelay: '0.4s'}}>
                Transform your spiritual journey with personalized biblical insights, AI-powered sermon preparation, and divine wisdom at your fingertips.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-sacred-fade-in" style={{animationDelay: '0.6s'}}>
              <Link to="/auth">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 animate-divine-pulse">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Free
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-6"
              >
                <Heart className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            
            <div className="flex items-center justify-center space-x-6 text-white/80 animate-sacred-fade-in" style={{animationDelay: '0.8s'}}>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">10,000+ Believers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm">4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4" />
                <span className="text-sm">Trusted by Pastors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-divine text-gray-900 mb-4">
              Powerful Features for Your Faith Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how Bible Aura transforms your spiritual growth with cutting-edge AI technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="group hover:shadow-spiritual transition-all duration-500 border-2 hover:border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-8 w-8 text-primary animate-divine-pulse" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Topic-Based Verses with AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Get personalized biblical insights on any topic with our advanced AI that understands context and provides deep spiritual analysis.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Contextual verse recommendations</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Deep theological insights</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Multiple Bible translations</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group hover:shadow-spiritual transition-all duration-500 border-2 hover:border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <MessageCircle className="h-8 w-8 text-primary animate-divine-pulse" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Sermon Generator & Preparation
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Create powerful sermons with AI assistance. Get outlines, supporting verses, and illustrations tailored to your congregation.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Custom sermon outlines</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Supporting scripture suggestions</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Practical illustrations</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group hover:shadow-spiritual transition-all duration-500 border-2 hover:border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <PenTool className="h-8 w-8 text-primary animate-divine-pulse" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Personal Journal & Prayer Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Document your spiritual journey with intelligent journaling and prayer tracking that helps you grow in faith.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Smart journal prompts</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Prayer request management</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Spiritual growth insights</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-divine text-gray-900 mb-4">
              Choose Your Spiritual Journey Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start your faith journey today with a plan that fits your needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="relative border-2 hover:border-primary/20 transition-all duration-500">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Free</CardTitle>
                <div className="text-4xl font-bold text-primary mb-2">LKR 0</div>
                <p className="text-gray-600">Perfect to get started</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>5 AI verse analyses per month</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Basic journaling</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Daily verse</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Community access</span>
                  </div>
                </div>
                <Link to="/auth" className="block">
                  <Button className="w-full mt-8" variant="outline">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Seeker Plan */}
            <Card className="relative border-2 border-primary shadow-spiritual">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1">
                Most Popular
              </Badge>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Seeker</CardTitle>
                <div className="text-4xl font-bold text-primary mb-2">LKR 2,500</div>
                <p className="text-gray-600">For dedicated believers</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>2,500 AI credits</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Advanced sermon tools</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Prayer tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Topical studies</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Email support</span>
                  </div>
                </div>
                <Link to="/auth" className="block">
                  <Button className="w-full mt-8 bg-primary hover:bg-primary/90">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 hover:border-primary/20 transition-all duration-500">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Pro</CardTitle>
                <div className="text-4xl font-bold text-primary mb-2">LKR 5,000</div>
                <p className="text-gray-600">For pastors & leaders</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Unlimited AI access</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Premium sermon library</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Advanced analytics</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Custom integrations</span>
                  </div>
                </div>
                <Link to="/auth" className="block">
                  <Button className="w-full mt-8" variant="outline">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-divine text-gray-900 mb-4">
              Trusted by Believers Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See how Bible Aura is transforming spiritual journeys
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="border-2 hover:border-primary/20 transition-all duration-500">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "Bible Aura has revolutionized my sermon preparation. The AI insights are incredibly deep and help me connect with my congregation in ways I never imagined."
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">PS</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Pastor Samuel</div>
                    <div className="text-gray-500 text-sm">Grace Community Church</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-2 hover:border-primary/20 transition-all duration-500">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "The journaling feature has deepened my relationship with God. The AI prompts help me reflect in ways that bring real spiritual growth."
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">MJ</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Mary Johnson</div>
                    <div className="text-gray-500 text-sm">Small Group Leader</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border-2 hover:border-primary/20 transition-all duration-500">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "As a youth pastor, I love how Bible Aura helps me find relevant verses and create engaging content that speaks to today's generation."
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">DM</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">David Martinez</div>
                    <div className="text-gray-500 text-sm">Youth Pastor</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="contact" className="py-20 bg-aura-gradient">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-divine text-white mb-6">
            Join Thousands of Believers Growing in Faith
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Start your spiritual transformation today with AI-powered biblical insights and community support.
          </p>
          
          <div className="max-w-md mx-auto mb-8">
            <div className="flex space-x-2">
              <Input 
                placeholder="Enter your email" 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              <Button className="bg-white text-primary hover:bg-white/90 whitespace-nowrap">
                Get Started
              </Button>
            </div>
          </div>
          
          <Link to="/auth">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 animate-divine-pulse">
              <Zap className="mr-2 h-5 w-5" />
              Start Your Free Trial
            </Button>
          </Link>
          
          <p className="text-white/70 text-sm mt-4">
            No credit card required • Start with 5 free AI analyses
          </p>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-20 w-32 h-32 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
          {/* Enhanced Grid Layout for single line titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 lg:gap-12">
            
            {/* Brand Section - Enhanced */}
            <div className="col-span-1 lg:col-span-2 xl:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <img 
                    src="/✦Bible Aura.svg" 
                    alt="✦Bible Aura" 
                    className="h-12 w-12 drop-shadow-lg"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                    ✦Bible Aura
                  </span>
                  <p className="text-orange-300 text-sm font-medium">AI-Powered Biblical Insight</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
                Transforming spiritual journeys through divine AI-powered biblical insights, 
                theological guidance, and sacred study tools for modern believers.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center space-x-4">
                <a 
                  href="https://instagram.com/bible_aura.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-400 hover:text-orange-400 transition-colors duration-300 group"
                >
                  <div className="p-2 rounded-full bg-gray-800 group-hover:bg-orange-500/20 transition-colors duration-300">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium">@bible_aura.ai</span>
                </a>
              </div>
            </div>
            
            {/* Company Section - Single Line Optimized */}
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-orange-400 mb-6 whitespace-nowrap border-b border-orange-500/30 pb-2">
                Company
              </h3>
                           <div className="space-y-4">
               <Link to="/about" className="block text-gray-300 hover:text-orange-400 transition-colors duration-300 py-1 whitespace-nowrap">
                 About
               </Link>
               <Link to="/funding" className="block text-gray-300 hover:text-orange-400 transition-colors duration-300 py-1 whitespace-nowrap">
                 Fundings
               </Link>
               <Link to="/contact" className="block text-gray-300 hover:text-orange-400 transition-colors duration-300 py-1 whitespace-nowrap">
                 Contact
               </Link>
             </div>
            </div>
            
            {/* Contact Section - Enhanced */}
            <div className="col-span-1 lg:col-span-2 xl:col-span-1">
              <h3 className="text-lg font-bold text-orange-400 mb-6 whitespace-nowrap border-b border-orange-500/30 pb-2">
                Contact
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 group">
                  <div className="p-2 rounded-full bg-gray-800 group-hover:bg-orange-500/20 transition-colors duration-300">
                    <svg className="h-4 w-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <a 
                    href="mailto:bibleinsightai.contact@gmail.com" 
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-300 text-sm break-all"
                  >
                    bibleinsightai.contact@gmail.com
                  </a>
                </div>
                
                <div className="flex items-center space-x-3 group">
                  <div className="p-2 rounded-full bg-gray-800 group-hover:bg-orange-500/20 transition-colors duration-300">
                    <Phone className="h-4 w-4 text-orange-400" />
                  </div>
                  <a 
                    href="tel:+94769197386" 
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-300 text-sm whitespace-nowrap"
                  >
                    +94 769 197 386
                  </a>
                </div>
              </div>
            </div>
            
            {/* Newsletter Section - Enhanced */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-1">
              <h3 className="text-lg font-bold text-orange-400 mb-6 whitespace-nowrap border-b border-orange-500/30 pb-2">
                Stay Connected
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Get spiritual insights and updates delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input 
                  type="email" 
                  placeholder="Enter email" 
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-orange-500 transition-colors duration-300 flex-1"
                />
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold whitespace-nowrap">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
          
          {/* Enhanced Bottom Section */}
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-gray-400 text-sm">
                <p>&copy; 2024 ✦Bible Aura. All rights reserved.</p>
                               <div className="flex items-center space-x-4">
                 <Link to="/privacy" className="hover:text-orange-400 transition-colors duration-300">Privacy Policy</Link>
                 <span>•</span>
                 <Link to="/terms" className="hover:text-orange-400 transition-colors duration-300">Terms of Service</Link>
               </div>
              </div>
              
              {/* Developer Credit - Enhanced */}
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <span>Developed by</span>
                <span className="text-orange-400 font-semibold">Benaiah Nicholas Nimal</span>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 