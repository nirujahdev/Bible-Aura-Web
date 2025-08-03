import { Button } from "@/components/ui/button";
import { GlobalNavigation } from "@/components/GlobalNavigation";

export default function Contact() {
  return (
    <div className="min-h-screen bg-white">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Simple Contact Section */}
      <div className="py-20 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Contact Us
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          We'd love to hear from you. Get in touch with our team for support, feedback, or questions.
        </p>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 p-8 rounded-lg text-left">
            <h3 className="text-2xl font-bold mb-6 text-center">Get in Touch</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">📧 Email Support</h4>
                <p className="text-gray-600">
                  For general inquiries and support: <br/>
                  <a href="mailto:support@bibleaura.xyz" className="text-orange-600 hover:underline">
                    support@bibleaura.xyz
                  </a>
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">💼 Business Inquiries</h4>
                <p className="text-gray-600">
                  For partnerships and business matters: <br/>
                  <a href="mailto:business@bibleaura.xyz" className="text-orange-600 hover:underline">
                    business@bibleaura.xyz
                  </a>
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🐛 Technical Issues</h4>
                <p className="text-gray-600">
                  Report bugs or technical problems: <br/>
                  <a href="mailto:tech@bibleaura.xyz" className="text-orange-600 hover:underline">
                    tech@bibleaura.xyz
                  </a>
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🙏 Prayer Requests</h4>
                <p className="text-gray-600">
                  Share your prayer requests with our team: <br/>
                  <a href="mailto:prayer@bibleaura.xyz" className="text-orange-600 hover:underline">
                    prayer@bibleaura.xyz
                  </a>
                </p>
              </div>
            </div>

            <div className="text-center mt-8">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <a href="mailto:support@bibleaura.xyz">Send us an Email</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 