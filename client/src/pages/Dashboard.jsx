import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { motion } from 'framer-motion';

export default function Dashboard() {
  return (
    <Box sx={{ width: '100%', textAlign: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Crime Statistics Dashboard
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper 
              elevation={1}
              sx={{ 
                p: 3,
                height: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Map Component Will Go Here
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper 
              elevation={1}
              sx={{ 
                p: 3,
                height: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Crime Type Distribution Chart
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper 
              elevation={1}
              sx={{ 
                p: 3,
                height: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Monthly Trends Chart
            </Paper>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
}