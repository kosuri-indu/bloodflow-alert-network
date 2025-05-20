
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, Brain, Hospital } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, currentUser, userType, logout } = useAuth();
  const navigate = useNavigate();

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
          
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline" 
                    className="flex items-center gap-2 text-sm"
                    onClick={() => navigate('/profile')}
                  >
                    <User size={16} />
                    Hospital Portal
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </Button>
                </div>
              </>
            ) : (
              <>
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
                  {isAuthenticated && (
                    <div className="border-b pb-4 mb-2">
                      <p className="font-medium text-red-600">
                        {userType === 'hospital' ? currentUser?.hospitalName : `Hello, ${currentUser?.name}`}
                      </p>
                      <p className="text-sm text-gray-500">{currentUser?.email}</p>
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
                      <Link 
                        to="/dashboard" 
                        className="text-gray-700 hover:text-red-600 py-2 text-base font-medium"
                      >
                        Dashboard
                      </Link>
                      <Button 
                        variant="outline"
                        className="justify-start"
                        onClick={() => navigate('/profile')}
                      >
                        Hospital Portal
                      </Button>
                      <Button 
                        variant="destructive"
                        className="justify-start"
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
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
