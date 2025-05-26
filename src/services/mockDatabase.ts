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
}

export interface AiMatch {
  requestId: string;
  hospitalName: string;
  bloodType: string;
  availableUnits: number;
  matchScore: number;
  distance: number;
  donorAge?: number;
  expiryDays?: number;
  specialAttributes?: string[];
  donorId: string;
  status: 'available' | 'contacted';
}

class MockDatabaseService {
  private hospitals: Hospital[] = [
    {
      id: 'hospital-1',
      name: 'City General Hospital',
      address: '123 Main St, Cityville',
      contactPerson: 'Dr. Smith',
      email: 'info@citygeneral.com',
      verified: true,
	  registrationId: 'CGH123',
      createdAt: new Date('2024-01-20')
    },
    {
      id: 'hospital-2',
      name: 'Regional Medical Center',
      address: '456 Oak Ave, Townsville',
      contactPerson: 'Dr. Johnson',
      email: 'info@regionalmed.com',
      verified: true,
	  registrationId: 'RMC456',
      createdAt: new Date('2024-02-15')
    },
    {
      id: 'hospital-3',
      name: 'Coastal Community Clinic',
      address: '789 Beach Rd, Coastville',
      contactPerson: 'Dr. Williams',
      email: 'info@coastalclinic.com',
      verified: false,
	    registrationId: 'CCC789',
      createdAt: new Date('2024-03-01')
    },
  ];

  private bloodInventory: BloodInventory[] = [
    {
      id: 'inventory-1',
      bloodType: 'A',
      rhFactor: 'positive',
      units: 50,
      processedDate: new Date('2024-04-01'),
      expirationDate: new Date('2024-05-15'),
      donorAge: 25,
      specialAttributes: ['irradiated'],
      hospitalName: 'City General Hospital'
    },
    {
      id: 'inventory-2',
      bloodType: 'B',
      rhFactor: 'negative',
      units: 30,
      processedDate: new Date('2024-04-05'),
      expirationDate: new Date('2024-05-20'),
      donorAge: 30,
      specialAttributes: ['leukoreduced'],
      hospitalName: 'Regional Medical Center'
    },
    {
      id: 'inventory-3',
      bloodType: 'O',
      rhFactor: 'positive',
      units: 40,
      processedDate: new Date('2024-04-10'),
      expirationDate: new Date('2024-05-25'),
      donorAge: 22,
      specialAttributes: [],
      hospitalName: 'City General Hospital'
    },
  ];

  private bloodRequests: BloodRequest[] = [
    {
      id: 'request-1',
      hospital: 'City General Hospital',
      bloodType: 'A Rh+',
      units: 10,
      urgency: 'urgent',
      patientAge: 60,
      patientWeight: 75,
      medicalCondition: 'Anemia',
      neededBy: new Date('2024-04-25'),
      specialRequirements: ['cmv-negative'],
      matchPercentage: 85,
      createdAt: new Date('2024-04-22')
    },
    {
      id: 'request-2',
      hospital: 'Regional Medical Center',
      bloodType: 'O Rh-',
      units: 5,
      urgency: 'critical',
      patientAge: 45,
      patientWeight: 60,
      medicalCondition: 'Trauma',
      neededBy: new Date('2024-04-28'),
      specialRequirements: [],
      matchPercentage: 92,
      createdAt: new Date('2024-04-23')
    },
  ];

  private donors: Donor[] = [
    {
      id: 'donor-1',
      name: 'Alice Smith',
      age: 28,
      bloodType: 'A',
      rhFactor: 'positive',
      location: 'Cityville',
      available: true
    },
    {
      id: 'donor-2',
      name: 'Bob Johnson',
      age: 35,
      bloodType: 'B',
      rhFactor: 'negative',
      location: 'Townsville',
      available: false
    },
  ];

  private aiMatches: AiMatch[] = [];

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
  }

  async getRegisteredHospitals(): Promise<Hospital[]> {
    return this.hospitals.filter(h => h.verified);
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
    // Get the current user's hospital name from auth context
    const authData = localStorage.getItem('bloodBank_auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.user?.hospitalName || 'City General Hospital';
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

  async getPendingHospitals(): Promise<Hospital[]> {
    return this.hospitals.filter(h => !h.verified);
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
    // Simulate contacting hospital
    console.log(`Contacting hospital for donor ${donorId} and request ${requestId}`);
    return { success: true };
  }

  async deleteHospital(hospitalId: string): Promise<{ success: boolean; error?: string }> {
    const hospitalIndex = this.hospitals.findIndex(h => h.id === hospitalId);
    
    if (hospitalIndex === -1) {
      return { success: false, error: 'Hospital not found' };
    }
    
    // Remove hospital and associated data
    const hospitalName = this.hospitals[hospitalIndex].name;
    this.hospitals.splice(hospitalIndex, 1);
    this.bloodInventory = this.bloodInventory.filter(inv => inv.hospitalName !== hospitalName);
    this.bloodRequests = this.bloodRequests.filter(req => req.hospital !== hospitalName);
    
    this.saveToStorage();
    return { success: true };
  }

  async findPotentialMatches(requestId: string): Promise<AiMatch[]> {
    const request = this.bloodRequests.find(req => req.id === requestId);
    if (!request) {
      console.warn(`Request with ID ${requestId} not found.`);
      return [];
    }

    // Simulate AI matching logic
    const potentialMatches: AiMatch[] = [];
    this.bloodInventory.forEach(inventory => {
      if (inventory.bloodType === request.bloodType.split(' ')[0]) {
        const matchScore = Math.floor(Math.random() * (95 - 70 + 1)) + 70; // Simulate a match score
        const distance = Math.floor(Math.random() * 100) + 1; // Simulate distance in km

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
            status: 'available'
          };
          potentialMatches.push(aiMatch);
        }
      }
    });

    this.aiMatches = potentialMatches;
    this.saveToStorage();
    return potentialMatches;
  }

  async createBloodRequest(request: Omit<BloodRequest, 'id' | 'matchPercentage' | 'createdAt'>): Promise<{ success: boolean; error?: string }> {
    const newRequest: BloodRequest = {
      id: this.generateId(),
      ...request,
      matchPercentage: 0,
      createdAt: new Date()
    };
    
    this.bloodRequests.push(newRequest);
    this.saveToStorage();
    return { success: true };
  }
}

const mockDatabaseService = new MockDatabaseService();
export default mockDatabaseService;
