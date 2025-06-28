import React from 'react';
import { Typography, Box } from '@mui/material';

const Unauthorized: React.FC = () => (
  <Box p={3}>
    <Typography variant="h4" color="error">Unauthorized</Typography>
    <Typography>You do not have permission to view this page.</Typography>
  </Box>
);

export default Unauthorized; 