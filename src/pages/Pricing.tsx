import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Zap, Heart, Book, MessageCircle, Brain, Users, ArrowLeft, Home, Info, Phone, LogIn, UserPlus, Menu, X, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const pricingTiers = [
    {
      name: "Free",
      price: isYearly ? "0" : "0",
      period: "Forever",
      description: "Perfect for exploring biblical insights",
      features: [
        "5 AI Bible analyses per month",
        "Basic Bible reading tools",
        "Daily verse notifications",
        "Community Q&A access",
        "Standard Bible translations",
        "Basic search functionality"
      ],
      cta: "Start Free",
      popular: false,
      color: "from-gray-500 to-gray-600"
    },
    {
      name: "Premium",
      price: isYearly ? "59" : "6.99",
      period: isYearly ? "year" : "month",
      description: "Unlock the full spiritual journey",
      features: [
        "Unlimited AI Bible analyses",
        "Advanced theological insights",
        "Personalized study plans",
        "Priority AI chat support",
        "All Bible translations",
        "Advanced search & concordance",
        "Personal prayer journal",
        "Sermon library access",
        "Offline Bible reading",
        "Custom highlight system"
      ],
      cta: "Start Premium",
      popular: true,
      color: "from-orange-500 to-orange-600"
    },
    {
      name: "Ministry",
      price: isYearly ? "199" : "19.99",
      period: isYearly ? "year" : "month",
      description: "For pastors, teachers, and ministry leaders",
      features: [
        "Everything in Premium",
        "Sermon preparation tools",
        "Bible commentary access",
        "Ministry dashboard",
        "Congregation management",
        "Group study features",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
        "Bulk user management"
      ],
      cta: "Start Ministry",
      popular: false,
      color: "from-purple-500 to-purple-600"
    }
  ];

  const faqItems = [
    {
      question: "Can I change my plan anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers for enterprise customers."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! You can try Premium features free for 14 days. No credit card required."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for all paid plans. No questions asked."
    },
    {
      question: "How does AI Bible analysis work?",
      answer: "Our AI analyzes biblical text using advanced natural language processing to provide contextual insights, cross-references, and theological commentary."
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

        {/* Enhanced Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 py-6 px-4 animate-sacred-fade-in">
            {/* Enhanced glowing border effect for mobile */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/20 via-transparent to-white/20 opacity-60"></div>
            
            <div className="relative flex flex-col space-y-3">
              {/* Enhanced Mobile Navigation Items */}
              <a 
                href="/" 
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32">
        <div className="text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Choose Your <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">Spiritual Journey</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your Bible study with AI-powered insights, personalized guidance, and comprehensive spiritual tools
          </p>
          
          {/* Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-sm font-medium ${!isYearly ? 'text-orange-600' : 'text-gray-500'}`}>Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                isYearly ? 'bg-orange-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-orange-600' : 'text-gray-500'}`}>Yearly</span>
            {isYearly && (
              <Badge className="bg-green-100 text-green-800 ml-2">Save 30%</Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {pricingTiers.map((tier, index) => (
            <Card key={tier.name} className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
              tier.popular ? 'ring-2 ring-orange-500 transform scale-105' : ''
            }`}>
              {tier.popular && (
                <div className="absolute top-0 left-0 right-0">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}
              
              <CardHeader className={`text-center ${tier.popular ? 'pt-12' : 'pt-8'}`}>
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${tier.color} text-white mb-4 mx-auto`}>
                  {tier.name === 'Free' && <Star className="h-8 w-8" />}
                  {tier.name === 'Premium' && <Crown className="h-8 w-8" />}
                  {tier.name === 'Ministry' && <Users className="h-8 w-8" />}
                </div>
                <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className="text-gray-500 ml-2">/{tier.period}</span>
                </div>
                <p className="text-gray-600 mt-2">{tier.description}</p>
              </CardHeader>
              
              <CardContent className="px-6 pb-8">
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${tier.popular ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700' : 'bg-gray-900 hover:bg-gray-800'} text-white font-semibold py-3`}
                  asChild
                >
                  <Link to="/auth">{tier.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Bible Aura?</h2>
          <p className="text-gray-600 mb-12">Discover the power of AI-enhanced biblical study</p>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white mb-4">
                <Brain className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered Insights</h3>
              <p className="text-gray-600 text-sm">Advanced AI analyzes scripture to provide deep theological insights</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white mb-4">
                <Book className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Comprehensive Library</h3>
              <p className="text-gray-600 text-sm">Access multiple translations, commentaries, and study tools</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white mb-4">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Interactive Learning</h3>
              <p className="text-gray-600 text-sm">Chat with AI for personalized biblical guidance and answers</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Spiritual Growth</h3>
              <p className="text-gray-600 text-sm">Personalized study plans to deepen your faith journey</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.question}</h3>
                  <p className="text-gray-600">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Transform Your Bible Study?</h2>
          <p className="text-gray-600 mb-8">Join thousands of believers discovering deeper spiritual insights with AI</p>
          <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3" asChild>
            <Link to="/auth">
              <Zap className="mr-2 h-5 w-5" />
              Start Your Free Trial
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing; 