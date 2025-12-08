const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
//const puppeteer = require('puppeteer'); // can be used during dev but not prod
const auth = require('../middleware/auth');
const HamiReport = require('../models/HamiReport');
const HamiDay = require('../models/HamiDay');
const User = require('../models/User');
const puppeteer = require('puppeteer-core'); // during prod
const chromium = require('@sparticuz/chromium'); // during prod

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

// Save or update QA data for Hami report
// This route must come before /:month/:year/:date to avoid route conflicts
router.post('/:month/:year/qa', auth, async (req, res) => {
  try {
    const { month, year } = req.params;
    const { qa } = req.body;

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

      report = new HamiReport({
        user: req.user._id,
        month: month,
        year: year,
        days: []
      });

      // Loop through all days of the month and create HamiDay documents
      for (let i = 1; i <= daysInMonth; i++) {
        const hamiDay = new mongoose.Document({
          date: i,
          month: month,
          year: year
        }, HamiDay);
        report.days.push(hamiDay);
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
    console.error('Error saving Hami QA data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save or update day data for Hami report
// This route must come after /:month/:year/qa to avoid route conflicts
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
        dayToUpdate.set('isMark', true);
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
    console.error('Error saving Hami day data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get days array for Hami report (for Monthly View)
// This route must come before /:month/:year to avoid route conflicts
router.get('/:month/:year/days', auth, async (req, res) => {
  try {
    const { month, year } = req.params;

    const report = await HamiReport.findOne({
      user: req.user._id,
      month,
      year
    });

    if (!report) {
      return res.json({ days: [], success: true, message: 'No report found for the specified month and year' });
    }

    res.json({ days: report.days || [], success: true });
  } catch (error) {
    console.error('Error fetching Hami days:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate PDF from template URL using Puppeteer
// This route must come before /:month/:year to avoid route conflicts

router.get("/:month/:year/pdf", auth, async (req, res) => {
  try {
    const { month, year } = req.params;

    // 1. Fetch report data from DB
    const report = await HamiReport.findOne({
      user: req.user._id,
      month,
      year
    });

    // 2. Fetch user data from DB
    const user = await User.findById(req.user._id);

    // 3. Read logo file and convert to base64 data URI
    let logoDataUri = '';
    try {
      const logoPath = path.join(__dirname, "../public/logo.png");
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = logoBuffer.toString('base64');
        logoDataUri = `data:image/png;base64,${logoBase64}`;
      }
    } catch (error) {
      console.error('Error reading logo file:', error);
    }

    // 4. Render EJS template to HTML string
    const templatePath = path.join(__dirname, "../templates/hami-report.ejs");
    const html = await ejs.renderFile(templatePath, { 
      month, 
      year, 
      reportData: report,
      userData: user,
      logoDataUri: logoDataUri
    });
   
    if (process.env.NODE_ENV === 'production') {
      const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      const browser = await puppeteer.launch({
        headless: true,
        //executablePath: 'C:\\Users\PMLS\\.cache\\puppeteer\\chrome\\win64-142.0.7444.175\chrome-win64\chrome.exe',
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }
   

   
    const page = await browser.newPage();

    // 4. Set the HTML content
    //await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.setContent(html);
    await page.emulateMediaType('screen');


    // 5. Generate PDF
    const pdfBuffer = await page.pdf({
    
    format: 'A4',
    landscape: true,
      printBackground: true,
      // width: '500mm',           // very wide page
       
     
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });

    await browser.close();

    // await page.pdf({ path: 'test.pdf', format: 'A4', printBackground: true });

    
    

    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=hami-report-${month}-${year}.pdf`
    );
    
    // Send as binary buffer
    res.end(pdfBuffer, 'binary');
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
});

// Get Hami report for a specific month/year (for QA section and Monthly View)
router.get('/:month/:year', auth, async (req, res) => {
  try {
    const { month, year } = req.params;

    const report = await HamiReport.findOne({
      user: req.user._id,
      month,
      year
    });

    if (!report) {
      return res.json({ report: null, success: true, message: 'No report found for the specified month and year' });
    }

    res.json({ report, success: true });
  } catch (error) {
    console.error('Error fetching Hami report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

