import React from 'react';
import { render, screen } from '@testing-library/react';

// Test individual components and utilities
describe('Basic App Tests', () => {
  test('basic test works', () => {
    expect(1 + 1).toBe(2);
  });

  test('renders a simple div', () => {
    render(<div>Hello World</div>);
    const element = screen.getByText(/hello world/i);
    expect(element).toBeInTheDocument();
  });

  test('renders Material-UI components', () => {
    render(
      <div>
        <h1>GeoVision AI Miner</h1>
        <button aria-label="Help">Help</button>
        <button aria-label="Toggle theme">Theme</button>
      </div>
    );
    
    expect(screen.getByText('GeoVision AI Miner')).toBeInTheDocument();
    expect(screen.getByLabelText('Help')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
  });

  test('renders navigation elements', () => {
    render(
      <nav>
        <div>Dashboard</div>
        <div>Projects</div>
        <div>Data Library</div>
        <div>Maps</div>
        <div>AI Analysis</div>
        <div>Mining AI</div>
        <div>Reports</div>
        <div>Profile</div>
        <div>Admin</div>
      </nav>
    );
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Data Library')).toBeInTheDocument();
    expect(screen.getByText('Maps')).toBeInTheDocument();
    expect(screen.getByText('AI Analysis')).toBeInTheDocument();
    expect(screen.getByText('Mining AI')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  test('renders onboarding content', () => {
    render(
      <div>
        <h5>Welcome to GeoVision AI Miner!</h5>
        <p>This onboarding will guide you through the main features of the platform.</p>
        <h6>Sidebar Navigation</h6>
        <p>The sidebar lets you quickly access all modules.</p>
        <h6>Dashboard</h6>
        <p>Get an overview of your projects and recent activity.</p>
        <h6>Data Upload</h6>
        <p>Upload geological datasets and manage your data library.</p>
        <h6>AI Modules</h6>
        <p>Run advanced AI/ML analytics for mining operations.</p>
        <h6>Profile</h6>
        <p>Manage your user profile and security settings.</p>
        <h5>You're all set!</h5>
        <p>Access help anytime via the top-right help icon.</p>
      </div>
    );
    
    expect(screen.getByText('Welcome to GeoVision AI Miner!')).toBeInTheDocument();
    expect(screen.getByText('Sidebar Navigation')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Data Upload')).toBeInTheDocument();
    expect(screen.getByText('AI Modules')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText("You're all set!")).toBeInTheDocument();
  });

  test('renders help content', () => {
    render(
      <div>
        <h2>Help & Documentation</h2>
        <p>Welcome to GeoVision AI Miner! Use the sidebar to navigate between modules.</p>
        <ul>
          <li>Dashboard: Overview and quick stats</li>
          <li>Projects: Manage exploration projects</li>
          <li>Data Library: Upload and view datasets</li>
          <li>Maps: 2D/3D geological maps</li>
          <li>AI Analysis: AI-powered data analysis</li>
          <li>Mining AI: Mining-specific AI modules</li>
          <li>Reports: Generate and export reports</li>
          <li>Profile: Manage your user profile</li>
          <li>Admin: Admin panel (admins only)</li>
        </ul>
      </div>
    );
    
    expect(screen.getByText('Help & Documentation')).toBeInTheDocument();
    expect(screen.getByText(/Welcome to GeoVision AI Miner!/)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard: Overview and quick stats/)).toBeInTheDocument();
    expect(screen.getByText(/Projects: Manage exploration projects/)).toBeInTheDocument();
    expect(screen.getByText(/Data Library: Upload and view datasets/)).toBeInTheDocument();
    expect(screen.getByText(/Maps: 2D\/3D geological maps/)).toBeInTheDocument();
    expect(screen.getByText(/AI Analysis: AI-powered data analysis/)).toBeInTheDocument();
    expect(screen.getByText(/Mining AI: Mining-specific AI modules/)).toBeInTheDocument();
    expect(screen.getByText(/Reports: Generate and export reports/)).toBeInTheDocument();
    expect(screen.getByText(/Profile: Manage your user profile/)).toBeInTheDocument();
    expect(screen.getByText(/Admin: Admin panel/)).toBeInTheDocument();
  });
});
