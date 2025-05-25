
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
    console.log('Initializing enhanced sample data...');
    
    // Enhanced sample hospitals for better matching
    const defaultHospitals: Hospital[] = [
      {
        id: 'hospital-central',
        name: 'Central General Hospital',
        email: 'admin@central.hospital',
        contactPerson: 'Dr. Sarah Williams',
        phone: '555-0101',
        registrationId: 'HOS-001',
        address: '123 Medical Center Dr, Downtown',
        verified: true,
        createdAt: new Date('2023-01-15')
      },
      {
        id: 'hospital-mercy',
        name: 'Mercy Medical Center',
        email: 'blood@mercy.hospital',
        contactPerson: 'Dr. Michael Chen',
        phone: '555-0102',
        registrationId: 'HOS-002',
        address: '456 Healthcare Ave, Midtown',
        verified: true,
        createdAt: new Date('2023-02-20')
      },
      {
        id: 'hospital-regional',
        name: 'Regional Emergency Hospital',
        email: 'emergency@regional.hospital',
        contactPerson: 'Dr. Emily Rodriguez',
        phone: '555-0103',
        registrationId: 'HOS-003',
        address: '789 Emergency Blvd, Northside',
        verified: true,
        createdAt: new Date('2023-03-10')
      },
      {
        id: 'hospital-childrens',
        name: 'Children\'s Specialty Hospital',
        email: 'pediatric@childrens.hospital',
        contactPerson: 'Dr. David Kumar',
        phone: '555-0104',
        registrationId: 'HOS-004',
        address: '321 Kids Way, Westside',
        verified: true,
        createdAt: new Date('2023-04-05')
      }
    ];

    // Enhanced blood inventory with diverse blood types and attributes
    const defaultInventory: BloodInventory[] = [
      {
        id: 'inv-001',
        bloodType: 'O',
        rhFactor: 'negative',
        units: 45,
        hospital: 'Central General Hospital',
        processedDate: new Date('2024-11-20'),
        expirationDate: new Date('2025-01-02'),
        donorAge: 32,
        specialAttributes: ['leukoreduced', 'cmv-negative']
      },
      {
        id: 'inv-002',
        bloodType: 'A',
        rhFactor: 'positive',
        units: 32,
        hospital: 'Central General Hospital',
        processedDate: new Date('2024-11-22'),
        expirationDate: new Date('2025-01-04'),
        donorAge: 28,
        specialAttributes: ['irradiated']
      },
      {
        id: 'inv-003',
        bloodType: 'B',
        rhFactor: 'positive',
        units: 18,
        hospital: 'Mercy Medical Center',
        processedDate: new Date('2024-11-18'),
        expirationDate: new Date('2024-12-30'),
        donorAge: 35,
        specialAttributes: ['leukoreduced']
      },
      {
        id: 'inv-004',
        bloodType: 'AB',
        rhFactor: 'positive',
        units: 12,
        hospital: 'Regional Emergency Hospital',
        processedDate: new Date('2024-11-25'),
        expirationDate: new Date('2025-01-06'),
        donorAge: 29,
        specialAttributes: ['washed', 'cmv-negative']
      },
      {
        id: 'inv-005',
        bloodType: 'O',
        rhFactor: 'positive',
        units: 38,
        hospital: 'Children\'s Specialty Hospital',
        processedDate: new Date('2024-11-21'),
        expirationDate: new Date('2025-01-03'),
        donorAge: 26,
        specialAttributes: ['leukoreduced', 'irradiated']
      },
      {
        id: 'inv-006',
        bloodType: 'A',
        rhFactor: 'negative',
        units: 22,
        hospital: 'Mercy Medical Center',
        processedDate: new Date('2024-11-23'),
        expirationDate: new Date('2025-01-05'),
        donorAge: 41,
        specialAttributes: ['cmv-negative']
      },
      {
        id: 'inv-007',
        bloodType: 'B',
        rhFactor: 'negative',
        units: 15,
        hospital: 'Regional Emergency Hospital',
        processedDate: new Date('2024-11-19'),
        expirationDate: new Date('2025-01-01'),
        donorAge: 33,
        specialAttributes: ['leukoreduced', 'washed']
      },
      {
        id: 'inv-008',
        bloodType: 'AB',
        rhFactor: 'negative',
        units: 8,
        hospital: 'Central General Hospital',
        processedDate: new Date('2024-11-24'),
        expirationDate: new Date('2025-01-07'),
        donorAge: 37,
        specialAttributes: ['irradiated', 'cmv-negative']
      }
    ];

    // Enhanced blood requests with varied urgency and requirements
    const defaultRequests: BloodRequest[] = [
      {
        id: 'req-critical-001',
        bloodType: 'O Rh- (O-)',
        hospital: 'Central General Hospital',
        urgency: 'critical',
        distance: 0,
        timeNeeded: 'Needed within 2 hours',
        status: 'pending',
        units: 4,
        neededBy: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        patientAge: 32,
        patientWeight: 70,
        medicalCondition: 'Emergency surgery - massive trauma',
        specialRequirements: ['leukoreduced'],
        createdAt: new Date(),
        matchPercentage: 95
      },
      {
        id: 'req-urgent-002',
        bloodType: 'A Rh+ (A+)',
        hospital: 'Mercy Medical Center',
        urgency: 'urgent',
        distance: 5,
        timeNeeded: 'Needed within 6 hours',
        status: 'pending',
        units: 2,
        neededBy: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
        patientAge: 45,
        patientWeight: 80,
        medicalCondition: 'Scheduled surgery preparation',
        specialRequirements: ['cmv-negative'],
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        matchPercentage: 88
      },
      {
        id: 'req-standard-003',
        bloodType: 'B Rh+ (B+)',
        hospital: 'Regional Emergency Hospital',
        urgency: 'standard',
        distance: 12,
        timeNeeded: 'Needed within 24 hours',
        status: 'pending',
        units: 3,
        neededBy: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        patientAge: 28,
        patientWeight: 65,
        medicalCondition: 'Elective procedure',
        specialRequirements: ['irradiated'],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        matchPercentage: 82
      },
      {
        id: 'req-critical-004',
        bloodType: 'AB Rh+ (AB+)',
        hospital: 'Children\'s Specialty Hospital',
        urgency: 'critical',
        distance: 8,
        timeNeeded: 'Needed within 1 hour',
        status: 'pending',
        units: 2,
        neededBy: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
        patientAge: 12,
        patientWeight: 40,
        medicalCondition: 'Pediatric emergency - internal bleeding',
        specialRequirements: ['leukoreduced', 'washed'],
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        matchPercentage: 91
      },
      {
        id: 'req-urgent-005',
        bloodType: 'O Rh+ (O+)',
        hospital: 'Central General Hospital',
        urgency: 'urgent',
        distance: 0,
        timeNeeded: 'Needed within 4 hours',
        status: 'pending',
        units: 6,
        neededBy: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        patientAge: 58,
        patientWeight: 85,
        medicalCondition: 'Cardiac surgery preparation',
        specialRequirements: ['cmv-negative', 'leukoreduced'],
        createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        matchPercentage: 93
      }
    ];

    // Save enhanced data
    saveToStorage(STORAGE_KEYS.HOSPITALS, defaultHospitals);
    saveToStorage(STORAGE_KEYS.BLOOD_INVENTORY, defaultInventory);
    saveToStorage(STORAGE_KEYS.BLOOD_REQUESTS, defaultRequests);
    saveToStorage(STORAGE_KEYS.INITIALIZED, 'true');
    
    console.log('Enhanced sample data initialized with:', {
      hospitals: defaultHospitals.length,
      inventory: defaultInventory.length,
      requests: defaultRequests.length
    });
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
