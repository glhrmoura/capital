import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCurrency, getMonthName } from '@/utils/formatters';

interface YieldCardProps {
  yieldValue: number | null;
  firstDay: number | null;
  lastDay: number | null;
  currentAmount: number | null;
  month: number;
  year: number;
  onMonthChange: (year: number, month: number) => void;
}

export const YieldCard = ({ yieldValue, firstDay, lastDay, currentAmount, month, year, onMonthChange }: YieldCardProps) => {
  const isPositive = yieldValue !== null && yieldValue > 0;
  const isNegative = yieldValue !== null && yieldValue < 0;
  
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const isCurrentMonth = year === currentYear && month === currentMonth;

  const goToCurrentMonth = () => {
    onMonthChange(currentYear, currentMonth);
  };
  
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border space-y-4">
      <div className="relative text-center pb-4 border-b border-border">
        {!isCurrentMonth && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToCurrentMonth}
                  className="absolute top-0 right-0 h-7 w-7 rounded-md hover:bg-accent"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Voltar para o mês atual</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <p className="text-sm text-muted-foreground mb-1">Montante Atual</p>
        <p className="text-3xl font-bold text-foreground">
          {currentAmount !== null ? formatCurrency(currentAmount) : '—'}
        </p>
      </div>
      
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
