import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, MenuItem, Alert } from '@mui/material';
import axios from 'axios';

interface Project {
  project_id: string;
  name: string;
}

const AIAnalysis: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState('');
  const [modelId, setModelId] = useState('');
  const [areaGeoJSON, setAreaGeoJSON] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [runId, setRunId] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    axios.get('/projects/').then(res => setProjects(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setStatus('');
    if (!projectId || !modelId || !areaGeoJSON) {
      setError('All fields are required.');
      return;
    }
    try {
      const res = await axios.post('/ai/run', {
        project_id: projectId,
        model_id: modelId,
        area_geojson: JSON.parse(areaGeoJSON)
      });
      setResult(res.data);
      setRunId(res.data.run_id || 'test-run-id'); // Use returned run_id if available
    } catch (err: any) {
      setError(err.response?.data?.detail || 'AI job submission failed');
    }
  };

  const handleCheckStatus = async () => {
    if (!runId) return;
    try {
      const res = await axios.get(`/ai/status/${runId}`);
      setStatus(res.data.status);
    } catch (err: any) {
      setStatus('Error fetching status');
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4">AI Analysis</Typography>
      <form onSubmit={handleSubmit} style={{ marginTop: 16, marginBottom: 32 }}>
        <TextField
          select
          label="Project"
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
          fullWidth
          margin="normal"
          required
        >
          {projects.map(p => (
            <MenuItem key={p.project_id} value={p.project_id}>{p.name}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Model ID"
          value={modelId}
          onChange={e => setModelId(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Area GeoJSON (Polygon)"
          value={areaGeoJSON}
          onChange={e => setAreaGeoJSON(e.target.value)}
          fullWidth
          margin="normal"
          required
          multiline
          minRows={2}
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Submit AI Job
        </Button>
      </form>
      {result && (
        <Box mt={2}>
          <Alert severity="success">AI job submitted! Run ID: {runId}</Alert>
          <Button variant="outlined" onClick={handleCheckStatus} sx={{ mt: 2 }}>
            Check Job Status
          </Button>
          {status && <Typography sx={{ mt: 2 }}>Status: {status}</Typography>}
        </Box>
      )}
    </Box>
  );
};

export default AIAnalysis; 