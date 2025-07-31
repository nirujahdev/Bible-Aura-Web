import { Shield, Lock, Eye, Database, FileText, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function DataPrivacySection() {
  const privacyFeatures = [
    {
      icon: Shield,
      title: "End-to-End Encryption",
      description: "Your Bible study data is protected with military-grade encryption both in transit and at rest.",
      highlight: "256-bit SSL encryption"
    },
    {
      icon: Lock,
      title: "Private Bible Study",
      description: "Your personal notes, prayers, and journal entries remain completely private and secure.",
      highlight: "Zero data sharing"
    },
    {
      icon: Eye,
      title: "No Data Selling",
      description: "We never sell your personal information or Bible study data to third parties. Period.",
      highlight: "100% commitment"
    },
    {
      icon: Database,
      title: "Secure Data Storage",
      description: "All data is stored in secure, GDPR-compliant servers with regular security audits.",
      highlight: "GDPR compliant"
    },
    {
      icon: FileText,
      title: "Transparent Policies",
      description: "Clear, easy-to-understand privacy policies with no hidden clauses or confusing terms.",
      highlight: "Clear policies"
    },
    {
      icon: Users,
      title: "User Control",
      description: "You have complete control over your data - export, delete, or modify anytime.",
      highlight: "Full control"
    }
  ];

  const stats = [
    { number: "100%", label: "Data Encryption", description: "All user data encrypted" },
    { number: "0", label: "Data Sales", description: "We never sell your data" },
    { number: "24/7", label: "Security Monitoring", description: "Continuous protection" },
    { number: "GDPR", label: "Compliance", description: "Full regulatory compliance" }
  ];

  return (
    <section className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-100 rounded-full">
              <Shield className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Your Data & Privacy
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            At Bible Aura, we understand that your spiritual journey is deeply personal. That's why we've built 
            our platform with privacy and security at its core, ensuring your Bible study remains private and protected.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">SOC 2 Type II Certified</span>
          </div>
        </div>

        {/* Privacy Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {privacyFeatures.map((feature, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-md border-gray-700 hover:bg-white/15 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      {feature.title}
                    </CardTitle>
                    <div className="inline-block mt-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {feature.highlight}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Privacy Statistics */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Privacy by the Numbers</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-white mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-400">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What We Protect */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-bold mb-6">What We Protect</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Personal Bible Study Notes</h4>
                  <p className="text-gray-300 text-sm">Your private reflections, insights, and journal entries</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">AI Chat Conversations</h4>
                  <p className="text-gray-300 text-sm">Your questions and discussions with Bible AI</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Reading History & Progress</h4>
                  <p className="text-gray-300 text-sm">Your Bible reading plans and spiritual journey</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Prayer Requests & Lists</h4>
                  <p className="text-gray-300 text-sm">Your personal prayers and spiritual requests</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Account Information</h4>
                  <p className="text-gray-300 text-sm">Email, preferences, and profile settings</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-6">How We Protect You</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Advanced Encryption</h4>
                  <p className="text-gray-300 text-sm">Bank-level security with 256-bit SSL encryption</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Secure Servers</h4>
                  <p className="text-gray-300 text-sm">SOC 2 certified data centers with 24/7 monitoring</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Regular Security Audits</h4>
                  <p className="text-gray-300 text-sm">Third-party security assessments and penetration testing</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Limited Access</h4>
                  <p className="text-gray-300 text-sm">Strict employee access controls and background checks</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Compliance Standards</h4>
                  <p className="text-gray-300 text-sm">GDPR, CCPA, and international privacy law compliance</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Promise */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 mb-16">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Our Privacy Promise</h3>
            <p className="text-blue-100 mb-6 max-w-3xl mx-auto">
              "We believe your spiritual journey is sacred and personal. Bible Aura will never compromise your 
              privacy for profit. Your trust is the foundation of our ministry, and we protect it with the highest 
              standards of security and transparency."
            </p>
            <div className="text-blue-200 font-medium">
              — The Bible Aura Team
            </div>
          </div>
        </div>

        {/* Data Rights */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-bold mb-8">Your Data Rights</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/5 backdrop-blur-md border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-white mb-2">Access Your Data</h4>
                <p className="text-gray-300 text-sm">
                  Request a complete copy of all your personal data at any time
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-yellow-100 rounded-full w-fit mx-auto mb-4">
                  <Database className="h-6 w-6 text-yellow-600" />
                </div>
                <h4 className="font-semibold text-white mb-2">Modify Your Data</h4>
                <p className="text-gray-300 text-sm">
                  Update, correct, or modify your personal information anytime
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <h4 className="font-semibold text-white mb-2">Delete Your Data</h4>
                <p className="text-gray-300 text-sm">
                  Permanently delete your account and all associated data
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Study the Bible Securely?</h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of believers who trust Bible Aura for their private, secure Bible study experience. 
            Start your spiritual journey with complete peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-full hover:from-blue-600 hover:to-blue-800 transition-all duration-200 font-medium">
                Start Secure Bible Study
              </Button>
            </Link>
            <Link to="/privacy">
              <Button variant="outline" className="border-gray-400 text-white px-8 py-3 rounded-full hover:bg-white/10 transition-all duration-200 font-medium">
                Read Privacy Policy
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Security Badges */}
        <div className="mt-16 pt-8 border-t border-gray-700">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <div className="text-xs text-gray-400">SOC 2 Type II</div>
            </div>
            <div className="text-center">
              <Lock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <div className="text-xs text-gray-400">256-bit SSL</div>
            </div>
            <div className="text-center">
              <Database className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <div className="text-xs text-gray-400">GDPR Compliant</div>
            </div>
            <div className="text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <div className="text-xs text-gray-400">CCPA Compliant</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 