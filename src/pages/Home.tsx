import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { 
  BookOpen, MessageCircle, Star, Sparkles, Send, User, Zap, Mic, Bot, FileText, BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
// Temporarily commented out to isolate error:
// import { SEOBacklinks, QuickActionSEOLinks } from "@/components/SEOBacklinks";
// import { ManualContextualLinks } from "@/components/ContextualLinks";
// import Footer from "@/components/Footer";
// import FAQ from "@/components/FAQ";
import { useSEO, SEO_CONFIG } from "@/hooks/useSEO";

const Home = () => {
  // SEO optimization - with error handling
  try {
    useSEO(SEO_CONFIG.HOME);
  } catch (error) {
    console.error('SEO Error:', error);
  }

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Simple Hero Section for Testing */}
      <section className="relative py-20 px-4 md:px-6 lg:px-10 bg-gradient-to-br from-gray-50 via-white to-orange-50 pt-32">
        <div className="relative w-full max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">
              ✦ Bible Aura
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-Powered Biblical Insight - Testing Mode
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <Link to="/auth">
              Start Your Journey
            </Link>
          </Button>
        </div>
      </section>

      {/* Test message */}
      <section className="py-20 bg-white text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🔧 Testing Mode - Simplified Version
        </h2>
        <p className="text-gray-600">
          If you can see this, the core Home component is working fine.
        </p>
      </section>
    </div>
  );
};

export default Home; 