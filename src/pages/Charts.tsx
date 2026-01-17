import { useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MonthSelector } from '@/components/MonthSelector';
import { MonthCharts } from '@/components/MonthCharts';
import { YieldCard } from '@/components/YieldCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useInvestmentData } from '@/hooks/useInvestmentData';
import { DailyRecord } from '@/types/investment';
import { useTranslation } from 'react-i18next';
import { BottomNav } from '@/components/BottomNav';

const Charts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());

  const { loading, investmentData, initialAmount, getRecordsForMonth, getAllRecords, calculateYield } = useInvestmentData();

  const records = useMemo(
    () => getRecordsForMonth(selectedYear, selectedMonth),
    [getRecordsForMonth, selectedYear, selectedMonth]
  );

  const yieldData = useMemo(
    () => calculateYield(records),
    [calculateYield, records]
  );

  const currentAmount = useMemo(() => {
    const allRecords: DailyRecord[] = [];
    Object.values(investmentData).forEach(monthRecords => {
      allRecords.push(...monthRecords);
    });
    
    if (allRecords.length === 0) return initialAmount ?? null;
    
    const sortedRecords = [...allRecords].sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return (b.timestamp || 0) - (a.timestamp || 0);
    });
    
    return sortedRecords[0].totalAmount;
  }, [investmentData, initialAmount]);

  const handleMonthChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  return (
    <div className="min-h-dvh bg-background pb-20">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {t('charts.title')}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-6 space-y-4">
        <MonthSelector
          year={selectedYear}
          month={selectedMonth}
          onMonthChange={handleMonthChange}
        />

        {loading ? (
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border space-y-4">
            <div className="text-center pb-4 border-b border-border">
              <Skeleton className="h-4 w-24 mx-auto mb-2" />
              <Skeleton className="h-10 w-40 mx-auto" />
            </div>
            <div className="text-center">
              <Skeleton className="h-4 w-32 mx-auto mb-2" />
              <Skeleton className="h-12 w-48 mx-auto rounded-full" />
              <Skeleton className="h-4 w-56 mx-auto mt-3" />
            </div>
          </div>
        ) : (
          <YieldCard
            yieldValue={yieldData?.yield ?? null}
            firstDay={yieldData?.firstDay ?? null}
            lastDay={yieldData?.lastDay ?? null}
            currentAmount={currentAmount}
            month={selectedMonth}
            year={selectedYear}
            onMonthChange={handleMonthChange}
          />
        )}

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ) : (
          <MonthCharts 
            records={records} 
            year={selectedYear} 
            month={selectedMonth}
            initialAmount={initialAmount}
            getAllRecords={getAllRecords}
            totalYield={yieldData?.yield}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Charts;
