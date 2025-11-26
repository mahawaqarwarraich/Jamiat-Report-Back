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

      // Add report to user's reports array (if User model has reports field)
      try {
        await User.findByIdAndUpdate(req.user._id, {
          $push: { reports: report._id }
        });
      } catch (err) {
        // If User model doesn't have reports field, just continue
        console.log('Note: User model may not have reports field');
      }
    } else {
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

module.exports = router;

