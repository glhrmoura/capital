import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, getMonthName } from '@/utils/formatters';

interface YieldCardProps {
  yieldValue: number | null;
  firstDay: number | null;
  lastDay: number | null;
  currentAmount: number | null;
  month: number;
}

export const YieldCard = ({ yieldValue, firstDay, lastDay, currentAmount, month }: YieldCardProps) => {
  const isPositive = yieldValue !== null && yieldValue > 0;
  const isNegative = yieldValue !== null && yieldValue < 0;
  
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border space-y-4">
      {/* Current Amount */}
      <div className="text-center pb-4 border-b border-border">
        <p className="text-sm text-muted-foreground mb-1">Montante Atual</p>
        <p className="text-3xl font-bold text-foreground">
          {currentAmount !== null ? formatCurrency(currentAmount) : '—'}
        </p>
      </div>
      
      {/* Yield */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">Rendimento do Mês</p>
        
        {yieldValue !== null ? (
          <>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              isPositive 
                ? 'bg-accent text-accent-foreground' 
                : isNegative 
                  ? 'bg-destructive/10 text-destructive' 
                  : 'bg-muted text-muted-foreground'
            }`}>
              {isPositive ? (
                <TrendingUp className="h-5 w-5" />
              ) : isNegative ? (
                <TrendingDown className="h-5 w-5" />
              ) : (
                <Minus className="h-5 w-5" />
              )}
              <span className="text-xl font-bold">
                {isPositive ? '+' : ''}{formatCurrency(yieldValue)}
              </span>
            </div>
            
            <p className="mt-3 text-sm text-muted-foreground">
              {getMonthName(month)} rendeu{' '}
              <span className={isPositive ? 'text-primary font-medium' : isNegative ? 'text-destructive font-medium' : ''}>
                {formatCurrency(Math.abs(yieldValue))}
              </span>
              {' '}até o dia {lastDay}
            </p>
          </>
        ) : (
          <div className="text-muted-foreground">
            <Minus className="h-5 w-5 mx-auto mb-2" />
            <p className="text-sm">
              Adicione pelo menos 2 dias para calcular o rendimento
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
