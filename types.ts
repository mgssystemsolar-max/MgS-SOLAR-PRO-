
export interface SolarSystemData {
  clientName?: string;
  clientPhone?: string;
  clientType: 'Residencial' | 'Comercial' | 'Industrial' | 'Rural';
  connectionType: 'Monofásico' | 'Bifásico' | 'Trifásico'; // Novo
  billAmount: number;
  energyTariff: number; 
  investmentAmount: number; 
  kitCost: number; 
  profitMargin: number; 
  downPayment?: number; 
  kitValue?: number; 
  hsp: number; 
  moduleCount: number;
  modulesPerString: number; 
  modulePowerW: number; 
  moduleBrand?: string; // Novo
  inverterBrand?: string; // Novo
  selectedInverter?: string; 
  roofType: 'Cerâmico' | 'Fibrocimento' | 'Metálico' | 'Laje' | 'Solo'; 
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface TechnicalSpecs {
  totalPowerKw: number;
  inverterPowerKw: number; 
  suggestedInverter: string; 
  inverterRange: string; 
  overload: string; 
  areaRequired: number; 
  totalWeight: number; 
  cableGauge: string;
  breakerRating: string;
  nominalCurrent: number; 
  stringConfigText: string; 
  
  // Performance Metrics
  generationDailyAvg: number;
  generationMonthlyAvg: number;
  generationYearly: number;
}

export interface MonthlyProduction {
  month: string;
  generation: number;
  previousYear?: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
  quantity: string | number;
  observation: string;
}

export interface User {
  email: string;
}

export interface SavedProject {
  id: string;
  clientName: string;
  date: string;
  data: SolarSystemData;
}

export interface FinancialProjection {
  monthlySavings: number;
  annualSavings: number;
  totalSavings25Years: number;
}

export interface ProposalSettings {
  companyName: string;
  sellerName: string;
  contactInfo: string;
  warrantyText: string;
  paymentTerms: string;
  differentialsText: string; // Novo
  validityDays: number;
}
