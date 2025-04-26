
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IndianRupee } from "lucide-react";

const DonatePage = () => {
  const donationOptions = [
    { amount: 1000, description: "Provides essential blood testing kits" },
    { amount: 2500, description: "Supports blood storage equipment maintenance" },
    { amount: 5000, description: "Helps organize local blood drives" },
    { amount: 10000, description: "Funds comprehensive donor support programs" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Support Our Mission</h1>
          <p className="text-gray-600">Your donation helps us maintain and improve blood donation services</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {donationOptions.map((option) => (
            <Card key={option.amount} className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-red-600 mb-2 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 mr-1" />
                  {option.amount.toLocaleString('en-IN')}
                </h3>
                <p className="text-gray-600 mb-4">{option.description}</p>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Donate ₹{option.amount.toLocaleString('en-IN')}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Custom Amount</h3>
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">₹</span>
              <Input
                type="number"
                placeholder="Enter custom amount"
                min="1"
                className="text-lg pl-8"
              />
            </div>
            <Button className="w-full bg-red-600 hover:bg-red-700">
              Donate Custom Amount
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DonatePage;
