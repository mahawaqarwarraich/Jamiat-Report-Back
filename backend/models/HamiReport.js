const mongoose = require('mongoose');
const hamiDaySchema = require('./HamiDay');

const hamiReportSchema = new mongoose.Schema({
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
    type: [hamiDaySchema],
    default: []
  },
  qa: {
    'Kya koi namaz qaza hui?(agr haan to kis waqt ki aur kyun)': {
      type: String,
      default: ''
    },
    'Dauran namaz tarjuma pr ghor kiya?': {
      type: String,
      default: ''
    },
    'Hifz shuda suraton k naam?': {
      type: String,
      default: ''
    },
    'Dua?': {
      type: String,
      default: ''
    },
    'Hadees?': {
      type: String,
      default: ''
    },
    'Mutaleya shuda surat(tafseer k saath)?': {
      type: String,
      default: ''
    },
    'Kitaat hadees?': {
      type: String,
      default: ''
    },
    'Mutaleya shuda literature?(kitaab ka naam)': {
      type: String,
      default: ''
    },
    'Mutaleya sy liye gaye eham asool?': {
      type: String,
      default: ''
    },
    'Amal ki kitni koshish rhi?': {
      type: String,
      default: ''
    },
    'Darsi kutab ko rozana kitna waqt diya? Apni perhai ko rozana kitna waqt diya?': {
      type: String,
      default: ''
    },
    'Quran o hadees circle? (tadaad)': {
      type: String,
      default: ''
    },
    'Group discussions? (tadaad)': {
      type: String,
      default: ''
    },
    'Itemai mutaleya? (tadaad)': {
      type: String,
      default: ''
    },
    'Pamphalet o dawati masnuaat ki takseem? (tadaad)': {
      type: String,
      default: ''
    },
    'Tadaad mutaiyan afraad? (apki wo dostein jin ki islah k liye ap koshish krti hein)': {
      type: String,
      default: ''
    },
    'Is maah izafa mutaiyan afraad?': {
      type: String,
      default: ''
    },
    'Is maah mutaiyan afraad k saath ki gai sargarmiyaan?': {
      type: String,
      default: ''
    },
    'Is maah karkunaan sy kitni mulakaatein ki?': {
      type: String,
      default: ''
    },
    'Is maah kitny khatoot likhy?': {
      type: String,
      default: ''
    },
    'Khandaan, hamsaya aur degar mutalakeen  main dawat pohanchaany aur husn mamla ki kya koshishein rhin?': {
      type: String,
      default: ''
    },
    'Kya mutaliqa ijtemaat main shirkat ki?': {
      type: String,
      default: ''
    },
    'Nhi to wajah?': {
      type: String,
      default: ''
    },
    'Ijtemaat main shirkat sy faida mehsoos hua?': {
      type: String,
      default: ''
    },
    'Nisaab main milny waaly kaam kiye?': {
      type: String,
      default: ''
    },
    'Nhi to wajah?': {
      type: String,
      default: ''
    },
    'Report berwaqt arsaal kr rhi hein?': {
      type: String,
      default: ''
    },
    'Nhi to wajah?': {
      type: String,
      default: ''
    },
    'Infaaq fi sabilillah k liye kya koshishein rhin?': {
      type: String,
      default: ''
    },
    'Zubaan ki hifazat aur fehash goi sy bachany ki kya koshish': {
      type: String,
      default: ''
    },
    'Koi khaas baat, mushkil, mashwara o muhasiba?': {
      type: String,
      default: ''
    },
    'Tareekh arsaal krda?': {
      type: String,
      default: ''
    }
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure unique report per user per month
hamiReportSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('HamiReport', hamiReportSchema);