import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';

const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Projects = React.lazy(() => import('./pages/Projects'));
const DataLibrary = React.lazy(() => import('./pages/DataLibrary'));
const Maps = React.lazy(() => import('./pages/Maps'));
const AIAnalysis = React.lazy(() => import('./pages/AIAnalysis'));
const MiningAI = React.lazy(() => import('./pages/MiningAI'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Unauthorized = React.lazy(() => import('./pages/Unauthorized'));
const Profile = React.lazy(() => import('./pages/Profile'));
const ProjectDetails = React.lazy(() => import('./pages/ProjectDetails'));

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const onboardingSteps = [
    'Welcome',
    'Sidebar Navigation',
    'Dashboard',
    'Data Upload',
    'AI Modules',
    'Profile',
    'Finish',
  ];

  useEffect(() => {
    if (!localStorage.getItem('onboardingComplete')) {
      setOnboardingOpen(true);
    }
  }, []);

  const handleOnboardingNext = () => {
    if (onboardingStep === onboardingSteps.length - 1) {
      setOnboardingOpen(false);
      localStorage.setItem('onboardingComplete', 'true');
      setOnboardingStep(0);
    } else {
      setOnboardingStep(s => s + 1);
    }
  };
  const handleOnboardingBack = () => setOnboardingStep(s => s - 1);
  const handleShowOnboarding = () => {
    setOnboardingStep(0);
    setOnboardingOpen(true);
  };

  const onboardingContent = [
    <>
      <Typography variant="h5" gutterBottom>Welcome to GeoVision AI Miner!</Typography>
      <Typography>This onboarding will guide you through the main features of the platform.</Typography>
    </>,
    <>
      <Typography variant="h6">Sidebar Navigation</Typography>
      <Typography>The sidebar lets you quickly access all modules: Dashboard, Projects, Data Library, Maps, AI Analysis, Mining AI, Reports, Profile, and Admin (if applicable).</Typography>
    </>,
    <>
      <Typography variant="h6">Dashboard</Typography>
      <Typography>Get an overview of your projects and recent activity. Quick access to comments and project status.</Typography>
    </>,
    <>
      <Typography variant="h6">Data Upload</Typography>
      <Typography>Upload geological datasets, assign them to projects, and manage your data library.</Typography>
    </>,
    <>
      <Typography variant="h6">AI Modules</Typography>
      <Typography>Run advanced AI/ML analytics for drilling optimization, blast prediction, ore grade, and equipment health. Use the Mining AI and AI Analysis pages.</Typography>
    </>,
    <>
      <Typography variant="h6">Profile</Typography>
      <Typography>Manage your user profile, roles, and security settings.</Typography>
    </>,
    <>
      <Typography variant="h5">You're all set!</Typography>
      <Typography>Access help anytime via the top-right help icon. Enjoy exploring GeoVision AI Miner!</Typography>
    </>,
  ];

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#1976d2' },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                GeoVision AI Miner
              </Typography>
              <IconButton color="inherit" onClick={() => setHelpOpen(true)} aria-label="Help">
                <HelpOutlineIcon />
              </IconButton>
              <IconButton color="inherit" onClick={() => setDarkMode(m => !m)} aria-label="Toggle theme">
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Toolbar>
          </AppBar>
          <Box sx={{ display: 'flex' }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
              <React.Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route element={<ProtectedRoute allowedRoles={["Geologist","Geophysicist","Drilling Manager","QA/QC Officer","Environmental Officer","Executive/Manager","Administrator"]} />}> 
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/:projectId" element={<ProjectDetails />} />
                    <Route path="/data-library" element={<DataLibrary />} />
                    <Route path="/maps" element={<Maps />} />
                    <Route path="/ai-analysis" element={<AIAnalysis />} />
                    <Route path="/mining-ai" element={<MiningAI />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/profile" element={<Profile />} />
                  </Route>
                  <Route element={<ProtectedRoute allowedRoles={["Administrator"]} />}> 
                    <Route path="/admin" element={<Admin />} />
                  </Route>
                  <Route path="/unauthorized" element={<Unauthorized />} />
                </Routes>
              </React.Suspense>
            </Box>
          </Box>
          <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Help & Documentation</DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                Welcome to GeoVision AI Miner! Use the sidebar to navigate between modules. For each page, tooltips and example data are provided where relevant. For more detailed documentation, visit the project README or contact your administrator.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                - Dashboard: Overview and quick stats<br/>
                - Projects: Manage exploration projects<br/>
                - Data Library: Upload and view datasets<br/>
                - Maps: 2D/3D geological maps<br/>
                - AI Analysis: AI-powered data analysis<br/>
                - Mining AI: Mining-specific AI modules<br/>
                - Reports: Generate and export reports<br/>
                - Profile: Manage your user profile<br/>
                - Admin: Admin panel (admins only)
              </Typography>
              <Button onClick={handleShowOnboarding} sx={{ mt: 2 }}>Show Onboarding</Button>
            </DialogContent>
          </Dialog>
          <Dialog open={onboardingOpen} onClose={() => setOnboardingOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Getting Started</DialogTitle>
            <DialogContent>
              <Stepper activeStep={onboardingStep} alternativeLabel sx={{ mb: 2 }}>
                {onboardingSteps.map(label => (
                  <Step key={label}><StepLabel>{label}</StepLabel></Step>
                ))}
              </Stepper>
              <Box minHeight={120} mb={2}>{onboardingContent[onboardingStep]}</Box>
              <Box display="flex" justifyContent="space-between">
                <Button onClick={handleOnboardingBack} disabled={onboardingStep === 0}>Back</Button>
                <Button onClick={handleOnboardingNext} variant="contained">
                  {onboardingStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </Box>
            </DialogContent>
          </Dialog>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
