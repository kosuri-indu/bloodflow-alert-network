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

interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodType: string;
  rhFactor: string;
  age: number;
  weight: number;
  address: string;
  lastDonation?: Date;
  isEligible: boolean;
  createdAt: Date;
  notificationPreferences: {
    urgentRequests: boolean;
    donationDrives: boolean;
    general: boolean;
  };
}

interface DonationDrive {
  id: string;
  organizerName: string;
  organizerEmail: string;
  eventName: string;
  description: string;
  date: Date;
  location: string;
  targetBloodTypes: string[];
  expectedDonors: number;
  registeredDonors: number;
  status: 'upcoming' | 'active' | 'completed';
  createdAt: Date;
}

interface MonetaryDonation {
  id: string;
  donorId: string;
  donorName: string;
  amount: number;
  currency: string;
  purpose: string;
  createdAt: Date;
  status: 'pending' | 'completed' | 'failed';
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

class MockDatabaseService {
  private localStorage: Storage;

  constructor() {
    this.localStorage = window.localStorage;
    
    // Initialize with empty data - user will add their own
    if (!this.getFromStorage('hospitals')) {
      this.setInStorage('hospitals', []);
    }
    
    if (!this.getFromStorage('allBloodInventory')) {
      this.setInStorage('allBloodInventory', []);
    }
    
    if (!this.getFromStorage('allBloodRequests')) {
      this.setInStorage('allBloodRequests', []);
    }

    if (!this.getFromStorage('donors')) {
      this.setInStorage('donors', []);
    }

    if (!this.getFromStorage('donationDrives')) {
      this.setInStorage('donationDrives', []);
    }

    if (!this.getFromStorage('monetaryDonations')) {
      this.setInStorage('monetaryDonations', []);
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

  async getAllData(): Promise<{ hospitals: Hospital[]; inventory: BloodInventory[]; requests: BloodRequest[]; donors: Donor[]; }> {
    const hospitals = await this.getRegisteredHospitals();
    const inventory = await this.getBloodInventoryDetails();
    const requests = await this.getBloodRequests();
    const donors = await this.getDonors();
    return { hospitals, inventory, requests, donors };
  }

  async getHospitalProfile(): Promise<Hospital> {
    // For demo purposes, return the first hospital or a default
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
      this.triggerAutoMatching();
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

    // Trigger auto-matching and donor notifications
    setTimeout(() => {
      this.triggerAutoMatching();
      this.notifyDonors(newRequest);
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

      // Trigger auto-matching and donor notifications
      setTimeout(() => {
        this.triggerAutoMatching();
        this.notifyDonors(newRequest);
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

  // Donor management functions
  async registerDonor(donor: Omit<Donor, 'id' | 'createdAt'>): Promise<Donor> {
    const newDonor: Donor = {
      id: uuidv4(),
      ...donor,
      createdAt: new Date()
    };

    const donors = this.getFromStorage('donors') || [];
    this.setInStorage('donors', [...donors, newDonor]);

    console.log(`👤 New donor registered: ${newDonor.name} (${newDonor.bloodType}${newDonor.rhFactor === 'positive' ? '+' : '-'})`);
    return newDonor;
  }

  async getDonors(): Promise<Donor[]> {
    return this.getFromStorage('donors') || [];
  }

  async getEligibleDonorsByBloodType(bloodType: string, rhFactor: string): Promise<Donor[]> {
    const donors = await this.getDonors();
    return donors.filter((donor: Donor) => 
      donor.isEligible && 
      donor.bloodType === bloodType && 
      donor.rhFactor === rhFactor &&
      donor.notificationPreferences.urgentRequests
    );
  }

  // Donation Drive functions
  async createDonationDrive(drive: Omit<DonationDrive, 'id' | 'createdAt' | 'registeredDonors'>): Promise<DonationDrive> {
    const newDrive: DonationDrive = {
      id: uuidv4(),
      ...drive,
      registeredDonors: 0,
      createdAt: new Date()
    };

    const drives = this.getFromStorage('donationDrives') || [];
    this.setInStorage('donationDrives', [...drives, newDrive]);

    console.log(`🎪 New donation drive created: ${newDrive.eventName}`);
    return newDrive;
  }

  async getDonationDrives(): Promise<DonationDrive[]> {
    return this.getFromStorage('donationDrives') || [];
  }

  async registerForDonationDrive(driveId: string, donorId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const drives = this.getFromStorage('donationDrives') || [];
      const driveIndex = drives.findIndex((drive: DonationDrive) => drive.id === driveId);
      
      if (driveIndex === -1) {
        return { success: false, error: 'Donation drive not found' };
      }

      drives[driveIndex].registeredDonors += 1;
      this.setInStorage('donationDrives', drives);

      console.log(`Donor ${donorId} registered for drive ${driveId}`);
      return { success: true };
    } catch (error) {
      console.error('Error registering for donation drive:', error);
      return { success: false, error: 'Failed to register for donation drive' };
    }
  }

  // Monetary donation functions
  async createMonetaryDonation(donation: Omit<MonetaryDonation, 'id' | 'createdAt' | 'status'>): Promise<MonetaryDonation> {
    const newDonation: MonetaryDonation = {
      id: uuidv4(),
      ...donation,
      status: 'pending',
      createdAt: new Date()
    };

    const donations = this.getFromStorage('monetaryDonations') || [];
    this.setInStorage('monetaryDonations', [...donations, newDonation]);

    console.log(`💰 New monetary donation: $${newDonation.amount} from ${newDonation.donorName}`);
    return newDonation;
  }

  async getMonetaryDonations(): Promise<MonetaryDonation[]> {
    return this.getFromStorage('monetaryDonations') || [];
  }

  async getDonorMonetaryDonations(donorId: string): Promise<MonetaryDonation[]> {
    const donations = await this.getMonetaryDonations();
    return donations.filter(d => d.donorId === donorId);
  }

  // Notification functions
  async notifyDonorsOfUrgentRequest(requestId: string): Promise<void> {
    const requests = await this.getBloodRequests();
    const request = requests.find(r => r.id === requestId);
    
    if (!request || request.urgency !== 'critical') return;
    
    const requestBloodType = request.bloodType.split(' ')[0];
    const rhFactor = request.bloodType.includes('+') ? 'positive' : 'negative';
    
    const eligibleDonors = await this.getEligibleDonorsByBloodType(requestBloodType, rhFactor);
    
    if (eligibleDonors.length > 0) {
      console.log(`🚨 Notifying ${eligibleDonors.length} eligible donors about critical request for ${request.bloodType}`);
      // Here you would send actual notifications
    }
  }

  async sendDonationDriveReminders(): Promise<void> {
    const drives = await this.getDonationDrives();
    const upcomingDrives = drives.filter(d => d.status === 'upcoming' && new Date(d.date) > new Date());
    
    console.log(`📢 Sending reminders for ${upcomingDrives.length} upcoming donation drives`);
    // Here you would send actual notifications
  }

  // AI Matching simulation with enhanced logic
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
    const requestBloodType = request.bloodType.split(' ')[0];
    
    inventory.forEach(inv => {
      const hospital = hospitals.find(h => h.name === inv.hospital);
      if (!hospital || inv.hospital === request.hospital) return;

      // Enhanced blood compatibility checking
      const isCompatible = this.checkBloodCompatibility(requestBloodType, inv.bloodType, inv.rhFactor);
      
      if (isCompatible && inv.units > 0) {
        const distance = Math.floor(Math.random() * 100) + 1;
        const expiryDays = Math.floor((inv.expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculate comprehensive match score
        const matchScore = this.calculateMatchScore(request, inv, distance, expiryDays);
        
        potentialMatches.push({
          donorId: hospital.id,
          requestId: request.id,
          hospitalName: hospital.name,
          hospitalAddress: hospital.address,
          bloodType: inv.bloodType,
          bloodRhFactor: inv.rhFactor,
          availableUnits: inv.units,
          distance,
          matchScore,
          status: 'potential',
          specialAttributes: inv.specialAttributes,
          compatibilityScore: 85 + Math.floor(Math.random() * 15),
          donorAge: inv.donorAge,
          expiryDays,
          ageCompatibilityScore: this.calculateAgeCompatibility(request.patientAge, inv.donorAge),
          medicalCompatibilityScore: this.calculateMedicalCompatibility(request, inv)
        });
      }
    });

    // Sort by match score descending
    return potentialMatches.sort((a, b) => b.matchScore - a.matchScore);
  }

  private checkBloodCompatibility(requestType: string, inventoryType: string, rhFactor: string): boolean {
    // Basic blood type compatibility matrix
    const compatibility: { [key: string]: string[] } = {
      'O': ['O', 'A', 'B', 'AB'],
      'A': ['A', 'AB'],
      'B': ['B', 'AB'],
      'AB': ['AB']
    };

    return compatibility[inventoryType]?.includes(requestType) || false;
  }

  private calculateMatchScore(request: BloodRequest, inventory: BloodInventory, distance: number, expiryDays: number): number {
    let score = 100;

    // Distance penalty (closer is better)
    score -= Math.floor(distance / 10);

    // Urgency bonus
    if (request.urgency === 'critical') score += 20;
    else if (request.urgency === 'urgent') score += 10;

    // Expiry penalty (fresher is better, but penalize very close expiry)
    if (expiryDays < 7) score -= 30;
    else if (expiryDays < 14) score -= 10;

    // Special requirements match
    if (request.specialRequirements && inventory.specialAttributes) {
      const matchingAttributes = request.specialRequirements.filter(req => 
        inventory.specialAttributes?.includes(req)
      );
      score += matchingAttributes.length * 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateAgeCompatibility(patientAge: number, donorAge: number): number {
    const ageDiff = Math.abs(patientAge - donorAge);
    return Math.max(50, 100 - ageDiff);
  }

  private calculateMedicalCompatibility(request: BloodRequest, inventory: BloodInventory): number {
    // Basic medical compatibility based on condition and special attributes
    let score = 85;
    
    if (request.medicalCondition.toLowerCase().includes('cancer') && 
        inventory.specialAttributes?.includes('irradiated')) {
      score += 15;
    }
    
    if (request.medicalCondition.toLowerCase().includes('immune') && 
        inventory.specialAttributes?.includes('cmv-negative')) {
      score += 10;
    }

    return Math.min(100, score);
  }

  private async triggerAutoMatching(): Promise<void> {
    console.log('🤖 Triggering auto-matching for new inventory/requests...');
    // This would trigger the auto-matching service
  }

  private async notifyDonors(request: BloodRequest): Promise<void> {
    const requestBloodType = request.bloodType.split(' ')[0];
    const rhFactor = request.bloodType.includes('+') ? 'positive' : 'negative';
    
    const eligibleDonors = await this.getEligibleDonorsByBloodType(requestBloodType, rhFactor);
    
    if (eligibleDonors.length > 0 && request.urgency === 'critical') {
      console.log(`🚨 Notifying ${eligibleDonors.length} eligible donors about critical request for ${request.bloodType}`);
      // Here you would send actual notifications
    }
  }

  async contactHospital(hospitalId: string, requestId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📞 Contacting hospital ${hospitalId} for request ${requestId}`);
      return { success: true };
    } catch (error) {
      console.error(`Error contacting hospital ${hospitalId}:`, error);
      return { success: false, error: 'Failed to contact hospital' };
    }
  }
}

const mockDatabaseService = new MockDatabaseService();
export default mockDatabaseService;
export type { Hospital, BloodInventory, BloodRequest, AiMatch, Donor, DonationDrive, MonetaryDonation };
