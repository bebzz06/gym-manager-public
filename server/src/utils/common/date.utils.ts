import moment from 'moment-timezone';

export const formatToGymTimezone = (
  date: Date | string | null,
  timezone: string
): string | null => {
  if (!date) return null;

  return moment(date).tz(timezone).format('YYYY-MM-DDTHH:mm:ssZ');
};

export const formatDatesInObject = (
  obj: Record<string, any>,
  timezone: string,
  dateFields: string[]
) => {
  const formatted = { ...obj };

  dateFields.forEach(path => {
    const keys = path.split('.');
    let current = formatted;

    // Navigate to the parent object
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
      if (!current) return;
    }

    // Format the date at the final key
    const lastKey = keys[keys.length - 1];
    if (current[lastKey]) {
      current[lastKey] = formatToGymTimezone(current[lastKey], timezone);
    }
  });

  return formatted;
};
