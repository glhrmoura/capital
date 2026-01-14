export enum RecordType {
  AMOUNT = 'amount',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

export interface DailyRecord {
  date: string;
  totalAmount: number;
  type: RecordType;
  value?: number;
  timestamp?: number;
}

export interface MonthlyData {
  [key: string]: DailyRecord[];
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
