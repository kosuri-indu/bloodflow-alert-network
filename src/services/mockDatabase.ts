import { v4 as uuidv4 } from 'uuid';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  email: string;
  registrationId: string;
  verified: boolean;
  createdAt: Date;
}

export interface BloodInventory {
  id: string;
  bloodType: string;
  rhFactor: 'positive' | 'negative';
  units: number;
  hospital: string;
  processedDate: Date;
  expirationDate: Date;
  donorAge: number;
  specialAttributes?: string[];
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
  createdAt: Date;
  matchPercentage: number;
  specialRequirements?: string[];
}

export interface AiMatch {
  donorId: string;
  requestId: string;
  hospitalName: string;
  hospitalAddress: string;
  bloodType: string;
  bloodRhFactor: string;
  availableUnits: number;
  distance: number;
  matchScore: number;
  status: 'potential' | 'contacted' | 'fulfilled';
  specialAttributes?: string[];
  compatibilityScore: number;
  donorAge?: number;
  expiryDays?: number;
  ageCompatibilityScore?: number;
  medicalCompatibilityScore?: number;
}

class MockDatabaseService {
  private hospitals: Hospital[] = [];
  private pendingHospitals: Hospital[] = [];
  private bloodInventory: BloodInventory[] = [];
  private bloodRequests: BloodRequest[] = [];

  constructor() {
    this.loadFromStorage();
    if (this.hospitals.length === 0) {
      this.initializeSampleData();
    }
  }

  private loadFromStorage() {
    const storedHospitals = localStorage.getItem('hospitals');
    this.hospitals = storedHospitals ? JSON.parse(storedHospitals).map((h: any) => ({...h, createdAt: new Date(h.createdAt)})) : [];

    const storedPendingHospitals = localStorage.getItem('pendingHospitals');
    this.pendingHospitals = storedPendingHospitals ? JSON.parse(storedPendingHospitals).map((h: any) => ({...h, createdAt: new Date(h.createdAt)})) : [];

    const storedBloodInventory = localStorage.getItem('bloodInventory');
    this.bloodInventory = storedBloodInventory ? JSON.parse(storedBloodInventory).map((item: any) => ({...item, processedDate: new Date(item.processedDate), expirationDate: new Date(item.expirationDate)})) : [];

    const storedBloodRequests = localStorage.getItem('bloodRequests');
    this.bloodRequests = storedBloodRequests ? JSON.parse(storedBloodRequests).map((req: any) => ({...req, createdAt: new Date(req.createdAt), neededBy: new Date(req.neededBy)})) : [];
  }

  private saveToStorage() {
    localStorage.setItem('hospitals', JSON.stringify(this.hospitals));
    localStorage.setItem('pendingHospitals', JSON.stringify(this.pendingHospitals));
    localStorage.setItem('bloodInventory', JSON.stringify(this.bloodInventory));
    localStorage.setItem('bloodRequests', JSON.stringify(this.bloodRequests));
  }

  private initializeSampleData() {
    const hospital1: Hospital = {
      id: 'hosp_1',
      name: 'City General Hospital',
      address: '123 Main St, Downtown Area',
      contactPerson: 'Dr. Jane Doe',
      email: 'jane.doe@citygeneral.com',
      registrationId: 'CGH12345',
      verified: true,
      createdAt: new Date('2024-01-01')
    };
    const hospital2: Hospital = {
      id: 'hosp_2',
      name: 'Community Medical Center',
      address: '456 Oak Ave, West District',
      contactPerson: 'John Smith',
      email: 'john.smith@communitymed.org',
      registrationId: 'CMC67890',
      verified: true,
      createdAt: new Date('2024-02-15')
    };
    const hospital3: Hospital = {
      id: 'hosp_3',
      name: 'University Hospital',
      address: '789 Pine Ln, University Campus',
      contactPerson: 'Alice Johnson',
      email: 'alice.johnson@universityhosp.edu',
      registrationId: 'UH24680',
      verified: false,
      createdAt: new Date('2024-03-01')
    };

    this.hospitals.push(hospital1, hospital2);
    this.pendingHospitals.push(hospital3);

    const inventory1: BloodInventory = {
      id: 'inv_1',
      bloodType: 'A',
      rhFactor: 'positive',
      units: 30,
      hospital: hospital1.name,
      processedDate: new Date('2024-04-01'),
      expirationDate: new Date('2024-05-15'),
      donorAge: 25
    };
    const inventory2: BloodInventory = {
      id: 'inv_2',
      bloodType: 'B',
      rhFactor: 'negative',
      units: 15,
      hospital: hospital2.name,
      processedDate: new Date('2024-04-05'),
      expirationDate: new Date('2024-05-20'),
      donorAge: 32
    };
    const inventory3: BloodInventory = {
      id: 'inv_3',
      bloodType: 'O',
      rhFactor: 'positive',
      units: 40,
      hospital: hospital1.name,
      processedDate: new Date('2024-04-10'),
      expirationDate: new Date('2024-05-25'),
      donorAge: 40
    };

    this.bloodInventory.push(inventory1, inventory2, inventory3);

    const request1: BloodRequest = {
      id: 'req_1',
      hospital: hospital1.name,
      bloodType: 'A Rh+ (A+)',
      units: 5,
      urgency: 'urgent',
      patientAge: 60,
      patientWeight: 75,
      medicalCondition: 'Anemia',
      neededBy: new Date('2024-04-20'),
      createdAt: new Date('2024-04-15'),
      matchPercentage: 85
    };
    const request2: BloodRequest = {
      id: 'req_2',
      hospital: hospital2.name,
      bloodType: 'O Rh- (O-)',
      units: 2,
      urgency: 'critical',
      patientAge: 45,
      patientWeight: 68,
      medicalCondition: 'Trauma',
      neededBy: new Date('2024-04-22'),
      createdAt: new Date('2024-04-16'),
      matchPercentage: 92
    };

    this.bloodRequests.push(request1, request2);
    this.saveToStorage();
  }

  async registerHospital(hospital: Omit<Hospital, 'id' | 'verified' | 'createdAt'>): Promise<{ success: boolean; hospitalId?: string }> {
    try {
      const newHospital: Hospital = {
        id: `hosp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...hospital,
        verified: false,
        createdAt: new Date()
      };
      this.pendingHospitals.push(newHospital);
      this.saveToStorage();
      return { success: true, hospitalId: newHospital.id };
    } catch (error) {
      console.error('Error registering hospital:', error);
      return { success: false };
    }
  }

  async approveHospital(hospitalId: string): Promise<boolean> {
    try {
      const hospitalIndex = this.pendingHospitals.findIndex(h => h.id === hospitalId);
      if (hospitalIndex === -1) {
        console.warn(`Hospital with ID ${hospitalId} not found in pending hospitals.`);
        return false;
      }

      const [hospital] = this.pendingHospitals.splice(hospitalIndex, 1);
      hospital.verified = true;
      this.hospitals.push(hospital);
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error('Error approving hospital:', error);
      return false;
    }
  }

  async verifyHospital(hospitalId: string): Promise<{ success: boolean; hospitalName?: string; error?: string }> {
    try {
      const hospitalIndex = this.pendingHospitals.findIndex(h => h.id === hospitalId);
      if (hospitalIndex === -1) {
        return { success: false, error: `Hospital with ID ${hospitalId} not found in pending hospitals.` };
      }

      const [hospital] = this.pendingHospitals.splice(hospitalIndex, 1);
      hospital.verified = true;
      this.hospitals.push(hospital);
      this.saveToStorage();
      return { success: true, hospitalName: hospital.name };
    } catch (error) {
      console.error('Error verifying hospital:', error);
      return { success: false, error: 'Failed to verify hospital.' };
    }
  }

  async getAllData(): Promise<{ hospitals: Hospital[]; pendingHospitals: Hospital[]; inventory: BloodInventory[]; requests: BloodRequest[] }> {
    return {
      hospitals: [...this.hospitals, ...this.pendingHospitals],
      pendingHospitals: this.pendingHospitals,
      inventory: this.bloodInventory,
      requests: this.bloodRequests
    };
  }

  async deleteHospital(hospitalId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const hospitalIndex = this.hospitals.findIndex(h => h.id === hospitalId);
      const pendingHospitalIndex = this.pendingHospitals.findIndex(h => h.id === hospitalId);

      if (hospitalIndex !== -1) {
        this.hospitals.splice(hospitalIndex, 1);
      } else if (pendingHospitalIndex !== -1) {
        this.pendingHospitals.splice(pendingHospitalIndex, 1);
      } else {
        return { success: false, error: `Hospital with ID ${hospitalId} not found.` };
      }

      this.bloodInventory = this.bloodInventory.filter(item => item.hospital !== this.hospitals.find(h => h.id === hospitalId)?.name);
      this.bloodRequests = this.bloodRequests.filter(request => request.hospital !== this.hospitals.find(h => h.id === hospitalId)?.name);

      this.saveToStorage();
      return { success: true };
    } catch (error) {
      console.error('Error deleting hospital:', error);
      return { success: false, error: 'Failed to delete hospital.' };
    }
  }

  async getRegisteredHospitals(): Promise<Hospital[]> {
    return this.hospitals;
  }

  async getPendingHospitals(): Promise<Hospital[]> {
    return this.pendingHospitals;
  }

  async getHospitalProfile(): Promise<Hospital> {
    return this.hospitals[0];
  }

  async addBloodInventory(inventory: Omit<BloodInventory, 'id'>): Promise<void> {
    const newInventory: BloodInventory = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...inventory
    };
    this.bloodInventory.push(newInventory);
    this.saveToStorage();
  }

  async getBloodInventoryDetails(): Promise<BloodInventory[]> {
    return this.bloodInventory;
  }

  async getHospitalBloodInventory(hospitalName: string): Promise<BloodInventory[]> {
    return this.bloodInventory.filter(item => item.hospital === hospitalName);
  }

  async getBloodRequests(): Promise<BloodRequest[]> {
    return this.bloodRequests;
  }

  async getHospitalBloodRequests(hospitalName: string): Promise<BloodRequest[]> {
    return this.bloodRequests.filter(request => request.hospital === hospitalName);
  }

  async getAllHospitalsWithData(): Promise<{
    hospital: Hospital;
    inventory: BloodInventory[];
    requests: BloodRequest[];
  }[]> {
    const hospitals = await this.getRegisteredHospitals();
    
    return hospitals.map(hospital => ({
      hospital,
      inventory: this.bloodInventory.filter(item => item.hospital === hospital.name),
      requests: this.bloodRequests.filter(request => request.hospital === hospital.name)
    }));
  }

  async updateBloodRequest(requestId: string, updates: Partial<BloodRequest>): Promise<boolean> {
    try {
      const requestIndex = this.bloodRequests.findIndex(req => req.id === requestId);
      if (requestIndex === -1) {
        console.warn(`Request with ID ${requestId} not found.`);
        return false;
      }

      this.bloodRequests[requestIndex] = { ...this.bloodRequests[requestIndex], ...updates };
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error('Error updating blood request:', error);
      return false;
    }
  }

  async contactHospital(hospitalId: string, requestId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Contacting hospital ${hospitalId} for request ${requestId}...`);
      return { success: true };
    } catch (error) {
      console.error('Error contacting hospital:', error);
      return { success: false, error: 'Failed to contact hospital.' };
    }
  }

  async deleteBloodRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const requestIndex = this.bloodRequests.findIndex(req => req.id === requestId);
      if (requestIndex === -1) {
        return { success: false, error: `Blood request with ID ${requestId} not found.` };
      }

      this.bloodRequests.splice(requestIndex, 1);
      this.saveToStorage();
      return { success: true };
    } catch (error) {
      console.error('Error deleting blood request:', error);
      return { success: false, error: 'Failed to delete blood request.' };
    }
  }

  async createBloodRequest(request: Omit<BloodRequest, 'id' | 'createdAt' | 'matchPercentage'>): Promise<{ success: boolean; requestId?: string }> {
    try {
      const newRequest: BloodRequest = {
        ...request,
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        matchPercentage: 0
      };

      this.bloodRequests.push(newRequest);
      this.saveToStorage();

      console.log(`🚨 GOVERNMENT ALERT: New blood request from ${request.hospital}`, newRequest);

      return { success: true, requestId: newRequest.id };
    } catch (error) {
      console.error('Error creating blood request:', error);
      return { success: false };
    }
  }
}

const mockDatabaseService = new MockDatabaseService();
export default mockDatabaseService;
