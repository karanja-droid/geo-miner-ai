import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Map as MapIcon,
  ViewInAr as View3DIcon,
  Layers as LayersIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import Map2D from '../components/Map2D';
import ThreeDViewer from '../components/ThreeDViewer';
import { useAuth } from '../components/AuthProvider';
import axios from '../components/axiosConfig';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`map-tabpanel-${index}`}
      aria-labelledby={`map-tab-${index}`}
      style={{ height: 'calc(100vh - 200px)' }}
      {...other}
    >
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
    </div>
  );
}

interface GeologicalFeature {
  id: string;
  type: 'ore' | 'waste' | 'overburden';
  geometry: {
    type: string;
    coordinates: number[];
  };
  grade?: number;
  depth: number;
  description?: string;
}

interface DrillHole {
  id: string;
  longitude: number;
  latitude: number;
  depth: number;
  status: 'planned' | 'in-progress' | 'completed';
  average_grade?: number;
  description?: string;
}

const Maps: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [geologicalData, setGeologicalData] = useState<GeologicalFeature[]>([]);
  const [drillHoles, setDrillHoles] = useState<DrillHole[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sample data for demonstration
  const sampleGeologicalData: GeologicalFeature[] = [
    {
      id: 'geo-1',
      type: 'ore',
      geometry: { type: 'Point', coordinates: [-74.006, 40.7128] },
      grade: 2.5,
      depth: 15,
      description: 'High-grade ore deposit'
    },
    {
      id: 'geo-2',
      type: 'waste',
      geometry: { type: 'Point', coordinates: [-74.005, 40.7130] },
      depth: 8,
      description: 'Waste rock layer'
    },
    {
      id: 'geo-3',
      type: 'overburden',
      geometry: { type: 'Point', coordinates: [-74.007, 40.7125] },
      depth: 5,
      description: 'Overburden material'
    }
  ];

  const sampleDrillHoles: DrillHole[] = [
    {
      id: 'dh-1',
      longitude: -74.006,
      latitude: 40.7128,
      depth: 25,
      status: 'completed',
      average_grade: 2.3,
      description: 'Primary exploration hole'
    },
    {
      id: 'dh-2',
      longitude: -74.005,
      latitude: 40.7130,
      depth: 30,
      status: 'in-progress',
      description: 'Secondary exploration hole'
    },
    {
      id: 'dh-3',
      longitude: -74.007,
      latitude: 40.7125,
      depth: 20,
      status: 'planned',
      description: 'Future exploration target'
    }
  ];

  useEffect(() => {
    const loadMapData = async () => {
      try {
        setLoading(true);
        // In a real application, you would fetch data from your API
        // const response = await axios.get('/api/maps/geological-data');
        // setGeologicalData(response.data);
        
        // For now, use sample data
        setGeologicalData(sampleGeologicalData);
        setDrillHoles(sampleDrillHoles);
        setLoading(false);
      } catch (err) {
        setError('Failed to load map data');
        setLoading(false);
      }
    };

    loadMapData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFeatureClick = (feature: any) => {
    setSelectedFeature(feature);
    setFeatureDialogOpen(true);
  };

  const handleCloseFeatureDialog = () => {
    setFeatureDialogOpen(false);
    setSelectedFeature(null);
  };

  const getFeatureColor = (type: string) => {
    switch (type) {
      case 'ore': return 'error';
      case 'waste': return 'warning';
      case 'overburden': return 'success';
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'planned': return 'info';
      default: return 'default';
    }
  };

  const getFeatureIcon = (type: string) => {
    switch (type) {
      case 'ore': return '💎';
      case 'waste': return '';
      case 'overburden': return '🌱';
      case 'completed': return '✅';
      case 'in-progress': return '⏳';
      case 'planned': return '📋';
      default: return '';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Geological Maps & Visualization
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Interactive 2D and 3D mapping tools for geological exploration and analysis.
      </Typography>

      {/* Map Controls */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Map Layers
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip 
                label={`Geological (${geologicalData.length})`} 
                color="primary" 
                variant="outlined"
                icon={<LayersIcon />}
              />
              <Chip 
                label={`Drill Holes (${drillHoles.length})`} 
                color="secondary" 
                variant="outlined"
                icon={<LayersIcon />}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                size="small"
              >
                Add Layer
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                size="small"
              >
                Export
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                size="small"
              >
                Share
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Map Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="map visualization tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="2D Map" 
            icon={<MapIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="3D Viewer" 
            icon={<View3DIcon />} 
            iconPosition="start"
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Map2D
            geologicalData={geologicalData}
            drillHoles={drillHoles}
            onFeatureClick={handleFeatureClick}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ThreeDViewer
            geologicalData={geologicalData}
            drillHoles={drillHoles}
            onFeatureClick={handleFeatureClick}
          />
        </TabPanel>
      </Paper>

      {/* Feature Details Dialog */}
      <Dialog 
        open={featureDialogOpen} 
        onClose={handleCloseFeatureDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <span>{getFeatureIcon(selectedFeature?.properties?.type || selectedFeature?.userData?.feature?.type)}</span>
            <Typography variant="h6">
              {selectedFeature?.properties?.type || selectedFeature?.userData?.feature?.type || 'Feature'} Details
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedFeature && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  ID: {selectedFeature.properties?.id || selectedFeature.userData?.feature?.id}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Type:</strong> {selectedFeature.properties?.type || selectedFeature.userData?.feature?.type}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Depth:</strong> {selectedFeature.properties?.depth || selectedFeature.userData?.feature?.depth}m
                </Typography>
              </Grid>
              {(selectedFeature.properties?.grade || selectedFeature.userData?.feature?.average_grade) && (
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Grade:</strong> {(selectedFeature.properties?.grade || selectedFeature.userData?.feature?.average_grade)?.toFixed(2)}%
                  </Typography>
                </Grid>
              )}
              {(selectedFeature.properties?.status || selectedFeature.userData?.feature?.status) && (
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Status:</strong> {selectedFeature.properties?.status || selectedFeature.userData?.feature?.status}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="body2">
                  <strong>Description:</strong> {selectedFeature.properties?.description || selectedFeature.userData?.feature?.description || 'No description available'}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFeatureDialog}>Close</Button>
          <Button variant="contained" startIcon={<EditIcon />}>
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Maps; 