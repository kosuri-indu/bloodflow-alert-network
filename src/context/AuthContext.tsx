import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import mockDatabaseService from '../services/mockDatabase';

type UserType = 'hospital' | 'government' | 'donor' | null;

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

    if (userType === 'donor') {
      const donors = await mockDatabaseService.getDonors();
      const donor = donors.find(d => d.email.toLowerCase() === email.toLowerCase());
      
      if (!donor) {
        throw new Error('Invalid credentials or donor not found');
      }
      
      return {
        success: true,
        user: {
          id: donor.id,
          name: donor.name,
          email: donor.email,
          type: 'donor' as UserType
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
    
    const allData = await mockDatabaseService.getAllData();
    
    if (allData.hospitals.some(h => h.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('A hospital with this email already exists');
    }
    
    await mockDatabaseService.registerHospital({
      name: userData.hospitalName,
      email: userData.email,
      contactPerson: userData.contactPerson,
      registrationId: userData.registrationId,
      address: userData.address || ''
    });
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed'
    };
  }
};

const registerDonor = async (userData: any) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const requiredFields = ['name', 'email', 'password', 'phone', 'bloodType', 'age', 'weight'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
      }
    }
    
    const donors = await mockDatabaseService.getDonors();
    
    if (donors.some(d => d.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('A donor with this email already exists');
    }
    
    await mockDatabaseService.registerDonor({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      bloodType: userData.bloodType.split(' ')[0],
      rhFactor: userData.bloodType.includes('+') ? 'positive' : 'negative',
      age: parseInt(userData.age),
      weight: parseInt(userData.weight),
      address: userData.address || '',
      location: userData.address || 'Unknown Location',
      available: true,
      isEligible: true,
      notificationPreferences: {
        urgentRequests: true,
        donationDrives: true,
        general: true
      }
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
  
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
    console.log('AuthContext - Data refresh triggered');
  };
  
  useEffect(() => {
    const storedUser = localStorage.getItem('bloodbank_user');
    const storedUserType = localStorage.getItem('bloodbank_user_type');
    
    console.log('AuthContext - Checking stored auth:', { storedUser, storedUserType });
    
    if (storedUser && (storedUserType === 'hospital' || storedUserType === 'government' || storedUserType === 'donor')) {
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
  
  const login = async (email: string, password: string, type: UserType, extraData?: any): Promise<boolean> => {
    try {
      if (type !== 'hospital' && type !== 'government' && type !== 'donor') {
        toast({
          title: "Invalid User Type",
          description: "Only hospitals, government officials, and donors can login to this system.",
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
      
      setCurrentUser(result.user);
      setUserType(type);
      
      localStorage.setItem('bloodbank_user', JSON.stringify(result.user));
      localStorage.setItem('bloodbank_user_type', type);
      
      toast({
        title: "Login Successful",
        description: type === 'hospital' 
          ? `Welcome back, ${result.user.hospitalName}!` 
          : type === 'government'
          ? "Welcome, Government Health Official"
          : `Welcome back, ${result.user.name}!`,
      });
      
      refreshData();
      
      if (type === 'government') {
        navigate('/government-dashboard');
      } else if (type === 'donor') {
        navigate('/donor-dashboard');
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
  
  const register = async (userData: any, type: UserType): Promise<boolean> => {
    try {
      console.log("AuthContext register called with:", { userData, userType });
      
      if (type === 'hospital') {
        const hospitalData = {
          name: userData.hospitalName,
          email: userData.email,
          contactPerson: userData.contactPerson || userData.hospitalName,
          registrationId: userData.registrationId || `REG-${Date.now()}`,
          address: userData.address || "Address not provided"
        };
        
        const result = await mockDatabaseService.registerHospital(hospitalData);
        
        if (result.success) {
          toast({
            title: "Registration Successful",
            description: "Hospital registration submitted for government approval.",
          });
          return true;
        } else {
          throw new Error(result.error || 'Hospital registration failed');
        }
      } else if (type === 'donor') {
        const donorData = {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          bloodType: userData.bloodType,
          rhFactor: userData.rhFactor,
          age: userData.age,
          weight: userData.weight,
          address: userData.address || '',
          location: userData.address || 'Unknown Location',
          available: true,
          isEligible: true,
          notificationPreferences: userData.notificationPreferences || {
            urgentRequests: true,
            donationDrives: true,
            general: false
          }
        };
        
        const result = await mockDatabaseService.registerDonor(donorData);
        
        if (result.success) {
          toast({
            title: "Registration Successful",
            description: "Donor account created successfully.",
          });
          return true;
        } else {
          throw new Error(result.error || 'Donor registration failed');
        }
      }
      
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
      return false;
    }
  };
  
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
