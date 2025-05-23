import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import mockDatabaseService from '../services/mockDatabase';

type UserType = 'hospital' | 'government' | null;

interface AuthUser {
  id: string;
  name: string;
  email: string;
  type: UserType;
  hospitalName?: string;
  isVerified?: boolean;
  isGovernmentOfficial?: boolean;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  userType: UserType;
  isAuthenticated: boolean;
  login: (email: string, password: string, userType: UserType, extraData?: any) => Promise<boolean>;
  logout: () => void;
  register: (userData: any, userType: UserType) => Promise<boolean>;
  approveHospital: (hospitalId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Internal functions to handle database operations
const authenticateUser = async (email: string, password: string, userType: UserType, extraData?: any) => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // For demo purposes, accept any non-empty email/password
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (userType === 'government') {
      // Check if government credentials are valid (using mock hardcoded credentials for demo)
      const isValidGovernment = email === 'admin@health.gov' && password === 'admin123';
      
      if (!isValidGovernment) {
        throw new Error('Invalid government credentials');
      }
      
      return {
        success: true,
        user: {
          id: 'gov-official-1',
          name: 'Government Health Official',
          email: email,
          type: 'government' as UserType,
          isGovernmentOfficial: true
        }
      };
    }
    
    if (userType === 'hospital') {
      // Instead of requiring hospitalId, we'll look up by email
      // Check if hospital exists in our mock database
      const hospitals = await mockDatabaseService.getRegisteredHospitals();
      const hospital = hospitals.find(h => h.email.toLowerCase() === email.toLowerCase());
      
      if (!hospital) {
        throw new Error('Invalid credentials or hospital not found');
      }
      
      if (!hospital.verified) {
        throw new Error('Your hospital account is pending verification by government health officials');
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
    }
    
    throw new Error('Invalid user type');
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
    const requiredFields = ['hospitalName', 'email', 'password', 'contactPerson', 'phoneNumber', 'registrationId'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`);
      }
    }
    
    // Check if email already exists in ALL hospitals (verified and unverified)
    const allHospitals = [
      ...await mockDatabaseService.getRegisteredHospitals(),
      ...await mockDatabaseService.getPendingHospitals()
    ];
    
    if (allHospitals.some(h => h.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('A hospital with this email already exists');
    }
    
    // Register hospital in mock database with verified=false
    await mockDatabaseService.registerHospital({
      id: userData.id || `hospital-${Date.now()}`,
      name: userData.hospitalName,
      email: userData.email,
      contactPerson: userData.contactPerson,
      phone: userData.phoneNumber,
      registrationId: userData.registrationId,
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
    
    if (storedUser && (storedUserType === 'hospital' || storedUserType === 'government')) {
      setCurrentUser(JSON.parse(storedUser));
      setUserType(storedUserType as UserType);
    }
  }, []);
  
  // Login function that works for both hospital and government users
  const login = async (email: string, password: string, type: UserType, extraData?: any): Promise<boolean> => {
    try {
      if (type !== 'hospital' && type !== 'government') {
        toast({
          title: "Invalid User Type",
          description: "Only hospitals and government officials can login to this system.",
          variant: "destructive",
        });
        return false;
      }
      
      const result = await authenticateUser(email, password, type, extraData);
      
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
      setUserType(type);
      
      // Save to local storage (for persistence)
      localStorage.setItem('bloodbank_user', JSON.stringify(result.user));
      localStorage.setItem('bloodbank_user_type', type);
      
      toast({
        title: "Login Successful",
        description: type === 'hospital' 
          ? `Welcome back, ${result.user.hospitalName}!` 
          : "Welcome, Government Health Official",
      });
      
      // Redirect to appropriate dashboard
      if (type === 'government') {
        navigate('/government-dashboard');
      } else {
        navigate('/dashboard');
      }
      
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
  
  // Register function (only for hospitals)
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
        description: "Your hospital registration is pending verification by government health officials. We'll notify you once it's approved.",
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
  
  // New function for government officials to approve hospital registrations
  const approveHospital = async (hospitalId: string): Promise<boolean> => {
    try {
      if (userType !== 'government') {
        toast({
          title: "Permission Denied",
          description: "Only government officials can approve hospital registrations.",
          variant: "destructive",
        });
        return false;
      }
      
      // Update hospital verification status in mock database
      const result = await mockDatabaseService.verifyHospital(hospitalId);
      
      if (!result.success) {
        toast({
          title: "Approval Failed",
          description: result.error || "Failed to approve hospital.",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Hospital Approved",
        description: `Hospital ${result.hospitalName} has been verified successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error('Hospital approval error:', error);
      toast({
        title: "Approval Failed",
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
    approveHospital,
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
