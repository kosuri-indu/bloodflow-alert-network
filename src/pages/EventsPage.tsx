import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Users } from "lucide-react";
import mockDatabaseService, { DonationEvent } from "@/services/mockDatabase";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";

const EventsPage = () => {
  const [events, setEvents] = useState<DonationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsData = await mockDatabaseService.getDonationEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast({
          title: "Error",
          description: "Failed to load blood donation events.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [toast]);

  const handleRegisterForEvent = async (eventId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to register for this event.",
      });
      return;
    }

    try {
      const result = await mockDatabaseService.registerForEvent(eventId, currentUser?.id || '');
      
      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "You have successfully registered for this event.",
        });
        
        // Update events with the new registration count
        setEvents(prev => prev.map(event => 
          event.id === eventId ? {...event, registeredDonors: event.registeredDonors + 1} : event
        ));
      } else {
        toast({
          title: "Registration Failed",
          description: result.message || "Unable to register for this event.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-red-600">Blood Donation Events</h2>
          <p className="text-gray-500 mt-2">Find upcoming blood donation events near you and register to save lives.</p>
        </div>

        <Separator className="mb-4" />

        {loading ? (
          <div className="text-center py-10">
            Loading events...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{format(new Date(event.date), 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{event.registeredDonors} / {event.slots} slots filled</span>
                  </div>
                  <p className="text-sm text-gray-700">{event.description}</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => handleRegisterForEvent(event.id)}
                  >
                    Register
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
