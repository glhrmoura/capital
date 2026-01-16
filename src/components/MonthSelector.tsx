import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const getMonthName = (month: number, t: (key: string) => string): string => {
  const months = [
    t('monthSelector.january'),
    t('monthSelector.february'),
    t('monthSelector.march'),
    t('monthSelector.april'),
    t('monthSelector.may'),
    t('monthSelector.june'),
    t('monthSelector.july'),
    t('monthSelector.august'),
    t('monthSelector.september'),
    t('monthSelector.october'),
    t('monthSelector.november'),
    t('monthSelector.december'),
  ];
  return months[month];
};

interface MonthSelectorProps {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
}

export const MonthSelector = ({ year, month, onMonthChange }: MonthSelectorProps) => {
  const { t } = useTranslation();
  const goToPreviousMonth = () => {
    if (month === 0) {
      onMonthChange(year - 1, 11);
    } else {
      onMonthChange(year, month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 11) {
      onMonthChange(year + 1, 0);
    } else {
      onMonthChange(year, month + 1);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 bg-card rounded-xl p-4 shadow-sm border border-border">
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPreviousMonth}
        className="h-10 w-10 rounded-lg hover:bg-accent"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <div className="text-center flex-1">
        <h2 className="text-xl font-semibold text-foreground">
          {getMonthName(month, t)}
        </h2>
        <p className="text-sm text-muted-foreground">{year}</p>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={goToNextMonth}
        className="h-10 w-10 rounded-lg hover:bg-accent"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
};
