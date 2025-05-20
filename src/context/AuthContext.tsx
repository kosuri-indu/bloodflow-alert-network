
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import mockDatabaseService from '../services/mockDatabase';

type UserType = 'hospital' | null;

interface AuthUser {
  id: string;
  name: string;
  email: string;
  type: UserType;
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

// Internal functions to handle database operations
const authenticateUser = async (email: string, password: string, hospitalId: string) => {
  // In a real app, this would be an API call to verify credentials against the database
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // For demo purposes, accept any non-empty email/password/hospitalId
    if (!email || !password || !hospitalId) {
      throw new Error('All fields are required');
    }
    
    // Check if hospital exists in our mock database (in real app, would query DB)
    const hospitals = await mockDatabaseService.getRegisteredHospitals();
    const hospital = hospitals.find(h => 
      h.email.toLowerCase() === email.toLowerCase() && 
      h.registrationId === hospitalId
    );
    
    if (!hospital) {
      throw new Error('Invalid credentials or hospital not found');
    }
    
    if (!hospital.verified) {
      throw new Error('Your hospital account is pending verification');
    }
    
    return {
      success: true,
      user: {
        id: hospital.id,
        name: hospital.contactPerson,
        email: hospital.email,
        type: 'hospital' as UserType,
        hospitalName: hospital.name,
        isVerified: true
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed'
    };
  }
};

const registerHospital = async (userData: any) => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validate required fields
    const requiredFields = ['hospitalName', 'email', 'password', 'contactPerson', 'phoneNumber', 'registrationNumber'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`);
      }
    }
    
    // Check if email already exists (in real app, would query DB)
    const hospitals = await mockDatabaseService.getRegisteredHospitals();
    if (hospitals.some(h => h.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('A hospital with this email already exists');
    }
    
    // Register hospital in mock database
    await mockDatabaseService.registerHospital({
      id: `hospital-${Date.now()}`,
      name: userData.hospitalName,
      email: userData.email,
      contactPerson: userData.contactPerson,
      phone: userData.phoneNumber,
      registrationId: userData.registrationNumber,
      address: userData.address || '',
      verified: false,
      createdAt: new Date()
    });
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed'
    };
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userType, setUserType] = useState<UserType>(null);
  
  // Check for stored authentication on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('bloodbank_user');
    const storedUserType = localStorage.getItem('bloodbank_user_type');
    
    if (storedUser && storedUserType === 'hospital') {
      setCurrentUser(JSON.parse(storedUser));
      setUserType('hospital');
    }
  }, []);
  
  // Database-connected login function
  const login = async (email: string, password: string, type: UserType, extraData?: any): Promise<boolean> => {
    try {
      if (type !== 'hospital') {
        toast({
          title: "Invalid User Type",
          description: "Only hospitals can login to this system.",
          variant: "destructive",
        });
        return false;
      }
      
      const hospitalId = extraData?.hospitalId;
      const result = await authenticateUser(email, password, hospitalId);
      
      if (!result.success) {
        toast({
          title: "Login Failed",
          description: result.error || "Invalid credentials",
          variant: "destructive",
        });
        return false;
      }
      
      // Save user data
      setCurrentUser(result.user);
      setUserType('hospital');
      
      // Save to local storage (for persistence)
      localStorage.setItem('bloodbank_user', JSON.stringify(result.user));
      localStorage.setItem('bloodbank_user_type', 'hospital');
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${result.user.hospitalName}!`,
      });
      
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
  
  // Database-connected register function
  const register = async (userData: any, type: UserType): Promise<boolean> => {
    try {
      if (type !== 'hospital') {
        toast({
          title: "Invalid User Type",
          description: "Only hospitals can register to this system.",
          variant: "destructive",
        });
        return false;
      }
      
      const result = await registerHospital(userData);
      
      if (!result.success) {
        toast({
          title: "Registration Failed",
          description: result.error || "Failed to register. Please try again.",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Registration Submitted",
        description: "Your hospital registration is pending verification. We'll notify you once it's approved.",
      });
      
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
