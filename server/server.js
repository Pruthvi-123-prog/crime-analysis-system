require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Import routes
const crimeRoutes = require('./routes/crime.routes');
const analysisRoutes = require('./routes/analysis.routes');

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Crime Analysis API Server',
        endpoints: {
            crimeData: '/api/crimes',
            analysis: '/api/analysis/data'
        }
    });
});

// Mount routes - Check these paths
app.use('/api/crimes', crimeRoutes);         // This works
app.use('/api/analysis', analysisRoutes);    // This might be mismatched

// Basic error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Available endpoints:');
    console.log('- GET /api/crimes');
    console.log('- GET /api/analysis/data');
});