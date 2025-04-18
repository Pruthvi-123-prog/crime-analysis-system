import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import SecurityIcon from '@mui/icons-material/Security';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import MapIcon from '@mui/icons-material/Map';

export default function Dashboard() {
  return (
    <Box sx={{ width: '100%', p: 3, bgcolor: '#1a1a1a' }}> {/* Changed to dark background */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ 
          textAlign: 'center', 
          mb: 4, 
          p: 3, 
          bgcolor: 'black', 
          color: 'error.main',
          borderRadius: 1
        }}>
          <SecurityIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" gutterBottom>
            Crime Statistics Dashboard
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'error.light' }}>
            Comprehensive analysis of crime patterns and trends
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 3,
                height: '400px',
                bgcolor: '#242424', // Changed to dark gray
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                color: 'error.light' // Added light red text
              }}
            >
              <Box sx={{ 
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 1,
                bgcolor: 'rgba(0,0,0,0.9)',
                color: 'error.main',
                p: '8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <MapIcon />
                <Typography variant="subtitle2">
                  Crime Hotspot Analysis
                </Typography>
              </Box>
              Map Component Will Go Here
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 3,
                height: '300px',
                bgcolor: '#242424', // Changed to dark gray
                borderRadius: 2,
                position: 'relative',
                color: 'error.light' // Added light red text
              }}
            >
              <Box sx={{ 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'error.main'
              }}>
                <AssessmentIcon />
                <Typography variant="h6">
                  Crime Type Distribution
                </Typography>
              </Box>
              Crime Type Distribution Chart
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 3,
                height: '300px',
                bgcolor: '#242424', // Changed to dark gray
                borderRadius: 2,
                position: 'relative',
                color: 'error.light' // Added light red text
              }}
            >
              <Box sx={{ 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'error.main'
              }}>
                <TimelineIcon />
                <Typography variant="h6">
                  Monthly Trends
                </Typography>
              </Box>
              Monthly Trends Chart
            </Paper>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
}