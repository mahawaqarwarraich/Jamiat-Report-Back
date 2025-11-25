const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');







// Load environment variables
dotenv.config();

const app = express();

// For production
// app.use(express.static(path.join(__dirname, '../frontend/build')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
// });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// To avoid cors error
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jamiat-reports';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import routes
const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');
const hamiReportRoutes = require('./routes/hamiReports');
const rafeeqaReportRoutes = require('./routes/rafeeqaReports');
const ruknReportRoutes = require('./routes/ruknReports');
const umeedwarReportRoutes = require('./routes/umeedwarReports');

// Routes
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
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