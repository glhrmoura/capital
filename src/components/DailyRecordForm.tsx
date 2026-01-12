import { useState } from 'react';
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
  onSubmit: (day: number, amount: number) => void;
}

export const DailyRecordForm = ({ year, month, existingRecords, onSubmit }: DailyRecordFormProps) => {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const daysInMonth = getDaysInMonth(year, month);
  const existingDays = existingRecords.map(r => parseInt(r.date.split('-')[2]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const day = parseInt(selectedDay);
    const numericAmount = parseFloat(amount.replace(',', '.'));
    
    if (day && !isNaN(numericAmount) && numericAmount >= 0) {
      onSubmit(day, numericAmount);
      setSelectedDay('');
      setAmount('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Adicionar Registro</h3>
      
      <div className="flex gap-3">
        <Select value={selectedDay} onValueChange={setSelectedDay}>
          <SelectTrigger className="w-24">
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
        
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            R$
          </span>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button type="submit" size="icon" className="shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};
