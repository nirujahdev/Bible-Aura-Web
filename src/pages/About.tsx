import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Target, Lightbulb, ArrowLeft, Star, Crown, BookOpen, Brain, MessageCircle, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Faith-Centered",
      description: "Everything we do is rooted in deep reverence for Scripture and commitment to spiritual growth."
    },
    {
      icon: Brain,
      title: "Innovation",
      description: "We leverage cutting-edge AI technology to make biblical insights more accessible and meaningful."
    },
    {
      icon: Users,
      title: "Community",
      description: "Building a global community of believers united in their journey of faith and discovery."
    },
    {
      icon: Shield,
      title: "Integrity",
      description: "We maintain the highest standards of theological accuracy and ethical responsibility."
    }
  ];

  const milestones = [
    {
      year: "2023",
      title: "The Vision",
      description: "Bible Aura was conceived with the vision of making biblical wisdom accessible through AI technology."
    },
    {
      year: "2024",
      title: "Platform Launch",
      description: "Launched the beta version with core AI analysis features and biblical study tools."
    },
    {
      year: "2024",
      title: "Community Growth",
      description: "Reached 10,000+ active users worldwide, building a thriving community of believers."
    },
    {
      year: "2025",
      title: "Advanced Features",
      description: "Introduced personalized study plans, sermon library, and enhanced AI capabilities."
    }
  ];

  const teamMembers = [
    {
      name: "Benaiah Nicholas Nimal",
      role: "Founder & Lead Developer",
      description: "Passionate about combining technology with faith to create meaningful spiritual experiences.",
      skills: ["AI Development", "Theological Research", "Product Design"]
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Users" },
    { number: "500K+", label: "Bible Analyses" },
    { number: "50+", label: "Bible Translations" },
    { number: "99.9%", label: "Uptime" }
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
            About <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">✦Bible Aura</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transforming spiritual journeys through AI-powered biblical insights, connecting believers worldwide with the timeless wisdom of Scripture.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <Card className="border-2 border-orange-100 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-4">
                <Target className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed text-center">
                To democratize biblical wisdom by making profound spiritual insights accessible to everyone, 
                regardless of their theological background, through innovative AI technology that respects 
                the sacred nature of Scripture while enhancing understanding and personal growth.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-100 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white mb-4">
                <Lightbulb className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed text-center">
                To become the world's most trusted platform for AI-enhanced biblical study, fostering 
                a global community where faith and technology unite to deepen spiritual understanding 
                and transform lives through the power of God's Word.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-8 mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Our Values</h2>
          <p className="text-gray-600 text-center mb-12">The principles that guide everything we do</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white mb-4">
                    <value.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Story/Timeline */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Journey</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{milestone.title}</h3>
                      <span className="text-orange-600 font-semibold">{milestone.year}</span>
                    </div>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Meet Our Team</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{member.name}</h3>
                        <p className="text-orange-600 font-semibold mb-3">{member.role}</p>
                        <p className="text-gray-600 mb-4">{member.description}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                          {member.skills.map((skill, skillIndex) => (
                            <span key={skillIndex} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Powered by Advanced Technology</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white mb-4">
                <Brain className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI & Machine Learning</h3>
              <p className="text-gray-600 text-sm">Advanced natural language processing for biblical text analysis</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white mb-4">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Theological Database</h3>
              <p className="text-gray-600 text-sm">Comprehensive theological knowledge base with scholarly insights</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white mb-4">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Conversational AI</h3>
              <p className="text-gray-600 text-sm">Interactive chat system for personalized biblical guidance</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Mission</h2>
          <p className="text-gray-600 mb-8">Be part of a community that's transforming how we study and understand Scripture</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3" asChild>
              <Link to="/auth">
                <Star className="mr-2 h-5 w-5" />
                Start Your Journey
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50 px-8 py-3" asChild>
              <Link to="/contact">
                <MessageCircle className="mr-2 h-5 w-5" />
                Get in Touch
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 