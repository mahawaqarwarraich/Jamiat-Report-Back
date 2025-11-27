const express = require('express');
const auth = require('../middleware/auth');
const HamiReport = require('../models/HamiReport');
const User = require('../models/User');

const router = express.Router();

// Get or create Hami report for specific month and year
router.get('/:month/:year', auth, async (req, res) => {
  try {
    const { month, year } = req.params;

    let report = await HamiReport.findOne({
      user: req.user._id,
      month,
      year
    });

    if (!report) {
      // Create new report with all days initialized
      const currentDate = new Date();
      const reportMonth = month;
      const reportYear = year;
      
      // Calculate days in month
      // Convert month name to month number (0-indexed)
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const monthIndex = monthNames.indexOf(reportMonth);
      const daysInMonth = new Date(parseInt(reportYear), monthIndex + 1, 0).getDate();
      
      const days = [];
      
      for (let i = 1; i <= daysInMonth; i++) {
        days.push({
          date: i,
          month: reportMonth,
          year: reportYear,
          namaz: 'no',
          hifz: 'no',
          nazra: 'no',
          tafseer: 'no',
          hadees: 'no',
          literature: 'no',
          darsiKutab: 'no',
          karkunaanMulakaat: 0,
          amoomiAfraadMulakaat: 0,
          khatootTadaad: 0,
          ghrKaKaam: 'no'
        });
      }

      report = new HamiReport({
        user: req.user._id,
        month: reportMonth,
        year: reportYear,
        days
      });

      await report.save();


    } else {
      // 
      // Migrate existing days to include month and year if missing
      let needsUpdate = false;
      report.days = report.days.map(day => {
        if (!day.month || !day.year) {
          needsUpdate = true;
          return {
            ...day,
            month: month,
            year: year
          };
        }
        return day;
      });

      if (needsUpdate) {
        await report.save();
        console.log(`Migrated existing Hami report for ${month} ${year} to include month and year fields`);
      }
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching Hami report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific day data for Hami report
// This route must come before /:month/:year to avoid route conflicts
router.get('/day/:month/:year/:date', auth, async (req, res) => {
  try {
    const { month, year, date } = req.params;
    const dateNum = parseInt(date);

    if (isNaN(dateNum) || dateNum < 1 || dateNum > 31) {
      return res.status(400).json({ message: 'Invalid date. Date must be between 1 and 31' });
    }

    // Find the report for the current user with the given month and year
    const report = await HamiReport.findOne({
      user: req.user._id,
      month,
      year
    });

    if (!report) {
      return res.json({ day: null, success: true, message: 'No report found for the specified month and year' });
    }

    // Find the specific day in the days array based on the date
    const day = report.days.find(d => d.date === dateNum && d.month === month && d.year === year);

    if (!day) {
      return res.json({ day: null, success: true, message: 'No data found for the specified date' });
    }

    res.json({ day, success: true });
  } catch (error) {
    console.error('Error fetching Hami day data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

