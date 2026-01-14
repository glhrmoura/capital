import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/formatters';

interface InitialAmountDialogProps {
  open: boolean;
  onSave: (amount: number) => void;
}

export const InitialAmountDialog = ({ open, onSave }: InitialAmountDialogProps) => {
  const [value, setValue] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseCurrencyInput(value);
    if (numericValue > 0) {
      onSave(numericValue);
      setValue('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Definir Montante Inicial</DialogTitle>
          <DialogDescription>
            Informe o valor inicial do seu investimento para começar a acompanhar seus rendimentos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              }}
              className="pl-10"
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={!value || parseCurrencyInput(value) <= 0}>
            Salvar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
