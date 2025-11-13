import { GlobalNavigation } from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";
import { FileText, Shield, AlertTriangle, Mail, CheckCircle, Lock, BookOpen } from "lucide-react";
import { useSEO, SEO_CONFIG } from "@/hooks/useSEO";

const TermsOfService = () => {
  useSEO({
    title: "Terms of Service - Bible Aura | Usage Agreement",
    description: "Read Bible Aura's Terms of Service to understand the rules and guidelines for using our AI-powered Bible study platform. Learn about your rights and responsibilities.",
    keywords: "terms of service, usage agreement, Bible Aura terms, user agreement"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Hero Section */}
      <section className="py-16 pt-32 bg-gradient-to-r from-orange-500 via-purple-600 to-blue-600 text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur mb-6">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Bible Aura Terms of Service
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Understanding your rights and responsibilities when using Bible Aura
            </p>
            <p className="text-sm md:text-base text-white/80 mt-4">
              Effective Date: 11 August 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 lg:p-10 space-y-8">
            
            {/* Introduction */}
            <div className="border-b border-gray-200 pb-6">
              <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                These Terms of Service ("Terms") govern your access to and use of Bible Aura ("we," "our," "us"). By using Bible Aura, you agree to these Terms and our Privacy Policy.
              </p>
              <p className="text-gray-700 leading-relaxed text-base md:text-lg mt-4">
                Bible Aura is an online tool that provides AI-assisted biblical study, scripture insights, and related features. The service is provided free of charge.
              </p>
            </div>

            {/* Section 1 */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mt-1">
                  <span className="text-orange-600 font-bold text-sm">1</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-orange-500" />
                    Eligibility and Acceptance
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    By using Bible Aura, you confirm that:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>You are at least 13 years old.</li>
                    <li>If under 18, you have parental or guardian permission.</li>
                    <li>You agree to comply with these Terms and all applicable laws.</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    If you do not agree with these Terms, please discontinue using Bible Aura.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mt-1">
                  <span className="text-orange-600 font-bold text-sm">2</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-orange-500" />
                    Services We Provide
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Bible Aura provides the following features:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>AI-powered Bible chat</li>
                    <li>Scripture explanations and study assistance</li>
                    <li>Personalized history of your chats</li>
                    <li>Saving your past interactions</li>
                    <li>Verse lookups, character studies, parable insights</li>
                    <li>General biblical learning tools</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4 mb-3">
                    We aim for reliable service but cannot guarantee uninterrupted or error-free operation.
                  </p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mt-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-yellow-800 font-semibold mb-1">Important:</p>
                        <p className="text-yellow-700 text-sm leading-relaxed">
                          AI responses are generated automatically and may contain inaccuracies or outdated information. They are intended for study support only, not as authoritative, professional, or doctrinal guidance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mt-1">
                  <span className="text-orange-600 font-bold text-sm">3</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="h-6 w-6 text-orange-500" />
                    Account Registration and Security
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    If you create an account:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>You must provide accurate details (name, email, phone, optional denomination).</li>
                    <li>You are responsible for keeping your password secure.</li>
                    <li>You are responsible for all activity carried out using your account.</li>
                    <li>We may suspend or restrict accounts involved in misuse, abuse, or suspicious activity.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mt-1">
                  <span className="text-orange-600 font-bold text-sm">4</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Appropriate Use of Bible Aura
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    You agree not to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Use the service for harmful, abusive, hateful, or unlawful activities</li>
                    <li>Attempt to hack, overload, or disrupt the service</li>
                    <li>Reverse engineer or copy the system or AI models</li>
                    <li>Upload or share harmful, misleading, or illegal content</li>
                    <li>Share sensitive personal information through the chat</li>
                    <li>Interfere with the usage of other users</li>
                    <li>Use AI-generated content in a misleading way</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    We may restrict or terminate accounts that violate these rules.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mt-1">
                  <span className="text-orange-600 font-bold text-sm">5</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Content and Intellectual Property
                  </h2>
                  
                  <div className="space-y-4 ml-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">AI-Generated Content</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                        <li>Provided for informational and educational purposes</li>
                        <li>Not guaranteed to be accurate</li>
                        <li>Should be verified with trusted sources</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Content</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                        <li>You retain ownership of notes, queries, or content you submit.</li>
                        <li>You grant us permission to store and process it so the service can function.</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Our Property</h3>
                      <p className="text-gray-700 leading-relaxed mb-2">
                        Bible Aura's:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                        <li>Website design</li>
                        <li>Technology</li>
                        <li>Branding and logos</li>
                        <li>Original content</li>
                      </ul>
                      <p className="text-gray-700 leading-relaxed mt-2">
                        are protected by copyright and intellectual property laws.
                      </p>
                      <p className="text-gray-700 leading-relaxed mt-2">
                        You may not copy, redistribute, or reuse our materials without permission.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 6 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mt-1">
                  <span className="text-orange-600 font-bold text-sm">6</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="h-6 w-6 text-orange-500" />
                    Privacy
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Your use of Bible Aura is governed by our Privacy Policy, which explains how we collect, use, and store your information.</li>
                    <li>We do not sell personal data.</li>
                    <li>Your chats may be used to improve AI performance in accordance with OpenAI's policies.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 7 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mt-1">
                  <span className="text-orange-600 font-bold text-sm">7</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Disclaimers and Limitations
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Bible Aura is provided "as is", without warranties of any kind.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    We do not guarantee:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Accuracy of AI responses</li>
                    <li>Availability or uptime</li>
                    <li>That the service will be error-free</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4 mb-3">
                    We are not liable for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Loss of data</li>
                    <li>Misinterpretation of AI content</li>
                    <li>Damage caused by system errors or outages</li>
                    <li>User actions taken based on AI responses</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    To the extent permitted by law, our liability is limited to the maximum allowed under Sri Lankan law.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 8 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mt-1">
                  <span className="text-orange-600 font-bold text-sm">8</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Termination
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>You may delete your data or account at any time by contacting us.</li>
                    <li>We may suspend or terminate access if:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>You violate these Terms</li>
                        <li>Your account poses security risks</li>
                        <li>You intentionally misuse the platform</li>
                      </ul>
                    </li>
                    <li>Deleted data will be handled according to our retention policy.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 9 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mt-1">
                  <span className="text-orange-600 font-bold text-sm">9</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Updates to These Terms
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>We may update these Terms from time to time.</li>
                    <li>When major updates occur, we will post the revised version with an updated effective date.</li>
                    <li>Continued use of Bible Aura after updates means you accept the revised Terms.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 10 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mt-1">
                  <span className="text-orange-600 font-bold text-sm">10</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Governing Law
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    These Terms are governed by the laws of Sri Lanka, without regard to conflict-of-law principles.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 11 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mt-1">
                  <span className="text-orange-600 font-bold text-sm">11</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="h-6 w-6 text-orange-500" />
                    Contact Us
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    For questions, concerns, or legal inquiries, please contact:
                  </p>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-gray-800 font-semibold flex items-center gap-2">
                      <Mail className="h-5 w-5 text-orange-600" />
                      <a href="mailto:contact@bibleaura.xyz" className="text-orange-600 hover:text-orange-700">
                        contact@bibleaura.xyz
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TermsOfService;

