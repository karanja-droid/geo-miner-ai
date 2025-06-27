import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  MenuItem, 
  Alert, 
  Card, 
  CardContent, 
  CardActions,
  Grid,
  Chip,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  Add as AddIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

interface Project {
  project_id: string;
  name: string;
  description: string;
  commodity: string;
  geom_extent: any;
  created_date: string;
  status: 'active' | 'completed' | 'planning';
}

const commodityOptions = [
  { value: 'copper', label: 'Copper', color: '#ff6b35' },
  { value: 'gold', label: 'Gold', color: '#ffd700' },
  { value: 'lithium', label: 'Lithium', color: '#c0c0c0' },
  { value: 'iron', label: 'Iron Ore', color: '#8b4513' },
  { value: 'coal', label: 'Coal', color: '#2f4f4f' },
];

// Demo projects data
const DEMO_PROJECTS: Project[] = [
  {
    project_id: 'proj-001',
    name: 'Copper Mountain Exploration',
    description: 'Large-scale copper exploration project in the Rocky Mountains region.',
    commodity: 'copper',
    geom_extent: {
      type: 'Polygon',
      coordinates: [[[-105.2, 39.7], [-105.1, 39.7], [-105.1, 39.8], [-105.2, 39.8], [-105.2, 39.7]]]
    },
    created_date: '2024-01-15T10:00:00Z',
    status: 'active'
  },
  {
    project_id: 'proj-002',
    name: 'Gold Valley Mine',
    description: 'High-grade gold mining operation with advanced extraction techniques.',
    commodity: 'gold',
    geom_extent: {
      type: 'Polygon',
      coordinates: [[[-118.5, 34.1], [-118.4, 34.1], [-118.4, 34.2], [-118.5, 34.2], [-118.5, 34.1]]]
    },
    created_date: '2024-01-10T14:30:00Z',
    status: 'active'
  },
  {
    project_id: 'proj-003',
    name: 'Lithium Springs',
    description: 'Battery-grade lithium extraction from brine deposits.',
    commodity: 'lithium',
    geom_extent: {
      type: 'Polygon',
      coordinates: [[[-116.2, 37.1], [-116.1, 37.1], [-116.1, 37.2], [-116.2, 37.2], [-116.2, 37.1]]]
    },
    created_date: '2024-01-05T09:15:00Z',
    status: 'planning'
  }
];

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [commodity, setCommodity] = useState('');
  const [geomExtent, setGeomExtent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    // Simulate API call with demo data
    const loadProjects = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setProjects(DEMO_PROJECTS);
      } catch (err) {
        setError('Failed to load projects');
        console.error('Error loading projects:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
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
      // Validate GeoJSON
      JSON.parse(geomExtent);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new project
      const newProject: Project = {
        project_id: `proj-${Date.now().toString().slice(-3)}`,
        name,
        description,
        commodity,
        geom_extent: JSON.parse(geomExtent),
        created_date: new Date().toISOString(),
        status: 'planning'
      };

      // Add to projects list
      setProjects(prev => [newProject, ...prev]);
      
      // Reset form
      setName('');
      setDescription('');
      setCommodity('');
      setGeomExtent('');
      setSuccess('Project created successfully!');
      setShowCreateForm(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        setError('Invalid GeoJSON format in geom_extent field.');
      } else {
        setError('Project creation failed. Please try again.');
      }
    }
  };

  const getCommodityColor = (commodity: string) => {
    return commodityOptions.find(opt => opt.value === commodity)?.color || '#cccccc';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'planning': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box p={3}>
        <Typography variant="h4">Projects</Typography>
        <Typography>Loading projects...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Mining Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          Create Project
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

      {/* Create Project Form */}
      {showCreateForm && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Create New Project
          </Typography>
          <form onSubmit={handleCreate}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField 
                  label="Project Name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  fullWidth 
                  required 
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Commodity"
                  value={commodity}
                  onChange={e => setCommodity(e.target.value)}
                  fullWidth
                  required
                >
                  {commodityOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            backgroundColor: opt.color 
                          }} 
                        />
                        {opt.label}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
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
              <Grid item xs={12}>
                <TextField
                  label="Geom Extent (GeoJSON Polygon)"
                  value={geomExtent}
                  onChange={e => setGeomExtent(e.target.value)}
                  fullWidth
                  required
                  multiline
                  minRows={3}
                  placeholder='{"type": "Polygon", "coordinates": [[[-105.2, 39.7], [-105.1, 39.7], [-105.1, 39.8], [-105.2, 39.8], [-105.2, 39.7]]]}'
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <Button type="submit" variant="contained" color="primary">
                    Create Project
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}

      {/* Projects Grid */}
      <Typography variant="h6" gutterBottom>
        Project Portfolio ({projects.length})
      </Typography>
      
      <Grid container spacing={3}>
        {projects.map(project => (
          <Grid item xs={12} md={6} lg={4} key={project.project_id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {project.name}
                  </Typography>
                  <Chip 
                    label={project.status.toUpperCase()} 
                    color={getStatusColor(project.status) as any}
                    size="small"
                  />
                </Box>
                
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <BusinessIcon fontSize="small" color="action" />
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        backgroundColor: getCommodityColor(project.commodity)
                      }} 
                    />
                    <Typography variant="body2">
                      {commodityOptions.find(opt => opt.value === project.commodity)?.label || project.commodity}
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="flex-start" gap={1} mb={2}>
                  <DescriptionIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {project.description}
                  </Typography>
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  Created: {new Date(project.created_date).toLocaleDateString()}
                </Typography>
              </CardContent>
              
              <CardActions>
                <Button 
                  size="small" 
                  component={Link} 
                  to={`/projects/${project.project_id}`}
                  variant="outlined"
                >
                  View Details
                </Button>
                <Tooltip title="View on Map">
                  <IconButton size="small">
                    <LocationIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {projects.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Projects Found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Create your first mining project to get started.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setShowCreateForm(true)}
          >
            Create First Project
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default Projects; 