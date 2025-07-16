import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Clock, ArrowLeft, MessageCircle, Globe, Instagram, Home, Info, Crown, Heart, LogIn, UserPlus, Menu, X } from "lucide-react";
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
            Get In <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We'd love to hear from you! Whether you have questions, feedback, or just want to say hello, 
            we're here to help on your spiritual journey.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${method.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                  <method.icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                <a 
                  href={method.action}
                  target={method.action.startsWith('http') ? '_blank' : undefined}
                  rel={method.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-orange-600 font-semibold hover:text-orange-700 transition-colors"
                >
                  {method.contact}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information Cards */}
          <div className="space-y-8">
            {/* Office Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-orange-600" />
                  Our Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Response Time</h4>
                    <p className="text-gray-600 text-sm">Within 24 hours on business days</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Globe className="h-5 w-5 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Global Reach</h4>
                    <p className="text-gray-600 text-sm">Serving believers worldwide</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MessageCircle className="h-5 w-5 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Languages</h4>
                    <p className="text-gray-600 text-sm">English, with more languages coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqItems.map((item, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <h4 className="font-semibold text-gray-900 mb-2">{item.question}</h4>
                      <p className="text-gray-600 text-sm">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
          
          {/* Social Media Links */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <Instagram className="h-5 w-5 mr-2 text-orange-600" />
                  Connect with Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <a 
                    href="https://www.instagram.com/bible_aura.ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    <Instagram className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-semibold text-gray-900">@bible_aura.ai</p>
                      <p className="text-gray-600 text-sm">Follow us for daily inspiration</p>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
          <p className="text-gray-600 mb-8">Join thousands of believers discovering deeper spiritual insights</p>
          <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3" asChild>
            <Link to="/auth">
              <MessageCircle className="mr-2 h-5 w-5" />
              Get Started Today
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Contact; 