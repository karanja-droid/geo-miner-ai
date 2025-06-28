import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, MenuItem, Alert } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Project {
  project_id: string;
  name: string;
  description: string;
  commodity: string;
  geom_extent: any;
}

const commodityOptions = [
  { value: 'copper', label: 'Copper' },
  { value: 'gold', label: 'Gold' },
  { value: 'lithium', label: 'Lithium' },
];

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [commodity, setCommodity] = useState('');
  const [geomExtent, setGeomExtent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    axios.get('/projects/').then(res => setProjects(res.data)).catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name || !commodity || !geomExtent) {
      setError('Name, commodity, and geom_extent are required.');
      return;
    }
    try {
      await axios.post('/projects/', {
        name,
        description,
        commodity,
        geom_extent: JSON.parse(geomExtent)
      });
      setName('');
      setDescription('');
      setCommodity('');
      setGeomExtent('');
      setSuccess('Project created successfully!');
      // Refresh list
      const res = await axios.get('/projects/');
      setProjects(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Project creation failed');
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4">Projects</Typography>
      <form onSubmit={handleCreate} style={{ marginTop: 16, marginBottom: 32 }}>
        <TextField label="Name" value={name} onChange={e => setName(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} fullWidth margin="normal" />
        <TextField
          select
          label="Commodity"
          value={commodity}
          onChange={e => setCommodity(e.target.value)}
          fullWidth
          margin="normal"
          required
        >
          {commodityOptions.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Geom Extent (GeoJSON Polygon)"
          value={geomExtent}
          onChange={e => setGeomExtent(e.target.value)}
          fullWidth
          margin="normal"
          required
          multiline
          minRows={2}
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Create Project
        </Button>
      </form>
      <Typography variant="h6" sx={{ mt: 4 }}>Project List</Typography>
      <ul>
        {projects.map(p => (
          <li key={p.project_id}>
            <Link to={`/projects/${p.project_id}`}>{p.name} ({p.commodity}) - {p.description}</Link>
          </li>
        ))}
      </ul>
    </Box>
  );
};

export default Projects; 