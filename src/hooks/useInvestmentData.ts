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

  const addOrUpdateRecord = useCallback(async (year: number, month: number, day: number, amount: number) => {
    if (!userId || !userDocRef) return;

    const key = getMonthKey(year, month);
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const monthRecords = investmentData[key] || [];
    const existingIndex = monthRecords.findIndex(r => r.date === dateString);
    
    let newRecords: DailyRecord[];
    if (existingIndex >= 0) {
      newRecords = [...monthRecords];
      newRecords[existingIndex] = { date: dateString, totalAmount: amount };
    } else {
      newRecords = [...monthRecords, { date: dateString, totalAmount: amount }];
    }
    
    newRecords.sort((a, b) => a.date.localeCompare(b.date));
    
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

  const deleteRecord = useCallback(async (year: number, month: number, day: number) => {
    if (!userId || !userDocRef) return;

    const key = getMonthKey(year, month);
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const monthRecords = investmentData[key] || [];
    const newRecords = monthRecords.filter(r => r.date !== dateString);
    
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
    
    const sortedRecords = [...records].sort((a, b) => a.date.localeCompare(b.date));
    const firstRecord = sortedRecords[0];
    const lastRecord = sortedRecords[sortedRecords.length - 1];
    
    const firstDay = parseInt(firstRecord.date.split('-')[2]);
    const lastDay = parseInt(lastRecord.date.split('-')[2]);
    
    return {
      yield: lastRecord.totalAmount - firstRecord.totalAmount,
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
