
import { v4 as uuidv4 } from 'uuid';

export interface Hospital {
  id: string;
  name: string;
  email: string;
  contactPerson: string;
  registrationId: string;
  address: string;
  verified?: boolean;
}

export interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodType: string;
  rhFactor: string;
  age: number;
  weight: number;
  address: string;
  isEligible: boolean;
  notificationPreferences: {
    urgentRequests: boolean;
    donationDrives: boolean;
    general: boolean;
  };
}

export interface BloodRequest {
  id: string;
  hospital: string;
  bloodType: string;
  units: number;
  urgency: 'critical' | 'urgent' | 'routine';
  neededBy: Date;
  medicalCondition: string;
  patientAge: number;
  patientWeight?: number;
  specialRequirements?: string[];
  matchPercentage?: number;
}

export interface BloodInventory {
  id: string;
  hospital: string;
  bloodType: string;
  rhFactor: 'positive' | 'negative';
  units: number;
  donorAge: number;
  expirationDate: Date;
  specialAttributes?: string[];
}

export interface InventoryItem {
  id: string;
  hospitalId: string;
  bloodType: string;
  units: number;
  lastUpdated: Date;
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
  status: 'potential' | 'contacted';
  specialAttributes?: string[];
  compatibilityScore?: number;
  donorAge: number;
  expiryDays: number;
  ageCompatibilityScore?: number;
  medicalCompatibilityScore?: number;
}

export interface DonationDrive {
  id: string;
  eventName: string;
  description: string;
  organizerName: string;
  date: Date;
  location: string;
  targetBloodTypes: string[];
  expectedDonors: number;
  registeredDonors: number;
  status: 'upcoming' | 'active' | 'completed';
}

export interface Transaction {
  id: string;
  donorId: string;
  hospitalId: string;
  bloodType: string;
  units: number;
  transactionDate: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'blood_request' | 'donation_drive' | 'general';
  message: string;
  timestamp: Date;
  isRead: boolean;
}

class MockDatabaseService {
  private data = {
    hospitals: [] as Hospital[],
    donors: [] as Donor[],
    bloodRequests: [] as BloodRequest[],
    inventory: [] as InventoryItem[],
    bloodInventoryDetails: [] as BloodInventory[],
    donationDrives: [] as DonationDrive[],
    transactions: [] as Transaction[],
    notifications: [] as Notification[],
  };

  private governmentCredentials = {
    email: 'admin@health.gov',
    password: 'admin123'
  };

  private simulateDelay = (ms: number = 500) =>
    new Promise(resolve => setTimeout(resolve, ms));

  generateRandomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  async getAllData() {
    await this.simulateDelay();
    return { ...this.data };
  }

  async getRegisteredHospitals(): Promise<Hospital[]> {
    await this.simulateDelay();
    return [...this.data.hospitals];
  }

  async getPendingHospitals(): Promise<Hospital[]> {
    await this.simulateDelay();
    return this.data.hospitals.filter(h => !h.verified);
  }

  async getAllHospitalsWithData(): Promise<Hospital[]> {
    await this.simulateDelay();
    return [...this.data.hospitals];
  }

  async getHospitalProfile(hospitalId: string): Promise<Hospital | null> {
    await this.simulateDelay();
    return this.data.hospitals.find(h => h.id === hospitalId) || null;
  }

  async getDonors(): Promise<Donor[]> {
    await this.simulateDelay();
    return [...this.data.donors];
  }

  async getBloodRequests(): Promise<BloodRequest[]> {
    await this.simulateDelay();
    return [...this.data.bloodRequests];
  }

  async getHospitalBloodRequests(hospitalName: string): Promise<BloodRequest[]> {
    await this.simulateDelay();
    return this.data.bloodRequests.filter(req => req.hospital === hospitalName);
  }

  async getInventory(): Promise<InventoryItem[]> {
    await this.simulateDelay();
    return [...this.data.inventory];
  }

  async getBloodInventoryDetails(): Promise<BloodInventory[]> {
    await this.simulateDelay();
    return [...this.data.bloodInventoryDetails];
  }

  async getHospitalBloodInventory(hospitalName: string): Promise<BloodInventory[]> {
    await this.simulateDelay();
    return this.data.bloodInventoryDetails.filter(inv => inv.hospital === hospitalName);
  }

  async getDonationDrives(): Promise<DonationDrive[]> {
    await this.simulateDelay();
    return [...this.data.donationDrives];
  }

  async getTransactions(): Promise<Transaction[]> {
    await this.simulateDelay();
    return [...this.data.transactions];
  }

  async getNotifications(): Promise<Notification[]> {
    await this.simulateDelay();
    return [...this.data.notifications];
  }

  async registerHospital(hospitalData: Omit<Hospital, 'id' | 'verified'>): Promise<{ success: boolean; error?: string }> {
    try {
      await this.simulateDelay();
      const newHospital: Hospital = {
        id: uuidv4(),
        ...hospitalData,
        verified: false
      };
      this.data.hospitals.push(newHospital);
      return { success: true };
    } catch (error: any) {
      console.error("Error registering hospital:", error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  }

  async registerDonor(donorData: Omit<Donor, 'id'>): Promise<{ success: boolean; error?: string }> {
    try {
      await this.simulateDelay();
      const newDonor: Donor = {
        id: uuidv4(),
        ...donorData,
      };
      this.data.donors.push(newDonor);
      return { success: true };
    } catch (error: any) {
      console.error("Error registering donor:", error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  }

  async verifyHospital(hospitalId: string): Promise<{ success: boolean; hospitalName?: string; error?: string }> {
    try {
      await this.simulateDelay();
      const hospital = this.data.hospitals.find(h => h.id === hospitalId);
      if (!hospital) {
        return { success: false, error: 'Hospital not found' };
      }
      hospital.verified = true;
      return { success: true, hospitalName: hospital.name };
    } catch (error: any) {
      console.error("Error verifying hospital:", error);
      return { success: false, error: error.message || 'Failed to verify hospital' };
    }
  }

  async deleteHospital(hospitalId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.simulateDelay();
      const index = this.data.hospitals.findIndex(h => h.id === hospitalId);
      if (index === -1) {
        return { success: false, error: 'Hospital not found' };
      }
      this.data.hospitals.splice(index, 1);
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting hospital:", error);
      return { success: false, error: error.message || 'Failed to delete hospital' };
    }
  }

  async createBloodRequest(requestData: Omit<BloodRequest, 'id'>): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      await this.simulateDelay();
      const newRequest: BloodRequest = {
        id: uuidv4(),
        ...requestData,
        matchPercentage: 0
      };
      this.data.bloodRequests.push(newRequest);
      return { success: true, requestId: newRequest.id };
    } catch (error: any) {
      console.error("Error creating blood request:", error);
      return { success: false, error: error.message || 'Failed to create blood request' };
    }
  }

  async updateBloodRequest(requestId: string, updates: Partial<BloodRequest>): Promise<{ success: boolean; error?: string }> {
    try {
      await this.simulateDelay();
      const requestIndex = this.data.bloodRequests.findIndex(req => req.id === requestId);
      if (requestIndex === -1) {
        return { success: false, error: 'Blood request not found' };
      }
      this.data.bloodRequests[requestIndex] = { ...this.data.bloodRequests[requestIndex], ...updates };
      return { success: true };
    } catch (error: any) {
      console.error("Error updating blood request:", error);
      return { success: false, error: error.message || 'Failed to update blood request' };
    }
  }

  async updateInventory(hospitalId: string, bloodType: string, units: number): Promise<{ success: boolean; error?: string }> {
    try {
      await this.simulateDelay();
      const inventoryItem = this.data.inventory.find(item => item.hospitalId === hospitalId && item.bloodType === bloodType);
      if (inventoryItem) {
        inventoryItem.units += units;
        inventoryItem.lastUpdated = new Date();
      } else {
        const newItem: InventoryItem = {
          id: uuidv4(),
          hospitalId: hospitalId,
          bloodType: bloodType,
          units: units,
          lastUpdated: new Date()
        };
        this.data.inventory.push(newItem);
      }
      return { success: true };
    } catch (error: any) {
      console.error("Error updating inventory:", error);
      return { success: false, error: error.message || 'Failed to update inventory' };
    }
  }

  async addBloodInventory(inventoryData: Omit<BloodInventory, 'id'>): Promise<{ success: boolean; error?: string }> {
    try {
      await this.simulateDelay();
      const newInventory: BloodInventory = {
        id: uuidv4(),
        ...inventoryData,
      };
      this.data.bloodInventoryDetails.push(newInventory);
      return { success: true };
    } catch (error: any) {
      console.error("Error adding blood inventory:", error);
      return { success: false, error: error.message || 'Failed to add blood inventory' };
    }
  }

  async contactHospital(hospitalId: string, requestId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.simulateDelay();
      // Simulate hospital contact logic
      console.log(`Contacting hospital ${hospitalId} for request ${requestId}`);
      return { success: true };
    } catch (error: any) {
      console.error("Error contacting hospital:", error);
      return { success: false, error: error.message || 'Failed to contact hospital' };
    }
  }

  async createDonationDrive(driveData: Omit<DonationDrive, 'id'>): Promise<{ success: boolean; error?: string }> {
    try {
      await this.simulateDelay();
      const newDrive: DonationDrive = {
        id: uuidv4(),
        ...driveData,
      };
      this.data.donationDrives.push(newDrive);
      return { success: true };
    } catch (error: any) {
      console.error("Error creating donation drive:", error);
      return { success: false, error: error.message || 'Failed to create donation drive' };
    }
  }

  async registerForDonationDrive(driveId: string, donorId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.simulateDelay();
      const drive = this.data.donationDrives.find(d => d.id === driveId);
      if (!drive) {
        return { success: false, error: 'Donation drive not found' };
      }
      if (drive.registeredDonors < drive.expectedDonors) {
        drive.registeredDonors++;
        return { success: true };
      } else {
        return { success: false, error: 'Donation drive is full' };
      }
    } catch (error: any) {
      console.error("Error registering for donation drive:", error);
      return { success: false, error: error.message || 'Failed to register for donation drive' };
    }
  }

  async recordTransaction(transactionData: Omit<Transaction, 'id'>): Promise<{ success: boolean; error?: string }> {
    try {
      await this.simulateDelay();
      const newTransaction: Transaction = {
        id: uuidv4(),
        ...transactionData,
      };
      this.data.transactions.push(newTransaction);
      return { success: true };
    } catch (error: any) {
      console.error("Error recording transaction:", error);
      return { success: false, error: error.message || 'Failed to record transaction' };
    }
  }

  async sendNotification(notificationData: Omit<Notification, 'id'>): Promise<{ success: boolean; error?: string }> {
    try {
      await this.simulateDelay();
      const newNotification: Notification = {
        id: uuidv4(),
        ...notificationData,
      };
      this.data.notifications.push(newNotification);
      return { success: true };
    } catch (error: any) {
      console.error("Error sending notification:", error);
      return { success: false, error: error.message || 'Failed to send notification' };
    }
  }

  async authenticateGovernment(email: string, password: string): Promise<boolean> {
    await this.simulateDelay();
    return email === this.governmentCredentials.email && password === this.governmentCredentials.password;
  }

  async authenticateHospital(email: string, password: string): Promise<Hospital | null> {
    await this.simulateDelay();
    const hospital = this.data.hospitals.find(h => h.email === email && h.verified);
    return hospital || null;
  }

  async authenticateDonor(email: string, password: string): Promise<Donor | null> {
    await this.simulateDelay();
    const donor = this.data.donors.find(d => d.email === email);
    return donor || null;
  }
}

export default new MockDatabaseService();
