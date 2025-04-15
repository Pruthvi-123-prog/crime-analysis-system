import { createTheme } from '@mui/material/styles';

export const githubTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2ea043',
      light: '#3fb950',
      dark: '#238636'
    },
    background: {
      default: '#0d1117',
      paper: '#161b22'
    },
    text: {
      primary: '#c9d1d9',
      secondary: '#8b949e'
    }
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 700
    },
    h2: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 700
    },
    h3: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 700
    },
    h4: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 500
    },
    h5: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 500
    },
    h6: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 500
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #30363d',
          transition: 'border-color 0.2s ease-in-out',
          '&:hover': {
            borderColor: '#8b949e'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 6,
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateY(-1px)'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#0d1117',
            borderRadius: 6,
            border: '1px solid #30363d',
            transition: 'border-color 0.2s',
            '&:hover': {
              borderColor: '#8b949e'
            },
            '&.Mui-focused': {
              borderColor: '#2ea043'
            }
          }
        }
      }
    }
  }
});