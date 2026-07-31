import axiosClient from './axiosClient';
import { mockFleetSummary } from './mockData';

export interface FuelAnomaly {
  fuelEntryId: number;
  date: string;
  recordedMileage: number;
  baselineMileage: number;
  percentageDrop: number;
  severity: 'Warning' | 'Critical';
  recommendation: string;
}

export interface ServicePrediction {
  vehicleId: number;
  vehicleName: string;
  currentOdometer: number;
  targetServiceOdometer: number;
  averageDailyKm: number;
  daysUntilService: number;
  estimatedServiceDate?: string;
  urgencyLevel: 'Normal' | 'Upcoming' | 'Urgent' | 'Overdue';
}

export interface VehicleAnalytics {
  vehicleId: number;
  vehicleName: string;
  baselineMileageKmL: number;
  latestMileageKmL: number;
  costPerKm: number;
  totalDistanceTraveledKm: number;
  totalSpentAmount: number;
  fuelAnomalies: FuelAnomaly[];
  servicePrediction?: ServicePrediction;
}

export interface FleetSummaryAnalytics {
  totalVehicles: number;
  totalFleetSpend: number;
  averageFleetCostPerKm: number;
  averageFleetMileageKmL: number;
  activeAnomaliesCount: number;
  upcomingServicesCount: number;
  forecastNext30DaysSpend: number;
  forecastNext90DaysSpend: number;
  vehicleSummaries: VehicleAnalytics[];
  keyRecommendations: string[];
}

export const analyticsApi = {
  getFleetSummary: () =>
    axiosClient.get<FleetSummaryAnalytics>('/analytics/summary').then((r) => r.data).catch(() => mockFleetSummary),

  getVehicleAnalytics: (vehicleId: number) =>
    axiosClient.get<VehicleAnalytics>(`/analytics/vehicle/${vehicleId}`).then((r) => r.data).catch(() => mockFleetSummary.vehicleSummaries.find(v => v.vehicleId === vehicleId) || mockFleetSummary.vehicleSummaries[0]),
};
