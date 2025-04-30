const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');

router.get('/property-crime', async (req, res) => {
    try {
        const pythonProcess = spawn('python', [
            path.join(__dirname, '..', 'analysis', 'crime_analysis.py')
        ]);

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error('Python process error:', errorString);
                return res.status(500).json({ error: 'Analysis failed' });
            }

            try {
                const analysisData = JSON.parse(dataString);
                res.json(analysisData);
            } catch (error) {
                console.error('JSON parsing error:', error);
                res.status(500).json({ error: 'Failed to parse analysis data' });
            }
        });

    } catch (error) {
        console.error('Route error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;