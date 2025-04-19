import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme, clickable }) => ({
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, #242424 0%, #1a1a1a 100%)',
  borderRadius: theme.shape.borderRadius * 1,
  position: 'relative',
  color: theme.palette.error.light,
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
  ...(clickable && {
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: '0 6px 8px rgba(0, 0, 0, 0.3)'
    }
  })
}));

export default StyledPaper;