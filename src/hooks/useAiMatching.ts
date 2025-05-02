
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import mockDatabaseService, { AiMatch, BloodRequest } from '@/services/mockDatabase';

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
      const result: any = await mockDatabaseService.processAiMatching(request.id);
      
      if (result.success) {
        setMatches(result.matches);
        toast({
          title: "AI Matching Complete",
          description: `Found ${result.matches.length} potential donors for this request.`,
        });
      } else {
        toast({
          title: "AI Matching Failed",
          description: result.error || "Failed to process AI matching.",
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

  const contactDonor = async (donorId: string, requestId: string) => {
    try {
      const result = await mockDatabaseService.contactDonor(donorId, requestId);
      
      if (result.success) {
        // Update local matches state
        setMatches(prev => prev.map(match => 
          match.donorId === donorId && match.requestId === requestId 
            ? { ...match, status: 'contacted' } 
            : match
        ));
        
        toast({
          title: "Contact Request Sent",
          description: "The donor has been notified about this blood request.",
        });
      } else {
        toast({
          title: "Contact Failed",
          description: "Failed to contact the donor. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error contacting donor:", error);
      toast({
        title: "Contact Error",
        description: "An unexpected error occurred when trying to contact the donor.",
        variant: "destructive",
      });
    }
  };

  return {
    isProcessing,
    matches,
    runAiMatching,
    contactDonor,
  };
}

export default useAiMatching;
