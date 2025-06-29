import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import './App.css';

// Layout Components
import Sidebar from './components/layout/Sidebar';

// Feature Components
import Dashboard from './components/features/Dashboard';

// Simple placeholder components for other routes
const Projects = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Projects</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">Your geological projects will appear here.</p>
    </div>
  </div>
);

const Analytics = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">Analytics dashboard will appear here.</p>
    </div>
  </div>
);

const Maps = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Geological Maps</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">Interactive geological maps will appear here.</p>
    </div>
  </div>
);

const Models = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">3D Models</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">3D geological models will appear here.</p>
    </div>
  </div>
);

const Geochemical = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Geochemical Analysis</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">Geochemical analysis tools will appear here.</p>
    </div>
  </div>
);

const Settings = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">Application settings will appear here.</p>
    </div>
  </div>
);

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <AppBar position="static" sx={{ backgroundColor: '#1f2937' }}>
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  GeoVision AI Miner
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2">
                    Welcome, GeoMiner User
                  </Typography>
                </Box>
              </Toolbar>
            </AppBar>
            <div className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/maps" element={<Maps />} />
                <Route path="/models" element={<Models />} />
                <Route path="/geochemical" element={<Geochemical />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </div>
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </Router>
    </QueryClientProvider>
  );
}

export default App; 