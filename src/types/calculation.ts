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

export type BenchmarkConfidence = 'low' | 'medium' | 'high';

export interface BenchmarkDimensions {
  key: string;
  timeBand: string;
  priceBand: string;
  hourlyRateBand: string;
  label: string;
}

export interface BenchmarkComparison {
  benchmarkLabel: string;
  dimensions?: BenchmarkDimensions;
  subjectContributionPerHour: number;
  benchmarkContributionPerHour: number;
  differencePerHour: number;
  percentageDifference: number;
  position: 'above' | 'below' | 'near';
  confidence: BenchmarkConfidence;
  sampleSize: number;
  realSampleSize: number;
  seedSampleSize: number;
  sourceLabel: string;
  feedback: string;
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
  benchmarkComparison?: BenchmarkComparison;
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

export interface CalculationHistoryItem {
  id: string;
  calculation_input: CalculationInput;
  calculation_result: CalculationResult;
  pricing_signal: CalculationResult['pricingSignal'];
  created_at: string;
}

export interface CalculationHistorySummary {
  deckungsbeitrag: number;
  marginalPrice: number;
  minimumPrice: number;
  opportunityCostYear: number;
  machineHourlyRate: number;
  contributionPerHour: number;
  pricingSignal: CalculationResult['pricingSignal'];
  benchmarkComparison?: BenchmarkComparison;
}
