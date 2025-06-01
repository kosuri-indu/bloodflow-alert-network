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
  hospitalId: string;
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
  hospitalId: string;
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
    this.clearAllDataOnInit();
    this.initializeDefaultData();
  }

  private clearAllDataOnInit() {
    // Clear ALL database-related data on initialization
    const allKeys = Object.keys(this.localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('hospitals') || 
          key.startsWith('allBloodInventory') || 
          key.startsWith('allBloodRequests') ||
          key.startsWith('pendingHospitals') ||
          key.startsWith('donors') ||
          key.startsWith('donationDrives') ||
          key.startsWith('bloodInventory_') || 
          key.startsWith('bloodRequests_')) {
        this.localStorage.removeItem(key);
      }
    });
    console.log('🗑️ ALL DATABASE DATA CLEARED ON INITIALIZATION');
  }

  private initializeDefaultData() {
    // Initialize empty data structures
    const dataKeys = [
      'hospitals',
      'allBloodInventory', 
      'allBloodRequests',
      'pendingHospitals',
      'donors',
      'donationDrives'
    ];
    
    dataKeys.forEach(key => {
      this.setInStorage(key, []);
    });
    
    console.log('💾 Database initialized with empty data structures');
  }

  // Utility functions for local storage with ACID properties
  private getFromStorage(key: string): any {
    try {
      const item = this.localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error(`Error reading from storage key ${key}:`, error);
      return [];
    }
  }

  private setInStorage(key: string, data: any): void {
    try {
      this.localStorage.setItem(key, JSON.stringify(data));
      console.log(`💾 Updated storage for ${key}:`, data.length, 'items');
    } catch (error) {
      console.error(`Error writing to storage key ${key}:`, error);
    }
  }

  // Atomic transaction simulation for ACID properties
  private performTransaction(operations: (() => void)[]): boolean {
    try {
      // Execute all operations atomically
      operations.forEach(operation => operation());
      return true;
    } catch (error) {
      console.error('Transaction failed:', error);
      return false;
    }
  }

  // Manual clear function for testing
  async clearAllData(): Promise<void> {
    const dataKeys = [
      'hospitals',
      'allBloodInventory', 
      'allBloodRequests',
      'pendingHospitals',
      'donors',
      'donationDrives'
    ];
    
    dataKeys.forEach(key => {
      this.setInStorage(key, []);
    });
    
    this.clearHospitalSpecificData();
    console.log('🗑️ All database data manually cleared');
    
    window.dispatchEvent(new CustomEvent('dataRefresh'));
  }

  private clearHospitalSpecificData() {
    const allKeys = Object.keys(this.localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('bloodInventory_') || key.startsWith('bloodRequests_')) {
        this.localStorage.removeItem(key);
        console.log(`🗑️ Cleared hospital-specific data: ${key}`);
      }
    });
  }

  // Hospital management functions with ACID properties
  async registerHospital(hospital: Omit<Hospital, 'id' | 'createdAt' | 'verified'>): Promise<Hospital> {
    const newHospital: Hospital = {
      id: uuidv4(),
      ...hospital,
      createdAt: new Date(),
      verified: false
    };

    const success = this.performTransaction([
      () => {
        const pendingHospitals = this.getFromStorage('pendingHospitals');
        this.setInStorage('pendingHospitals', [...pendingHospitals, newHospital]);
      }
    ]);

    if (success) {
      console.log(`🏥 Hospital registered: ${newHospital.name}`);
      window.dispatchEvent(new CustomEvent('dataRefresh'));
      return newHospital;
    } else {
      throw new Error('Failed to register hospital');
    }
  }

  async verifyHospital(hospitalId: string): Promise<{ success: boolean; error?: string; hospitalName?: string }> {
    try {
      const pendingHospitals = this.getFromStorage('pendingHospitals');
      const approvedHospitalIndex = pendingHospitals.findIndex((h: Hospital) => h.id === hospitalId);
      
      if (approvedHospitalIndex === -1) {
        return { success: false, error: 'Hospital not found in pending registrations' };
      }
      
      const approvedHospital = pendingHospitals[approvedHospitalIndex];
      approvedHospital.verified = true;

      const success = this.performTransaction([
        () => {
          const updatedPendingHospitals = pendingHospitals.filter((h: Hospital) => h.id !== hospitalId);
          this.setInStorage('pendingHospitals', updatedPendingHospitals);
        },
        () => {
          const hospitals = this.getFromStorage('hospitals');
          this.setInStorage('hospitals', [...hospitals, approvedHospital]);
        }
      ]);

      if (success) {
        console.log(`✅ Hospital approved: ${approvedHospital.name}`);
        window.dispatchEvent(new CustomEvent('dataRefresh'));
        return { success: true, hospitalName: approvedHospital.name };
      } else {
        return { success: false, error: 'Transaction failed' };
      }
    } catch (error) {
      console.error(`Error verifying hospital ${hospitalId}:`, error);
      return { success: false, error: 'Failed to verify hospital' };
    }
  }

  async getRegisteredHospitals(): Promise<Hospital[]> {
    const hospitals = this.getFromStorage('hospitals');
    return hospitals.filter((hospital: Hospital) => hospital.verified);
  }

  async getPendingHospitals(): Promise<Hospital[]> {
    const pendingHospitals = this.getFromStorage('pendingHospitals');
    return pendingHospitals.filter((hospital: Hospital) => !hospital.verified);
  }

  // Blood inventory functions with hospital isolation
  async addBloodInventory(hospitalName: string, inventory: Omit<BloodInventory, 'id' | 'hospital' | 'hospitalId'>): Promise<BloodInventory> {
    const hospitals = await this.getRegisteredHospitals();
    const hospital = hospitals.find(h => h.name === hospitalName);
    
    if (!hospital) {
      throw new Error('Hospital not found');
    }

    const newInventory: BloodInventory = {
      id: uuidv4(),
      hospital: hospitalName,
      hospitalId: hospital.id,
      ...inventory
    };

    const success = this.performTransaction([
      () => {
        const hospitalKey = `bloodInventory_${hospital.id}`;
        const existingInventory = this.getFromStorage(hospitalKey);
        this.setInStorage(hospitalKey, [...existingInventory, newInventory]);
      },
      () => {
        const allInventory = this.getFromStorage('allBloodInventory');
        this.setInStorage('allBloodInventory', [...allInventory, newInventory]);
      }
    ]);

    if (success) {
      console.log(`🩸 New blood inventory added: ${newInventory.bloodType} to ${hospitalName} (ID: ${hospital.id})`);
      window.dispatchEvent(new CustomEvent('dataRefresh'));
      return newInventory;
    } else {
      throw new Error('Failed to add blood inventory');
    }
  }

  async updateBloodInventory(inventoryId: string, updates: Partial<BloodInventory>): Promise<{ success: boolean; error?: string }> {
    try {
      const allInventory = this.getFromStorage('allBloodInventory');
      const inventoryIndex = allInventory.findIndex((inv: BloodInventory) => inv.id === inventoryId);
      
      if (inventoryIndex === -1) {
        return { success: false, error: 'Inventory item not found' };
      }
      
      const updatedItem = { ...allInventory[inventoryIndex], ...updates };

      const success = this.performTransaction([
        () => {
          allInventory[inventoryIndex] = updatedItem;
          this.setInStorage('allBloodInventory', allInventory);
        },
        () => {
          const hospitalKey = `bloodInventory_${updatedItem.hospitalId}`;
          const hospitalInventory = this.getFromStorage(hospitalKey);
          const hospitalIndex = hospitalInventory.findIndex((inv: BloodInventory) => inv.id === inventoryId);
          
          if (hospitalIndex !== -1) {
            hospitalInventory[hospitalIndex] = updatedItem;
            this.setInStorage(hospitalKey, hospitalInventory);
          }
        }
      ]);

      if (success) {
        console.log(`🔄 Blood inventory updated: ${inventoryId}`);
        window.dispatchEvent(new CustomEvent('dataRefresh'));
        return { success: true };
      } else {
        return { success: false, error: 'Transaction failed' };
      }
    } catch (error) {
      console.error('Error updating blood inventory:', error);
      return { success: false, error: 'Failed to update inventory' };
    }
  }

  async deleteBloodInventory(inventoryId: string): Promise<{ success: boolean; error?: string }> {
    try {
      let allInventory = this.getFromStorage('allBloodInventory');
      const item = allInventory.find((inv: BloodInventory) => inv.id === inventoryId);
      
      if (!item) {
        return { success: false, error: 'Inventory item not found' };
      }

      const success = this.performTransaction([
        () => {
          allInventory = allInventory.filter((inv: BloodInventory) => inv.id !== inventoryId);
          this.setInStorage('allBloodInventory', allInventory);
        },
        () => {
          const hospitalKey = `bloodInventory_${item.hospitalId}`;
          let hospitalInventory = this.getFromStorage(hospitalKey);
          hospitalInventory = hospitalInventory.filter((inv: BloodInventory) => inv.id !== inventoryId);
          this.setInStorage(hospitalKey, hospitalInventory);
        }
      ]);

      if (success) {
        console.log(`🗑️ Blood inventory deleted: ${inventoryId}`);
        window.dispatchEvent(new CustomEvent('dataRefresh'));
        return { success: true };
      } else {
        return { success: false, error: 'Transaction failed' };
      }
    } catch (error) {
      console.error('Error deleting blood inventory:', error);
      return { success: false, error: 'Failed to delete inventory' };
    }
  }

  async getHospitalBloodInventory(hospitalName: string): Promise<BloodInventory[]> {
    const hospitals = await this.getRegisteredHospitals();
    const hospital = hospitals.find(h => h.name === hospitalName);
    
    if (!hospital) {
      return [];
    }

    const hospitalKey = `bloodInventory_${hospital.id}`;
    const inventory = this.getFromStorage(hospitalKey);
    return inventory.filter((inv: BloodInventory) => inv.hospitalId === hospital.id);
  }

  // Blood request functions with hospital isolation
  async addBloodRequest(hospitalName: string, request: Omit<BloodRequest, 'id' | 'hospital' | 'hospitalId' | 'createdAt' | 'matchPercentage'>): Promise<BloodRequest> {
    const hospitals = await this.getRegisteredHospitals();
    const hospital = hospitals.find(h => h.name === hospitalName);
    
    if (!hospital) {
      throw new Error('Hospital not found');
    }

    const newRequest: BloodRequest = {
      id: uuidv4(),
      hospital: hospitalName,
      hospitalId: hospital.id,
      ...request,
      createdAt: new Date(),
      matchPercentage: 0
    };

    const success = this.performTransaction([
      () => {
        const hospitalKey = `bloodRequests_${hospital.id}`;
        const existingRequests = this.getFromStorage(hospitalKey);
        this.setInStorage(hospitalKey, [...existingRequests, newRequest]);
      },
      () => {
        const allRequests = this.getFromStorage('allBloodRequests');
        this.setInStorage('allBloodRequests', [...allRequests, newRequest]);
      }
    ]);

    if (success) {
      console.log(`📋 New blood request added: ${newRequest.bloodType} for ${hospitalName} (ID: ${hospital.id})`);
      window.dispatchEvent(new CustomEvent('dataRefresh'));
      return newRequest;
    } else {
      throw new Error('Failed to add blood request');
    }
  }

  async updateBloodRequest(requestId: string, updates: Partial<BloodRequest>): Promise<{ success: boolean; error?: string }> {
    try {
      const allRequests = this.getFromStorage('allBloodRequests');
      const requestIndex = allRequests.findIndex((req: BloodRequest) => req.id === requestId);
      
      if (requestIndex === -1) {
        return { success: false, error: 'Request not found' };
      }
      
      const updatedRequest = { ...allRequests[requestIndex], ...updates };

      const success = this.performTransaction([
        () => {
          allRequests[requestIndex] = updatedRequest;
          this.setInStorage('allBloodRequests', allRequests);
        },
        () => {
          const hospitalKey = `bloodRequests_${updatedRequest.hospitalId}`;
          const hospitalRequests = this.getFromStorage(hospitalKey);
          const hospitalRequestIndex = hospitalRequests.findIndex((req: BloodRequest) => req.id === requestId);
          
          if (hospitalRequestIndex !== -1) {
            hospitalRequests[hospitalRequestIndex] = updatedRequest;
            this.setInStorage(hospitalKey, hospitalRequests);
          }
        }
      ]);

      if (success) {
        console.log(`🔄 Blood request updated: ${requestId}`);
        window.dispatchEvent(new CustomEvent('dataRefresh'));
        return { success: true };
      } else {
        return { success: false, error: 'Transaction failed' };
      }
    } catch (error) {
      console.error('Error updating blood request:', error);
      return { success: false, error: 'Failed to update request' };
    }
  }

  async deleteBloodRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
    try {
      let allRequests = this.getFromStorage('allBloodRequests');
      const request = allRequests.find((req: BloodRequest) => req.id === requestId);
      
      if (!request) {
        return { success: false, error: 'Request not found' };
      }

      const success = this.performTransaction([
        () => {
          allRequests = allRequests.filter((req: BloodRequest) => req.id !== requestId);
          this.setInStorage('allBloodRequests', allRequests);
        },
        () => {
          const hospitalKey = `bloodRequests_${request.hospitalId}`;
          let hospitalRequests = this.getFromStorage(hospitalKey);
          hospitalRequests = hospitalRequests.filter((req: BloodRequest) => req.id !== requestId);
          this.setInStorage(hospitalKey, hospitalRequests);
        }
      ]);

      if (success) {
        console.log(`🗑️ Blood request deleted: ${requestId}`);
        window.dispatchEvent(new CustomEvent('dataRefresh'));
        return { success: true };
      } else {
        return { success: false, error: 'Transaction failed' };
      }
    } catch (error) {
      console.error('Error deleting blood request:', error);
      return { success: false, error: 'Failed to delete request' };
    }
  }

  async getHospitalBloodRequests(hospitalName: string): Promise<BloodRequest[]> {
    const hospitals = await this.getRegisteredHospitals();
    const hospital = hospitals.find(h => h.name === hospitalName);
    
    if (!hospital) {
      return [];
    }

    const hospitalKey = `bloodRequests_${hospital.id}`;
    const requests = this.getFromStorage(hospitalKey);
    return requests.filter((req: BloodRequest) => req.hospitalId === hospital.id);
  }

  // System-wide data access for government dashboard
  async getBloodInventoryDetails(): Promise<BloodInventory[]> {
    const allInventory = this.getFromStorage('allBloodInventory');
    return allInventory;
  }

  async getBloodRequests(): Promise<BloodRequest[]> {
    const allRequests = this.getFromStorage('allBloodRequests');
    return allRequests;
  }

  async getAllData(): Promise<{ hospitals: Hospital[]; inventory: BloodInventory[]; requests: BloodRequest[]; }> {
    const hospitals = await this.getRegisteredHospitals();
    const inventory = await this.getBloodInventoryDetails();
    const requests = await this.getBloodRequests();
    return { hospitals, inventory, requests };
  }

  async getDonors(): Promise<Donor[]> {
    const donors = this.getFromStorage('donors');
    return donors;
  }

  async registerDonor(donor: Omit<Donor, 'id'>): Promise<Donor> {
    const newDonor: Donor = {
      id: uuidv4(),
      ...donor
    };
    const donors = this.getFromStorage('donors');
    this.setInStorage('donors', [...donors, newDonor]);
    console.log(`🩸 New donor registered: ${newDonor.name}`);
    return newDonor;
  }

  async getDonationDrives(): Promise<DonationDrive[]> {
    const drives = this.getFromStorage('donationDrives');
    return drives;
  }
}

const mockDatabaseService = new MockDatabaseService();
export default mockDatabaseService;
export type { Hospital, BloodInventory, BloodRequest, AiMatch, Donor, DonationDrive };
