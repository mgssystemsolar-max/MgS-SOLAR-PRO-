import { SolarSystemData, TechnicalSpecs, MonthlyProduction, ChecklistItem, FinancialProjection } from '../types';

// Lista de Módulos Fotovoltaicos Disponíveis
export const MODULE_OPTIONS = [
  { label: "450W Monocristalino", value: 450 },
  { label: "550W Monocristalino", value: 550 },
  { label: "575W Monocristalino (Padrão)", value: 575 },
  { label: "600W Monocristalino", value: 600 },
  { label: "660W Monocristalino", value: 660 },
  { label: "700W N-Type (Alta Potência)", value: 700 },
  { label: "715W Bifacial", value: 715 }
];

// Lista de Inversores Disponíveis para Seleção Manual (0 a 75kW)
export const INVERTER_OPTIONS = [
  "Automático (Sugerido pelo Sistema)",
  "Microinversor 600W (2 MPPT)",
  "Microinversor 1.2kW (4 MPPT)",
  "Microinversor 1.6kW (4 MPPT)",
  "Microinversor 2.0kW (4 MPPT)",
  "Inversor 3kW (Mono 220V)",
  "Inversor 4kW (Mono 220V)",
  "Inversor 5kW (Mono 220V)",
  "Inversor 6kW (Mono 220V)",
  "Inversor 8kW (Mono/Bifásico 220V)",
  "Inversor 10kW (Trifásico 380V)",
  "Inversor 12kW (Trifásico 380V)",
  "Inversor 15kW (Trifásico 380V)",
  "Inversor 20kW (Trifásico 380V)",
  "Inversor 25kW (Trifásico 380V)",
  "Inversor 30kW (Trifásico 380V)",
  "Inversor 33kW (Trifásico 380V)",
  "Inversor 40kW (Trifásico 380V)",
  "Inversor 50kW (Trifásico 380V)",
  "Inversor 60kW (Trifásico 380V)",
  "Inversor 75kW (Trifásico 380V)",
  "Inversor 100kW (Trifásico 380V)"
];

// Helper para extrair potência numérica da string do inversor
const extractInverterPower = (inverterName: string): { kw: number, isThreePhase: boolean } => {
  if (!inverterName || inverterName.includes("Automático")) return { kw: 0, isThreePhase: false };
  
  // Tenta achar número seguido de kW ou W
  const kwMatch = inverterName.match(/(\d+(\.\d+)?)kW/i);
  const wMatch = inverterName.match(/(\d+)W/i);
  
  let kw = 0;
  if (kwMatch) {
    kw = parseFloat(kwMatch[1]);
  } else if (wMatch) {
    kw = parseFloat(wMatch[1]) / 1000;
  }

  const isThreePhase = inverterName.toLowerCase().includes("trifásico");
  return { kw, isThreePhase };
};

export const calculateModulesFromBill = (bill: number, tariff: number, hsp: number, modulePower: number): number => {
  if (bill <= 0 || tariff <= 0) return 0;
  
  const targetMonthlyKwh = bill / tariff;
  const targetDailyKwh = targetMonthlyKwh / 30;
  
  const efficiency = 0.80;
  const requiredKwp = targetDailyKwh / (hsp * efficiency);

  const modules = Math.ceil((requiredKwp * 1000) / modulePower);

  return modules;
};

export const calculateStringSuggestion = (totalModules: number): number => {
  if (totalModules <= 0) return 0;

  // Limite seguro típico para inversores string (1000V) com painéis modernos (~50V Voc)
  // Geralmente entre 18 a 20 módulos.
  const SAFE_MAX_STRING = 19; 

  // Se cabe em uma string, retorna o total
  if (totalModules <= SAFE_MAX_STRING) {
    return totalModules;
  } 
  
  // Se não cabe, tenta dividir em strings iguais
  let numberOfStrings = 2;
  while (true) {
    const modulesPerString = Math.ceil(totalModules / numberOfStrings);
    if (modulesPerString <= SAFE_MAX_STRING) {
      // Retorna a quantidade de módulos por string (arredondado para cima para garantir segurança na divisão visual)
      // Ex: 88 módulos / 5 strings = 17.6 -> retorna 18 (o usuário ajusta se quer 17 ou 18 depois)
      return modulesPerString;
    }
    numberOfStrings++;
    // Safety break para evitar loops infinitos em inputs absurdos
    if (numberOfStrings > 50) return 1; 
  }
};

export const calculateTechnicalSpecs = (data: SolarSystemData): TechnicalSpecs => {
  const powerPerModule = data.modulePowerW || 575;
  const totalPowerKw = (data.moduleCount * powerPerModule) / 1000;
  
  // 1. Inverter Logic
  let selectedInverterKw = 0;
  let isThreePhase = false;
  let suggestedInverter = "";

  // Check manual selection
  const manualSelection = data.selectedInverter && !data.selectedInverter.includes("Automático") 
    ? extractInverterPower(data.selectedInverter) 
    : null;

  if (manualSelection && manualSelection.kw > 0) {
      // Manual Override
      selectedInverterKw = manualSelection.kw;
      isThreePhase = manualSelection.isThreePhase;
      suggestedInverter = data.selectedInverter!;
  } else {
      // Automatic Logic
      const STANDARD_INVERTERS = [
        1, 1.5, 2, 2.5, 3, 3.6, 4, 5, 6, 7, 8, 9, 10, 
        12, 15, 20, 25, 30, 33, 40, 50, 60, 75, 100
      ];

      const foundInverter = STANDARD_INVERTERS.find(invKw => {
         const ratio = totalPowerKw / invKw;
         return ratio <= 1.45;
      });

      selectedInverterKw = foundInverter || STANDARD_INVERTERS[STANDARD_INVERTERS.length - 1];
      isThreePhase = selectedInverterKw >= 8;
      suggestedInverter = `Inversor ${selectedInverterKw}kW (${isThreePhase ? 'Trifásico 380V' : 'Mono/Bifásico 220V'})`;
  }

  const inverterPowerKw = selectedInverterKw;
  const systemVoltage = isThreePhase ? 380 : 220; 

  // Range text for reference
  const inverterMin = (totalPowerKw / 1.5).toFixed(1);
  const inverterMax = (totalPowerKw / 1.15).toFixed(1); 
  const inverterRange = `${inverterMin}kW - ${inverterMax}kW`;
  
  // Calculate actual overload
  const overloadVal = inverterPowerKw > 0 ? (totalPowerKw / inverterPowerKw) * 100 : 0;
  const overload = `${overloadVal.toFixed(0)}%`;

  // 2. Physical Characteristics
  const areaRequired = Number((data.moduleCount * 2.1).toFixed(1));
  const totalWeight = data.moduleCount * 23;

  // 3. Electrical (NBR 5410 Standard Approach)
  let nominalCurrent = 0;
  
  if (isThreePhase) {
      nominalCurrent = (inverterPowerKw * 1000) / (systemVoltage * Math.sqrt(3));
  } else {
      nominalCurrent = (inverterPowerKw * 1000) / systemVoltage;
  }

  let cableGauge = "2.5mm²";
  let breakerRating = "16A";
  const designCurrent = nominalCurrent * 1.25;

  if (designCurrent <= 21) {
      cableGauge = "2.5mm²";
      breakerRating = "20A"; 
  } else if (designCurrent <= 28) {
      cableGauge = "4.0mm²";
      breakerRating = "25A"; 
  } else if (designCurrent <= 36) {
      cableGauge = "6.0mm²";
      breakerRating = "32A"; 
  } else if (designCurrent <= 50) {
      cableGauge = "10.0mm²";
      breakerRating = "50A";
  } else if (designCurrent <= 68) {
      cableGauge = "16.0mm²";
      breakerRating = "63A";
  } else if (designCurrent <= 89) {
      cableGauge = "25.0mm²";
      breakerRating = "80A";
  } else if (designCurrent <= 111) {
      cableGauge = "35.0mm²";
      breakerRating = "100A";
  } else if (designCurrent <= 145) {
      cableGauge = "50.0mm²";
      breakerRating = "125A";
  } else if (designCurrent <= 190) {
      cableGauge = "70.0mm²";
      breakerRating = "160A";
  } else {
      cableGauge = "95.0mm² +";
      breakerRating = "200A +";
  }

  // 4. Strings Logic text
  const numStrings = data.modulesPerString > 0 
    ? (data.moduleCount / data.modulesPerString).toFixed(1)
    : "0";
  
  // Format description: e.g., "2 Strings de 12 módulos"
  const isWhole = Number(numStrings) % 1 === 0;
  let stringConfigText = "";
  if (isWhole) {
    stringConfigText = `${numStrings} Strings de ${data.modulesPerString} módulos`;
  } else {
    // Exibe número aproximado
    const nStrings = Math.ceil(Number(numStrings));
    stringConfigText = `~${nStrings} Strings (Config. Mista / Sugerido: ${data.modulesPerString}/str)`;
  }

  // 5. Generation Totals Calculation
  const months = [1, 0.9, 0.8, 0.8, 0.9, 1, 1.1, 1.2, 1.1, 1, 1, 1];
  const totalYearlyGen = months.reduce((acc, factor) => acc + (totalPowerKw * data.hsp * factor * 30), 0);
  
  return {
    totalPowerKw,
    inverterPowerKw,
    suggestedInverter,
    inverterRange,
    overload,
    areaRequired,
    totalWeight,
    cableGauge,
    breakerRating,
    nominalCurrent: Number(nominalCurrent.toFixed(1)),
    stringConfigText,
    generationYearly: Math.round(totalYearlyGen),
    generationMonthlyAvg: Math.round(totalYearlyGen / 12),
    generationDailyAvg: Math.round(totalYearlyGen / 365)
  };
};

export const calculateProduction = (totalPowerKw: number, hsp: number): MonthlyProduction[] => {
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const factors = [1, 0.9, 0.8, 0.8, 0.9, 1, 1.1, 1.2, 1.1, 1, 1, 1];
  const DAYS_IN_MONTH = 30.4; // Average days

  return months.map((month, index) => ({
    month,
    generation: Math.round(totalPowerKw * hsp * factors[index] * DAYS_IN_MONTH)
  }));
};

export const calculatePayback = (investment: number, bill: number): string => {
  if (bill <= 0) return "---";
  const months = investment / bill;
  return `${months.toFixed(1)} meses`;
};

export const calculateFinancials = (data: SolarSystemData): FinancialProjection => {
  const monthlySavings = data.billAmount; 
  const annualSavings = monthlySavings * 12;
  
  let totalSavings = 0;
  let currentAnnual = annualSavings;
  const INFLATION_RATE = 0.06;

  for (let i = 0; i < 25; i++) {
    totalSavings += currentAnnual;
    currentAnnual = currentAnnual * (1 + INFLATION_RATE);
  }

  return {
    monthlySavings,
    annualSavings,
    totalSavings25Years: totalSavings
  };
};

export const generateDefaultChecklist = (
  moduleCount: number, 
  cableGauge: string, 
  breakerRating: string, 
  roofType: string, 
  inverterModel: string
): ChecklistItem[] => {
  let structureType = 'Kit Fixação Padrão';
  
  if (roofType === 'Cerâmico') structureType = 'Kit Gancho (Telha Colonial)';
  if (roofType === 'Fibrocimento') structureType = 'Kit Parafuso Prisioneiro';
  if (roofType === 'Metálico') structureType = 'Kit Mini-Trilho / Metálico';
  if (roofType === 'Laje') structureType = 'Estrutura de Triângulo (Laje)';
  if (roofType === 'Solo') structureType = 'Estrutura Solo (Cerâmico/Concreto)';

  return [
    { id: '1', label: 'Painéis Solares', quantity: moduleCount, observation: '' },
    { id: '8', label: inverterModel, quantity: '1 un', observation: 'Verificar modelo e fabricante na proposta' },
    { id: '2', label: 'Cabo Solar (m)', quantity: moduleCount * 10, observation: '' },
    { id: '3', label: 'Cabo CA', quantity: cableGauge, observation: '' },
    { id: '4', label: 'Disjuntor CA', quantity: breakerRating, observation: '' },
    { id: '5', label: 'Estrutura Fixação', quantity: '1 Kit', observation: structureType },
    { id: '6', label: 'String Box', quantity: '1 un', observation: '' },
    { id: '7', label: 'Conectores MC4', quantity: '1 Kit', observation: '' },
  ];
};