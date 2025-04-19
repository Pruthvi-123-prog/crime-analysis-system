import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import SecurityIcon from '@mui/icons-material/Security';

export default function PageLayout({ title, subtitle, children }) {
  return (
    <Box sx={{ 
      width: '100%', 
      p: 3, 
      background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
      minHeight: '100vh'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ 
          textAlign: 'center', 
          mb: 4, 
          p: 3, 
          background: 'linear-gradient(135deg, #1f1f1f 0%, #0f0f0f 100%)',
          color: 'error.main',
          borderRadius: 2,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        }}>
          <SecurityIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" gutterBottom>
            {title}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'error.light' }}>
            {subtitle}
          </Typography>
        </Box>
        {children}
      </motion.div>
    </Box>
  );
}