const fetch = require('node-fetch');

class HolidaysService {
  constructor() {
    this.baseUrl = 'https://date.nager.at/api/v3';
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    // Fallback holidays for India
    this.fallbackHolidays = {
      '2024': [
        { date: '2024-01-26', name: 'Republic Day', localName: 'Republic Day' },
        { date: '2024-03-08', name: 'Holi', localName: 'Holi' },
        { date: '2024-08-15', name: 'Independence Day', localName: 'Independence Day' },
        { date: '2024-10-02', name: 'Gandhi Jayanti', localName: 'Gandhi Jayanti' },
        { date: '2024-12-25', name: 'Christmas Day', localName: 'Christmas Day' }
      ],
      '2025': [
        { date: '2025-01-26', name: 'Republic Day', localName: 'Republic Day' },
        { date: '2025-08-15', name: 'Independence Day', localName: 'Independence Day' },
        { date: '2025-10-02', name: 'Gandhi Jayanti', localName: 'Gandhi Jayanti' },
        { date: '2025-12-25', name: 'Christmas Day', localName: 'Christmas Day' }
      ],
      '2026': [
        { date: '2026-01-01', name: "New Year's Day", localName: "New Year's Day" },
        { date: '2026-01-13', name: 'Lohri', localName: 'Lohri' },
        { date: '2026-01-14', name: 'Makar Sankranti', localName: 'Makar Sankranti' },
        { date: '2026-01-26', name: 'Republic Day', localName: 'Republic Day' },
        { date: '2026-02-01', name: 'Vasant Panchami', localName: 'Vasant Panchami' },
        { date: '2026-02-15', name: 'Maha Shivaratri', localName: 'Maha Shivaratri' },
        { date: '2026-02-16', name: 'Guru Ravidas Jayanti', localName: 'Guru Ravidas Jayanti' },
        { date: '2026-03-03', name: 'Holi', localName: 'Holi' },
        { date: '2026-03-20', name: 'Eid ul-Fitr', localName: 'Eid ul-Fitr' },
        { date: '2026-04-02', name: 'Ram Navami', localName: 'Ram Navami' },
        { date: '2026-04-03', name: 'Good Friday', localName: 'Good Friday' },
        { date: '2026-03-31', name: 'Mahavir Jayanti', localName: 'Mahavir Jayanti' },
        { date: '2026-04-14', name: 'Baisakhi', localName: 'Baisakhi' },
        { date: '2026-05-01', name: 'Labour Day', localName: 'Labour Day' },
        { date: '2026-05-11', name: 'Buddha Purnima', localName: 'Buddha Purnima' },
        { date: '2026-05-29', name: 'Raksha Bandhan', localName: 'Raksha Bandhan' },
        { date: '2026-06-26', name: 'Eid al-Adha', localName: 'Eid al-Adha' },
        { date: '2026-07-26', name: 'Muharram', localName: 'Muharram' },
        { date: '2026-08-15', name: 'Independence Day', localName: 'Independence Day' },
        { date: '2026-09-05', name: 'Eid Milad un-Nabi', localName: 'Eid Milad un-Nabi' },
        { date: '2026-09-16', name: 'Ganesh Chaturthi', localName: 'Ganesh Chaturthi' },
        { date: '2026-10-02', name: 'Gandhi Jayanti', localName: 'Gandhi Jayanti' },
        { date: '2026-10-11', name: 'Dussehra', localName: 'Dussehra' },
        { date: '2026-11-11', name: 'Diwali', localName: 'Diwali' },
        { date: '2026-11-24', name: 'Guru Nanak Jayanti', localName: 'Guru Nanak Jayanti' },
        { date: '2026-12-25', name: 'Christmas Day', localName: 'Christmas Day' }
      ]
    };
  }

  getYearFromDateInput(date) {
    if (typeof date === 'string') {
      const trimmed = date.trim();
      const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (ymdMatch) {
        return Number(ymdMatch[1]);
      }
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return parsedDate.getFullYear();
  }

  getDateObject(date) {
    if (typeof date === 'string') {
      const trimmed = date.trim();
      const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (ymdMatch) {
        const [, year, month, day] = ymdMatch;
        return new Date(Number(year), Number(month) - 1, Number(day));
      }
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return parsedDate;
  }

  normalizeDateInput(date) {
    if (typeof date === 'string') {
      const trimmed = date.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
      }
    }

    const parsedDate = this.getDateObject(date);
    if (!parsedDate) {
      return '';
    }

    const year = String(parsedDate.getFullYear());
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async getHolidays(year, countryCode = 'IN') {
    const cacheKey = `${year}-${countryCode}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.baseUrl}/PublicHolidays/${year}/${countryCode}`);
      if (!response.ok) throw new Error('Failed to fetch holidays');
      
      const holidays = await response.json();
      const processedHolidays = holidays.map(holiday => ({
        date: holiday.date,
        name: holiday.name,
        localName: holiday.localName
      }));

      // Override with fallback data for accuracy
      const fallback = this.fallbackHolidays[year.toString()] || [];
      const mergedHolidays = [...processedHolidays];
      
      fallback.forEach(fbHoliday => {
        const existingIndex = mergedHolidays.findIndex(h => 
          h.name.toLowerCase().includes('shiv') || 
          h.localName.toLowerCase().includes('shiv') ||
          h.name === fbHoliday.name || 
          h.localName === fbHoliday.localName
        );
        if (existingIndex >= 0) {
          mergedHolidays[existingIndex] = fbHoliday;
        } else {
          mergedHolidays.push(fbHoliday);
        }
      });

      this.cache.set(cacheKey, {
        data: mergedHolidays,
        timestamp: Date.now()
      });

      return mergedHolidays;
    } catch (error) {
      console.error('Error fetching holidays from API, using fallback:', error.message);
      const fallback = this.fallbackHolidays[year.toString()] || [];
      this.cache.set(cacheKey, {
        data: fallback,
        timestamp: Date.now()
      });
      return fallback;
    }
  }

  async isHoliday(date, countryCode = 'IN') {
    const normalizedDate = this.normalizeDateInput(date);
    const year = this.getYearFromDateInput(normalizedDate);
    if (!year) return false;

    const holidays = await this.getHolidays(year, countryCode);
    return holidays.some(holiday => holiday.date === normalizedDate);
  }

  async getHolidayInfo(date, countryCode = 'IN') {
    const normalizedDate = this.normalizeDateInput(date);
    const year = this.getYearFromDateInput(normalizedDate);
    if (!year) return null;

    const holidays = await this.getHolidays(year, countryCode);
    return holidays.find(holiday => holiday.date === normalizedDate) || null;
  }
  isWeekend(date) {
    const parsedDate = this.getDateObject(date);
    if (!parsedDate) return false;

    const day = parsedDate.getDay();
    return day === 0 || day === 6;
  }

  async isNonWorkingDay(date, countryCode = 'IN') {
    const isHol = await this.isHoliday(date, countryCode);
    const isWeek = this.isWeekend(date);
    return isHol || isWeek;
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = new HolidaysService();
