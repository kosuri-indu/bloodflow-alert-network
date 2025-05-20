
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, DropletIcon, Hospital, Database, ArrowRight, ChartBar } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <Brain className="h-16 w-16 text-purple-600" />
          </div>
          <h1 className="text-5xl font-bold text-red-600 mb-6">
            Blood<span className="text-purple-600">Bank</span>AI
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Connect with other hospitals using our AI-powered blood matching system.
            Track real-time blood availability and help save lives by sharing blood resources across your network.
          </p>
          
          <div className="flex justify-center gap-4 mb-12">
            {isAuthenticated ? (
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-red-600 hover:bg-red-700 px-6 py-3 text-lg"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-red-600 hover:bg-red-700 px-6 py-3 text-lg"
                >
                  Hospital Login/Register
                </Button>
              </>
            )}
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="p-6 text-center">
              <Hospital className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">10+ Hospitals</h3>
              <p className="text-gray-600">Connected to our network</p>
            </Card>

            <Card className="p-6 text-center">
              <DropletIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">1000+ Units</h3>
              <p className="text-gray-600">Of blood in our system</p>
            </Card>

            <Card className="p-6 text-center">
              <Database className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">AI Matching</h3>
              <p className="text-gray-600">Intelligent blood matching algorithm</p>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Our Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="rounded-full bg-purple-100 p-3 w-14 h-14 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-red-600">AI-Powered Matching</h3>
              <p className="text-gray-600">
                Our advanced AI algorithm matches blood across hospital networks based on blood type compatibility,
                Rh factor, special attributes, and urgency to ensure timely and effective transfusions.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="rounded-full bg-red-100 p-3 w-14 h-14 flex items-center justify-center mb-4">
                <ChartBar className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-red-600">Real-time Inventory</h3>
              <p className="text-gray-600">
                Get instant visibility into your blood inventory and track expiration dates. Connect with nearby hospitals
                to fulfill urgent blood requirements.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="rounded-full bg-blue-100 p-3 w-14 h-14 flex items-center justify-center mb-4">
                <Hospital className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-red-600">Hospital Network</h3>
              <p className="text-gray-600">
                Connect with major hospitals and blood banks to ensure efficient distribution and management of blood resources
                across your region.
              </p>
            </Card>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-purple-50 p-10 rounded-xl mb-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">How BloodBankAI Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-white p-4 mb-3 shadow-md">
                  <DropletIcon className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="font-medium mb-1">Record Inventory</h3>
                <p className="text-sm text-gray-600">Add your blood inventory with detailed information</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-white p-4 mb-3 shadow-md">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-medium mb-1">AI Processing</h3>
                <p className="text-sm text-gray-600">Our AI finds the best matches based on multiple factors</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-white p-4 mb-3 shadow-md">
                  <Hospital className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-medium mb-1">Hospital Connection</h3>
                <p className="text-sm text-gray-600">Connect with matched hospitals to fulfill blood requests</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button 
            onClick={() => navigate('/register')} 
            className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6 group"
          >
            Join BloodBankAI Today
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
