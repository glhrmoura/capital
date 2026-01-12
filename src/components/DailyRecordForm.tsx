import { useState, useMemo } from 'react';
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
import { getDaysInMonth } from '@/utils/formatters';
import { DailyRecord } from '@/types/investment';

interface DailyRecordFormProps {
  year: number;
  month: number;
  existingRecords: DailyRecord[];
  onSubmit: (day: number, amount: number, deposit?: number, withdrawal?: number) => void;
}

export const DailyRecordForm = ({ year, month, existingRecords, onSubmit }: DailyRecordFormProps) => {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [recordType, setRecordType] = useState<string>('amount');
  const [value, setValue] = useState<string>('');

  const daysInMonth = getDaysInMonth(year, month);
  const existingDays = existingRecords.map(r => parseInt(r.date.split('-')[2]));

  const sortedRecords = useMemo(() => {
    return [...existingRecords].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.timestamp || 0) - (b.timestamp || 0);
    });
  }, [existingRecords]);

  const getPreviousDayAmount = (day: number): number => {
    const selectedDayNum = parseInt(selectedDay);
    if (!selectedDayNum || sortedRecords.length === 0) return 0;

    const allPreviousRecords = sortedRecords.filter(r => {
      const recordDay = parseInt(r.date.split('-')[2]);
      return recordDay <= selectedDayNum;
    });

    if (allPreviousRecords.length === 0) return 0;
    
    return allPreviousRecords[allPreviousRecords.length - 1].totalAmount;
  };

  const calculateAmount = (): number => {
    const numericValue = parseFloat(value.replace(',', '.')) || 0;
    const previousAmount = getPreviousDayAmount(parseInt(selectedDay));

    if (recordType === 'deposit') {
      return previousAmount + numericValue;
    } else if (recordType === 'withdrawal') {
      return previousAmount - numericValue;
    }
    return numericValue;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const day = parseInt(selectedDay);
    const numericValue = parseFloat(value.replace(',', '.')) || 0;
    
    if (!day || isNaN(numericValue) || numericValue < 0) return;

    const calculatedAmount = calculateAmount();
    const deposit = recordType === 'deposit' ? numericValue : undefined;
    const withdrawal = recordType === 'withdrawal' ? numericValue : undefined;
    
    onSubmit(day, calculatedAmount, deposit, withdrawal);
    setSelectedDay('');
    setRecordType('amount');
    setValue('');
  };

  const previousAmount = getPreviousDayAmount(parseInt(selectedDay));
  const calculatedAmount = selectedDay && value ? calculateAmount() : null;

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Adicionar Registro</h3>
      
      <div className="space-y-3">
        <div className="flex gap-3">
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Dia" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                <SelectItem 
                  key={day} 
                  value={String(day)}
                  className={existingDays.includes(day) ? 'text-primary font-medium' : ''}
                >
                  {String(day).padStart(2, '0')}
                  {existingDays.includes(day) && ' ✓'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={recordType} onValueChange={setRecordType}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="amount">Montante</SelectItem>
              <SelectItem value="deposit">Aporte</SelectItem>
              <SelectItem value="withdrawal">Saque</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            R$
          </span>
          <Input
            type="text"
            inputMode="decimal"
            placeholder={
              recordType === 'amount' 
                ? 'Valor do montante' 
                : recordType === 'deposit' 
                  ? 'Valor do aporte' 
                  : 'Valor do saque'
            }
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="pl-10"
          />
        </div>

        {calculatedAmount !== null && (recordType === 'deposit' || recordType === 'withdrawal') && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {previousAmount > 0 ? 'Montante anterior:' : 'Sem registro anterior'}
              </span>
              <span className="font-medium">
                {previousAmount > 0 ? `R$ ${previousAmount.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
              <span className="text-muted-foreground">Novo montante:</span>
              <span className="font-semibold text-primary">
                R$ {calculatedAmount.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        )}
        
        <Button type="submit" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>
    </form>
  );
};
