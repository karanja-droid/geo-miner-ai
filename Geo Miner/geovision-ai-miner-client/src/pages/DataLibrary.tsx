import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, MenuItem, LinearProgress, Alert, Select, InputLabel, FormControl } from '@mui/material';
import axios from 'axios';

interface Dataset {
  dataset_id: string;
  name: string;
  data_type: string;
  file_url: string;
  upload_date: string;
}

interface Project {
  project_id: string;
  name: string;
}

const DataLibrary: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [dataType, setDataType] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Fetch projects
    axios.get('/projects/').then(res => setProjects(res.data)).catch(() => {});
    // Fetch datasets
    axios.get('/data/list').then(res => setDatasets(res.data)).catch(() => {});
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !datasetName || !dataType || !projectId) {
      setError('All fields are required.');
      return;
    }
    setUploading(true);
    setError('');
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('datasetName', datasetName);
    formData.append('dataType', dataType);
    formData.append('description', description);
    formData.append('projectId', projectId);
    try {
      await axios.post('/data/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });
      setUploading(false);
      setFile(null);
      setDatasetName('');
      setDataType('');
      setDescription('');
      setProjectId('');
      // Refresh datasets
      const res = await axios.get('/data/list');
      setDatasets(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed');
      setUploading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4">Data Library</Typography>
      <form onSubmit={handleUpload} style={{ marginTop: 16, marginBottom: 32 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Project</InputLabel>
          <Select value={projectId} onChange={e => setProjectId(e.target.value as string)} required label="Project">
            {projects.map(p => (
              <MenuItem key={p.project_id} value={p.project_id}>{p.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField label="Dataset Name" value={datasetName} onChange={e => setDatasetName(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Type" value={dataType} onChange={e => setDataType(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} fullWidth margin="normal" />
        <Button variant="contained" component="label" fullWidth sx={{ mt: 2 }}>
          {file ? file.name : 'Select File'}
          <input type="file" hidden onChange={e => setFile(e.target.files?.[0] || null)} />
        </Button>
        {uploading && <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 2 }} />}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={uploading}>
          Upload
        </Button>
      </form>
      <Typography variant="h6" sx={{ mt: 4 }}>Uploaded Datasets</Typography>
      <ul>
        {datasets.map(ds => (
          <li key={ds.dataset_id}>{ds.name} ({ds.data_type}) - Uploaded: {new Date(ds.upload_date).toLocaleString()}</li>
        ))}
      </ul>
    </Box>
  );
};

export default DataLibrary; 