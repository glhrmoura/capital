export interface DailyRecord {
  date: string; // YYYY-MM-DD
  totalAmount: number;
  deposit?: number; // Aporte
  withdrawal?: number; // Saque
  timestamp?: number; // Timestamp para diferenciar registros no mesmo dia
}

export interface MonthlyData {
  [key: string]: DailyRecord[]; // key = YYYY-MM
}
