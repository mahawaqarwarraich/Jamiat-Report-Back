const mongoose = require('mongoose');
const umeedwarDaySchema = require('./UmeedwarDay');

const umeedwarReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  days: {
    type: [umeedwarDaySchema],
    default: []
  },
  qa: {
    'Tajweed ya lafzi tarjuma/arabi seekhny ki kya koshishein ki': {
      type: String,
      default: ''
    },
    'Kya dauran mutaleya notes leny ka ehtamaam rha?': {
      type: String,
      default: ''
    },
    'Mutaleya sy liye gaye eham asool?': {
      type: String,
      default: ''
    },
    'Dauran maah konsi ikhlaaqi khoobi apnaaney ya burai chorny ki koshish rhi?': {
      type: String,
      default: ''
    },
    'Ghr, khandaan, hamsaya, degar mutalakeen k saath husn mamla, khidmat, ayadat, tauhfa waghera ki kya koshishein rhin?': {
      type: String,
      default: ''
    },
    'Kya gharelu nazm berkaraar rakhny main apna kirdaar ada kiya?': {
      type: String,
      default: ''
    },
    'kya rozana apna muhasiba krti rahin?': {
      type: String,
      default: ''
    },
    'Kya mutaliqa ijtemaat main shirkat ki? Nhi ki to wajah?': {
      type: String,
      default: ''
    },
    'Kya markaz, sooba, makaam, division, ki taraf sy milny waaly kaam kiye? Nhi to wajah?': {
      type: String,
      default: ''
    },
    'Kya ghr, zimadaraan main muhasiba o mushawarat ki faza rhi?': {
      type: String,
      default: ''
    },
    'Apny oper ayed kardah aanat ada kr di?': {
      type: String,
      default: ''
    },
    'Kya rozana jaiza pur krti rahin?': {
      type: String,
      default: ''
    },
    'Degar koi baat/kaam/masla/mashwara/muhsiba?': {
      type: String,
      default: ''
    },
    'Kya report barwaqt arsaal kr rhi hein? Nhi to wajah?': {
      type: String,
      default: ''
    },

  }
}, {
  timestamps: true
});

// Ensure unique report per user per month
umeedwarReportSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('UmeedwarReport', umeedwarReportSchema);

