
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Hospital, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import useAuthForm from "../../hooks/useAuthForm";

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isLoading, handleSubmit } = useAuthForm({
    type: 'login',
    userType: 'hospital',
  });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    hospitalId: '',
  });
  
  const [errors, setErrors] = useState<{
    [key: string]: string
  }>({});
  
  // Show welcome message for newly registered hospitals
  useEffect(() => {
    if (location.state?.showMessage === 'hospital-registered') {
      toast({
        title: "Registration Received",
        description: "Your hospital registration is pending verification. We'll notify you once it's approved.",
        duration: 5000,
      });
    }
  }, [location.state, toast]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.hospitalId) newErrors.hospitalId = "Hospital ID is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Pass email, password to handleSubmit from useAuthForm
    await handleSubmit(formData.email, formData.password, { hospitalId: formData.hospitalId });
  };

  return (
    <Card className="w-full max-w-md p-6 space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Hospital className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-red-600">Hospital Login</h2>
        <p className="text-gray-600">Access your BloodBankAI account</p>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Email"
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
            placeholder="Password"
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
        
        <Button 
          type="submit" 
          className="w-full bg-red-600 hover:bg-red-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </Button>
      </form>
    </Card>
  );
};

export default LoginForm;
