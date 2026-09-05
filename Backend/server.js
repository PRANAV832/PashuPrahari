const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const caseRoutes = require('./routes/caseRoutes');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { seedInitialUsers } = require('./controllers/authController');
const { seedInitialCases } = require('./controllers/caseController');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', healthRoutes);
app.use('/api', caseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start Server
const startServer = async () => {
  // Start listening first
  const server = app.listen(PORT, () => {
    console.log(`[PashuPrahari Server] Running on http://localhost:${PORT}`);
  });

  // Connect to DB asynchronously
  await connectDB();
  await seedInitialUsers();
  await seedInitialCases();
};

if (require.main === module) {
  startServer();
}

module.exports = app;
