import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return 'N/A';
  const parsed = typeof date === 'string' ? parseISO(date) : new Date(date);
  if (!isValid(parsed)) return 'N/A';
  try {
    return format(parsed, formatStr);
  } catch {
    return 'N/A';
  }
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  const parsed = typeof date === 'string' ? parseISO(date) : new Date(date);
  if (!isValid(parsed)) return 'N/A';
  try {
    return format(parsed, 'MMM dd, yyyy hh:mm a');
  } catch {
    return 'N/A';
  }
};

export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  const parsed = typeof date === 'string' ? parseISO(date) : new Date(date);
  if (!isValid(parsed)) return 'N/A';
  try {
    return formatDistanceToNow(parsed, { addSuffix: true });
  } catch {
    return 'N/A';
  }
};

export const formatMarks = (obtained, total) => {
  return `${obtained}/${total}`;
};

export const formatPercentage = (value) => {
  return `${value.toFixed(2)}%`;
};
