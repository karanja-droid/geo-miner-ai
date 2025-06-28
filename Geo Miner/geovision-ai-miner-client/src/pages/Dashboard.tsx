import React, { useEffect, useState } from 'react';
import { Typography, Box } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../components/AuthProvider';
import Comments from './Comments';

interface Project {
  project_id: string;
  name: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    axios.get('/projects/').then(res => {
      if (res.data.length > 0) setProject(res.data[0]);
    });
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4">Dashboard</Typography>
      <Typography>Welcome to GeoVision AI Miner!</Typography>
      {project && user ? (
        <Comments projectId={project.project_id} userId={user.userId} />
      ) : (
        <Typography sx={{ mt: 4 }}>No projects found. Please create a project to enable comments.</Typography>
      )}
    </Box>
  );
};

export default Dashboard; 