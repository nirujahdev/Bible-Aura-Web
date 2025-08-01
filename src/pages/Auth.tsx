import { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Sparkles, 
  Star, 
  Heart, 
  Book, 
  MessageCircle, 
  Search, 
  Users, 
  Brain,
  Lightbulb,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function Auth() {
  // SEO optimization
  useSEO(SEO_CONFIG.AUTH);
  
  const { user, signIn, signInWithMagicLink, signInWithGoogle, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentTab, setCurrentTab] = useState("signin");
  const [currentFeature, setCurrentFeature] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isMagicLinkAuth, setIsMagicLinkAuth] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Enhanced features data for showcase
  const features = [
    {
      icon: Brain,
      title: "AI Bible Analysis",
      description: "Get deep insights and explanations from our AI that understands biblical context, historical background, and theological meaning.",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: MessageCircle,
      title: "AI Chat Helper",
      description: "Ask questions about scripture, theology, and faith to receive personalized, biblically-grounded AI responses.",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Book,
      title: "Bible Study Tools",
      description: "Access multiple Bible translations, cross-references, verse analysis, and comprehensive study resources.",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Search,
      title: "Smart Scripture Search",
      description: "Find verses by topic, keywords, or themes with our AI-enhanced search that understands context.",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: Lightbulb,
      title: "Personal Insights",
      description: "Receive daily devotions, study plans, and spiritual insights tailored to your faith journey and interests.",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      icon: Users,
      title: "Faith Community",
      description: "Connect with other believers, share insights, and grow together in our supportive faith community.",
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

  // Enhanced magic link detection and error handling
  useEffect(() => {
    const urlHash = window.location.hash;
    const urlSearch = window.location.search;
    
    console.log('Auth page loaded with:', { urlHash, urlSearch });
    
    // Clear any existing messages
    setAuthError(null);
    setAuthSuccess(null);
    
    // Check for authentication errors
    const hasError = urlHash.includes('error=') || urlSearch.includes('error=');
    const hasAuthParams = urlHash.includes('access_token') || 
                         urlHash.includes('refresh_token') ||
                         urlSearch.includes('token_hash') ||
                         urlSearch.includes('type=recovery') ||
                         urlSearch.includes('type=email_change') ||
                         urlSearch.includes('type=signup') ||
                         urlSearch.includes('type=invite') ||
                         urlSearch.includes('type=magiclink');
    
    if (hasError) {
      // Extract and display error
      const errorMatch = (urlHash + urlSearch).match(/error=([^&]+)/);
      const errorDesc = (urlHash + urlSearch).match(/error_description=([^&]+)/);
      
      let errorMessage = 'Authentication failed';
      if (errorDesc) {
        errorMessage = decodeURIComponent(errorDesc[1].replace(/\+/g, ' '));
      } else if (errorMatch) {
        const errorCode = decodeURIComponent(errorMatch[1]);
        if (errorCode === 'access_denied') {
          errorMessage = 'Access denied. Please try again or use a different sign-in method.';
        } else if (errorCode === 'invalid_request') {
          errorMessage = 'Invalid authentication request. Please try again.';
        } else {
          errorMessage = `Authentication error: ${errorCode}`;
        }
      }
      
      console.log('Auth error detected:', errorMessage);
      setAuthError(errorMessage);
      
      // Clean up URL after displaying error
      setTimeout(() => {
        window.history.replaceState({}, '', '/auth');
      }, 1000);
      
    } else if (hasAuthParams) {
      console.log('Magic link or OAuth callback detected');
      setIsMagicLinkAuth(true);
      setAuthSuccess('Authenticating... Please wait while we verify your credentials.');
      
      // Set timeout for magic link authentication
      const authTimeout = setTimeout(() => {
        if (isMagicLinkAuth && !user) {
          console.log('Magic link authentication timeout');
          setIsMagicLinkAuth(false);
          setAuthSuccess(null);
          setAuthError('Authentication timed out. Please try again or sign in manually.');
          window.history.replaceState({}, '', '/auth');
        }
      }, 8000); // Increased timeout to 8 seconds
      
      return () => clearTimeout(authTimeout);
    }
  }, []);

  // Handle successful authentication with better redirect logic
  useEffect(() => {
    console.log('Auth state check:', { user: !!user, loading, isMagicLinkAuth });
    
    if (!loading && user) {
      console.log('User authenticated, preparing redirect');
      setIsMagicLinkAuth(false);
      setAuthSuccess('Authentication successful! Redirecting...');
      
      // Determine redirect destination
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect') || '/dashboard';
      
      // Delay redirect slightly to show success message
      setTimeout(() => {
        console.log('Redirecting to:', redirectTo);
        navigate(redirectTo, { replace: true });
      }, 1000);
      
    } else if (!loading && isMagicLinkAuth && !user) {
      // Magic link detected but no user - continue waiting
      console.log('Still waiting for magic link authentication...');
    }
  }, [user, loading, navigate, isMagicLinkAuth]);

  // Enhanced form validation
  const validateForm = (formData: FormData, isSignUp: boolean = false) => {
    const errors: { [key: string]: string } = {};
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const displayName = formData.get('displayName') as string;
    
    // Email validation
    if (!email) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    // Password validation
    if (!password && currentTab !== 'magic') {
      errors.password = 'Password is required';
    } else if (password && password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (isSignUp && password && password.length < 8) {
      errors.password = 'For better security, use at least 8 characters';
    }
    
    // Display name validation for sign up
    if (isSignUp && displayName && displayName.length > 50) {
      errors.displayName = 'Display name must be less than 50 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      const formData = new FormData(e.currentTarget);
      
      if (!validateForm(formData)) {
        return;
      }

      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      const result = await signIn(email, password);
      if (result.error) {
        setAuthError(result.error.message);
      } else {
        setAuthSuccess('Sign in successful! Redirecting...');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      const formData = new FormData(e.currentTarget);
      
      if (!validateForm(formData, true)) {
        return;
      }

      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const displayName = formData.get('displayName') as string;

      const result = await signUp(email, password, displayName);
      if (result.error) {
        setAuthError(result.error.message);
      } else {
        setAuthSuccess('Account created successfully! Please check your email for confirmation.');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      const formData = new FormData(e.currentTarget);
      
      const email = formData.get('email') as string;
      if (!email) {
        setFormErrors({ email: 'Email address is required' });
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setFormErrors({ email: 'Please enter a valid email address' });
        return;
      }
      
      setFormErrors({});

      const result = await signInWithMagicLink(email);
      if (result.error) {
        setAuthError(result.error.message);
      } else {
        setAuthSuccess('Magic link sent! Please check your email and click the link to sign in.');
      }
    } catch (error) {
      console.error('Magic link error:', error);
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setAuthError(result.error.message);
      } else {
        setAuthSuccess('Redirecting to Google for authentication...');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      setAuthError('Google sign-in is currently unavailable. Please try email authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear form errors when switching tabs
  useEffect(() => {
    setFormErrors({});
    setAuthError(null);
    setAuthSuccess(null);
  }, [currentTab]);

  // Show loading screen for magic link auth
  if (loading || isMagicLinkAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white">✦Bible Aura</h2>
            <p className="text-lg text-white/90">
              {isMagicLinkAuth ? 'Authenticating...' : 'Loading your account...'}
            </p>
            {isMagicLinkAuth && (
              <p className="text-sm text-white/70">
                Please wait while we verify your authentication
              </p>
            )}
            {authSuccess && (
              <div className="flex items-center justify-center gap-2 text-green-200">
                <CheckCircle className="h-4 w-4" />
                <p className="text-sm">{authSuccess}</p>
              </div>
            )}
          </div>
          <div className="flex justify-center">
            <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex overflow-hidden w-full">
      {/* Left Side - Features Showcase (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-white">
        <div className="flex flex-col items-center justify-center p-6 text-gray-800 w-full">
          {/* Bible Aura Branding */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">✦Bible Aura</h1>
            <p className="text-lg text-gray-600 font-medium">AI-Powered Biblical Insights</p>
          </div>

          {/* Enhanced Features Showcase */}
          <div className="w-full mb-6">
            <div key={currentFeature} className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 shadow-xl transition-all duration-700 transform hover:scale-[1.02] overflow-hidden">
              {/* Animated background decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-primary/5 to-transparent rounded-full translate-y-8 -translate-x-8"></div>
              
              <div className="relative z-10">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-2xl shadow-lg bg-gradient-to-br ${
                    currentFeature === 0 ? 'from-blue-500 to-indigo-600' :
                    currentFeature === 1 ? 'from-purple-500 to-pink-600' :
                    currentFeature === 2 ? 'from-green-500 to-emerald-600' :
                    currentFeature === 3 ? 'from-orange-500 to-red-600' :
                    currentFeature === 4 ? 'from-yellow-500 to-amber-600' :
                    'from-indigo-500 to-purple-600'
                  } transform rotate-3 hover:rotate-0 transition-transform duration-300`}>
                    {(() => {
                      const IconComponent = features[currentFeature].icon;
                      return <IconComponent className="h-6 w-6 text-white" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text">
                      {features[currentFeature].title}
                    </h3>
                    <div className="h-1 w-10 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {features[currentFeature].description}
                </p>
              </div>
            </div>

            {/* Enhanced Feature Indicators */}
            <div className="flex justify-center gap-2 mt-6">
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
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentFeature 
                      ? 'bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25' 
                      : 'bg-gray-300 hover:bg-primary/50'
                  }`}></div>
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Features Section */}
          <div className="w-full">
            <div className="grid grid-cols-3 gap-3">
              {/* AI Insights */}
              <div className="group cursor-pointer transform transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow duration-300 border border-blue-100">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-gray-800">AI Insights</div>
                  </div>
                </div>
              </div>

              {/* All in one Bible */}
              <div className="group cursor-pointer transform transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow duration-300 border border-orange-100">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg">
                      <Book className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-gray-800">All in one Bible</div>
                  </div>
                </div>
              </div>

              {/* AI Chat */}
              <div className="group cursor-pointer transform transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow duration-300 border border-green-100">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-gray-800">AI Chat</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Connecting line with sparkles */}
            <div className="flex items-center justify-center mt-4 space-x-2">
              <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent flex-1"></div>
              <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent flex-1"></div>
            </div>
          </div>

          {/* Developer Credit */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              Developed By Benaiah Nicholas Nimal
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Authentication Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-4 lg:p-6">
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-white/20 w-full">
            <CardHeader className="text-center pb-3 px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl font-semibold text-primary">Welcome</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4">
              {authError && (
                <Alert variant="destructive" className="mb-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
                             {authSuccess && (
                 <Alert className="mb-3 border-green-200 bg-green-50">
                   <CheckCircle className="h-4 w-4 text-green-600" />
                   <AlertDescription className="text-green-800">{authSuccess}</AlertDescription>
                 </Alert>
               )}
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-primary/10 border border-primary/20 h-10 mb-4">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs font-medium">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="magic" className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs font-medium">
                    Magic Link
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs font-medium">
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-3 mt-0">
                  <form onSubmit={handleSignIn} className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="signin-email" className="text-primary font-medium text-sm">Email</Label>
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        disabled={isSubmitting}
                        className="border-primary/30 focus:border-primary focus:ring-primary h-9"
                      />
                      {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="signin-password" className="text-primary font-medium text-sm">Password</Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          required
                          disabled={isSubmitting}
                          className="border-primary/30 focus:border-primary focus:ring-primary h-9 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-9 px-2 hover:bg-transparent text-primary"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {formErrors.password && <p className="text-xs text-red-500">{formErrors.password}</p>}
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-white h-11"
                      disabled={isSubmitting}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                  
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
                    className="w-full h-11 border-primary/30 hover:bg-primary/5"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      {isSubmitting ? "Signing in..." : "Continue with Google"}
                  </Button>
                </TabsContent>
                
                <TabsContent value="magic" className="space-y-4 mt-0">
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
                      {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
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
                      className="w-full h-11 border-primary/30 hover:bg-primary/5"
                      onClick={handleGoogleSignIn}
                      disabled={isSubmitting}
                    >
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      {isSubmitting ? "Connecting..." : "Google"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4 mt-0">
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
                      {formErrors.displayName && <p className="text-xs text-red-500">{formErrors.displayName}</p>}
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
                      {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
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
                      {formErrors.password && <p className="text-xs text-red-500">{formErrors.password}</p>}
                      <p className="text-xs text-muted-foreground">
                        Minimum 6 characters required
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-white h-11"
                      disabled={isSubmitting}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Creating account..." : "Create Account"}
                    </Button>
                    
                    {user && !authError && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-green-800 text-sm font-medium mb-3">✅ Account created successfully!</p>
                        <Button 
                          asChild 
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Link to="/">
                            Go to AI Chat
                          </Link>
                        </Button>
                      </div>
                    )}
                  </form>
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-primary/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-primary/70">Or sign up with</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 border-primary/30 hover:bg-primary/5"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      {isSubmitting ? "Signing up..." : "Continue with Google"}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}