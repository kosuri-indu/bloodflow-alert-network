
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface UseAuthFormOptions {
  type: 'login' | 'register';
  userType: 'donor' | 'hospital';
}

export default function useAuthForm({ type, userType }: UseAuthFormOptions) {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (email: string, password: string, extraData?: any) => {
    setIsLoading(true);
    try {
      const success = await login(email, password, userType, extraData);
      if (success) {
        navigate('/dashboard');
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
  
  const handleRegister = async (userData: any) => {
    setIsLoading(true);
    try {
      const success = await register(userData, userType);
      if (success) {
        navigate('/login', { state: { showMessage: `${userType}-registered` } });
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
