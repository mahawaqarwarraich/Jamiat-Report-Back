const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const auth = require('../middleware/auth');
const RuknReport = require('../models/RuknReport');
const RuknDay = require('../models/RuknDay');
const User = require('../models/User');

const router = express.Router();

// Get specific day data for Rukn report
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
    const report = await RuknReport.findOne({
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
    console.error('Error fetching Rukn day data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save or update QA data for Rukn report
// This route must come before /:month/:year/:date to avoid route conflicts
router.post('/:month/:year/qa', auth, async (req, res) => {
  try {
    const { month, year } = req.params;
    const { qa } = req.body;

    // Find the report for the current user with the given month and year
    let report = await RuknReport.findOne({
      user: req.user._id,
      month,
      year
    });

    if (!report) {
      // Create new Rukn report
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const monthIndex = monthNames.indexOf(month);
      const daysInMonth = new Date(parseInt(year), monthIndex + 1, 0).getDate();

      report = new RuknReport({
        user: req.user._id,
        month: month,
        year: year,
        days: []
      });

      // Loop through all days of the month and create RuknDay documents
      for (let i = 1; i <= daysInMonth; i++) {
        const ruknDay = new mongoose.Document({
          date: i,
          month: month,
          year: year
        }, RuknDay);
        report.days.push(ruknDay);
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
    console.error('Error saving Rukn QA data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save or update day data for Rukn report
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
    let report = await RuknReport.findOne({
      user: req.user._id,
      month,
      year
    });

    if (!report) {
      // Create new Rukn report
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const monthIndex = monthNames.indexOf(month);
      const daysInMonth = new Date(parseInt(year), monthIndex + 1, 0).getDate();

      // Create new Rukn report using Mongoose
      report = new RuknReport({
        user: req.user._id,
        month: month,
        year: year,
        days: []
      });

      // Loop through all days of the month and create RuknDay documents using Mongoose
      for (let i = 1; i <= daysInMonth; i++) {
        // Create new RuknDay document using Mongoose (will use default values from schema)
        const ruknDay = new mongoose.Document({
          date: i,
          month: month,
          year: year
        }, RuknDay);
        
        // Push the RuknDay document into report's days array
        report.days.push(ruknDay);
      }

      // Save the report with all days
      await report.save();

      // After creating all days, find and update the day that matches the given dateNum
      const dayToUpdate = report.days.find(d => d.date === dateNum && d.month === month && d.year === year);
      if (dayToUpdate) {
        // Update all Rukn fields
        const ruknFields = [
          'namazBarwaqtAdaigi', 'qazaHui', 'nawafalKoshish', 'kashuKoshish',
          'nazraQuran', 'hifzQuran', 'mutaleyaTafseer', 'asoolQuran',
          'amalDaramadQuran', 'mutaleyaHadees', 'asoolHadees', 'amalDaramadHadees',
          'lafziTarjumaKoshish', 'tajweedKoshish', 'mutaleyaLiterature',
          'baadAzRukniyat', 'amalDaramadLiterature', 'karkunaanDiscussionLiterature',
          'khoobiBuraiKoshish', 'ghrIkhlaaqMaamlaat', 'ghrDawat',
          'khidmatDiscussionHadia', 'taleemBehter', 'takseemLiterature',
          'mutaiyanAfraadSargarmi', 'quranClassDiscussion', 'zerTarbiyatKoshish',
          'khatootMulakaatDisTabsara', 'mulakaatKarkunaan', 'mulakaatAmoomiAfraad',
          'khatootArsaal', 'mausoolKhatoot', 'zaatiMuhasiba'
        ];

        ruknFields.forEach(fieldName => {
          const fieldValue = dayData[fieldName] || 'no';
          dayToUpdate.set(fieldName, fieldValue);
        });
        dayToUpdate.set('isMark', true);
        await dayToUpdate.save();

      }

      // Save the report again after updating the specific day
      await report.save();
    } else {
      // Report exists, find the day with the given date number and update it
      const dayToUpdate = report.days.find(d => d.date === dateNum && d.month === month && d.year === year);

      if (dayToUpdate) {
        // Update all Rukn fields
        const ruknFields = [
          'namazBarwaqtAdaigi', 'qazaHui', 'nawafalKoshish', 'kashuKoshish',
          'nazraQuran', 'hifzQuran', 'mutaleyaTafseer', 'asoolQuran',
          'amalDaramadQuran', 'mutaleyaHadees', 'asoolHadees', 'amalDaramadHadees',
          'lafziTarjumaKoshish', 'tajweedKoshish', 'mutaleyaLiterature',
          'baadAzRukniyat', 'amalDaramadLiterature', 'karkunaanDiscussionLiterature',
          'khoobiBuraiKoshish', 'ghrIkhlaaqMaamlaat', 'ghrDawat',
          'khidmatDiscussionHadia', 'taleemBehter', 'takseemLiterature',
          'mutaiyanAfraadSargarmi', 'quranClassDiscussion', 'zerTarbiyatKoshish',
          'khatootMulakaatDisTabsara', 'mulakaatKarkunaan', 'mulakaatAmoomiAfraad',
          'khatootArsaal', 'mausoolKhatoot', 'zaatiMuhasiba'
        ];

        ruknFields.forEach(fieldName => {
          const fieldValue = dayData[fieldName] || 'no';
          dayToUpdate.set(fieldName, fieldValue);
        });
        dayToUpdate.set('isMark', true);
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
    console.error('Error saving Rukn day data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get days array for Rukn report (for Monthly View)
// This route must come before /:month/:year to avoid route conflicts
router.get('/:month/:year/days', auth, async (req, res) => {
  try {
    const { month, year } = req.params;

    const report = await RuknReport.findOne({
      user: req.user._id,
      month,
      year
    });

    if (!report) {
      return res.json({ days: [], success: true, message: 'No report found for the specified month and year' });
    }

    res.json({ days: report.days || [], success: true });
  } catch (error) {
    console.error('Error fetching Rukn days:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate PDF from template URL using Puppeteer
// This route must come before /:month/:year to avoid route conflicts
router.get("/:month/:year/pdf", auth, async (req, res) => {
  try {
    const { month, year } = req.params;

    // 1. Fetch report data from DB
    const report = await RuknReport.findOne({
      user: req.user._id,
      month,
      year
    });

    // 2. Fetch user data from DB
    const user = await User.findById(req.user._id);

    // 3. Render EJS template to HTML string
    const templatePath = path.join(__dirname, "../templates/rukn-report.ejs");
    const html = await ejs.renderFile(templatePath, { 
      month, 
      year, 
      reportData: report,
      userData: user
    });

    // 4. Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // 5. Set the HTML content
    await page.setContent(html);
    await page.emulateMediaType('screen');

    // 6. Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });

    await browser.close();

    // 7. Send PDF to frontend
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=rukn-report-${month}-${year}.pdf`
    );
    
    // Send as binary buffer
    res.end(pdfBuffer, 'binary');
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
});

// Get Rukn report for a specific month/year (for QA section and Monthly View)
router.get('/:month/:year', auth, async (req, res) => {
  try {
    const { month, year } = req.params;

    const report = await RuknReport.findOne({
      user: req.user._id,
      month,
      year
    });

    if (!report) {
      return res.json({ report: null, success: true, message: 'No report found for the specified month and year' });
    }

    res.json({ report, success: true });
  } catch (error) {
    console.error('Error fetching Rukn report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
