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
        { date: '2026-01-14', name: 'Makar Sankranti', localName: 'Makar Sankranti' },
        { date: '2026-01-26', name: 'Republic Day', localName: 'Republic Day' },
        { date: '2026-02-15', name: 'Maha Shivaratri', localName: 'Maha Shivaratri' },
        { date: '2026-03-03', name: 'Holi', localName: 'Holi' },
        { date: '2026-03-20', name: 'Eid ul-Fitr', localName: 'Eid ul-Fitr' },
        { date: '2026-04-03', name: 'Good Friday', localName: 'Good Friday' },
        { date: '2026-08-15', name: 'Independence Day', localName: 'Independence Day' },
        { date: '2026-10-02', name: 'Gandhi Jayanti', localName: 'Gandhi Jayanti' },
        { date: '2026-11-11', name: 'Diwali', localName: 'Diwali' },
        { date: '2026-12-25', name: 'Christmas Day', localName: 'Christmas Day' }
      ]
    };
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
    const year = new Date(date).getFullYear();
    const holidays = await this.getHolidays(year, countryCode);
    return holidays.some(holiday => holiday.date === date);
  }

  async getHolidayInfo(date, countryCode = 'IN') {
    const year = new Date(date).getFullYear();
    const holidays = await this.getHolidays(year, countryCode);
    return holidays.find(holiday => holiday.date === date) || null;
  }
  isWeekend(date) {
    const day = new Date(date).getDay();
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