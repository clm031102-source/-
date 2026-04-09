import dayjs from 'dayjs';

export const formatDate = (date: string, format = 'YYYY-MM-DD HH:mm') =>
  dayjs(date).format(format);

export const getHoldingMinutes = (entryTime: string, exitTime: string) => {
  const diff = dayjs(exitTime).diff(dayjs(entryTime), 'minute');
  return Math.max(diff, 0);
};
