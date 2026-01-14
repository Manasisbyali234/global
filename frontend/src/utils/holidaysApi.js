const API_BASE = 'http://localhost:5000/api';

export const holidaysApi = {
  async checkHoliday(date, country = 'IN') {
    try {
      console.log(`Checking holiday for date: ${date}`);
      const response = await fetch(`${API_BASE}/check/${date}?country=${country}`);
      console.log('Holiday API response status:', response.status);
      const data = await response.json();
      console.log('Holiday API response data:', data);
      return data;
    } catch (error) {
      console.error('Error checking holiday:', error);
      return { success: false, isHoliday: false };
    }
  },

  async getYearHolidays(year, country = 'IN') {
    try {
      console.log(`Fetching holidays for year: ${year}`);
      const response = await fetch(`${API_BASE}/holidays/${year}?country=${country}`);
      console.log('Holidays API response status:', response.status);
      const data = await response.json();
      console.log('Holidays API response data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching holidays:', error);
      return { success: false, holidays: [] };
    }
  }
};