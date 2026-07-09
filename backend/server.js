require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { validateEnv } = require('./config/envCheck');
const { securityHeaders } = require('./middleware/securityHeaders');
const { sanitizeInput } = require('./middleware/sanitize');
const logger = require('./utils/logger');

// Run environment configuration check
validateEnv();

// Import routes
const authRoutes = require('./routes/authRoutes');
const designerRoutes = require('./routes/designerRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Trust proxy if behind a load balancer (for correct rate limiter IP tracking)
app.set('trust proxy', 1);

// Configure CORS
const allowedOriginsVal = process.env.ALLOWED_ORIGINS;
let corsOptions = {};
if (allowedOriginsVal) {
  const origins = allowedOriginsVal.split(',').map(o => o.trim());
  // Ensure development and production origins are always permitted
  const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://designerportal.vercel.app'];
  defaultOrigins.forEach(o => {
    if (!origins.includes(o)) {
      origins.push(o);
    }
  });

  corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || origins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        logger.warn('CORS request blocked from origin', { origin });
        callback(null, false); // Return false instead of throwing error to reject CORS cleanly
      }
    },
    credentials: true
  };
} else {
  // In development, default to allowing local origins and the deployed Vercel frontend
  corsOptions = {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://designerportal.vercel.app'],
    credentials: true
  };
}

// Middlewares
app.use(cors(corsOptions));
app.use(securityHeaders);
app.use(express.json({ limit: '10kb' })); // Limit body sizes to prevent DoS memory exhaustion
app.use(sanitizeInput);

// Structured logger for incoming API requests
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/designers', designerRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Base Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Architect & Interior Designer Connect Portal REST API',
    version: '1.0.0'
  });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled application error occurred', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

// Connect DB and then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Backend server running on port ${PORT}`);
  });
});
