import type { DateFormat } from '../features/ui/uiSlice';

/**
 * Formats an ISO date/time string according to the user's personal
 * date-format preference (day-month-year, month-day-year, or year-month-day).
 * This is an "environment" preference — it only changes how dates are
 * displayed to this user, never any underlying data.
 */
export function formatDateByPref(iso: string, format: DateFormat, includeTime = false): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getFullYear());

  let datePart: string;
  switch (format) {
    case 'mdy':
      datePart = `${mm}/${dd}/${yyyy}`;
      break;
    case 'ymd':
      datePart = `${yyyy}-${mm}-${dd}`;
      break;
    case 'dmy':
    default:
      datePart = `${dd}/${mm}/${yyyy}`;
      break;
  }

  if (!includeTime) return datePart;

  const timePart = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${datePart} ${timePart}`;
}
