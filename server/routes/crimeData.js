const express = require('express');
const router = express.Router();
const { readCrimeData } = require('../utils/csvReader');

router.get('/api/crime-data', async (req, res) => {
  try {
    const crimeData = await readCrimeData();
    res.json(crimeData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read crime data' });
  }
});

module.exports = router;