
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import mockDatabaseService, { AiMatch, BloodRequest, BloodInventory } from '@/services/mockDatabase';

// Blood compatibility chart - defining which blood types can donate to which recipients
const bloodCompatibility = {
  'A Rh+ (A+)': ['A Rh+ (A+)', 'AB Rh+ (AB+)'],
  'A Rh- (A-)': ['A Rh+ (A+)', 'A Rh- (A-)', 'AB Rh+ (AB+)', 'AB Rh- (AB-)'],
  'B Rh+ (B+)': ['B Rh+ (B+)', 'AB Rh+ (AB+)'],
  'B Rh- (B-)': ['B Rh+ (B+)', 'B Rh- (B-)', 'AB Rh+ (AB+)', 'AB Rh- (AB-)'],
  'AB Rh+ (AB+)': ['AB Rh+ (AB+)'],
  'AB Rh- (AB-)': ['AB Rh+ (AB+)', 'AB Rh- (AB-)'],
  'O Rh+ (O+)': ['A Rh+ (A+)', 'B Rh+ (B+)', 'AB Rh+ (AB+)', 'O Rh+ (O+)'],
  'O Rh- (O-)': ['A Rh+ (A+)', 'A Rh- (A-)', 'B Rh+ (B+)', 'B Rh- (B-)', 'AB Rh+ (AB+)', 'AB Rh- (AB-)', 'O Rh+ (O+)', 'O Rh- (O-)'],
};

// Function to calculate blood compatibility score
const calculateBloodCompatibilityScore = (donorBloodType: string, recipientBloodType: string): number => {
  // Perfect match - same blood type
  if (donorBloodType === recipientBloodType) {
    return 100;
  }
  
  // Check if donor can donate to recipient
  if (bloodCompatibility[donorBloodType]?.includes(recipientBloodType)) {
    // Universal donor (O-) gets a high score but not 100 (reserve 100 for exact matches)
    if (donorBloodType === 'O Rh- (O-)') {
      return 95;
    }
    // Other compatible types get a good score
    return 90;
  }
  
  // Check if recipient can receive from donor (reverse compatibility check)
  if (bloodCompatibility[recipientBloodType]?.includes(donorBloodType)) {
    return 80; // Less optimal but potentially usable in emergencies
  }
  
  // Not compatible
  return 0;
}

const formatBloodType = (bloodType: string, rhFactor: string) => {
  return `${bloodType} ${rhFactor === 'positive' ? `Rh+ (${bloodType}+)` : `Rh- (${bloodType}-)`}`;
};

export function useAiMatching() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [matches, setMatches] = useState<AiMatch[]>([]);
  const { toast } = useToast();

  const runAiMatching = async (request: BloodRequest | { id: string }) => {
    setIsProcessing(true);
    toast({
      title: "AI Matching",
      description: "Processing blood matching with AI. This might take a moment...",
    });

    try {
      // Get actual inventory data for matching
      const inventory = await mockDatabaseService.getBloodInventoryDetails();
      const hospitals = await mockDatabaseService.getRegisteredHospitals();
      
      // Find the blood request
      const bloodRequests = await mockDatabaseService.getBloodRequests();
      const bloodRequest = bloodRequests.find(req => req.id === request.id);
      
      if (!bloodRequest) {
        throw new Error('Blood request not found');
      }

      // Create matches based on actual inventory
      const potentialMatches: AiMatch[] = [];
      
      inventory.forEach(inv => {
        const hospital = hospitals.find(h => h.name === inv.hospital);
        if (!hospital) return;
        
        const donorBloodType = formatBloodType(inv.bloodType, inv.rhFactor);
        const compatibilityScore = calculateBloodCompatibilityScore(donorBloodType, bloodRequest.bloodType);
        
        // Only include compatible blood types
        if (compatibilityScore > 0 && inv.units > 0) {
          // Calculate distance (simulated based on hospital location)
          const distance = Math.floor(Math.random() * 25) + 1;
          
          // Calculate final match score based on multiple factors
          const urgencyMultiplier = bloodRequest.urgency === 'critical' ? 1.2 : 
                                    bloodRequest.urgency === 'urgent' ? 1.1 : 1.0;
          
          const unitsAvailableScore = Math.min(inv.units / bloodRequest.units, 1) * 100;
          const distanceScore = Math.max(0, 100 - (distance * 2));
          
          const finalScore = Math.round(
            (compatibilityScore * 0.4) + 
            (unitsAvailableScore * 0.3) + 
            (distanceScore * 0.2) + 
            (urgencyMultiplier * 10)
          );
          
          potentialMatches.push({
            donorId: hospital.id,
            requestId: bloodRequest.id,
            hospitalName: hospital.name,
            hospitalAddress: hospital.address,
            bloodType: donorBloodType,
            bloodRhFactor: inv.rhFactor,
            availableUnits: inv.units,
            distance: distance,
            matchScore: Math.min(finalScore, 100),
            status: 'potential',
            specialAttributes: inv.specialAttributes || [],
            compatibilityScore: compatibilityScore
          });
        }
      });
      
      // Sort by match score (highest first) and take top matches
      const sortedMatches = potentialMatches
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 8); // Limit to top 8 matches
      
      setMatches(sortedMatches);
      
      // Update the request with match percentage based on best match
      const bestMatchScore = sortedMatches.length > 0 ? sortedMatches[0].matchScore : 0;
      await mockDatabaseService.updateBloodRequest(bloodRequest.id, { 
        matchPercentage: bestMatchScore 
      });
      
      toast({
        title: "AI Matching Complete",
        description: `Found ${sortedMatches.length} potential hospital matches for this request.`,
      });
      
      return { 
        success: true,
        matches: sortedMatches,
        requestBloodType: bloodRequest.bloodType
      };
      
    } catch (error) {
      console.error("AI matching error:", error);
      toast({
        title: "AI Matching Failed",
        description: "Failed to process AI matching. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsProcessing(false);
    }
  };

  const contactHospital = async (hospitalId: string, requestId: string) => {
    try {
      const result = await mockDatabaseService.contactHospital(hospitalId, requestId);
      
      const processedResult = result as { success: boolean; error?: string };
      
      if (processedResult.success) {
        // Update local matches state
        setMatches(prev => prev.map(match => 
          match.donorId === hospitalId && match.requestId === requestId 
            ? { ...match, status: 'contacted' } 
            : match
        ));
        
        toast({
          title: "Contact Request Sent",
          description: "The hospital has been notified about this blood request.",
        });
      } else {
        toast({
          title: "Contact Failed",
          description: "Failed to contact the hospital. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error contacting hospital:", error);
      toast({
        title: "Contact Error",
        description: "An unexpected error occurred when trying to contact the hospital.",
        variant: "destructive",
      });
    }
  };

  return {
    isProcessing,
    matches,
    runAiMatching,
    contactHospital,
  };
}

export default useAiMatching;
