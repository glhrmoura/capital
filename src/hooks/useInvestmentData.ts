import { useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { DailyRecord, MonthlyData } from '@/types/investment';

export const useInvestmentData = () => {
  const { user } = useAuth();
  const userId = user?.uid;

  const userDocRef = userId ? doc(db, 'users', userId) : undefined;
  const [data] = useDocumentData<{ data: MonthlyData }>(userDocRef, {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  const investmentData: MonthlyData = data?.data || {};  

  const getMonthKey = (year: number, month: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
  };

  const getRecordsForMonth = useCallback((year: number, month: number): DailyRecord[] => {
    const key = getMonthKey(year, month);
    return investmentData[key] || [];
  }, [investmentData]);

  const addOrUpdateRecord = useCallback(async (year: number, month: number, day: number, amount: number, deposit?: number, withdrawal?: number, timestamp?: number) => {
    if (!userId || !userDocRef) return;

    const key = getMonthKey(year, month);
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const monthRecords = investmentData[key] || [];
    
    const recordData: DailyRecord = {
      date: dateString,
      totalAmount: amount,
      timestamp: timestamp || Date.now(),
    };
    
    if (deposit !== undefined && deposit > 0) {
      recordData.deposit = deposit;
    }
    
    if (withdrawal !== undefined && withdrawal > 0) {
      recordData.withdrawal = withdrawal;
    }
    
    let newRecords: DailyRecord[];
    
    if (timestamp !== undefined) {
      newRecords = monthRecords.map(r => {
        if (r.date === dateString && r.timestamp === timestamp) {
          return recordData;
        }
        return r;
      });
    } else {
      newRecords = [...monthRecords, recordData];
    }
    
    newRecords.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.timestamp || 0) - (b.timestamp || 0);
    });
    
    const updatedData = { ...investmentData, [key]: newRecords };
    
    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        await updateDoc(userDocRef, { data: updatedData });
      } else {
        await setDoc(userDocRef, { data: updatedData });
      }
    } catch (error) {
      console.error('Error saving record:', error);
    }
  }, [userId, userDocRef, investmentData]);

  const deleteRecord = useCallback(async (year: number, month: number, day: number, timestamp?: number) => {
    if (!userId || !userDocRef) return;

    const key = getMonthKey(year, month);
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const monthRecords = investmentData[key] || [];
    const newRecords = monthRecords.filter(r => {
      if (timestamp !== undefined) {
        return !(r.date === dateString && r.timestamp === timestamp);
      }
      return r.date !== dateString;
    });
    
    const updatedData = { ...investmentData, [key]: newRecords };
    
    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        await updateDoc(userDocRef, { data: updatedData });
      } else {
        await setDoc(userDocRef, { data: updatedData });
      }
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  }, [userId, userDocRef, investmentData]);

  const calculateYield = useCallback((records: DailyRecord[]): { yield: number; firstDay: number; lastDay: number } | null => {
    if (records.length < 2) {
      return null;
    }
    
    const sortedRecords = [...records].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.timestamp || 0) - (b.timestamp || 0);
    });
    
    const amountRecords = sortedRecords.filter(r => !(r.deposit || r.withdrawal));
    
    if (amountRecords.length < 2) {
      return null;
    }
    
    const firstRecord = amountRecords[0];
    const lastRecord = amountRecords[amountRecords.length - 1];
    
    const firstDay = parseInt(firstRecord.date.split('-')[2]);
    const lastDay = parseInt(lastRecord.date.split('-')[2]);
    
    const firstRecordIndex = sortedRecords.findIndex(r => 
      r.date === firstRecord.date && 
      (r.timestamp || 0) === (firstRecord.timestamp || 0)
    );
    const lastRecordIndex = sortedRecords.findIndex(r => 
      r.date === lastRecord.date && 
      (r.timestamp || 0) === (lastRecord.timestamp || 0)
    );
    
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    
    for (let i = firstRecordIndex + 1; i <= lastRecordIndex; i++) {
      const record = sortedRecords[i];
      if (record.deposit) {
        totalDeposits += record.deposit;
      }
      if (record.withdrawal) {
        totalWithdrawals += record.withdrawal;
      }
    }
    
    const totalVariation = lastRecord.totalAmount - firstRecord.totalAmount;
    const realYield = totalVariation - (totalDeposits - totalWithdrawals);
    
    return {
      yield: realYield,
      firstDay,
      lastDay,
    };
  }, []);

  return {
    getRecordsForMonth,
    addOrUpdateRecord,
    deleteRecord,
    calculateYield,
  };
};
