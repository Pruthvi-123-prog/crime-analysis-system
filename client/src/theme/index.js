import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#0078d4',
      light: '#2b88d8',
      dark: '#005a9e'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          transition: 'box-shadow 0.3s, transform 0.3s',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '10px 20px',
          transition: 'all 0.3s',
          '&:hover': {
            transform: 'translateY(-1px)'
          }
        }
      }
    }
  }
});