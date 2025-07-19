import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Info, Phone, Crown, Heart, LogIn, UserPlus, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

interface GlobalNavigationProps {
  variant?: 'landing' | 'app';
  className?: string;
}

export function GlobalNavigation({ variant = 'landing', className = '' }: GlobalNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    console.log('Toggle menu clicked, current state:', isMobileMenuOpen);
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    console.log('Closing menu');
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: Phone },
    { href: "/careers", label: "Careers", icon: Crown },
    { href: "/funding", label: "Support Us", icon: Heart },
  ];

  if (variant === 'landing') {
    return (
      <nav className={`fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-[98%] sm:w-full px-2 sm:px-4 ${className}`}>
        <div className="bg-white/90 backdrop-blur-2xl rounded-full shadow-2xl border border-white/30 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 transition-all duration-500 hover:shadow-3xl hover:scale-[1.02] relative">
          {/* Enhanced Glowing border effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/25 via-primary/10 to-primary/25 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative flex items-center justify-between">
            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-between w-full">
              {/* Left - Logo */}
              <div className="flex items-center">
                <span className="text-xl font-divine text-primary whitespace-nowrap font-bold">✦Bible Aura</span>
              </div>

              {/* Center - Navigation Items */}
              <div className="flex items-center space-x-1">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link 
                      key={item.href}
                      to={item.href}
                      className="group relative flex items-center space-x-1.5 px-3 py-2 rounded-full transition-all duration-500 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-110 active:scale-95"
                    >
                      <IconComponent className="h-4 w-4 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
                      <span className="text-sm font-semibold whitespace-nowrap">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Right - Auth Buttons */}
              <div className="flex items-center space-x-1.5">
                <Button 
                  asChild 
                  variant="outline" 
                  className="border-2 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300 rounded-full px-3 py-1.5 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Link to="/auth">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
                
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 transition-all duration-300 rounded-full px-3 py-1.5 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Link to="/auth">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden flex items-center justify-center w-full relative">
              {/* Logo - Centered */}
              <div className="flex items-center">
                <span className="text-lg sm:text-xl font-divine text-primary font-bold">✦Bible Aura</span>
              </div>

              {/* Mobile Menu Button - Absolute Right */}
              <button
                onClick={toggleMobileMenu}
                className="absolute right-0 h-9 w-9 sm:h-10 sm:w-10 p-0 hover:bg-primary/10 rounded-full flex items-center justify-center transition-colors z-10"
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                ) : (
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/30 overflow-hidden z-40 mx-2 sm:mx-4">
            <div className="py-3 sm:py-4">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-4 px-5 sm:px-6 py-3 sm:py-4 text-gray-700 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-[1.02] rounded-lg mx-2"
                  >
                    <IconComponent className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-base sm:text-lg">{item.label}</span>
                  </Link>
                );
              })}
              <div className="border-t border-gray-200/60 mt-3 sm:mt-4 pt-3 sm:pt-4 px-3 sm:px-4 space-y-3 sm:space-y-4">
                <Link
                  to="/auth"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center space-x-2 w-full px-4 sm:px-5 py-3 border-2 border-primary/20 text-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-300 text-base sm:text-lg font-semibold hover:scale-[1.02] mx-1"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/auth"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center space-x-2 w-full px-4 sm:px-5 py-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl hover:from-primary/90 hover:to-primary/80 transition-all duration-300 text-base sm:text-lg font-semibold hover:scale-[1.02] shadow-lg mx-1"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Get Started</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    );
  }

  // App variant - simpler header for app pages
  return (
    <nav className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-lg sm:text-xl font-bold text-primary">✦Bible Aura</Link>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-gray-600 hover:text-primary transition-colors duration-200 font-medium text-sm lg:text-base"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="h-8 w-8 sm:h-10 sm:w-10 p-0"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="py-2 sm:py-4 space-y-1 sm:space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={closeMobileMenu}
                  className="block px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 