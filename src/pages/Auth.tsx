import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Sparkles, 
  Star, 
  Crown, 
  Heart, 
  Book, 
  MessageCircle, 
  Search, 
  Users, 
  Brain,
  Lightbulb
} from 'lucide-react';

export default function Auth() {
  const { user, signIn, signInWithMagicLink, signInWithGoogle, signUp, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentTab, setCurrentTab] = useState("signin");
  const [currentFeature, setCurrentFeature] = useState(0);

  // Features data for showcase
  const features = [
    {
      icon: Brain,
      title: "AI Bible Analysis",
      description: "Get insights and explanations from our AI that understands biblical context and meaning.",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: MessageCircle,
      title: "AI Chat Helper",
      description: "Ask questions about scripture and theology to receive personalized AI responses.",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Book,
      title: "Bible Study Tools",
      description: "Access multiple Bible translations with cross-references and verse analysis.",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Search,
      title: "Smart Scripture Search",
      description: "Find verses by topic or keywords with our AI-enhanced search.",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: Lightbulb,
      title: "Personal Insights",
      description: "Receive daily devotions and study plans tailored to your faith journey.",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      icon: Users,
      title: "Community",
      description: "Connect with other believers and share insights in our faith community.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ];

  // Auto-rotate features every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    await signIn(email, password);
    setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const displayName = formData.get('displayName') as string;

    await signUp(email, password, displayName);
    setIsSubmitting(false);
  };

  const handleMagicLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    await signInWithMagicLink(email);
    setIsSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    await signInWithGoogle();
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="relative mx-auto">
            <img 
              src="/✦Bible Aura.svg" 
              alt="Bible Aura" 
              className="h-32 w-32 mx-auto drop-shadow-2xl"
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-white">
              ✦ Bible Aura
            </h1>
            <p className="text-xl text-white/90">
              AI-Powered Biblical Insight
            </p>
            <div className="text-white/70 text-lg">
              Loading your account...
            </div>
          </div>
          <div className="flex justify-center">
            <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-primary to-primary/80 flex overflow-hidden">
      {/* Left Side - Features Showcase (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-white">
        <div className="flex flex-col items-center justify-center p-8 text-gray-800 w-full">
          {/* Logo Section */}
          <div className="mb-8">
            <div className="text-center">
              <img 
                src="/✦Bible Aura.svg" 
                alt="Bible Aura" 
                className="h-32 w-32 mx-auto drop-shadow-lg mb-4"
              />
              <h1 className="text-4xl font-bold text-primary mb-2">
                ✦ Bible Aura
              </h1>
              <p className="text-lg text-gray-600 font-medium">
                AI-Powered Biblical Insight
              </p>
            </div>
          </div>

          {/* Enhanced Features Showcase */}
          <div className="w-full max-w-lg">
            <div key={currentFeature} className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200 shadow-xl transition-all duration-700 transform hover:scale-[1.02] overflow-hidden">
              {/* Animated background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/5 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-start gap-5 mb-5">
                  <div className={`p-4 rounded-2xl shadow-lg bg-gradient-to-br ${
                    currentFeature === 0 ? 'from-blue-500 to-indigo-600' :
                    currentFeature === 1 ? 'from-purple-500 to-pink-600' :
                    currentFeature === 2 ? 'from-green-500 to-emerald-600' :
                    currentFeature === 3 ? 'from-orange-500 to-red-600' :
                    currentFeature === 4 ? 'from-yellow-500 to-amber-600' :
                    'from-indigo-500 to-purple-600'
                  } transform rotate-3 hover:rotate-0 transition-transform duration-300`}>
                    {(() => {
                      const IconComponent = features[currentFeature].icon;
                      return <IconComponent className="h-8 w-8 text-white" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text">
                      {features[currentFeature].title}
                    </h3>
                    <div className="h-1 w-12 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {features[currentFeature].description}
                </p>
              </div>
            </div>

            {/* Enhanced Feature Indicators */}
            <div className="flex justify-center gap-3 mt-8">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`group relative transition-all duration-300 ${
                    index === currentFeature 
                      ? 'scale-110' 
                      : 'hover:scale-105'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentFeature 
                      ? 'bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25' 
                      : 'bg-gray-300 hover:bg-primary/50'
                  }`}></div>
                  {index === currentFeature && (
                    <div className="absolute inset-0 w-4 h-4 rounded-full bg-primary animate-ping opacity-25"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Features Section */}
          <div className="mt-8 w-full max-w-lg">
            <div className="grid grid-cols-3 gap-3">
              {/* AI Insights */}
              <div className="group cursor-pointer transform transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 border border-blue-100">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-gray-800">AI Insights</div>
                  </div>
                </div>
              </div>

              {/* All in one Bible */}
              <div className="group cursor-pointer transform transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 border border-orange-100">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg">
                      <Book className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-gray-800">All in one Bible</div>
                  </div>
                </div>
              </div>

              {/* AI Chat */}
              <div className="group cursor-pointer transform transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 border border-green-100">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-gray-800">AI Chat</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Connecting line with sparkles */}
            <div className="flex items-center justify-center mt-4 space-x-2">
              <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent flex-1"></div>
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent flex-1"></div>
            </div>
          </div>

          {/* Developer Credit */}
          <div className="mt-auto pt-6 text-center">
            <p className="text-gray-500 text-sm">
              Developed By Benaiah Nicholas Nimal
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Authentication Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-4 lg:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">✦Bible Aura</h1>
            <p className="text-base sm:text-lg text-white/80">Start your spiritual journey</p>
          </div>

          <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-white/20">
            <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">Welcome</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-primary/10 border border-primary/20 h-11">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-white text-sm">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="magic" className="data-[state=active]:bg-primary data-[state=active]:text-white text-sm">
                    Magic Link
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-white text-sm">
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4 mt-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-primary font-medium">Email</Label>
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        disabled={isSubmitting}
                        className="border-primary/30 focus:border-primary focus:ring-primary h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-primary font-medium">Password</Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          required
                          disabled={isSubmitting}
                          className="border-primary/30 focus:border-primary focus:ring-primary h-11 pr-11"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent text-primary"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-white h-11"
                      disabled={isSubmitting}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="magic" className="space-y-4 mt-4">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                      <span className="text-sm text-primary font-medium">AI-Powered Login</span>
                    </div>
                  </div>
                  <form onSubmit={handleMagicLink} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="magic-email" className="text-primary font-medium">Email</Label>
                      <Input
                        id="magic-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        disabled={isSubmitting}
                        className="border-primary/30 focus:border-primary focus:ring-primary h-11"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-white h-11"
                      disabled={isSubmitting}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Sending link..." : "Send Magic Link"}
                    </Button>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-primary/20" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-primary/70">Or continue with</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-primary/30 hover:bg-primary/10 h-11"
                      onClick={handleGoogleSignIn}
                      disabled={isSubmitting}
                    >
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      {isSubmitting ? "Connecting..." : "Continue with Google"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4 mt-4">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                      <img 
                        src="/✦Bible Aura secondary.svg" 
                        alt="AI Oracle" 
                        className="h-6 w-6"
                      />
                      <span className="text-sm text-primary font-medium">AI-Enhanced Signup</span>
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Join thousands in their faith journey with AI-powered biblical insights
                    </p>
                  </div>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-primary font-medium">Name</Label>
                      <Input
                        id="signup-name"
                        name="displayName"
                        type="text"
                        placeholder="Enter your name"
                        disabled={isSubmitting}
                        className="border-primary/30 focus:border-primary focus:ring-primary h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-primary font-medium">Email</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        disabled={isSubmitting}
                        className="border-primary/30 focus:border-primary focus:ring-primary h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-primary font-medium">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          required
                          disabled={isSubmitting}
                          minLength={6}
                          className="border-primary/30 focus:border-primary focus:ring-primary h-11 pr-11"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent text-primary"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Minimum 6 characters required
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-white h-11"
                      disabled={isSubmitting}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Creating account..." : "Create Account"}
                    </Button>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-primary/20" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-primary/70">Or continue with</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-primary/30 hover:bg-primary/10 h-11"
                      onClick={handleGoogleSignIn}
                      disabled={isSubmitting}
                    >
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      {isSubmitting ? "Connecting..." : "Continue with Google"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Mobile Developer Credit */}
          <div className="lg:hidden text-center mt-4">
            <p className="text-white/70 text-sm">
              Developed By Benaiah Nicholas Nimal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}