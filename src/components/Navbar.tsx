
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, Brain, Hospital, Briefcase } from 'lucide-react';
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline" 
                    className="flex items-center gap-2 text-sm"
                    onClick={() => {
                      if (userType === 'hospital') {
                        navigate('/profile');
                      } else {
                        navigate('/government-dashboard');
                      }
                    }}
                  >
                    {userType === 'hospital' ? (
                      <>
                        <Hospital size={16} />
                        Hospital Portal
                      </>
                    ) : (
                      <>
                        <Briefcase size={16} />
                        Government Portal
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    title="Logout"
                    className="flex items-center gap-1 px-3"
                  >
                    <LogOut size={16} />
                    <span className="ml-1">Logout</span>
                  </Button>
                </div>
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
                      {userType === 'hospital' ? (
                        <Link 
                          to="/dashboard" 
                          className="text-gray-700 hover:text-red-600 py-2 text-base font-medium"
                        >
                          Dashboard
                        </Link>
                      ) : (
                        <Link 
                          to="/government-dashboard" 
                          className="text-gray-700 hover:text-red-600 py-2 text-base font-medium"
                        >
                          Gov Dashboard
                        </Link>
                      )}
                      <Button 
                        variant="outline"
                        className="justify-start"
                        onClick={() => {
                          if (userType === 'hospital') {
                            navigate('/profile');
                          } else {
                            navigate('/government-dashboard');
                          }
                        }}
                      >
                        {userType === 'hospital' ? 'Hospital Portal' : 'Government Portal'}
                      </Button>
                      <Button 
                        variant="destructive"
                        className="justify-start gap-2"
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
                      >
                        <LogOut size={16} />
                        Logout
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
