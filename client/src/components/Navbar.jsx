import { AppBar, Toolbar, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReportIcon from '@mui/icons-material/Report';
import { styled } from '@mui/material/styles';

const StyledNavbar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'rgba(13, 17, 23, 0.8)',
  backdropFilter: 'blur(12px)',
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  borderRadius: '0 0 12px 12px', // Added curved bottom corners
  margin: '0 16px', // Added margin to create floating effect
  width: 'calc(100% - 32px)', // Adjust width to account for margin
  top: '8px', // Add some top spacing
  '& .MuiToolbar-root': {
    minHeight: '64px'
  }
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  padding: '8px 16px',
  margin: '0 8px',
  borderRadius: 6,
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

export default function Navbar() {
  return (
    <StyledNavbar position="sticky">
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'center' }}>
          <NavButton component={RouterLink} to="/" startIcon={<HomeIcon />}>
            Home
          </NavButton>
          <NavButton component={RouterLink} to="/dashboard" startIcon={<DashboardIcon />}>
            Dashboard
          </NavButton>
          <NavButton component={RouterLink} to="/report-crime" startIcon={<ReportIcon />}>
            Report Crime
          </NavButton>
        </Toolbar>
      </Container>
    </StyledNavbar>
  );
}