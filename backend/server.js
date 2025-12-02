const express = require('express');
const mongoose = require('mongoose');
// const cors = require('./middleware/cors');
// const { corsMiddleware, handlePreflight } = require('./middleware/cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

app.use((req, res, next) => {
  // const allowedOrigins = [
  //   'https://localhost', // android
  //   'http://localhost:3000', // local website
  //   'capacitor://localhost', // iphone
  //   'ionic://localhost'
  // ];
  
  // const origin = req.headers.origin;
  // if (allowedOrigins.includes(origin)) {
  //   res.header('Access-Control-Allow-Origin', origin);
  // }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Debug logs
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});




// // Apply CORS middleware
// app.use(corsMiddleware);
// app.use(handlePreflight);

// // Handle preflight requests explicitly
// app.options('*', (req, res) => {
//   res.status(200).end();
// });

// // Debug middleware for CORS issues
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
//   next();
// });

//end

// // Add request logging middleware FIRST
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.path}`);
//   console.log('Origin:', req.headers.origin);
//   console.log('Headers:', req.headers);
//   next();
// });

// // Middleware - IMPORTANT: Place CORS before other middleware
// const corsOptions = {
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps, Postman, etc.)
//     if (!origin) return callback(null, true);
    
//     const allowedOrigins = [
//       'http://localhost:3000',
//       'http://localhost:5173',
//       'capacitor://localhost',
//       'ionic://localhost',
//       'http://localhost',
//       'file://',
//     ];
    
//     // Check if origin starts with capacitor:// or ionic:// or file://
//     if (origin.startsWith('capacitor://') || 
//         origin.startsWith('ionic://') || 
//         origin.startsWith('file://') ||
//         allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(null, true); // For development, allow all origins
//       // For production, use: callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
//   exposedHeaders: ['Content-Range', 'X-Content-Range'],
//   maxAge: 86400, // 24 hours
// };

// app.use(cors(corsOptions));

// // Handle preflight requests
// app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import routes
const userRoutes = require('./routes/users')
const hamiReportRoutes = require('./routes/hamiReports');
const rafeeqaReportRoutes = require('./routes/rafeeqaReports');
const ruknReportRoutes = require('./routes/ruknReports');
const umeedwarReportRoutes = require('./routes/umeedwarReports');

// Routes
app.use('/api/users', userRoutes);
app.use('/api/hami-reports', hamiReportRoutes);
app.use('/api/rafeeqa-reports', rafeeqaReportRoutes);
app.use('/api/rukn-reports', ruknReportRoutes);
app.use('/api/umeedwar-reports', umeedwarReportRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Islamic Report Management System API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});