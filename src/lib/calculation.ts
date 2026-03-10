import { CalculationInput, CalculationResult } from '@/types/calculation';

type EstimateMachineHourlyRateInput = {
  machinePrice: number;
  depreciationYears: number;
  operatorSalary: number;
  productiveHoursPerYear: number;
};

export function estimateMachineHourlyRate(
  input: EstimateMachineHourlyRateInput
) {
  const {
    machinePrice,
    depreciationYears,
    operatorSalary,
    productiveHoursPerYear,
  } = input;

  const annualDepreciation = machinePrice / depreciationYears;
  const laborCost = operatorSalary;
  const overhead = (laborCost + annualDepreciation) * 0.3;
  const totalAnnualCost = annualDepreciation + laborCost + overhead;

  return totalAnnualCost / productiveHoursPerYear;
}

function calculateWeeksUntilDue(dueDate: string) {
  const due = new Date(dueDate);
  due.setHours(23, 59, 59, 999);

  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const msPerWeek = 1000 * 60 * 60 * 24 * 7;

  return Math.max(diffMs / msPerWeek, 0);
}

export function calculateProductionEconomics(
  input: CalculationInput
): CalculationResult {
  const {
    machineHourlyRate: inputMachineHourlyRate,
    machinePrice,
    depreciationYears,
    operatorSalary,
    productiveHoursPerYear,
    freeMachineHours,
    dueDate,
    offerPrice,
    materialCost,
    setupTime = 0,
    machiningTime = 0,
  } = input;

  const hourlyRateEstimated = typeof inputMachineHourlyRate !== 'number';
  const machineHourlyRate = hourlyRateEstimated
    ? estimateMachineHourlyRate({
      machinePrice: machinePrice ?? 0,
      depreciationYears: depreciationYears ?? 1,
      operatorSalary: operatorSalary ?? 0,
      productiveHoursPerYear: productiveHoursPerYear ?? 1,
    })
    : inputMachineHourlyRate;

  // Gesamte Maschinenzeit = Bearbeitungszeit + Rüstzeit
  const totalMachineTime = machiningTime + setupTime;

  // Deckungsbeitrag = Angebotspreis - Materialkosten
  const deckungsbeitrag = offerPrice - materialCost;

  // Deckungsbeitrag pro Maschinenstunde
  const contributionPerHour = totalMachineTime > 0 ? deckungsbeitrag / totalMachineTime : 0;

  const weeksUntilDue = calculateWeeksUntilDue(dueDate);
  const availableFreeHoursUntilDue = freeMachineHours * weeksUntilDue;

  // Freie Kapazität reduziert die kurzfristigen Grenzkosten pro Auftrag.
  const variableShare = 0.25;
  const variableMachineRate = machineHourlyRate * variableShare;
  const hoursInFreeCapacity = Math.min(totalMachineTime, availableFreeHoursUntilDue);
  const hoursBeyondFreeCapacity = Math.max(0, totalMachineTime - availableFreeHoursUntilDue);
  const marginalPrice = materialCost
    + (hoursInFreeCapacity * variableMachineRate)
    + (hoursBeyondFreeCapacity * machineHourlyRate);

  // Mindestpreis = Materialkosten + (Maschinensatz × Maschinenzeit)
  const minimumPrice = materialCost + (machineHourlyRate * totalMachineTime);
  const isBelowFullCostPrice = offerPrice < minimumPrice;
  const isBelowMarginalPrice = offerPrice < marginalPrice;

  // Opportunitätskosten ungenutzte Kapazität pro Jahr
  // (Stunden pro Woche * 52 Wochen * Stundensatz)
  const opportunityCostYear = machineHourlyRate * freeMachineHours * 52;

  // Wirtschaftliche Bewertung
  let economicAssessment = '';
  let pricingSignal: 'green' | 'yellow' | 'red' = 'red';
  if (offerPrice >= minimumPrice && contributionPerHour > machineHourlyRate) {
    pricingSignal = 'green';
    economicAssessment = 'Dieser Auftrag deckt Ihre Vollkosten.';
  } else if (offerPrice >= marginalPrice && contributionPerHour > 0 && deckungsbeitrag > 0) {
    pricingSignal = 'yellow';
    economicAssessment = 'Der Auftrag liegt unter Ihrem Vollkostenpreis, aber über den Grenzkosten bis zum Liefertermin.';
  } else if (deckungsbeitrag <= 0) {
    pricingSignal = 'red';
    economicAssessment = 'Dieser Auftrag deckt nicht einmal die Materialkosten.';
  } else {
    pricingSignal = 'red';
    economicAssessment = 'Der Auftrag liegt unter den geschätzten Grenzkosten bis zum Liefertermin.';
  }

  // Diagnose
  const diagnosis: string[] = [];

  if (opportunityCostYear > 100000) {
    diagnosis.push(
      `⚠️ Hohe Leerlaufkosten: ca. €${(opportunityCostYear / 1000).toFixed(0)}k pro Jahr`
    );
  }

  if (contributionPerHour < machineHourlyRate && deckungsbeitrag > 0) {
    diagnosis.push(
      `⚠️ Deckungsbeitrag pro Stunde (€${contributionPerHour.toFixed(2)}) liegt unter Stundensatz (€${machineHourlyRate.toFixed(2)})`
    );
  }

  if (deckungsbeitrag < materialCost * 0.3) {
    diagnosis.push(
      '⚠️ Niedriger Deckungsbeitrag - möglicherweise zu aggressive Preisgestaltung'
    );
  }

  if (minimumPrice > offerPrice) {
    diagnosis.push(
      '⚠️ Aktuelles Angebot unter Mindestpreis - ineffiziente Angebotskalkulation'
    );
  }

  if (hoursBeyondFreeCapacity > 0) {
    diagnosis.push(
      `⚠️ Freie Kapazität bis Termin reicht nicht aus (${availableFreeHoursUntilDue.toFixed(1)}h verfügbar)`
    );
  }

  if (diagnosis.length === 0) {
    diagnosis.push('✓ Preisgestaltung wirkt angemessen');
  }

  return {
    machineHourlyRate: Math.round(machineHourlyRate * 100) / 100,
    contributionMargin: Math.round(deckungsbeitrag * 100) / 100,
    hourlyRateEstimated,
    pricingSignal,
    isBelowFullCostPrice,
    isBelowMarginalPrice,
    weeksUntilDue: Math.round(weeksUntilDue * 100) / 100,
    availableFreeHoursUntilDue: Math.round(availableFreeHoursUntilDue * 100) / 100,
    marginalPrice: Math.round(marginalPrice * 100) / 100,
    deckungsbeitrag: Math.round(deckungsbeitrag * 100) / 100,
    opportunityCostYear: Math.round(opportunityCostYear * 100) / 100,
    minimumPrice: Math.round(minimumPrice * 100) / 100,
    totalMachineTime: Math.round(totalMachineTime * 100) / 100,
    contributionPerHour: Math.round(contributionPerHour * 100) / 100,
    economicAssessment,
    diagnosis,
  };
}
