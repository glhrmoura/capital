import { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getDaysInMonth, formatCurrencyInput, parseCurrencyInput, formatCurrency } from '@/utils/formatters';
import { DailyRecord, RecordType } from '@/types/investment';
import { useTranslation } from 'react-i18next';

interface DailyRecordFormProps {
  year: number;
  month: number;
  existingRecords: DailyRecord[];
  initialAmount?: number;
  onSubmit: (day: number, amount: number, deposit?: number, withdrawal?: number) => void;
}

export const DailyRecordForm = ({ year, month, existingRecords, initialAmount, onSubmit }: DailyRecordFormProps) => {
  const { t } = useTranslation();
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const isCurrentMonth = year === currentYear && month === currentMonth;
  const defaultDay = isCurrentMonth ? String(currentDay) : '';
  
  const [selectedDay, setSelectedDay] = useState<string>(defaultDay);
  const [recordType, setRecordType] = useState<RecordType>(RecordType.AMOUNT);
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');

  const daysInMonth = getDaysInMonth(year, month);

  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    if (year === currentYear && month === currentMonth) {
      setSelectedDay(String(currentDay));
    } else if (!selectedDay) {
      setSelectedDay('');
    }
  }, [year, month]);

  const sortedRecords = useMemo(() => {
    return [...existingRecords].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.timestamp || 0) - (b.timestamp || 0);
    });
  }, [existingRecords]);

  const getPreviousDayAmount = (day: number): number => {
    const selectedDayNum = parseInt(selectedDay);
    if (!selectedDayNum) return initialAmount || 0;

    const allPreviousRecords = sortedRecords.filter(r => {
      const recordDay = parseInt(r.date.split('-')[2]);
      return recordDay <= selectedDayNum;
    });

    if (allPreviousRecords.length === 0) return initialAmount || 0;
    
    return allPreviousRecords[allPreviousRecords.length - 1].totalAmount;
  };

  const calculateAmount = (): number => {
    const numericValue = parseCurrencyInput(value);
    const previousAmount = getPreviousDayAmount(parseInt(selectedDay));

    if (recordType === RecordType.DEPOSIT) {
      return previousAmount + numericValue;
    } else if (recordType === RecordType.WITHDRAWAL) {
      return previousAmount - numericValue;
    }
    return numericValue;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const day = parseInt(selectedDay);
    const numericValue = parseCurrencyInput(value);
    
    if (!day) {
      setError(t('records.selectDayError'));
      return;
    }

    if (isNaN(numericValue) || numericValue <= 0) {
      setError(t('records.valueZeroError'));
      return;
    }

    setError('');
    const calculatedAmount = calculateAmount();
    const deposit = recordType === RecordType.DEPOSIT ? numericValue : undefined;
    const withdrawal = recordType === RecordType.WITHDRAWAL ? numericValue : undefined;
    
    onSubmit(day, calculatedAmount, deposit, withdrawal);
    setSelectedDay('');
    setRecordType(RecordType.AMOUNT);
    setValue('');
  };

  const previousAmount = getPreviousDayAmount(parseInt(selectedDay));
  const calculatedAmount = selectedDay && value ? calculateAmount() : null;

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('records.addRecord')}</h3>
      
      <div className="space-y-3">
        <div className="flex gap-3">
          <Select value={selectedDay} onValueChange={setSelectedDay} modal={false}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t('records.day')} />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                <SelectItem 
                  key={day} 
                  value={String(day)}
                >
                  {String(day).padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={recordType} onValueChange={(value) => setRecordType(value as RecordType)} modal={false}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={t('records.type')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={RecordType.AMOUNT}>{t('records.amount')}</SelectItem>
              <SelectItem value={RecordType.DEPOSIT}>{t('records.deposit')}</SelectItem>
              <SelectItem value={RecordType.WITHDRAWAL}>{t('records.withdrawal')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              R$
            </span>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={value}
              onChange={(e) => {
                const formatted = formatCurrencyInput(e.target.value);
                setValue(formatted);
                setError('');
              }}
              className={`pl-10 ${error ? 'border-destructive' : ''}`}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive mt-1">{error}</p>
          )}
        </div>

        {calculatedAmount !== null && (recordType === RecordType.DEPOSIT || recordType === RecordType.WITHDRAWAL) && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {previousAmount > 0 ? t('records.previousAmount') : t('records.noPreviousRecord')}
              </span>
              <span className="font-medium">
                {formatCurrency(previousAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
              <span className="text-muted-foreground">{t('records.newAmount')}</span>
              <span className="font-semibold text-primary">
                {formatCurrency(calculatedAmount)}
              </span>
            </div>
          </div>
        )}
        
        <Button type="submit" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          {t('common.add')}
        </Button>
      </div>
    </form>
  );
};
