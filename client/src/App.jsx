import { useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Button, Box, Container, LinearProgress } from '@mui/material';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';
import { AnimatePresence, motion } from 'framer-motion';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReportIcon from '@mui/icons-material/Report';
import CssBaseline from '@mui/material/CssBaseline';
import { styled } from '@mui/material/styles';
import { githubTheme } from './theme/githubTheme';
import Home from './pages/Home';
import CrimeReport from './pages/CrimeReport';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';

const GlobalStyles = styled('div')`
  * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  button, a {
    min-height: 44px;
    min-width: 44px;
  }

  html, body {
    overscroll-behavior-y: contain;
  }
`;

const StyledNavbar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'rgba(13, 17, 23, 0.8)',
  backdropFilter: 'blur(12px)',
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none'
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  padding: '8px 16px',
  borderRadius: 6,
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: 'rgba(201, 209, 217, 0.08)'
  },
  '& .MuiSvgIcon-root': {
    transition: 'transform 0.2s'
  },
  '&:hover .MuiSvgIcon-root': {
    transform: 'scale(1.1)'
  }
}));

const PageTransition = styled(motion.div)({
  width: '100%'
});

const ContentWrapper = styled(Box)(({ theme }) => ({
  minHeight: 'calc(100vh - 64px)', // Subtract navbar height
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
  margin: '0 auto'
}));

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <PageTransition
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/report-crime" element={<CrimeReport />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={githubTheme}>
      <CssBaseline />
      <GlobalStyles />
      <Router>
        <Box sx={{ 
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Navbar />
          <ContentWrapper>
            <Container maxWidth="lg" sx={{ width: '100%' }}>
              <AnimatedRoutes />
            </Container>
          </ContentWrapper>
        </Box>
      </Router>
    </ThemeProvider>
  );
}