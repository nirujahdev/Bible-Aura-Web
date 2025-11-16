import { GlobalNavigation } from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Lock, Eye, FileText, Mail, CheckCircle } from "lucide-react";
import { useSEO, SEO_CONFIG } from "@/hooks/useSEO";

const PrivacyPolicy = () => {
  useSEO({
    title: "Privacy Policy - Bible Aura | Data Protection & Privacy",
    description: "Bible Aura's Privacy Policy explains how we collect, use, and protect your personal information. Learn about our commitment to your privacy and data security.",
    keywords: "privacy policy, data protection, Bible Aura privacy, user data security"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Hero Section */}
      <section className="py-16 pt-32 bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur mb-6">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Bible Aura Privacy Policy
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Your privacy and data security are our top priorities
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
                Bible Aura ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains what information we collect, how we use it, and what choices you have.
              </p>
              <p className="text-gray-700 leading-relaxed text-base md:text-lg mt-4">
                By using Bible Aura, you agree to the practices described in this policy.
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
                    <FileText className="h-6 w-6 text-orange-500" />
                    Information We Collect
                  </h2>
                  
                  <div className="space-y-4 ml-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                        A. Information You Provide
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        We collect information you voluntarily submit, including:
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700 ml-4">
                        <li>Name</li>
                        <li>Email address</li>
                        <li>Phone number</li>
                        <li>Age</li>
                        <li>Denomination (optional)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-blue-500" />
                        B. Usage Data
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        We collect information about how you use Bible Aura, including:
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700 ml-4">
                        <li>Pages you visit</li>
                        <li>Features you interact with</li>
                        <li>Chat interactions with the AI</li>
                        <li>Time and duration of usage</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Lock className="h-5 w-5 text-blue-500" />
                        C. Technical Information
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        This includes:
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700 ml-4">
                        <li>Browser type</li>
                        <li>Device type</li>
                        <li>IP address (for security and basic analytics)</li>
                      </ul>
                    </div>
                  </div>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    How Your Data Is Used
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    We use your data to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Provide and operate the Bible Aura service</li>
                    <li>Improve accuracy, performance, and user experience</li>
                    <li>Maintain security and prevent misuse</li>
                    <li>Communicate updates and support</li>
                    <li>Store your chat history so you can access or delete it</li>
                    <li>Personalize your experience if you create an account</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4 font-semibold">
                    We do not use your data for marketing without your consent.
                  </p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    AI Chat Interactions
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Your chats may be stored so you can view and manage them later.</li>
                    <li>You can delete your chat history at any time.</li>
                    <li>We do not share personal chat content publicly.</li>
                    <li>AI responses may sometimes be incorrect, and you should not rely on them for legal, medical, or safety-critical decisions.</li>
                    <li>Avoid sharing sensitive personal information with the AI.</li>
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
                    Data Sharing
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-3 font-semibold">
                    We do not sell or rent your personal data.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    We only share information in these situations:
                  </p>
                  <div className="space-y-3 ml-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">A. Service Operation</h3>
                      <p className="text-gray-700 leading-relaxed">
                        We share only the minimum required data with backend systems to process your requests (e.g., generating AI responses).
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">B. Legal Requirements</h3>
                      <p className="text-gray-700 leading-relaxed">
                        We may disclose data if required by law, regulation, or a valid legal request.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">C. Security</h3>
                      <p className="text-gray-700 leading-relaxed">
                        We may share information to investigate fraud, misuse, threats, or system abuse.
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mt-4 font-semibold">
                    No personal data is shared with religious institutions or commercial advertisers.
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
                    Data Retention
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Account information is stored until you delete your account.</li>
                    <li>Chat history is stored until you delete it.</li>
                    <li>Technical and analytics data may be kept for security and performance purposes.</li>
                    <li>You may request deletion of your personal information at any time.</li>
                  </ul>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Your Rights
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    You have the right to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Access the personal data we hold about you</li>
                    <li>Request corrections</li>
                    <li>Request deletion</li>
                    <li>Request a copy of your data</li>
                    <li>Withdraw consent for optional data uses</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    To exercise your rights, email us at: <a href="mailto:contact@bibleaura.xyz" className="text-orange-600 hover:text-orange-700 font-semibold">contact@bibleaura.xyz</a>
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-2">
                    We will process your request within 7 working days.
                  </p>
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
                    Data Security
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>We use industry-standard administrative, technical, and physical safeguards to protect your information.</li>
                    <li>However, no digital service can guarantee 100% security.</li>
                    <li>You are responsible for keeping your login details secure.</li>
                  </ul>
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
                    Children's Privacy
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Bible Aura is not intended for children under 13 years old.</li>
                    <li>We do not knowingly collect data from children under 13.</li>
                    <li>If we discover such data, we will delete it immediately.</li>
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
                    Links to External Websites
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Bible Aura may contain links to other sites.</li>
                    <li>We are not responsible for the privacy practices of those websites.</li>
                    <li>We encourage you to review their privacy policies before engaging with them.</li>
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
                    Policy Updates
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>We may update this Privacy Policy from time to time.</li>
                    <li>If significant changes are made, we will notify users by posting an updated version with a new Effective Date.</li>
                    <li>Continued use of the service means you accept the updated policy.</li>
                  </ul>
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
                  <p className="text-gray-700 leading-relaxed">
                    If you have any questions or concerns about this Privacy Policy or our data handling practices, please contact:
                  </p>
                  <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
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

            {/* Action Buttons */}
            <div className="pt-8 border-t border-gray-200 mt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                  <Link to="/contact">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Us
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/terms-of-service">
                    <FileText className="h-4 w-4 mr-2" />
                    View Terms of Service
                  </Link>
                </Button>
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

export default PrivacyPolicy;

