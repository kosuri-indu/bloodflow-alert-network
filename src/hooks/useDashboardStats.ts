
import { useState, useEffect } from 'react';
import mockDatabaseService, { BloodInventory, BloodRequest } from '@/services/mockDatabase';

interface DashboardStats {
  totalBloodUnits: number;
  aiMatches: number;
  partnerHospitals: number;
  criticalRequests: number;
  lowStockTypes: string[];
  expiringUnits: number;
}

export function useDashboardStats(hospitalName?: string) {
  const [stats, setStats] = useState<DashboardStats>({
    totalBloodUnits: 0,
    aiMatches: 0,
    partnerHospitals: 0,
    criticalRequests: 0,
    lowStockTypes: [],
    expiringUnits: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshStats = async () => {
    try {
      setIsLoading(true);
      
      // Force fresh data by clearing any cached values
      let inventory: BloodInventory[];
      let requests: BloodRequest[];
      
      if (hospitalName) {
        // Hospital-specific stats
        [inventory, requests] = await Promise.all([
          mockDatabaseService.getHospitalBloodInventory(hospitalName),
          mockDatabaseService.getHospitalBloodRequests(hospitalName),
        ]);
      } else {
        // System-wide stats
        [inventory, requests] = await Promise.all([
          mockDatabaseService.getBloodInventoryDetails(),
          mockDatabaseService.getBloodRequests(),
        ]);
      }
      
      const hospitals = await mockDatabaseService.getRegisteredHospitals();

      // Calculate total blood units
      const totalBloodUnits = inventory.reduce((sum, item) => sum + item.units, 0);

      // Calculate AI matches (requests with high match percentages)
      const aiMatches = requests.filter(req => req.matchPercentage > 70).length;

      // Count partner hospitals
      const partnerHospitals = hospitals.length;

      // Count critical requests
      const criticalRequests = requests.filter(req => req.urgency === 'critical').length;

      // Find low stock blood types (less than 20 units for system, less than 10 for hospital)
      const lowStockThreshold = hospitalName ? 10 : 20;
      const bloodTypeStock = inventory.reduce((acc, item) => {
        const bloodType = `${item.bloodType} ${item.rhFactor === 'positive' ? '+' : '-'}`;
        acc[bloodType] = (acc[bloodType] || 0) + item.units;
        return acc;
      }, {} as Record<string, number>);

      const lowStockTypes = Object.entries(bloodTypeStock)
        .filter(([, units]) => units < lowStockThreshold)
        .map(([type]) => type);

      // Calculate expiring units (within 7 days)
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      const expiringUnits = inventory
        .filter(item => new Date(item.expirationDate) <= sevenDaysFromNow)
        .reduce((sum, item) => sum + item.units, 0);

      const newStats = {
        totalBloodUnits,
        aiMatches,
        partnerHospitals,
        criticalRequests,
        lowStockTypes,
        expiringUnits
      };

      console.log('Dashboard stats updated:', newStats);
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();
    
    // Set up interval to refresh stats every 5 seconds for real-time updates
    const interval = setInterval(refreshStats, 5000);
    
    return () => clearInterval(interval);
  }, [hospitalName]);

  return {
    stats,
    isLoading,
    refreshStats
  };
}
