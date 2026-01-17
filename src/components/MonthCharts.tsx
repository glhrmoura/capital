import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { DailyRecord, isAmountRecord, isDepositOrWithdrawal, RecordType } from '@/types/investment';
import { formatCurrency } from '@/utils/formatters';
import { useTranslation } from 'react-i18next';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    dataKey?: string;
    color?: string;
  }>;
  label?: string;
}

const MontanteTooltip = ({ active, payload, label, t }: TooltipProps & { t: (key: string) => string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg z-50">
        <p className="font-semibold text-foreground mb-2">{`${t('charts.dayLabel')} ${label}`}</p>
        <p className="text-sm">
          <span className="text-muted-foreground">{t('records.amount')}: </span>
          <span className="font-medium text-foreground">
            {formatCurrency(payload[0].value)}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const RendimentoTooltip = ({ active, payload, label, t }: TooltipProps & { t: (key: string) => string }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const valueColor = value > 0 
      ? 'text-primary' 
      : value < 0 
        ? 'text-destructive' 
        : 'text-muted-foreground';
    
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg z-50">
        <p className="font-semibold text-foreground mb-2">{`${t('charts.dayLabel')} ${label}`}</p>
        <p className="text-sm">
          <span className="text-muted-foreground">{t('records.yield')}: </span>
          <span className={`font-medium ${valueColor}`}>
            {formatCurrency(value)}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

interface MonthChartsProps {
  records: DailyRecord[];
  year: number;
  month: number;
  initialAmount?: number;
  getAllRecords: () => DailyRecord[];
  totalYield?: number;
}

const getWorkingDaysInMonth = (year: number, month: number): number => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let workingDays = 0;
  
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      workingDays++;
    }
  }
  
  return workingDays;
};

const isWorkingDay = (year: number, month: number, day: number): boolean => {
  const date = new Date(year, month, day);
  const dayOfWeek = date.getDay();
  return dayOfWeek >= 1 && dayOfWeek <= 5;
};

const getWorkingDaysUntilToday = (year: number, month: number): number => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  
  if (year !== currentYear || month !== currentMonth) {
    return getWorkingDaysInMonth(year, month);
  }
  
  let workingDays = 0;
  for (let day = 1; day <= currentDay; day++) {
    if (isWorkingDay(year, month, day)) {
      workingDays++;
    }
  }
  
  return workingDays;
};

export const MonthCharts = ({ records, year, month, initialAmount, getAllRecords, totalYield: totalYieldProp }: MonthChartsProps) => {
  const { t } = useTranslation();
  const chartData = useMemo(() => {
    const sorted = [...records].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.timestamp || 0) - (b.timestamp || 0);
    });
    
    const allRecords = getAllRecords();
    const allSortedRecords = [...allRecords].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.timestamp || 0) - (b.timestamp || 0);
    });
    
    const firstAmountRecordIndex = sorted.findIndex(isAmountRecord);
    
    return sorted.map((record, index) => {
      const day = parseInt(record.date.split('-')[2]);
      const isDepositOrWithdrawalRecord = isDepositOrWithdrawal(record);
      let dailyYield = 0;
      
      if (!isDepositOrWithdrawalRecord) {
        if (index === firstAmountRecordIndex) {
          const allAmountRecords = allSortedRecords.filter(isAmountRecord);
          const isFirstRecordGlobal = allAmountRecords.length > 0 && 
            allAmountRecords[0].date === record.date && 
            (allAmountRecords[0].timestamp || 0) === (record.timestamp || 0);
          
          if (isFirstRecordGlobal && initialAmount !== undefined) {
            let totalDeposits = 0;
            let totalWithdrawals = 0;
            
            for (let i = 0; i < index; i++) {
              const intermediateRecord = sorted[i];
              if (intermediateRecord.type === RecordType.DEPOSIT && intermediateRecord.value) {
                totalDeposits += intermediateRecord.value;
              }
              if (intermediateRecord.type === RecordType.WITHDRAWAL && intermediateRecord.value) {
                totalWithdrawals += intermediateRecord.value;
              }
            }
            
            const totalVariation = record.totalAmount - initialAmount;
            dailyYield = totalVariation - (totalDeposits - totalWithdrawals);
          } else {
            dailyYield = 0;
          }
        } else {
          let previousAmountRecord: DailyRecord | null = null;
          let searchIndex = index - 1;
          
          while (searchIndex >= 0) {
            const candidate = sorted[searchIndex];
            if (isAmountRecord(candidate)) {
              previousAmountRecord = candidate;
              break;
            }
            searchIndex--;
          }
          
          if (previousAmountRecord) {
            const previousIndex = sorted.findIndex(r => 
              r.date === previousAmountRecord.date && 
              (r.timestamp || 0) === (previousAmountRecord.timestamp || 0)
            );
            
            let totalDeposits = 0;
            let totalWithdrawals = 0;
            
          for (let i = previousIndex + 1; i < index; i++) {
            const intermediateRecord = sorted[i];
            if (intermediateRecord.type === RecordType.DEPOSIT && intermediateRecord.value) {
              totalDeposits += intermediateRecord.value;
            }
            if (intermediateRecord.type === RecordType.WITHDRAWAL && intermediateRecord.value) {
              totalWithdrawals += intermediateRecord.value;
            }
          }
          
          const deposit = record.type === RecordType.DEPOSIT ? (record.value || 0) : 0;
          const withdrawal = record.type === RecordType.WITHDRAWAL ? (record.value || 0) : 0;
          totalDeposits += deposit;
          totalWithdrawals += withdrawal;
            
            const totalVariation = record.totalAmount - previousAmountRecord.totalAmount;
            dailyYield = totalVariation - (totalDeposits - totalWithdrawals);
          }
        }
      }
      
      return {
        day: `${day}`,
        montante: record.totalAmount,
        rendimento: dailyYield,
      };
    });
  }, [records, initialAmount, getAllRecords]);

  const dailyYieldData = useMemo(() => {
    return chartData.filter(entry => {
      const day = parseInt(entry.day);
      return isWorkingDay(year, month, day);
    });
  }, [chartData, year, month]);

  const totalYield = useMemo(() => {
    if (totalYieldProp !== undefined) {
      return totalYieldProp;
    }
    const workingDaysData = chartData.filter(entry => {
      const day = parseInt(entry.day);
      return isWorkingDay(year, month, day);
    });
    return workingDaysData.length > 1 
      ? workingDaysData.slice(1).reduce((sum, d) => sum + d.rendimento, 0)
      : 0;
  }, [chartData, year, month, totalYieldProp]);

  const workingDaysPassed = useMemo(() => {
    const uniqueDays = new Set(chartData.map(d => parseInt(d.day)));
    return Array.from(uniqueDays).filter(day => isWorkingDay(year, month, day)).length;
  }, [chartData, year, month]);

  if (records.length === 0) {
    return (
      <div className="bg-card rounded-xl p-8 shadow-sm border border-border text-center">
        <p className="text-muted-foreground">
          Nenhum registro para exibir gráficos.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione registros na aba "Registros".
        </p>
      </div>
    );
  }

  const totalWorkingDays = getWorkingDaysInMonth(year, month);
  const workingDaysUntilToday = getWorkingDaysUntilToday(year, month);
  const remainingWorkingDays = Math.max(0, totalWorkingDays - workingDaysUntilToday);
  const currentDailyAverage = workingDaysUntilToday > 0 ? totalYield / workingDaysUntilToday : 0;
  const projectedAdditionalYield = currentDailyAverage * remainingWorkingDays;
  const projectedTotalYield = totalYield + projectedAdditionalYield;

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          {t('charts.monthStats')}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <StatItem
            label={t('charts.dailyAverage')}
            value={workingDaysUntilToday > 0 
              ? totalYield / workingDaysUntilToday
              : 0
            }
          />
          <StatItem
            label={t('charts.totalYield')}
            value={totalYield}
          />
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          {t('charts.amountEvolution')}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                className="text-muted-foreground"
              />
              <Tooltip content={<MontanteTooltip t={t} />} />
              <Line
                type="monotone"
                dataKey="montante"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          {t('charts.dailyYield')}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyYieldData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value >= 0 ? '+' : ''}${value}`}
                className="text-muted-foreground"
              />
              <Tooltip content={<RendimentoTooltip t={t} />} />
              <Bar dataKey="rendimento" radius={[4, 4, 0, 0]}>
                {dailyYieldData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.rendimento > 0
                        ? 'hsl(var(--primary))'
                        : entry.rendimento < 0
                        ? 'hsl(var(--destructive))'
                        : 'hsl(var(--muted))'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, isCount = false }: { label: string; value: number; isCount?: boolean }) => (
  <div className="text-center p-3 bg-muted/50 rounded-lg">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className={`font-semibold ${
      isCount 
        ? 'text-foreground' 
        : value > 0 
          ? 'text-primary' 
          : value < 0 
            ? 'text-destructive' 
            : 'text-muted-foreground'
    }`}>
      {isCount ? value : formatCurrency(value)}
    </p>
  </div>
);
