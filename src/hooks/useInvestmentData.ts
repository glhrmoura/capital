import { useCallback, useMemo } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { DailyRecord, MonthlyData, RecordType, isAmountRecord, UserData } from '@/types/investment';

const getRecordType = (deposit?: number, withdrawal?: number): RecordType => {
  if (deposit !== undefined && deposit > 0) return RecordType.DEPOSIT;
  if (withdrawal !== undefined && withdrawal > 0) return RecordType.WITHDRAWAL;
  return RecordType.AMOUNT;
};


export const useInvestmentData = () => {
  const { user } = useAuth();
  const userId = user?.uid;

  const userDocRef = userId ? doc(db, 'users', userId) : undefined;
  const [data, loading] = useDocumentData<UserData>(userDocRef, {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  const investmentData: MonthlyData = useMemo(() => data?.data || {}, [data?.data]);
  const initialAmount = useMemo(() => data?.initialAmount, [data?.initialAmount]);  

  const getMonthKey = (year: number, month: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
  };

  const getRecordsForMonth = useCallback((year: number, month: number): DailyRecord[] => {
    const key = getMonthKey(year, month);
    return investmentData[key] || [];
  }, [investmentData]);

  const getAllRecords = useCallback((): DailyRecord[] => {
    const allRecords: DailyRecord[] = [];
    Object.values(investmentData).forEach(monthRecords => {
      allRecords.push(...monthRecords);
    });
    return allRecords;
  }, [investmentData]);

  const addOrUpdateRecord = useCallback(async (year: number, month: number, day: number, amount: number, deposit?: number, withdrawal?: number, timestamp?: number) => {
    if (!userId || !userDocRef) return;

    const key = getMonthKey(year, month);
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const monthRecords = investmentData[key] || [];
    
    const type = getRecordType(deposit, withdrawal);
    
    const recordData: DailyRecord = {
      date: dateString,
      totalAmount: amount,
      type,
      timestamp: timestamp || Date.now(),
    };
    
    if (type === RecordType.DEPOSIT && deposit !== undefined && deposit > 0) {
      recordData.value = deposit;
    } else if (type === RecordType.WITHDRAWAL && withdrawal !== undefined && withdrawal > 0) {
      recordData.value = withdrawal;
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
    if (records.length === 0) {
      return null;
    }
    
    const sortedRecords = [...records].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.timestamp || 0) - (b.timestamp || 0);
    });
    
    const amountRecords = sortedRecords.filter(isAmountRecord);
    
    if (amountRecords.length === 0) {
      return null;
    }
    
    if (amountRecords.length === 1 && initialAmount === undefined) {
      return null;
    }
    
    const allRecords = getAllRecords();
    const allSortedRecords = [...allRecords].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.timestamp || 0) - (b.timestamp || 0);
    });
    
    const firstRecord = amountRecords[0];
    const lastRecord = amountRecords[amountRecords.length - 1];
    
    const firstDay = parseInt(firstRecord.date.split('-')[2]);
    const lastDay = parseInt(lastRecord.date.split('-')[2]);
    
    const allAmountRecords = allSortedRecords.filter(isAmountRecord);
    const isFirstRecordGlobal = allAmountRecords.length > 0 && 
      allAmountRecords[0].date === firstRecord.date && 
      (allAmountRecords[0].timestamp || 0) === (firstRecord.timestamp || 0);
    
    const baseAmount = isFirstRecordGlobal && initialAmount !== undefined 
      ? initialAmount 
      : firstRecord.totalAmount;
    
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
    
    for (let i = firstRecordIndex + 1; i < lastRecordIndex; i++) {
      const record = sortedRecords[i];
      if (record.type === RecordType.DEPOSIT && record.value) {
        totalDeposits += record.value;
      }
      if (record.type === RecordType.WITHDRAWAL && record.value) {
        totalWithdrawals += record.value;
      }
    }
    
    if (isFirstRecordGlobal && initialAmount !== undefined) {
      for (let i = 0; i < firstRecordIndex; i++) {
        const record = sortedRecords[i];
        if (record.type === RecordType.DEPOSIT && record.value) {
          totalDeposits += record.value;
        }
        if (record.type === RecordType.WITHDRAWAL && record.value) {
          totalWithdrawals += record.value;
        }
      }
    }
    
    const totalVariation = lastRecord.totalAmount - baseAmount;
    const realYield = totalVariation - (totalDeposits - totalWithdrawals);
    
    return {
      yield: realYield,
      firstDay,
      lastDay,
    };
  }, [getAllRecords, initialAmount]);

  const setInitialAmount = useCallback(async (amount: number) => {
    if (!userId || !userDocRef) return;

    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        await updateDoc(userDocRef, { initialAmount: amount });
      } else {
        await setDoc(userDocRef, { data: {}, initialAmount: amount });
      }
    } catch (error) {
      console.error('Error setting initial amount:', error);
    }
  }, [userId, userDocRef]);

  return {
    loading,
    investmentData,
    initialAmount,
    getRecordsForMonth,
    getAllRecords,
    addOrUpdateRecord,
    deleteRecord,
    calculateYield,
    setInitialAmount,
  };
};
