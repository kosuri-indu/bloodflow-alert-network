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
      
      console.log(`🔒 Hospital login: ${hospital.name} (ID: ${hospital.id}) - Data isolation enforced`);
      
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
    
    console.log('Hospital registration successful:', userData.hospitalName);
    return { success: true };
  } catch (error) {
    console.error('Hospital registration error:', error);
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
    console.log('🔄 Data refresh triggered for user:', currentUser?.id);
    window.dispatchEvent(new CustomEvent('dataRefresh'));
  };
  
  useEffect(() => {
    const storedUser = localStorage.getItem('bloodbank_user');
    const storedUserType = localStorage.getItem('bloodbank_user_type');
    
    console.log('🔍 Checking stored auth:', { storedUser: !!storedUser, storedUserType });
    
    if (storedUser && (storedUserType === 'hospital' || storedUserType === 'government')) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setUserType(storedUserType as UserType);
        console.log('✅ Auth restored for user:', user.id, 'hospital:', user.hospitalName);
        
        if (storedUserType === 'hospital') {
          mockDatabaseService.getRegisteredHospitals().then(hospitals => {
            const hospital = hospitals.find(h => h.id === user.id);
            if (!hospital || !hospital.verified) {
              console.log('⚠️ Hospital no longer exists or not verified, logging out');
              logout();
            } else {
              console.log('✅ Hospital verification confirmed for:', user.hospitalName);
            }
          });
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('bloodbank_user');
        localStorage.removeItem('bloodbank_user_type');
      }
    }
  }, []);
  
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
      
      console.log('🎉 LOGIN SUCCESS for user:', result.user.id, 'hospital:', result.user.hospitalName);
      
      setCurrentUser(result.user);
      setUserType(type);
      
      localStorage.setItem('bloodbank_user', JSON.stringify(result.user));
      localStorage.setItem('bloodbank_user_type', type);
      
      toast({
        title: "Login Successful",
        description: type === 'hospital' 
          ? `Welcome back, ${result.user.hospitalName}!` 
          : "Welcome, Government Health Official",
      });
      
      refreshData();
      
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
    console.log('🚪 LOGOUT for user:', currentUser?.id, 'hospital:', currentUser?.hospitalName);
    
    const currentUserType = userType;
    
    // CRITICAL: Only clear authentication data, NEVER clear hospital/database data
    setCurrentUser(null);
    setUserType(null);
    
    // Only remove authentication tokens, preserve all hospital data
    localStorage.removeItem('bloodbank_user');
    localStorage.removeItem('bloodbank_user_type');
    
    // DO NOT touch hospital data - it should persist across logout/login
    console.log('✅ Cleared ONLY authentication data, hospital data preserved');
    
    toast({
      title: "Logged Out Successfully",
      description: "You have been logged out of the system.",
    });
    
    setTimeout(() => {
      if (currentUserType === 'government') {
        window.location.href = '/gov-login';
      } else {
        window.location.href = '/register';
      }
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
  
  console.log('📊 Current state:', { 
    isAuthenticated: !!currentUser && !!userType, 
    userType, 
    currentUserId: currentUser?.id,
    currentUserHospital: currentUser?.hospitalName,
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
