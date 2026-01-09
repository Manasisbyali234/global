const express = require('express');
const router = express.Router();
const holidaysService = require('../utils/holidaysService');

// Get holidays for a specific year
router.get('/holidays/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const { country = 'IN' } = req.query;
    
    const holidays = await holidaysService.getHolidays(year, country);
    res.json({ success: true, holidays });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check if a specific date is a holiday
router.get('/check/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { country = 'IN' } = req.query;
    
    const isHoliday = await holidaysService.isHoliday(date, country);
    const holidayInfo = isHoliday ? await holidaysService.getHolidayInfo(date, country) : null;
    const isWeekend = holidaysService.isWeekend(date);
    const isNonWorkingDay = await holidaysService.isNonWorkingDay(date, country);
    
    res.json({ 
      success: true, 
      isHoliday, 
      holidayInfo,
      isWeekend,
      isNonWorkingDay
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;