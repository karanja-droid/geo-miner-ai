import React, { useState } from 'react';
import { Box, Typography, Button, Tabs, Tab, Alert, Snackbar, Tooltip, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AceEditor from 'react-ace';
import axios from 'axios';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';

const modules = [
  {
    label: 'Drilling Optimization',
    endpoint: '/ai/mining/drilling-optimize',
    tooltip: 'Upload drill logs as JSON. Example: { "logs": [{ "x": 100, "y": 200, "depth": 50, "assay": 1.2 }] }',
    example: '{\n  "logs": [\n    { "x": 100, "y": 200, "depth": 50, "assay": 1.2 },\n    { "x": 120, "y": 210, "depth": 60, "assay": 0.9 }\n  ]\n}'
  },
  {
    label: 'Blast Prediction',
    endpoint: '/ai/mining/blast-predict',
    tooltip: 'Input blast design parameters. Example: { "burden": 3, "spacing": 4, "hole_depth": 10, "charge": 20, "rock_type": "granite" }',
    example: '{\n  "burden": 3,\n  "spacing": 4,\n  "hole_depth": 10,\n  "charge": 20,\n  "rock_type": "granite"\n}'
  },
  {
    label: 'Ore Grade Prediction',
    endpoint: '/ai/mining/grade-predict',
    tooltip: 'Input assay data and coordinates. Example: { "samples": [{ "x": 100, "y": 200, "grade": 1.1 }] }',
    example: '{\n  "samples": [\n    { "x": 100, "y": 200, "grade": 1.1 },\n    { "x": 120, "y": 210, "grade": 0.8 }\n  ]\n}'
  },
  {
    label: 'Equipment Health',
    endpoint: '/ai/mining/equipment-health',
    tooltip: 'Input time-series sensor data. Example: { "equipment_id": "EX123", "sensors": [{ "timestamp": "2023-01-01T00:00:00Z", "vibration": 0.2 }] }',
    example: '{\n  "equipment_id": "EX123",\n  "sensors": [\n    { "timestamp": "2023-01-01T00:00:00Z", "vibration": 0.2, "temperature": 75 }\n  ]\n}'
  }
];

const MiningAI: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [input, setInput] = useState(modules[0].example);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await axios.post(modules[tab].endpoint, JSON.parse(input));
      setResult(res.data);
      setSnackbar({ open: true, message: 'AI analysis complete!', severity: 'success' });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Request failed');
      setSnackbar({ open: true, message: 'Request failed', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleShowExample = () => {
    setInput(modules[tab].example);
    setResult(null);
    setError('');
  };

  return (
    <Box p={3}>
      <Typography variant="h4">Mining AI Modules</Typography>
      <Tabs value={tab} onChange={(_, v) => { setTab(v); setInput(modules[v].example); setResult(null); setError(''); }} sx={{ mb: 2 }}>
        {modules.map((m, i) => (
          <Tab key={m.label} label={
            <Box display="flex" alignItems="center">
              {m.label}
              <Tooltip title={m.tooltip} arrow>
                <IconButton size="small" sx={{ ml: 1 }}><InfoIcon fontSize="small" /></IconButton>
              </Tooltip>
            </Box>
          } />
        ))}
      </Tabs>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <Box display="flex" alignItems="center" mb={1}>
          <Typography variant="subtitle1">Input JSON</Typography>
          <Button size="small" onClick={handleShowExample} sx={{ ml: 2 }}>Show Example</Button>
        </Box>
        <AceEditor
          mode="json"
          theme="github"
          value={input}
          onChange={setInput}
          name="json-editor"
          width="100%"
          height="200px"
          fontSize={14}
          setOptions={{ useWorker: false }}
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ mt: 2 }}>
          {loading ? 'Processing...' : 'Submit'}
        </Button>
      </form>
      {result && (
        <Box mt={2}>
          <Typography variant="h6">Result</Typography>
          <pre style={{ background: '#f5f5f5', padding: 16 }}>{JSON.stringify(result, null, 2)}</pre>
        </Box>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MiningAI; 