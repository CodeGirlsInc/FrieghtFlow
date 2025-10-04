import { format, formatDistanceToNow } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

export const formatDate = (
  date: Date | string,
  formatStr = 'PPpp'
): string => {

  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return format(d, formatStr);
};

export const formatRelativeTime = (date: Date | string): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return formatDistanceToNow(d, { addSuffix: true });
};

export const convertTimezone = (
  date: Date | string,
  timezone: string,
  formatStr = 'yyyy-MM-dd HH:mm:ssXXX'
): string => {
  if (!date || !timezone) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  const zonedDate = toZonedTime(d, timezone);
  return formatInTimeZone(zonedDate, timezone, formatStr);
};

export const parseDate = (date: Date | string): Date | null => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return isNaN(d.getTime()) ? null : d;
};
