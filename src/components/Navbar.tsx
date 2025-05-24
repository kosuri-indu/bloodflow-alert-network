
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, Brain, Hospital, Briefcase } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, currentUser, userType, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('Logout button clicked - clearing all auth data');
    logout();
    // Force navigation to home
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Brain className="h-8 w-8 text-purple-600 mr-2" />
              <span className="text-2xl font-bold text-red-600">BloodBank<span className="text-purple-600">AI</span></span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                {userType === 'hospital' ? (
                  <Link 
                    to="/dashboard" 
                    className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link 
                    to="/government-dashboard" 
                    className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Gov Dashboard
                  </Link>
                )}
                
                {/* User info display */}
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md">
                  <User size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {userType === 'hospital' ? currentUser?.hospitalName : currentUser?.name}
                  </span>
                </div>
                
                {/* LOGOUT BUTTON - Made more prominent */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Hospital Portal
                </Link>
                <Link 
                  to="/gov-login" 
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Government Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-6">
                  {isAuthenticated && (
                    <div className="border-b pb-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={16} className="text-gray-600" />
                        <p className="font-medium text-red-600">
                          {userType === 'hospital' ? currentUser?.hospitalName : currentUser?.name}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">{currentUser?.email}</p>
                      <p className="text-xs text-blue-600 capitalize">{userType} User</p>
                    </div>
                  )}
                
                  <Link 
                    to="/" 
                    className="text-gray-700 hover:text-red-600 py-2 text-base font-medium"
                  >
                    Home
                  </Link>
                  
                  {isAuthenticated ? (
                    <>
                      {userType === 'hospital' ? (
                        <Link 
                          to="/dashboard" 
                          className="text-gray-700 hover:text-red-600 py-2 text-base font-medium"
                        >
                          Hospital Dashboard
                        </Link>
                      ) : (
                        <Link 
                          to="/government-dashboard" 
                          className="text-gray-700 hover:text-red-600 py-2 text-base font-medium"
                        >
                          Government Dashboard
                        </Link>
                      )}
                      
                      {/* MOBILE LOGOUT BUTTON - Made very prominent */}
                      <Button 
                        variant="destructive"
                        className="w-full justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 mt-4"
                        onClick={handleLogout}
                      >
                        <LogOut size={18} />
                        <span className="text-base">LOGOUT</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/register" 
                        className="text-gray-700 hover:text-red-600 px-4 py-2 rounded-md text-base font-medium text-center"
                      >
                        Hospital Portal
                      </Link>
                      <Link 
                        to="/gov-login" 
                        className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-base font-medium text-center"
                      >
                        Government Login
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
