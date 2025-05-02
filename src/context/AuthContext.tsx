
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

type UserType = 'donor' | 'hospital' | null;

interface AuthUser {
  id: string;
  name: string;
  email: string;
  type: UserType;
  bloodType?: string;
  hospitalName?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  userType: UserType;
  isAuthenticated: boolean;
  login: (email: string, password: string, userType: UserType, extraData?: any) => Promise<boolean>;
  logout: () => void;
  register: (userData: any, userType: UserType) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userType, setUserType] = useState<UserType>(null);
  
  // Check for stored authentication on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('bloodbank_user');
    const storedUserType = localStorage.getItem('bloodbank_user_type');
    
    if (storedUser && storedUserType) {
      setCurrentUser(JSON.parse(storedUser));
      setUserType(storedUserType as UserType);
    }
  }, []);
  
  // Demo login function - would be replaced with real API calls
  const login = async (email: string, password: string, type: UserType, extraData?: any): Promise<boolean> => {
    try {
      // This would be an API call in a real app
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate a successful login
      let user: AuthUser;
      
      if (type === 'donor') {
        user = {
          id: `donor-${Date.now()}`,
          name: email.split('@')[0], // Just for demo
          email,
          type: 'donor',
          bloodType: 'O+', // Would come from the database
        };
      } else {
        // Hospital login
        const hospitalId = extraData?.hospitalId;
        if (!hospitalId) {
          throw new Error('Hospital ID is required');
        }
        
        // Simulate verification check
        const isVerified = Math.random() > 0.3; // 70% chance of being verified
        
        if (!isVerified) {
          toast({
            title: "Account Not Verified",
            description: "Your hospital account is still pending verification.",
            variant: "destructive",
          });
          return false;
        }
        
        user = {
          id: `hospital-${hospitalId}`,
          name: 'Hospital Admin', // Would come from the database
          email,
          type: 'hospital',
          hospitalName: 'City General Hospital', // Would come from the database
          isVerified: true,
        };
      }
      
      // Save to local state
      setCurrentUser(user);
      setUserType(type);
      
      // Save to local storage (for persistence)
      localStorage.setItem('bloodbank_user', JSON.stringify(user));
      localStorage.setItem('bloodbank_user_type', type);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Demo register function
  const register = async (userData: any, type: UserType): Promise<boolean> => {
    try {
      // This would be an API call in a real app
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, would return user data from API
      if (type === 'hospital') {
        toast({
          title: "Registration Submitted",
          description: "Your hospital registration is pending verification.",
        });
      } else {
        toast({
          title: "Registration Successful",
          description: "Your account has been created. You can now log in.",
        });
      }
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const logout = () => {
    setCurrentUser(null);
    setUserType(null);
    localStorage.removeItem('bloodbank_user');
    localStorage.removeItem('bloodbank_user_type');
    navigate('/');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };
  
  const value = {
    currentUser,
    userType,
    isAuthenticated: !!currentUser,
    login,
    logout,
    register,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
