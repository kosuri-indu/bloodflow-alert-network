
import React from 'react';
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <Brain className="h-8 w-8 text-purple-600 mr-2" />
              <h3 className="text-xl font-semibold text-red-600">
                BloodBank<span className="text-purple-600">AI</span>
              </h3>
            </div>
            <p className="text-gray-600 max-w-md">
              Connecting hospitals with blood banks using AI. Our platform makes blood matching 
              easier and more efficient, helping save lives across hospitals.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-600 hover:text-red-600 transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className="text-gray-600 hover:text-red-600 transition-colors duration-200"
                >
                  Hospital Portal
                </Link>
              </li>
              <li>
                <Link 
                  to="/gov-login" 
                  className="text-gray-600 hover:text-red-600 transition-colors duration-200"
                >
                  Government Portal
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h4>
            <ul className="space-y-2 text-gray-600">
              <li>Emergency: (+91) 999-999-9999</li>
              <li>Email: emergency@bloodbankai.com</li>
              <li>Available 24/7</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500">
            © {currentYear} BloodBankAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
