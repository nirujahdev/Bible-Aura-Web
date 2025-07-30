import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Eye, Lock, Users, ArrowLeft, Mail, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy = () => {
  const lastUpdated = "January 16, 2025";

  const sections = [
    {
      title: "Information We Collect",
      icon: Eye,
      content: [
        {
          subtitle: "Personal Information",
          text: "We collect information you provide directly to us, including your name, email address, and any other information you choose to provide when creating an account or contacting us."
        },
        {
          subtitle: "Usage Information",
          text: "We automatically collect information about how you use our service, including your interactions with biblical content, search queries, and feature usage patterns."
        },
        {
          subtitle: "Device Information",
          text: "We collect information about the device you use to access our service, including device type, operating system, browser type, and IP address."
        }
      ]
    },
    {
      title: "How We Use Your Information",
      icon: Users,
      content: [
        {
          subtitle: "Service Provision",
          text: "We use your information to provide, maintain, and improve our AI-powered biblical insights service, including personalizing your experience and providing relevant content."
        },
        {
          subtitle: "Communication",
          text: "We may use your email address to send you service-related communications, updates about new features, and responses to your inquiries."
        },
        {
          subtitle: "Analytics and Improvement",
          text: "We analyze usage patterns to improve our service, develop new features, and enhance the accuracy of our AI biblical analysis."
        }
      ]
    },
    {
      title: "Data Protection",
      icon: Shield,
      content: [
        {
          subtitle: "Security Measures",
          text: "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction."
        },
        {
          subtitle: "Data Encryption",
          text: "All data transmission is encrypted using industry-standard SSL/TLS protocols, and sensitive information is encrypted at rest."
        },
        {
          subtitle: "Access Controls",
          text: "We maintain strict access controls and regularly review who has access to personal information within our organization."
        }
      ]
    },
    {
      title: "Your Rights",
      icon: Lock,
      content: [
        {
          subtitle: "Access and Correction",
          text: "You have the right to access, correct, or update your personal information at any time through your account settings or by contacting us."
        },
        {
          subtitle: "Data Portability",
          text: "You can request a copy of your personal data in a structured, commonly used format that allows you to transfer it to another service."
        },
        {
          subtitle: "Deletion",
          text: "You can request deletion of your personal information, subject to certain legal obligations and legitimate business interests."
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
            Privacy <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">Policy</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
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
              At Bible Aura, we are committed to protecting your privacy and personal information. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our AI-powered biblical 
              insights platform. By using our service, you agree to the collection and use of information in accordance 
              with this policy.
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

        {/* Data Sharing */}
        <Card className="mt-8 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Data Sharing and Disclosure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Third-Party Services</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may use third-party services to help us provide and improve our service. These services may have 
                  access to your information only to perform specific tasks on our behalf and are obligated not to 
                  disclose or use it for other purposes.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal Requirements</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may disclose your information if required by law, in response to valid requests by public authorities, 
                  or to protect our rights, privacy, safety, or property.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Transfers</h3>
                <p className="text-gray-700 leading-relaxed">
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred as part 
                  of the transaction, subject to appropriate safeguards.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card className="mt-8 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Cookies and Similar Technologies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, 
                and personalize content. You can control cookies through your browser settings, but some features 
                may not function properly if cookies are disabled.
              </p>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2">Types of Cookies We Use:</h4>
                <ul className="text-orange-700 space-y-1 text-sm">
                  <li>• Essential cookies for basic functionality</li>
                  <li>• Performance cookies for analytics</li>
                  <li>• Functional cookies for personalization</li>
                  <li>• Targeting cookies for relevant content</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card className="mt-8 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              Our service is not intended for children under the age of 13. We do not knowingly collect personal 
              information from children under 13. If you are a parent or guardian and believe your child has provided 
              personal information, please contact us immediately so we can remove such information.
            </p>
          </CardContent>
        </Card>

        {/* International Transfers */}
        <Card className="mt-8 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">International Data Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. We ensure 
              appropriate safeguards are in place to protect your information in accordance with applicable 
              data protection laws, including the use of standard contractual clauses approved by relevant authorities.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mt-8 border-2 border-orange-100">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
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

        {/* Updates Notice */}
        <Card className="mt-8 bg-gradient-to-r from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-orange-800 mb-2">Policy Updates</h3>
            <p className="text-orange-700 text-sm">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review 
              this Privacy Policy periodically for any changes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy; 