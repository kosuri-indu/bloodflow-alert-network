
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  DropletIcon, 
  Users, 
  Calendar, 
  AlertCircle, 
  TrendingUp, 
  Clock,
  Map,
  Bell
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const DashboardPage = () => {
  const [userType] = useState<"donor" | "hospital">("donor");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold text-red-600 mb-2 md:mb-0">Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Bell size={16} />
              <Badge variant="secondary" className="ml-1">3</Badge>
            </Button>
            <Button className="bg-red-600 hover:bg-red-700">Schedule Donation</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="rounded-full bg-red-100 p-3 mb-2">
                <DropletIcon className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-sm text-gray-500">Blood Type</p>
              <p className="text-2xl font-bold">O+</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="rounded-full bg-green-100 p-3 mb-2">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-500">Last Donation</p>
              <p className="text-2xl font-bold">45d ago</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="rounded-full bg-blue-100 p-3 mb-2">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-500">Donations Made</p>
              <p className="text-2xl font-bold">3</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="rounded-full bg-amber-100 p-3 mb-2">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <p className="text-sm text-gray-500">Next Eligible</p>
              <p className="text-xl font-bold text-green-600">Ready</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="blood-requests" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="blood-requests">Blood Requests</TabsTrigger>
            <TabsTrigger value="donation-history">Donation History</TabsTrigger>
            <TabsTrigger value="nearby">Nearby Centers</TabsTrigger>
          </TabsList>

          <TabsContent value="blood-requests">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center justify-between">
                    <span>Urgent Requests</span>
                    <Badge variant="destructive">Urgent</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userType === "donor" ? (
                    <>
                      <div className="p-4 bg-red-50 rounded-lg border border-red-100 relative">
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-red-600">Match: 98%</Badge>
                        </div>
                        <p className="font-semibold">Blood Type: O+</p>
                        <p className="text-sm text-gray-600">City Hospital - 3.2km away</p>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <AlertCircle size={14} className="mr-1 text-red-500" />
                            <span>Needed within 24 hours</span>
                          </div>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700">Respond</Button>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-red-50 rounded-lg border border-red-100 relative">
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-amber-600">Match: 85%</Badge>
                        </div>
                        <p className="font-semibold">Blood Type: O-</p>
                        <p className="text-sm text-gray-600">General Hospital - 4.8km away</p>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <AlertCircle size={14} className="mr-1 text-amber-500" />
                            <span>Needed within 48 hours</span>
                          </div>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700">Respond</Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p>Hospital view for blood requests</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Blood Inventory Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <DropletIcon className="h-4 w-4 text-red-600 mr-2" />
                        <span>A+</span>
                      </div>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <DropletIcon className="h-4 w-4 text-red-600 mr-2" />
                        <span>B+</span>
                      </div>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <DropletIcon className="h-4 w-4 text-red-600 mr-2" />
                        <span>O+</span>
                      </div>
                      <span className="text-sm font-medium text-red-600">23%</span>
                    </div>
                    <Progress value={23} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <DropletIcon className="h-4 w-4 text-red-600 mr-2" />
                        <span>O-</span>
                      </div>
                      <span className="text-sm font-medium text-red-600">15%</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="donation-history">
            <Card>
              <CardHeader>
                <CardTitle>Your Donation History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div>
                      <p className="font-medium">City Blood Bank</p>
                      <p className="text-sm text-gray-500">March 15, 2025</p>
                    </div>
                    <Badge className="bg-green-600">Completed</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div>
                      <p className="font-medium">General Hospital Drive</p>
                      <p className="text-sm text-gray-500">January 3, 2025</p>
                    </div>
                    <Badge className="bg-green-600">Completed</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div>
                      <p className="font-medium">Community Blood Drive</p>
                      <p className="text-sm text-gray-500">November 22, 2024</p>
                    </div>
                    <Badge className="bg-green-600">Completed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="nearby">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Map className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="text-lg font-medium">Nearby Donation Centers</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white border rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">City Blood Bank</p>
                      <p className="text-sm text-gray-500">2.3 km away • Open until 7 PM</p>
                    </div>
                    <Button size="sm" variant="outline">Directions</Button>
                  </div>
                </div>
                
                <div className="p-4 bg-white border rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">General Hospital</p>
                      <p className="text-sm text-gray-500">4.1 km away • Open 24/7</p>
                    </div>
                    <Button size="sm" variant="outline">Directions</Button>
                  </div>
                </div>
                
                <div className="p-4 bg-white border rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">Red Cross Donation Center</p>
                      <p className="text-sm text-gray-500">5.7 km away • Open until 5 PM</p>
                    </div>
                    <Button size="sm" variant="outline">Directions</Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardPage;
