
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import mockDatabaseService, { AiMatch, BloodRequest } from '@/services/mockDatabase';

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
      // Simulate AI processing
      const result = await mockDatabaseService.processAiMatching(request.id);
      
      // TypeScript fix: Check if result exists and has expected structure
      const processedResult = result as { success: boolean; matches?: AiMatch[]; requestBloodType?: string; error?: string };
      
      if (processedResult.success && processedResult.matches && processedResult.requestBloodType) {
        // Calculate final scores based on blood type compatibility
        const enhancedMatches = processedResult.matches.map((match: AiMatch) => {
          const compatibilityScore = calculateBloodCompatibilityScore(match.bloodType, processedResult.requestBloodType as string);
          
          // If blood types are completely incompatible, filter them out
          if (compatibilityScore === 0) return null;
          
          // Apply blood compatibility as a major factor in the final score
          // We weight blood compatibility at 70% and other factors at 30%
          const finalScore = Math.round(
            (compatibilityScore * 0.7) + (match.matchScore * 0.3)
          );
          
          return {
            ...match,
            matchScore: finalScore,
            compatibilityScore
          };
        }).filter(Boolean) as AiMatch[];
        
        // Sort by match score (highest first)
        const sortedMatches = enhancedMatches.sort((a, b) => b.matchScore - a.matchScore);
        
        setMatches(sortedMatches);
        toast({
          title: "AI Matching Complete",
          description: `Found ${sortedMatches.length} potential hospital matches for this request.`,
        });
      } else {
        toast({
          title: "AI Matching Failed",
          description: processedResult.error || "Failed to process AI matching.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("AI matching error:", error);
      toast({
        title: "AI Matching Error",
        description: "An unexpected error occurred during AI matching.",
        variant: "destructive",
      });
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
          match.hospitalId === hospitalId && match.requestId === requestId 
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
