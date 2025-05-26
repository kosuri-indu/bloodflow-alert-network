import { v4 as uuidv4 } from 'uuid';

export interface BloodInventory {
  id: string;
  bloodType: string;
  rhFactor: 'positive' | 'negative';
  units: number;
  processedDate: Date;
  expirationDate: Date;
  donorAge: number;
  specialAttributes: string[];
  hospitalName: string;
}

export interface BloodRequest {
  id: string;
  hospital: string;
  bloodType: string;
  units: number;
  urgency: 'routine' | 'urgent' | 'critical';
  patientAge: number;
  patientWeight: number;
  medicalCondition: string;
  neededBy: Date;
  specialRequirements: string[];
  matchPercentage: number;
  createdAt: Date;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  email: string;
  verified: boolean;
  registrationId: string;
  createdAt: Date;
}

export interface Donor {
  id: string;
  name: string;
  age: number;
  bloodType: string;
  rhFactor: string;
  location: string;
  available: boolean;
  email: string;
  phone: string;
  weight: number;
  address: string;
  isEligible: boolean;
  notificationPreferences: {
    urgentRequests: boolean;
    donationDrives: boolean;
    general: boolean;
  };
}

export interface DonationDrive {
  id: string;
  eventName: string;
  description: string;
  organizerName: string;
  date: Date;
  location: string;
  status: 'upcoming' | 'active' | 'completed';
  registeredDonors: number;
  expectedDonors: number;
  targetBloodTypes: string[];
}

export interface AiMatch {
  requestId: string;
  hospitalName: string;
  hospitalAddress?: string;
  bloodType: string;
  bloodRhFactor?: string;
  availableUnits: number;
  matchScore: number;
  distance: number;
  donorAge?: number;
  expiryDays?: number;
  specialAttributes?: string[];
  donorId: string;
  status: 'available' | 'contacted' | 'potential';
  compatibilityScore?: number;
  ageCompatibilityScore?: number;
  medicalCompatibilityScore?: number;
}

class MockDatabaseService {
  private hospitals: Hospital[] = [];
  private bloodInventory: BloodInventory[] = [];
  private bloodRequests: BloodRequest[] = [];
  private donors: Donor[] = [];
  private aiMatches: AiMatch[] = [];
  private donationDrives: DonationDrive[] = [
    {
      id: 'drive-1',
      eventName: 'City Blood Drive 2024',
      description: 'Annual community blood donation drive',
      organizerName: 'Red Cross',
      date: new Date('2024-06-15'),
      location: 'City Center',
      status: 'upcoming',
      registeredDonors: 25,
      expectedDonors: 100,
      targetBloodTypes: ['O+', 'O-', 'A+', 'B+']
    }
  ];

  constructor() {
    this.loadFromStorage();
  }

  private generateId(): string {
    return uuidv4();
  }

  private saveToStorage(): void {
    localStorage.setItem('bloodBank_hospitals', JSON.stringify(this.hospitals));
    localStorage.setItem('bloodBank_inventory', JSON.stringify(this.bloodInventory));
    localStorage.setItem('bloodBank_requests', JSON.stringify(this.bloodRequests));
    localStorage.setItem('bloodBank_donors', JSON.stringify(this.donors));
    localStorage.setItem('bloodBank_aiMatches', JSON.stringify(this.aiMatches));
    localStorage.setItem('bloodBank_donationDrives', JSON.stringify(this.donationDrives));
  }

  private loadFromStorage(): void {
    const hospitalsData = localStorage.getItem('bloodBank_hospitals');
    if (hospitalsData) {
      this.hospitals = JSON.parse(hospitalsData);
    }

    const inventoryData = localStorage.getItem('bloodBank_inventory');
    if (inventoryData) {
      this.bloodInventory = JSON.parse(inventoryData);
    }

    const requestsData = localStorage.getItem('bloodBank_requests');
    if (requestsData) {
      this.bloodRequests = JSON.parse(requestsData);
    }

    const donorsData = localStorage.getItem('bloodBank_donors');
    if (donorsData) {
      this.donors = JSON.parse(donorsData);
    }

    const aiMatchesData = localStorage.getItem('bloodBank_aiMatches');
    if (aiMatchesData) {
      this.aiMatches = JSON.parse(aiMatchesData);
    }

    const drivesData = localStorage.getItem('bloodBank_donationDrives');
    if (drivesData) {
      this.donationDrives = JSON.parse(drivesData);
    }
  }

  async getRegisteredHospitals(): Promise<Hospital[]> {
    return this.hospitals.filter(h => h.verified);
  }

  async getPendingHospitals(): Promise<Hospital[]> {
    return this.hospitals.filter(h => !h.verified);
  }

  async getAllHospitalsWithData(): Promise<Array<{
    hospital: Hospital;
    inventory: BloodInventory[];
    requests: BloodRequest[];
  }>> {
    return this.hospitals.map(hospital => ({
      hospital,
      inventory: this.bloodInventory.filter(inv => inv.hospitalName === hospital.name),
      requests: this.bloodRequests.filter(req => req.hospital === hospital.name)
    }));
  }

  async getHospitalProfile(hospitalName?: string): Promise<Hospital> {
    const currentHospital = hospitalName || this.getCurrentHospitalName();
    const hospital = this.hospitals.find(h => h.name === currentHospital);
    
    if (!hospital) {
      throw new Error('Hospital not found');
    }
    
    return hospital;
  }

  private getCurrentHospitalName(): string {
    const authData = localStorage.getItem('bloodbank_user');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.hospitalName || 'City General Hospital';
    }
    return 'City General Hospital';
  }

  async addBloodInventory(hospitalName: string, inventory: Omit<BloodInventory, 'id' | 'hospitalName'>): Promise<BloodInventory> {
    const newInventory: BloodInventory = {
      id: this.generateId(),
      ...inventory,
      hospitalName
    };
    
    this.bloodInventory.push(newInventory);
    this.saveToStorage();
    return newInventory;
  }

  async getHospitalBloodInventory(hospitalName: string): Promise<BloodInventory[]> {
    return this.bloodInventory.filter(item => item.hospitalName === hospitalName);
  }

  async getHospitalBloodRequests(hospitalName: string): Promise<BloodRequest[]> {
    return this.bloodRequests.filter(req => req.hospital === hospitalName);
  }

  async getBloodRequests(): Promise<BloodRequest[]> {
    return [...this.bloodRequests];
  }

  async getBloodInventoryDetails(): Promise<BloodInventory[]> {
    return [...this.bloodInventory];
  }

  async updateBloodRequest(requestId: string, updates: Partial<BloodRequest>): Promise<{ success: boolean; error?: string }> {
    const requestIndex = this.bloodRequests.findIndex(req => req.id === requestId);
    
    if (requestIndex === -1) {
      return { success: false, error: 'Request not found' };
    }
    
    this.bloodRequests[requestIndex] = { ...this.bloodRequests[requestIndex], ...updates };
    this.saveToStorage();
    return { success: true };
  }

  async contactHospital(donorId: string, requestId: string): Promise<{ success: boolean; error?: string }> {
    console.log(`Contacting hospital for donor ${donorId} and request ${requestId}`);
    return { success: true };
  }

  async deleteHospital(hospitalId: string): Promise<{ success: boolean; error?: string }> {
    const hospitalIndex = this.hospitals.findIndex(h => h.id === hospitalId);
    
    if (hospitalIndex === -1) {
      return { success: false, error: 'Hospital not found' };
    }
    
    const hospitalName = this.hospitals[hospitalIndex].name;
    this.hospitals.splice(hospitalIndex, 1);
    this.bloodInventory = this.bloodInventory.filter(inv => inv.hospitalName !== hospitalName);
    this.bloodRequests = this.bloodRequests.filter(req => req.hospital !== hospitalName);
    
    this.saveToStorage();
    return { success: true };
  }

  async verifyHospital(hospitalId: string): Promise<{ success: boolean; error?: string; hospitalName?: string }> {
    const hospitalIndex = this.hospitals.findIndex(h => h.id === hospitalId);
    
    if (hospitalIndex === -1) {
      return { success: false, error: 'Hospital not found' };
    }
    
    this.hospitals[hospitalIndex].verified = true;
    this.saveToStorage();
    return { success: true, hospitalName: this.hospitals[hospitalIndex].name };
  }

  async registerHospital(hospitalData: Omit<Hospital, 'id' | 'verified' | 'createdAt'>): Promise<{ success: boolean; error?: string }> {
    const existingHospital = this.hospitals.find(h => h.email === hospitalData.email);
    
    if (existingHospital) {
      return { success: false, error: 'Hospital with this email already exists' };
    }
    
    const newHospital: Hospital = {
      id: this.generateId(),
      ...hospitalData,
      verified: false,
      createdAt: new Date()
    };
    
    this.hospitals.push(newHospital);
    this.saveToStorage();
    return { success: true };
  }

  async getDonors(): Promise<Donor[]> {
    return [...this.donors];
  }

  async registerDonor(donorData: Omit<Donor, 'id'>): Promise<{ success: boolean; error?: string }> {
    const existingDonor = this.donors.find(d => d.email === donorData.email);
    
    if (existingDonor) {
      return { success: false, error: 'Donor with this email already exists' };
    }
    
    const newDonor: Donor = {
      id: this.generateId(),
      ...donorData,
      available: true,
      location: donorData.location || 'Unknown'
    };
    
    this.donors.push(newDonor);
    this.saveToStorage();
    return { success: true };
  }

  async getDonationDrives(): Promise<DonationDrive[]> {
    return [...this.donationDrives];
  }

  async registerForDonationDrive(driveId: string, donorId: string): Promise<{ success: boolean; error?: string }> {
    const driveIndex = this.donationDrives.findIndex(d => d.id === driveId);
    
    if (driveIndex === -1) {
      return { success: false, error: 'Donation drive not found' };
    }
    
    this.donationDrives[driveIndex].registeredDonors += 1;
    this.saveToStorage();
    return { success: true };
  }

  async getAllData(): Promise<{
    hospitals: Hospital[];
    donors: Donor[];
    bloodInventory: BloodInventory[];
    bloodRequests: BloodRequest[];
  }> {
    return {
      hospitals: this.hospitals,
      donors: this.donors,
      bloodInventory: this.bloodInventory,
      bloodRequests: this.bloodRequests
    };
  }

  async createBloodRequest(request: Omit<BloodRequest, 'id' | 'matchPercentage' | 'createdAt'>): Promise<{ success: boolean; error?: string; requestId?: string }> {
    const newRequest: BloodRequest = {
      id: this.generateId(),
      ...request,
      matchPercentage: 0,
      createdAt: new Date()
    };
    
    this.bloodRequests.push(newRequest);
    this.saveToStorage();
    return { success: true, requestId: newRequest.id };
  }

  async findPotentialMatches(requestId: string): Promise<AiMatch[]> {
    const request = this.bloodRequests.find(req => req.id === requestId);
    if (!request) {
      console.warn(`Request with ID ${requestId} not found.`);
      return [];
    }

    const potentialMatches: AiMatch[] = [];
    this.bloodInventory.forEach(inventory => {
      if (inventory.bloodType === request.bloodType.split(' ')[0]) {
        const matchScore = Math.floor(Math.random() * (95 - 70 + 1)) + 70;
        const distance = Math.floor(Math.random() * 100) + 1;

        const donor = this.donors.find(d => d.bloodType === inventory.bloodType && d.rhFactor === inventory.rhFactor);

        if (donor) {
          const aiMatch: AiMatch = {
            requestId: request.id,
            hospitalName: inventory.hospitalName,
            bloodType: inventory.bloodType,
            availableUnits: inventory.units,
            matchScore: matchScore,
            distance: distance,
            donorAge: inventory.donorAge,
            expiryDays: Math.floor(Math.random() * 42) + 1,
            specialAttributes: inventory.specialAttributes,
            donorId: donor.id,
            status: 'available',
            compatibilityScore: matchScore,
            bloodRhFactor: inventory.rhFactor
          };
          potentialMatches.push(aiMatch);
        }
      }
    });

    this.aiMatches = potentialMatches;
    this.saveToStorage();
    return potentialMatches;
  }
}

const mockDatabaseService = new MockDatabaseService();
export default mockDatabaseService;
