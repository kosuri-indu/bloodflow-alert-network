
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, AlertCircle } from "lucide-react";

interface BloodRequest {
  id: string;
  bloodType: string;
  hospital: string;
  urgency: 'critical' | 'urgent' | 'standard';
  distance: number;
  timeNeeded: string;
  matchPercentage: number;
}

interface AiMatchingCardProps {
  requests: BloodRequest[];
}

const AiMatchingCard: React.FC<AiMatchingCardProps> = ({ requests }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">
          <div className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-purple-500" />
            AI Matched Requests
          </div>
        </CardTitle>
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          Smart Matching
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request) => (
          <div 
            key={request.id}
            className={`p-4 rounded-lg border transition-all hover:shadow-md relative ${
              request.urgency === 'critical' ? 'bg-red-50 border-red-200' :
              request.urgency === 'urgent' ? 'bg-amber-50 border-amber-200' :
              'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="absolute top-2 right-2">
              <Badge className={`${
                request.matchPercentage > 90 ? 'bg-green-600' :
                request.matchPercentage > 70 ? 'bg-amber-600' :
                'bg-blue-600'
              }`}>
                Match: {request.matchPercentage}%
              </Badge>
            </div>
            
            <p className="font-semibold">Blood Type: {request.bloodType}</p>
            <p className="text-sm text-gray-600">{request.hospital} - {request.distance}km away</p>
            
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center text-xs text-gray-500">
                <AlertCircle size={14} className={`mr-1 ${
                  request.urgency === 'critical' ? 'text-red-500' :
                  request.urgency === 'urgent' ? 'text-amber-500' :
                  'text-blue-500'
                }`} />
                <span>{request.timeNeeded}</span>
              </div>
              <Button size="sm" className="bg-red-600 hover:bg-red-700">Respond</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AiMatchingCard;
