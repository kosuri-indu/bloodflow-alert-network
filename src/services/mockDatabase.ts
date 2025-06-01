import { v4 as uuidv4 } from 'uuid';

// Define data structures
interface Hospital {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  email: string;
  registrationId: string;
  createdAt: Date;
  verified: boolean;
}

interface BloodInventory {
  id: string;
  hospital: string;
  bloodType: string;
  rhFactor: string;
  units: number;
  expirationDate: Date;
  processedDate: Date;
  donorAge: number;
  specialAttributes?: string[];
}

interface BloodRequest {
  id: string;
  hospital: string;
  bloodType: string;
  units: number;
  patientAge: number;
  patientWeight: number;
  medicalCondition: string;
  urgency: 'routine' | 'urgent' | 'critical';
  neededBy: Date;
  specialRequirements?: string[];
  createdAt: Date;
  matchPercentage: number;
}

interface AiMatch {
  donorId: string;
  requestId: string;
  hospitalName: string;
  hospitalAddress: string;
  bloodType: string;
  bloodRhFactor: string;
  availableUnits: number;
  distance: number;
  matchScore: number;
  status: 'potential' | 'contacted';
  specialAttributes?: string[];
  compatibilityScore: number;
  donorAge: number;
  expiryDays: number;
  ageCompatibilityScore: number;
  medicalCompatibilityScore: number;
}

interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodType: string;
  rhFactor: string;
  age: number;
  weight: number;
  available: boolean;
  location: string;
  address: string;
  isEligible: boolean;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
  };
}

interface DonationDrive {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  organizer: string;
  targetUnits: number;
  currentUnits: number;
  bloodTypesNeeded: string[];
  registeredDonors: string[];
}

class MockDatabaseService {
  private localStorage: Storage;

  constructor() {
    this.localStorage = window.localStorage;
    
    // Initialize with empty arrays instead of pre-populated data
    if (!this.getFromStorage('hospitals')) {
      this.setInStorage('hospitals', []);
    }
    
    if (!this.getFromStorage('allBloodInventory')) {
      this.setInStorage('allBloodInventory', []);
    }
    
    if (!this.getFromStorage('allBloodRequests')) {
      this.setInStorage('allBloodRequests', []);
    }

    if (!this.getFromStorage('pendingHospitals')) {
      this.setInStorage('pendingHospitals', []);
    }

    if (!this.getFromStorage('donors')) {
      this.setInStorage('donors', []);
    }

    if (!this.getFromStorage('donationDrives')) {
      this.setInStorage('donationDrives', []);
    }
  }

  // Utility functions for local storage
  private getFromStorage(key: string): any {
    const item = this.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  private setInStorage(key: string, data: any): void {
    this.localStorage.setItem(key, JSON.stringify(data));
  }

  // Hospital management functions
  async registerHospital(hospital: Omit<Hospital, 'id' | 'createdAt' | 'verified'>): Promise<Hospital> {
    const newHospital: Hospital = {
      id: uuidv4(),
      ...hospital,
      createdAt: new Date(),
      verified: false
    };
    const pendingHospitals = this.getFromStorage('pendingHospitals') || [];
    this.setInStorage('pendingHospitals', [...pendingHospitals, newHospital]);
    console.log(`🏥 Hospital registered: ${newHospital.name}`);
    return newHospital;
  }

  async approveHospital(hospitalId: string): Promise<boolean> {
    const pendingHospitals = this.getFromStorage('pendingHospitals') || [];
    const approvedHospitalIndex = pendingHospitals.findIndex((h: Hospital) => h.id === hospitalId);
    if (approvedHospitalIndex === -1) {
      console.log(`Hospital not found in pending registrations: ${hospitalId}`);
      return false;
    }
    const approvedHospital = pendingHospitals[approvedHospitalIndex];
    approvedHospital.verified = true;
    
    // Remove from pending and add to verified hospitals
    const updatedPendingHospitals = pendingHospitals.filter((h: Hospital) => h.id !== hospitalId);
    this.setInStorage('pendingHospitals', updatedPendingHospitals);
    
    const hospitals = this.getFromStorage('hospitals') || [];
    this.setInStorage('hospitals', [...hospitals, approvedHospital]);
    
    console.log(`✅ Hospital approved: ${approvedHospital.name}`);
    return true;
  }

  async deleteHospital(hospitalId: string): Promise<{ success: boolean; error?: string }> {
    try {
      let hospitals = this.getFromStorage('hospitals') || [];
      let pendingHospitals = this.getFromStorage('pendingHospitals') || [];
      
      // Filter out the hospital to be deleted
      hospitals = hospitals.filter((hospital: Hospital) => hospital.id !== hospitalId);
      pendingHospitals = pendingHospitals.filter((hospital: Hospital) => hospital.id !== hospitalId);
      
      // Update local storage
      this.setInStorage('hospitals', hospitals);
      this.setInStorage('pendingHospitals', pendingHospitals);
      
      console.log(`❌ Hospital deleted: ${hospitalId}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting hospital ${hospitalId}:`, error);
      return { success: false, error: 'Failed to delete hospital' };
    }
  }

  async getRegisteredHospitals(): Promise<Hospital[]> {
    const hospitals = this.getFromStorage('hospitals') || [];
    return hospitals.filter((hospital: Hospital) => hospital.verified);
  }

  async getPendingHospitals(): Promise<Hospital[]> {
    const pendingHospitals = this.getFromStorage('pendingHospitals') || [];
    return pendingHospitals.filter((hospital: Hospital) => !hospital.verified);
  }

  async getAllHospitalsWithData(): Promise<{ hospital: Hospital; inventory: BloodInventory[]; requests: BloodRequest[]; }[]> {
    const hospitals = await this.getRegisteredHospitals();
    return Promise.all(
      hospitals.map(async (hospital) => {
        const inventory = await this.getHospitalBloodInventory(hospital.name);
        const requests = await this.getHospitalBloodRequests(hospital.name);
        return { hospital, inventory, requests };
      })
    );
  }

  async getAllData(): Promise<{ hospitals: Hospital[]; inventory: BloodInventory[]; requests: BloodRequest[]; }> {
    const hospitals = await this.getRegisteredHospitals();
    const inventory = await this.getBloodInventoryDetails();
    const requests = await this.getBloodRequests();
    return { hospitals, inventory, requests };
  }

  async getHospitalProfile(): Promise<Hospital> {
    // For demo purposes, return the first hospital
    const hospitals = await this.getRegisteredHospitals();
    return hospitals[0] || {
      id: 'default',
      name: 'Default Hospital',
      address: '123 Default St',
      contactPerson: 'Dr. Default',
      email: 'default@hospital.com',
      registrationId: 'DEF123',
      createdAt: new Date(),
      verified: true
    };
  }

  async verifyHospital(hospitalId: string): Promise<{ success: boolean; error?: string; hospitalName?: string }> {
    try {
      const pendingHospitals = this.getFromStorage('pendingHospitals') || [];
      const approvedHospitalIndex = pendingHospitals.findIndex((h: Hospital) => h.id === hospitalId);
      
      if (approvedHospitalIndex === -1) {
        console.log(`Hospital not found in pending registrations: ${hospitalId}`);
        return { success: false, error: 'Hospital not found in pending registrations' };
      }
      
      const approvedHospital = pendingHospitals[approvedHospitalIndex];
      approvedHospital.verified = true;
      
      // Remove from pending and add to verified hospitals
      const updatedPendingHospitals = pendingHospitals.filter((h: Hospital) => h.id !== hospitalId);
      this.setInStorage('pendingHospitals', updatedPendingHospitals);
      
      const hospitals = this.getFromStorage('hospitals') || [];
      this.setInStorage('hospitals', [...hospitals, approvedHospital]);
      
      console.log(`✅ Hospital approved: ${approvedHospital.name}`);
      return { success: true, hospitalName: approvedHospital.name };
    } catch (error) {
      console.error(`Error verifying hospital ${hospitalId}:`, error);
      return { success: false, error: 'Failed to verify hospital' };
    }
  }

  // Blood inventory functions
  async addBloodInventory(hospitalName: string, inventory: Omit<BloodInventory, 'id' | 'hospital'>): Promise<BloodInventory> {
    const newInventory: BloodInventory = {
      id: uuidv4(),
      hospital: hospitalName,
      ...inventory
    };

    const hospitalKey = `bloodInventory_${hospitalName}`;
    const existingInventory = this.getFromStorage(hospitalKey) || [];
    const updatedInventory = [...existingInventory, newInventory];
    this.setInStorage(hospitalKey, updatedInventory);

    // Also add to global inventory
    const allInventory = this.getFromStorage('allBloodInventory') || [];
    this.setInStorage('allBloodInventory', [...allInventory, newInventory]);

    console.log(`🩸 New blood inventory added: ${newInventory.bloodType} to ${hospitalName}`);

    // Trigger auto-matching for pending requests
    setTimeout(() => {
      import('./autoMatchingService').then(({ autoMatchingService }) => {
        autoMatchingService.processNewInventory(hospitalName);
      });
    }, 1000);

    return newInventory;
  }

  async getBloodInventoryDetails(): Promise<BloodInventory[]> {
    const allInventory = this.getFromStorage('allBloodInventory') || [];
    return allInventory;
  }

  async getHospitalBloodInventory(hospitalName: string): Promise<BloodInventory[]> {
    const hospitalKey = `bloodInventory_${hospitalName}`;
    const inventory = this.getFromStorage(hospitalKey) || [];
    return inventory;
  }

  // Blood request functions
  async addBloodRequest(hospitalName: string, request: Omit<BloodRequest, 'id' | 'hospital' | 'createdAt' | 'matchPercentage'>): Promise<BloodRequest> {
    const newRequest: BloodRequest = {
      id: uuidv4(),
      hospital: hospitalName,
      ...request,
      createdAt: new Date(),
      matchPercentage: 0
    };

    const hospitalKey = `bloodRequests_${hospitalName}`;
    const existingRequests = this.getFromStorage(hospitalKey) || [];
    const updatedRequests = [...existingRequests, newRequest];
    this.setInStorage(hospitalKey, updatedRequests);

    // Also add to global requests
    const allRequests = this.getFromStorage('allBloodRequests') || [];
    this.setInStorage('allBloodRequests', [...allRequests, newRequest]);

    console.log(`📋 New blood request added: ${newRequest.bloodType} for ${hospitalName}`);

    // Trigger auto-matching after a short delay
    setTimeout(() => {
      // Import the service dynamically to avoid circular dependencies
      import('./autoMatchingService').then(({ autoMatchingService }) => {
        autoMatchingService.processNewRequest(newRequest.id);
      });
    }, 1000);

    return newRequest;
  }

  async createBloodRequest(request: Omit<BloodRequest, 'id' | 'createdAt' | 'matchPercentage'>): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      const newRequest: BloodRequest = {
        id: uuidv4(),
        ...request,
        createdAt: new Date(),
        matchPercentage: 0
      };

      const hospitalKey = `bloodRequests_${request.hospital}`;
      const existingRequests = this.getFromStorage(hospitalKey) || [];
      const updatedRequests = [...existingRequests, newRequest];
      this.setInStorage(hospitalKey, updatedRequests);

      // Also add to global requests
      const allRequests = this.getFromStorage('allBloodRequests') || [];
      this.setInStorage('allBloodRequests', [...allRequests, newRequest]);

      console.log(`📋 New blood request created: ${newRequest.bloodType} for ${request.hospital}`);

      // Trigger auto-matching after a short delay
      setTimeout(() => {
        import('./autoMatchingService').then(({ autoMatchingService }) => {
          autoMatchingService.processNewRequest(newRequest.id);
        });
      }, 1000);

      return { success: true, requestId: newRequest.id };
    } catch (error) {
      console.error('Error creating blood request:', error);
      return { success: false, error: 'Failed to create blood request' };
    }
  }

  async getBloodRequests(): Promise<BloodRequest[]> {
    const allRequests = this.getFromStorage('allBloodRequests') || [];
    return allRequests;
  }

  async getHospitalBloodRequests(hospitalName: string): Promise<BloodRequest[]> {
    const hospitalKey = `bloodRequests_${hospitalName}`;
    const requests = this.getFromStorage(hospitalKey) || [];
    return requests;
  }

  async updateBloodRequest(requestId: string, updates: Partial<BloodRequest>): Promise<BloodRequest | null> {
    const allRequests = this.getFromStorage('allBloodRequests') || [];
    const requestIndex = allRequests.findIndex((req: BloodRequest) => req.id === requestId);
    
    if (requestIndex === -1) {
      console.log(`Request not found: ${requestId}`);
      return null;
    }
    
    const updatedRequest = { ...allRequests[requestIndex], ...updates };
    allRequests[requestIndex] = updatedRequest;
    this.setInStorage('allBloodRequests', allRequests);
    
    // Update hospital-specific requests as well
    const hospitalName = updatedRequest.hospital;
    const hospitalKey = `bloodRequests_${hospitalName}`;
    const hospitalRequests = this.getFromStorage(hospitalKey) || [];
    const hospitalRequestIndex = hospitalRequests.findIndex((req: BloodRequest) => req.id === requestId);
    
    if (hospitalRequestIndex !== -1) {
      hospitalRequests[hospitalRequestIndex] = updatedRequest;
      this.setInStorage(hospitalKey, hospitalRequests);
    }
    
    console.log(`Blood request updated: ${requestId}`);
    return updatedRequest;
  }

  // AI Matching simulation (simplified)
  async findPotentialMatches(requestId: string): Promise<AiMatch[]> {
    const bloodRequests = await this.getBloodRequests();
    const inventory = await this.getBloodInventoryDetails();
    const hospitals = await this.getRegisteredHospitals();
    
    const request = bloodRequests.find(req => req.id === requestId);
    if (!request) {
      console.log(`Request not found: ${requestId}`);
      return [];
    }

    const potentialMatches: AiMatch[] = [];
    inventory.forEach(inv => {
      const hospital = hospitals.find(h => h.name === inv.hospital);
      if (!hospital) return;

      if (inv.bloodType === request.bloodType.split(' ')[0] && inv.units > 0) {
        potentialMatches.push({
          donorId: hospital.id,
          requestId: request.id,
          hospitalName: hospital.name,
          hospitalAddress: hospital.address,
          bloodType: inv.bloodType,
          bloodRhFactor: inv.rhFactor,
          availableUnits: inv.units,
          distance: Math.floor(Math.random() * 100),
          matchScore: Math.floor(Math.random() * 100),
          status: 'potential',
          compatibilityScore: 75,
          donorAge: inv.donorAge,
          expiryDays: 30,
          ageCompatibilityScore: 90,
          medicalCompatibilityScore: 95
        });
      }
    });

    return potentialMatches;
  }

  async contactHospital(hospitalId: string, requestId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate contacting the hospital
      console.log(`📞 Contacting hospital ${hospitalId} for request ${requestId}`);
      return { success: true };
    } catch (error) {
      console.error(`Error contacting hospital ${hospitalId}:`, error);
      return { success: false, error: 'Failed to contact hospital' };
    }
  }

  // Donor management functions
  async getDonors(): Promise<Donor[]> {
    const donors = this.getFromStorage('donors') || [];
    return donors;
  }

  async registerDonor(donor: Omit<Donor, 'id'>): Promise<Donor> {
    const newDonor: Donor = {
      id: uuidv4(),
      ...donor
    };
    const donors = this.getFromStorage('donors') || [];
    this.setInStorage('donors', [...donors, newDonor]);
    console.log(`🩸 New donor registered: ${newDonor.name}`);
    return newDonor;
  }

  // Donation drive functions
  async getDonationDrives(): Promise<DonationDrive[]> {
    const drives = this.getFromStorage('donationDrives') || [];
    return drives;
  }

  async registerForDonationDrive(driveId: string, donorId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const drives = this.getFromStorage('donationDrives') || [];
      const driveIndex = drives.findIndex((drive: DonationDrive) => drive.id === driveId);
      
      if (driveIndex === -1) {
        return { success: false, error: 'Donation drive not found' };
      }
      
      const drive = drives[driveIndex];
      if (!drive.registeredDonors.includes(donorId)) {
        drive.registeredDonors.push(donorId);
        this.setInStorage('donationDrives', drives);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error registering for donation drive:', error);
      return { success: false, error: 'Failed to register for donation drive' };
    }
  }
}

const mockDatabaseService = new MockDatabaseService();
export default mockDatabaseService;
export type { Hospital, BloodInventory, BloodRequest, AiMatch, Donor, DonationDrive };
