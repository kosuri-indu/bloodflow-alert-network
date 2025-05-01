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
  Bell,
  Search,
  Hospital,
  Brain
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import AiMatchingCard from "@/components/AiMatchingCard";

const mockRequests = [
  {
    id: "1",
    bloodType: "O+",
    hospital: "City Hospital",
    urgency: "critical" as const,
    distance: 3.2,
    timeNeeded: "Needed within 24 hours",
    matchPercentage: 98,
  },
  {
    id: "2",
    bloodType: "O-",
    hospital: "General Hospital",
    urgency: "urgent" as const,
    distance: 4.8,
    timeNeeded: "Needed within 48 hours",
    matchPercentage: 85,
  },
  {
    id: "3",
    bloodType: "B+",
    hospital: "Medical Center",
    urgency: "standard" as const,
    distance: 2.1,
    timeNeeded: "Needed within 3 days",
    matchPercentage: 72,
  }
];

const DashboardPage = () => {
  const [userType, setUserType] = useState<"donor" | "hospital">("donor");

  // For demo purposes, toggle between donor and hospital view
  const toggleUserType = () => {
    setUserType(userType === "donor" ? "hospital" : "donor");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-red-600 mb-2 md:mb-0">
              {userType === "donor" ? "Donor Dashboard" : "Hospital Dashboard"}
            </h1>
            <p className="text-sm text-gray-500">
              {userType === "donor" 
                ? "View blood requests and track your donations" 
                : "Manage blood inventory and find donors with AI"}
            </p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            {/* This button is just for demo purposes */}
            <Button variant="outline" size="sm" onClick={toggleUserType} className="text-xs">
              Switch to {userType === "donor" ? "Hospital" : "Donor"} View
            </Button>
            
            {userType === "donor" ? (
              <>
                <Button variant="outline" className="flex items-center gap-2">
                  <Bell size={16} />
                  <Badge variant="secondary" className="ml-1">3</Badge>
                </Button>
                <Button className="bg-red-600 hover:bg-red-700">Schedule Donation</Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="flex items-center gap-2">
                  <Bell size={16} />
                  <Badge variant="secondary" className="ml-1">5</Badge>
                </Button>
                <Button className="bg-red-600 hover:bg-red-700">Create Blood Request</Button>
              </>
            )}
          </div>
        </div>

        {userType === "donor" ? (
          // Donor Dashboard
          <>
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
                    </CardContent>
                  </Card>
                  
                  <AiMatchingCard requests={mockRequests} />
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
          </>
        ) : (
          // Hospital Dashboard
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-purple-100 p-3 mb-2">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-500">AI Matches</p>
                  <p className="text-2xl font-bold">37</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-red-100 p-3 mb-2">
                    <DropletIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="text-sm text-gray-500">Blood Units</p>
                  <p className="text-2xl font-bold">145</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-blue-100 p-3 mb-2">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-500">Registered Donors</p>
                  <p className="text-2xl font-bold">912</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-amber-100 p-3 mb-2">
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <p className="text-sm text-gray-500">Critical Requests</p>
                  <p className="text-2xl font-bold text-amber-600">3</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="ai-matching" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="ai-matching">AI Matching</TabsTrigger>
                <TabsTrigger value="inventory">Blood Inventory</TabsTrigger>
                <TabsTrigger value="requests">My Requests</TabsTrigger>
              </TabsList>

              <TabsContent value="ai-matching">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">Create Blood Request</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Blood Type</label>
                            <select className="w-full p-2 border rounded-md">
                              <option>A+</option>
                              <option>A-</option>
                              <option>B+</option>
                              <option>B-</option>
                              <option>AB+</option>
                              <option>AB-</option>
                              <option>O+</option>
                              <option>O-</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Urgency</label>
                            <select className="w-full p-2 border rounded-md">
                              <option>Standard</option>
                              <option>Urgent</option>
                              <option>Critical</option>
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-1 block">Units Required</label>
                          <Input type="number" min="1" defaultValue="2" />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-1 block">Required By</label>
                          <Input type="datetime-local" />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-1 block">Special Requirements (optional)</label>
                          <Input placeholder="E.g., pediatric, leukoreduced, etc." />
                        </div>
                        
                        <div className="flex items-center pt-2">
                          <input type="checkbox" id="ai-match" className="mr-2" />
                          <label htmlFor="ai-match" className="text-sm">Use AI to find the best genetic matches</label>
                        </div>
                        
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2">
                          <Brain className="h-4 w-4" />
                          Find Donors with AI
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <AiMatchingCard requests={mockRequests} isHospital={true} />
                </div>
              </TabsContent>
              
              <TabsContent value="inventory">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl flex items-center justify-between">
                        <span>Blood Inventory</span>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" /> Update
                        </Button>
                      </CardTitle>
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
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <DropletIcon className="h-4 w-4 text-red-600 mr-2" />
                            <span>AB+</span>
                          </div>
                          <span className="text-sm font-medium">72%</span>
                        </div>
                        <Progress value={72} className="h-2" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <DropletIcon className="h-4 w-4 text-red-600 mr-2" />
                            <span>AB-</span>
                          </div>
                          <span className="text-sm font-medium">59%</span>
                        </div>
                        <Progress value={59} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">Available Blood Banks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <Input
                          className="pl-9 mb-4"
                          placeholder="Search blood banks..."
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">Central Blood Bank</p>
                              <p className="text-sm text-gray-500">5.2 km • 23 O+ units available</p>
                            </div>
                            <Button size="sm" variant="outline">Request</Button>
                          </div>
                        </div>
                        
                        <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">Regional Medical Center</p>
                              <p className="text-sm text-gray-500">7.8 km • 18 O+ units available</p>
                            </div>
                            <Button size="sm" variant="outline">Request</Button>
                          </div>
                        </div>
                        
                        <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">City Blood Services</p>
                              <p className="text-sm text-gray-500">3.6 km • 9 O+ units available</p>
                            </div>
                            <Button size="sm" variant="outline">Request</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="requests">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Active Blood Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <p className="font-semibold">O+ Blood • 3 Units</p>
                              <Badge variant="destructive" className="ml-2">Critical</Badge>
                            </div>
                            <p className="text-sm text-gray-600">Created: May 1, 2025 • Needed by: May 2, 2025</p>
                            <div className="flex items-center mt-1 text-sm text-green-600">
                              <UserCheck className="h-4 w-4 mr-1" />
                              <span>2 donors confirmed</span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">View Matches</Button>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <p className="font-semibold">A- Blood • 2 Units</p>
                              <Badge className="ml-2 bg-amber-600">Urgent</Badge>
                            </div>
                            <p className="text-sm text-gray-600">Created: Apr 30, 2025 • Needed by: May 3, 2025</p>
                            <div className="flex items-center mt-1 text-sm text-amber-600">
                              <UserCheck className="h-4 w-4 mr-1" />
                              <span>1 donor confirmed</span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">View Matches</Button>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <p className="font-semibold">B+ Blood • 4 Units</p>
                              <Badge className="ml-2 bg-blue-600">Standard</Badge>
                            </div>
                            <p className="text-sm text-gray-600">Created: Apr 28, 2025 • Needed by: May 10, 2025</p>
                            <div className="flex items-center mt-1 text-sm text-blue-600">
                              <UserCheck className="h-4 w-4 mr-1" />
                              <span>4 donors confirmed</span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">View Matches</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
