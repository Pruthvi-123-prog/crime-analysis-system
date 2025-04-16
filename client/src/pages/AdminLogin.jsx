import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper
  }
}));

export default function AdminLogin() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // For demo purposes, using hardcoded credentials
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      localStorage.setItem('adminToken', 'demo-token');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: 400,
      mx: 'auto',
      mt: 8
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
          Admin Login
        </Typography>

        <Paper elevation={1} sx={{ p: 4 }}>
          <form onSubmit={handleLogin}>
            <StyledTextField
              fullWidth
              label="Username"
              margin="normal"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              required
            />
            <StyledTextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              required
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              sx={{ mt: 3 }}
            >
              Login
            </Button>
          </form>
        </Paper>
      </motion.div>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}