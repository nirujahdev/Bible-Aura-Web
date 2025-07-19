import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Clock, ArrowLeft, MessageCircle, Globe, Instagram, Home, Info, Crown, Heart, LogIn, UserPlus, Menu, X, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Contact = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us a message anytime",
      contact: "bibleinsightai.contact@gmail.com",
      action: "mailto:bibleinsightai.contact@gmail.com",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak with our team",
      contact: "+94 769 197 386",
      action: "tel:+94769197386",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Instagram,
      title: "Follow Us",
      description: "Connect on social media",
      contact: "@bible_aura.ai",
      action: "https://instagram.com/bible_aura.ai",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Globe,
      title: "Visit Website",
      description: "Explore our platform",
      contact: "bibleaura.com",
      action: "https://bibleaura.com",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const faqItems = [
    {
      question: "How quickly do you respond to messages?",
      answer: "We typically respond to all inquiries within 24 hours during business days."
    },
    {
      question: "Do you offer technical support?",
      answer: "Yes, we provide comprehensive technical support for all our users through email and chat."
    },
    {
      question: "Can I schedule a demo?",
      answer: "Absolutely! Contact us to schedule a personalized demo of Bible Aura's features."
    },
    {
      question: "Do you offer partnership opportunities?",
      answer: "We're always open to discussing partnerships with churches, ministries, and educational institutions."
    }
  ];

  return (
    <div className="min-h-screen bg-background w-full max-w-none">
      {/* Enhanced Floating Curved Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full px-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-full shadow-2xl border border-white/20 px-6 lg:px-12 py-4 transition-all duration-500 hover:shadow-3xl hover:scale-[1.02] lg:min-w-[800px]">
          {/* Glowing border effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative flex items-center justify-between">
            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-between w-full">
              {/* Left - Logo */}
              <div className="flex items-center">
                <span className="text-xl font-divine text-primary whitespace-nowrap font-bold">✦Bible Aura</span>
              </div>

              {/* Center - Navigation Items */}
              <div className="flex items-center space-x-2">
                <a 
                  href="/" 
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
                    to="/careers"
                    className="group relative flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-500 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-110 active:scale-95"
                  >
                    <Crown className="h-4 w-4 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
                    <span className="text-sm font-semibold whitespace-nowrap">Careers</span>
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
            <div className="lg:hidden flex items-center justify-center w-full relative">
              {/* Logo - Centered */}
              <div className="flex items-center">
                <span className="text-lg sm:text-xl font-divine text-primary font-bold">✦Bible Aura</span>
              </div>

              {/* Mobile Menu Button - Absolute Right */}
              <button
                onClick={toggleMobileMenu}
                className="absolute right-0 h-9 w-9 sm:h-10 sm:w-10 p-0 hover:bg-primary/10 rounded-full flex items-center justify-center transition-colors z-10"
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                ) : (
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/30 overflow-hidden z-40 mx-2 sm:mx-4">
            <div className="py-3 sm:py-4">
              {/* Navigation Items */}
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="flex items-center space-x-4 px-5 sm:px-6 py-3 sm:py-4 text-gray-700 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-[1.02] rounded-lg mx-2"
              >
                <Home className="h-5 w-5 text-primary" />
                <span className="font-semibold text-base sm:text-lg">Home</span>
              </Link>
              
              <Link
                to="/about"
                onClick={closeMobileMenu}
                className="flex items-center space-x-4 px-5 sm:px-6 py-3 sm:py-4 text-gray-700 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-[1.02] rounded-lg mx-2"
              >
                <Info className="h-5 w-5 text-primary" />
                <span className="font-semibold text-base sm:text-lg">About</span>
              </Link>
              
              <Link
                to="/contact"
                onClick={closeMobileMenu}
                className="flex items-center space-x-4 px-5 sm:px-6 py-3 sm:py-4 text-gray-700 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-[1.02] rounded-lg mx-2"
              >
                <Phone className="h-5 w-5 text-primary" />
                <span className="font-semibold text-base sm:text-lg">Contact</span>
              </Link>
              
              <Link
                to="/careers"
                onClick={closeMobileMenu}
                className="flex items-center space-x-4 px-5 sm:px-6 py-3 sm:py-4 text-gray-700 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-[1.02] rounded-lg mx-2"
              >
                <Crown className="h-5 w-5 text-primary" />
                <span className="font-semibold text-base sm:text-lg">Careers</span>
              </Link>
              
              <Link
                to="/funding"
                onClick={closeMobileMenu}
                className="flex items-center space-x-4 px-5 sm:px-6 py-3 sm:py-4 text-gray-700 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-[1.02] rounded-lg mx-2"
              >
                <Heart className="h-5 w-5 text-primary" />
                <span className="font-semibold text-base sm:text-lg">Support Us</span>
              </Link>
              
              
              <div className="border-t border-gray-200/60 mt-3 sm:mt-4 pt-3 sm:pt-4 px-3 sm:px-4 space-y-3 sm:space-y-4">
                <Link
                  to="/auth"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center space-x-2 w-full px-4 sm:px-5 py-3 border-2 border-primary/20 text-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-300 text-base sm:text-lg font-semibold hover:scale-[1.02] mx-1"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/auth"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center space-x-2 w-full px-4 sm:px-5 py-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl hover:from-primary/90 hover:to-primary/80 transition-all duration-300 text-base sm:text-lg font-semibold hover:scale-[1.02] shadow-lg mx-1"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Get Started</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="w-full px-4 sm:px-6 lg:px-12 py-16 pt-32">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Get In <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We'd love to hear from you! Whether you have questions, feedback, or just want to say hello, 
            we're here to help on your spiritual journey.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white mb-4 group-hover:scale-110 transition-transform">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600 text-sm mb-4">Send us a message anytime</p>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 shadow-sm">
                <a 
                  href="mailto:bibleinsightai.contact@gmail.com"
                  className="text-blue-600 font-semibold hover:text-blue-700 transition-colors break-all"
                >
                  bibleinsightai.contact@gmail.com
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white mb-4 group-hover:scale-110 transition-transform">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600 text-sm mb-4">Speak with our team</p>
              <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4 shadow-sm">
                <a 
                  href="tel:+94769197386"
                  className="text-green-600 font-semibold hover:text-green-700 transition-colors text-lg"
                >
                  +94 769 197 386
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white mb-4 group-hover:scale-110 transition-transform">
                <Instagram className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Follow Us</h3>
              <p className="text-gray-600 text-sm mb-4">Connect on social media</p>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4 shadow-sm">
                <a 
                  href="https://instagram.com/bible_aura.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                >
                  @bible_aura.ai
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
          <p className="text-gray-600 mb-8">Discover deeper spiritual insights and biblical wisdom</p>
          <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3" asChild>
            <Link to="/auth">
              <MessageCircle className="mr-2 h-5 w-5" />
              Get Started Today
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-orange-400 mb-3">
                ✦Bible Aura
              </h3>
              <p className="text-gray-400 text-base">
                AI-Powered Biblical Insight
              </p>
            </div>
            
            {/* Menu Section */}
            <div className="text-center md:text-left">
              <h4 className="text-xl font-semibold text-white mb-6">Menu</h4>
              <nav className="space-y-3">
                <Link to="/about" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  About
                </Link>
                <Link to="/careers" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Careers
                </Link>
                <Link to="/dashboard" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Dashboard
                </Link>
                <Link to="/auth" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Sign In
                </Link>
              </nav>
            </div>
            
            {/* Contact Section */}
            <div className="text-center md:text-left">
              <h4 className="text-xl font-semibold text-white mb-6">Contact</h4>
              <div className="space-y-3">
                <p className="text-gray-400">@bible_aura.ai</p>
                <a 
                  href="mailto:bibleinsightai.contact@gmail.com" 
                  className="block text-gray-400 hover:text-orange-400 transition-colors duration-300"
                >
                  bibleinsightai.contact@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left text-gray-400">
              <div>
                <Link to="/terms" className="hover:text-orange-400 transition-colors duration-300 text-sm">
                  Terms of Use
                </Link>
                <span className="mx-2">|</span>
                <Link to="/privacy" className="hover:text-orange-400 transition-colors duration-300 text-sm">
                  Privacy Policy
                </Link>
              </div>
              
              <div className="text-sm">
                <span>&copy; 2024 ✦Bible Aura. All rights reserved. Developed by </span>
                <a 
                  href="https://www.instagram.com/benaiah_4?igsh=cGZuYmI2YWw0d25r" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-300 transition-colors duration-300 underline"
                >
                  Benaiah Nicholas Nimal
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact; 