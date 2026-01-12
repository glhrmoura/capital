import { useState, useMemo } from 'react';
import { Trash2, Pencil, Check, X, TrendingUp, TrendingDown, Minus, Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DailyRecord } from '@/types/investment';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '@/utils/formatters';

interface RecordsTableProps {
  records: DailyRecord[];
  onUpdate: (day: number, amount: number, deposit?: number, withdrawal?: number, timestamp?: number) => void;
  onDelete: (day: number, timestamp?: number) => void;
}

export const RecordsTable = ({ records, onUpdate, onDelete }: RecordsTableProps) => {
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editDeposit, setEditDeposit] = useState<string>('');
  const [editWithdrawal, setEditWithdrawal] = useState<string>('');

  // Calculate daily yields
  const recordsWithYield = useMemo(() => {
    const sorted = [...records].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.timestamp || 0) - (b.timestamp || 0);
    });
    
    const firstAmountRecordIndex = sorted.findIndex(r => !(r.deposit || r.withdrawal));
    
    return sorted.map((record, index) => {
      const isDepositOrWithdrawal = !!(record.deposit || record.withdrawal);
      
      if (isDepositOrWithdrawal) {
        return { ...record, dailyYield: 0 };
      }
      
      if (index === firstAmountRecordIndex) {
        return { ...record, dailyYield: 0 };
      }
      
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
      
      if (!previousAmountRecord) {
        return { ...record, dailyYield: 0 };
      }
      
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
      const dailyYield = totalVariation - (totalDeposits - totalWithdrawals);
      
      return { ...record, dailyYield };
    });
  }, [records]);

  const getPreviousDayAmount = (day: number, currentRecord: DailyRecord): number => {
    const sorted = [...records].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.timestamp || 0) - (b.timestamp || 0);
    });

    const currentIndex = sorted.findIndex(r => 
      r.date === currentRecord.date && (r.timestamp || 0) === (currentRecord.timestamp || 0)
    );

    if (currentIndex === 0) return 0;

    const previousRecord = sorted[currentIndex - 1];
    return previousRecord.totalAmount;
  };

  const startEditing = (record: DailyRecord) => {
    const recordId = `${record.date}-${record.timestamp || 0}`;
    setEditingRecordId(recordId);
    const day = parseInt(record.date.split('-')[2]);
    setEditingDay(day);
    
    if (record.deposit || record.withdrawal) {
      setEditValue('');
      if (record.deposit) {
        const depositStr = Math.round(record.deposit * 100).toString();
        setEditDeposit(formatCurrencyInput(depositStr));
      } else {
        setEditDeposit('');
      }
      if (record.withdrawal) {
        const withdrawalStr = Math.round(record.withdrawal * 100).toString();
        setEditWithdrawal(formatCurrencyInput(withdrawalStr));
      } else {
        setEditWithdrawal('');
      }
    } else {
      const amountStr = Math.round(record.totalAmount * 100).toString();
      setEditValue(formatCurrencyInput(amountStr));
      setEditDeposit('');
      setEditWithdrawal('');
    }
  };

  const cancelEditing = () => {
    setEditingDay(null);
    setEditingRecordId(null);
    setEditValue('');
    setEditDeposit('');
    setEditWithdrawal('');
  };

  const saveEdit = () => {
    if (editingRecordId !== null && editingDay !== null) {
      const record = recordsWithYield.find(r => `${r.date}-${r.timestamp || 0}` === editingRecordId);
      if (!record) return;
      
      const numericDeposit = editDeposit ? parseCurrencyInput(editDeposit) : undefined;
      const numericWithdrawal = editWithdrawal ? parseCurrencyInput(editWithdrawal) : undefined;
      
      let numericAmount: number;
      if (numericDeposit || numericWithdrawal) {
        const previousAmount = getPreviousDayAmount(editingDay, record);
        if (numericDeposit) {
          numericAmount = previousAmount + numericDeposit;
        } else if (numericWithdrawal) {
          numericAmount = previousAmount - numericWithdrawal;
        } else {
          numericAmount = previousAmount;
        }
      } else {
        numericAmount = parseCurrencyInput(editValue);
      }
      
      if (!isNaN(numericAmount) && numericAmount >= 0) {
        onUpdate(editingDay, numericAmount, numericDeposit, numericWithdrawal, record.timestamp);
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
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-medium text-muted-foreground">
          Registros ({records.length} dias)
        </h3>
      </div>
      
      <div className="divide-y divide-border">
        {recordsWithYield.map((record) => {
          const day = parseInt(record.date.split('-')[2]);
          const recordId = `${record.date}-${record.timestamp || 0}`;
          const isEditing = editingRecordId === recordId;
          const isDepositOrWithdrawal = !!(record.deposit || record.withdrawal);
          const isPositive = record.dailyYield > 0;
          const isNegative = record.dailyYield < 0;
          const isFirst = record.dailyYield === 0 && recordsWithYield[0].date === record.date;
          
          return (
            <div
              key={`${record.date}-${record.timestamp || 0}`}
              className="flex items-start justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  record.deposit 
                    ? 'bg-primary/10 text-primary' 
                    : record.withdrawal 
                      ? 'bg-destructive/10 text-destructive' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {record.deposit ? (
                    <ArrowUpCircle className="h-5 w-5" />
                  ) : record.withdrawal ? (
                    <ArrowDownCircle className="h-5 w-5" />
                  ) : (
                    <Wallet className="h-5 w-5" />
                  )}
                </div>
                
                <div className="flex-1">
                  {isEditing ? (
                    <div className="flex flex-col gap-2 w-full">
                      {record.deposit || record.withdrawal ? (
                        <>
                          {record.deposit && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-sm text-primary">Aporte: R$</span>
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={editDeposit}
                                onChange={(e) => {
                                  const formatted = formatCurrencyInput(e.target.value);
                                  setEditDeposit(formatted);
                                }}
                                onKeyDown={handleKeyDown}
                                className="w-32 h-8"
                                placeholder="Valor do aporte"
                                autoFocus
                              />
                            </div>
                          )}
                          {record.withdrawal && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-sm text-destructive">Saque: R$</span>
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={editWithdrawal}
                                onChange={(e) => {
                                  const formatted = formatCurrencyInput(e.target.value);
                                  setEditWithdrawal(formatted);
                                }}
                                onKeyDown={handleKeyDown}
                                className="w-32 h-8"
                                placeholder="Valor do saque"
                                autoFocus
                              />
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            Montante: {formatCurrency(
                              (() => {
                                const previousAmount = getPreviousDayAmount(day, record);
                                const deposit = editDeposit ? parseCurrencyInput(editDeposit) : 0;
                                const withdrawal = editWithdrawal ? parseCurrencyInput(editWithdrawal) : 0;
                                return previousAmount + deposit - withdrawal;
                              })()
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-sm">R$</span>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={editValue}
                            onChange={(e) => {
                              const formatted = formatCurrencyInput(e.target.value);
                              setEditValue(formatted);
                            }}
                            onKeyDown={handleKeyDown}
                            className="w-32 h-8"
                            placeholder="Total"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {formatCurrency(record.totalAmount)}
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        Dia {String(day).padStart(2, '0')}
                      </span>
                      {(record.deposit || record.withdrawal) && (
                        <div className="flex items-center gap-2 text-xs mt-1">
                          {record.deposit && (
                            <span className="text-primary">+{formatCurrency(record.deposit)}</span>
                          )}
                          {record.withdrawal && (
                            <span className="text-destructive">-{formatCurrency(record.withdrawal)}</span>
                          )}
                        </div>
                      )}
                      {!isEditing && !isDepositOrWithdrawal && (
                        <div className={`flex items-center gap-1 text-xs mt-1 ${
                          isFirst 
                            ? 'text-muted-foreground' 
                            : isPositive 
                              ? 'text-primary' 
                              : isNegative 
                                ? 'text-destructive' 
                                : 'text-muted-foreground'
                        }`}>
                          {isFirst ? (
                            <span>—</span>
                          ) : isPositive ? (
                            <>
                              <TrendingUp className="h-3 w-3" />
                              <span>+{formatCurrency(record.dailyYield)}</span>
                            </>
                          ) : isNegative ? (
                            <>
                              <TrendingDown className="h-3 w-3" />
                              <span>{formatCurrency(record.dailyYield)}</span>
                            </>
                          ) : (
                            <>
                              <Minus className="h-3 w-3" />
                              <span>{formatCurrency(0)}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
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
                        onClick={() => onDelete(day, record.timestamp)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};