const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Seed Admin Account Script
const seedAdmin = async () => {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    const adminEmail = 'taskflow@gmail.com';
    const adminUser = await User.findOne({ email: adminEmail });
    
    // Migrate any older unverified accounts to verified state automatically
    const migrationResult = await User.updateMany(
      { isVerified: { $ne: true } }, 
      { $set: { isVerified: true } }
    );
    if (migrationResult.modifiedCount > 0) {
      console.log(`Migration Log: Marked ${migrationResult.modifiedCount} accounts as verified.`);
    }

    // Reactivate yuvrajkalpure@gmail.com account
    const reactivateResult = await User.updateOne(
      { email: 'yuvrajkalpure@gmail.com' },
      { $set: { isDeleted: false, isVerified: true } }
    );
    if (reactivateResult.modifiedCount > 0) {
      console.log('Migration Log: Reactivated yuvrajkalpure@gmail.com account.');
    }

    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Taskflow@admin', salt);
      
      await User.create({
        username: 'admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      });
      console.log('Seed Log: Default admin seeded successfully.');
    }
  } catch (error) {
    console.error('Seed Log Error:', error.message);
  }
};

// Seed admin once mongoose database opens
mongoose.connection.once('open', () => {
  seedAdmin();
});

const app = express();

// Morgan Middleware 
app.use(morgan('dev'));

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes);

// Base route for connectivity checking
app.get('/', (req, res) => {
  res.json({ message: 'Task Tracker API is running...' });
});

// Route not found fallback
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found - ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
