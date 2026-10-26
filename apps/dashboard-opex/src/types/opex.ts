export interface PeriodOption {
  periode: number;
  label: string;
}

export interface Ce2Option {
  ce2: string;
  deskripsiCe2: string;
}

export interface MonthlyChartDataPoint {
  month: number;
  monthName: string;
  actual: number;
  budget: number;
  variance: number | null;
}

export interface MonthlySummaryResponse {
  months: MonthlyChartDataPoint[];
  totalActual: number;
  totalBudget: number;
  totalVariance: number | null;
}

export interface CostCenterSummaryItem {
  costcenter: string;
  deskripsiCostcenter: string;
  actual: number;
  budget: number;
  variance: number | null;
}

export interface CostElementSummaryItem {
  ce2: string;
  deskripsiCe2: string;
  actual: number;
  budget: number;
  variance: number | null;
}

export interface ActivityItem {
  idActual: string;
  documentNumber: string;
  postingDate: string | null;
  activity: string;
  cost: number;
}

export interface ActivityGroupItem {
  activity: string;
  totalCost: number;
  count: number;
}

export interface TrendPgMonthlyPoint {
  month: number;
  monthName: string;
  pg1: number;
  pg2: number;
  pg3: number;
}

export interface TrendPgCostCenterItem {
  costcenter: string;
  deskripsiCostcenter: string;
  pg1: number | null;
  pg2: number | null;
  pg3: number | null;
}

export interface TrendPgResponse {
  monthlyTrend: TrendPgMonthlyPoint[];
  costCenterTable: TrendPgCostCenterItem[];
}
