import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BookOpen, MessageCircle, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { GlobalNavigation } from "@/components/GlobalNavigation";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white relative overflow-hidden min-h-screen flex items-center">
        {/* Background dots */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-2 h-2 bg-white/30 rounded-full"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/20 rounded-full"></div>
          <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-white/10 rounded-full"></div>
          <div className="absolute top-1/2 right-20 w-1.5 h-1.5 bg-white/25 rounded-full"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              ✦Bible Aura
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              AI-Powered Biblical Insight
            </h2>
            <p className="text-lg md:text-xl text-white/90 max-w-4xl mx-auto mb-8">
              Transform your spiritual journey with personalized biblical insights, AI-powered sermon preparation, and divine wisdom at your fingertips.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-white/90 font-bold px-8 py-4 text-lg">
                <Link to="/auth">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Get Started
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white bg-transparent hover:bg-white hover:text-orange-600 font-bold px-8 py-4 text-lg">
                <Link to="/dashboard">
                  Dashboard
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-white/90">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <span className="font-medium">AI Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span className="font-medium">All in one Bible</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span className="font-medium">AI Chat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transform Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-px bg-orange-500"></div>
                <Zap className="h-6 w-6 text-orange-500" />
                <div className="w-12 h-px bg-orange-500"></div>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Transform Your
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold text-orange-500 mb-8">
              Bible Study Experience
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of believers worldwide who are growing deeper in their faith with Bible Aura's AI-powered spiritual tools.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Smart Analysis */}
            <Card className="text-center border-0 shadow-lg bg-orange-50 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 p-4 bg-orange-500 rounded-full w-fit">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Smart Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get instant insights and context for any Bible verse
                </p>
              </CardContent>
            </Card>

            {/* AI Companion */}
            <Card className="text-center border-0 shadow-lg bg-blue-50 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 p-4 bg-blue-500 rounded-full w-fit">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900">AI Companion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Chat with our AI for spiritual guidance and questions
                </p>
              </CardContent>
            </Card>

            {/* Study Tools */}
            <Card className="text-center border-0 shadow-lg bg-purple-50 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 p-4 bg-purple-500 rounded-full w-fit">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Study Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access comprehensive Bible study resources
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-12 text-white">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                Transform Your Spiritual Life with AI-Powered Insights
              </h3>
              <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                Start your spiritual transformation today with AI-powered biblical insights and community support.
              </p>
              <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-white/90 font-bold px-10 py-6 text-xl">
                <Link to="/auth">
                  <Zap className="h-6 w-6 mr-3" />
                  START YOUR JOURNEY
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Brand Section */}
            <div>
              <h3 className="text-2xl font-bold text-orange-400 mb-3">
                ✦Bible Aura
              </h3>
              <p className="text-gray-400 text-base">
                AI-Powered Biblical Insight
              </p>
            </div>
            
            {/* Menu Section */}
            <div>
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
            <div>
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
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-gray-400">
              <div className="text-center md:text-left">
                <Link to="/terms" className="hover:text-orange-400 transition-colors duration-300 text-sm">
                  Terms of Use
                </Link>
                <span className="mx-2">|</span>
                <Link to="/privacy" className="hover:text-orange-400 transition-colors duration-300 text-sm">
                  Privacy Policy
                </Link>
              </div>
              
              <div className="text-center md:text-right text-sm">
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

export default Landing; 