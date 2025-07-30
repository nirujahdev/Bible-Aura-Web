import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Globe, Users, BookOpen, Star, Crown, Shield, CheckCircle, X, Sparkles, Brain, MessageCircle, Edit3, Bookmark, TreePine, Mountain, Sprout, ChevronRight, HelpCircle, PieChart } from "lucide-react";
import { Link } from "react-router-dom";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { useState } from "react";

const Funding = () => {
  const [selectedPlan, setSelectedPlan] = useState("pro");

  // Pricing Plans
  const plans = [
    {
      id: "free",
      name: "Free",
      price: "0",
      currency: "LKR",
      period: "forever",
      badge: "Basic Access",
      icon: Sprout,
      description: "Perfect for exploring digital Bible study",
      color: "from-green-500 to-green-600",
      borderColor: "border-green-200",
      popular: false
    },
    {
      id: "pro",
      name: "Pro",
      price: "600",
      currency: "LKR",
      period: "month",
      badge: "Enhanced Features",
      icon: Star,
      description: "Advanced AI features and journaling",
      color: "from-blue-500 to-blue-600",
      borderColor: "border-blue-200",
      popular: true
    },
    {
      id: "supporter",
      name: "Supporter",
      price: "1,800",
      currency: "LKR",
      period: "month",
      badge: "Supporting Ministry",
      icon: TreePine,
      description: "Support ministry with premium features",
      color: "from-orange-500 to-orange-600",
      borderColor: "border-orange-200",
      popular: false
    },
    {
      id: "partner",
      name: "Partner",
      price: "4,000",
      currency: "LKR",
      period: "month",
      badge: "Ministry Partner",
      icon: Crown,
      description: "Full access and ministry partnership",
      color: "from-purple-500 to-purple-600",
      borderColor: "border-purple-200",
      popular: false
    }
  ];

  // Feature Categories with detailed comparisons
  const featureCategories = [
    {
      category: "📖 Bible Study Resources",
      features: [
        { name: "Bible Reading", free: "Full Access", pro: "Full Access", supporter: "Full Access", partner: "Full Access" },
        { name: "Verse Search", free: "Full Access", pro: "Full Access", supporter: "Full Access", partner: "Full Access" },
        { name: "Cross References", free: "Full Access", pro: "Full Access", supporter: "Full Access", partner: "Full Access" },
        { name: "Bible Translations", free: "All Translations", pro: "All Translations", supporter: "All Translations", partner: "All Translations" },
        { name: "Verse Analysis", free: "Full Access", pro: "Full Access", supporter: "Full Access", partner: "Full Access" },
        { name: "Topical Study", free: "Full Access", pro: "Full Access", supporter: "Full Access", partner: "Full Access" },
        { name: "Bible Characters", free: "Full Access", pro: "Full Access", supporter: "Full Access", partner: "Full Access" },
        { name: "Parables Study", free: "Full Access", pro: "Full Access", supporter: "Full Access", partner: "Full Access" }
      ]
    },
    {
      category: "🤖 AI Features",
      features: [
        { name: "AI Chat Oracle", free: "5 chats/month", pro: "50 chats/month", supporter: "100 chats/month", partner: "Unlimited" },
        { name: "Biblical Q&A", free: "Limited", pro: "Advanced", supporter: "Advanced", partner: "Expert Level" },
        { name: "AI Analysis", free: "2/month", pro: "20/month", supporter: "50/month", partner: "Unlimited" },
        { name: "Scripture Insights", free: "Limited", pro: "Full Access", supporter: "Full Access", partner: "Premium" },
        { name: "Contextual Explanations", free: "Basic", pro: "Detailed", supporter: "Detailed", partner: "Comprehensive" }
      ]
    },
    {
      category: "✍️ Journals & Personal Tools",
      features: [
        { name: "Journal Entries", free: "5 entries/month", pro: "50 entries/month", supporter: "100 entries/month", partner: "Unlimited" },
        { name: "Personal Reflections", free: "Basic", pro: "Enhanced", supporter: "Enhanced", partner: "Premium" },
        { name: "Study Notes", free: "Limited", pro: "Unlimited", supporter: "Unlimited", partner: "Advanced Editor" },
        { name: "Favorites", free: "Full Access", pro: "Full Access", supporter: "Full Access", partner: "Full Access" },
        { name: "Bookmarks", free: "Full Access", pro: "Full Access", supporter: "Full Access", partner: "Full Access" }
      ]
    },
    {
      category: "🎵 Sermons & Content",
      features: [
        { name: "Sermon Library", free: "Limited Access", pro: "Extended Access", supporter: "Full Access", partner: "Premium Access" },
        { name: "Sermon Creation", free: "Basic Tools", pro: "Advanced Tools", supporter: "Professional Tools", partner: "Complete Suite" },
        { name: "Audio Sermons", free: "5 sermons/month", pro: "20 sermons/month", supporter: "50 sermons/month", partner: "Unlimited" }
      ]
    },
    {
      category: "📚 Learning Resources",
      features: [
        { name: "Songs Library", free: "Full Access", pro: "Full Access", supporter: "Full Access", partner: "Full Access" },
        { name: "Study Plans", free: "Full Access", pro: "Full Access", supporter: "Full Access", partner: "Full Access" },
        { name: "Daily Verses", free: "Full Access", pro: "Full Access", supporter: "Full Access", partner: "Full Access" },
        { name: "Reading Progress", free: "Full Access", pro: "Full Access", supporter: "Full Access", partner: "Full Access" }
      ]
    },
    {
      category: "🎓 Advanced Study",
      features: [
        { name: "Hebrew/Greek Words", free: "Full Access", pro: "Full Access", supporter: "Full Access", partner: "Full Access" },
        { name: "Historical Context", free: "Full Access", pro: "Full Access", supporter: "Full Access", partner: "Full Access" },
        { name: "Theological Topics", free: "Full Access", pro: "Full Access", supporter: "Full Access", partner: "Full Access" },
        { name: "Commentary Access", free: "Full Access", pro: "Full Access", supporter: "Full Access", partner: "Full Access" }
      ]
    }
  ];

  // Cost transparency data
  const costBreakdown = [
    { category: "AI Processing & Technology", percentage: 65, color: "bg-blue-500" },
    { category: "Secure Data Storage & Backup", percentage: 20, color: "bg-green-500" },
    { category: "Content Licensing", percentage: 10, color: "bg-purple-500" },
    { category: "Ministry Operations", percentage: 5, color: "bg-orange-500" }
  ];

  const impact = [
    "Enables 3 free users for every paid subscription",
    "Supports translation into regional languages",
    "Funds scholarship access for students and missionaries",
    "Maintains 99.9% uptime for global access"
  ];

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Hero Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16 pt-32">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Supporting <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">Digital Bible Ministry</span>
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Not for Profit, But for Purpose
          </p>
          <div className="space-y-4 text-lg text-gray-600 max-w-4xl mx-auto">
            <p>
              Bible Aura exists to make deep Bible study accessible to everyone, everywhere. 
              While our heart is to serve freely, certain features require ongoing costs to maintain.
            </p>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">🙏 Our Mission</h3>
                  <p className="text-gray-600">Make deep Bible study accessible to everyone, everywhere</p>
                </div>
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">💡 Why Subscription?</h3>
                  <p className="text-gray-600">AI assistance and personal data storage require ongoing costs</p>
                </div>
                <div className="text-center">
                  <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">🎯 Our Commitment</h3>
                  <p className="text-gray-600">No profit margins - every rupee supports ministry</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Cards */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-center text-gray-600 mb-8 sm:mb-12">All Bible resources are completely free</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative hover:shadow-lg transition-all duration-300 ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''} ${plan.borderColor}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-3 py-1 text-xs sm:px-4 sm:text-sm">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-r ${plan.color} text-white mb-2 sm:mb-4 mx-auto`}>
                    <plan.icon className="h-6 w-6 sm:h-7 w-7 lg:h-8 lg:w-8" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="text-xs sm:text-sm text-gray-500 mb-2">{plan.badge}</div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                    {plan.price === "0" ? "Free" : `${plan.price} LKR`}
                  </div>
                  {plan.price !== "0" && <div className="text-sm text-gray-500">per {plan.period}</div>}
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-900 hover:bg-gray-800'} text-white text-sm sm:text-base`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.price === "0" ? "Get Started Free" : "Choose Plan"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Complete Features Comparison</h2>
          
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Features</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-900">
                        <div className="flex flex-col items-center">
                          <Sprout className="h-6 w-6 text-green-600 mb-2" />
                          <span>Free</span>
                          <span className="text-sm text-gray-500">0 LKR</span>
                        </div>
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-900 bg-blue-50 rounded-t-lg">
                        <div className="flex flex-col items-center">
                          <Star className="h-6 w-6 text-blue-600 mb-2" />
                          <span>Pro</span>
                          <span className="text-sm text-gray-500">600 LKR</span>
                          <Badge className="bg-blue-500 text-white text-xs mt-1">Popular</Badge>
                        </div>
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-900">
                        <div className="flex flex-col items-center">
                          <TreePine className="h-6 w-6 text-orange-600 mb-2" />
                          <span>Supporter</span>
                          <span className="text-sm text-gray-500">1,800 LKR</span>
                        </div>
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-900">
                        <div className="flex flex-col items-center">
                          <Crown className="h-6 w-6 text-purple-600 mb-2" />
                          <span>Partner</span>
                          <span className="text-sm text-gray-500">4,000 LKR</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureCategories.map((category, categoryIndex) => (
                      <>
                        <tr key={`category-${categoryIndex}`} className="bg-gray-50">
                          <td colSpan={5} className="py-3 px-6 font-semibold text-gray-900 text-lg">
                            {category.category}
                          </td>
                        </tr>
                        {category.features.map((feature, featureIndex) => (
                          <tr key={`feature-${categoryIndex}-${featureIndex}`} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-6 text-gray-700">{feature.name}</td>
                            <td className="py-3 px-6 text-center text-sm">
                              <span className="text-gray-700">{feature.free}</span>
                            </td>
                            <td className="py-3 px-6 text-center text-sm bg-blue-50">
                              <span className="text-blue-700 font-medium">{feature.pro}</span>
                            </td>
                            <td className="py-3 px-6 text-center text-sm">
                              <span className="text-orange-700">{feature.supporter}</span>
                            </td>
                            <td className="py-3 px-6 text-center text-sm">
                              <span className="text-purple-700 font-medium">{feature.partner}</span>
                            </td>
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards - Plan-based comparison */}
              <div className="lg:hidden space-y-6">
                {plans.map((plan) => (
                  <Card key={plan.id} className={`${plan.popular ? 'ring-2 ring-blue-500' : ''} ${plan.borderColor}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                            <plan.icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                            <p className="text-sm text-gray-500">{plan.badge}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {plan.price === "0" ? "Free" : `${plan.price} LKR`}
                          </div>
                          {plan.price !== "0" && <div className="text-xs text-gray-500">per {plan.period}</div>}
                        </div>
                      </div>
                      {plan.popular && (
                        <Badge className="bg-blue-500 text-white w-fit">Most Popular</Badge>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {featureCategories.map((category, categoryIndex) => (
                        <div key={categoryIndex}>
                          <h4 className="font-semibold text-gray-900 mb-3 text-sm border-b border-gray-200 pb-2">
                            {category.category}
                          </h4>
                          <div className="space-y-2">
                            {category.features.map((feature, featureIndex) => {
                              const planFeature = plan.id === "free" ? feature.free : 
                                                 plan.id === "pro" ? feature.pro :
                                                 plan.id === "supporter" ? feature.supporter : 
                                                 feature.partner;
                              
                              const isLimited = planFeature.toLowerCase().includes('limited') || 
                                              planFeature.includes('/month') || 
                                              planFeature.toLowerCase().includes('basic');
                              
                              const isNotAvailable = planFeature.toLowerCase().includes('not available') ||
                                                   planFeature.toLowerCase().includes('coming soon');
                              
                              return (
                                <div key={featureIndex} className="flex items-start justify-between py-1">
                                  <span className="text-sm text-gray-700 flex-1">{feature.name}</span>
                                  <div className="flex items-center gap-2 ml-3">
                                    {isNotAvailable ? (
                                      <>
                                        <X className="h-4 w-4 text-red-500" />
                                        <span className="text-xs text-red-600">Not Available</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className={`h-4 w-4 ${isLimited ? 'text-yellow-500' : 'text-green-500'}`} />
                                        <span className={`text-xs font-medium ${
                                          plan.id === "free" ? 'text-gray-700' :
                                          plan.id === "pro" ? 'text-blue-700' :
                                          plan.id === "supporter" ? 'text-orange-700' :
                                          'text-purple-700'
                                        }`}>
                                          {planFeature}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      <div className="pt-4 border-t border-gray-200">
                        <Button 
                          className={`w-full ${plan.popular ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-900 hover:bg-gray-800'} text-white`}
                          onClick={() => setSelectedPlan(plan.id)}
                        >
                          {plan.price === "0" ? "Get Started Free" : "Choose Plan"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Transparency Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Where Your Support Goes</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-6 w-6 text-blue-600" />
                  Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costBreakdown.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{item.category}</span>
                        <span className="text-sm font-bold text-gray-900">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-6 w-6 text-green-600" />
                  Your Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {impact.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Financial Assistance */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">💝 Financial Assistance Available</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                If cost is a barrier to your Bible study journey, please contact us about our scholarship program. 
                No one should be prevented from growing in God's Word due to financial constraints.
              </p>
              <Button asChild variant="outline" className="border-green-500 text-green-700 hover:bg-green-50">
                <Link to="/contact">Request Scholarship</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  Why not completely free?
                </h4>
                <p className="text-gray-600 text-sm">AI processing, secure storage, and content licensing require ongoing costs. We keep basic features free for everyone.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  How is this different from commercial apps?
                </h4>
                <p className="text-gray-600 text-sm">We're a ministry, not a business. Every rupee supports the mission - no profit margins or shareholders.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  Can I see how my money is used?
                </h4>
                <p className="text-gray-600 text-sm">Absolutely! We provide complete transparency with detailed cost breakdowns and impact reports.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  What if I can't afford it?
                </h4>
                <p className="text-gray-600 text-sm">Contact us about our scholarship program. We believe financial constraints shouldn't limit Bible study.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final Call to Action */}
        <div className="text-center">
          <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Begin Your Partnership</h2>
              <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                Join thousands worldwide in supporting accessible Bible study. 
                Your partnership enables deep spiritual growth for believers everywhere.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3">
                  <Heart className="mr-2 h-5 w-5" />
                  Support This Ministry
                </Button>
                <Button size="lg" variant="outline" className="border-orange-200 hover:bg-orange-50" asChild>
                  <Link to="/auth">
                    Start Free Trial
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
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
                                  <Link to="/chat" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                    AI Chat
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
                  href="mailto:bibleaura.contact@gmail.com" 
                  className="block text-gray-400 hover:text-orange-400 transition-colors duration-300"
                >
                  bibleaura.contact@gmail.com
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
                {/* Mobile/Tablet: Two lines */}
                <div className="lg:hidden">
                  <div className="mb-2">
                    <span>&copy; 2024 ✦Bible Aura. All rights reserved.</span>
                  </div>
                  <div>
                    <span>Developed by </span>
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
                
                {/* Desktop/Laptop: One line */}
                <div className="hidden lg:block">
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
        </div>
      </footer>
    </div>
  );
};

export default Funding; 