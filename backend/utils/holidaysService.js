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

      this.cache.set(cacheKey, {
        data: processedHolidays,
        timestamp: Date.now()
      });

      return processedHolidays;
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
}

module.exports = new HolidaysService();