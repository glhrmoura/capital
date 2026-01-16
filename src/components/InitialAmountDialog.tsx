import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrencyInput, parseCurrencyInput, formatCurrency } from '@/utils/formatters';
import { useTranslation } from 'react-i18next';

interface InitialAmountDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  initialValue?: number;
  onSave: (amount: number) => void;
}

export const InitialAmountDialog = ({ open, onOpenChange, initialValue, onSave }: InitialAmountDialogProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    if (open && initialValue !== undefined) {
      const cents = Math.round(initialValue * 100).toString();
      const formatted = formatCurrencyInput(cents);
      setValue(formatted);
    } else if (open) {
      setValue('');
    }
  }, [open, initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseCurrencyInput(value);
    if (numericValue > 0) {
      onSave(numericValue);
      if (onOpenChange) {
        onOpenChange(false);
      }
      if (initialValue === undefined) {
        setValue('');
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const isEditMode = initialValue !== undefined;

  return (
    <Dialog open={open} onOpenChange={isEditMode ? handleOpenChange : () => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => {
        if (!isEditMode) {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('initialAmount.editTitle') : t('initialAmount.defineTitle')}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? t('initialAmount.editDescription')
              : t('initialAmount.defineDescription')
            }
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
          <div className="flex gap-2">
            {isEditMode && (
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => handleOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
            )}
            <Button type="submit" className={isEditMode ? "flex-1" : "w-full"} disabled={!value || parseCurrencyInput(value) <= 0}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
