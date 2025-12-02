const mongoose = require('mongoose');
const rafeeqaDaySchema = require('./RafeeqaDay');

const rafeeqaReportSchema = new mongoose.Schema({
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
    type: [rafeeqaDaySchema],
    default: []
  },
  qa: {
    'Agr koi namaz qaza hui to kis waqt ki aur kyun?': {
      type: String,
      default: ''
    },
    'Mutaleya tafseer-o-hadees sy liye gaye eham asool aur us pr amal daramad ki surat-e-haal?': {
      type: String,
      default: ''
    },
    'Mutaleya shuda(surat, kitaab, hadees, literature) ka naam?(mukamal/jari)': {
      type: String,
      default: ''
    },
    'Hifz shuda surat, hadees, dua?': {
      type: String,
      default: ''
    },
    'Konsi ikhlaaqi khoobi apnaaney ya burai chorny ki koshish rhi?': {
      type: String,
      default: ''
    },
    'Khandaan, hamsaya, degar mutalakeen k saath husn mamla, khidmat, ayadat, tauhfa waghera ki kya koshishein rhin?': {
      type: String,
      default: ''
    },
    'Tadaad mutaiyan afraad?': {
      type: String,
      default: ''
    },
    'Izafa mutaiyan afraad?': {
      type: String,
      default: ''
    },
    'Kitny mutaiyan afraad sy raabta rha?': {
      type: String,
      default: ''
    },
    'Mutaiyan afraad k saath ki gai sirgarmiyaan?': {
      type: String,
      default: ''
    },
    'Kya apka halka dars qaim hai?': {
      type: String,
      default: ''
    },
    'Dawati halky main ki gai sirgarmiyaan?(sisilawar dars quran/qurani class/degar)': {
      type: String,
      default: ''
    },
    'Kitny hami banaye?': {
      type: String,
      default: ''
    },
    'Kitny afraad ko islam ki bunyadi baatein sikhai?': {
      type: String,
      default: ''
    },
    'Ijtemai mutaly(tadaad)?': {
      type: String,
      default: ''
    },
    'Group discusssions(tadaad)?': {
      type: String,
      default: ''
    },
    'Hadiya kutab(tadaad)?': {
      type: String,
      default: ''
    },
    'Library sy parhwain(tadaad)?': {
      type: String,
      default: ''
    },
    'Kya mtutalka ijtemaat main shirkat ki?': {
      type: String,
      default: ''
    },
    'Shirkat na krny ki wajah?': {
      type: String,
      default: ''
    },
    'Apni anat di?': {
      type: String,
      default: ''
    },
    'Doosron sy kitni jama ki?': {
      type: String,
      default: ''
    },
    'Kya nisaab main milny waaly kaam kiye?': {
      type: String,
      default: ''
    },
    'Zer-e-tarbiyat afraad k liye kya koshishein rhi?': {
      type: String,
      default: ''
    },
    'Degar koi baat/kaam/masla/mashwara/muhsiba?': {
      type: String,
      default: ''
    },
    'Kya report barwaqt arsaal kr rhi hein?': {
      type: String,
      default: ''
    },
    'Agr berwaqt arsaal nahi kr rhi to wajah?': {
      type: String,
      default: ''
    },
    'Arsaal krdah khatoot nazma shehr/rafiqaat/karkunaan?': {
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
rafeeqaReportSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('RafeeqaReport', rafeeqaReportSchema);