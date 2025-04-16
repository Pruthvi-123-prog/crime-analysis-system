import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Alert,
  Snackbar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import axios from 'axios';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin');
      return;
    }
    fetchReports();
  }, [navigate]);

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/crimes');
      setReports(response.data);
    } catch (error) {
      setError('Failed to fetch reports');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/crimes/${id}`, { status });
      setSuccess(`Report ${status}`);
      fetchReports();
    } catch (error) {
      setError('Failed to update status');
    }
  };

  const handleEdit = (caseData) => {
    setSelectedCase(caseData);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (editedCase) => {
    try {
      await axios.put(`http://localhost:5000/api/crimes/${editedCase._id}`, editedCase);
      setSuccess('Case updated successfully');
      setEditDialogOpen(false);
      fetchReports();
    } catch (error) {
      setError('Failed to update case');
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Crime Reports Management
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report._id}>
                <TableCell>{report.title}</TableCell>
                <TableCell>{report.type}</TableCell>
                <TableCell>{report.description}</TableCell>
                <TableCell>
                  {`${report.location.lat}, ${report.location.lng}`}
                </TableCell>
                <TableCell>
                  <Chip
                    label={report.status}
                    color={
                      report.status === 'accepted' ? 'success' :
                      report.status === 'rejected' ? 'error' : 'default'
                    }
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {report.status === 'pending' && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleStatusUpdate(report._id, 'accepted')}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleStatusUpdate(report._id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEdit(report)}
                    >
                      Edit
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Case Details</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              name="title"
              label="Title"
              value={selectedCase?.title || ''}
              onChange={(e) => setSelectedCase({
                ...selectedCase,
                title: e.target.value
              })}
              fullWidth
            />
            <TextField
              name="description"
              label="Description"
              value={selectedCase?.description || ''}
              onChange={(e) => setSelectedCase({
                ...selectedCase,
                description: e.target.value
              })}
              multiline
              rows={4}
              fullWidth
            />
            <TextField
              name="type"
              label="Crime Type"
              value={selectedCase?.type || ''}
              onChange={(e) => setSelectedCase({
                ...selectedCase,
                type: e.target.value
              })}
              select
              fullWidth
            >
              <MenuItem value="Theft">Theft</MenuItem>
              <MenuItem value="Robbery">Robbery</MenuItem>
              <MenuItem value="Assault">Assault</MenuItem>
              <MenuItem value="Vandalism">Vandalism</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <TextField
              name="status"
              label="Status"
              value={selectedCase?.status || ''}
              onChange={(e) => setSelectedCase({
                ...selectedCase,
                status: e.target.value
              })}
              select
              fullWidth
            >
              <MenuItem value="accepted">Accepted</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleSaveEdit(selectedCase)} 
            variant="contained" 
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

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

      <Snackbar
        open={!!success}
        autoHideDuration={2000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}