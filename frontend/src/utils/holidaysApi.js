const API_BASE = 'http://localhost:5000/api';

export const holidaysApi = {
  async checkHoliday(date, country = 'IN') {
    try {
      const response = await fetch(`${API_BASE}/check/${date}?country=${country}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking holiday:', error);
      return { success: false, isHoliday: false };
    }
  },

  async getYearHolidays(year, country = 'IN') {
    try {
      const response = await fetch(`${API_BASE}/holidays/${year}?country=${country}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching holidays:', error);
      return { success: false, holidays: [] };
    }
  }
};