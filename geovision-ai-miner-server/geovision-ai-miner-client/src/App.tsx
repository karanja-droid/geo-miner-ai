import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Simple components
const Dashboard = () => (
  <div className="min-h-screen bg-gray-900 text-white p-8">
    <h1 className="text-4xl font-bold mb-8">GeoVision AI Miner Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Projects</h2>
        <p className="text-gray-300">Manage your geological projects</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Analytics</h2>
        <p className="text-gray-300">View data insights and reports</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">AI Models</h2>
        <p className="text-gray-300">Train and deploy AI models</p>
      </div>
    </div>
  </div>
);

const Projects = () => (
  <div className="min-h-screen bg-gray-900 text-white p-8">
    <h1 className="text-4xl font-bold mb-8">Projects</h1>
    <p className="text-gray-300">Your geological projects will appear here.</p>
  </div>
);

const Analytics = () => (
  <div className="min-h-screen bg-gray-900 text-white p-8">
    <h1 className="text-4xl font-bold mb-8">Analytics</h1>
    <p className="text-gray-300">Analytics dashboard will appear here.</p>
  </div>
);

const Pricing = () => (
  <div className="min-h-screen bg-gray-900 text-white p-8">
    <h1 className="text-4xl font-bold mb-8">Pricing Plans</h1>
    <p className="text-gray-300">Pricing information will appear here.</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App; 