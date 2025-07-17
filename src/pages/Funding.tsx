import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Globe, Users, BookOpen, ArrowLeft, Star, Crown, Shield, CheckCircle, Gift, Wallet, CreditCard, Banknote, Smartphone, Quote } from "lucide-react";
import { Link } from "react-router-dom";

const Funding = () => {
  const impactAreas = [
    {
      icon: BookOpen,
      title: "Keep the App Free for Everyone",
      description: "Your gift ensures Bible Aura remains accessible to all believers worldwide, regardless of their financial situation.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Star,
      title: "Improve Bible AI Tools & Study Features",
      description: "Help us develop more advanced AI-powered insights and study tools to deepen biblical understanding.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Globe,
      title: "Help People Discover Jesus Worldwide",
      description: "Support our mission to reach souls across the globe with God's Word through innovative technology.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Heart,
      title: "Support a Faith-Based Tech Mission",
      description: "Join us in pioneering Christ-centered technology that honors God and serves His people.",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const givingOptions = [
    {
      type: "One-Time Gift",
      description: "Make a single donation to support our mission",
      icon: Gift,
      amounts: ["$25", "$50", "$100", "Custom"]
    },
    {
      type: "Monthly Partnership",
      description: "Become a monthly partner in spreading God's Word",
      icon: Heart,
      amounts: ["$10/mo", "$25/mo", "$50/mo", "Custom"]
    },
    {
      type: "Annual Commitment",
      description: "Make a yearly commitment to our ministry",
      icon: Crown,
      amounts: ["$120", "$300", "$600", "Custom"]
    }
  ];

  const paymentMethods = [
    { name: "Credit/Debit Card", icon: CreditCard, available: true },
    { name: "Bank Transfer", icon: Banknote, available: true },
    { name: "Mobile Payment", icon: Smartphone, available: true },
    { name: "UPI (India/Sri Lanka)", icon: Wallet, available: true }
  ];

  const trustPoints = [
    "All donations go directly toward platform development and global outreach",
    "Secure, encrypted payment processing with receipt confirmation",
    "Tax-deductible receipts provided for all qualifying donations",
    "Complete transparency in how your gifts are used for God's glory"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-white hover:text-orange-200 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <img src="/✦Bible Aura.svg" alt="✦Bible Aura" className="h-8 w-8" />
              <span className="text-xl font-bold">✦Bible Aura</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Support <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">The Mission</span>
          </h1>
          <div className="space-y-4 text-xl text-gray-600 max-w-4xl mx-auto">
            <p>
              Bible Aura is committed to helping people understand God's Word through AI-powered insights. 
              Your gift helps us keep the platform free, grow its reach, and serve people worldwide with Biblical truth.
            </p>
            <p className="text-lg font-medium text-orange-600">
              Join us in spreading God's Word through faith and innovation.
            </p>
          </div>
        </div>

        {/* Impact Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Why Give?</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Your generosity directly impacts lives and helps us fulfill the Great Commission through technology
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {impactAreas.map((area, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${area.color} text-white mb-4`}>
                    <area.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{area.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{area.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Call to Action */}
        <div className="text-center mb-16">
          <Card className="border-2 border-orange-100 bg-gradient-to-r from-orange-50 to-orange-100 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Give Now</h2>
              <p className="text-gray-600 mb-6">
                Your faithful giving helps us reach souls with the Gospel through innovative Bible study tools
              </p>
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-12 py-4 text-lg">
                <Heart className="mr-2 h-5 w-5" />
                Sow a Seed
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Giving Options */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Giving Options</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {givingOptions.map((option, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-4 mx-auto">
                    <option.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-bold">{option.type}</CardTitle>
                  <p className="text-gray-600">{option.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {option.amounts.map((amount, i) => (
                      <Button 
                        key={i} 
                        variant="outline" 
                        className="border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">We Accept</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {paymentMethods.map((method, index) => (
              <Card key={index} className="text-center py-6 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <method.icon className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-sm font-medium text-gray-700">{method.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Biblical Encouragement */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
            <CardContent className="p-8 text-center">
              <Quote className="h-12 w-12 text-orange-500 mx-auto mb-6" />
              <blockquote className="text-2xl font-semibold text-gray-800 mb-4">
                "God loves a cheerful giver."
              </blockquote>
              <cite className="text-lg text-orange-600 font-medium">— 2 Corinthians 9:7</cite>
              <div className="mt-6 pt-6 border-t border-orange-200">
                <blockquote className="text-xl text-gray-700 mb-2">
                  "Give, and it will be given to you. A good measure, pressed down, shaken together and running over, will be poured into your lap."
                </blockquote>
                <cite className="text-orange-600 font-medium">— Luke 6:38</cite>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust & Transparency Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Your Trust Matters</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-green-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-700">
                  <Shield className="h-6 w-6" />
                  <span>Transparency & Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {trustPoints.map((point, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-700">
                  <Users className="h-6 w-6" />
                  <span>Frequently Asked Questions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Is my donation secure?</h4>
                    <p className="text-gray-600 text-sm">Yes, we use industry-standard encryption and secure payment processors to protect your information.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Can I get a receipt?</h4>
                    <p className="text-gray-600 text-sm">Absolutely! You'll receive an immediate email receipt and tax documentation if applicable.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">How is my gift used?</h4>
                    <p className="text-gray-600 text-sm">Every dollar goes toward platform development, server costs, and expanding our global reach with the Gospel.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final Call to Action */}
        <div className="text-center">
          <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Partner With Us Today</h2>
              <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                Join thousands of believers who are supporting the advancement of God's Kingdom through technology. 
                Your partnership makes eternal impact possible.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3">
                  <Heart className="mr-2 h-5 w-5" />
                  Give Now
                </Button>
                <Button size="lg" variant="outline" className="border-orange-200 hover:bg-orange-50" asChild>
                  <Link to="/contact">
                    Learn More About Our Mission
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Funding; 