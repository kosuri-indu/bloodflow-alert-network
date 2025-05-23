
// Mock database service for demonstration purposes
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

// In-memory storage
let hospitals: Hospital[] = [
  {
    id: 'hospital-123',
    name: 'Central Hospital',
    email: 'admin@centralhospital.com',
    contactPerson: 'Dr. John Smith',
    phone: '123-456-7890',
    registrationId: 'CH-12345',
    address: '123 Main Street, Cityville',
    verified: true,
    createdAt: new Date('2023-01-15')
  },
  {
    id: 'hospital-456',
    name: 'Memorial Medical Center',
    email: 'contact@memorialmed.org',
    contactPerson: 'Dr. Jane Williams',
    phone: '987-654-3210',
    registrationId: 'MMC-54321',
    address: '456 Oak Avenue, Townsburg',
    verified: true,
    createdAt: new Date('2023-02-20')
  },
  {
    id: 'hospital-789',
    name: 'Community Care Hospital',
    email: 'info@communitycare.net',
    contactPerson: 'Dr. Robert Chen',
    phone: '456-789-0123',
    registrationId: 'CCH-98765',
    address: '789 Pine Road, Villageton',
    verified: false,
    createdAt: new Date('2023-03-10')
  }
];

// Blood inventory storage
let bloodInventory: BloodInventory[] = [
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
  },
  {
    id: 'inv-789',
    bloodType: 'B',
    rhFactor: 'positive',
    units: 8,
    hospital: 'Memorial Medical Center',
    processedDate: new Date('2023-05-15'),
    expirationDate: new Date('2023-06-26'),
    donorAge: 42
  }
];

// Blood requests storage
let bloodRequests: BloodRequest[] = [
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
  },
  {
    id: 'req-456',
    bloodType: 'O Rh- (O-)',
    hospital: 'Memorial Medical Center',
    urgency: 'critical',
    distance: 0,
    timeNeeded: 'Needed by May 22, 2023',
    status: 'pending',
    units: 3,
    neededBy: new Date('2023-05-22'),
    patientAge: 62,
    patientWeight: 75,
    medicalCondition: 'Trauma case',
    specialRequirements: ['irradiated'],
    createdAt: new Date('2023-05-19'),
    matchPercentage: 92
  }
];

// Hospital profiles
const hospitalProfiles: { [key: string]: any } = {
  default: {
    name: 'Central Hospital',
    address: '123 Main Street, Cityville',
    contactInfo: {
      email: 'admin@centralhospital.com',
      phone: '123-456-7890'
    },
    partnerHospitals: 12,
    verificationStatus: 'verified'
  }
};

const mockDatabaseService = {
  // Get a list of all registered hospitals
  getRegisteredHospitals: async (): Promise<Hospital[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...hospitals];
  },
  
  // Get pending (unverified) hospital registrations
  getPendingHospitals: async (): Promise<Hospital[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return hospitals.filter(h => !h.verified);
  },
  
  // Register a new hospital
  registerHospital: async (hospital: Omit<Hospital, 'createdAt'> & { createdAt?: Date }): Promise<{ success: boolean }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Add timestamp if not provided
    if (!hospital.createdAt) {
      hospital.createdAt = new Date();
    }
    
    hospitals.push(hospital as Hospital);
    
    return { success: true };
  },
  
  // Verify a hospital (approve registration)
  verifyHospital: async (hospitalId: string): Promise<{ success: boolean; hospitalName?: string; error?: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const hospital = hospitals.find(h => h.id === hospitalId);
    
    if (!hospital) {
      return { 
        success: false, 
        error: 'Hospital not found' 
      };
    }
    
    // Update verification status
    hospital.verified = true;
    
    return { 
      success: true,
      hospitalName: hospital.name
    };
  },

  // Get hospital profile
  getHospitalProfile: async (): Promise<any> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return hospitalProfiles.default;
  },

  // Get blood inventory details
  getBloodInventoryDetails: async (): Promise<BloodInventory[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [...bloodInventory];
  },

  // Get blood requests
  getBloodRequests: async (): Promise<BloodRequest[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [...bloodRequests];
  },

  // Add blood inventory
  addBloodInventory: async (inventory: Omit<BloodInventory, 'id'>): Promise<{ success: boolean }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Add unique ID
    const newInventory: BloodInventory = {
      id: `inv-${Date.now()}`,
      ...inventory
    };
    
    bloodInventory.push(newInventory);
    
    return { success: true };
  },

  // Create a blood request
  createBloodRequest: async (request: Partial<BloodRequest>): Promise<BloodRequest> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create a new request with default values
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
    
    return newRequest;
  },

  // Process AI matching for blood request
  processAiMatching: async (requestId: string): Promise<{ 
    success: boolean; 
    matches?: AiMatch[]; 
    requestBloodType?: string; 
    error?: string 
  }> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const request = bloodRequests.find(req => req.id === requestId);
    
    if (!request) {
      return { 
        success: false,
        error: 'Blood request not found' 
      };
    }
    
    // Generate fake matches
    const fakeMatches: AiMatch[] = [
      {
        donorId: 'hospital-123',
        requestId: request.id,
        hospitalName: 'Central Hospital',
        bloodType: request.bloodType.split(' ')[0],
        bloodRhFactor: request.bloodType.includes('+') ? 'positive' : 'negative',
        availableUnits: 8,
        distance: 5.3,
        matchScore: 95,
        status: 'potential',
        specialAttributes: ['leukoreduced']
      },
      {
        donorId: 'hospital-456',
        requestId: request.id,
        hospitalName: 'Memorial Medical Center',
        bloodType: 'O',
        bloodRhFactor: 'negative',
        availableUnits: 12,
        distance: 8.7,
        matchScore: 90,
        status: 'potential',
        specialAttributes: ['irradiated', 'cmv-negative']
      },
      {
        donorId: 'hospital-789',
        requestId: request.id,
        hospitalName: 'Community Care Hospital',
        bloodType: 'A',
        bloodRhFactor: 'positive',
        availableUnits: 5,
        distance: 12.2,
        matchScore: 85,
        status: 'potential'
      }
    ];
    
    // Update request with match percentage
    request.matchPercentage = 92;
    
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
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
    
    // In a real app, this would send a notification to the hospital
    
    return { success: true };
  }
};

export default mockDatabaseService;
