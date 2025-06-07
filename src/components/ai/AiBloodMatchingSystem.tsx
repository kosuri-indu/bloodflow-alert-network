
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { Brain, MapPin, Clock, Phone, RefreshCw, Filter, Search } from "lucide-react";
import useAiMatching from '@/hooks/useAiMatching';
import mockDatabaseService, { BloodRequest } from '@/services/mockDatabase';

const AiBloodMatchingSystem = () => {
  const { currentUser } = useAuth();
  const { isProcessing, matches, runAiMatching, contactHospital } = useAiMatching();
  const { toast } = useToast();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      if (currentUser?.hospitalName) {
        const data = await mockDatabaseService.getHospitalBloodRequests(currentUser.hospitalName);
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch blood requests.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser?.hospitalName]);

  const handleRunMatching = async () => {
    if (!selectedRequest) {
      toast({
        title: "No Request Selected",
        description: "Please select a blood request to run AI matching.",
        variant: "destructive",
      });
      return;
    }

    const request = requests.find(r => r.id === selectedRequest);
    if (request) {
      await runAiMatching(request);
    }
  };

  const handleContactHospital = async (hospitalId: string, requestId: string) => {
    await contactHospital(hospitalId, requestId);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'urgent': return 'bg-amber-500';
      default: return 'bg-blue-500';
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.bloodType.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         request.medicalCondition.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesUrgency = urgencyFilter === 'all' || request.urgency === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  return (
    <div className="space-y-6">
      {/* AI Matching Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indian-blue" />
            AI Blood Matching System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Request Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="request-select">Select Blood Request for AI Matching</Label>
              <Select value={selectedRequest} onValueChange={setSelectedRequest}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a blood request to match" />
                </SelectTrigger>
                <SelectContent>
                  {filteredRequests.map((request) => (
                    <SelectItem key={request.id} value={request.id}>
                      {request.bloodType} • {request.units} units • {request.urgency} • {request.medicalCondition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleRunMatching}
                disabled={isProcessing || !selectedRequest}
                className="w-full bg-indian-blue hover:bg-blue-700"
              >
                {isProcessing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                {isProcessing ? 'Processing...' : 'Run AI Matching'}
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          {matches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-indian-blue">{matches.length}</div>
                <div className="text-sm text-gray-600">Total Matches Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {matches.filter(m => m.matchScore >= 90).length}
                </div>
                <div className="text-sm text-gray-600">Excellent Matches (90%+)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {matches.filter(m => m.status === 'contacted').length}
                </div>
                <div className="text-sm text-gray-600">Hospitals Contacted</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blood Requests List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Your Blood Requests</CardTitle>
            <Button 
              variant="outline" 
              onClick={fetchRequests}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search by blood type or condition..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgencies</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-4">Loading requests...</div>
          ) : filteredRequests.length > 0 ? (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div 
                  key={request.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedRequest === request.id ? 'border-indian-blue bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedRequest(request.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="font-semibold text-lg">
                        {request.bloodType} • {request.units} units
                      </div>
                      <Badge className={getUrgencyColor(request.urgency)}>
                        {request.urgency.toUpperCase()}
                      </Badge>
                      {request.matchPercentage > 0 && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {request.matchPercentage}% Match Available
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {new Date(request.neededBy).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Condition:</strong> {request.medicalCondition}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Patient:</strong> {request.patientAge}y, {request.patientWeight}kg
                  </div>
                  {request.specialRequirements && request.specialRequirements.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-medium text-gray-700">Special Requirements:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {request.specialRequirements.map((req, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-600">
              <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">No blood requests found</p>
              <p className="text-sm text-gray-500">
                {searchFilter || urgencyFilter !== 'all' 
                  ? 'Try adjusting your filters.'
                  : 'Create a blood request to use AI matching.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Matching Results */}
      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-green-600" />
              AI Matching Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matches.map((match) => (
                <div key={`${match.donorId}-${match.requestId}`} className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-indian-blue">{match.hospitalName}</h3>
                      <p className="text-gray-600 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {match.hospitalAddress}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getMatchScoreColor(match.matchScore)}>
                        {match.matchScore}% Match
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {match.distance} km away
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <strong>Blood Type:</strong> {match.bloodType}
                    </div>
                    <div>
                      <strong>Available:</strong> {match.availableUnits} units
                    </div>
                    <div>
                      <strong>Donor Age:</strong> {match.donorAge} years
                    </div>
                    <div>
                      <strong>Expires in:</strong> {match.expiryDays} days
                    </div>
                  </div>

                  {match.specialAttributes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Special Attributes:</p>
                      <div className="flex flex-wrap gap-1">
                        {match.specialAttributes.map((attr, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {attr.replace('-', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 text-xs text-gray-600 mb-4">
                    <div>Blood Compatibility: {match.compatibilityScore}%</div>
                    <div>Age Compatibility: {match.ageCompatibilityScore}%</div>
                    <div>Medical Compatibility: {match.medicalCompatibilityScore}%</div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    {match.status === 'potential' ? (
                      <Button
                        onClick={() => handleContactHospital(match.donorId, match.requestId)}
                        className="bg-indian-blue hover:bg-blue-700"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Contact Hospital
                      </Button>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Hospital Contacted
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AiBloodMatchingSystem;
