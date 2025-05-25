
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

export function useDashboardStats() {
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
      const [inventory, requests, hospitals] = await Promise.all([
        mockDatabaseService.getBloodInventoryDetails(),
        mockDatabaseService.getBloodRequests(),
        mockDatabaseService.getRegisteredHospitals(),
      ]);

      // Calculate total blood units
      const totalBloodUnits = inventory.reduce((sum, item) => sum + item.units, 0);

      // Calculate AI matches (requests with high match percentages)
      const aiMatches = requests.filter(req => req.matchPercentage > 70).length;

      // Count partner hospitals
      const partnerHospitals = hospitals.length;

      // Count critical requests
      const criticalRequests = requests.filter(req => req.urgency === 'critical').length;

      // Find low stock blood types (less than 20 units)
      const bloodTypeStock = inventory.reduce((acc, item) => {
        const bloodType = `${item.bloodType} ${item.rhFactor === 'positive' ? '+' : '-'}`;
        acc[bloodType] = (acc[bloodType] || 0) + item.units;
        return acc;
      }, {} as Record<string, number>);

      const lowStockTypes = Object.entries(bloodTypeStock)
        .filter(([, units]) => units < 20)
        .map(([type]) => type);

      // Calculate expiring units (within 7 days)
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      const expiringUnits = inventory
        .filter(item => new Date(item.expirationDate) <= sevenDaysFromNow)
        .reduce((sum, item) => sum + item.units, 0);

      setStats({
        totalBloodUnits,
        aiMatches,
        partnerHospitals,
        criticalRequests,
        lowStockTypes,
        expiringUnits
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  return {
    stats,
    isLoading,
    refreshStats
  };
}
