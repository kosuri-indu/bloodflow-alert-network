
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarIcon, MapPinIcon } from "lucide-react";

const EventsPage = () => {
  const [events] = useState([
    {
      id: 1,
      title: "City General Hospital Blood Drive",
      date: "May 15, 2025",
      location: "123 Medical Center Ave",
      slots: 50,
      description: "Join us for our monthly blood donation drive. All blood types needed."
    },
    {
      id: 2,
      title: "Community Center Blood Donation",
      date: "May 20, 2025",
      location: "456 Community Square",
      slots: 30,
      description: "Emergency blood drive focusing on O- and A+ blood types."
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Blood Donation Events</h1>
          <p className="text-gray-600">Join upcoming blood donation drives in your area</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-3">{event.title}</h2>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-red-500" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-red-500" />
                  <span>{event.location}</span>
                </div>
                <p>{event.description}</p>
                <div className="mt-4">
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Register for Event
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
