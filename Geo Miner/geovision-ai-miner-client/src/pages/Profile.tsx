import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { useAuth } from '../components/AuthProvider';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return <Typography>Loading...</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h4">User Profile</Typography>
      <Typography>Email: {user.email}</Typography>
      <Typography>Roles: {user.roles.map(role => <Chip key={role} label={role} sx={{ mr: 1 }} />)}</Typography>
      <Typography>MFA Enabled: {user.mfa_enabled ? 'Yes' : 'No'}</Typography>
      <Button variant="contained" color="secondary" sx={{ mt: 2 }} onClick={logout}>
        Logout
      </Button>
    </Box>
  );
};

export default Profile; 