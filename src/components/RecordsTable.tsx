import { useState, useMemo } from 'react';
import { Trash2, Pencil, Check, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DailyRecord } from '@/types/investment';
import { formatCurrency } from '@/utils/formatters';

interface RecordsTableProps {
  records: DailyRecord[];
  onUpdate: (day: number, amount: number) => void;
  onDelete: (day: number) => void;
}

export const RecordsTable = ({ records, onUpdate, onDelete }: RecordsTableProps) => {
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Calculate daily yields
  const recordsWithYield = useMemo(() => {
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.map((record, index) => {
      const dailyYield = index === 0 ? 0 : record.totalAmount - sorted[index - 1].totalAmount;
      return { ...record, dailyYield };
    });
  }, [records]);

  const startEditing = (record: DailyRecord) => {
    const day = parseInt(record.date.split('-')[2]);
    setEditingDay(day);
    setEditValue(record.totalAmount.toString().replace('.', ','));
  };

  const cancelEditing = () => {
    setEditingDay(null);
    setEditValue('');
  };

  const saveEdit = () => {
    if (editingDay !== null) {
      const numericAmount = parseFloat(editValue.replace(',', '.'));
      if (!isNaN(numericAmount) && numericAmount >= 0) {
        onUpdate(editingDay, numericAmount);
      }
      cancelEditing();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  if (records.length === 0) {
    return (
      <div className="bg-card rounded-xl p-8 shadow-sm border border-border text-center">
        <p className="text-muted-foreground">
          Nenhum registro para este mês.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione seu primeiro registro acima.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Registros ({records.length} dias)
        </h3>
        <span className="text-xs text-muted-foreground">Rend. Diário</span>
      </div>
      
      <div className="divide-y divide-border">
        {recordsWithYield.map((record) => {
          const day = parseInt(record.date.split('-')[2]);
          const isEditing = editingDay === day;
          const isPositive = record.dailyYield > 0;
          const isNegative = record.dailyYield < 0;
          const isFirst = record.dailyYield === 0 && recordsWithYield[0].date === record.date;
          
          return (
            <div
              key={record.date}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-medium flex items-center justify-center text-sm shrink-0">
                  {String(day).padStart(2, '0')}
                </span>
                
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">R$</span>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-32 h-8"
                      autoFocus
                    />
                  </div>
                ) : (
                  <span className="font-medium text-foreground">
                    {formatCurrency(record.totalAmount)}
                  </span>
                )}
              </div>

              {/* Daily Yield */}
              <div className="flex items-center gap-3">
                {!isEditing && (
                  <div className={`flex items-center gap-1 text-sm min-w-[80px] justify-end ${
                    isFirst 
                      ? 'text-muted-foreground' 
                      : isPositive 
                        ? 'text-primary' 
                        : isNegative 
                          ? 'text-destructive' 
                          : 'text-muted-foreground'
                  }`}>
                    {isFirst ? (
                      <span className="text-xs">—</span>
                    ) : isPositive ? (
                      <>
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>+{formatCurrency(record.dailyYield)}</span>
                      </>
                    ) : isNegative ? (
                      <>
                        <TrendingDown className="h-3.5 w-3.5" />
                        <span>{formatCurrency(record.dailyYield)}</span>
                      </>
                    ) : (
                      <>
                        <Minus className="h-3.5 w-3.5" />
                        <span>{formatCurrency(0)}</span>
                      </>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={saveEdit}
                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={cancelEditing}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditing(record)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(day)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};