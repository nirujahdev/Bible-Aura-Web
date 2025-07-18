import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Star, BookOpen, MessageCircle, PenTool, Sparkles, Heart, Users, Crown, Zap, Home, Info, DollarSign, Quote, Phone, LogIn, UserPlus, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import heroImage from "@/assets/hero-spiritual.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

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
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/40 to-primary/60"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center h-full text-center text-white px-4">
          <div className="max-w-6xl">
            {/* Divine Logo */}
            <div className="mb-8">
              <div className="relative inline-block">
                <h1 className="text-6xl lg:text-8xl font-divine text-white mb-4 animate-sacred-fade-in">
                  ✦Bible Aura
                </h1>
                {/* Glowing effect behind text */}
                <div className="absolute inset-0 text-6xl lg:text-8xl font-divine text-white/20 blur-xl animate-divine-pulse">
                  ✦Bible Aura
                </div>
              </div>
            </div>

            {/* Hero Title */}
            <div className="space-y-6 mb-12">
              <h2 className="text-3xl lg:text-5xl font-bold leading-tight animate-sacred-fade-in" style={{animationDelay: '0.3s'}}>
                Experience Divine <span className="text-amber-200">Biblical Wisdom</span>
              </h2>
              <p className="text-xl lg:text-2xl text-white/90 font-medium max-w-4xl mx-auto animate-sacred-fade-in" style={{animationDelay: '0.6s'}}>
                Discover the sacred depths of Scripture through AI-powered insights, personalized study plans, and divine guidance on your spiritual journey.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-sacred-fade-in" style={{animationDelay: '0.9s'}}>
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 font-bold px-8 py-4 text-lg rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-500 min-w-[200px]"
              >
                <Link to="/auth">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Begin Your Journey
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary font-bold px-8 py-4 text-lg rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-500 min-w-[200px]"
              >
                <Link to="#features">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Explore Features
                </Link>
              </Button>
            </div>

            {/* Sacred Stats */}
            <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 animate-sacred-fade-in" style={{animationDelay: '1.2s'}}>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-amber-200 mb-2">AI-Powered</div>
                <div className="text-sm lg:text-base text-white/80">Biblical Analysis</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-amber-200 mb-2">50+</div>
                <div className="text-sm lg:text-base text-white/80">Bible Translations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-amber-200 mb-2">1000+</div>
                <div className="text-sm lg:text-base text-white/80">Study Topics</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-amber-200 mb-2">24/7</div>
                <div className="text-sm lg:text-base text-white/80">Divine Guidance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Sacred Features for Your <span className="text-primary">Spiritual Journey</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how Bible Aura transforms your biblical study with cutting-edge AI technology and divine wisdom.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* AI Bible Analysis */}
            <Card className="relative overflow-hidden border-2 border-orange-200 hover:border-orange-300 transition-all duration-500 hover:scale-105 hover:shadow-xl">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-orange-100 rounded-2xl w-fit">
                  <BookOpen className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">AI Bible Analysis</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-3 text-sm text-gray-700 mb-6">
                  <li className="flex items-center"><div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>Contextual verse insights</li>
                  <li className="flex items-center"><div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>50+ Bible translations</li>
                  <li className="flex items-center"><div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>Cross-reference suggestions</li>
                </ul>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200/50">
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="h-3 w-3 text-orange-500" />
                    <span className="text-orange-700 font-bold text-center text-xs">Instant analysis in 50+ languages</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Chat Assistant */}
            <Card className="relative overflow-hidden border-2 border-blue-200 hover:border-blue-300 transition-all duration-500 hover:scale-105 hover:shadow-xl">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-2xl w-fit">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">AI Chat Assistant</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-3 text-sm text-gray-700 mb-6">
                  <li className="flex items-center"><div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>Biblical Q&A support</li>
                  <li className="flex items-center"><div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>Personal spiritual guidance</li>
                  <li className="flex items-center"><div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>Scripture memorization help</li>
                </ul>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200/50">
                  <div className="flex items-center justify-center space-x-2">
                    <MessageCircle className="h-3 w-3 text-blue-500" />
                    <span className="text-blue-700 font-bold text-center text-xs">24/7 biblical companion</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Smart Study Tools */}
            <Card className="relative overflow-hidden border-2 border-purple-200 hover:border-purple-300 transition-all duration-500 hover:scale-105 hover:shadow-xl">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-violet-500"></div>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-purple-100 rounded-2xl w-fit">
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Smart Study Tools</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-3 text-sm text-gray-700 mb-6">
                  <li className="flex items-center"><div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>Hebrew/Greek word studies</li>
                  <li className="flex items-center"><div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>Historical context insights</li>
                  <li className="flex items-center"><div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>Topical study generation</li>
                </ul>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200/50">
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="h-3 w-3 text-purple-500" />
                    <span className="text-purple-700 font-bold text-center text-xs">Original language research</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Sermon Prep */}
            <Card className="relative overflow-hidden border-2 border-green-200 hover:border-green-300 transition-all duration-500 hover:scale-105 hover:shadow-xl">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-green-100 rounded-2xl w-fit">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">AI Sermon Prep</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-3 text-sm text-gray-700 mb-6">
                  <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Automated sermon outlines</li>
                  <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Scripture cross-references</li>
                  <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Illustration suggestions</li>
                </ul>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200/50">
                  <div className="flex items-center justify-center space-x-2">
                    <Users className="h-3 w-3 text-green-500" />
                    <span className="text-green-700 font-bold text-center text-xs">Complete ministry toolkit</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reading Plans */}
            <Card className="relative overflow-hidden border-2 border-teal-200 hover:border-teal-300 transition-all duration-500 hover:scale-105 hover:shadow-xl">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-cyan-500"></div>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-teal-100 rounded-2xl w-fit">
                  <BookOpen className="h-8 w-8 text-teal-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Reading Plans</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-3 text-sm text-gray-700 mb-6">
                  <li className="flex items-center"><div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>Personalized schedules</li>
                  <li className="flex items-center"><div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>Progress tracking</li>
                  <li className="flex items-center"><div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>Achievement rewards</li>
                </ul>
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-200/50">
                  <div className="flex items-center justify-center space-x-2">
                    <BookOpen className="h-3 w-3 text-teal-500" />
                    <span className="text-teal-700 font-bold text-center text-xs">AI-guided spiritual journey</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prayer & Devotion */}
            <Card className="relative overflow-hidden border-2 border-rose-200 hover:border-rose-300 transition-all duration-500 hover:scale-105 hover:shadow-xl">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 to-pink-500"></div>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-rose-100 rounded-2xl w-fit">
                  <Heart className="h-8 w-8 text-rose-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Prayer & Devotion</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-3 text-sm text-gray-700 mb-6">
                  <li className="flex items-center"><div className="w-2 h-2 bg-rose-500 rounded-full mr-3"></div>Daily prayer prompts</li>
                  <li className="flex items-center"><div className="w-2 h-2 bg-rose-500 rounded-full mr-3"></div>Spiritual reflection journal</li>
                  <li className="flex items-center"><div className="w-2 h-2 bg-rose-500 rounded-full mr-3"></div>Guided meditation</li>
                </ul>
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-200/50">
                  <div className="flex items-center justify-center space-x-2">
                    <Heart className="h-3 w-3 text-rose-500" />
                    <span className="text-rose-700 font-bold text-center text-xs">Deepen your spiritual life</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Choose Your <span className="text-primary">Sacred Path</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start your divine journey with our free tier, or unlock the full spiritual experience with our premium features.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <Card className="relative border-2 border-gray-200 hover:border-gray-300 transition-all duration-500 hover:scale-105">
              <CardHeader className="text-center pb-6">
                <Badge className="mx-auto mb-4 bg-gray-100 text-gray-700">Free Forever</Badge>
                <CardTitle className="text-3xl text-gray-900 mb-2">Seeker</CardTitle>
                <div className="text-4xl font-bold text-gray-900">$0<span className="text-lg text-gray-500">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-3" />Basic Bible reading</li>
                  <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-3" />Limited AI conversations</li>
                  <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-3" />Basic verse search</li>
                  <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-3" />Community access</li>
                </ul>
                <Button asChild className="w-full bg-gray-600 hover:bg-gray-700">
                  <Link to="/auth">Start Free Journey</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Tier */}
            <Card className="relative border-2 border-primary hover:border-orange-400 transition-all duration-500 hover:scale-105 shadow-xl">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-orange-400"></div>
              <CardHeader className="text-center pb-6">
                <Badge className="mx-auto mb-4 bg-primary text-white">Most Popular</Badge>
                <CardTitle className="text-3xl text-gray-900 mb-2">Disciple</CardTitle>
                <div className="text-4xl font-bold text-gray-900">$9<span className="text-lg text-gray-500">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-3" />Unlimited AI conversations</li>
                  <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-3" />Advanced Bible study tools</li>
                  <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-3" />Spiritual journaling</li>
                  <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-3" />Personalized insights</li>
                  <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-3" />Prayer tracking</li>
                  <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-3" />Premium support</li>
                </ul>
                <Button asChild className="w-full bg-primary hover:bg-orange-600">
                  <Link to="/auth">Upgrade to Premium</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Stay Connected to the Divine
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Receive weekly biblical insights, spiritual guidance, and updates on new features directly to your inbox.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/70 flex-1"
            />
            <Button className="bg-white text-primary hover:bg-white/90 font-bold">
              Subscribe
            </Button>
          </div>
          
          <p className="text-sm text-white/70 mt-4">
            Join thousands of believers on their spiritual journey. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold mb-4">✦Bible Aura</h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Empowering believers with AI-driven biblical insights and spiritual guidance for a deeper relationship with God.
              </p>
              <div className="flex space-x-4">
                <Badge variant="outline" className="text-white border-white/20">AI-Powered</Badge>
                <Badge variant="outline" className="text-white border-white/20">Divine Insights</Badge>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/funding" className="hover:text-white transition-colors">Support Us</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Bible Aura. All rights reserved. Made with ❤️ for the Kingdom of God.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 