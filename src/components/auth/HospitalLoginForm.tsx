
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Hospital, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HospitalLoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Show welcome message for newly registered hospitals
  useEffect(() => {
    if (location.state?.showMessage === 'hospital-registered') {
      toast({
        title: "Registration Received",
        description: "Your hospital registration is pending verification. We'll notify you once it's approved.",
        duration: 6000,
      });
    }
  }, [location.state, toast]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    hospitalId: '',
  });
  
  const [errors, setErrors] = useState<{
    [key: string]: string
  }>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.hospitalId) newErrors.hospitalId = "Hospital ID is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // TODO: Implement actual login logic when backend is ready
    // For demo purposes, let's simulate verification check
    const isVerified = Math.random() > 0.3; // 70% chance of being verified
    
    console.log('Hospital login attempt:', formData);
    
    if (isVerified) {
      toast({
        title: "Login Successful",
        description: "Welcome to your BloodBankAI Hospital Dashboard",
        duration: 3000,
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Account Not Verified",
        description: "Your hospital account is still pending verification. Please check back later.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <Card className="w-full max-w-md p-6 space-y-6">
      <div className="flex items-center justify-center mb-2">
        <Hospital className="w-8 h-8 text-red-600" />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600">Hospital Portal</h2>
        <p className="text-gray-600">Access your hospital BloodBankAI management dashboard</p>
      </div>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Only verified hospitals can access the blood management dashboard.
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="hospital@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={errors.email ? "border-red-500" : ""}
            required
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={errors.password ? "border-red-500" : ""}
            required
          />
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="hospitalId">Hospital ID</Label>
          <Input
            id="hospitalId"
            placeholder="Hospital Registration ID"
            value={formData.hospitalId}
            onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
            className={errors.hospitalId ? "border-red-500" : ""}
            required
          />
          {errors.hospitalId && <p className="text-xs text-red-500">{errors.hospitalId}</p>}
          <p className="text-xs text-gray-500">Your Hospital ID was provided during registration verification</p>
        </div>
        
        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
          Login
        </Button>
        
        <div className="text-center">
          <button type="button" className="text-sm text-red-600 hover:text-red-800">
            Verification Status?
          </button>
        </div>
      </form>
    </Card>
  );
};

export default HospitalLoginForm;
