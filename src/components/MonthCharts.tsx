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
import { DailyRecord } from '@/types/investment';
import { formatCurrency } from '@/utils/formatters';

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

const MontanteTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg z-50">
        <p className="font-semibold text-foreground mb-2">{`Dia ${label}`}</p>
        <p className="text-sm">
          <span className="text-muted-foreground">Montante: </span>
          <span className="font-medium text-foreground">
            {formatCurrency(payload[0].value)}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const RendimentoTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const valueColor = value > 0 
      ? 'text-primary' 
      : value < 0 
        ? 'text-destructive' 
        : 'text-muted-foreground';
    
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg z-50">
        <p className="font-semibold text-foreground mb-2">{`Dia ${label}`}</p>
        <p className="text-sm">
          <span className="text-muted-foreground">Rendimento: </span>
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

export const MonthCharts = ({ records, year, month }: MonthChartsProps) => {
  const chartData = useMemo(() => {
    const sorted = [...records].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.timestamp || 0) - (b.timestamp || 0);
    });
    
    const firstAmountRecordIndex = sorted.findIndex(r => !(r.deposit || r.withdrawal));
    
    return sorted.map((record, index) => {
      const day = parseInt(record.date.split('-')[2]);
      const isDepositOrWithdrawal = !!(record.deposit || record.withdrawal);
      let dailyYield = 0;
      
      if (!isDepositOrWithdrawal) {
        if (index === firstAmountRecordIndex) {
          dailyYield = 0;
        } else {
          let previousAmountRecord: DailyRecord | null = null;
          let searchIndex = index - 1;
          
          while (searchIndex >= 0) {
            const candidate = sorted[searchIndex];
            if (!(candidate.deposit || candidate.withdrawal)) {
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
              if (intermediateRecord.deposit) {
                totalDeposits += intermediateRecord.deposit;
              }
              if (intermediateRecord.withdrawal) {
                totalWithdrawals += intermediateRecord.withdrawal;
              }
            }
            
            const deposit = record.deposit || 0;
            const withdrawal = record.withdrawal || 0;
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
  }, [records]);

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

  const dailyYieldData = useMemo(() => {
    return chartData.filter(entry => {
      const day = parseInt(entry.day);
      return isWorkingDay(year, month, day);
    });
  }, [chartData, year, month]);

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Estatísticas do Mês
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <StatItem
            label="Maior ganho"
            value={Math.max(...chartData.map(d => d.rendimento))}
          />
          <StatItem
            label="Rendimento total"
            value={chartData.length > 1 
              ? chartData.slice(1).reduce((sum, d) => sum + d.rendimento, 0)
              : 0
            }
          />
          <StatItem
            label="Média diária"
            value={chartData.length > 1 
              ? chartData.slice(1).reduce((sum, d) => sum + d.rendimento, 0) / getWorkingDaysInMonth(year, month)
              : 0
            }
          />
          <StatItem
            label="Dias registrados"
            value={chartData.length}
            isCount
          />
        </div>
      </div>

      {/* Evolution Chart */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Evolução do Montante
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
              <Tooltip content={<MontanteTooltip />} />
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

      {/* Daily Yield Chart */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Rendimento Diário
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
              <Tooltip content={<RendimentoTooltip />} />
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
