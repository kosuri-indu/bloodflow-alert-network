
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  DropletIcon, 
  Building2,
  Hospital,
  CheckCircle2,
  AlertCircle, 
  ClipboardList,
  LogOut,
  User,
  RefreshCw,
  Trash2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import mockDatabaseService, { Hospital as HospitalType } from "@/services/mockDatabase";
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

const GovernmentDashboardPage = () => {
  const [hospitals, setHospitals] = useState<HospitalType[]>([]);
  const [pendingHospitals, setPendingHospitals] = useState<HospitalType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { approveHospital, logout, currentUser, refreshData } = useAuth();
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      console.log('Government Dashboard - Fetching fresh data from persistent storage');
      
      const [verifiedHospitals, unverifiedHospitals] = await Promise.all([
        mockDatabaseService.getRegisteredHospitals(),
        mockDatabaseService.getPendingHospitals()
      ]);
      
      console.log('Fetched verified hospitals:', verifiedHospitals);
      console.log('Fetched pending hospitals:', unverifiedHospitals);
      
      setHospitals(verifiedHospitals);
      setPendingHospitals(unverifiedHospitals);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data for the dashboard.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [toast]);
  
  const handleVerifyHospital = async (hospitalId: string) => {
    try {
      const success = await approveHospital(hospitalId);
      
      if (success) {
        const verifiedHospital = pendingHospitals.find(h => h.id === hospitalId);
        
        if (verifiedHospital) {
          setPendingHospitals(prev => prev.filter(h => h.id !== hospitalId));
          setHospitals(prev => [...prev, {...verifiedHospital, verified: true}]);
          
          toast({
            title: "Hospital Verified",
            description: `${verifiedHospital.name} has been successfully verified.`,
          });
        }
      }
      
      // Refresh data to ensure UI is in sync
      await fetchData();
      
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during verification.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteHospital = async (hospitalId: string, hospitalName: string) => {
    try {
      const result = await mockDatabaseService.deleteHospital(hospitalId);
      
      if (result.success) {
        setPendingHospitals(prev => prev.filter(h => h.id !== hospitalId));
        setHospitals(prev => prev.filter(h => h.id !== hospitalId));
        
        toast({
          title: "Hospital Deleted",
          description: `${hospitalName} has been removed from the system.`,
        });
        
        await fetchData();
      } else {
        toast({
          title: "Delete Failed",
          description: result.error || "Failed to delete hospital.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during deletion.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    console.log('Manual refresh triggered');
    refreshData();
    await fetchData();
    toast({
      title: "Data Refreshed",
      description: "All data has been refreshed from storage.",
    });
  };

  const handleLogout = () => {
    console.log('Government Dashboard - LOGOUT BUTTON CLICKED');
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">
                Government Health Authority Dashboard
              </h1>
              <p className="text-gray-500">
                Manage hospital registrations and ensure compliance.
              </p>
            </div>
            
            {/* User Info and Controls */}
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-md shadow-sm border">
                <User size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {currentUser?.name}
                </span>
              </div>
              
              <div className="flex gap-2">
                {/* Refresh Button */}
                <Button
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                  Refresh
                </Button>
                
                {/* PROMINENT LOGOUT BUTTON */}
                <Button
                  variant="destructive"
                  size="lg"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 border-2 border-red-800 shadow-lg"
                  onClick={handleLogout}
                >
                  <LogOut size={20} />
                  <span className="text-lg">LOGOUT</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full bg-white rounded-md shadow-sm flex justify-between p-2">
            <TabsTrigger value="pending" className="data-[state=active]:bg-gray-100 rounded-md px-4 py-2 font-medium">
              Pending Registrations ({pendingHospitals.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-gray-100 rounded-md px-4 py-2 font-medium">
              All Hospitals ({hospitals.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
                  Pending Hospital Registrations
                </CardTitle>
                <CardDescription>
                  Review and verify new hospital registrations. Data persists across sessions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">
                    Loading pending registrations...
                  </div>
                ) : pendingHospitals.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingHospitals.map((hospital) => (
                      <Card key={hospital.id} className="bg-white shadow-md rounded-md">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold flex items-center">
                            <Hospital className="mr-2 h-5 w-5 text-gray-700" />
                            {hospital.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600">
                            <Building2 className="inline-block h-4 w-4 mr-1" />
                            {hospital.address}
                          </p>
                          <p className="text-gray-600">
                            <ClipboardList className="inline-block h-4 w-4 mr-1" />
                            Registration ID: {hospital.registrationId}
                          </p>
                          <p className="text-gray-600">
                            <DropletIcon className="inline-block h-4 w-4 mr-1" />
                            Contact: {hospital.contactPerson}
                          </p>
                          <p className="text-gray-600">
                            <a href={`mailto:${hospital.email}`} className="text-blue-500 hover:underline">
                              {hospital.email}
                            </a>
                          </p>
                          <p className="text-gray-600">
                            Registered on: {format(new Date(hospital.createdAt), 'MMM d, yyyy')}
                          </p>
                        </CardContent>
                        <div className="p-4 flex justify-between gap-2">
                          <Button 
                            variant="outline"
                            onClick={() => handleVerifyHospital(hospital.id)}
                            className="flex-1"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Verify
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => handleDeleteHospital(hospital.id, hospital.name)}
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    No pending hospital registrations.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Hospital className="mr-2 h-5 w-5 text-blue-500" />
                  All Registered Hospitals
                </CardTitle>
                <CardDescription>
                  View all verified hospitals in the system. Changes persist across sessions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">
                    Loading all hospitals...
                  </div>
                ) : hospitals.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hospitals.map((hospital) => (
                      <Card key={hospital.id} className="bg-white shadow-md rounded-md">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold flex items-center">
                            <Hospital className="mr-2 h-5 w-5 text-gray-700" />
                            {hospital.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600">
                            <Building2 className="inline-block h-4 w-4 mr-1" />
                            {hospital.address}
                          </p>
                          <p className="text-gray-600">
                            <ClipboardList className="inline-block h-4 w-4 mr-1" />
                            Registration ID: {hospital.registrationId}
                          </p>
                          <p className="text-gray-600">
                            <DropletIcon className="inline-block h-4 w-4 mr-1" />
                            Contact: {hospital.contactPerson}
                          </p>
                          <p className="text-gray-600">
                            <a href={`mailto:${hospital.email}`} className="text-blue-500 hover:underline">
                              {hospital.email}
                            </a>
                          </p>
                          <div className="flex justify-between items-center mt-3">
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Verified
                            </Badge>
                            <Button 
                              variant="destructive"
                              onClick={() => handleDeleteHospital(hospital.id, hospital.name)}
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    No registered hospitals found.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GovernmentDashboardPage;
