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
      {/* Enhanced Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-7xl px-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-full shadow-2xl border border-white/20 px-6 lg:px-12 py-4 transition-all duration-500 hover:shadow-3xl hover:scale-[1.02]">
          {/* Glowing border effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative flex items-center justify-between">
                          {/* Desktop Layout */}
              <div className="hidden lg:flex items-center justify-between w-full">
                {/* Left - Logo */}
                <div className="flex items-center">
                  <span className="text-3xl font-divine text-primary whitespace-nowrap font-bold">✦Bible Aura</span>
                </div>

                {/* Center - Navigation Items */}
                <div className="flex items-center space-x-2">
                  <a 
                    href="#home" 
                    className="group relative flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-500 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-110 active:scale-95"
                  >
                    <Home className="h-4 w-4 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
                    <span className="text-sm font-semibold whitespace-nowrap">Home</span>
                  </a>

                  <Link 
                    to="/about"
                    className="group relative flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-500 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-110 active:scale-95"
                  >
                    <Info className="h-4 w-4 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
                    <span className="text-sm font-semibold whitespace-nowrap">About</span>
                  </Link>

                  <Link 
                    to="/contact"
                    className="group relative flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-500 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-110 active:scale-95"
                  >
                    <Phone className="h-4 w-4 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
                    <span className="text-sm font-semibold whitespace-nowrap">Contact</span>
                  </Link>

                  <Link 
                    to="/pricing"
                    className="group relative flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-500 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-110 active:scale-95"
                  >
                    <Crown className="h-4 w-4 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
                    <span className="text-sm font-semibold whitespace-nowrap">Pricing</span>
                  </Link>

                  <Link 
                    to="/funding"
                    className="group relative flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-500 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-110 active:scale-95"
                  >
                    <Heart className="h-4 w-4 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
                    <span className="text-sm font-semibold whitespace-nowrap">Support Us</span>
                  </Link>
                </div>

                {/* Right - Auth Button */}
                <div className="flex items-center">
                  <Link to="/auth">
                    <button className="group flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-500 hover:shadow-xl hover:shadow-orange-300/30 hover:scale-110 active:scale-95">
                      <div className="flex items-center space-x-1">
                        <LogIn className="h-4 w-4 transition-transform duration-500 group-hover:scale-125" />
                        <UserPlus className="h-4 w-4 transition-transform duration-500 group-hover:scale-125" />
                      </div>
                      <span className="text-sm font-semibold whitespace-nowrap">Sign In/Up</span>
                    </button>
                  </Link>
                </div>
              </div>

            {/* Mobile Layout */}
            <div className="lg:hidden flex items-center justify-between w-full">
              {/* Big Centered Logo */}
              <div className="flex-1 flex justify-center">
                <span className="text-xl sm:text-2xl font-divine text-primary whitespace-nowrap font-bold">✦Bible Aura</span>
              </div>
              
              {/* Mobile Hamburger Menu */}
              <button
                onClick={toggleMobileMenu}
                className="relative p-3 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-500 group"
              >
                <div className="relative w-6 h-6 flex items-center justify-center">
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6 text-primary transition-all duration-500 rotate-180" />
                  ) : (
                    <Menu className="h-6 w-6 text-primary transition-all duration-500" />
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
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
              <a 
                href="#home" 
                onClick={closeMobileMenu}
                className="group relative flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-500 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-105 active:scale-95"
              >
                <Home className="h-5 w-5 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
                <span className="text-base font-semibold">Home</span>
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </a>
              
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
              

              
              {/* Mobile CTA Buttons */}
              <div className="border-t border-gradient-to-r from-primary/20 to-primary/10 pt-6 mt-6">
                <div className="flex space-x-3 w-full">
                  <Link to="/auth" onClick={closeMobileMenu} className="flex-1">
                    <button className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-3 rounded-full hover:from-primary/90 hover:to-primary/70 transition-all duration-500 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 w-full">
                      <Sparkles className="h-4 w-4 transition-all duration-500 group-hover:scale-125" />
                      <span className="text-sm font-semibold">Get Started</span>
                    </button>
                  </Link>
                  <Link to="/funding" onClick={closeMobileMenu} className="flex-1">
                    <button className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-500 hover:shadow-xl hover:shadow-orange-300/30 hover:scale-105 w-full">
                      <Heart className="h-4 w-4 transition-all duration-500 group-hover:scale-125" />
                      <span className="text-sm font-semibold">Support Us</span>
                    </button>
                  </Link>
                </div>
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
        
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-divine text-white mb-4 animate-sacred-fade-in">
                ✦Bible Aura
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl text-white font-sacred animate-sacred-fade-in" style={{animationDelay: '0.2s'}}>
                AI-Powered Biblical Insight
              </p>
              <p className="text-base sm:text-lg md:text-xl text-white max-w-3xl mx-auto animate-sacred-fade-in leading-relaxed" style={{animationDelay: '0.4s'}}>
                Transform your spiritual journey with personalized biblical insights, AI-powered sermon preparation, and divine wisdom at your fingertips.
              </p>
            </div>
            
            <div className="flex flex-row gap-3 sm:gap-4 justify-center items-center animate-sacred-fade-in" style={{animationDelay: '0.6s'}}>
              <Link to="/auth">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 animate-divine-pulse whitespace-nowrap font-semibold">
                  <Sparkles className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Get Started
                </Button>
              </Link>
              <Link to="/funding">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 whitespace-nowrap font-semibold"
                >
                  <Heart className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Support Us
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-center text-white text-sm sm:text-base animate-sacred-fade-in" style={{animationDelay: '0.8s'}}>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base font-semibold whitespace-nowrap">AI Insights</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base font-semibold whitespace-nowrap">All in one Bible</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base font-semibold whitespace-nowrap">AI Chat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transform Your Bible Study Experience Section */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-2">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-orange-500"></div>
              <Zap className="h-6 w-6 text-orange-500" />
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-orange-500"></div>
            </div>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Transform Your 
            <span className="block text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">
              Bible Study Experience
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of believers worldwide who are growing deeper in their faith with Bible Aura's AI-powered spiritual tools.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-12">
            <div className="flex flex-col items-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="p-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Analysis</h3>
              <p className="text-gray-600 text-center text-sm">Get instant insights and context for any Bible verse</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="p-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mb-4">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI Companion</h3>
              <p className="text-gray-600 text-center text-sm">Chat with our AI for spiritual guidance and questions</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="p-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full mb-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Study Tools</h3>
              <p className="text-gray-600 text-center text-sm">Access comprehensive Bible study resources</p>
            </div>
          </div>
          
          <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-3xl p-8 sm:p-12 text-white mb-8 overflow-hidden shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="h-full w-full bg-white/5 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:24px_24px]" />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute top-6 right-6 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-6 left-6 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
            
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-white mr-3" />
                <span className="text-white/80 text-sm font-medium uppercase tracking-wider">Start Your Journey</span>
              </div>
              
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Transform Your Spiritual Life
                <span className="block text-orange-100">
                  with AI-Powered Insights
                </span>
              </h3>
              
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Start your spiritual transformation today with AI-powered biblical insights and community support.
              </p>
              
              <div className="max-w-lg mx-auto mb-8">
                <div className="flex space-x-3">
                  <Input 
                    placeholder="Enter your email for magic link" 
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70 backdrop-blur-md flex-1 py-4 text-lg rounded-xl focus:bg-white/25 transition-all"
                  />
                  <Button className="bg-white text-orange-600 hover:bg-orange-50 whitespace-nowrap font-bold py-4 px-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                    Send Link
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-center items-center mb-6">
                <Link to="/auth">
                  <Button size="lg" className="bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-orange-600 text-xl px-10 py-5 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full">
                    <Sparkles className="mr-3 h-6 w-6" />
                    Start Your Free Trial
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center justify-center space-x-6 text-white/80 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>5 free AI analyses</span>
              </div>
              <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Showcase Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-orange-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-orange-200 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0s', animationDuration: '6s'}}></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-blue-200 rounded-full opacity-30 animate-bounce" style={{animationDelay: '2s', animationDuration: '8s'}}></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-purple-200 rounded-full opacity-15 animate-bounce" style={{animationDelay: '4s', animationDuration: '10s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Enhanced Header Section */}
          <div className="text-center mb-16 relative">
            {/* Floating Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-10 left-10 w-16 h-16 bg-orange-500/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute top-20 right-20 w-12 h-12 bg-blue-500/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-10 left-1/4 w-18 h-18 bg-purple-500/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>

            {/* Enhanced Title Section */}
            <div className="relative z-10 animate-fade-in-up">
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
                  <div className="relative">
                    <Sparkles className="h-6 w-6 text-orange-500 animate-pulse" />
                    <div className="absolute inset-0 h-6 w-6 bg-orange-500/20 rounded-full blur-md"></div>
                  </div>
                  <div className="w-16 h-px bg-gradient-to-l from-transparent via-orange-500 to-transparent"></div>
                </div>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Powerful{" "}
                <span className="relative inline-block">
                  <span className="text-transparent bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 bg-clip-text animate-gradient">
                    AI-Powered
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-orange-500/40 via-red-500/40 to-purple-600/40 rounded-full blur-sm"></div>
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 rounded-full"></div>
                </span>
                <br />
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Features
                </span>
              </h2>
              
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
                Transform your spiritual journey with cutting-edge AI technology and comprehensive Bible study tools designed for modern believers
              </p>
              
              {/* Feature Stats */}
              <div className="flex flex-wrap justify-center gap-6 mt-8">
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-orange-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 font-semibold text-sm">50+ Bible Translations</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-blue-100">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 font-semibold text-sm">24/7 AI Assistant</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-purple-100">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 font-semibold text-sm">Advanced Analytics</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Main Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
            
            {/* Feature 1 - AI Bible Analysis */}
            <div className="group relative h-full">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-orange-400/15 to-red-500/20 rounded-2xl transform rotate-1 group-hover:rotate-2 group-hover:scale-105 transition-all duration-700 blur-sm"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl transform -rotate-1 group-hover:-rotate-2 group-hover:scale-105 transition-all duration-700 delay-75"></div>
              
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-700 h-full flex flex-col border border-orange-100/50 group-hover:border-orange-200 overflow-hidden">
                
                {/* Floating Particles */}
                <div className="absolute top-4 right-4 w-1 h-1 bg-orange-400 rounded-full animate-float opacity-60"></div>
                <div className="absolute bottom-8 left-6 w-0.5 h-0.5 bg-orange-300 rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
                
                {/* Enhanced Icon */}
                <div className="text-center mb-6">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 via-orange-500 to-red-600 rounded-2xl shadow-xl group-hover:shadow-orange-300/50 group-hover:scale-110 transition-all duration-700 mb-4">
                    <BookOpen className="h-8 w-8 text-white" />
                    <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  
                  <Badge className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 shadow-sm">
                    Advanced AI
                  </Badge>
                </div>

                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
                    AI Bible Analysis
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Deep contextual insights and theological understanding for every Bible verse with advanced AI-powered analysis
                  </p>
                </div>

                {/* Enhanced Features List */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 bg-orange-50/50 rounded-lg p-2 group-hover:bg-orange-50 transition-colors duration-300">
                    <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-2 w-2 text-white font-bold" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">Contextual verse recommendations</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-orange-50/50 rounded-lg p-2 group-hover:bg-orange-50 transition-colors duration-300">
                    <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-2 w-2 text-white font-bold" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">50+ Bible translations</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-orange-50/50 rounded-lg p-2 group-hover:bg-orange-50 transition-colors duration-300">
                    <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-2 w-2 text-white font-bold" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">Cross-reference suggestions</span>
                  </div>
                </div>

                {/* Enhanced Highlight */}
                <div className="bg-gradient-to-r from-orange-50 via-orange-100 to-red-50 rounded-xl p-4 border border-orange-200/50 shadow-inner">
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="h-3 w-3 text-orange-500 animate-pulse" />
                    <span className="text-orange-700 font-bold text-center text-xs">Instant analysis in 50+ languages</span>
                    <Star className="h-3 w-3 text-orange-500 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 - AI Chat Assistant */}
            <div className="group relative h-full">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-blue-400/15 to-purple-500/20 rounded-2xl transform -rotate-1 group-hover:-rotate-2 group-hover:scale-105 transition-all duration-700 blur-sm"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl transform rotate-1 group-hover:rotate-2 group-hover:scale-105 transition-all duration-700 delay-75"></div>
              
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-700 h-full flex flex-col border border-blue-100/50 group-hover:border-blue-200 overflow-hidden">
                
                {/* Floating Particles */}
                <div className="absolute top-6 left-4 w-1 h-1 bg-blue-400 rounded-full animate-float opacity-60"></div>
                <div className="absolute bottom-12 right-6 w-0.5 h-0.5 bg-blue-300 rounded-full animate-float opacity-40" style={{animationDelay: '1.5s'}}></div>
                
                {/* Enhanced Icon */}
                <div className="text-center mb-6">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 rounded-2xl shadow-xl group-hover:shadow-blue-300/50 group-hover:scale-110 transition-all duration-700 mb-4">
                    <MessageCircle className="h-8 w-8 text-white" />
                    <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  
                  <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 shadow-sm">
                    24/7 Available
                  </Badge>
                </div>

                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    AI Chat Assistant
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Meaningful conversations about faith and theology with our biblically-trained AI companion
                  </p>
                </div>

                {/* Enhanced Features List */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 bg-blue-50/50 rounded-lg p-2 group-hover:bg-blue-50 transition-colors duration-300">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-2 w-2 text-white font-bold" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">Biblical Q&A support</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-blue-50/50 rounded-lg p-2 group-hover:bg-blue-50 transition-colors duration-300">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-2 w-2 text-white font-bold" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">Personal spiritual guidance</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-blue-50/50 rounded-lg p-2 group-hover:bg-blue-50 transition-colors duration-300">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-2 w-2 text-white font-bold" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">Scripture memorization help</span>
                  </div>
                </div>

                {/* Enhanced Highlight */}
                <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-purple-50 rounded-xl p-4 border border-blue-200/50 shadow-inner">
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="h-3 w-3 text-blue-500 animate-pulse" />
                    <span className="text-blue-700 font-bold text-center text-xs">24/7 biblical companion</span>
                    <Star className="h-3 w-3 text-blue-500 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 - Smart Study Tools */}
            <div className="group relative h-full">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-purple-400/15 to-pink-500/20 rounded-2xl transform rotate-1 group-hover:rotate-2 group-hover:scale-105 transition-all duration-700 blur-sm"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl transform -rotate-1 group-hover:-rotate-2 group-hover:scale-105 transition-all duration-700 delay-75"></div>
              
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-700 h-full flex flex-col border border-purple-100/50 group-hover:border-purple-200 overflow-hidden">
                
                {/* Floating Particles */}
                <div className="absolute top-8 right-6 w-1 h-1 bg-purple-400 rounded-full animate-float opacity-60"></div>
                <div className="absolute bottom-6 left-4 w-0.5 h-0.5 bg-purple-300 rounded-full animate-float opacity-40" style={{animationDelay: '2s'}}></div>
                
                {/* Enhanced Icon */}
                <div className="text-center mb-6">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 via-purple-500 to-pink-600 rounded-2xl shadow-xl group-hover:shadow-purple-300/50 group-hover:scale-110 transition-all duration-700 mb-4">
                    <Star className="h-8 w-8 text-white" />
                    <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  
                  <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 shadow-sm">
                    Comprehensive
                  </Badge>
                </div>

                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">
                    Smart Study Tools
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Complete suite of study resources including concordances, commentaries, and word studies
                  </p>
                </div>

                {/* Enhanced Features List */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 bg-purple-50/50 rounded-lg p-2 group-hover:bg-purple-50 transition-colors duration-300">
                    <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-2 w-2 text-white font-bold" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">Hebrew/Greek word studies</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-purple-50/50 rounded-lg p-2 group-hover:bg-purple-50 transition-colors duration-300">
                    <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-2 w-2 text-white font-bold" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">Historical context insights</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-purple-50/50 rounded-lg p-2 group-hover:bg-purple-50 transition-colors duration-300">
                    <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-2 w-2 text-white font-bold" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">Topical study generation</span>
                  </div>
                </div>

                {/* Enhanced Highlight */}
                <div className="bg-gradient-to-r from-purple-50 via-purple-100 to-pink-50 rounded-xl p-4 border border-purple-200/50 shadow-inner">
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="h-3 w-3 text-purple-500 animate-pulse" />
                    <span className="text-purple-700 font-bold text-center text-xs">Original language research</span>
                    <Star className="h-3 w-3 text-purple-500 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Secondary Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">

            {/* Feature 4 - Sermon Preparation */}
            <div className="group bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 rounded-2xl p-6 border-2 border-green-200/50 hover:border-green-300 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="h-full w-full bg-green-600 bg-[radial-gradient(circle_at_1px_1px,rgba(22,163,74,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">AI Sermon Prep</h4>
                    <p className="text-green-600 font-semibold text-sm">For Ministers</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                  Streamline sermon preparation with AI-assisted research and outline generation.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span className="font-medium text-sm">Automated outlines</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span className="font-medium text-sm">Scripture cross-references</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 5 - Reading Plans */}
            <div className="group bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 rounded-2xl p-6 border-2 border-emerald-200/50 hover:border-emerald-300 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="h-full w-full bg-emerald-600 bg-[radial-gradient(circle_at_1px_1px,rgba(5,150,105,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Reading Plans</h4>
                    <p className="text-emerald-600 font-semibold text-sm">Personalized</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                  AI-generated personalized Bible reading plans tailored to your goals.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Check className="h-3 w-3 text-emerald-500 mr-2 flex-shrink-0" />
                    <span className="font-medium text-sm">Progress tracking</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Check className="h-3 w-3 text-emerald-500 mr-2 flex-shrink-0" />
                    <span className="font-medium text-sm">Adaptive pacing</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 6 - Digital Journal */}
            <div className="group bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 rounded-2xl p-6 border-2 border-indigo-200/50 hover:border-indigo-300 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="h-full w-full bg-indigo-600 bg-[radial-gradient(circle_at_1px_1px,rgba(79,70,229,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 via-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <PenTool className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Digital Journal</h4>
                    <p className="text-indigo-600 font-semibold text-sm">Personal Growth</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                  Document your spiritual journey with intelligent journaling features.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Check className="h-3 w-3 text-indigo-500 mr-2 flex-shrink-0" />
                    <span className="font-medium text-sm">Prayer tracking</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Check className="h-3 w-3 text-indigo-500 mr-2 flex-shrink-0" />
                    <span className="font-medium text-sm">AI insights</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Call-to-Action */}
          <div className="text-center mt-16 animate-fade-in-up" style={{animationDelay: '0.7s'}}>
            <div className="relative bg-gradient-to-br from-orange-50 via-orange-100 to-red-50 rounded-2xl p-8 sm:p-10 shadow-xl border-2 border-orange-200/50 overflow-hidden">
              {/* Enhanced Background Effects */}
              <div className="absolute inset-0 opacity-10">
                <div className="h-full w-full bg-orange-600 bg-[radial-gradient(circle_at_1px_1px,rgba(251,146,60,0.3)_1px,transparent_0)] bg-[length:30px_30px]"></div>
              </div>
              <div className="absolute top-8 left-8 w-20 h-20 bg-orange-300/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-8 right-8 w-16 h-16 bg-red-300/20 rounded-full blur-2xl"></div>
              
              <div className="relative z-10 max-w-3xl mx-auto">
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
                    <div className="relative">
                      <Sparkles className="h-6 w-6 text-orange-500 animate-spin-slow" />
                      <div className="absolute inset-0 h-6 w-6 bg-orange-500/30 rounded-full blur-md"></div>
                    </div>
                    <div className="w-12 h-px bg-gradient-to-l from-transparent via-orange-500 to-transparent"></div>
                  </div>
                </div>
                
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  Ready to Transform Your{" "}
                  <span className="block text-transparent bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text animate-gradient">
                    Spiritual Journey?
                  </span>
                </h3>
                
                <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                  Join thousands of believers worldwide who are growing deeper in their faith with Bible Aura's AI-powered spiritual tools
                </p>
                
                <div className="flex justify-center mb-6">
                  <Link to="/auth">
                    <Button size="lg" className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 hover:from-orange-600 hover:via-red-600 hover:to-orange-700 text-white px-8 py-4 text-lg font-bold transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl rounded-full border-2 border-white/20">
                      <Sparkles className="mr-3 h-5 w-5" />
                      Start Your Journey Free
                      <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </Button>
                  </Link>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl px-6 py-3 border border-orange-200/50 shadow-lg inline-block">
                  <p className="text-orange-600 font-bold flex items-center justify-center space-x-2 text-sm">
                    <span>✨ No credit card required</span>
                    <span>•</span>
                    <span>Start with 5 free AI analyses</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Clean Footer */}
      <footer className="bg-black text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-3">
                <span className="text-orange-400">✦</span>Bible Aura
              </h3>
              <p className="text-gray-400 text-base leading-relaxed">
                AI-Powered Biblical Insight
              </p>
            </div>
            
            {/* Menu Section */}
            <div className="text-center md:text-left">
              <h4 className="text-xl font-semibold text-white mb-6">Menu</h4>
              <nav className="space-y-3">
                <Link to="/about" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300 text-base">
                  About
                </Link>
                <Link to="/pricing" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300 text-base">
                  Pricing
                </Link>
                <Link to="/funding" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300 text-base">
                  Support Us
                </Link>
                <Link to="/auth" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300 text-base">
                  Sign In
                </Link>
              </nav>
            </div>
            
            {/* Contact Section */}
            <div className="text-center md:text-left">
              <h4 className="text-xl font-semibold text-white mb-6">Contact</h4>
              <div className="space-y-3">
                <a 
                  href="https://www.instagram.com/bible_aura.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-gray-400 hover:text-orange-400 transition-colors duration-300 text-base"
                >
                  @bible_aura.ai
                </a>
                  <a 
                    href="mailto:bibleinsightai.contact@gmail.com" 
                  className="block text-gray-400 hover:text-orange-400 transition-colors duration-300 text-base"
                  >
                    bibleinsightai.contact@gmail.com
                  </a>
              </div>
            </div>

          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-gray-400">
              
              {/* Left - Legal Links */}
              <div className="text-center md:text-left">
                <Link to="/terms" className="hover:text-orange-400 transition-colors duration-300 text-sm">
                  Terms of Use
                </Link>
                <span className="mx-2">|</span>
                <Link to="/privacy" className="hover:text-orange-400 transition-colors duration-300 text-sm">
                  Privacy Policy
                </Link>
              </div>
              
              {/* Right - Copyright and Developer */}
              <div className="text-center md:text-right text-sm">
                <span>&copy; 2024 <span className="text-orange-400">✦</span>Bible Aura. All rights reserved.</span>
                <span className="block md:inline md:ml-2">
                  Developed by{" "}
                  <a 
                    href="https://www.instagram.com/benaiah_4?igsh=cGZuYmI2YWw0d25r" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:text-orange-300 transition-colors duration-300 underline"
                  >
                    Benaiah Nicholas Nimal
                  </a>
                </span>
              </div>
              
            </div>
          </div>
          
        </div>
      </footer>
    </div>
  );
};

export default Landing; 