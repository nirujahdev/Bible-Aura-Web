import React from "react";

const Home = () => {
  return (
    <div className="min-h-screen bg-white w-full">
      {/* Absolute Simplest Test */}
      <div className="py-20 px-4 text-center">
        <h1 className="text-4xl font-bold text-orange-600 mb-4">
          ✦ Bible Aura - WORKING!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          🎉 SUCCESS! The basic component is working!
        </p>
        <p className="text-green-600 font-semibold text-lg">
          ✅ React is rendering correctly
        </p>
        
        <div className="mt-8">
          <button className="bg-orange-500 text-white px-6 py-2 rounded">
            Simple HTML Button
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>✅ No external components</p>
          <p>✅ No complex imports</p>
          <p>✅ Pure React + Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
};

export default Home; 