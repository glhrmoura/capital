export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
  });
};

export const getMonthName = (month: number): string => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[month];
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const formatCurrencyInput = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers === '') return '';
  
  const cents = parseInt(numbers, 10);
  const formatted = (cents / 100).toFixed(2);
  
  return formatted.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseCurrencyInput = (value: string): number => {
  const numbers = value.replace(/\D/g, '');
  if (numbers === '') return 0;
  return parseInt(numbers, 10) / 100;
};
