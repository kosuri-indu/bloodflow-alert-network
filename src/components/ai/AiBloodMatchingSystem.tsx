
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, AlertCircle, Hospital, MapPin, Clock, Filter, DropletIcon } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { BloodRequest, AiMatch } from '@/services/mockDatabase';
import mockDatabaseService from '@/services/mockDatabase';
import useAiMatching from '@/hooks/useAiMatching';

interface AiBloodMatchingSystemProps {
  selectedRequest?: BloodRequest;
}

const AiBloodMatchingSystem = ({ selectedRequest }: AiBloodMatchingSystemProps) => {
  const [bloodType, setBloodType] = useState<string>('O Rh+ (O+)');
  const [urgency, setUrgency] = useState<'standard' | 'urgent' | 'critical'>('urgent');
  const [units, setUnits] = useState<number>(2);
  const [requiredBy, setRequiredBy] = useState<string>('');
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [activeRequest, setActiveRequest] = useState<BloodRequest | undefined>(selectedRequest);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isProcessing, matches, runAiMatching, contactDonor } = useAiMatching();

  // AI Parameters
  const [distancePriority, setDistancePriority] = useState([75]);
  const [geneticPriority, setGeneticPriority] = useState([90]); // Increased emphasis on genetic/blood type
  const [qualityPriority, setQualityPriority] = useState([50]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await mockDatabaseService.getBloodRequests();
        setRequests(data);
        if (!selectedRequest && data.length > 0) {
          setActiveRequest(data[0]);
        }
      } catch (error) {
        console.error('Error fetching blood requests:', error);
      }
    };

    fetchRequests();
  }, [selectedRequest]);

  useEffect(() => {
    if (activeRequest) {
      runAiMatching(activeRequest);
    }
  }, [activeRequest]);

  // Blood compatibility explanation based on selected blood type
  const getBloodCompatibilityInfo = (selectedBloodType: string) => {
    const bloodCompatibilityMap: Record<string, { canDonateTo: string[], canReceiveFrom: string[] }> = {
      'A Rh+ (A+)': {
        canDonateTo: ['A Rh+ (A+)', 'AB Rh+ (AB+)'],
        canReceiveFrom: ['A Rh+ (A+)', 'A Rh- (A-)', 'O Rh+ (O+)', 'O Rh- (O-)'],
      },
      'A Rh- (A-)': {
        canDonateTo: ['A Rh+ (A+)', 'A Rh- (A-)', 'AB Rh+ (AB+)', 'AB Rh- (AB-)'],
        canReceiveFrom: ['A Rh- (A-)', 'O Rh- (O-)'],
      },
      'B Rh+ (B+)': {
        canDonateTo: ['B Rh+ (B+)', 'AB Rh+ (AB+)'],
        canReceiveFrom: ['B Rh+ (B+)', 'B Rh- (B-)', 'O Rh+ (O+)', 'O Rh- (O-)'],
      },
      'B Rh- (B-)': {
        canDonateTo: ['B Rh+ (B+)', 'B Rh- (B-)', 'AB Rh+ (AB+)', 'AB Rh- (AB-)'],
        canReceiveFrom: ['B Rh- (B-)', 'O Rh- (O-)'],
      },
      'AB Rh+ (AB+)': {
        canDonateTo: ['AB Rh+ (AB+)'],
        canReceiveFrom: ['A Rh+ (A+)', 'A Rh- (A-)', 'B Rh+ (B+)', 'B Rh- (B-)', 'AB Rh+ (AB+)', 'AB Rh- (AB-)', 'O Rh+ (O+)', 'O Rh- (O-)'],
      },
      'AB Rh- (AB-)': {
        canDonateTo: ['AB Rh+ (AB+)', 'AB Rh- (AB-)'],
        canReceiveFrom: ['A Rh- (A-)', 'B Rh- (B-)', 'AB Rh- (AB-)', 'O Rh- (O-)'],
      },
      'O Rh+ (O+)': {
        canDonateTo: ['A Rh+ (A+)', 'B Rh+ (B+)', 'AB Rh+ (AB+)', 'O Rh+ (O+)'],
        canReceiveFrom: ['O Rh+ (O+)', 'O Rh- (O-)'],
      },
      'O Rh- (O-)': {
        canDonateTo: ['A Rh+ (A+)', 'A Rh- (A-)', 'B Rh+ (B+)', 'B Rh- (B-)', 'AB Rh+ (AB+)', 'AB Rh- (AB-)', 'O Rh+ (O+)', 'O Rh- (O-)'],
        canReceiveFrom: ['O Rh- (O-)'],
      },
    };

    const info = bloodCompatibilityMap[selectedBloodType];
    return info ? {
      canDonateTo: info.canDonateTo.join(', '),
      canReceiveFrom: info.canReceiveFrom.join(', ')
    } : {
      canDonateTo: 'Unknown',
      canReceiveFrom: 'Unknown'
    };
  };

  const handleCreateRequest = async () => {
    setIsLoading(true);

    try {
      // Get time needed based on urgency
      let timeNeeded = '';
      let neededByDate = new Date();
      
      if (urgency === 'critical') {
        timeNeeded = 'Needed within 24 hours';
        neededByDate.setDate(neededByDate.getDate() + 1);
      } else if (urgency === 'urgent') {
        timeNeeded = 'Needed within 48 hours';
        neededByDate.setDate(neededByDate.getDate() + 2);
      } else {
        timeNeeded = 'Needed within 3 days';
        neededByDate.setDate(neededByDate.getDate() + 3);
      }

      const newRequest = await mockDatabaseService.createBloodRequest({
        bloodType,
        hospital: 'City General Hospital',
        urgency,
        distance: 0, // Not applicable for own hospital
        timeNeeded,
        status: 'pending',
        units,
        neededBy: requiredBy ? new Date(requiredBy) : neededByDate,
      });

      toast({
        title: 'Request Created',
        description: `Blood request for ${bloodType} has been created.`,
      });

      // Update requests list and set active request
      setRequests(prev => [newRequest, ...prev]);
      setActiveRequest(newRequest);
    } catch (error) {
      console.error('Error creating blood request:', error);
      toast({
        title: 'Error',
        description: 'Failed to create blood request.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyAiParameters = () => {
    if (activeRequest) {
      toast({
        title: 'AI Parameters Applied',
        description: 'Reprocessing blood matching with updated parameters.',
      });
      runAiMatching(activeRequest);
    }
  };

  const handleContactDonor = (donorId: string) => {
    if (activeRequest) {
      contactDonor(donorId, activeRequest.id);
    }
  };

  // Get blood compatibility info for the current blood type
  const bloodCompatibilityInfo = getBloodCompatibilityInfo(bloodType);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Create Blood Request</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Blood Type</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="A Rh+ (A+)">A Rh+ (A+)</option>
                  <option value="A Rh- (A-)">A Rh- (A-)</option>
                  <option value="B Rh+ (B+)">B Rh+ (B+)</option>
                  <option value="B Rh- (B-)">B Rh- (B-)</option>
                  <option value="AB Rh+ (AB+)">AB Rh+ (AB+)</option>
                  <option value="AB Rh- (AB-)">AB Rh- (AB-)</option>
                  <option value="O Rh+ (O+)">O Rh+ (O+)</option>
                  <option value="O Rh- (O-)">O Rh- (O-)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Urgency</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  disabled={isLoading}
                >
                  <option value="standard">Standard</option>
                  <option value="urgent">Urgent</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Units Required</label>
              <Input 
                type="number" 
                min="1" 
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Required By</label>
              <Input 
                type="datetime-local" 
                value={requiredBy}
                onChange={(e) => setRequiredBy(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            {/* Blood compatibility info box */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-medium mb-1 text-sm">Blood Type Compatibility</h3>
              <div className="text-xs space-y-1">
                <p><strong>Can donate to:</strong> {bloodCompatibilityInfo.canDonateTo}</p>
                <p><strong>Can receive from:</strong> {bloodCompatibilityInfo.canReceiveFrom}</p>
              </div>
            </div>
            
            <div className="flex items-center pt-2">
              <input type="checkbox" id="ai-match" className="mr-2" defaultChecked />
              <label htmlFor="ai-match" className="text-sm">Use AI to find the best matched hospitals</label>
            </div>
            
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
              onClick={handleCreateRequest}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                  Creating Request...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Find Hospital Matches with AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">
            <div className="flex items-center">
              <Brain className="mr-2 h-5 w-5 text-purple-500" />
              BloodBank AI Smart Matching System
            </div>
          </CardTitle>
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            Smart Matching
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <h3 className="font-medium mb-2">BloodBank AI Match Parameters</h3>
              <div className="space-y-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Distance Priority</span>
                    <span className="text-xs text-gray-500">
                      {distancePriority[0] <= 33 ? 'Low' : 
                       distancePriority[0] <= 66 ? 'Medium' : 'High'}
                    </span>
                  </div>
                  <Slider 
                    max={100} 
                    step={1} 
                    value={distancePriority}
                    onValueChange={setDistancePriority}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Blood Type Compatibility</span>
                    <span className="text-xs text-gray-500">
                      {geneticPriority[0] <= 33 ? 'Low' : 
                       geneticPriority[0] <= 66 ? 'Medium' : 'High'}
                    </span>
                  </div>
                  <Slider 
                    max={100} 
                    step={1}
                    value={geneticPriority}
                    onValueChange={setGeneticPriority}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Supply Quality</span>
                    <span className="text-xs text-gray-500">
                      {qualityPriority[0] <= 33 ? 'Low' : 
                       qualityPriority[0] <= 66 ? 'Medium' : 'High'}
                    </span>
                  </div>
                  <Slider 
                    max={100} 
                    step={1}
                    value={qualityPriority}
                    onValueChange={setQualityPriority}
                  />
                </div>
              </div>
              <Button 
                size="sm" 
                className="w-full bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                onClick={handleApplyAiParameters}
                disabled={isProcessing || !activeRequest}
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <Filter className="h-4 w-4" /> Apply AI Parameters
                  </>
                )}
              </Button>
            </div>

            <Tabs defaultValue="potential" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="potential">Potential Hospitals</TabsTrigger>
                <TabsTrigger value="matched">Matched Hospitals</TabsTrigger>
              </TabsList>
              
              <TabsContent value="potential" className="space-y-3 mt-2">
                {isProcessing ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Finding optimal hospital matches with AI...</p>
                  </div>
                ) : matches.length > 0 ? (
                  matches
                    .filter(match => match.status === 'potential')
                    .map(match => (
                      <div key={match.donorId} className="p-3 bg-white border rounded-lg shadow-sm relative">
                        <div className="absolute top-2 right-2">
                          <Badge className={`${
                            match.matchScore > 90 ? 'bg-green-600' :
                            match.matchScore > 80 ? 'bg-amber-600' :
                            'bg-blue-600'
                          }`}>
                            Match: {match.matchScore}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{match.donorName}</p>
                            <div className="flex items-center text-sm text-gray-600">
                              <Hospital className="mr-1 h-4 w-4 text-blue-500" />
                              <span>{match.bloodType} • {match.previousDonations} units available</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <MapPin className="mr-1 h-4 w-4 text-blue-500" />
                              <span>{match.distance}km away</span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => handleContactDonor(match.donorId)}
                          >
                            Contact
                          </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">No potential hospital matches found for this request.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="matched" className="space-y-3 mt-2">
                {matches
                  .filter(match => match.status !== 'potential')
                  .length > 0 ? (
                  matches
                    .filter(match => match.status !== 'potential')
                    .map(match => (
                      <div 
                        key={match.donorId} 
                        className={`p-3 rounded-lg shadow-sm relative ${
                          match.status === 'confirmed' ? 'bg-green-50 border border-green-100' :
                          match.status === 'in-transit' ? 'bg-amber-50 border border-amber-100' :
                          'bg-blue-50 border border-blue-100'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <p className="font-semibold">{match.donorName}</p>
                              <Badge className={`ml-2 ${
                                match.status === 'confirmed' ? 'bg-green-600' :
                                match.status === 'in-transit' ? 'bg-amber-600' :
                                'bg-blue-600'
                              }`}>
                                {match.status === 'contacted' ? 'Contacted' :
                                 match.status === 'confirmed' ? 'Confirmed' :
                                 match.status === 'in-transit' ? 'In Transit' : 'Completed'}
                              </Badge>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Hospital className={`mr-1 h-4 w-4 ${
                                match.status === 'confirmed' ? 'text-green-500' :
                                match.status === 'in-transit' ? 'text-amber-500' :
                                'text-blue-500'
                              }`} />
                              <span>
                                {match.bloodType} • 
                                {match.appointmentTime ? 
                                  ` Transfer: ${new Date(match.appointmentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 
                                  ' Awaiting response'}
                              </span>
                            </div>
                            {match.eta && (
                              <div className="flex items-center text-sm text-gray-600 mt-1">
                                <Clock className={`mr-1 h-4 w-4 ${
                                  match.status === 'confirmed' ? 'text-green-500' :
                                  match.status === 'in-transit' ? 'text-amber-500' :
                                  'text-blue-500'
                                }`} />
                                <span>ETA: {match.eta} minutes</span>
                              </div>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className={`
                              ${match.status === 'confirmed' ? 'border-green-500 text-green-700' :
                                match.status === 'in-transit' ? 'border-amber-500 text-amber-700' :
                                'border-blue-500 text-blue-700'}
                            `}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">No matched hospitals yet.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiBloodMatchingSystem;
