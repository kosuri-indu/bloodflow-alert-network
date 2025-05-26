
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Heart, User, Loader2 } from "lucide-react";
import mockDatabaseService from '../services/mockDatabase';

const DonorRegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodType: '',
    rhFactor: '',
    age: '',
    weight: '',
    address: '',
    notificationPreferences: {
      urgentRequests: true,
      donationDrives: true,
      general: false,
    }
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.bloodType) newErrors.bloodType = "Blood type is required";
    if (!formData.rhFactor) newErrors.rhFactor = "Rh factor is required";
    if (!formData.age || parseInt(formData.age) < 18 || parseInt(formData.age) > 65) {
      newErrors.age = "Age must be between 18 and 65";
    }
    if (!formData.weight || parseInt(formData.weight) < 50) {
      newErrors.weight = "Weight must be at least 50 kg";
    }
    if (!formData.address.trim()) newErrors.address = "Address is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await mockDatabaseService.registerDonor({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bloodType: formData.bloodType,
        rhFactor: formData.rhFactor,
        age: parseInt(formData.age),
        weight: parseInt(formData.weight),
        address: formData.address,
        isEligible: true,
        notificationPreferences: formData.notificationPreferences
      });

      toast({
        title: "Registration Successful",
        description: "Welcome to BloodBankAI! You'll receive notifications about donation opportunities.",
      });

      navigate('/donor-dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <Heart className="h-10 w-10 text-red-600" />
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="mt-2 text-2xl font-bold">
            Donor Registration
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Join our community of life-savers
          </p>
        </div>
        
        <Card className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Blood Type</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, bloodType: value })}>
                  <SelectTrigger className={errors.bloodType ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="AB">AB</SelectItem>
                    <SelectItem value="O">O</SelectItem>
                  </SelectContent>
                </Select>
                {errors.bloodType && <p className="text-xs text-red-500">{errors.bloodType}</p>}
              </div>

              <div className="space-y-2">
                <Label>Rh Factor</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, rhFactor: value })}>
                  <SelectTrigger className={errors.rhFactor ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select Rh factor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive (+)</SelectItem>
                    <SelectItem value="negative">Negative (-)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.rhFactor && <p className="text-xs text-red-500">{errors.rhFactor}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  min="18"
                  max="65"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className={errors.age ? "border-red-500" : ""}
                />
                {errors.age && <p className="text-xs text-red-500">{errors.age}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  min="50"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className={errors.weight ? "border-red-500" : ""}
                />
                {errors.weight && <p className="text-xs text-red-500">{errors.weight}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Main St, City, State"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
            </div>

            <div className="space-y-3">
              <Label>Notification Preferences</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="urgentRequests"
                  checked={formData.notificationPreferences.urgentRequests}
                  onCheckedChange={(checked) => 
                    setFormData({
                      ...formData,
                      notificationPreferences: {
                        ...formData.notificationPreferences,
                        urgentRequests: checked as boolean
                      }
                    })
                  }
                />
                <label htmlFor="urgentRequests" className="text-sm">
                  Urgent blood requests
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="donationDrives"
                  checked={formData.notificationPreferences.donationDrives}
                  onCheckedChange={(checked) => 
                    setFormData({
                      ...formData,
                      notificationPreferences: {
                        ...formData.notificationPreferences,
                        donationDrives: checked as boolean
                      }
                    })
                  }
                />
                <label htmlFor="donationDrives" className="text-sm">
                  Donation drive events
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="general"
                  checked={formData.notificationPreferences.general}
                  onCheckedChange={(checked) => 
                    setFormData({
                      ...formData,
                      notificationPreferences: {
                        ...formData.notificationPreferences,
                        general: checked as boolean
                      }
                    })
                  }
                />
                <label htmlFor="general" className="text-sm">
                  General updates
                </label>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Registering...
                </>
              ) : (
                'Register as Donor'
              )}
            </Button>
          </form>
        </Card>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already registered?{" "}
            <button
              onClick={() => navigate('/donor-login')}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonorRegisterPage;
