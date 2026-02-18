
export interface SolarSystemData {
  clientName?: string;
  clientPhone?: string;
  billAmount: number;
  energyTariff: number; // Preço do kWh (Ex: 0.95)
  investmentAmount: number; // Valor Final de Venda
  kitCost: number; // Novo: Preço de Custo do Fornecedor
  profitMargin: number; // Novo: Margem (%)
  downPayment?: number; // Novo: Valor de Entrada
  kitValue?: number; // Valor declarado do kit na proposta (opcional)
  hsp: number; // Peak Sun Hours
  moduleCount: number;
  modulesPerString: number; // Novo campo: Módulos em série
  modulePowerW: number; // Watts per module (default 575)
  selectedInverter?: string; // Novo: Inversor selecionado manualmente
  roofType: 'Cerâmico' | 'Fibrocimento' | 'Metálico' | 'Laje' | 'Solo'; // Novo campo
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface TechnicalSpecs {
  totalPowerKw: number;
  inverterPowerKw: number; // Potência de inversor sugerida (nominal)
  suggestedInverter: string; // Nome comercial do modelo (Ex: Inversor 5kW 2MPPT)
  inverterRange: string; // Faixa de potência sugerida (texto)
  overload: string; // Relação DC/AC
  areaRequired: number; // m²
  totalWeight: number; // kg
  cableGauge: string;
  breakerRating: string;
  nominalCurrent: number; // Corrente nominal de saída do inversor (A)
  stringConfigText: string; // Texto descritivo das strings (Ex: 2x 10 módulos)
  
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
  validityDays: number;
}
