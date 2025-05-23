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
  Brain,
  Plus,
  Clock
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import mockDatabaseService, { BloodRequest, BloodInventory } from "@/services/mockDatabase";
import AiBloodMatchingSystem from "@/components/ai/AiBloodMatchingSystem";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from "../context/AuthContext";
import { format, differenceInDays } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const DashboardPage = () => {
  const [bloodInventory, setBloodInventory] = useState<BloodInventory[]>([]);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [hospitalProfile, setHospitalProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isAddingInventory, setIsAddingInventory] = useState(false);

  // New inventory form state
  const [newInventoryForm, setNewInventoryForm] = useState({
    bloodType: "",
    rhFactor: "positive",
    units: 1,
    processedDate: format(new Date(), "yyyy-MM-dd"),
    expirationDate: format(new Date(new Date().setDate(new Date().getDate() + 42)), "yyyy-MM-dd"),
    donorAge: 30,
    specialAttributes: [] as string[]
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [profile, inventoryDetails, requests] = await Promise.all([
          mockDatabaseService.getHospitalProfile(),
          mockDatabaseService.getBloodInventoryDetails(),
          mockDatabaseService.getBloodRequests(),
        ]);
        
        setHospitalProfile(profile);
        setBloodInventory(inventoryDetails);
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

  // Format blood type for display
  const formatBloodType = (bloodType: string, rhFactor: string) => {
    return `${bloodType} ${rhFactor === 'positive' ? `Rh+ (${bloodType}+)` : `Rh- (${bloodType}-)`}`;
  };

  // Handle add inventory form submit
  const handleAddInventory = async () => {
    try {
      // Basic validation
      if (!newInventoryForm.bloodType || newInventoryForm.units < 1) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields correctly.",
          variant: "destructive",
        });
        return;
      }

      // Create new inventory item - cast rhFactor to the correct type
      const newInventory = {
        bloodType: newInventoryForm.bloodType,
        rhFactor: newInventoryForm.rhFactor as 'positive' | 'negative', // Fix: explicit type cast
        units: newInventoryForm.units,
        hospital: hospitalProfile.name,
        processedDate: new Date(newInventoryForm.processedDate),
        expirationDate: new Date(newInventoryForm.expirationDate),
        donorAge: Number(newInventoryForm.donorAge),
        specialAttributes: newInventoryForm.specialAttributes
      };

      // Add to database
      await mockDatabaseService.addBloodInventory(newInventory);
      
      // Refresh inventory data
      const updatedInventory = await mockDatabaseService.getBloodInventoryDetails();
      setBloodInventory(updatedInventory);

      // Show success message
      toast({
        title: "Inventory Added",
        description: `${newInventoryForm.units} units of ${formatBloodType(newInventoryForm.bloodType, newInventoryForm.rhFactor)} added to inventory.`,
      });

      // Reset form and close dialog
      setNewInventoryForm({
        bloodType: "",
        rhFactor: "positive",
        units: 1,
        processedDate: format(new Date(), "yyyy-MM-dd"),
        expirationDate: format(new Date(new Date().setDate(new Date().getDate() + 42)), "yyyy-MM-dd"),
        donorAge: 30,
        specialAttributes: []
      });
      setIsAddingInventory(false);
    } catch (error) {
      console.error("Error adding inventory:", error);
      toast({
        title: "Error",
        description: "Failed to add inventory. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle checkbox changes for special attributes
  const handleSpecialAttributesChange = (attributeId: string, checked: boolean) => {
    if (checked) {
      setNewInventoryForm({
        ...newInventoryForm,
        specialAttributes: [...newInventoryForm.specialAttributes, attributeId]
      });
    } else {
      setNewInventoryForm({
        ...newInventoryForm,
        specialAttributes: newInventoryForm.specialAttributes.filter(id => id !== attributeId)
      });
    }
  };

  // Calculate expiry status for blood inventory
  const getExpiryStatus = (expirationDate: Date) => {
    const daysRemaining = differenceInDays(new Date(expirationDate), new Date());
    
    if (daysRemaining <= 0) {
      return { status: 'expired', color: 'text-red-600', message: 'Expired' };
    } else if (daysRemaining <= 7) {
      return { status: 'critical', color: 'text-red-600', message: `${daysRemaining}d left` };
    } else if (daysRemaining <= 14) {
      return { status: 'warning', color: 'text-amber-600', message: `${daysRemaining}d left` };
    } else {
      return { status: 'good', color: 'text-green-600', message: `${daysRemaining}d left` };
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
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setIsAddingInventory(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Inventory
            </Button>
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
                  {/* Using matchPercentage instead of matchCount since matchCount doesn't exist in the BloodRequest type */}
                  <p className="text-2xl font-bold">
                    {bloodRequests.reduce((total, req) => {
                      // If matchPercentage is over 70%, consider it a match
                      return req.matchPercentage > 70 ? total + 1 : total;
                    }, 0)}
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
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center gap-1"
                        onClick={() => setIsAddingInventory(true)}
                      >
                        <Plus className="h-4 w-4" /> Add Inventory
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3">Blood Type</th>
                            <th className="text-left py-3">Units</th>
                            <th className="text-left py-3">Processed</th>
                            <th className="text-left py-3">Expiration</th>
                            <th className="text-left py-3">Special Attributes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {bloodInventory.map((item, idx) => {
                            const expiryStatus = getExpiryStatus(item.expirationDate);
                            
                            return (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="py-3">
                                  <div className="flex items-center">
                                    <DropletIcon className="h-4 w-4 text-red-600 mr-2" />
                                    <span className="font-medium">
                                      {formatBloodType(item.bloodType, item.rhFactor)}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3">
                                  <div className={`font-medium ${
                                    item.units < 10 ? 'text-red-600' : 
                                    item.units < 30 ? 'text-amber-600' : 
                                    'text-gray-900'
                                  }`}>
                                    {item.units} units
                                  </div>
                                </td>
                                <td className="py-3">
                                  {format(new Date(item.processedDate), 'MMM d, yyyy')}
                                </td>
                                <td className="py-3">
                                  <div className="flex items-center">
                                    <span className={`${expiryStatus.color} mr-1`}>
                                      <Clock className="h-4 w-4 inline mr-1" />
                                      {expiryStatus.message}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3">
                                  {item.specialAttributes && item.specialAttributes.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {item.specialAttributes.map((attr, i) => (
                                        <Badge key={i} variant="outline" className="capitalize">
                                          {attr.replace('-', ' ')}
                                        </Badge>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">None</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          
                          {bloodInventory.length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-gray-500">
                                No blood inventory found. Add inventory to get started.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
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
                                  {request.matchPercentage > 90 ? '3+ hospitals matched' :
                                   request.matchPercentage > 80 ? '2 hospitals matched' :
                                   request.matchPercentage > 70 ? '1 hospital matched' :
                                   'Looking for matches...'}
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
      
      {/* Add Inventory Dialog */}
      <Dialog open={isAddingInventory} onOpenChange={setIsAddingInventory}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Blood Inventory</DialogTitle>
            <DialogDescription>
              Add new blood units to your hospital inventory. The more details you provide, the better our AI can match blood to requests.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select
                  value={newInventoryForm.bloodType}
                  onValueChange={(value) => setNewInventoryForm({...newInventoryForm, bloodType: value})}
                >
                  <SelectTrigger id="bloodType">
                    <SelectValue placeholder="Select Blood Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="AB">AB</SelectItem>
                    <SelectItem value="O">O</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rhFactor">Rh Factor</Label>
                <Select
                  value={newInventoryForm.rhFactor}
                  onValueChange={(value) => setNewInventoryForm({...newInventoryForm, rhFactor: value})}
                >
                  <SelectTrigger id="rhFactor">
                    <SelectValue placeholder="Select Rh Factor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive (+)</SelectItem>
                    <SelectItem value="negative">Negative (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="units">Units</Label>
              <Input
                id="units"
                type="number"
                min="1"
                value={newInventoryForm.units}
                onChange={(e) => setNewInventoryForm({...newInventoryForm, units: parseInt(e.target.value) || 1})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="processedDate">Processing Date</Label>
                <Input
                  id="processedDate"
                  type="date"
                  value={newInventoryForm.processedDate}
                  onChange={(e) => setNewInventoryForm({...newInventoryForm, processedDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expirationDate">Expiration Date</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={newInventoryForm.expirationDate}
                  onChange={(e) => setNewInventoryForm({...newInventoryForm, expirationDate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="donorAge">Donor Age</Label>
              <Input
                id="donorAge"
                type="number"
                min="18"
                max="65"
                value={newInventoryForm.donorAge}
                onChange={(e) => setNewInventoryForm({...newInventoryForm, donorAge: parseInt(e.target.value) || 30})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Special Attributes</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="irradiated"
                    checked={newInventoryForm.specialAttributes.includes('irradiated')}
                    onCheckedChange={(checked) => 
                      handleSpecialAttributesChange('irradiated', checked === true)
                    }
                  />
                  <label htmlFor="irradiated" className="text-sm">Irradiated</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="leukoreduced"
                    checked={newInventoryForm.specialAttributes.includes('leukoreduced')}
                    onCheckedChange={(checked) => 
                      handleSpecialAttributesChange('leukoreduced', checked === true)
                    }
                  />
                  <label htmlFor="leukoreduced" className="text-sm">Leukoreduced</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cmv-negative"
                    checked={newInventoryForm.specialAttributes.includes('cmv-negative')}
                    onCheckedChange={(checked) => 
                      handleSpecialAttributesChange('cmv-negative', checked === true)
                    }
                  />
                  <label htmlFor="cmv-negative" className="text-sm">CMV Negative</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="washed"
                    checked={newInventoryForm.specialAttributes.includes('washed')}
                    onCheckedChange={(checked) => 
                      handleSpecialAttributesChange('washed', checked === true)
                    }
                  />
                  <label htmlFor="washed" className="text-sm">Washed</label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingInventory(false)}>Cancel</Button>
            <Button onClick={handleAddInventory}>Add to Inventory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="py-12"></div>
    </div>
  );
};

export default DashboardPage;
