
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, HospitalSquare, CheckCircle2, Clock, AlertCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import mockDatabaseService from '../services/mockDatabase';

interface Hospital {
  id: string;
  name: string;
  email: string;
  contactPerson: string;
  phone: string;
  registrationId: string;
  address: string;
  verified: boolean;
  createdAt: Date;
}

const GovernmentDashboardPage = () => {
  const navigate = useNavigate();
  const { currentUser, userType, approveHospital, isAuthenticated, logout } = useAuth();
  const [pendingHospitals, setPendingHospitals] = useState<Hospital[]>([]);
  const [verifiedHospitals, setVerifiedHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Redirect if not authenticated as government
  useEffect(() => {
    if (!isAuthenticated || userType !== 'government') {
      navigate('/gov-login');
      return;
    }
    
    // Load hospitals data
    const loadHospitals = async () => {
      setIsLoading(true);
      try {
        const allHospitals = await mockDatabaseService.getRegisteredHospitals();
        setPendingHospitals(allHospitals.filter(h => !h.verified));
        setVerifiedHospitals(allHospitals.filter(h => h.verified));
      } catch (error) {
        console.error('Error loading hospitals:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHospitals();
  }, [isAuthenticated, userType, navigate]);
  
  const handleApprove = async (hospitalId: string) => {
    const success = await approveHospital(hospitalId);
    if (success) {
      // Refresh the lists after approval
      const allHospitals = await mockDatabaseService.getRegisteredHospitals();
      setPendingHospitals(allHospitals.filter(h => !h.verified));
      setVerifiedHospitals(allHospitals.filter(h => h.verified));
    }
  };
  
  const filteredPendingHospitals = pendingHospitals.filter(hospital => 
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.registrationId.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredVerifiedHospitals = verifiedHospitals.filter(hospital => 
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.registrationId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Briefcase className="w-10 h-10 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Government Health Authority Dashboard</h1>
            <p className="text-gray-600">
              Manage hospital registration approvals
            </p>
          </div>
        </div>
        
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>
      
      <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Welcome, {currentUser?.name}</h2>
        <p className="text-gray-700">
          You have {pendingHospitals.length} pending hospital registrations awaiting your review and approval.
        </p>
      </div>
      
      <div className="mb-6">
        <div className="flex space-x-2">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            placeholder="Search hospitals by name, email or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
      </div>
      
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" /> 
            Pending Approvals ({filteredPendingHospitals.length})
          </TabsTrigger>
          <TabsTrigger value="verified" className="flex items-center">
            <CheckCircle2 className="mr-2 h-4 w-4" /> 
            Verified Hospitals ({filteredVerifiedHospitals.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading pending registrations...</p>
            </div>
          ) : filteredPendingHospitals.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                <AlertCircle className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No pending approvals</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no hospitals awaiting verification at this time.
              </p>
            </div>
          ) : (
            filteredPendingHospitals.map(hospital => (
              <Card key={hospital.id} className="overflow-hidden border-l-4 border-l-amber-500">
                <CardHeader className="bg-amber-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <HospitalSquare className="mr-2 h-5 w-5 text-amber-600" />
                        {hospital.name}
                      </CardTitle>
                      <CardDescription>
                        ID: {hospital.registrationId} | Registered: {new Date(hospital.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                      Pending Verification
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Contact Person</h4>
                      <p>{hospital.contactPerson}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Email</h4>
                      <p>{hospital.email}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                      <p>{hospital.phone}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Address</h4>
                      <p>{hospital.address}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 flex justify-end space-x-2">
                  <Button onClick={() => handleApprove(hospital.id)} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve Registration
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="verified" className="space-y-4">
          {isLoading ? (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading verified hospitals...</p>
            </div>
          ) : filteredVerifiedHospitals.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No verified hospitals</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no verified hospitals in the system yet.
              </p>
            </div>
          ) : (
            filteredVerifiedHospitals.map(hospital => (
              <Card key={hospital.id} className="overflow-hidden border-l-4 border-l-green-500">
                <CardHeader className="bg-green-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <HospitalSquare className="mr-2 h-5 w-5 text-green-600" />
                        {hospital.name}
                      </CardTitle>
                      <CardDescription>
                        ID: {hospital.registrationId} | Registered: {new Date(hospital.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                      Verified
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Contact Person</h4>
                      <p>{hospital.contactPerson}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Email</h4>
                      <p>{hospital.email}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                      <p>{hospital.phone}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Address</h4>
                      <p>{hospital.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GovernmentDashboardPage;
