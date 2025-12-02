const mongoose = require('mongoose');

// Day schema for daily activities
const ruknDaySchema = new mongoose.Schema({
    date: {
      type: Number,
      required: true,
      min: 1,
      max: 31
    },
    month: {
      type: String,
      required: true
    },
    year: {
      type: String,
      required: true
    },
    namazBarwaqtAdaigi: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    qazaHui: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    nawafalKoshish: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    kashuKoshish: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    nazraQuran: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    hifzQuran: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    mutaleyaTafseer: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    asoolQuran: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    amalDaramadQuran: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    mutaleyaHadees: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    asoolHadees: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    amalDaramadHadees: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    lafziTarjumaKoshish: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    tajweedKoshish: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    mutaleyaLiterature: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    baadAzRukniyat: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    amalDaramadLiterature: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    karkunaanDiscussionLiterature: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    khoobiBuraiKoshish: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    ghrIkhlaaqMaamlaat: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    ghrDawat: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    khidmatDiscussionHadia: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    taleemBehter: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    takseemLiterature: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    mutaiyanAfraadSargarmi: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    quranClassDiscussion: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    zerTarbiyatKoshish: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    khatootMulakaatDisTabsara: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    mulakaatKarkunaan: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    mulakaatAmoomiAfraad: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    khatootArsaal: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    mausoolKhatoot: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    zaatiMuhasiba: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    isMark: {
      type: Boolean,
      default: false
    }
  });

module.exports = ruknDaySchema;