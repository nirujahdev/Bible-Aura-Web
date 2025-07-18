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
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
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
      <nav className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-7xl px-4 ${className}`}>
        <div className="bg-white/95 backdrop-blur-xl rounded-full shadow-2xl border border-white/20 px-6 lg:px-12 py-4 transition-all duration-500 hover:shadow-3xl hover:scale-[1.02]">
          {/* Glowing border effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative flex items-center justify-between">
            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-between w-full">
              {/* Left - Logo */}
              <div className="flex items-center">
                <span className="text-xl font-divine text-primary whitespace-nowrap font-bold">✦Bible Aura</span>
              </div>

              {/* Center - Navigation Items */}
              <div className="flex items-center space-x-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link 
                      key={item.href}
                      to={item.href}
                      className="group relative flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-500 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-110 active:scale-95"
                    >
                      <IconComponent className="h-4 w-4 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
                      <span className="text-sm font-semibold whitespace-nowrap">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Right - Auth Buttons */}
              <div className="flex items-center space-x-3">
                <Button 
                  asChild 
                  variant="outline" 
                  className="border-2 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300 rounded-full px-6 py-2 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Link to="/auth">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
                
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 transition-all duration-300 rounded-full px-6 py-2 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Link to="/auth">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden flex items-center justify-between w-full">
              {/* Logo */}
              <div className="flex items-center">
                <span className="text-lg font-divine text-primary font-bold">✦Bible Aura</span>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="h-10 w-10 p-0 hover:bg-primary/10"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 text-primary" />
                ) : (
                  <Menu className="h-5 w-5 text-primary" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="py-4">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors duration-200"
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
                <div className="border-t border-gray-100 mt-4 pt-4 px-6 space-y-3">
                  <Link
                    to="/auth"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-2 border border-primary/20 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors duration-200"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/auth"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Get Started</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  // App variant - simpler header for app pages
  return (
    <nav className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary">✦Bible Aura</Link>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-gray-600 hover:text-primary transition-colors duration-200 font-medium"
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
              className="h-10 w-10 p-0"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="py-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={closeMobileMenu}
                  className="block px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors duration-200"
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