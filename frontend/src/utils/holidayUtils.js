// Local holiday helpers (India) used as a fallback when the backend holiday API
// isn't reachable or doesn't have comprehensive data.

// Indian holidays for 2024-2026 (YYYY-MM-DD -> Holiday name)
const LOCAL_IN_HOLIDAYS = {
  // 2024
  '2024-01-01': "New Year's Day",
  '2024-01-15': 'Makar Sankranti',
  '2024-01-26': 'Republic Day',
  '2024-02-14': 'Vasant Panchami',
  '2024-02-24': 'Guru Ravidas Jayanti',
  '2024-03-08': 'Holi',
  '2024-03-14': 'Holi (Second Day)',
  '2024-03-25': 'Good Friday',
  '2024-04-09': 'Ugadi',
  '2024-04-11': 'Eid ul-Fitr',
  '2024-04-14': 'Baisakhi',
  '2024-04-17': 'Ram Navami',
  '2024-04-21': 'Mahavir Jayanti',
  '2024-05-01': 'Labour Day',
  '2024-05-23': 'Buddha Purnima',
  '2024-06-17': 'Eid al-Adha',
  '2024-07-17': 'Muharram',
  '2024-08-15': 'Independence Day',
  '2024-08-19': 'Raksha Bandhan',
  '2024-08-26': 'Janmashtami',
  '2024-09-07': 'Ganesh Chaturthi',
  '2024-09-16': 'Eid Milad un-Nabi',
  '2024-10-02': 'Gandhi Jayanti',
  '2024-10-12': 'Dussehra',
  '2024-10-31': 'Karva Chauth',
  '2024-11-01': 'Diwali',
  '2024-11-02': 'Govardhan Puja',
  '2024-11-15': 'Guru Nanak Jayanti',
  '2024-12-25': 'Christmas Day',

  // 2025
  '2025-01-01': "New Year's Day",
  '2025-01-13': 'Lohri',
  '2025-01-14': 'Makar Sankranti',
  '2025-01-26': 'Republic Day',
  '2025-02-12': 'Vasant Panchami',
  '2025-02-26': 'Maha Shivratri',
  '2025-03-14': 'Holi',
  '2025-03-31': 'Eid ul-Fitr',
  '2025-04-06': 'Ram Navami',
  '2025-04-13': 'Baisakhi',
  '2025-04-14': 'Good Friday',
  '2025-04-18': 'Mahavir Jayanti',
  '2025-05-01': 'Labour Day',
  '2025-05-12': 'Buddha Purnima',
  '2025-06-07': 'Eid al-Adha',
  '2025-07-06': 'Muharram',
  '2025-08-09': 'Raksha Bandhan',
  '2025-08-15': 'Independence Day',
  '2025-08-16': 'Janmashtami',
  '2025-09-05': 'Eid Milad un-Nabi',
  '2025-09-27': 'Ganesh Chaturthi',
  '2025-10-02': 'Gandhi Jayanti',
  '2025-10-22': 'Dussehra',
  '2025-11-01': 'Diwali',
  '2025-11-05': 'Guru Nanak Jayanti',
  '2025-12-25': 'Christmas Day',

  // 2026
  '2026-01-01': "New Year's Day",
  '2026-01-13': 'Lohri',
  '2026-01-14': 'Makar Sankranti',
  '2026-01-26': 'Republic Day',
  '2026-02-01': 'Vasant Panchami',
  '2026-02-15': 'Maha Shivratri',
  '2026-02-16': 'Guru Ravidas Jayanti',
  '2026-03-03': 'Holi',
  '2026-03-20': 'Eid ul-Fitr',
  '2026-04-02': 'Ram Navami',
  '2026-04-03': 'Good Friday',
  '2026-03-31': 'Mahavir Jayanti',
  '2026-04-14': 'Baisakhi',
  '2026-05-01': 'Labour Day',
  '2026-05-11': 'Buddha Purnima',
  '2026-05-29': 'Raksha Bandhan',
  '2026-06-26': 'Eid al-Adha',
  '2026-07-26': 'Muharram',
  '2026-08-15': 'Independence Day',
  '2026-09-05': 'Eid Milad un-Nabi',
  '2026-09-16': 'Ganesh Chaturthi',
  '2026-10-02': 'Gandhi Jayanti',
  '2026-10-11': 'Dussehra',
  '2026-11-11': 'Diwali',
  '2026-11-24': 'Guru Nanak Jayanti',
  '2026-12-25': 'Christmas Day',
};

export const normalizeToYMD = (date) => {
  if (!date) return '';

  if (typeof date === 'string') {
    const value = date.trim();
    if (!value) return '';

    // Already in the required format.
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    // Common UI formats.
    const ddmmyyyySlash = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (ddmmyyyySlash) {
      const [, dd, mm, yyyy] = ddmmyyyySlash;
      return `${yyyy}-${mm}-${dd}`;
    }

    const ddmmyyyyDash = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (ddmmyyyyDash) {
      const [, dd, mm, yyyy] = ddmmyyyyDash;
      return `${yyyy}-${mm}-${dd}`;
    }

    const yyyymmddSlash = value.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
    if (yyyymmddSlash) {
      const [, yyyy, mm, dd] = yyyymmddSlash;
      return `${yyyy}-${mm}-${dd}`;
    }

    return '';
  }

  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    const yyyy = String(date.getFullYear());
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  return '';
};

export const parseLocalDate = (date) => {
  const normalized = normalizeToYMD(date);
  if (!normalized) return null;

  const [yyyy, mm, dd] = normalized.split('-').map(Number);
  if (!yyyy || !mm || !dd) return null;

  return new Date(yyyy, mm - 1, dd);
};

export const getLocalHolidayName = (date) => {
  const normalized = normalizeToYMD(date);
  if (!normalized) return null;
  const year = normalized.slice(0, 4);
  const name = LOCAL_IN_HOLIDAYS[normalized];
  if (!name) return null;
  if (!normalized.startsWith(year)) return null;
  return name;
};

export const isWeekendDate = (date) => {
  const parsedDate = parseLocalDate(date);
  if (!parsedDate) return false;
  const day = parsedDate.getDay();
  return day === 0 || day === 6;
};
