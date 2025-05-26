
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Calendar, Bell, DollarSign, MapPin, Clock, Users, AlertTriangle } from 'lucide-react';
import mockDatabaseService from '../services/mockDatabase';
import { useToast } from "@/components/ui/use-toast";

const DonorDashboardPage = () => {
  const { toast } = useToast();
  const [selectedDrive, setSelectedDrive] = useState<string | null>(null);

  // Fetch donation drives
  const { data: donationDrives, isLoading: drivesLoading } = useQuery({
    queryKey: ['donationDrives'],
    queryFn: mockDatabaseService.getDonationDrives,
  });

  // Fetch blood requests (for urgent notifications)
  const { data: bloodRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['bloodRequests'],
    queryFn: mockDatabaseService.getBloodRequests,
  });

  // Filter urgent requests
  const urgentRequests = bloodRequests?.filter(req => req.urgency === 'critical') || [];

  const handleRegisterForDrive = async (driveId: string) => {
    try {
      const result = await mockDatabaseService.registerForDonationDrive(driveId, 'current-donor-id');
      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "You've been registered for this donation drive!",
        });
        setSelectedDrive(driveId);
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "Failed to register for drive",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'urgent': return 'bg-orange-100 text-orange-700';
      case 'routine': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Donor Dashboard</h1>
          </div>
          <p className="text-gray-600">Welcome back! Thank you for being a life-saver.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center">
            <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">5</h3>
            <p className="text-gray-600">Total Donations</p>
          </Card>

          <Card className="p-6 text-center">
            <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">15</h3>
            <p className="text-gray-600">Lives Saved</p>
          </Card>

          <Card className="p-6 text-center">
            <Calendar className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">{drivesLoading ? '...' : donationDrives?.filter(d => d.status === 'upcoming').length || 0}</h3>
            <p className="text-gray-600">Upcoming Drives</p>
          </Card>

          <Card className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">{requestsLoading ? '...' : urgentRequests.length}</h3>
            <p className="text-gray-600">Urgent Requests</p>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="drives">Donation Drives</TabsTrigger>
            <TabsTrigger value="donations">My Donations</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Bell className="h-6 w-6 text-orange-500" />
                  <h2 className="text-xl font-semibold">Urgent Blood Requests</h2>
                </div>
                
                {urgentRequests.length === 0 ? (
                  <p className="text-gray-500">No urgent requests at the moment.</p>
                ) : (
                  <div className="space-y-4">
                    {urgentRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4 bg-red-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-red-700">{request.hospital}</h3>
                            <p className="text-sm text-gray-600">{request.medicalCondition}</p>
                          </div>
                          <Badge className={getUrgencyColor(request.urgency)}>
                            {request.urgency.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span>Blood Type: <strong>{request.bloodType}</strong></span>
                          <span>Units: <strong>{request.units}</strong></span>
                          <span>Patient Age: <strong>{request.patientAge}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>Needed by: {new Date(request.neededBy).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Donation Drives Tab */}
          <TabsContent value="drives">
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="h-6 w-6 text-blue-500" />
                  <h2 className="text-xl font-semibold">Blood Donation Drives</h2>
                </div>
                
                {drivesLoading ? (
                  <p className="text-gray-500">Loading drives...</p>
                ) : donationDrives && donationDrives.length > 0 ? (
                  <div className="grid gap-4">
                    {donationDrives.map((drive) => (
                      <div key={drive.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{drive.eventName}</h3>
                            <p className="text-sm text-gray-600 mb-2">{drive.description}</p>
                            <p className="text-sm text-gray-500">Organized by: {drive.organizerName}</p>
                          </div>
                          <Badge className={getStatusColor(drive.status)}>
                            {drive.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{new Date(drive.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{drive.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{drive.registeredDonors}/{drive.expectedDonors} registered</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-gray-400" />
                            <span>Target: {drive.targetBloodTypes.join(', ')}</span>
                          </div>
                        </div>

                        {drive.status === 'upcoming' && (
                          <Button 
                            onClick={() => handleRegisterForDrive(drive.id)}
                            disabled={selectedDrive === drive.id}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {selectedDrive === drive.id ? 'Registered!' : 'Register for Drive'}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No donation drives available at the moment.</p>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* My Donations Tab */}
          <TabsContent value="donations">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="h-6 w-6 text-red-500" />
                <h2 className="text-xl font-semibold">My Donation History</h2>
              </div>
              
              <div className="space-y-4">
                {/* Mock donation history */}
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">City General Hospital</h3>
                    <span className="text-sm text-gray-500">March 15, 2024</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Blood Type: O+ | Units: 1 | Emergency Surgery</p>
                  <Badge className="bg-green-100 text-green-700">Completed</Badge>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Regional Medical Center</h3>
                    <span className="text-sm text-gray-500">February 8, 2024</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Blood Type: O+ | Units: 1 | Cancer Treatment</p>
                  <Badge className="bg-green-100 text-green-700">Completed</Badge>
                </div>

                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Next eligible donation: April 20, 2024</p>
                  <p className="text-sm text-gray-400">You can donate again in 8 weeks</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <div className="grid gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="h-6 w-6 text-green-500" />
                  <h2 className="text-xl font-semibold">Monetary Donations</h2>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Support blood banks and medical organizations with monetary donations to help maintain equipment, 
                  fund research, and support blood collection activities.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Button variant="outline" className="h-16 flex flex-col">
                    <span className="text-lg font-semibold">$25</span>
                    <span className="text-sm text-gray-600">Basic Support</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col">
                    <span className="text-lg font-semibold">$50</span>
                    <span className="text-sm text-gray-600">Standard Support</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col">
                    <span className="text-lg font-semibold">$100</span>
                    <span className="text-sm text-gray-600">Premium Support</span>
                  </Button>
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Make a Donation
                </Button>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Contact Support</h2>
                <p className="text-gray-600 mb-4">
                  Have questions about donation eligibility, scheduling, or need support? We're here to help!
                </p>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Phone:</strong> 1-800-DONATE</p>
                  <p className="text-sm"><strong>Email:</strong> support@bloodbankai.com</p>
                  <p className="text-sm"><strong>Hours:</strong> 24/7 Emergency Support</p>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DonorDashboardPage;
