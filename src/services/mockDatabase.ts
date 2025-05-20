// Mock database service to simulate backend functionality
// This would be replaced with actual Supabase calls in production

// Blood inventory data structure
export interface BloodInventory {
  bloodType: string;
  units: number;
  hospital: string;
  lastUpdated: Date;
  rhFactor: string;
  processedDate: Date;
  expirationDate: Date;
  donorAge?: number;
  specialAttributes?: string[];
}

// Blood request data structure
export interface BloodRequest {
  id: string;
  bloodType: string;
  hospital: string;
  urgency: 'critical' | 'urgent' | 'standard';
  distance: number;
  timeNeeded: string;
  matchPercentage: number;
  status: 'pending' | 'matched' | 'completed';
  units: number;
  createdAt: Date;
  neededBy: Date;
  patientAge?: number;
  patientWeight?: number;
  medicalCondition?: string;
  specialRequirements?: string[];
}

// Hospital data structure
export interface HospitalProfile {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  verified: boolean;
  requestsCount: number;
  partnerHospitals: number;
  location?: {
    lat: number;
    lng: number;
  };
}

// Registered Hospital structure
export interface RegisteredHospital {
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

// AI match data structure
export interface AiMatch {
  donorId: string;
  requestId: string;
  donorName: string;
  bloodType: string;
  bloodRhFactor?: string;
  matchScore: number;
  geneticCompatibility: number;
  distance: number;
  previousDonations: number;
  status: 'potential' | 'contacted' | 'confirmed' | 'in-transit' | 'completed';
  appointmentTime?: Date;
  eta?: number;
  compatibilityScore?: number;
  hospitalName?: string;
  hospitalId?: string;
  availableUnits?: number;
  specialAttributes?: string[];
}

// Mock blood inventory data
const mockBloodInventory: BloodInventory[] = [
  { 
    bloodType: 'A', 
    rhFactor: 'positive',
    units: 68, 
    hospital: 'City General Hospital', 
    lastUpdated: new Date(),
    processedDate: new Date(new Date().setDate(new Date().getDate() - 5)),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 35)),
    donorAge: 32,
    specialAttributes: ['irradiated']
  },
  { 
    bloodType: 'A', 
    rhFactor: 'negative',
    units: 42, 
    hospital: 'City General Hospital', 
    lastUpdated: new Date(),
    processedDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 33)),
    donorAge: 45
  },
  { 
    bloodType: 'B', 
    rhFactor: 'positive',
    units: 45, 
    hospital: 'City General Hospital', 
    lastUpdated: new Date(),
    processedDate: new Date(new Date().setDate(new Date().getDate() - 3)),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 37)),
    donorAge: 27,
    specialAttributes: ['cmv-negative']
  },
  { 
    bloodType: 'B', 
    rhFactor: 'negative',
    units: 31, 
    hospital: 'City General Hospital', 
    lastUpdated: new Date(),
    processedDate: new Date(new Date().setDate(new Date().getDate() - 10)),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    donorAge: 52
  },
  { 
    bloodType: 'AB', 
    rhFactor: 'positive',
    units: 72, 
    hospital: 'City General Hospital', 
    lastUpdated: new Date(),
    processedDate: new Date(new Date().setDate(new Date().getDate() - 2)),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 38)),
    donorAge: 35,
    specialAttributes: ['leukoreduced']
  },
  { 
    bloodType: 'AB', 
    rhFactor: 'negative',
    units: 59, 
    hospital: 'City General Hospital', 
    lastUpdated: new Date(),
    processedDate: new Date(new Date().setDate(new Date().getDate() - 4)),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 36)),
    donorAge: 29
  },
  { 
    bloodType: 'O', 
    rhFactor: 'positive',
    units: 23, 
    hospital: 'City General Hospital', 
    lastUpdated: new Date(),
    processedDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 39)),
    donorAge: 41,
    specialAttributes: ['washed']
  },
  { 
    bloodType: 'O', 
    rhFactor: 'negative',
    units: 15, 
    hospital: 'City General Hospital', 
    lastUpdated: new Date(),
    processedDate: new Date(new Date().setDate(new Date().getDate() - 6)),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 34)),
    donorAge: 38,
    specialAttributes: ['irradiated', 'cmv-negative']
  },
];

// Format blood type and Rh factor for display
const formatBloodType = (type: string, rhFactor: string): string => {
  return `${type} ${rhFactor === 'positive' ? 'Rh+ ('+type+'+)' : 'Rh- ('+type+'-)'}`; 
};

// Mock blood requests data
const mockBloodRequests: BloodRequest[] = [
  {
    id: '1',
    bloodType: 'O Rh+ (O+)',
    hospital: 'City General Hospital',
    urgency: 'critical',
    distance: 3.2,
    timeNeeded: 'Needed within 24 hours',
    matchPercentage: 98,
    status: 'pending',
    units: 3,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    neededBy: new Date(new Date().setDate(new Date().getDate() + 1)),
    patientAge: 56,
    patientWeight: 75,
    medicalCondition: 'Surgery',
    specialRequirements: ['irradiated']
  },
  {
    id: '2',
    bloodType: 'O Rh- (O-)',
    hospital: 'General Hospital',
    urgency: 'urgent',
    distance: 4.8,
    timeNeeded: 'Needed within 48 hours',
    matchPercentage: 85,
    status: 'matched',
    units: 2,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
    neededBy: new Date(new Date().setDate(new Date().getDate() + 3)),
    patientAge: 32,
    patientWeight: 68,
    medicalCondition: 'Trauma',
    specialRequirements: ['cmv-negative']
  },
  {
    id: '3',
    bloodType: 'B Rh+ (B+)',
    hospital: 'Medical Center',
    urgency: 'standard',
    distance: 2.1,
    timeNeeded: 'Needed within 3 days',
    matchPercentage: 72,
    status: 'pending',
    units: 4,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3)),
    neededBy: new Date(new Date().setDate(new Date().getDate() + 7)),
    patientAge: 45,
    patientWeight: 82,
    medicalCondition: 'Anemia',
    specialRequirements: ['leukoreduced']
  },
];

// Mock hospital profile
const mockHospitalProfile: HospitalProfile = {
  id: 'hospital-1',
  name: 'City General Hospital',
  email: 'admin@cityhospital.com',
  address: '123 Medical Center Ave, Mumbai',
  phone: '+91 11223 44556',
  verified: true,
  requestsCount: 12,
  partnerHospitals: 5,
  location: {
    lat: 19.0760,
    lng: 72.8777
  }
};

// Mock registered hospitals
const mockRegisteredHospitals: RegisteredHospital[] = [
  {
    id: 'hospital-1',
    name: 'City General Hospital',
    email: 'admin@cityhospital.com',
    contactPerson: 'Dr. Rajesh Kumar',
    phone: '+91 11223 44556',
    registrationId: 'CGH123456',
    address: '123 Medical Center Ave, Mumbai',
    verified: true,
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 6))
  },
  {
    id: 'hospital-2',
    name: 'Metro Healthcare',
    email: 'info@metrohealthcare.com',
    contactPerson: 'Dr. Priya Singh',
    phone: '+91 98765 43210',
    registrationId: 'MHC789012',
    address: '456 Health Avenue, Delhi',
    verified: true,
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 4))
  },
  {
    id: 'hospital-3',
    name: 'Valley Medical Center',
    email: 'contact@valleymedical.org',
    contactPerson: 'Dr. Amit Patel',
    phone: '+91 87654 32109',
    registrationId: 'VMC345678',
    address: '789 Valley Road, Bangalore',
    verified: false,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5))
  }
];

// Blood compatibility chart - defining which blood types can donate to which recipients
const bloodCompatibility: {[key: string]: string[]} = {
  'A+': ['A+', 'AB+'],
  'A-': ['A+', 'A-', 'AB+', 'AB-'],
  'B+': ['B+', 'AB+'],
  'B-': ['B+', 'B-', 'AB+', 'AB-'],
  'AB+': ['AB+'],
  'AB-': ['AB+', 'AB-'],
  'O+': ['A+', 'B+', 'AB+', 'O+'],
  'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
};

// Mock AI matches
const mockAiMatches: AiMatch[] = [
  {
    donorId: 'hospital-2',
    requestId: '1',
    donorName: 'Metro Healthcare',
    bloodType: 'O',
    bloodRhFactor: 'positive',
    matchScore: 97,
    geneticCompatibility: 95,
    distance: 3.2,
    previousDonations: 3,
    status: 'potential',
    hospitalName: 'Metro Healthcare',
    hospitalId: 'hospital-2',
    availableUnits: 45,
    specialAttributes: ['irradiated']
  },
  {
    donorId: 'hospital-3',
    requestId: '1',
    donorName: 'Valley Medical Center',
    bloodType: 'O',
    bloodRhFactor: 'positive',
    matchScore: 94,
    geneticCompatibility: 92,
    distance: 4.8,
    previousDonations: 5,
    status: 'potential',
    hospitalName: 'Valley Medical Center',
    hospitalId: 'hospital-3',
    availableUnits: 32,
    specialAttributes: ['irradiated', 'leukoreduced']
  },
  {
    donorId: 'hospital-4',
    requestId: '2',
    donorName: 'Central Medical Institute',
    bloodType: 'O',
    bloodRhFactor: 'negative',
    matchScore: 89,
    geneticCompatibility: 86,
    distance: 2.5,
    previousDonations: 1,
    status: 'potential',
    hospitalName: 'Central Medical Institute',
    hospitalId: 'hospital-4',
    availableUnits: 18,
    specialAttributes: ['cmv-negative']
  },
  {
    donorId: 'hospital-5',
    requestId: '3',
    donorName: 'Eastern Healthcare',
    bloodType: 'B',
    bloodRhFactor: 'positive',
    matchScore: 91,
    geneticCompatibility: 89,
    distance: 3.8,
    previousDonations: 2,
    status: 'confirmed',
    appointmentTime: new Date(new Date().setHours(new Date().getHours() + 4)),
    eta: 35,
    hospitalName: 'Eastern Healthcare',
    hospitalId: 'hospital-5',
    availableUnits: 26,
    specialAttributes: ['leukoreduced']
  },
];

// Nearby hospitals with available blood
const mockNearbyHospitals = [
  {
    id: 'hospital-2',
    name: 'Metro Healthcare',
    distance: 5.2,
    availableUnits: { 'O+': 23, 'AB-': 14, 'B+': 31 },
    availableBlood: [
      { bloodType: 'O', rhFactor: 'positive', units: 23, specialAttributes: ['irradiated'] },
      { bloodType: 'AB', rhFactor: 'negative', units: 14 },
      { bloodType: 'B', rhFactor: 'positive', units: 31, specialAttributes: ['leukoreduced'] }
    ],
    address: '456 Health Avenue, Delhi',
    phone: '+91 98765 43210',
    responseTime: '15-30 min',
  },
  {
    id: 'hospital-3',
    name: 'Valley Medical Center',
    distance: 7.8,
    availableUnits: { 'O+': 18, 'A+': 42 },
    availableBlood: [
      { bloodType: 'O', rhFactor: 'positive', units: 18, specialAttributes: ['irradiated', 'leukoreduced'] },
      { bloodType: 'A', rhFactor: 'positive', units: 42 }
    ],
    address: '789 Valley Road, Bangalore',
    phone: '+91 87654 32109',
    responseTime: '30-45 min',
  },
  {
    id: 'hospital-4',
    name: 'Central Medical Institute',
    distance: 3.6,
    availableUnits: { 'O-': 9, 'A-': 15, 'B-': 12 },
    availableBlood: [
      { bloodType: 'O', rhFactor: 'negative', units: 9, specialAttributes: ['cmv-negative'] },
      { bloodType: 'A', rhFactor: 'negative', units: 15 },
      { bloodType: 'B', rhFactor: 'negative', units: 12 }
    ],
    address: '321 Medical Boulevard, Chennai',
    phone: '+91 76543 21098',
    responseTime: '10-20 min',
  },
];

// Function to calculate blood compatibility score
const calculateBloodCompatibilityScore = (donorBloodType: string, donorRhFactor: string, recipientBloodType: string): number => {
  // Convert to short format for compatibility check
  const donorShortType = donorBloodType + (donorRhFactor === 'positive' ? '+' : '-');
  const recipientShortType = recipientBloodType.includes('Rh+') ? recipientBloodType.charAt(0) + '+' : recipientBloodType.charAt(0) + '-';
  
  // Perfect match - same blood type
  if (donorShortType === recipientShortType) {
    return 100;
  }
  
  // Check if donor can donate to recipient
  if (bloodCompatibility[donorShortType]?.includes(recipientShortType)) {
    // Universal donor (O-) gets a high score but not 100 (reserve 100 for exact matches)
    if (donorShortType === 'O-') {
      return 95;
    }
    // Other compatible types get a good score
    return 90;
  }
  
  // Not compatible
  return 0;
};

// Mock Database Services
export const mockDatabaseService = {
  // Get blood inventory
  getBloodInventory: () => Promise.resolve(
    mockBloodInventory.map(item => ({
      ...item,
      bloodType: formatBloodType(item.bloodType, item.rhFactor)
    }))
  ),
  
  // Get blood inventory details (includes all parameters)
  getBloodInventoryDetails: () => Promise.resolve(mockBloodInventory),
  
  // Update blood inventory
  updateBloodInventory: (bloodType: string, rhFactor: string, units: number, additionalParams: any = {}) => {
    const inventory = mockBloodInventory.find(item => 
      item.bloodType === bloodType && 
      item.rhFactor === rhFactor
    );
    
    if (inventory) {
      inventory.units = units;
      inventory.lastUpdated = new Date();
      
      // Update additional parameters if provided
      if (additionalParams.processedDate) inventory.processedDate = additionalParams.processedDate;
      if (additionalParams.expirationDate) inventory.expirationDate = additionalParams.expirationDate;
      if (additionalParams.donorAge) inventory.donorAge = additionalParams.donorAge;
      if (additionalParams.specialAttributes) inventory.specialAttributes = additionalParams.specialAttributes;
    }
    
    return Promise.resolve(inventory);
  },
  
  // Add new blood inventory
  addBloodInventory: (data: Omit<BloodInventory, 'lastUpdated'>) => {
    const newInventory = {
      ...data,
      lastUpdated: new Date()
    };
    
    mockBloodInventory.push(newInventory);
    return Promise.resolve(newInventory);
  },
  
  // Get blood requests
  getBloodRequests: () => Promise.resolve(mockBloodRequests),
  
  // Create blood request
  createBloodRequest: (request: Omit<BloodRequest, 'id' | 'createdAt' | 'matchPercentage'>) => {
    const newRequest = {
      ...request,
      id: String(mockBloodRequests.length + 1),
      createdAt: new Date(),
      matchPercentage: Math.floor(Math.random() * 20) + 80, // 80-100%
    };
    mockBloodRequests.push(newRequest);
    return Promise.resolve(newRequest);
  },
  
  // Get hospital profile
  getHospitalProfile: () => Promise.resolve(mockHospitalProfile),
  
  // Get registered hospitals
  getRegisteredHospitals: () => Promise.resolve(mockRegisteredHospitals),
  
  // Register new hospital
  registerHospital: (hospital: RegisteredHospital) => {
    mockRegisteredHospitals.push(hospital);
    return Promise.resolve({ success: true });
  },
  
  // Get AI matches
  getAiMatches: () => Promise.resolve(mockAiMatches),
  
  // Get nearby hospitals with available blood
  getNearbyHospitals: () => Promise.resolve(mockNearbyHospitals),

  // Process AI-based matching for a blood request
  processAiMatching: (requestId: string) => {
    // Find the request to match
    const request = mockBloodRequests.find(req => req.id === requestId);
    if (!request) {
      return Promise.resolve({
        success: false,
        error: "Blood request not found"
      });
    }

    // Get request blood type
    const requestBloodType = request.bloodType;

    // Simulate AI processing delay
    return new Promise(resolve => {
      setTimeout(() => {
        // Generate matches based on nearby hospitals and their blood inventory
        const potentialMatches = mockNearbyHospitals.flatMap(hospital => {
          return hospital.availableBlood
            .filter(blood => {
              // Check if this blood type is compatible with the requested type
              const hospitalBloodType = `${blood.bloodType} ${blood.rhFactor === 'positive' ? 'Rh+ ('+blood.bloodType+'+)' : 'Rh- ('+blood.bloodType+'-)'}`; 
              const compatibilityScore = calculateBloodCompatibilityScore(
                blood.bloodType, 
                blood.rhFactor,
                requestBloodType
              );
              return compatibilityScore > 0 && blood.units >= request.units;
            })
            .map(blood => {
              // For each compatible blood type, create a match
              const hospitalBloodType = `${blood.bloodType} ${blood.rhFactor === 'positive' ? 'Rh+ ('+blood.bloodType+'+)' : 'Rh- ('+blood.bloodType+'-)'}`; 
              const compatibilityScore = calculateBloodCompatibilityScore(
                blood.bloodType, 
                blood.rhFactor,
                requestBloodType
              );
              
              // Calculate additional match scores
              const distanceScore = Math.max(0, 100 - (hospital.distance * 5)); // Lower distance is better
              const specialAttributesScore = request.specialRequirements && blood.specialAttributes ?
                request.specialRequirements.filter(req => 
                  blood.specialAttributes?.includes(req)
                ).length * 5 : 0;
              
              // Combine scores with appropriate weights
              const combinedScore = Math.round(
                (compatibilityScore * 0.7) + // Blood compatibility is most important
                (distanceScore * 0.2) +      // Distance is next important
                (specialAttributesScore * 0.1) // Special requirements are also factored
              );
              
              return {
                donorId: hospital.id,
                requestId: request.id,
                donorName: hospital.name,
                bloodType: blood.bloodType,
                bloodRhFactor: blood.rhFactor,
                matchScore: combinedScore,
                compatibilityScore: compatibilityScore,
                geneticCompatibility: Math.floor(Math.random() * 10) + 85, // Placeholder for future genetic matching
                distance: hospital.distance,
                previousDonations: Math.floor(Math.random() * 5), // Placeholder
                status: 'potential',
                hospitalName: hospital.name,
                hospitalId: hospital.id,
                availableUnits: blood.units,
                specialAttributes: blood.specialAttributes
              } as AiMatch;
            });
        });

        // Sort matches by score (highest first)
        const sortedMatches = potentialMatches
          .filter(match => match.matchScore > 0) // Remove incompatible matches
          .sort((a, b) => b.matchScore - a.matchScore);
        
        resolve({
          success: true,
          matches: sortedMatches,
          requestBloodType: requestBloodType
        });
      }, 1500);
    });
  },
  
  // Contact hospital for a blood request
  contactHospital: (hospitalId: string, requestId: string) => {
    const match = mockAiMatches.find(m => m.donorId === hospitalId && m.requestId === requestId);
    if (match) {
      match.status = 'contacted';
    }
    return Promise.resolve({ success: !!match });
  }
};

export default mockDatabaseService;
