// Mock database service to simulate backend functionality
// This would be replaced with actual Supabase calls in production

// Blood inventory data structure
export interface BloodInventory {
  bloodType: string;
  units: number;
  hospital: string;
  lastUpdated: Date;
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
}

// Donation event data structure
export interface DonationEvent {
  id: string;
  title: string;
  date: Date;
  location: string;
  slots: number;
  registeredDonors: number;
  description: string;
  hospitalId: string;
  hospitalName: string;
}

// Donor data structure
export interface DonorProfile {
  id: string;
  name: string;
  email: string;
  bloodType: string;
  lastDonation: Date | null;
  donationsCount: number;
  eligibleDate: Date;
  phone?: string;
  address?: string;
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
}

// Donation history data structure
export interface DonationHistory {
  id: string;
  donorId: string;
  hospitalId: string;
  hospitalName: string;
  date: Date;
  bloodType: string;
  status: 'completed' | 'scheduled' | 'cancelled';
}

// AI match data structure
export interface AiMatch {
  donorId: string;
  requestId: string;
  donorName: string;
  bloodType: string;
  matchScore: number;
  geneticCompatibility: number;
  distance: number;
  previousDonations: number;
  status: 'potential' | 'contacted' | 'confirmed' | 'in-transit' | 'completed';
  appointmentTime?: Date;
  eta?: number;
}

// Mock blood inventory data
const mockBloodInventory: BloodInventory[] = [
  { bloodType: 'A Rh+ (A+)', units: 68, hospital: 'City General Hospital', lastUpdated: new Date() },
  { bloodType: 'A Rh- (A-)', units: 42, hospital: 'City General Hospital', lastUpdated: new Date() },
  { bloodType: 'B Rh+ (B+)', units: 45, hospital: 'City General Hospital', lastUpdated: new Date() },
  { bloodType: 'B Rh- (B-)', units: 31, hospital: 'City General Hospital', lastUpdated: new Date() },
  { bloodType: 'AB Rh+ (AB+)', units: 72, hospital: 'City General Hospital', lastUpdated: new Date() },
  { bloodType: 'AB Rh- (AB-)', units: 59, hospital: 'City General Hospital', lastUpdated: new Date() },
  { bloodType: 'O Rh+ (O+)', units: 23, hospital: 'City General Hospital', lastUpdated: new Date() },
  { bloodType: 'O Rh- (O-)', units: 15, hospital: 'City General Hospital', lastUpdated: new Date() },
];

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
  },
];

// Mock donation events data
const mockDonationEvents: DonationEvent[] = [
  {
    id: '1',
    title: 'City General Hospital Blood Drive',
    date: new Date(new Date().setDate(new Date().getDate() + 13)),
    location: '123 Medical Center Ave',
    slots: 50,
    registeredDonors: 32,
    description: 'Join us for our monthly blood donation drive. All blood types needed.',
    hospitalId: 'hospital-1',
    hospitalName: 'City General Hospital',
  },
  {
    id: '2',
    title: 'Community Center Blood Donation',
    date: new Date(new Date().setDate(new Date().getDate() + 18)),
    location: '456 Community Square',
    slots: 30,
    registeredDonors: 12,
    description: 'Emergency blood drive focusing on O- and A+ blood types.',
    hospitalId: 'hospital-2',
    hospitalName: 'General Hospital',
  },
  {
    id: '3',
    title: 'University Blood Drive',
    date: new Date(new Date().setDate(new Date().getDate() + 21)),
    location: 'University Campus Center',
    slots: 100,
    registeredDonors: 45,
    description: 'Annual university blood drive. Free refreshments for all donors!',
    hospitalId: 'hospital-3',
    hospitalName: 'Medical Center',
  },
];

// Mock donation history data
const mockDonationHistory: DonationHistory[] = [
  {
    id: '1',
    donorId: 'donor-1',
    hospitalId: 'hospital-1',
    hospitalName: 'City Blood Bank',
    date: new Date(new Date().setDate(new Date().getDate() - 75)),
    bloodType: 'O Rh+ (O+)',
    status: 'completed',
  },
  {
    id: '2',
    donorId: 'donor-1',
    hospitalId: 'hospital-2',
    hospitalName: 'General Hospital Drive',
    date: new Date(new Date().setDate(new Date().getDate() - 150)),
    bloodType: 'O Rh+ (O+)',
    status: 'completed',
  },
  {
    id: '3',
    donorId: 'donor-1',
    hospitalId: 'hospital-3',
    hospitalName: 'Community Blood Drive',
    date: new Date(new Date().setDate(new Date().getDate() - 235)),
    bloodType: 'O Rh+ (O+)',
    status: 'completed',
  },
];

// Mock donor profile
const mockDonorProfile: DonorProfile = {
  id: 'donor-1',
  name: 'Rahul Sharma',
  email: 'rahul@example.com',
  bloodType: 'O Rh+ (O+)',
  lastDonation: new Date(new Date().setDate(new Date().getDate() - 75)),
  donationsCount: 3,
  eligibleDate: new Date(new Date().setDate(new Date().getDate() - 15)),
  phone: '+91 98765 43210',
  address: '789 Resident Colony, New Delhi',
};

// Mock hospital profile
const mockHospitalProfile: HospitalProfile = {
  id: 'hospital-1',
  name: 'City General Hospital',
  email: 'admin@cityhospital.com',
  address: '123 Medical Center Ave, Mumbai',
  phone: '+91 11223 44556',
  verified: true,
  requestsCount: 12,
};

// Mock AI matches
const mockAiMatches: AiMatch[] = [
  {
    donorId: 'donor-2',
    requestId: '1',
    donorName: 'Rajesh Kumar',
    bloodType: 'O Rh+ (O+)',
    matchScore: 97,
    geneticCompatibility: 95,
    distance: 3.2,
    previousDonations: 3,
    status: 'potential',
  },
  {
    donorId: 'donor-3',
    requestId: '1',
    donorName: 'Priya Singh',
    bloodType: 'O Rh+ (O+)',
    matchScore: 94,
    geneticCompatibility: 92,
    distance: 4.8,
    previousDonations: 5,
    status: 'potential',
  },
  {
    donorId: 'donor-4',
    requestId: '2',
    donorName: 'Amit Sharma',
    bloodType: 'O Rh- (O-)',
    matchScore: 89,
    geneticCompatibility: 86,
    distance: 2.5,
    previousDonations: 1,
    status: 'potential',
  },
  {
    donorId: 'donor-5',
    requestId: '3',
    donorName: 'Neha Patel',
    bloodType: 'AB Rh+ (AB+)',
    matchScore: 91,
    geneticCompatibility: 89,
    distance: 3.8,
    previousDonations: 2,
    status: 'confirmed',
    appointmentTime: new Date(new Date().setHours(new Date().getHours() + 4)),
    eta: 35,
  },
  {
    donorId: 'donor-6',
    requestId: '2',
    donorName: 'Rahul Gupta',
    bloodType: 'O Rh+ (O+)',
    matchScore: 93,
    geneticCompatibility: 90,
    distance: 5.5,
    previousDonations: 4,
    status: 'in-transit',
    appointmentTime: new Date(new Date().setHours(new Date().getHours() + 5.5)),
    eta: 55,
  },
];

// Nearby blood banks
const mockNearbyBloodBanks = [
  {
    id: 'bank-1',
    name: 'Central Blood Bank',
    distance: 5.2,
    availableUnits: { 'O Rh+ (O+)': 23 },
    address: '456 Main Street, Mumbai',
    phone: '+91 98765 12345',
    openHours: '24/7',
  },
  {
    id: 'bank-2',
    name: 'Regional Medical Center',
    distance: 7.8,
    availableUnits: { 'O Rh+ (O+)': 18 },
    address: '789 Hospital Road, Mumbai',
    phone: '+91 98765 54321',
    openHours: '9 AM - 8 PM',
  },
  {
    id: 'bank-3',
    name: 'City Blood Services',
    distance: 3.6,
    availableUnits: { 'O Rh+ (O+)': 9 },
    address: '321 Blood Bank Avenue, Mumbai',
    phone: '+91 98765 67890',
    openHours: '8 AM - 6 PM',
  },
];

// Updated interface for registerForEvent function response
interface RegisterEventResponse {
  success: boolean;
  message?: string; // Add message property
}

// Mock Database Services
export const mockDatabaseService = {
  // Get blood inventory
  getBloodInventory: () => Promise.resolve(mockBloodInventory),
  
  // Update blood inventory
  updateBloodInventory: (bloodType: string, units: number) => {
    const inventory = mockBloodInventory.find(item => item.bloodType === bloodType);
    if (inventory) {
      inventory.units = units;
      inventory.lastUpdated = new Date();
    }
    return Promise.resolve(inventory);
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
  
  // Get donation events
  getDonationEvents: () => Promise.resolve(mockDonationEvents),
  
  // Create donation event
  createDonationEvent: (event: Omit<DonationEvent, 'id' | 'registeredDonors'>) => {
    const newEvent = {
      ...event,
      id: String(mockDonationEvents.length + 1),
      registeredDonors: 0,
    };
    mockDonationEvents.push(newEvent);
    return Promise.resolve(newEvent);
  },
  
  // Register for event
  registerForEvent: async (eventId: string, userId: string): Promise<RegisterEventResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    // Success 80% of the time
    if (Math.random() > 0.2) {
      return { 
        success: true 
      };
    } else {
      return { 
        success: false, 
        message: "Registration failed. Please try again later." 
      };
    }
  },
  
  // Get donor profile
  getDonorProfile: () => Promise.resolve(mockDonorProfile),
  
  // Get hospital profile
  getHospitalProfile: () => Promise.resolve(mockHospitalProfile),
  
  // Get donation history
  getDonationHistory: () => Promise.resolve(mockDonationHistory),
  
  // Get AI matches
  getAiMatches: () => Promise.resolve(mockAiMatches),
  
  // Get nearby blood banks
  getNearbyBloodBanks: () => Promise.resolve(mockNearbyBloodBanks),

  // Process AI-based matching for a blood request
  processAiMatching: (requestId: string) => {
    // Simulate AI processing delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          matches: mockAiMatches.filter(match => match.requestId === requestId),
        });
      }, 1500);
    });
  },
  
  // Contact donor for a blood request
  contactDonor: (donorId: string, requestId: string) => {
    const match = mockAiMatches.find(m => m.donorId === donorId && m.requestId === requestId);
    if (match) {
      match.status = 'contacted';
    }
    return Promise.resolve({ success: !!match });
  }
};

export default mockDatabaseService;
