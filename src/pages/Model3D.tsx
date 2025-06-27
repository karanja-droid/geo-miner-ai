import React, { useState } from 'react';
import { Box, Typography, Button, Select, MenuItem, CircularProgress, Alert } from '@mui/material';
import ThreeDViewer from '../components/ThreeDViewer';
import axios from 'axios';

interface Domain {
  id: number;
  name: string;
  type: string;
}

const Model3D: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<number | null>(null);
  const [mesh, setMesh] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch domains on mount
  React.useEffect(() => {
    axios.get('/model3d/domains')
      .then(res => setDomains(res.data.domains))
      .catch(() => setDomains([]));
  }, []);

  const handleFetchMesh = async () => {
    if (!selectedDomain) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/model3d/export', { domain_id: selectedDomain, format: 'json' });
      const meshData = JSON.parse(res.data.data);
      setMesh(meshData);
    } catch (err: any) {
      setError('Failed to fetch mesh data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4">3D Geological Model Viewer</Typography>
      <Box display="flex" alignItems="center" mb={2}>
        <Select
          value={selectedDomain || ''}
          onChange={e => setSelectedDomain(Number(e.target.value))}
          displayEmpty
          sx={{ minWidth: 200, mr: 2 }}
        >
          <MenuItem value="">Select Domain</MenuItem>
          {domains.map(d => (
            <MenuItem key={d.id} value={d.id}>{d.name} ({d.type})</MenuItem>
          ))}
        </Select>
        <Button variant="contained" onClick={handleFetchMesh} disabled={!selectedDomain || loading}>
          Load Model
        </Button>
      </Box>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
};

export default Model3D; 