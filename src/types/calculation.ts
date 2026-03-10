export interface CalculationInput {
  freeMachineHours: number;
  dueDate: string;
  machineHourlyRate?: number;
  machinePrice?: number;
  depreciationYears?: number;
  operatorSalary?: number;
  productiveHoursPerYear?: number;
  offerPrice: number;
  materialCost: number;
  setupTime?: number;
  machiningTime: number;
}

export interface CalculationResult {
  machineHourlyRate: number;
  contributionMargin: number;
  hourlyRateEstimated: boolean;
  pricingSignal: 'green' | 'yellow' | 'red';
  isBelowFullCostPrice: boolean;
  isBelowMarginalPrice: boolean;
  weeksUntilDue: number;
  availableFreeHoursUntilDue: number;
  marginalPrice: number;
  deckungsbeitrag: number;
  opportunityCostYear: number;
  minimumPrice: number;
  diagnosis: string[];
  totalMachineTime?: number;
  contributionPerHour?: number;
  economicAssessment?: string;
}

export interface User {
  id: string;
  name: string;
  company: string;
  position: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  email_verified: boolean;
  consent_contact: boolean;
}
