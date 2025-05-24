
// Mock database service with localStorage persistence
// In a real application, this would be replaced with actual API calls to a backend

export interface Hospital {
  id: string;
  name: string;
  email: string;
  contactPerson: string;
  phone: string;
  registrationId: string;
  address: string;
  verified: boolean;
  createdAt: Date;
}

export interface BloodInventory {
  id?: string;
  bloodType: string;
  rhFactor: 'positive' | 'negative';
  units: number;
  hospital: string;
  processedDate: Date;
  expirationDate: Date;
  donorAge?: number;
  specialAttributes?: string[];
}

export interface BloodRequest {
  id: string;
  bloodType: string;
  hospital: string;
  urgency: 'critical' | 'urgent' | 'standard';
  distance: number;
  timeNeeded: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  units: number;
  neededBy: Date;
  patientAge?: number;
  patientWeight?: number;
  medicalCondition?: string;
  specialRequirements?: string[];
  createdAt: Date;
  matchPercentage: number;
}

export interface AiMatch {
  donorId: string;
  requestId: string;
  hospitalName: string;
  bloodType: string;
  bloodRhFactor: 'positive' | 'negative';
  availableUnits: number;
  distance: number;
  matchScore: number;
  status: 'potential' | 'contacted' | 'accepted' | 'rejected';
  specialAttributes?: string[];
  compatibilityScore?: number;
}

// LocalStorage keys
const STORAGE_KEYS = {
  HOSPITALS: 'bloodbank_hospitals',
  BLOOD_INVENTORY: 'bloodbank_inventory',
  BLOOD_REQUESTS: 'bloodbank_requests',
  INITIALIZED: 'bloodbank_initialized'
};

// Utility functions for localStorage operations
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item, (key, value) => {
      // Parse dates back from storage
      if (key === 'createdAt' || key === 'processedDate' || key === 'expirationDate' || key === 'neededBy') {
        return new Date(value);
      }
      return value;
    });
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage key ${key}:`, error);
  }
};

// Initialize default data if not present
const initializeDefaultData = () => {
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  
  if (!isInitialized) {
    console.log('Initializing default data...');
    
    // Initialize with sample data
    const defaultInventory: BloodInventory[] = [
      {
        id: 'inv-123',
        bloodType: 'A',
        rhFactor: 'positive',
        units: 25,
        hospital: 'Central Hospital',
        processedDate: new Date('2023-05-01'),
        expirationDate: new Date('2023-06-12'),
        donorAge: 28,
        specialAttributes: ['leukoreduced']
      },
      {
        id: 'inv-456',
        bloodType: 'O',
        rhFactor: 'negative',
        units: 15,
        hospital: 'Central Hospital',
        processedDate: new Date('2023-05-10'),
        expirationDate: new Date('2023-06-21'),
        donorAge: 35,
        specialAttributes: ['irradiated', 'cmv-negative']
      }
    ];

    const defaultRequests: BloodRequest[] = [
      {
        id: 'req-123',
        bloodType: 'A Rh+ (A+)',
        hospital: 'Central Hospital',
        urgency: 'urgent',
        distance: 0,
        timeNeeded: 'Needed by May 25, 2023',
        status: 'pending',
        units: 2,
        neededBy: new Date('2023-05-25'),
        patientAge: 45,
        medicalCondition: 'Surgery preparation',
        createdAt: new Date('2023-05-20'),
        matchPercentage: 85
      }
    ];

    saveToStorage(STORAGE_KEYS.HOSPITALS, []);
    saveToStorage(STORAGE_KEYS.BLOOD_INVENTORY, defaultInventory);
    saveToStorage(STORAGE_KEYS.BLOOD_REQUESTS, defaultRequests);
    saveToStorage(STORAGE_KEYS.INITIALIZED, 'true');
  }
};

// Initialize on module load
initializeDefaultData();

const mockDatabaseService = {
  // Get a list of all registered hospitals
  getRegisteredHospitals: async (): Promise<Hospital[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const hospitals = getFromStorage<Hospital[]>(STORAGE_KEYS.HOSPITALS, []);
    return hospitals.filter(h => h.verified);
  },
  
  // Get pending (unverified) hospital registrations
  getPendingHospitals: async (): Promise<Hospital[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const hospitals = getFromStorage<Hospital[]>(STORAGE_KEYS.HOSPITALS, []);
    return hospitals.filter(h => !h.verified);
  },
  
  // Register a new hospital
  registerHospital: async (hospital: Omit<Hospital, 'createdAt'> & { createdAt?: Date }): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const hospitals = getFromStorage<Hospital[]>(STORAGE_KEYS.HOSPITALS, []);
    
    // Check if hospital already exists
    if (hospitals.some(h => h.email.toLowerCase() === hospital.email.toLowerCase())) {
      throw new Error('A hospital with this email already exists');
    }
    
    const newHospital: Hospital = {
      ...hospital as Hospital,
      createdAt: hospital.createdAt || new Date(),
      verified: false
    };
    
    hospitals.push(newHospital);
    saveToStorage(STORAGE_KEYS.HOSPITALS, hospitals);
    
    console.log('Hospital registered and saved to localStorage:', newHospital);
    return { success: true };
  },
  
  // Verify a hospital (approve registration)
  verifyHospital: async (hospitalId: string): Promise<{ success: boolean; hospitalName?: string; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const hospitals = getFromStorage<Hospital[]>(STORAGE_KEYS.HOSPITALS, []);
    const hospitalIndex = hospitals.findIndex(h => h.id === hospitalId);
    
    if (hospitalIndex === -1) {
      return { 
        success: false, 
        error: 'Hospital not found' 
      };
    }
    
    hospitals[hospitalIndex].verified = true;
    saveToStorage(STORAGE_KEYS.HOSPITALS, hospitals);
    
    console.log('Hospital verified and saved to localStorage:', hospitals[hospitalIndex]);
    return { 
      success: true,
      hospitalName: hospitals[hospitalIndex].name
    };
  },

  // Delete a hospital
  deleteHospital: async (hospitalId: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const hospitals = getFromStorage<Hospital[]>(STORAGE_KEYS.HOSPITALS, []);
    const filteredHospitals = hospitals.filter(h => h.id !== hospitalId);
    
    if (filteredHospitals.length === hospitals.length) {
      return { success: false, error: 'Hospital not found' };
    }
    
    saveToStorage(STORAGE_KEYS.HOSPITALS, filteredHospitals);
    console.log('Hospital deleted from localStorage');
    return { success: true };
  },

  // Update hospital information
  updateHospital: async (hospitalId: string, updates: Partial<Hospital>): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const hospitals = getFromStorage<Hospital[]>(STORAGE_KEYS.HOSPITALS, []);
    const hospitalIndex = hospitals.findIndex(h => h.id === hospitalId);
    
    if (hospitalIndex === -1) {
      return { success: false, error: 'Hospital not found' };
    }
    
    hospitals[hospitalIndex] = { ...hospitals[hospitalIndex], ...updates };
    saveToStorage(STORAGE_KEYS.HOSPITALS, hospitals);
    
    console.log('Hospital updated and saved to localStorage:', hospitals[hospitalIndex]);
    return { success: true };
  },

  // Get hospital profile
  getHospitalProfile: async (): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      name: 'Central Hospital',
      address: '123 Main Street, Cityville',
      contactInfo: {
        email: 'admin@centralhospital.com',
        phone: '123-456-7890'
      },
      partnerHospitals: 12,
      verificationStatus: 'verified'
    };
  },

  // Get blood inventory details
  getBloodInventoryDetails: async (): Promise<BloodInventory[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return getFromStorage<BloodInventory[]>(STORAGE_KEYS.BLOOD_INVENTORY, []);
  },

  // Add blood inventory
  addBloodInventory: async (inventory: Omit<BloodInventory, 'id'>): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const bloodInventory = getFromStorage<BloodInventory[]>(STORAGE_KEYS.BLOOD_INVENTORY, []);
    const newInventory: BloodInventory = {
      id: `inv-${Date.now()}`,
      ...inventory
    };
    
    bloodInventory.push(newInventory);
    saveToStorage(STORAGE_KEYS.BLOOD_INVENTORY, bloodInventory);
    
    console.log('Blood inventory added and saved to localStorage:', newInventory);
    return { success: true };
  },

  // Update blood inventory
  updateBloodInventory: async (inventoryId: string, updates: Partial<BloodInventory>): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const bloodInventory = getFromStorage<BloodInventory[]>(STORAGE_KEYS.BLOOD_INVENTORY, []);
    const inventoryIndex = bloodInventory.findIndex(inv => inv.id === inventoryId);
    
    if (inventoryIndex === -1) {
      return { success: false, error: 'Inventory item not found' };
    }
    
    bloodInventory[inventoryIndex] = { ...bloodInventory[inventoryIndex], ...updates };
    saveToStorage(STORAGE_KEYS.BLOOD_INVENTORY, bloodInventory);
    
    console.log('Blood inventory updated and saved to localStorage:', bloodInventory[inventoryIndex]);
    return { success: true };
  },

  // Delete blood inventory
  deleteBloodInventory: async (inventoryId: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const bloodInventory = getFromStorage<BloodInventory[]>(STORAGE_KEYS.BLOOD_INVENTORY, []);
    const filteredInventory = bloodInventory.filter(inv => inv.id !== inventoryId);
    
    if (filteredInventory.length === bloodInventory.length) {
      return { success: false, error: 'Inventory item not found' };
    }
    
    saveToStorage(STORAGE_KEYS.BLOOD_INVENTORY, filteredInventory);
    console.log('Blood inventory deleted from localStorage');
    return { success: true };
  },

  // Get blood requests
  getBloodRequests: async (): Promise<BloodRequest[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return getFromStorage<BloodRequest[]>(STORAGE_KEYS.BLOOD_REQUESTS, []);
  },

  // Create a blood request
  createBloodRequest: async (request: Partial<BloodRequest>): Promise<BloodRequest> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const bloodRequests = getFromStorage<BloodRequest[]>(STORAGE_KEYS.BLOOD_REQUESTS, []);
    const newRequest: BloodRequest = {
      id: `req-${Date.now()}`,
      bloodType: request.bloodType || 'Unknown',
      hospital: request.hospital || 'Unknown Hospital',
      urgency: request.urgency || 'standard',
      distance: request.distance || 0,
      timeNeeded: request.timeNeeded || 'Unknown',
      status: 'pending',
      units: request.units || 1,
      neededBy: request.neededBy || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      matchPercentage: 0,
      ...request
    };
    
    bloodRequests.push(newRequest);
    saveToStorage(STORAGE_KEYS.BLOOD_REQUESTS, bloodRequests);
    
    console.log('Blood request created and saved to localStorage:', newRequest);
    return newRequest;
  },

  // Update blood request
  updateBloodRequest: async (requestId: string, updates: Partial<BloodRequest>): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const bloodRequests = getFromStorage<BloodRequest[]>(STORAGE_KEYS.BLOOD_REQUESTS, []);
    const requestIndex = bloodRequests.findIndex(req => req.id === requestId);
    
    if (requestIndex === -1) {
      return { success: false, error: 'Blood request not found' };
    }
    
    bloodRequests[requestIndex] = { ...bloodRequests[requestIndex], ...updates };
    saveToStorage(STORAGE_KEYS.BLOOD_REQUESTS, bloodRequests);
    
    console.log('Blood request updated and saved to localStorage:', bloodRequests[requestIndex]);
    return { success: true };
  },

  // Delete blood request
  deleteBloodRequest: async (requestId: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const bloodRequests = getFromStorage<BloodRequest[]>(STORAGE_KEYS.BLOOD_REQUESTS, []);
    const filteredRequests = bloodRequests.filter(req => req.id !== requestId);
    
    if (filteredRequests.length === bloodRequests.length) {
      return { success: false, error: 'Blood request not found' };
    }
    
    saveToStorage(STORAGE_KEYS.BLOOD_REQUESTS, filteredRequests);
    console.log('Blood request deleted from localStorage');
    return { success: true };
  },

  // Process AI matching for blood request
  processAiMatching: async (requestId: string): Promise<{ 
    success: boolean; 
    matches?: AiMatch[]; 
    requestBloodType?: string; 
    error?: string 
  }> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const bloodRequests = getFromStorage<BloodRequest[]>(STORAGE_KEYS.BLOOD_REQUESTS, []);
    const request = bloodRequests.find(req => req.id === requestId);
    
    if (!request) {
      return { 
        success: false,
        error: 'Blood request not found' 
      };
    }
    
    // Generate matches based on available inventory
    const bloodInventory = getFromStorage<BloodInventory[]>(STORAGE_KEYS.BLOOD_INVENTORY, []);
    const hospitals = getFromStorage<Hospital[]>(STORAGE_KEYS.HOSPITALS, []).filter(h => h.verified);
    
    const fakeMatches: AiMatch[] = hospitals.slice(0, 3).map((hospital, index) => ({
      donorId: hospital.id,
      requestId: request.id,
      hospitalName: hospital.name,
      bloodType: request.bloodType.split(' ')[0],
      bloodRhFactor: request.bloodType.includes('+') ? 'positive' : 'negative',
      availableUnits: Math.floor(Math.random() * 15) + 5,
      distance: Math.floor(Math.random() * 20) + 1,
      matchScore: Math.floor(Math.random() * 20) + 80,
      status: 'potential',
      specialAttributes: index === 0 ? ['leukoreduced'] : index === 1 ? ['irradiated', 'cmv-negative'] : undefined
    }));
    
    // Update request with match percentage
    const requestIndex = bloodRequests.findIndex(req => req.id === requestId);
    if (requestIndex !== -1) {
      bloodRequests[requestIndex].matchPercentage = 92;
      saveToStorage(STORAGE_KEYS.BLOOD_REQUESTS, bloodRequests);
    }
    
    return { 
      success: true,
      matches: fakeMatches,
      requestBloodType: request.bloodType
    };
  },

  // Contact hospital for blood request
  contactHospital: async (hospitalId: string, requestId: string): Promise<{ 
    success: boolean;
    error?: string 
  }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const hospitals = getFromStorage<Hospital[]>(STORAGE_KEYS.HOSPITALS, []);
    const bloodRequests = getFromStorage<BloodRequest[]>(STORAGE_KEYS.BLOOD_REQUESTS, []);
    
    const hospital = hospitals.find(h => h.id === hospitalId);
    const request = bloodRequests.find(req => req.id === requestId);
    
    if (!hospital) {
      return { 
        success: false,
        error: 'Hospital not found' 
      };
    }
    
    if (!request) {
      return { 
        success: false,
        error: 'Blood request not found' 
      };
    }
    
    console.log('Hospital contacted for blood request:', { hospital: hospital.name, request: request.id });
    return { success: true };
  },

  // Clear all data (for testing purposes)
  clearAllData: async (): Promise<{ success: boolean }> => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('All data cleared from localStorage');
    return { success: true };
  },

  // Get all data for debugging
  getAllData: async (): Promise<{
    hospitals: Hospital[];
    bloodInventory: BloodInventory[];
    bloodRequests: BloodRequest[];
  }> => {
    return {
      hospitals: getFromStorage<Hospital[]>(STORAGE_KEYS.HOSPITALS, []),
      bloodInventory: getFromStorage<BloodInventory[]>(STORAGE_KEYS.BLOOD_INVENTORY, []),
      bloodRequests: getFromStorage<BloodRequest[]>(STORAGE_KEYS.BLOOD_REQUESTS, [])
    };
  }
};

export default mockDatabaseService;
