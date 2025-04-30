require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import routes
const storeRoutes = require('./src/routes/storeRoutes');
const userRoutes = require('./src/routes/userRoutes');
const itemRoutes = require('./src/routes/itemRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'https://cs-9-andi-muhammad-alvin-farhansyah.vercel.app',
    'https://os.netlabdte.com', 
    'http://localhost:5173', 
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}));
app.use(express.json());

// Root route
app.get("/", (req, res) => {  
  res.send("Express API is running...");
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const dbConnection = await require('./src/database/connection').testConnection();
    
    res.status(200).json({
      status: 'UP',
      services: {
        database: dbConnection ? 'UP' : 'DOWN'
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'DOWN',
      services: {
        database: 'DOWN'
      },
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Register route modules
app.use('/store', storeRoutes);
app.use('/user', userRoutes);
app.use('/item', itemRoutes);
app.use('/transaction', transactionRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    payload: process.env.NODE_ENV === 'development' ? err.message : null
  });
});

// Start the server only in development mode
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

// Export the app for Vercel serverless deployment
module.exports = app;
