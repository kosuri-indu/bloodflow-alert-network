
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarIcon, MapPinIcon, UserIcon } from "lucide-react";
import { DonationEvent } from '@/services/mockDatabase';
import mockDatabaseService from '@/services/mockDatabase';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '../context/AuthContext';

const EventsPage = () => {
  const [events, setEvents] = useState<DonationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAuthenticated, currentUser } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventData = await mockDatabaseService.getDonationEvents();
        setEvents(eventData);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast({
          title: "Error",
          description: "Failed to fetch donation events.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [toast]);

  const handleRegister = async (eventId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login as a donor to register for this event.",
        variant: "destructive",
      });
      return;
    }

    setRegistering(eventId);
    try {
      const result = await mockDatabaseService.registerForEvent(eventId, currentUser?.id || '');
      
      if (result.success) {
        // Update the UI
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, registeredDonors: event.registeredDonors + 1 } 
            : event
        ));
        
        toast({
          title: "Registration Successful",
          description: "You have successfully registered for this blood donation event.",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "This event may be full or no longer available.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred during registration.",
        variant: "destructive",
      });
    } finally {
      setRegistering(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Blood Donation Events</h1>
          <p className="text-gray-600">Join upcoming blood donation drives in your area</p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold mb-3">{event.title}</h2>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-red-500" />
                    <span>{format(new Date(event.date), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-red-500" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-red-500" />
                    <span>{event.registeredDonors} / {event.slots} slots filled</span>
                  </div>
                  <p>{event.description}</p>
                  <div className="mt-4">
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700" 
                      onClick={() => handleRegister(event.id)}
                      disabled={registering === event.id || event.registeredDonors >= event.slots}
                    >
                      {registering === event.id ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                          Registering...
                        </span>
                      ) : event.registeredDonors >= event.slots ? (
                        "Event Full"
                      ) : (
                        "Register for Event"
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
