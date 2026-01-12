export interface DailyRecord {
  date: string; // YYYY-MM-DD
  totalAmount: number;
}

export interface MonthlyData {
  [key: string]: DailyRecord[]; // key = YYYY-MM
}
