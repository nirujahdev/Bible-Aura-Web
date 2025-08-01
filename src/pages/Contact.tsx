import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Clock, ArrowLeft, MessageCircle, Globe, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";

const Contact = () => {

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us a message anytime",
          contact: "contact@bibleaura.xyz",
    action: "mailto:contact@bibleaura.xyz",
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
      action: "https://www.instagram.com/bible_aura.xyz/",
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
             <GlobalNavigation variant="landing" />

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
                  href="mailto:contact@bibleaura.xyz"
                  className="text-blue-600 font-semibold hover:text-blue-700 transition-colors break-all"
                >
                  contact@bibleaura.xyz
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
                  href="https://www.instagram.com/bible_aura.xyz/"
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

      <Footer />
    </div>
  );
};

export default Contact; 