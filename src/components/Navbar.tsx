
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, User, Bell, X, DropletIcon, Brain } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar: React.FC = () => {
  const [isAuthenticated] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Brain className="h-8 w-8 text-purple-600 mr-2" />
              <span className="text-2xl font-bold text-red-600">BloodFlow<span className="text-purple-600">AI</span></span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>
            <Link 
              to="/events" 
              className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Blood Drives
            </Link>
            <Link 
              to="/donate" 
              className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Donate
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell size={18} />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600"></span>
                </Button>
                <Button
                  variant="outline" 
                  className="flex items-center gap-2 text-sm"
                >
                  <User size={16} />
                  Profile
                </Button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                >
                  <User size={18} />
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-6">
                  <Link 
                    to="/" 
                    className="text-gray-700 hover:text-red-600 py-2 text-base font-medium"
                  >
                    Home
                  </Link>
                  <Link 
                    to="/events" 
                    className="text-gray-700 hover:text-red-600 py-2 text-base font-medium"
                  >
                    Blood Drives
                  </Link>
                  <Link 
                    to="/donate" 
                    className="text-gray-700 hover:text-red-600 py-2 text-base font-medium"
                  >
                    Donate
                  </Link>
                  {isAuthenticated ? (
                    <>
                      <Link 
                        to="/dashboard" 
                        className="text-gray-700 hover:text-red-600 py-2 text-base font-medium"
                      >
                        Dashboard
                      </Link>
                      <Button 
                        variant="outline"
                        className="justify-start"
                      >
                        Profile
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/login" 
                        className="text-gray-700 hover:text-red-600 py-2 text-base font-medium"
                      >
                        Login
                      </Link>
                      <Link 
                        to="/register" 
                        className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-base font-medium text-center"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
