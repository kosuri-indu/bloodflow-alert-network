
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-red-600 mb-4">
            Blood Donation & Availability Tracker
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with local blood banks and hospitals. Save lives by donating blood when it's needed most.
          </p>
          
          <div className="mt-8 space-x-4">
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
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">Real-time Updates</h3>
            <p className="text-gray-600">
              Get instant notifications about blood requirements in your area.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">Easy Registration</h3>
            <p className="text-gray-600">
              Quick and simple process to register as a donor.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">Save Lives</h3>
            <p className="text-gray-600">
              Your donation can help save lives in emergency situations.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
