import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Eye, Lock, Users, ArrowLeft, Mail, Calendar, CheckCircle, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

const Privacy = () => {
  const lastUpdated = "January 16, 2025";

  // SEO optimization for privacy policy
  useSEO({
    title: "Privacy Policy | Bible Aura - Your Data Protection & Security",
    description: "Learn how Bible Aura protects your privacy and personal data. We're committed to keeping your Bible study, journals, and spiritual journey completely private and secure.",
    keywords: "Bible Aura privacy policy, data protection, user privacy, secure Bible app, Christian app privacy, spiritual data security, Bible AI privacy",
    canonicalUrl: "https://bibleaura.xyz/privacy"
  });

  const sections = [
    {
      title: "Google User Data Collection & Use",
      icon: Shield,
      content: [
        {
          subtitle: "Google Account Information",
          text: "When you sign in with Google, we collect your email address and basic profile information (name) solely for account verification, user authentication, and to provide personalized Bible study experiences. This data is used exclusively within Bible Aura and is never shared with third parties."
        },
        {
          subtitle: "Data Usage Limitations",
          text: "We strictly adhere to Google's Limited Use Requirements. Your Google user data is used only to provide or improve user-facing features that are prominent in Bible Aura's interface. We do not use your data for advertising, selling to data brokers, AI model training, or any purposes beyond our core Bible study functionality."
        },
        {
          subtitle: "API Request Management",
          text: "We use your Google account information to manage API request quotas, determine pricing tier eligibility, and ensure fair usage of our AI-powered biblical insights service. This helps us provide reliable service to all users."
        }
      ]
    },
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
    },
    {
      title: "Data Sharing & Third Parties",
      icon: Lock,
      content: [
        {
          subtitle: "No Data Selling",
          text: "We do not sell, rent, or trade your personal information or Google user data to any third parties for any purpose. Your data stays within Bible Aura's secure environment."
        },
        {
          subtitle: "No AI Training Use",
          text: "We do not use your personal information, Google user data, or any content you create within Bible Aura to train artificial intelligence models, machine learning algorithms, or any automated systems. Your data is used solely for providing our service to you."
        },
        {
          subtitle: "Limited Exceptions",
          text: "We may share your information only in the following limited circumstances: (1) with your explicit consent, (2) to comply with legal obligations, (3) to protect our rights or safety, or (4) as part of a business transaction with prior user consent."
        }
      ]
    },
    {
      title: "Data Retention & Deletion",
      icon: Calendar,
      content: [
        {
          subtitle: "Retention Period",
          text: "We retain your personal information only as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Google user data is retained only while your account is active or as needed to provide services."
        },
        {
          subtitle: "Account Deletion",
          text: "When you delete your account, we promptly delete your personal information and Google user data from our active systems within 30 days, except where longer retention is required by law or for legitimate business purposes."
        },
        {
          subtitle: "Data Export",
          text: "Before account deletion, you can request an export of your personal data in a portable format. Contact us at contact@bibleaura.xyz to request data export or deletion."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Back Button */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-8">
        <Button asChild variant="ghost" className="text-gray-600 hover:text-orange-600">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Enhanced Hero Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Privacy <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">Policy</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information when you use Bible Aura.
          </p>
          <div className="flex items-center justify-center text-gray-500 text-sm mb-8">
            <Calendar className="h-4 w-4 mr-2" />
            Last updated: {lastUpdated}
          </div>

          {/* Privacy Guarantee Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-800 mb-2">Your Data Stays Private</h3>
                <p className="text-green-700 text-sm">We never sell or share your personal information</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-6 text-center">
                <Lock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-blue-800 mb-2">Secure Encryption</h3>
                <p className="text-blue-700 text-sm">All data is encrypted and stored securely</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardContent className="p-6 text-center">
                <Eye className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-purple-800 mb-2">Full Transparency</h3>
                <p className="text-purple-700 text-sm">Clear and honest about what we collect</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section - Privacy & Terms Buttons */}
        <Card className="mb-12 border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Important Legal Documents</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Please review both our Privacy Policy and Terms of Service to understand how we protect your data and the terms governing your use of Bible Aura.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <Link to="/privacy">
                  <Shield className="mr-3 h-5 w-5" />
                  Privacy Policy
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <Link to="/terms">
                  <FileText className="mr-3 h-5 w-5" />
                  Terms of Service
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Introduction */}
        <Card className="mb-8 border-2 border-orange-100">
          <CardContent className="p-8">
            <p className="text-gray-700 leading-relaxed text-lg">
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
                <span>contact@bibleaura.xyz</span>
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

        {/* Google API Services Compliance */}
        <Card className="mt-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Google API Services Data Use</h3>
            <p className="text-blue-700 text-sm mb-3">
              Bible Aura's use of information received from Google APIs adheres to the{" "}
              <a 
                href="https://developers.google.com/terms/api-services-user-data-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-blue-900"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
            <p className="text-blue-700 text-sm">
              We comply with all Google OAuth 2.0 policies and do not use Google user data for purposes 
              beyond providing our core Bible study functionality. Your Google account information is 
              handled with the highest security standards and is never shared with unauthorized parties.
            </p>
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