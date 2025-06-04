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
  Clock,
  LogOut,
  User,
  RefreshCw,
  Clipboard
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from "../context/AuthContext";
import { format, differenceInDays } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import mockDatabaseService, { BloodRequest, BloodInventory } from "@/services/mockDatabase";
import { useDashboardStats } from "../hooks/useDashboardStats";

const DashboardPage = () => {
  const [bloodInventory, setBloodInventory] = useState<BloodInventory[]>([]);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser, logout } = useAuth();
  const [isAddingInventory, setIsAddingInventory] = useState(false);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);

  const { stats, isLoading: statsLoading, refreshStats } = useDashboardStats();

  const [newInventoryForm, setNewInventoryForm] = useState({
    bloodType: "",
    rhFactor: "positive",
    units: 1,
    processedDate: format(new Date(), "yyyy-MM-dd"),
    expirationDate: format(new Date(new Date().setDate(new Date().getDate() + 42)), "yyyy-MM-dd"),
    donorAge: 30,
    specialAttributes: [] as string[]
  });

  const [newRequestForm, setNewRequestForm] = useState({
    bloodType: "",
    units: 1,
    urgency: "routine",
    patientAge: 30,
    patientWeight: 70,
    medicalCondition: "",
    neededBy: format(new Date(new Date().setHours(new Date().getHours() + 24)), "yyyy-MM-dd'T'HH:mm"),
    specialRequirements: [] as string[]
  });

  const handleLogout = () => {
    console.log('Hospital Dashboard - LOGOUT CLICKED');
    logout();
  };

  const getExpiryStatus = (expirationDate: Date) => {
    const daysUntilExpiry = differenceInDays(new Date(expirationDate), new Date());
    
    if (daysUntilExpiry < 0) {
      return { color: 'text-red-600', message: 'Expired' };
    } else if (daysUntilExpiry <= 3) {
      return { color: 'text-red-600', message: `${daysUntilExpiry} days left` };
    } else if (daysUntilExpiry <= 7) {
      return { color: 'text-amber-600', message: `${daysUntilExpiry} days left` };
    } else {
      return { color: 'text-green-600', message: `${daysUntilExpiry} days left` };
    }
  };

  const handleSpecialAttributesChange = (attribute: string, checked: boolean) => {
    setNewInventoryForm(prev => ({
      ...prev,
      specialAttributes: checked 
        ? [...prev.specialAttributes, attribute]
        : prev.specialAttributes.filter(attr => attr !== attribute)
    }));
  };

  const refreshAllData = async () => {
    if (!currentUser?.id || !currentUser?.hospitalName) {
      console.log('🚫 No current user available - clearing data');
      setBloodInventory([]);
      setBloodRequests([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 Refreshing data for hospital:', currentUser.hospitalName, 'ID:', currentUser.id);
      
      // CRITICAL: Use hospital ID for strict data isolation
      const [inventoryDetails, requests] = await Promise.all([
        mockDatabaseService.getHospitalBloodInventoryById(currentUser.id),
        mockDatabaseService.getHospitalBloodRequestsById(currentUser.id)
      ]);
      
      // Double-check data isolation
      const verifiedInventory = inventoryDetails.filter(item => item.hospitalId === currentUser.id);
      const verifiedRequests = requests.filter(req => req.hospitalId === currentUser.id);
      
      console.log('✅ Data verified for hospital:', currentUser.hospitalName, {
        inventory: verifiedInventory.length,
        requests: verifiedRequests.length
      });
      
      setBloodInventory(verifiedInventory);
      setBloodRequests(verifiedRequests);
      
      toast({
        title: "Data Refreshed",
        description: `${currentUser.hospitalName} data updated successfully.`,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setBloodInventory([]);
      setBloodRequests([]);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // CRITICAL: Clear data immediately when user changes
  useEffect(() => {
    console.log('👤 User changed in DashboardPage - clearing and fetching for:', currentUser?.hospitalName, 'ID:', currentUser?.id);
    
    // Immediately clear data to prevent showing old data
    setBloodInventory([]);
    setBloodRequests([]);
    
    if (currentUser?.id) {
      refreshAllData();
      refreshStats();
    } else {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    const handleDataRefresh = () => {
      console.log('📡 Data refresh event received - refreshing for:', currentUser?.hospitalName);
      if (currentUser?.id) {
        refreshAllData();
        refreshStats();
      }
    };

    window.addEventListener('dataRefresh', handleDataRefresh);
    return () => window.removeEventListener('dataRefresh', handleDataRefresh);
  }, [currentUser?.id]);

  const hospitalStats = {
    totalBloodUnits: bloodInventory.reduce((sum, item) => sum + item.units, 0),
    activeRequests: bloodRequests.length,
    criticalRequests: bloodRequests.filter(req => req.urgency === 'critical').length,
    lowStockTypes: Object.entries(
      bloodInventory.reduce((acc, item) => {
        const bloodType = `${item.bloodType} ${item.rhFactor === 'positive' ? '+' : '-'}`;
        acc[bloodType] = (acc[bloodType] || 0) + item.units;
        return acc;
      }, {} as Record<string, number>)
    ).filter(([, units]) => units < 10).map(([type]) => type)
  };

  const formatBloodType = (bloodType: string, rhFactor: string) => {
    return `${bloodType} ${rhFactor === 'positive' ? `Rh+ (${bloodType}+)` : `Rh- (${bloodType}-)`}`;
  };

  const handleAddInventory = async () => {
    try {
      if (!currentUser?.hospitalName || !currentUser?.id) {
        toast({
          title: "Error",
          description: "No hospital information available.",
          variant: "destructive",
        });
        return;
      }

      if (!newInventoryForm.bloodType || newInventoryForm.units < 1) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields correctly.",
          variant: "destructive",
        });
        return;
      }

      console.log('➕ Adding inventory for hospital:', currentUser.hospitalName, 'ID:', currentUser.id);

      const newInventory = {
        bloodType: newInventoryForm.bloodType,
        rhFactor: newInventoryForm.rhFactor as 'positive' | 'negative',
        units: newInventoryForm.units,
        processedDate: new Date(newInventoryForm.processedDate),
        expirationDate: new Date(newInventoryForm.expirationDate),
        donorAge: Number(newInventoryForm.donorAge),
        specialAttributes: newInventoryForm.specialAttributes
      };

      await mockDatabaseService.addBloodInventory(currentUser.hospitalName, newInventory);
      await refreshAllData();

      toast({
        title: "Inventory Added",
        description: `${newInventoryForm.units} units of ${formatBloodType(newInventoryForm.bloodType, newInventoryForm.rhFactor)} added to ${currentUser.hospitalName} inventory.`,
      });

      // ... keep existing code (reset form and close dialog)
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

  const handleCreateBloodRequest = async () => {
    try {
      if (!currentUser?.hospitalName || !currentUser?.id) {
        toast({
          title: "Error",
          description: "No hospital information available.",
          variant: "destructive",
        });
        return;
      }

      if (!newRequestForm.bloodType || newRequestForm.units < 1) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields correctly.",
          variant: "destructive",
        });
        return;
      }

      console.log('📝 Creating request for hospital:', currentUser.hospitalName, 'ID:', currentUser.id);

      const newRequest = {
        hospital: currentUser.hospitalName,
        bloodType: `${newRequestForm.bloodType} ${newRequestForm.bloodType === 'O' ? 'Rh-' : 'Rh+'} (${newRequestForm.bloodType}${newRequestForm.bloodType === 'O' ? '-' : '+'})`,
        units: newRequestForm.units,
        urgency: newRequestForm.urgency as 'routine' | 'urgent' | 'critical',
        patientAge: newRequestForm.patientAge,
        patientWeight: newRequestForm.patientWeight,
        medicalCondition: newRequestForm.medicalCondition,
        neededBy: new Date(newRequestForm.neededBy),
        specialRequirements: newRequestForm.specialRequirements
      };

      const result = await mockDatabaseService.createBloodRequest(newRequest);
      
      if (result.success) {
        await refreshAllData();
        
        toast({
          title: "Blood Request Created",
          description: `Request created for ${currentUser.hospitalName} and sent to Government Health Authority.`,
        });

        // ... keep existing code (reset form and close dialog)
        setIsCreatingRequest(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to create blood request. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating request:", error);
      toast({
        title: "Error",
        description: "Failed to create blood request.",
        variant: "destructive",
      });
    }
  };

  // Show login prompt if no user
  if (!currentUser?.hospitalName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <Hospital className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Hospital Login Required</h2>
            <p className="text-gray-600 mb-4">Please log in as a hospital to access your dashboard.</p>
            <Button onClick={() => window.location.href = '/register'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-red-600 mb-2 md:mb-0">
              {currentUser.hospitalName} Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Hospital ID: {currentUser.id} • Manage your blood inventory and requests
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg shadow-sm">
              <User size={16} className="text-gray-600" />
              <div className="text-sm">
                <p className="font-medium text-gray-700">{currentUser.hospitalName}</p>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshAllData}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setIsAddingInventory(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Inventory
              </Button>
              
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => setIsCreatingRequest(true)}>
                Create Request
              </Button>
              
              <Button
                variant="destructive"
                size="lg"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 border-2 border-red-800 shadow-lg"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                <span>LOGOUT</span>
              </Button>
            </div>
          </div>
        </div>

        {isLoading || statsLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-red-100 p-3 mb-2">
                    <DropletIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="text-sm text-gray-500">My Blood Units</p>
                  <p className="text-2xl font-bold">{hospitalStats.totalBloodUnits}</p>
                  <p className="text-xs text-gray-400">In inventory</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-blue-100 p-3 mb-2">
                    <Clipboard className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-500">Active Requests</p>
                  <p className="text-2xl font-bold">{hospitalStats.activeRequests}</p>
                  <p className="text-xs text-gray-400">Pending matching</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-amber-100 p-3 mb-2">
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <p className="text-sm text-gray-500">Critical</p>
                  <p className="text-2xl font-bold text-amber-600">{hospitalStats.criticalRequests}</p>
                  <p className="text-xs text-gray-400">Urgent requests</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-orange-100 p-3 mb-2">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <p className="text-sm text-gray-500">Low Stock</p>
                  <p className="text-2xl font-bold text-orange-600">{hospitalStats.lowStockTypes.length}</p>
                  <p className="text-xs text-gray-400">Blood types</p>
                </CardContent>
              </Card>
            </div>

            {hospitalStats.lowStockTypes.length > 0 && (
              <Card className="mb-6 border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <h3 className="font-semibold text-amber-800">Low Stock Alert</h3>
                  </div>
                  <p className="text-sm text-amber-700">
                    Low stock detected for: {hospitalStats.lowStockTypes.join(', ')}
                  </p>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="inventory" className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger value="inventory">My Blood Inventory</TabsTrigger>
                <TabsTrigger value="requests">My Requests</TabsTrigger>
              </TabsList>

              <TabsContent value="inventory">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl flex items-center justify-between">
                      <span>Blood Inventory - {currentUser.hospitalName}</span>
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
                                No blood inventory found for {currentUser.hospitalName}. Add inventory to get started.
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
                    <CardTitle className="text-xl flex items-center justify-between">
                      <span>My Blood Requests - {currentUser.hospitalName}</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={refreshAllData}
                        disabled={isLoading}
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </CardTitle>
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
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <p className="font-semibold text-lg">
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
                                <Badge variant="outline" className="ml-2 bg-green-50">
                                  Match: {request.matchPercentage}%
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <div>
                                  <p className="text-sm text-gray-600 flex items-center">
                                    <Hospital className="h-4 w-4 mr-1" />
                                    <span className="font-medium">{request.hospital}</span>
                                  </p>
                                  <p className="text-xs text-gray-500 ml-5">Medical Center District</p>
                                </div>
                                
                                <div>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Patient:</span> {request.patientAge}y, {request.patientWeight}kg
                                  </p>
                                  <p className="text-xs text-gray-500">{request.medicalCondition}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                  <p>Created: {format(new Date(request.createdAt), 'MMM d, yyyy HH:mm')}</p>
                                  <p>Needed by: {format(new Date(request.neededBy), 'MMM d, yyyy HH:mm')}</p>
                                </div>
                                
                                <div className="flex items-center text-sm">
                                  <div className={`flex items-center ${
                                    request.matchPercentage > 90 ? 'text-green-600' :
                                    request.matchPercentage > 70 ? 'text-amber-600' :
                                    'text-gray-500'
                                  }`}>
                                    <Brain className="h-4 w-4 mr-1" />
                                    <span>
                                      {request.matchPercentage > 90 ? '3+ hospitals matched' :
                                       request.matchPercentage > 70 ? '2 hospitals matched' :
                                       request.matchPercentage > 50 ? '1 hospital matched' :
                                       'Looking for matches...'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {request.specialRequirements && request.specialRequirements.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500 mb-1">Special Requirements:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {request.specialRequirements.map((req, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {req.replace('-', ' ')}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {bloodRequests.length === 0 && (
                        <div className="text-center py-6 text-gray-600">
                          <Hospital className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-lg font-medium mb-2">No active blood requests</p>
                          <p className="text-sm text-gray-500 mb-4">
                            Create a request for {currentUser.hospitalName} to get blood from other hospitals.
                          </p>
                          <Button onClick={() => setIsCreatingRequest(true)} className="bg-red-600 hover:bg-red-700">
                            Create Your First Request
                          </Button>
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
      
      <Dialog open={isCreatingRequest} onOpenChange={setIsCreatingRequest}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Blood Request</DialogTitle>
            <DialogDescription>
              Submit a blood request to the Government Health Authority. They will find matches from other hospitals.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select
                  value={newRequestForm.bloodType}
                  onValueChange={(value) => setNewRequestForm({...newRequestForm, bloodType: value})}
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
                <Label htmlFor="urgency">Urgency</Label>
                <Select
                  value={newRequestForm.urgency}
                  onValueChange={(value) => setNewRequestForm({...newRequestForm, urgency: value})}
                >
                  <SelectTrigger id="urgency">
                    <SelectValue placeholder="Select Urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="units">Units Needed</Label>
              <Input
                id="units"
                type="number"
                min="1"
                value={newRequestForm.units}
                onChange={(e) => setNewRequestForm({...newRequestForm, units: parseInt(e.target.value) || 1})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientAge">Patient Age</Label>
                <Input
                  id="patientAge"
                  type="number"
                  min="1"
                  max="120"
                  value={newRequestForm.patientAge}
                  onChange={(e) => setNewRequestForm({...newRequestForm, patientAge: parseInt(e.target.value) || 30})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patientWeight">Patient Weight (kg)</Label>
                <Input
                  id="patientWeight"
                  type="number"
                  min="1"
                  max="200"
                  value={newRequestForm.patientWeight}
                  onChange={(e) => setNewRequestForm({...newRequestForm, patientWeight: parseInt(e.target.value) || 70})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="medicalCondition">Medical Condition</Label>
              <Input
                id="medicalCondition"
                value={newRequestForm.medicalCondition}
                onChange={(e) => setNewRequestForm({...newRequestForm, medicalCondition: e.target.value})}
                placeholder="e.g., Surgery, Trauma, Anemia"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="neededBy">Needed By</Label>
              <Input
                id="neededBy"
                type="datetime-local"
                value={newRequestForm.neededBy}
                onChange={(e) => setNewRequestForm({...newRequestForm, neededBy: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingRequest(false)}>Cancel</Button>
            <Button onClick={handleCreateBloodRequest}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="py-12"></div>
    </div>
  );
};

export default DashboardPage;
