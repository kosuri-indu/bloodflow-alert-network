import { v4 as uuidv4 } from 'uuid';

interface Hospital {
  id: string;
  name: string;
  email: string;
  contactPerson: string;
  registrationId: string;
  address: string;
  verified?: boolean;
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
  isEligible: boolean;
  notificationPreferences: {
    urgentRequests: boolean;
    donationDrives: boolean;
    general: boolean;
  };
}

interface BloodRequest {
  id: string;
  hospital: string;
  bloodType: string;
  units: number;
  urgency: 'critical' | 'urgent' | 'routine';
  neededBy: Date;
  medicalCondition: string;
  patientAge: number;
}

interface InventoryItem {
  id: string;
  hospitalId: string;
  bloodType: string;
  units: number;
  lastUpdated: Date;
}

interface DonationDrive {
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

interface Transaction {
  id: string;
  donorId: string;
  hospitalId: string;
  bloodType: string;
  units: number;
  transactionDate: Date;
}

interface Notification {
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

  async getDonors(): Promise<Donor[]> {
    await this.simulateDelay();
    return [...this.data.donors];
  }

  async getBloodRequests(): Promise<BloodRequest[]> {
    await this.simulateDelay();
    return [...this.data.bloodRequests];
  }

  async getInventory(): Promise<InventoryItem[]> {
    await this.simulateDelay();
    return [...this.data.inventory];
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

  async registerDonor(donorData: Omit<Donor, 'id' | 'isEligible'>): Promise<{ success: boolean; error?: string }> {
    try {
      await this.simulateDelay();
      const newDonor: Donor = {
        id: uuidv4(),
        ...donorData,
        isEligible: true
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

  async createBloodRequest(requestData: Omit<BloodRequest, 'id'>): Promise<{ success: boolean; error?: string }> {
    try {
      await this.simulateDelay();
      const newRequest: BloodRequest = {
        id: uuidv4(),
        ...requestData,
      };
      this.data.bloodRequests.push(newRequest);
      return { success: true };
    } catch (error: any) {
      console.error("Error creating blood request:", error);
      return { success: false, error: error.message || 'Failed to create blood request' };
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
}

export default new MockDatabaseService();
