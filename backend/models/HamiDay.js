const mongoose = require('mongoose');


// Day schema for daily activities
const hamiDaySchema = new mongoose.Schema({
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
    namaz: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    hifz: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    nazra: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    tafseer: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    hadees: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    literature: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    ghrKaKaam: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    achiBaatBtai: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    quranCircle: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    apnaMuhasibaKiya: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },

    karkunaanMulakaat: {
      type: Number,
      default: 0,
      min: 0
    },
    taqseemDawatiMasnuaat: {
      type: Number,
      default: 0,
      min: 0
    }
});

module.exports = hamiDaySchema;