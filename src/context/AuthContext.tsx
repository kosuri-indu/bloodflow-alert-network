
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
  refreshData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Internal functions to handle database operations
const authenticateUser = async (email: string, password: string, userType: UserType, extraData?: any) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (userType === 'government') {
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const requiredFields = ['hospitalName', 'email', 'password', 'contactPerson', 'phoneNumber', 'registrationId'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`);
      }
    }
    
    // Check if email already exists in ALL hospitals (verified and unverified)
    const allData = await mockDatabaseService.getAllData();
    
    if (allData.hospitals.some(h => h.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('A hospital with this email already exists');
    }
    
    // Register hospital in database with verified=false
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Force data refresh function
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
    console.log('AuthContext - Data refresh triggered');
  };
  
  // Check for stored authentication on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('bloodbank_user');
    const storedUserType = localStorage.getItem('bloodbank_user_type');
    
    console.log('AuthContext - Checking stored auth:', { storedUser, storedUserType });
    
    if (storedUser && (storedUserType === 'hospital' || storedUserType === 'government')) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setUserType(storedUserType as UserType);
        console.log('AuthContext - Auth restored:', { user, userType: storedUserType });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('bloodbank_user');
        localStorage.removeItem('bloodbank_user_type');
      }
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
      
      // Trigger data refresh
      refreshData();
      
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
      
      // Trigger data refresh
      refreshData();
      
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
  
  // Government officials to approve hospital registrations
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
      
      // Trigger data refresh
      refreshData();
      
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
    console.log('AuthContext - LOGOUT CALLED - Starting cleanup process');
    
    setCurrentUser(null);
    setUserType(null);
    
    const keysToRemove = ['bloodbank_user', 'bloodbank_user_type'];
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`AuthContext - Removed localStorage key: ${key}`);
    });
    
    toast({
      title: "Logged Out Successfully",
      description: "You have been logged out of the system.",
    });
    
    console.log('AuthContext - Forcing navigation to home page');
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };
  
  const value = {
    currentUser,
    userType,
    isAuthenticated: !!currentUser && !!userType,
    login,
    logout,
    register,
    approveHospital,
    refreshData,
  };
  
  console.log('AuthContext - Current state:', { 
    isAuthenticated: !!currentUser && !!userType, 
    userType, 
    currentUser: currentUser?.name || currentUser?.hospitalName,
    refreshTrigger
  });
  
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
