
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Droplet, Hospital, Database } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  // Example blood bank status data (this would come from your MongoDB backend later)
  const bloodBankStatus = [
    { hospital: "City General Hospital", 
      bloodTypes: [
        { type: "A+", status: "High", units: 50 },
        { type: "B+", status: "Medium", units: 30 },
        { type: "O-", status: "Critical", units: 5 },
      ]
    },
    { hospital: "Memorial Medical Center", 
      bloodTypes: [
        { type: "AB+", status: "High", units: 45 },
        { type: "O+", status: "Medium", units: 25 },
        { type: "A-", status: "Low", units: 10 },
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'critical':
      case 'low': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-red-600 mb-6">
            Blood Donation & Availability Tracker
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Connect with local blood banks and hospitals. Track real-time blood availability 
            and help save lives by donating when it's needed most.
          </p>
          
          <div className="flex justify-center gap-4 mb-12">
            <Button
              onClick={() => navigate('/login')}
              className="bg-red-600 hover:bg-red-700"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate('/register')}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              Register
            </Button>
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="p-6 text-center">
              <Hospital className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">10+ Hospitals</h3>
              <p className="text-gray-600">Connected to our network</p>
            </Card>

            <Card className="p-6 text-center">
              <Droplet className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">1000+ Donors</h3>
              <p className="text-gray-600">Ready to save lives</p>
            </Card>

            <Card className="p-6 text-center">
              <Database className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">24/7 Updates</h3>
              <p className="text-gray-600">Real-time availability</p>
            </Card>
          </div>
        </div>

        {/* Blood Bank Status Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Current Blood Bank Status
          </h2>
          <div className="grid gap-8">
            {bloodBankStatus.map((bank, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  <Hospital className="w-6 h-6 text-red-500 mr-2" />
                  <h3 className="text-xl font-semibold">{bank.hospital}</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {bank.bloodTypes.map((blood, idx) => (
                    <div 
                      key={idx} 
                      className={`${getStatusColor(blood.status)} rounded-lg p-4 text-center`}
                    >
                      <div className="text-2xl font-bold mb-1">{blood.type}</div>
                      <div className="text-sm mb-2">{blood.status}</div>
                      <div className="font-medium">{blood.units} units</div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">Real-time Updates</h3>
            <p className="text-gray-600">
              Get instant notifications about blood requirements in your area and track availability in real-time.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">Quick Registration</h3>
            <p className="text-gray-600">
              Simple process to register as a donor. Your contribution can help save lives in emergency situations.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">Hospital Network</h3>
            <p className="text-gray-600">
              Connected with major hospitals and blood banks to ensure efficient distribution and management.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
