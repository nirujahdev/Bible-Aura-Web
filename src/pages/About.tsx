import { Button } from "@/components/ui/button";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Simple About Section */}
      <div className="py-20 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          About Bible Aura
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Bible Aura is your AI-powered companion for deeper biblical understanding and spiritual growth.
        </p>
        
        <div className="max-w-4xl mx-auto text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-600 mb-4">
                To make deep Bible study accessible to everyone through the power of artificial intelligence,
                helping believers grow in their understanding of God's Word.
              </p>
            </div>

            <div className="bg-orange-50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-gray-600 mb-4">
                A world where every person has access to intelligent, accurate, and spiritually enriching
                biblical insights that deepen their relationship with God.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">Why Bible Aura?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="font-semibold mb-2">🤖 AI-Powered</h4>
                <p className="text-gray-600 text-sm">
                  Advanced artificial intelligence provides instant biblical insights and explanations.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">📚 Comprehensive</h4>
                <p className="text-gray-600 text-sm">
                  Access multiple Bible translations, study tools, and spiritual resources in one place.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🙏 Faith-Centered</h4>
                <p className="text-gray-600 text-sm">
                  Built by believers, for believers, with a commitment to theological accuracy and spiritual growth.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700">
              <Link to="/auth">Start Your Journey</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 