import React, { useEffect, useState } from 'react';
import { Typography, Box, Alert } from '@mui/material';
import { useAuth } from '../components/AuthProvider';
import Comments from './Comments';

interface Project {
  project_id: string;
  name: string;
}

// Demo project data
const DEMO_PROJECTS: Project[] = [
  {
    project_id: 'demo-project-1',
    name: 'Copper Mountain Exploration'
  },
  {
    project_id: 'demo-project-2', 
    name: 'Gold Valley Mine'
  }
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with demo data
    const loadProjects = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use demo data instead of API call
        if (DEMO_PROJECTS.length > 0) {
          setProject(DEMO_PROJECTS[0]);
        }
      } catch (err) {
        setError('Failed to load projects');
        console.error('Error loading projects:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  if (loading) {
    return (
      <Box p={3}>
        <Typography variant="h4">Dashboard</Typography>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Welcome to GeoVision AI Miner!
      </Typography>
      
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error} - Using demo data
        </Alert>
      )}

      {project && user ? (
        <Comments projectId={project.project_id} userId={user.userId} />
      ) : (
        <Box sx={{ mt: 4 }}>
          <Typography variant="body1" gutterBottom>
            Demo Project: {DEMO_PROJECTS[0]?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This is a demonstration project. In production, you would see your actual projects here.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard; 