const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const RafeeqaReport = require('../models/RafeeqaReport');
const RafeeqaDay = require('../models/RafeeqaDay');
const User = require('../models/User');

const router = express.Router();



// Get specific day data for Rafeeqa report
// This route must come before /:month/:year to avoid route conflicts
router.get('/day/:month/:year/:date', auth, async (req, res) => {
  try {
    const { month, year, date } = req.params;
    const dateNum = parseInt(date);

    if (isNaN(dateNum) || dateNum < 1 || dateNum > 31) {
      return res.status(400).json({ message: 'Invalid date. Date must be between 1 and 31' });
    }

    // Find the report for the current user with the given month and year
    const report = await RafeeqaReport.findOne({
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
    console.error('Error fetching Rafeeqa day data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save or update QA data for Rafeeqa report
// This route must come before /:month/:year/:date to avoid route conflicts
router.post('/:month/:year/qa', auth, async (req, res) => {
  try {
    const { month, year } = req.params;
    const { qa } = req.body;

    // Find the report for the current user with the given month and year
    let report = await RafeeqaReport.findOne({
      user: req.user._id,
      month,
      year
    });

    if (!report) {
      // Create new Rafeeqa report
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const monthIndex = monthNames.indexOf(month);
      const daysInMonth = new Date(parseInt(year), monthIndex + 1, 0).getDate();

      report = new RafeeqaReport({
        user: req.user._id,
        month: month,
        year: year,
        days: []
      });

      // Loop through all days of the month and create RafeeqaDay documents
      for (let i = 1; i <= daysInMonth; i++) {
        const rafeeqaDay = new mongoose.Document({
          date: i,
          month: month,
          year: year
        }, RafeeqaDay);
        report.days.push(rafeeqaDay);
      }

      await report.save();
    }

    // Update QA data
    if (qa && typeof qa === 'object') {
      // Initialize qa object if it doesn't exist
      if (!report.qa) {
        report.qa = {};
      }

      // Update each QA field
      Object.keys(qa).forEach(key => {
        if (qa[key] !== undefined && qa[key] !== null) {
          report.qa[key] = qa[key];
        }
      });

      await report.save();
    }

    res.json({ 
      success: true, 
      message: 'Q&A responses saved successfully!',
      report: report
    });
  } catch (error) {
    console.error('Error saving Rafeeqa QA data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save or update day data for Rafeeqa report
// This route must come after /:month/:year/qa to avoid route conflicts
// when user clicks save button
router.post('/:month/:year/:date', auth, async (req, res) => {
  try {
    const { month, year, date } = req.params;
    const dateNum = parseInt(date);
    const dayData = req.body;

    if (isNaN(dateNum) || dateNum < 1 || dateNum > 31) {
      return res.status(400).json({ message: 'Invalid date. Date must be between 1 and 31' });
    }

    // Find the report for the current user with the given month and year
    let report = await RafeeqaReport.findOne({
      user: req.user._id,
      month,
      year
    });

    if (!report) {
      // Create new Rafeeqa report
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const monthIndex = monthNames.indexOf(month);
      const daysInMonth = new Date(parseInt(year), monthIndex + 1, 0).getDate();

      // Create new Rafeeqa report using Mongoose
      report = new RafeeqaReport({
        user: req.user._id,
        month: month,
        year: year,
        days: []
      });

      // Loop through all days of the month and create RafeeqaDay documents using Mongoose
      for (let i = 1; i <= daysInMonth; i++) {
        // Create new RafeeqaDay document using Mongoose (will use default values from schema)
        const rafeeqaDay = new mongoose.Document({
          date: i,
          month: month,
          year: year
        }, RafeeqaDay);
        
        // Push the RafeeqaDay document into report's days array
        report.days.push(rafeeqaDay);
      }

      // Save the report with all days
      await report.save();

      // After creating all days, find and update the day that matches the given dateNum
      const dayToUpdate = report.days.find(d => d.date === dateNum && d.month === month && d.year === year);
      if (dayToUpdate) {
        // Update the day with new data using Mongoose document methods
        dayToUpdate.set('namaz', dayData.namaz || 'no');
        dayToUpdate.set('hifz', dayData.hifz || 'no');
        dayToUpdate.set('nazra', dayData.nazra || 'no');
        dayToUpdate.set('tafseer', dayData.tafseer || 'no');
        dayToUpdate.set('hadees', dayData.hadees || 'no');
        dayToUpdate.set('literature', dayData.literature || 'no');
        dayToUpdate.set('ghrKaKaam', dayData.ghrKaKaam || 'no');
        dayToUpdate.set('darsiKutab', dayData.darsiKutab || 'no');
        dayToUpdate.set('karkunaanMulakaat', dayData.karkunaanMulakaat || 0);
        dayToUpdate.set('amoomiAfraadMulakaat', dayData.amoomiAfraadMulakaat || 0);
        dayToUpdate.set('khatootTadaad', dayData.khatootTadaad || 0);
      }

      // Save the report again after updating the specific day
      await report.save();
    } else {
      // Report exists, find the day with the given date number and update it
      const dayToUpdate = report.days.find(d => d.date === dateNum && d.month === month && d.year === year);

      if (dayToUpdate) {
        // Update the day with new data using Mongoose document methods
        dayToUpdate.set('namaz', dayData.namaz || 'no');
        dayToUpdate.set('hifz', dayData.hifz || 'no');
        dayToUpdate.set('nazra', dayData.nazra || 'no');
        dayToUpdate.set('tafseer', dayData.tafseer || 'no');
        dayToUpdate.set('hadees', dayData.hadees || 'no');
        dayToUpdate.set('literature', dayData.literature || 'no');
        dayToUpdate.set('ghrKaKaam', dayData.ghrKaKaam || 'no');
        dayToUpdate.set('darsiKutab', dayData.darsiKutab || 'no');
        dayToUpdate.set('karkunaanMulakaat', dayData.karkunaanMulakaat || 0);
        dayToUpdate.set('amoomiAfraadMulakaat', dayData.amoomiAfraadMulakaat || 0);
        dayToUpdate.set('khatootTadaad', dayData.khatootTadaad || 0);
      }

      // Save using Mongoose
      await report.save();
    }

    res.json({ 
      success: true, 
      message: 'Daily report saved successfully!',
      report: report
    });
  } catch (error) {
    console.error('Error saving Rafeeqa day data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get days array for Rafeeqa report (for Monthly View)
// This route must come before /:month/:year to avoid route conflicts
router.get('/:month/:year/days', auth, async (req, res) => {
  try {
    const { month, year } = req.params;

    const report = await RafeeqaReport.findOne({
      user: req.user._id,
      month,
      year
    });

    if (!report) {
      return res.json({ days: [], success: true, message: 'No report found for the specified month and year' });
    }

    res.json({ days: report.days || [], success: true });
  } catch (error) {
    console.error('Error fetching Rafeeqa days:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Rafeeqa report for a specific month/year (for QA section and Monthly View)
router.get('/:month/:year', auth, async (req, res) => {
  try {
    const { month, year } = req.params;

    const report = await RafeeqaReport.findOne({
      user: req.user._id,
      month,
      year
    });

    if (!report) {
      return res.json({ report: null, success: true, message: 'No report found for the specified month and year' });
    }

    res.json({ report, success: true });
  } catch (error) {
    console.error('Error fetching Rafeeqa report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
