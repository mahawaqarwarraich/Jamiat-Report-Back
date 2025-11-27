const express = require('express');
const auth = require('../middleware/auth');
const HamiReport = require('../models/HamiReport');
const User = require('../models/User');

const router = express.Router();



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

