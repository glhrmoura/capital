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

interface MonthChartsProps {
  records: DailyRecord[];
}

export const MonthCharts = ({ records }: MonthChartsProps) => {
  const chartData = useMemo(() => {
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.map((record, index) => {
      const day = parseInt(record.date.split('-')[2]);
      const dailyYield = index === 0 ? 0 : record.totalAmount - sorted[index - 1].totalAmount;
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

  return (
    <div className="space-y-4">
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
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [formatCurrency(value), 'Montante']}
                labelFormatter={(label) => `Dia ${label}`}
              />
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
            <BarChart data={chartData}>
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
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [formatCurrency(value), 'Rendimento']}
                labelFormatter={(label) => `Dia ${label}`}
              />
              <Bar dataKey="rendimento" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
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
            label="Maior perda"
            value={Math.min(...chartData.map(d => d.rendimento))}
          />
          <StatItem
            label="Média diária"
            value={chartData.length > 1 
              ? chartData.slice(1).reduce((sum, d) => sum + d.rendimento, 0) / (chartData.length - 1)
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
