
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface UseAuthFormOptions {
  type: 'login' | 'register';
  userType: 'hospital' | 'government' | 'donor';
}

export default function useAuthForm({ type, userType }: UseAuthFormOptions) {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (email: string, password: string, extraData?: any) => {
    setIsLoading(true);
    try {
      console.log(`Login attempt for ${userType} with email: ${email}`);
      const success = await login(email, password, userType, extraData);
      if (success) {
        if (userType === 'government') {
          navigate('/government-dashboard');
        } else if (userType === 'donor') {
          navigate('/donor-dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = async (email: string, password: string, userData: any) => {
    setIsLoading(true);
    try {
      console.log("useAuthForm received userData:", userData);
      
      if (userType === 'hospital') {
        if (!userData.hospitalName || typeof userData.hospitalName !== 'string' || userData.hospitalName.trim() === '') {
          console.error("Hospital name validation failed:", userData);
          throw new Error('Hospital name is required');
        }
        userData.hospitalName = userData.hospitalName.trim();
      }
      
      const success = await register(userData, userType);
      
      if (success) {
        if (userType === 'hospital') {
          navigate('/register', { state: { showMessage: `hospital-registered` } });
        } else if (userType === 'donor') {
          // Automatically login donor after successful registration
          await handleLogin(email, password);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    handleSubmit: type === 'login' ? handleLogin : handleRegister,
  };
}
