
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useQuery } from '@tanstack/react-query';
import { Activity, Droplets, Users, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import InventoryManager from '../components/hospital/InventoryManager';
import RequestManager from '../components/hospital/RequestManager';
import AiBloodMatchingSystem from '../components/ai/AiBloodMatchingSystem';
import mockDatabaseService from '../services/mockDatabase';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch hospital-specific data
  const { data: hospitalData, refetch: refetchHospitalData } = useQuery({
    queryKey: ['hospitalData', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return { inventory: [], requests: [] };
      
      const [inventory, requests] = await Promise.all([
        mockDatabaseService.getHospitalBloodInventoryById(currentUser.id),
        mockDatabaseService.getHospitalBloodRequestsById(currentUser.id)
      ]);
      
      return { inventory, requests };
    },
    enabled: !!currentUser?.id,
    refetchInterval: 5000,
  });

  if (!currentUser) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Please log in to access the dashboard.</div>
      </div>
    );
  }

  const { inventory = [], requests = [] } = hospitalData || {};

  // Calculate recent activity
  const recentInventory = inventory
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentRequests = requests
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const urgentRequests = requests.filter(req => req.urgency === 'urgent' || req.urgency === 'critical');

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-indian-black">
          Hospital Dashboard - {currentUser.hospitalName}
        </h1>
        <p className="text-gray-600">Welcome back, {currentUser.name} - Managing blood inventory and requests</p>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-indian-blue">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Blood Units</p>
                <p className="text-2xl font-bold text-indian-blue">
                  {statsLoading ? '...' : stats.totalBloodUnits}
                </p>
              </div>
              <Droplets className="h-8 w-8 text-indian-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indian-red">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Requests</p>
                <p className="text-2xl font-bold text-indian-red">
                  {requests.length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-indian-red" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent Requests</p>
                <p className="text-2xl font-bold text-amber-600">
                  {urgentRequests.length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Matches</p>
                <p className="text-2xl font-bold text-green-600">
                  {statsLoading ? '...' : stats.aiMatches}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-indian-blue data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="inventory" className="data-[state=active]:bg-indian-blue data-[state=active]:text-white">
            Blood Inventory
          </TabsTrigger>
          <TabsTrigger value="requests" className="data-[state=active]:bg-indian-blue data-[state=active]:text-white">
            Blood Requests
          </TabsTrigger>
          <TabsTrigger value="ai-matching" className="data-[state=active]:bg-indian-blue data-[state=active]:text-white">
            AI Matching
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Inventory */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-indian-blue" />
                  Recent Blood Inventory
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentInventory.length > 0 ? (
                  <div className="space-y-3">
                    {recentInventory.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">
                            {item.bloodType} {item.rhFactor === 'positive' ? '+' : '-'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.units} units • Expires: {new Date(item.expirationDate).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-indian-blue text-white">
                          Fresh
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No inventory items yet</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indian-red" />
                  Recent Blood Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentRequests.length > 0 ? (
                  <div className="space-y-3">
                    {recentRequests.map((request) => (
                      <div key={request.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">
                            {request.bloodType} • {request.units} units
                          </div>
                          <div className="text-sm text-gray-600">
                            {request.medicalCondition}
                          </div>
                        </div>
                        <Badge 
                          className={
                            request.urgency === 'critical' ? 'bg-red-500' :
                            request.urgency === 'urgent' ? 'bg-amber-500' : 'bg-indian-blue'
                          }
                        >
                          {request.urgency}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No requests yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alert */}
          {stats.lowStockTypes.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="h-5 w-5" />
                  Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700 mb-2">
                  The following blood types are running low:
                </p>
                <div className="flex flex-wrap gap-2">
                  {stats.lowStockTypes.map((type) => (
                    <Badge key={type} variant="outline" className="border-amber-500 text-amber-700">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryManager hospitalName={currentUser.hospitalName || ''} />
        </TabsContent>

        <TabsContent value="requests">
          <RequestManager hospitalName={currentUser.hospitalName || ''} />
        </TabsContent>

        <TabsContent value="ai-matching">
          <AiBloodMatchingSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
