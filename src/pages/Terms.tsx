import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, FileText, AlertTriangle, Shield, ArrowLeft, Mail, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Terms = () => {
  const lastUpdated = "January 16, 2025";

  const sections = [
    {
      title: "Acceptance of Terms",
      icon: Scale,
      content: [
        {
          subtitle: "Agreement to Terms",
          text: "By accessing and using Bible Aura, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
        },
        {
          subtitle: "Modifications",
          text: "We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service constitutes acceptance of the modified terms."
        }
      ]
    },
    {
      title: "Service Description",
      icon: FileText,
      content: [
        {
          subtitle: "AI-Powered Biblical Insights",
          text: "Bible Aura provides AI-powered biblical analysis, study tools, and spiritual guidance. Our service uses advanced natural language processing to provide contextual insights into Scripture."
        },
        {
          subtitle: "Service Availability",
          text: "While we strive to provide continuous service, we do not guarantee uninterrupted access. We may temporarily suspend service for maintenance, updates, or unforeseen circumstances."
        },
        {
          subtitle: "Content Accuracy",
          text: "While we strive for accuracy in our AI-generated content, we cannot guarantee complete theological accuracy. Users should verify important information with authoritative sources."
        }
      ]
    },
    {
      title: "User Responsibilities",
      icon: AlertTriangle,
      content: [
        {
          subtitle: "Account Security",
          text: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
        },
        {
          subtitle: "Appropriate Use",
          text: "You agree to use the service only for lawful purposes and in accordance with these terms. You will not use the service to harm others or violate any laws."
        },
        {
          subtitle: "Content Submission",
          text: "Any content you submit must be accurate, not violate others' rights, and comply with our community guidelines."
        }
      ]
    },
    {
      title: "Intellectual Property",
      icon: Shield,
      content: [
        {
          subtitle: "Our Content",
          text: "All content, features, and functionality on Bible Aura are owned by us or our licensors and are protected by intellectual property laws."
        },
        {
          subtitle: "Your Content",
          text: "You retain rights to content you submit, but grant us a license to use, modify, and distribute it in connection with our service."
        },
        {
          subtitle: "Respect for Others",
          text: "You agree not to infringe on the intellectual property rights of others when using our service."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background w-full">


      {/* Hero Section */}
              <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Terms of <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">Service</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
            Please read these terms carefully before using Bible Aura. They govern your use of our service.
          </p>
          <div className="flex items-center justify-center text-gray-500 text-sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last updated: {lastUpdated}
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-8 border-2 border-orange-100">
          <CardContent className="p-8">
            <p className="text-gray-700 leading-relaxed">
              Welcome to Bible Aura! These Terms of Service ("Terms") govern your use of our AI-powered biblical 
              insights platform. By accessing or using our service, you agree to be bound by these Terms. 
              If you disagree with any part of these terms, then you may not access the service.
            </p>
          </CardContent>
        </Card>

        {/* Main Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mr-4">
                    <section.icon className="h-6 w-6" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.subtitle}</h3>
                      <p className="text-gray-700 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment and Billing */}
        <Card className="mt-8 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Payment and Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Subscription Plans</h3>
                <p className="text-gray-700 leading-relaxed">
                  We offer various subscription plans with different features and pricing. Subscription fees are 
                  billed in advance and are non-refundable except as required by law.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Automatic Renewal</h3>
                <p className="text-gray-700 leading-relaxed">
                  Subscriptions automatically renew unless canceled before the renewal date. You may cancel 
                  your subscription at any time through your account settings.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Price Changes</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may change subscription prices with 30 days' notice. Price changes will not affect 
                  your current billing cycle but will apply to subsequent renewals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prohibited Uses */}
        <Card className="mt-8 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Prohibited Uses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                You may not use our service for any of the following prohibited purposes:
              </p>
              <div className="bg-red-50 p-4 rounded-lg">
                <ul className="text-red-700 space-y-2 text-sm">
                  <li>• Illegal activities or violation of any laws</li>
                  <li>• Harassment, abuse, or harm to others</li>
                  <li>• Spreading false or misleading information</li>
                  <li>• Attempting to gain unauthorized access to systems</li>
                  <li>• Interfering with the service or other users</li>
                  <li>• Commercial use without proper authorization</li>
                  <li>• Violating intellectual property rights</li>
                  <li>• Transmitting malware or harmful code</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card className="mt-8 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Disclaimers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Generated Content</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our AI-generated biblical insights are for educational and inspirational purposes only. 
                  They should not be considered as authoritative theological doctrine or replace consultation 
                  with qualified religious leaders.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Availability</h3>
                <p className="text-gray-700 leading-relaxed">
                  We provide the service "as is" without warranties of any kind. We do not guarantee 
                  uninterrupted access, accuracy of content, or freedom from errors.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Third-Party Content</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may include links to third-party content. We are not responsible for the accuracy, 
                  content, or availability of such external resources.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="mt-8 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                To the fullest extent permitted by law, Bible Aura shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages, including without limitation, 
                loss of profits, data, use, goodwill, or other intangible losses.
              </p>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-orange-700 text-sm">
                  In no event shall our total liability to you for all damages exceed the amount paid 
                  by you for the service during the 12 months preceding the claim.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mt-8 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Termination</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">By You</h3>
                <p className="text-gray-700 leading-relaxed">
                  You may terminate your account at any time by following the account deletion process 
                  in your settings or by contacting us directly.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">By Us</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may terminate or suspend your account immediately if you violate these Terms or 
                  engage in conduct that we deem harmful to other users or our service.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Effect of Termination</h3>
                <p className="text-gray-700 leading-relaxed">
                  Upon termination, your right to use the service will cease immediately. We may 
                  retain certain information as required by law or for legitimate business purposes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mt-8 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of Sri Lanka, 
              without regard to its conflict of law provisions. Any disputes arising under these Terms 
              shall be resolved through binding arbitration or in the courts of Sri Lanka.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mt-8 border-2 border-orange-100">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <Mail className="h-5 w-5 mr-3 text-orange-600" />
                <span>bibleaura.contact@gmail.com</span>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="mr-3">📞</span>
                <span>+94 769 197 386</span>
              </div>
            </div>
            <div className="mt-6">
              <Button asChild className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <Link to="/contact">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Us
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Acknowledgment */}
        <Card className="mt-8 bg-gradient-to-r from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-orange-800 mb-2">Acknowledgment</h3>
            <p className="text-orange-700 text-sm">
              By using Bible Aura, you acknowledge that you have read, understood, and agree to be bound 
              by these Terms of Service. These terms constitute the entire agreement between you and 
              Bible Aura regarding your use of the service.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms; 