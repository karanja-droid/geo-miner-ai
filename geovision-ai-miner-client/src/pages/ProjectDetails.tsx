import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Comments from './Comments';
import { useAuth } from '../components/AuthProvider';

interface Project {
  project_id: string;
  name: string;
  description: string;
  commodity: string;
  geom_extent: any;
}

interface Dataset {
  dataset_id: string;
  name: string;
  data_type: string;
  file_url: string;
  upload_date: string;
  project_id: string;
}

interface AIRun {
  run_id: string;
  model_id: string;
  status: string;
  submission_time: string;
  completion_time: string;
  result_url: string;
  project_id: string;
}

const ProjectDetails: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [aiRuns, setAIRuns] = useState<AIRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError('');
    Promise.all([
      axios.get(`/projects/${projectId}`),
      axios.get('/data/list'),
      axios.get('/ai/status')
    ]).then(([projRes, dataRes, aiRes]) => {
      setProject(projRes.data);
      setDatasets(dataRes.data.filter((d: Dataset) => d.project_id === projectId));
      setAIRuns(aiRes.data.filter((r: AIRun) => r.project_id === projectId));
      setLoading(false);
    }).catch(() => {
      setError('Failed to load project details.');
      setLoading(false);
    });
  }, [projectId]);

  if (loading) return <Box p={3}><CircularProgress /></Box>;
  if (error) return <Box p={3}><Alert severity="error">{error}</Alert></Box>;
  if (!project) return <Typography>Project not found.</Typography>;

  return (
    <Box p={3}>
      <Button variant="outlined" onClick={() => navigate('/projects')} sx={{ mb: 2 }}>Back to Projects</Button>
      <Typography variant="h4">{project.name}</Typography>
      <Typography>Description: {project.description}</Typography>
      <Typography>Commodity: {project.commodity}</Typography>
      <Typography>Geom Extent: <pre>{JSON.stringify(project.geom_extent, null, 2)}</pre></Typography>
      <Typography variant="h6" sx={{ mt: 3 }}>Datasets</Typography>
      <ul>
        {datasets.map(ds => (
          <li key={ds.dataset_id}>{ds.name} ({ds.data_type}) - Uploaded: {new Date(ds.upload_date).toLocaleString()}</li>
        ))}
      </ul>
      <Typography variant="h6" sx={{ mt: 3 }}>AI Runs</Typography>
      <ul>
        {aiRuns.map(run => (
          <li key={run.run_id}>Model: {run.model_id}, Status: {run.status}, Submitted: {new Date(run.submission_time).toLocaleString()}</li>
        ))}
      </ul>
      {user && <Comments projectId={project.project_id} userId={user.userId} />}
    </Box>
  );
};

export default ProjectDetails; 