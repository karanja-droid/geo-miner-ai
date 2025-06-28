import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import StorageIcon from '@mui/icons-material/Storage';
import MapIcon from '@mui/icons-material/Map';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ScienceIcon from '@mui/icons-material/Science';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, route: '/dashboard', tooltip: 'Overview and quick stats' },
  { text: 'Projects', icon: <FolderIcon />, route: '/projects', tooltip: 'Manage exploration projects' },
  { text: 'Data Library', icon: <StorageIcon />, route: '/data-library', tooltip: 'Upload and view datasets' },
  { text: 'Maps', icon: <MapIcon />, route: '/maps', tooltip: '2D/3D geological maps' },
  { text: 'AI Analysis', icon: <AssessmentIcon />, route: '/ai-analysis', tooltip: 'AI-powered data analysis' },
  { text: 'Mining AI', icon: <ScienceIcon />, route: '/mining-ai', tooltip: 'Mining-specific AI modules' },
  { text: 'Reports', icon: <AssessmentIcon />, route: '/reports', tooltip: 'Generate and export reports' },
];

const drawerWidth = 240;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawerContent = (
    <List>
      {menuItems.map(item => (
        <ListItem button onClick={() => { navigate(item.route); setMobileOpen(false); }} aria-label={item.text} key={item.text}>
          <Tooltip title={item.tooltip} placement="right" arrow>
            <ListItemIcon>{item.icon}</ListItemIcon>
          </Tooltip>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
      {user?.roles.includes('Administrator') && (
        <ListItem button onClick={() => { navigate('/admin'); setMobileOpen(false); }} aria-label="Admin">
          <Tooltip title="Admin panel" placement="right" arrow>
            <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
          </Tooltip>
          <ListItemText primary="Admin" />
        </ListItem>
      )}
      <ListItem button onClick={() => { navigate('/profile'); setMobileOpen(false); }} aria-label="Profile">
        <Tooltip title="User profile" placement="right" arrow>
          <ListItemIcon><AccountCircleIcon /></ListItemIcon>
        </Tooltip>
        <ListItemText primary="Profile" />
      </ListItem>
    </List>
  );

  return (
    <>
      {isMobile && (
        <>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ m: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth } }}
          >
            {drawerContent}
          </Drawer>
        </>
      )}
      {!isMobile && (
        <Drawer
          variant="permanent"
          open
          sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth } }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar; 