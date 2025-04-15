import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#10a37f',
      light: '#1ac0a4',
      dark: '#0d8c6d'
    },
    background: {
      default: 'transparent',
      paper: 'rgba(32, 33, 35, 0.8)'
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)'
    }
  },
  typography: {
    fontFamily: "'Söhne', 'Inter', system-ui, sans-serif"
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            backgroundColor: 'rgba(42, 43, 50, 0.8)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
          fontWeight: 500
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#40414f',
            '&:hover': {
              backgroundColor: '#40414f'
            },
            '&.Mui-focused': {
              backgroundColor: '#40414f'
            }
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    }
  }
});