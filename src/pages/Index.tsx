import { useState, useMemo } from 'react';
import { List, BarChart3 } from 'lucide-react';
import { MonthSelector } from '@/components/MonthSelector';
import { YieldCard } from '@/components/YieldCard';
import { DailyRecordForm } from '@/components/DailyRecordForm';
import { RecordsTable } from '@/components/RecordsTable';
import { MonthCharts } from '@/components/MonthCharts';
import { UserMenu } from '@/components/UserMenu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useInvestmentData } from '@/hooks/useInvestmentData';
import { DailyRecord } from '@/types/investment';
import { InitialAmountDialog } from '@/components/InitialAmountDialog';
import { useTranslation } from 'react-i18next';
import { BottomNav } from '@/components/BottomNav';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());

  const { loading, investmentData, initialAmount, getRecordsForMonth, getAllRecords, addOrUpdateRecord, deleteRecord, calculateYield, setInitialAmount } = useInvestmentData();

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

  const handleAddRecord = (day: number, amount: number, deposit?: number, withdrawal?: number) => {
    addOrUpdateRecord(selectedYear, selectedMonth, day, amount, deposit, withdrawal);
  };

  const handleUpdateRecord = (day: number, amount: number, deposit?: number, withdrawal?: number, timestamp?: number) => {
    addOrUpdateRecord(selectedYear, selectedMonth, day, amount, deposit, withdrawal, timestamp);
  };

  const handleDeleteRecord = (day: number, timestamp?: number) => {
    deleteRecord(selectedYear, selectedMonth, day, timestamp);
  };

  const handleSetInitialAmount = (amount: number) => {
    setInitialAmount(amount);
  };

  return (
    <div className="min-h-dvh bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/icons/icon-192x192.png" 
                alt="Capital" 
                className="w-10 h-10 rounded-xl"
              />
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {t('app.name')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t('app.subtitle')}
                </p>
              </div>
            </div>
            {!isMobile && (
              <div className="flex items-center gap-2">
                <UserMenu />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 space-y-4" style={{ paddingBottom: isMobile ? '5rem' : '1.5rem' }}>
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
            {!isMobile && (
              <div className="flex gap-2">
                <Skeleton className="h-10 w-20 rounded-md" />
                <Skeleton className="h-10 flex-1 rounded-md" />
              </div>
            )}
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>
        ) : isMobile ? (
          <div className="space-y-4">
            <DailyRecordForm
              year={selectedYear}
              month={selectedMonth}
              existingRecords={records}
              initialAmount={initialAmount}
              onSubmit={handleAddRecord}
            />

            <RecordsTable
              records={records}
              initialAmount={initialAmount}
              getAllRecords={getAllRecords}
              onUpdate={handleUpdateRecord}
              onDelete={handleDeleteRecord}
            />
          </div>
        ) : (
          <Tabs defaultValue="registros" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="registros" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                {t('records.title')}
              </TabsTrigger>
              <TabsTrigger value="graficos" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {t('charts.title')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="registros" className="space-y-4 mt-0">
              <DailyRecordForm
                year={selectedYear}
                month={selectedMonth}
                existingRecords={records}
                initialAmount={initialAmount}
                onSubmit={handleAddRecord}
              />

              <RecordsTable
                records={records}
                initialAmount={initialAmount}
                getAllRecords={getAllRecords}
                onUpdate={handleUpdateRecord}
                onDelete={handleDeleteRecord}
              />
            </TabsContent>

            <TabsContent value="graficos" className="mt-0">
              <MonthCharts 
                records={records} 
                year={selectedYear} 
                month={selectedMonth}
                initialAmount={initialAmount}
                getAllRecords={getAllRecords}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {!loading && initialAmount === undefined && (
        <InitialAmountDialog 
          open={true} 
          onSave={handleSetInitialAmount} 
        />
      )}

      <BottomNav />
    </div>
  );
};

export default Index;
