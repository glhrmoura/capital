import { useState, useMemo } from 'react';
import { List, BarChart3 } from 'lucide-react';
import { MonthSelector } from '@/components/MonthSelector';
import { YieldCard } from '@/components/YieldCard';
import { DailyRecordForm } from '@/components/DailyRecordForm';
import { RecordsTable } from '@/components/RecordsTable';
import { MonthCharts } from '@/components/MonthCharts';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInvestmentData } from '@/hooks/useInvestmentData';

const Index = () => {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());

  const { getRecordsForMonth, addOrUpdateRecord, deleteRecord, calculateYield } = useInvestmentData();

  const records = useMemo(
    () => getRecordsForMonth(selectedYear, selectedMonth),
    [getRecordsForMonth, selectedYear, selectedMonth]
  );

  const yieldData = useMemo(
    () => calculateYield(records),
    [calculateYield, records]
  );

  const currentAmount = useMemo(() => {
    if (records.length === 0) return null;
    const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));
    return sortedRecords[0].totalAmount;
  }, [records]);

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

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
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
                  Capital
                </h1>
                <p className="text-sm text-muted-foreground">
                  Acompanhe seus rendimentos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 pt-24 pb-6 space-y-4">
        <MonthSelector
          year={selectedYear}
          month={selectedMonth}
          onMonthChange={handleMonthChange}
        />

        <YieldCard
          yieldValue={yieldData?.yield ?? null}
          firstDay={yieldData?.firstDay ?? null}
          lastDay={yieldData?.lastDay ?? null}
          currentAmount={currentAmount}
          month={selectedMonth}
        />

        <Tabs defaultValue="registros" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="registros" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Registros
            </TabsTrigger>
            <TabsTrigger value="graficos" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Gráficos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registros" className="space-y-4 mt-0">
            <DailyRecordForm
              year={selectedYear}
              month={selectedMonth}
              existingRecords={records}
              onSubmit={handleAddRecord}
            />

            <RecordsTable
              records={records}
              onUpdate={handleUpdateRecord}
              onDelete={handleDeleteRecord}
            />
          </TabsContent>

          <TabsContent value="graficos" className="mt-0">
            <MonthCharts records={records} year={selectedYear} month={selectedMonth} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="text-center py-4 text-xs text-muted-foreground">
        Capital © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Index;
