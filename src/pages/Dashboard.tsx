import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DailyVerse from "@/components/DailyVerse";
import QuickActions from "@/components/QuickActions";
import PopularQuestions from "@/components/PopularQuestions";
import ReadingProgress from "@/components/ReadingProgress";
import ReadingPlanGenerator from "@/components/ReadingPlanGenerator";
import { Search, Bell, User, MessageCircle, Book, Sparkles, Star, Heart, Calendar, Target, BookOpen, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-spiritual.jpg";

const Dashboard = () => {
  const { profile, user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Hero Section */}
      <div className="relative h-80 bg-aura-gradient overflow-hidden">
        {/* Animated Background Particles */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-celestial-float opacity-60"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full animate-celestial-float opacity-40" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-white rounded-full animate-celestial-float opacity-30" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white rounded-full animate-celestial-float opacity-50" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-20 right-10 w-2 h-2 bg-white rounded-full animate-celestial-float opacity-35" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        {/* Hero Background Image with Divine Overlay */}
        <img 
          src={heroImage} 
          alt="Spiritual background" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20 animate-divine-breathe"
        />
        
        {/* Enhanced Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {user ? (
              <>
                <h1 className="text-4xl md:text-5xl font-divine text-white mb-4 animate-sacred-fade-in">
                  Welcome back, 
                  <span className="gradient-text text-white animate-holy-text-glow block">
                    {profile?.display_name?.split(' ')[0] || 'Friend'}!
                  </span>
                </h1>
                
                <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl font-sacred animate-sacred-fade-in" style={{animationDelay: '0.2s'}}>
                  Continue your spiritual journey with <span className="text-white font-bold">AI-powered biblical insights</span>
                </p>
              </>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl font-divine text-white mb-4 animate-sacred-fade-in">
                  Welcome to 
                  <span className="gradient-text text-white animate-holy-text-glow block">
                    ✦Bible Aura
                  </span>
                </h1>
                
                <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl font-sacred animate-sacred-fade-in" style={{animationDelay: '0.2s'}}>
                  Begin your spiritual journey with <span className="text-white font-bold">AI-powered biblical insights</span>
                </p>
              </>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-sacred-fade-in" style={{animationDelay: '0.4s'}}>
              <Link to="/bible">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 animate-divine-pulse">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explore Bible
                </Button>
              </Link>
              <Link to="/chat">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-6"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Ask AI
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm animate-sacred-fade-in" style={{animationDelay: '0.6s'}}>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-white" />
                <span>AI-Powered Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-white" />
                <span>Spiritual Growth</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-white" />
                <span>Divine Wisdom</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-spiritual transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reading Streak</p>
                  <p className="text-2xl font-bold text-primary">{profile?.reading_streak || 0} days</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Days</p>
                  <p className="text-2xl font-bold text-blue-600">{profile?.total_reading_days || 0}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">AI Insights</p>
                  <p className="text-2xl font-bold text-green-600">47</p>
                </div>
                <Sparkles className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Saved Verses</p>
                  <p className="text-2xl font-bold text-purple-600">12</p>
                </div>
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Daily Verse & Quick Actions */}
          <div className="space-y-6">
            <DailyVerse />
            <QuickActions />
          </div>

          {/* Center Column - Popular Questions */}
          <div className="space-y-6">
            <PopularQuestions />
          </div>

          {/* Right Column - Reading Progress & Plan Generator */}
          <div className="space-y-6">
            <ReadingProgress />
            <ReadingPlanGenerator />
          </div>
        </div>

        {/* Featured Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Link to="/bible">
            <Card className="group hover:shadow-spiritual transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-8 w-8 text-primary group-hover:animate-divine-pulse" />
                </div>
                <CardTitle className="text-xl font-bold">Study Scripture</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Dive deep into God's Word with AI-powered insights and commentary
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/chat">
            <Card className="group hover:shadow-spiritual transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <MessageCircle className="h-8 w-8 text-primary group-hover:animate-divine-pulse" />
                </div>
                <CardTitle className="text-xl font-bold">Ask Questions</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Get biblical guidance and answers powered by AI wisdom
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/journal">
            <Card className="group hover:shadow-spiritual transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Book className="h-8 w-8 text-primary group-hover:animate-divine-pulse" />
                </div>
                <CardTitle className="text-xl font-bold">Journal</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Record your spiritual journey and reflect on God's goodness
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 