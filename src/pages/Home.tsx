import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-white w-full">
      {/* Ultra Simple Test */}
      <div className="py-20 px-4 text-center">
        <h1 className="text-4xl font-bold text-orange-600 mb-4">
          ✦ Bible Aura
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Ultra-Minimal Test Version
        </p>
        <p className="text-green-600 font-semibold">
          ✅ If you can see this, the basic React component is working!
        </p>
        
        <div className="mt-8">
          <Button className="bg-orange-500 text-white px-6 py-2">
            Test Button
          </Button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>This is the most basic version possible.</p>
          <p>If this works, we can identify what was causing the error.</p>
        </div>
      </div>
    </div>
  );
};

export default Home; 