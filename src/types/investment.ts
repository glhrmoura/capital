export enum RecordType {
  AMOUNT = 'amount',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  totalAmount: number;
  type: RecordType;
  value?: number; // Valor do aporte ou saque (quando type é DEPOSIT ou WITHDRAWAL)
  timestamp?: number; // Timestamp para diferenciar registros no mesmo dia
}

export interface MonthlyData {
  [key: string]: DailyRecord[]; // key = YYYY-MM
}

export interface UserData {
  data: MonthlyData;
  initialAmount?: number;
}

export const isAmountRecord = (record: DailyRecord): boolean => {
  return record.type === RecordType.AMOUNT;
};

export const isDepositOrWithdrawal = (record: DailyRecord): boolean => {
  return record.type === RecordType.DEPOSIT || record.type === RecordType.WITHDRAWAL;
};
