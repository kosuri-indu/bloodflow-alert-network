
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
  ClipboardList
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import mockDatabaseService, { Hospital as HospitalType } from "@/services/mockDatabase";
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

const GovernmentDashboardPage = () => {
  const [hospitals, setHospitals] = useState<HospitalType[]>([]);
  const [pendingHospitals, setPendingHospitals] = useState<HospitalType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();
  const { approveHospital } = useAuth();
  
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch both verified and unverified hospitals
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
    
    fetchData();
  }, [toast, refreshTrigger]); // Added refreshTrigger dependency
  
  const handleVerifyHospital = async (hospitalId: string) => {
    try {
      // Call the approveHospital method from useAuth
      const success = await approveHospital(hospitalId);
      
      if (success) {
        // Find the hospital that was just verified
        const verifiedHospital = pendingHospitals.find(h => h.id === hospitalId);
        
        if (verifiedHospital) {
          // Optimistically update the UI - remove from pending and add to verified
          setPendingHospitals(prev => prev.filter(h => h.id !== hospitalId));
          setHospitals(prev => [...prev, {...verifiedHospital, verified: true}]);
          
          toast({
            title: "Hospital Verified",
            description: `${verifiedHospital.name} has been successfully verified.`,
          });
        }
      }
      
      // Refresh data to ensure UI is in sync with backend
      refreshData();
      
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during verification.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600">
            Government Health Authority Dashboard
          </h1>
          <p className="text-gray-500">
            Manage hospital registrations and ensure compliance.
          </p>
        </div>
        
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full bg-white rounded-md shadow-sm flex justify-between p-2">
            <TabsTrigger value="pending" className="data-[state=active]:bg-gray-100 rounded-md px-4 py-2 font-medium">
              Pending Registrations
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-gray-100 rounded-md px-4 py-2 font-medium">
              All Hospitals
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
                  Review and verify new hospital registrations.
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
                        <div className="p-4 flex justify-end">
                          <Button 
                            variant="outline"
                            onClick={() => handleVerifyHospital(hospital.id)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Verify Hospital
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
                  View all registered hospitals in the system.
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
                          <Badge variant="outline" className="mt-2">
                            Verified
                          </Badge>
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
