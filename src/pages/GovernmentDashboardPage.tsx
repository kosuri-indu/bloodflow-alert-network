
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { Hospital, Users, CheckCircle, XCircle, Eye, Trash2, Edit, Plus } from 'lucide-react';
import mockDatabaseService from '../services/mockDatabase';

const GovernmentDashboardPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingHospital, setEditingHospital] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [hospitalFormData, setHospitalFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    contactPerson: '',
    registrationId: ''
  });

  // Fetch all data
  const { data: allData, isLoading } = useQuery({
    queryKey: ['governmentData'],
    queryFn: mockDatabaseService.getAllHospitalsWithData,
    refetchInterval: 5000,
  });

  // Verify hospital mutation
  const verifyMutation = useMutation({
    mutationFn: (hospitalId: string) => mockDatabaseService.verifyHospital(hospitalId),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Hospital Verified",
          description: `${result.hospitalName} has been successfully verified.`,
        });
        queryClient.invalidateQueries({ queryKey: ['governmentData'] });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to verify hospital",
          variant: "destructive",
        });
      }
    },
  });

  // Delete hospital mutation
  const deleteMutation = useMutation({
    mutationFn: (hospitalId: string) => mockDatabaseService.deleteHospital(hospitalId),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Hospital Deleted",
          description: "Hospital has been successfully deleted.",
        });
        queryClient.invalidateQueries({ queryKey: ['governmentData'] });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete hospital",
          variant: "destructive",
        });
      }
    },
  });

  // Update hospital mutation
  const updateMutation = useMutation({
    mutationFn: ({ hospitalId, data }: { hospitalId: string; data: any }) => 
      mockDatabaseService.updateHospital(hospitalId, data),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Hospital Updated",
          description: "Hospital information has been updated successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ['governmentData'] });
        setIsEditDialogOpen(false);
        setEditingHospital(null);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update hospital",
          variant: "destructive",
        });
      }
    },
  });

  const openEditDialog = (hospital) => {
    setEditingHospital(hospital);
    setHospitalFormData({
      name: hospital.name,
      email: hospital.email,
      address: hospital.address,
      phone: hospital.phone,
      contactPerson: hospital.contactPerson,
      registrationId: hospital.registrationId
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateHospital = () => {
    if (!editingHospital) return;
    updateMutation.mutate({ 
      hospitalId: editingHospital.id, 
      data: hospitalFormData 
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading government dashboard...</div>
      </div>
    );
  }

  const { hospitals = [], inventory = [], requests = [] } = allData || {};
  const pendingHospitals = hospitals.filter(h => !h.verified);
  const verifiedHospitals = hospitals.filter(h => h.verified);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Government Dashboard - India</h1>
        <p className="text-gray-600">Welcome back, {currentUser?.name} - Managing Indian Healthcare System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hospitals</p>
              <p className="text-2xl font-bold">{hospitals.length}</p>
            </div>
            <Hospital className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Verification</p>
              <p className="text-2xl font-bold">{pendingHospitals.length}</p>
            </div>
            <Users className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Blood Units</p>
              <p className="text-2xl font-bold">{inventory.reduce((sum, item) => sum + item.units, 0)}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Requests</p>
              <p className="text-2xl font-bold">{requests.length}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Hospitals ({pendingHospitals.length})</TabsTrigger>
          <TabsTrigger value="verified">Verified Hospitals ({verifiedHospitals.length})</TabsTrigger>
          <TabsTrigger value="overview">System Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingHospitals.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No hospitals pending verification</p>
            </Card>
          ) : (
            pendingHospitals.map((hospital) => (
              <Card key={hospital.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{hospital.name}</h3>
                    <p className="text-gray-600">{hospital.email}</p>
                    <p className="text-sm text-gray-500">Contact: {hospital.contactPerson}</p>
                    <p className="text-sm text-gray-500">Address: {hospital.address}</p>
                    <p className="text-sm text-gray-500">Phone: {hospital.phone}</p>
                    <p className="text-sm text-gray-500">Registration ID: {hospital.registrationId}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => verifyMutation.mutate(hospital.id)}
                      disabled={verifyMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => openEditDialog(hospital)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(hospital.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
          {verifiedHospitals.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No verified hospitals</p>
            </Card>
          ) : (
            verifiedHospitals.map((hospital) => (
              <Card key={hospital.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{hospital.name}</h3>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Verified
                      </Badge>
                    </div>
                    <p className="text-gray-600">{hospital.email}</p>
                    <p className="text-sm text-gray-500">Contact: {hospital.contactPerson}</p>
                    <p className="text-sm text-gray-500">Address: {hospital.address}</p>
                    <p className="text-sm text-gray-500">Phone: {hospital.phone}</p>
                    <div className="mt-2">
                      <p className="text-sm">
                        <span className="font-medium">Blood Units:</span> {
                          inventory.filter(item => item.hospitalId === hospital.id)
                            .reduce((sum, item) => sum + item.units, 0)
                        }
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Active Requests:</span> {
                          requests.filter(req => req.hospitalId === hospital.id).length
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => openEditDialog(hospital)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(hospital.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Blood Inventory Summary (India)</h3>
              <div className="space-y-2">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bloodType => {
                  const units = inventory.filter(item => 
                    `${item.bloodType}${item.rhFactor === 'positive' ? '+' : '-'}` === bloodType
                  ).reduce((sum, item) => sum + item.units, 0);
                  
                  return (
                    <div key={bloodType} className="flex justify-between">
                      <span>{bloodType}:</span>
                      <span className="font-medium">{units} units</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Monitoring all Indian hospital activities</p>
                <p className="text-sm">• {hospitals.length} hospitals in system</p>
                <p className="text-sm">• {inventory.length} inventory entries</p>
                <p className="text-sm">• {requests.length} active blood requests</p>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Hospital Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hospital Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Hospital Name</Label>
              <Input
                value={hospitalFormData.name}
                onChange={(e) => setHospitalFormData({...hospitalFormData, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                value={hospitalFormData.email}
                onChange={(e) => setHospitalFormData({...hospitalFormData, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                value={hospitalFormData.contactPerson}
                onChange={(e) => setHospitalFormData({...hospitalFormData, contactPerson: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                value={hospitalFormData.address}
                onChange={(e) => setHospitalFormData({...hospitalFormData, address: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                value={hospitalFormData.phone}
                onChange={(e) => setHospitalFormData({...hospitalFormData, phone: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="registrationId">Registration ID</Label>
              <Input
                value={hospitalFormData.registrationId}
                onChange={(e) => setHospitalFormData({...hospitalFormData, registrationId: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateHospital} className="bg-blue-600 hover:bg-blue-700">
                Update Hospital
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GovernmentDashboardPage;
