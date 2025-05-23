
// Mock database service for demonstration purposes
// In a real application, this would be replaced with actual API calls to a backend

interface Hospital {
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
  }
};

export default mockDatabaseService;
