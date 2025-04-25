
import { Card } from "@/components/ui/card";

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-red-600 mb-8">Dashboard</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Blood Requests</h2>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="font-semibold">Blood Type: A+</p>
                <p className="text-sm text-gray-600">City Hospital - Urgent</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="font-semibold">Blood Type: O-</p>
                <p className="text-sm text-gray-600">General Hospital - Regular</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Information</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">Blood Type:</span> O+</p>
              <p><span className="font-semibold">Last Donation:</span> Not yet donated</p>
              <p><span className="font-semibold">Status:</span> Available to donate</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
