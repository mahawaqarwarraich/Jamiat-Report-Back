const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const HamiReport = require('../models/HamiReport');
const HamiDay = require('../models/HamiDay');
const User = require('../models/User');

const router = express.Router();

// Get specific day data for Hami report
// This route must come before /:month/:year to avoid route conflicts
// Initial loading of the specific day data
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

// Save or update day data for Hami report
// This route must come before /:month/:year to avoid route conflicts
// when user clicks save button
router.post('/:month/:year/:date', auth, async (req, res) => {
  try {
    const { month, year, date } = req.params;
    const dateNum = parseInt(date);
    const dayData = req.body;
    console.log("day data", dayData);

    if (isNaN(dateNum) || dateNum < 1 || dateNum > 31) {
      return res.status(400).json({ message: 'Invalid date. Date must be between 1 and 31' });
    }

    // Find the report for the current user with the given month and year
    let report = await HamiReport.findOne({
      user: req.user._id,
      month,
      year
    });

    if (!report) {
      // Create new Hami report
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const monthIndex = monthNames.indexOf(month);
      const daysInMonth = new Date(parseInt(year), monthIndex + 1, 0).getDate();

      // Create new Hami report using Mongoose
      report = new HamiReport({
        user: req.user._id,
        month: month,
        year: year,
        days: []
      });

      // Loop through all days of the month and create HamiDay documents using Mongoose
      for (let i = 1; i <= daysInMonth; i++) {
        // Create new HamiDay document using Mongoose (will use default values from schema)
        const hamiDay = new mongoose.Document({
          date: i,
          month: month,
          year: year
        }, HamiDay);
        
        // Push the HamiDay document into report's days array
        report.days.push(hamiDay);
      }

      // Save the report with all days
      await report.save();

      // After creating all days, find and update the day that matches the given dateNum
      const dayToUpdate = report.days.find(d => d.date === dateNum && d.month === month && d.year === year);
      if (dayToUpdate) {
        // Map frontend field names to schema field names and update
        dayToUpdate.set('namaz', dayData.namaz || 'no');
        dayToUpdate.set('hifz', dayData.hifz || 'no');
        dayToUpdate.set('nazra', dayData.nazra || 'no');
        dayToUpdate.set('tafseer', dayData.tafseer || 'no');
        dayToUpdate.set('hadees', dayData.hadees || 'no');
        dayToUpdate.set('literature', dayData.literature || 'no');
        dayToUpdate.set('ghrKaKaam', dayData.ghrKaKaam || 'no');
        dayToUpdate.set('achiBaatBtai', dayData.ajKisiKoKoiAchiBaatBtai || dayData.achiBaatBtai || 'no');
        dayToUpdate.set('quranCircle', dayData.quranCircle || 'no');
        dayToUpdate.set('apnaMuhasibaKiya', dayData.ajApnaMuhasibaKiya || dayData.apnaMuhasibaKiya || 'no');
        dayToUpdate.set('karkunaanMulakaat', dayData.karkunaanMulakaat || 0);
        dayToUpdate.set('taqseemDawatiMasnuaat', dayData.taqseemDawatiMasnuaat || 0);
        await dayToUpdate.save();
      }

      // Save the report again after updating the specific day
      await report.save();
    } else {
      // Report exists, find the day with the given date number and update it
      const dayToUpdate = report.days.find(d => d.date === dateNum && d.month === month && d.year === year);

      if (dayToUpdate) {
        console.log("update ho to rha hai");
        // Update the day with new data using Mongoose document methods
        // Map frontend field names to schema field names
        dayToUpdate.set('namaz', dayData.namaz || 'no');
        dayToUpdate.set('hifz', dayData.hifz || 'no');
        dayToUpdate.set('nazra', dayData.nazra || 'no');
        dayToUpdate.set('tafseer', dayData.tafseer || 'no');
        dayToUpdate.set('hadees', dayData.hadees || 'no');
        dayToUpdate.set('literature', dayData.literature || 'no');
        dayToUpdate.set('ghrKaKaam', dayData.ghrKaKaam || 'no');
        dayToUpdate.set('achiBaatBtai', dayData.ajKisiKoKoiAchiBaatBtai || dayData.achiBaatBtai || 'no');
        dayToUpdate.set('quranCircle', dayData.quranCircle || 'no');
        dayToUpdate.set('apnaMuhasibaKiya', dayData.ajApnaMuhasibaKiya || dayData.apnaMuhasibaKiya || 'no');
        dayToUpdate.set('karkunaanMulakaat', dayData.karkunaanMulakaat || 0);
        dayToUpdate.set('taqseemDawatiMasnuaat', dayData.taqseemDawatiMasnuaat || 0);
        await dayToUpdate.save();
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
    console.error('Error saving Hami day data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

