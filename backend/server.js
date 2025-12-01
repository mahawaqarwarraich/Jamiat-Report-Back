const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware - IMPORTANT: Place CORS before other middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'capacitor://localhost',
      'ionic://localhost',
      'http://localhost',
      'file://',
    ];
    
    // Check if origin starts with capacitor:// or ionic:// or file://
    if (origin.startsWith('capacitor://') || 
        origin.startsWith('ionic://') || 
        origin.startsWith('file://') ||
        allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // For development, allow all origins
      // For production, use: callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

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