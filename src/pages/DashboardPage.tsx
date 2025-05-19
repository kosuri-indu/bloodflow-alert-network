
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  DropletIcon, 
  Hospital,
  AlertCircle, 
  TrendingUp, 
  Brain
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import mockDatabaseService, { BloodRequest } from "@/services/mockDatabase";
import AiBloodMatchingSystem from "@/components/ai/AiBloodMatchingSystem";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";

const DashboardPage = () => {
  const [bloodInventory, setBloodInventory] = useState<any[]>([]);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [hospitalProfile, setHospitalProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [profile, inventory, requests] = await Promise.all([
          mockDatabaseService.getHospitalProfile(),
          mockDatabaseService.getBloodInventory(),
          mockDatabaseService.getBloodRequests(),
        ]);
        
        setHospitalProfile(profile);
        setBloodInventory(inventory);
        setBloodRequests(requests);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  // Handle blood request creation
  const handleCreateBloodRequest = () => {
    toast({
      title: "Create Blood Request",
      description: "Switching to AI matching to create a new blood request.",
    });
    
    // Navigate to the AI matching tab
    const aiMatchingTab = document.querySelector('[value="ai-matching"]') as HTMLElement;
    if (aiMatchingTab) {
      aiMatchingTab.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-red-600 mb-2 md:mb-0">
              Hospital Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Manage blood inventory and find matches with AI
            </p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleCreateBloodRequest}>
              Create Blood Request
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-purple-100 p-3 mb-2">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-500">AI Matches</p>
                  <p className="text-2xl font-bold">
                    {bloodRequests.reduce((total, req) => total + (req.matchCount || 0), 0)}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-red-100 p-3 mb-2">
                    <DropletIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="text-sm text-gray-500">Blood Units</p>
                  <p className="text-2xl font-bold">
                    {bloodInventory.reduce((sum, item) => sum + item.units, 0)}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-blue-100 p-3 mb-2">
                    <Hospital className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-500">Partner Hospitals</p>
                  <p className="text-2xl font-bold">{hospitalProfile?.partnerHospitals || 0}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-amber-100 p-3 mb-2">
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <p className="text-sm text-gray-500">Critical Requests</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {bloodRequests.filter(req => req.urgency === 'critical').length}
                  </p>
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
                <AiBloodMatchingSystem />
              </TabsContent>
              
              <TabsContent value="inventory">
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
                    {bloodInventory.map((item) => (
                      <div key={item.bloodType} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <DropletIcon className="h-4 w-4 text-red-600 mr-2" />
                            <span>{item.bloodType}</span>
                          </div>
                          <span className={`text-sm font-medium ${
                            item.units < 20 ? 'text-red-600' : 
                            item.units < 50 ? 'text-amber-600' : 
                            'text-gray-900'
                          }`}>
                            {item.units} units ({Math.round((item.units / 100) * 100)}%)
                          </span>
                        </div>
                        <Progress 
                          value={Math.round((item.units / 100) * 100)} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="requests">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Active Blood Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {bloodRequests.map((request) => (
                        <div 
                          key={request.id}
                          className={`p-4 border rounded-lg ${
                            request.urgency === 'critical' ? 'bg-red-50 border-red-200' :
                            request.urgency === 'urgent' ? 'bg-amber-50 border-amber-200' :
                            'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                <p className="font-semibold">
                                  {request.bloodType} • {request.units} Units
                                </p>
                                <Badge 
                                  className={`ml-2 ${
                                    request.urgency === 'critical' ? 'bg-red-500' :
                                    request.urgency === 'urgent' ? 'bg-amber-600' :
                                    'bg-blue-600'
                                  }`}
                                >
                                  {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                Created: {format(new Date(request.createdAt), 'MMM d, yyyy')} • 
                                Needed by: {format(new Date(request.neededBy), 'MMM d, yyyy')}
                              </p>
                              <div className="flex items-center mt-1 text-sm text-green-600">
                                <Hospital className="h-4 w-4 mr-1" />
                                <span>
                                  {request.urgency === 'critical' ? '2 hospitals matched' :
                                   request.urgency === 'urgent' ? '1 hospital matched' :
                                   '4 hospitals matched'}
                                </span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">View Matches</Button>
                          </div>
                        </div>
                      ))}

                      {bloodRequests.length === 0 && (
                        <div className="text-center py-6 text-gray-600">
                          No active blood requests. Create a request to find matches from other hospitals.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
      
      <div className="py-12"></div>
    </div>
  );
};

export default DashboardPage;
