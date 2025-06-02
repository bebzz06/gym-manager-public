import { format, parseISO } from 'date-fns';

export const formatDateForInput = (isoString: string) => {
  if (!isoString) return '';
  const date = parseISO(isoString);
  return format(date, 'yyyy-MM-dd');
};

export const formatDateForDisplay = (date: Date | string) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM d, yyyy');
};

export const formatDateAndTimeForDisplay = (date: Date | string) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM d, yyyy HH:mm');
};
