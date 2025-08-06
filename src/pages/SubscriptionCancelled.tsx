import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, Heart } from 'lucide-react';
import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';

export default function SubscriptionCancelled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <GlobalNavigation variant="landing" />
      
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10 text-gray-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-700 mb-2">
              Payment Cancelled
            </CardTitle>
            <p className="text-lg text-gray-600">
              Your subscription payment was cancelled
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <Heart className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-800">
                  No worries! Your free access continues
                </h3>
              </div>
              
              <div className="text-sm text-blue-700 space-y-2">
                <p>
                  Your free Bible Aura account remains active with access to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Complete Bible reading in multiple translations</li>
                  <li>Basic verse search and cross-references</li>
                  <li>Daily verses and reading plans</li>
                  <li>Bible characters and parables study</li>
                  <li>Songs library and basic study tools</li>
                </ul>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-gray-600">
                The payment process was cancelled and no charges were made. 
                You can try again anytime or continue using Bible Aura for free.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => navigate('/pricing')} 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')} 
                  variant="outline" 
                  className="border-orange-200 hover:bg-orange-50"
                >
                  Continue with Free
                </Button>
              </div>
              
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-3">
                  Questions about our subscription plans?
                </p>
                <div className="flex justify-center gap-4 text-sm">
                  <button 
                    onClick={() => navigate('/features')} 
                    className="text-orange-600 hover:underline"
                  >
                    View Features
                  </button>
                  <span className="text-gray-300">•</span>
                  <button 
                    onClick={() => navigate('/contact')} 
                    className="text-orange-600 hover:underline"
                  >
                    Contact Support
                  </button>
                  <span className="text-gray-300">•</span>
                  <button 
                    onClick={() => navigate('/faq')} 
                    className="text-orange-600 hover:underline"
                  >
                    FAQ
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
} 