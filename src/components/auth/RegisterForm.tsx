
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DropletIcon, Loader2 } from "lucide-react";
import useAuthForm from "../../hooks/useAuthForm";

const RegisterForm = () => {
  const { isLoading, handleSubmit } = useAuthForm({
    type: 'register',
    userType: 'donor',
  });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bloodType: '',
  });
  
  const [errors, setErrors] = useState<{
    [key: string]: string
  }>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Email format is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!formData.bloodType) newErrors.bloodType = "Blood type is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Connect to AuthContext
    await handleSubmit(formData);
  };

  return (
    <Card className="w-full max-w-md p-6 space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <DropletIcon className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-red-600">Donor Registration</h2>
        <p className="text-gray-600">Join the BloodBankAI donation community</p>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="Full Name"
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
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className={errors.confirmPassword ? "border-red-500" : ""}
          />
          {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bloodType">Blood Type</Label>
          <Select
            onValueChange={(value) => setFormData({ ...formData, bloodType: value })}
          >
            <SelectTrigger id="bloodType" className={errors.bloodType ? "border-red-500" : ""}>
              <SelectValue placeholder="Blood Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A+">A Rh+ (A+)</SelectItem>
              <SelectItem value="A-">A Rh- (A-)</SelectItem>
              <SelectItem value="B+">B Rh+ (B+)</SelectItem>
              <SelectItem value="B-">B Rh- (B-)</SelectItem>
              <SelectItem value="AB+">AB Rh+ (AB+)</SelectItem>
              <SelectItem value="AB-">AB Rh- (AB-)</SelectItem>
              <SelectItem value="O+">O Rh+ (O+)</SelectItem>
              <SelectItem value="O-">O Rh- (O-)</SelectItem>
            </SelectContent>
          </Select>
          {errors.bloodType && <p className="text-xs text-red-500">{errors.bloodType}</p>}
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
            'Register'
          )}
        </Button>
      </form>
    </Card>
  );
};

export default RegisterForm;
