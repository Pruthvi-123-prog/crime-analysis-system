const fs = require('fs');
const { parse } = require('csv-parse');
const path = require('path');

const readCrimeData = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    const dataPath = path.join(__dirname, '../../Data'); // Updated path to your Data folder
    
    fs.createReadStream(path.join(dataPath, 'crime_data.csv')) // Update filename to match your data file
      .pipe(parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      }))
      .on('data', (data) => {
        // Assuming your CSV has latitude, longitude columns
        if (data.latitude && data.longitude) {
          results.push({
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            type: data.type || 'Unknown',
            date: data.date || 'Unknown',
            description: data.description || ''
          });
        }
      })
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

module.exports = { readCrimeData };