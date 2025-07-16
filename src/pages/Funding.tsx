import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Target, DollarSign, ArrowLeft, Star, Crown, Rocket, Globe, Heart, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Funding = () => {
  const fundingRounds = [
    {
      round: "Pre-Seed",
      amount: "$50K",
      stage: "Completed",
      date: "Q2 2024",
      description: "Initial development and prototype funding",
      investors: ["Founder Investment", "Angel Investors"],
      status: "completed"
    },
    {
      round: "Seed",
      amount: "$250K",
      stage: "Current",
      date: "Q1 2025",
      description: "Platform development and user acquisition",
      investors: ["Seeking Strategic Partners"],
      status: "current"
    },
    {
      round: "Series A",
      amount: "$1M",
      stage: "Planned",
      date: "Q4 2025",
      description: "Global expansion and advanced AI features",
      investors: ["To Be Announced"],
      status: "planned"
    }
  ];

  const keyMetrics = [
    { metric: "Monthly Users", value: "10,000+", growth: "+150%" },
    { metric: "Revenue Growth", value: "$25K", growth: "+300%" },
    { metric: "User Retention", value: "85%", growth: "+15%" },
    { metric: "Market Size", value: "$2.1B", growth: "Global" }
  ];

  const roadmapMilestones = [
    {
      quarter: "Q1 2025",
      title: "Advanced AI Features",
      description: "Enhanced natural language processing and personalized recommendations",
      status: "in-progress"
    },
    {
      quarter: "Q2 2025",
      title: "Mobile App Launch",
      description: "iOS and Android applications with offline capabilities",
      status: "planned"
    },
    {
      quarter: "Q3 2025",
      title: "Multi-Language Support",
      description: "Support for Spanish, French, and Portuguese",
      status: "planned"
    },
    {
      quarter: "Q4 2025",
      title: "Global Expansion",
      description: "International market entry and partnerships",
      status: "planned"
    }
  ];

  const investmentHighlights = [
    {
      icon: TrendingUp,
      title: "Rapid Growth",
      description: "150% monthly user growth with strong retention rates",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Users,
      title: "Engaged Community",
      description: "10,000+ active users with 85% retention rate",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Target,
      title: "Large Market",
      description: "Addressing $2.1B global religious education market",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Rocket,
      title: "AI Innovation",
      description: "Cutting-edge AI technology for biblical insights",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const useOfFunds = [
    { category: "Product Development", percentage: 40, color: "bg-blue-500" },
    { category: "Marketing & Growth", percentage: 30, color: "bg-green-500" },
    { category: "Team Expansion", percentage: 20, color: "bg-purple-500" },
    { category: "Operations", percentage: 10, color: "bg-orange-500" }
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
            Funding <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">Our Mission</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join us in revolutionizing biblical education through AI technology. 
            We're building the future of spiritual learning and seeking strategic partners to scale our impact.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {keyMetrics.map((metric, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-orange-600 mb-2">{metric.value}</div>
                <div className="text-sm text-gray-600 mb-2">{metric.metric}</div>
                <Badge className="bg-green-100 text-green-800">{metric.growth}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Investment Highlights */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Investment Highlights</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {investmentHighlights.map((highlight, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${highlight.color} text-white mb-4`}>
                    <highlight.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{highlight.title}</h3>
                  <p className="text-gray-600 text-sm">{highlight.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Funding Rounds */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Funding Journey</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {fundingRounds.map((round, index) => (
              <Card key={index} className={`relative overflow-hidden ${
                round.status === 'current' ? 'ring-2 ring-orange-500' : ''
              }`}>
                {round.status === 'current' && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-2 text-sm font-semibold">
                    Current Round
                  </div>
                )}
                <CardHeader className={`${round.status === 'current' ? 'pt-12' : ''}`}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">{round.round}</CardTitle>
                    <Badge className={
                      round.status === 'completed' ? 'bg-green-100 text-green-800' :
                      round.status === 'current' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {round.stage}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-orange-600">{round.amount}</div>
                  <div className="text-sm text-gray-600">{round.date}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{round.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Investors:</h4>
                    <ul className="text-sm text-gray-600">
                      {round.investors.map((investor, i) => (
                        <li key={i} className="flex items-center">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                          {investor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Use of Funds */}
        <div className="grid lg:grid-cols-2 gap-16 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Use of Funds</h2>
            <div className="space-y-6">
              {useOfFunds.map((fund, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-medium">{fund.category}</span>
                    <span className="text-orange-600 font-semibold">{fund.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${fund.color} transition-all duration-500`}
                      style={{ width: `${fund.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Roadmap 2025</h2>
            <div className="space-y-6">
              {roadmapMilestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    milestone.status === 'in-progress' ? 'bg-orange-500' : 'bg-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
                      <Badge className={
                        milestone.status === 'in-progress' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                      }>
                        {milestone.quarter}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Investment Opportunity */}
        <Card className="border-2 border-orange-100 mb-16">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Investment Opportunity</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We're currently raising our seed round to accelerate growth and expand our AI capabilities. 
                Join us in transforming how millions of people study and understand Scripture.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">$250K</div>
                <div className="text-gray-600">Current Round</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">$2.1B</div>
                <div className="text-gray-600">Market Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">10,000+</div>
                <div className="text-gray-600">Active Users</div>
              </div>
            </div>

            <div className="text-center">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3" asChild>
                <Link to="/contact">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Interested in Investing?
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Team & Vision */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Vision</h2>
          <p className="text-gray-600 max-w-4xl mx-auto mb-8">
            We envision a world where every believer has access to deep, personalized biblical insights through AI technology. 
            Our mission is to democratize biblical education and make spiritual growth accessible to everyone, regardless of 
            their theological background or geographic location.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white mb-4">
                  <Globe className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Global Impact</h3>
                <p className="text-gray-600 text-sm">Reaching believers worldwide with AI-powered biblical insights</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white mb-4">
                  <Heart className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Faith-Centered</h3>
                <p className="text-gray-600 text-sm">Technology that respects and enhances spiritual growth</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white mb-4">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Excellence</h3>
                <p className="text-gray-600 text-sm">Committed to the highest standards of accuracy and innovation</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Funding; 