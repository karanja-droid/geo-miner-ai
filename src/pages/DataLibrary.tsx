import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  MenuItem, 
  LinearProgress, 
  Alert, 
  Select, 
  InputLabel, 
  FormControl,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Storage as StorageIcon,
  InsertDriveFile as DocumentIcon,
  Image as ImageIcon,
  Assessment as DataIcon
} from '@mui/icons-material';

interface Dataset {
  dataset_id: string;
  name: string;
  data_type: string;
  file_url: string;
  upload_date: string;
  project_id: string;
  file_size: number;
  file_format: string;
  description?: string;
}

interface Project {
  project_id: string;
  name: string;
}

// Demo data
const DEMO_PROJECTS: Project[] = [
  { project_id: 'proj-001', name: 'Copper Mountain Exploration' },
  { project_id: 'proj-002', name: 'Gold Valley Mine' },
  { project_id: 'proj-003', name: 'Lithium Springs' }
];

const DEMO_DATASETS: Dataset[] = [
  {
    dataset_id: 'ds-001',
    name: 'Drill Core Samples Q1 2024',
    data_type: 'geological',
    file_url: '/data/drill-cores-q1-2024.csv',
    upload_date: '2024-01-15T10:30:00Z',
    project_id: 'proj-001',
    file_size: 2500000,
    file_format: 'CSV',
    description: 'Quarterly drill core sample analysis results'
  },
  {
    dataset_id: 'ds-002',
    name: 'Seismic Survey Data',
    data_type: 'geophysical',
    file_url: '/data/seismic-survey-2024.segy',
    upload_date: '2024-01-12T14:20:00Z',
    project_id: 'proj-001',
    file_size: 150000000,
    file_format: 'SEGY',
    description: '3D seismic survey of the main exploration area'
  },
  {
    dataset_id: 'ds-003',
    name: 'Assay Results Gold Valley',
    data_type: 'analytical',
    file_url: '/data/assay-results-gv.xlsx',
    upload_date: '2024-01-10T09:15:00Z',
    project_id: 'proj-002',
    file_size: 850000,
    file_format: 'XLSX',
    description: 'Laboratory assay results for gold content analysis'
  },
  {
    dataset_id: 'ds-004',
    name: 'Topographical Survey',
    data_type: 'surveying',
    file_url: '/data/topo-survey.dwg',
    upload_date: '2024-01-08T16:45:00Z',
    project_id: 'proj-003',
    file_size: 12000000,
    file_format: 'DWG',
    description: 'High-resolution topographical survey of the lithium site'
  }
];

const dataTypeOptions = [
  { value: 'geological', label: 'Geological', icon: <StorageIcon />, color: '#8b4513' },
  { value: 'geophysical', label: 'Geophysical', icon: <DataIcon />, color: '#2196f3' },
  { value: 'analytical', label: 'Analytical', icon: <DocumentIcon />, color: '#4caf50' },
  { value: 'surveying', label: 'Surveying', icon: <ImageIcon />, color: '#ff9800' },
  { value: 'environmental', label: 'Environmental', icon: <FileIcon />, color: '#9c27b0' }
];

const DataLibrary: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [dataType, setDataType] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    // Simulate API calls with demo data
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 600));
        setProjects(DEMO_PROJECTS);
        setDatasets(DEMO_DATASETS);
      } catch (err) {
        setError('Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !datasetName || !dataType || !projectId) {
      setError('All fields are required.');
      return;
    }
    
    setUploading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Create new dataset
      const newDataset: Dataset = {
        dataset_id: `ds-${Date.now().toString().slice(-3)}`,
        name: datasetName,
        data_type: dataType,
        file_url: `/data/${file.name}`,
        upload_date: new Date().toISOString(),
        project_id: projectId,
        file_size: file.size,
        file_format: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
        description
      };

      // Add to datasets list
      setDatasets(prev => [newDataset, ...prev]);

      // Reset form
      setFile(null);
      setDatasetName('');
      setDataType('');
      setDescription('');
      setProjectId('');
      setSuccess('Dataset uploaded successfully!');
      setShowUploadForm(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDataTypeInfo = (type: string) => {
    return dataTypeOptions.find(opt => opt.value === type) || 
           { icon: <FileIcon />, color: '#cccccc', label: type };
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.project_id === projectId)?.name || 'Unknown Project';
  };

  if (loading) {
    return (
      <Box p={3}>
        <Typography variant="h4">Data Library</Typography>
        <Typography>Loading data library...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Data Library
        </Typography>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setShowUploadForm(!showUploadForm)}
        >
          Upload Dataset
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Upload New Dataset
          </Typography>
          <form onSubmit={handleUpload}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Project</InputLabel>
                  <Select 
                    value={projectId} 
                    onChange={e => setProjectId(e.target.value as string)} 
                    label="Project"
                  >
                    {projects.map(p => (
                      <MenuItem key={p.project_id} value={p.project_id}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField 
                  label="Dataset Name" 
                  value={datasetName} 
                  onChange={e => setDatasetName(e.target.value)} 
                  fullWidth 
                  required 
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Data Type</InputLabel>
                  <Select 
                    value={dataType} 
                    onChange={e => setDataType(e.target.value as string)}
                    label="Data Type"
                  >
                    {dataTypeOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {opt.icon}
                          {opt.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button 
                  variant="outlined" 
                  component="label" 
                  fullWidth 
                  sx={{ height: 56 }}
                  startIcon={<UploadIcon />}
                >
                  {file ? file.name : 'Select File'}
                  <input 
                    type="file" 
                    hidden 
                    onChange={e => setFile(e.target.files?.[0] || null)} 
                  />
                </Button>
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  label="Description" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  fullWidth 
                  multiline
                  minRows={2}
                />
              </Grid>
              {uploading && (
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Uploading... {uploadProgress}%
                    </Typography>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                  </Box>
                </Grid>
              )}
              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload Dataset'}
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => setShowUploadForm(false)}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}

      {/* Datasets List */}
      <Typography variant="h6" gutterBottom>
        Uploaded Datasets ({datasets.length})
      </Typography>
      
      <Paper>
        <List>
          {datasets.map((dataset, index) => {
            const typeInfo = getDataTypeInfo(dataset.data_type);
            return (
              <ListItem key={dataset.dataset_id} divider={index < datasets.length - 1}>
                <ListItemIcon>
                  <Box sx={{ color: typeInfo.color }}>
                    {typeInfo.icon}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1">
                        {dataset.name}
                      </Typography>
                      <Chip 
                        label={dataset.file_format} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Project: {getProjectName(dataset.project_id)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dataset.description || 'No description'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(dataset.file_size)} • 
                        Uploaded: {new Date(dataset.upload_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box display="flex" gap={1}>
                    <Tooltip title="View Dataset">
                      <IconButton size="small">
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton size="small">
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </Paper>
      
      {datasets.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <StorageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Datasets Found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Upload your first dataset to get started with data analysis.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<UploadIcon />}
            onClick={() => setShowUploadForm(true)}
          >
            Upload First Dataset
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default DataLibrary; 