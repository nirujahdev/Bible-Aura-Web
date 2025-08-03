import { Button } from "@/components/ui/button";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { Link } from "react-router-dom";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Simple Hero Section */}
      <div className="py-20 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Bible Aura Pricing
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Choose the perfect plan for your spiritual journey
        </p>
        
        {/* Simple Pricing Cards */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-gray-50 p-8 rounded-lg border">
            <h3 className="text-2xl font-bold mb-4">Free</h3>
            <p className="text-3xl font-bold text-orange-600 mb-4">₹0</p>
            <ul className="text-left space-y-2 mb-6">
              <li>✅ Basic Bible reading</li>
              <li>✅ Limited AI insights</li>
              <li>✅ Simple study tools</li>
            </ul>
            <Button asChild className="w-full bg-gray-600 hover:bg-gray-700">
              <Link to="/auth">Get Started Free</Link>
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="bg-orange-50 p-8 rounded-lg border border-orange-200">
            <h3 className="text-2xl font-bold mb-4">Pro</h3>
            <p className="text-3xl font-bold text-orange-600 mb-4">₹299/month</p>
            <ul className="text-left space-y-2 mb-6">
              <li>✅ Full Bible access</li>
              <li>✅ Unlimited AI insights</li>
              <li>✅ Advanced study tools</li>
              <li>✅ Personal journal</li>
              <li>✅ Sermon creation</li>
            </ul>
            <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
              <Link to="/auth">Start Pro Trial</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 