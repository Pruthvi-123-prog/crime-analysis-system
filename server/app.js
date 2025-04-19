const express = require('express');
const cors = require('cors');
const path = require('path');
const analysisRoutes = require('./routes/analysis.routes');

const app = express();

// Enable CORS for frontend requests
app.use(cors());
app.use(express.json());

// Mount analysis routes
app.use('/api/analysis', analysisRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});