const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse/sync');

const stateCoordinates = {
  "ANDHRA PRADESH": [78.5000, 16.5000],
  "ARUNACHAL PRADESH": [94.7278, 28.2180],
  "ASSAM": [92.9376, 26.2006],
  "BIHAR": [85.3131, 25.0961],
  "CHHATTISGARH": [81.8661, 21.2787],
  "GOA": [74.1240, 15.2993],
  "GUJARAT": [71.1924, 22.2587],
  "HARYANA": [76.0856, 29.0588],
  "HIMACHAL PRADESH": [77.1734, 31.1048],
  "JHARKHAND": [85.2799, 23.6102],
  "KARNATAKA": [75.7139, 15.3173],
  "KERALA": [76.2711, 10.8505],
  "MADHYA PRADESH": [78.6569, 22.9734],
  "MAHARASHTRA": [75.7139, 19.7515],
  "MANIPUR": [93.9063, 24.6637],
  "MEGHALAYA": [91.3662, 25.4670],
  "MIZORAM": [92.9376, 23.1645],
  "NAGALAND": [94.5624, 26.1584],
  "ODISHA": [85.0985, 20.9517],
  "PUNJAB": [75.3412, 31.1471],
  "RAJASTHAN": [74.2179, 27.0238],
  "SIKKIM": [88.5122, 27.5330],
  "TAMIL NADU": [78.6569, 11.1271],
  "TELANGANA": [79.0193, 17.1231],
  "TRIPURA": [91.9882, 23.9408],
  "UTTAR PRADESH": [80.9462, 26.8467],
  "UTTARAKHAND": [79.0193, 30.0668],
  "WEST BENGAL": [87.8550, 22.9868],
  "DELHI": [77.1025, 28.7041]
};

router.get('/crime-data', async (req, res) => {
  try {
    const csvPath = path.join(__dirname, '../../Data/crime/crime/01_District_wise_crimes_committed_IPC_2013.csv');
    const fileContent = await fs.readFile(csvPath, 'utf-8');
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    // Aggregate data by state
    const stateData = records.reduce((acc, record) => {
      const state = record['STATE/UT'];
      if (!acc[state]) {
        acc[state] = {
          state: state,
          coordinates: stateCoordinates[state] || [78.9629, 20.5937],
          totalCrimes: 0,
          murder: 0,
          rape: 0,
          kidnapping: 0,
          robbery: 0,
          theft: 0
        };
      }
      
      acc[state].totalCrimes += parseInt(record['TOTAL IPC CRIMES']) || 0;
      acc[state].murder += parseInt(record['MURDER']) || 0;
      acc[state].rape += parseInt(record['RAPE']) || 0;
      acc[state].kidnapping += parseInt(record['KIDNAPPING & ABDUCTION']) || 0;
      acc[state].robbery += parseInt(record['ROBBERY']) || 0;
      acc[state].theft += parseInt(record['THEFT']) || 0;
      
      return acc;
    }, {});

    const processedData = Object.values(stateData);
    res.json(processedData);
  } catch (error) {
    console.error('Error reading crime data:', error);
    res.status(500).json({ error: 'Failed to read crime data' });
  }
});

module.exports = router;