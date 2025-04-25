
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-red-600 mb-4">BloodFlow</h3>
            <p className="text-gray-600">
              Connecting donors with those in need. Making blood donation easier and more accessible.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-red-600">Home</Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-600 hover:text-red-600">Login</Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-red-600">Register</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-600">
              <li>Email: contact@bloodflow.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>Emergency: (555) 999-9999</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} BloodFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
