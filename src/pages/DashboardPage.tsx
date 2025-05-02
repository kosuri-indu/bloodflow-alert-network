
import { useState, useEffect } from "react";
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
  Search,
  Hospital,
  Brain,
  UserCheck 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import mockDatabaseService, { BloodRequest, DonationEvent } from "@/services/mockDatabase";
import AiBloodMatchingSystem from "@/components/ai/AiBloodMatchingSystem";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";

const DashboardPage = () => {
  // For demo purposes, we'll start with "hospital" as default
  const [userType, setUserType] = useState<"donor" | "hospital">("hospital");
  const [bloodInventory, setBloodInventory] = useState<any[]>([]);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [donationHistory, setDonationHistory] = useState<any[]>([]);
  const [nearbyBloodBanks, setNearbyBloodBanks] = useState<any[]>([]);
  const [donorProfile, setDonorProfile] = useState<any>(null);
  const [hospitalProfile, setHospitalProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<DonationEvent[]>([]);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // For demo purposes, toggle between donor and hospital view
  const toggleUserType = () => {
    setUserType(userType === "donor" ? "hospital" : "donor");
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch data based on user type
        if (userType === "donor") {
          const [profile, history, requests, nearby] = await Promise.all([
            mockDatabaseService.getDonorProfile(),
            mockDatabaseService.getDonationHistory(),
            mockDatabaseService.getBloodRequests(),
            mockDatabaseService.getNearbyBloodBanks(),
          ]);
          
          setDonorProfile(profile);
          setDonationHistory(history);
          setBloodRequests(requests);
          setNearbyBloodBanks(nearby);
        } else {
          const [profile, inventory, requests, eventsData] = await Promise.all([
            mockDatabaseService.getHospitalProfile(),
            mockDatabaseService.getBloodInventory(),
            mockDatabaseService.getBloodRequests(),
            mockDatabaseService.getDonationEvents(),
          ]);
          
          setHospitalProfile(profile);
          setBloodInventory(inventory);
          setBloodRequests(requests);
          setEvents(eventsData);
        }
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
  }, [userType, toast]);

  // Calculate days since last donation for donors
  const daysSinceLastDonation = () => {
    if (!donorProfile?.lastDonation) return "N/A";
    
    const lastDonationDate = new Date(donorProfile.lastDonation);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastDonationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays}d ago`;
  };

  // Determine if donor is eligible to donate
  const isDonorEligible = () => {
    if (!donorProfile?.eligibleDate) return false;
    
    const eligibleDate = new Date(donorProfile.eligibleDate);
    const today = new Date();
    
    return today >= eligibleDate;
  };

  // Handle registration for blood donation event
  const handleRegisterForEvent = async (eventId: string) => {
    try {
      const result = await mockDatabaseService.registerForEvent(eventId, currentUser?.id || '');
      
      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "You have successfully registered for this blood donation event.",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: result.message || "This event may be full.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred during registration.",
        variant: "destructive",
      });
    }
  };

  // Handle donation scheduling
  const handleScheduleDonation = () => {
    toast({
      title: "Donation Scheduling",
      description: "We're redirecting you to our scheduling system.",
    });
    
    // In a real app, this would redirect to a scheduling page
    setTimeout(() => {
      toast({
        title: "Appointment Scheduled",
        description: "Your donation appointment has been confirmed.",
      });
    }, 2000);
  };

  // Handle blood request creation
  const handleCreateBloodRequest = () => {
    if (userType === "hospital") {
      toast({
        title: "Create Blood Request",
        description: "Switching to AI matching to create a new blood request.",
      });
      
      // In a real app, we would navigate to the AI matching tab
      const aiMatchingTab = document.querySelector('[value="ai-matching"]') as HTMLElement;
      if (aiMatchingTab) {
        aiMatchingTab.click();
      }
    }
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
              <Button className="bg-red-600 hover:bg-red-700" onClick={handleScheduleDonation}>
                Schedule Donation
              </Button>
            ) : (
              <Button className="bg-red-600 hover:bg-red-700" onClick={handleCreateBloodRequest}>
                Create Blood Request
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : userType === "donor" ? (
          // Donor Dashboard
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-red-100 p-3 mb-2">
                    <DropletIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="text-sm text-gray-500">Blood Type</p>
                  <p className="text-2xl font-bold">{donorProfile?.bloodType || "Unknown"}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-green-100 p-3 mb-2">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-500">Last Donation</p>
                  <p className="text-2xl font-bold">{daysSinceLastDonation()}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-blue-100 p-3 mb-2">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-500">Donations Made</p>
                  <p className="text-2xl font-bold">{donorProfile?.donationsCount || 0}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-amber-100 p-3 mb-2">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <p className="text-sm text-gray-500">Next Eligible</p>
                  <p className={`text-xl font-bold ${isDonorEligible() ? 'text-green-600' : 'text-amber-600'}`}>
                    {isDonorEligible() ? "Ready" : "Waiting"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="blood-requests" className="w-full">
              <TabsList className="w-full grid grid-cols-4 mb-6">
                <TabsTrigger value="blood-requests">Blood Requests</TabsTrigger>
                <TabsTrigger value="donation-history">Donation History</TabsTrigger>
                <TabsTrigger value="nearby">Nearby Centers</TabsTrigger>
                <TabsTrigger value="ai-matching">AI Matching</TabsTrigger>
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
                      {bloodRequests.filter(req => req.urgency !== 'standard').map((request) => (
                        <div key={request.id} className={`p-4 rounded-lg border relative ${
                          request.urgency === 'critical' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
                        }`}>
                          <div className="absolute top-2 right-2">
                            <Badge className={request.matchPercentage > 90 ? 'bg-red-600' : 'bg-amber-600'}>
                              Match: {request.matchPercentage}%
                            </Badge>
                          </div>
                          <p className="font-semibold">Blood Type: {request.bloodType}</p>
                          <p className="text-sm text-gray-600">{request.hospital} - {request.distance}km away</p>
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <AlertCircle size={14} className={`mr-1 ${
                                request.urgency === 'critical' ? 'text-red-500' : 'text-amber-500'
                              }`} />
                              <span>{request.timeNeeded}</span>
                            </div>
                            <Button size="sm" className="bg-red-600 hover:bg-red-700">Respond</Button>
                          </div>
                        </div>
                      ))}

                      {bloodRequests.filter(req => req.urgency !== 'standard').length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                          No urgent blood requests at the moment.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">Standard Requests</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {bloodRequests.filter(req => req.urgency === 'standard').map((request) => (
                        <div key={request.id} className="p-4 bg-blue-50 rounded-lg border border-blue-100 relative">
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-blue-600">
                              Match: {request.matchPercentage}%
                            </Badge>
                          </div>
                          <p className="font-semibold">Blood Type: {request.bloodType}</p>
                          <p className="text-sm text-gray-600">{request.hospital} - {request.distance}km away</p>
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <AlertCircle size={14} className="mr-1 text-blue-500" />
                              <span>{request.timeNeeded}</span>
                            </div>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Respond</Button>
                          </div>
                        </div>
                      ))}

                      {bloodRequests.filter(req => req.urgency === 'standard').length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                          No standard blood requests at the moment.
                        </div>
                      )}
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
                      {donationHistory.map((donation) => (
                        <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div>
                            <p className="font-medium">{donation.hospitalName}</p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(donation.date), 'MMMM d, yyyy')}
                            </p>
                          </div>
                          <Badge className="bg-green-600">{donation.status === 'completed' ? 'Completed' : donation.status}</Badge>
                        </div>
                      ))}

                      {donationHistory.length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                          You haven't made any donations yet.
                        </div>
                      )}
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
                    {nearbyBloodBanks.map((bank) => (
                      <div key={bank.id} className="p-4 bg-white border rounded-lg">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{bank.name}</p>
                            <p className="text-sm text-gray-500">
                              {bank.distance} km away • Open {bank.openHours}
                            </p>
                          </div>
                          <Button size="sm" variant="outline">Directions</Button>
                        </div>
                      </div>
                    ))}

                    {nearbyBloodBanks.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        No nearby donation centers found.
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="ai-matching">
                <AiBloodMatchingSystem 
                  selectedRequest={bloodRequests.length > 0 ? bloodRequests[0] : undefined}
                  isHospital={false}
                />
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
                  <p className="text-2xl font-bold">
                    {bloodInventory.reduce((sum, item) => sum + item.units, 0)}
                  </p>
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
                  <p className="text-2xl font-bold text-amber-600">
                    {bloodRequests.filter(req => req.urgency === 'critical').length}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="ai-matching" className="w-full">
              <TabsList className="w-full grid grid-cols-4 mb-6">
                <TabsTrigger value="ai-matching">AI Matching</TabsTrigger>
                <TabsTrigger value="inventory">Blood Inventory</TabsTrigger>
                <TabsTrigger value="requests">My Requests</TabsTrigger>
                <TabsTrigger value="events">Donation Events</TabsTrigger>
              </TabsList>

              <TabsContent value="ai-matching">
                <AiBloodMatchingSystem />
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
                              {Math.round((item.units / 100) * 100)}%
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
                        {nearbyBloodBanks.map((bank) => (
                          <div key={bank.id} className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">{bank.name}</p>
                                <p className="text-sm text-gray-500">
                                  {bank.distance} km • {bank.availableUnits['O Rh+ (O+)']} O+ units available
                                </p>
                              </div>
                              <Button size="sm" variant="outline">Request</Button>
                            </div>
                          </div>
                        ))}
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
                                <UserCheck className="h-4 w-4 mr-1" />
                                <span>
                                  {request.urgency === 'critical' ? '2 donors confirmed' :
                                   request.urgency === 'urgent' ? '1 donor confirmed' :
                                   '4 donors confirmed'}
                                </span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">View Matches</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="events">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">Create Blood Donation Event</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Event Title</label>
                          <Input placeholder="E.g., Monthly Blood Drive" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Event Date</label>
                            <Input type="date" />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Event Time</label>
                            <Input type="time" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-1 block">Event Location</label>
                          <Input placeholder="Full address of the event" />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-1 block">Available Slots</label>
                          <Input type="number" min="1" defaultValue="30" />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-1 block">Event Description</label>
                          <Input placeholder="Brief description of the event" />
                        </div>
                        
                        <Button className="w-full bg-red-600 hover:bg-red-700">
                          Create Event
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {events.map((event) => (
                          <div key={event.id} className="p-4 bg-white border rounded-lg">
                            <h3 className="font-semibold">{event.title}</h3>
                            <div className="text-sm text-gray-600 space-y-1 mt-1">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-red-500" />
                                <span>{format(new Date(event.date), 'PP')}</span>
                              </div>
                              <div className="flex items-center">
                                <Map className="h-4 w-4 mr-1 text-red-500" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1 text-red-500" />
                                <span>{event.registeredDonors} / {event.slots} slots filled</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <Button size="sm" variant="outline" className="w-full">
                                Edit Event
                              </Button>
                            </div>
                          </div>
                        ))}

                        {events.length === 0 && (
                          <div className="text-center py-4 text-gray-500">
                            No upcoming events.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
      
      {/* Add more space before footer */}
      <div className="py-12"></div>
    </div>
  );
};

export default DashboardPage;
