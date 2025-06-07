
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, DropletIcon, Hospital, Database, ArrowRight, Shield } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userType } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-6">
            <Brain className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-red-600 mb-6">
            Blood<span className="text-blue-600">Bank</span>AI
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Connecting Indian hospitals and blood banks using our AI-powered matching system.
            Track real-time blood availability across India and help save lives by donating when it's needed most.
          </p>

          <div className="flex justify-center gap-4 mb-16">
            {isAuthenticated ? (
              <Button
                onClick={() => navigate(userType === 'hospital' ? '/dashboard' : '/government-dashboard')}
                className="bg-red-600 hover:bg-red-700 px-8 py-4 text-lg"
              >
                Go to {userType === 'hospital' ? 'Hospital' : 'Government'} Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-red-600 hover:bg-red-700 px-8 py-4 text-lg"
                >
                  Hospital Portal
                  <Hospital className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  onClick={() => navigate('/gov-login')}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg"
                >
                  Government Portal
                  <Shield className="ml-2 h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-20">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <Hospital className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Indian Hospitals Connected</h3>
              <p className="text-gray-600">Growing network of medical facilities across India</p>
            </Card>

            <Card className="p-6 text-center">
              <DropletIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Life-Saving Matches</h3>
              <p className="text-gray-600">AI-powered blood type matching for Indian patients</p>
            </Card>

            <Card className="p-6 text-center">
              <Database className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Real-Time Updates</h3>
              <p className="text-gray-600">Live inventory tracking across Indian blood banks</p>
            </Card>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="text-center mb-24">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Join the BloodBankAI Network in India
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Be part of the future of blood donation and medical emergency response in India. 
            Our platform connects hospitals, blood banks, and donors across the country for faster, more efficient life-saving operations.
          </p>
          {!isAuthenticated && (
            <Button 
              onClick={() => navigate('/register')} 
              className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-4"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
