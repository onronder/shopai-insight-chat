// ⛔ Dev only — not used in production
export interface Customer {
  id: number;
  name: string;
  email: string;
  ltv: number;
  lastOrder?: string;
  segment?: string;
  firstOrderValue?: number;
  date?: string;
}

export interface ChurnDataPoint {
  month: string;
  rate: number;
  projected?: boolean;
}

export interface LtvRange {
  range: string;
  count: number;
}
